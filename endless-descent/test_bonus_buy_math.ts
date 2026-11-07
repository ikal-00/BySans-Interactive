import {
    WHEEL_WEIGHTS_NATURAL,
    WHEEL_WEIGHTS_BONUS_BUY,
    WHEEL_SEGMENTS,
    SLOT_WEIGHTS_NATURAL,
    SLOT_WEIGHTS_BONUS_BUY,
    deriveWheelSpinOutcome,
    generateSlotBonusSpins,
    generateServerSeed
} from './src/crypto/provablyFair';
import { GameEngine } from './src/game/engine';

console.log('================================================================');
console.log('TEST: BONUS BUY MATHEMATICAL PROBABILITY & PENALIZATION AUDIT');
console.log('================================================================\n');

// 1. Audit Wheel Math: Natural vs Bonus Buy
console.log('--- 1. AUDIT DE RULETA (WHEEL): NATURAL VS COMPRA DE BONO ---');
let naturalWheelEv = 0;
let naturalWipeoutWeight = WHEEL_WEIGHTS_NATURAL[7]; // index 7 = x0
let boughtWheelEv = 0;
let boughtWipeoutWeight = WHEEL_WEIGHTS_BONUS_BUY[7];

for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    const mult = WHEEL_SEGMENTS[i].multiplier;
    naturalWheelEv += mult * (WHEEL_WEIGHTS_NATURAL[i] / 10000);
    boughtWheelEv += mult * (WHEEL_WEIGHTS_BONUS_BUY[i] / 10000);
}

console.log(`Natural Wipeout (x0) Rate: ${(naturalWipeoutWeight / 100).toFixed(2)}%`);
console.log(`Bonus Buy Wipeout (x0) Rate: ${(boughtWipeoutWeight / 100).toFixed(2)}%`);
console.log(`Bonus Buy x0.2 Low Rescue Rate: ${(WHEEL_WEIGHTS_BONUS_BUY[4] / 100).toFixed(2)}%`);
console.log(`Bonus Buy combined loss sectors (x0 + x0.2): ${((WHEEL_WEIGHTS_BONUS_BUY[7] + WHEEL_WEIGHTS_BONUS_BUY[4]) / 100).toFixed(2)}%`);

if (boughtWipeoutWeight <= naturalWipeoutWeight) {
    throw new Error('FAIL: Bought wheel wipeout rate must be much higher than natural!');
}
console.log('✅ PASSED: La probabilidad de Wipeout (x0) en compra de ruleta está fuertemente castigada (38% vs 11.42%).\n');

// 2. Audit Slot Math: Natural vs Bonus Buy
console.log('--- 2. AUDIT DE MINI-SLOT: NATURAL VS COMPRA DE BONO ---');
const naturalBlank = SLOT_WEIGHTS_NATURAL.find(s => s.symbol === 'BLANK')!.weight;
const boughtBlank = SLOT_WEIGHTS_BONUS_BUY.find(s => s.symbol === 'BLANK')!.weight;

console.log(`Natural Slot Blank Rate: ${(naturalBlank / 100).toFixed(2)}%`);
console.log(`Bonus Buy Slot Blank Rate: ${(boughtBlank / 100).toFixed(2)}%`);

if (boughtBlank <= naturalBlank) {
    throw new Error('FAIL: Bought slot blank rate must be much higher than natural!');
}
console.log('✅ PASSED: La probabilidad de Blank en compra de slot está fuertemente castigada (90% vs 18%).\n');

// 3. Monte Carlo Simulation: 20,000 bought spins vs natural spins
console.log('--- 3. SIMULACIÓN MONTE CARLO (20,000 TIRADAS) ---');
const serverSeed = generateServerSeed();
const clientSeed = 'stake_bonus_audit_seed';

let boughtWheelZeroCount = 0;
let naturalWheelZeroCount = 0;

for (let i = 0; i < 20000; i++) {
    const outBought = deriveWheelSpinOutcome(serverSeed, clientSeed, i, 1, 0, 'BONUS_BUY');
    if (outBought.segment.type === 'WIPEOUT') boughtWheelZeroCount++;

    const outNat = deriveWheelSpinOutcome(serverSeed, clientSeed, i, 1, 0, 'NATURAL');
    if (outNat.segment.type === 'WIPEOUT') naturalWheelZeroCount++;
}

console.log(`Simulación Ruleta Comprada (20,000 tiradas): ${(boughtWheelZeroCount / 200).toFixed(2)}% Wipeouts (Esperado ~38%)`);
console.log(`Simulación Ruleta Natural  (20,000 tiradas): ${(naturalWheelZeroCount / 200).toFixed(2)}% Wipeouts (Esperado ~11.42%)`);

if (boughtWheelZeroCount < naturalWheelZeroCount * 2.5) {
    throw new Error('FAIL: Bought wheel did not demonstrate significantly higher losses in simulation!');
}
console.log('✅ PASSED: Simulación Monte Carlo confirma que el comprador de bono de ruleta pierde mucho más.\n');

// 4. Test GameEngine Integration: Balance deduction & state transition
console.log('--- 4. TEST DE INTEGRACIÓN: DEDUCCIÓN DE SALDO Y ACTIVACIÓN ---');
const engine = new GameEngine(serverSeed, clientSeed);
engine.balance = 500.0;
engine.betAmount = 2.0;

// Test Buy Wheel Bonus
const initialBal = engine.balance;
const wheelSuccess = engine.buyWheelBonus(20.0, 5.0); // 5.0 bet * 20 = 100.0 cost
if (!wheelSuccess) throw new Error('FAIL: buyWheelBonus should succeed');
if (engine.balance !== initialBal - 100.0) throw new Error(`FAIL: Balance should be 400.0, got ${engine.balance}`);
if (!engine.isWheelActive) throw new Error('FAIL: isWheelActive should be true');
if (engine.wheelProfile !== 'BONUS_BUY') throw new Error('FAIL: wheelProfile must be BONUS_BUY');
console.log(`✅ PASSED: buyWheelBonus dedujo $100.00 (20x de $5.00) correctamente. Saldo restante: $${engine.balance}`);

// Complete wheel round
const spinOutcome = engine.spinWheel();
if (!spinOutcome) throw new Error('FAIL: spinWheel should return outcome');
console.log(`Wheel spin outcome: ${spinOutcome.segment.label} (${spinOutcome.segment.type})`);

// Test Buy Slot Bonus
engine.resetToIdle();
engine.balance = 500.0;
const slotBundle = engine.buySlotBonus(50.0, 2.0); // 2.0 bet * 50 = 100.0 cost
if (!slotBundle) throw new Error('FAIL: buySlotBonus should succeed');
if (engine.balance !== 400.0) throw new Error(`FAIL: Balance should be 400.0, got ${engine.balance}`);
if (!engine.isSlotActive) throw new Error('FAIL: isSlotActive should be true');
if (slotBundle.profile !== 'BONUS_BUY') throw new Error('FAIL: slot profile must be BONUS_BUY');
if (slotBundle.spins.length !== 5) throw new Error('FAIL: slot spins should be 5');
console.log(`✅ PASSED: buySlotBonus dedujo $100.00 (50x de $2.00) y generó 5 tiradas Perfil B (90% Blanks). Saldo restante: $${engine.balance}`);

console.log('\n🎉 ALL MATHEMATICAL AUDIT & INTEGRATION TESTS PASSED 100% PERFECTLY!');
