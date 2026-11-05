import assert from 'assert';
import { generateSlotBonusSpins, SLOT_WEIGHTS_NATURAL, SLOT_WEIGHTS_BONUS_BUY } from './src/crypto/provablyFair';

console.log('=== TEST: PROVABLY FAIR 1x3 ARCADE MINI-SLOT ENGINE ===\n');

// 1. REGLA CERO (SIN MEMORIA) & DETERMINISMO
console.log('1. Testing Determinism and Zero Memory...');
const serverSeed = 'b1b67e5a0dbd582f6e996245d8b74681665a953d5a23075c2e176be5a86d9e03';
const clientSeed = 'stake_provably_fair_client_test';
const nonce = 42;

const bundle1 = generateSlotBonusSpins(serverSeed, clientSeed, nonce, 'NATURAL', 3.5);
const bundle2 = generateSlotBonusSpins(serverSeed, clientSeed, nonce, 'NATURAL', 3.5);

assert.strictEqual(bundle1.totalSpins, bundle2.totalSpins, 'Spin count must be identical');
assert.strictEqual(bundle1.totalAccumulatedMultiplier, bundle2.totalAccumulatedMultiplier, 'Accumulator must be identical');
assert.strictEqual(bundle1.finalMultiplier, bundle2.finalMultiplier, 'Final multiplier must be identical');

for (let i = 0; i < bundle1.spins.length; i++) {
    const s1 = bundle1.spins[i];
    const s2 = bundle2.spins[i];
    assert.strictEqual(s1.symbol, s2.symbol, `Spin ${i} symbol must match`);
    assert.strictEqual(s1.multiplier, s2.multiplier, `Spin ${i} multiplier must match`);
    assert.strictEqual(s1.isWin, s2.isWin, `Spin ${i} isWin must match`);
    assert.strictEqual(s1.isNearMiss, s2.isNearMiss, `Spin ${i} isNearMiss must match`);
    assert.deepStrictEqual(s1.reels, s2.reels, `Spin ${i} reels must match`);
}
console.log('✅ PASSED: 100% deterministic reproducibility between identical seeds & nonce.\n');

// 2. ACCUMULATOR MATH & PRE-MULTIPLIER
console.log('2. Testing Accumulation Logic...');
const preMult = 2.45;
const bundleMath = generateSlotBonusSpins(serverSeed, clientSeed, 99, 'NATURAL', preMult);
const expectedSum = bundleMath.spins.reduce((acc, s) => acc + s.multiplier, 0);
assert.strictEqual(bundleMath.totalAccumulatedMultiplier, expectedSum, 'Accumulator must equal sum of multipliers');
assert.strictEqual(
    bundleMath.finalMultiplier,
    Math.round(preMult * expectedSum * 10000) / 10000,
    'Final multiplier must multiply preMultiplier by accumulator'
);
console.log(`✅ PASSED: Pre-multiplier ${preMult}x * Accumulator ${expectedSum}x = ${bundleMath.finalMultiplier}x\n`);

// 3. WIN VS NEAR-MISS REEL MAPPING
console.log('3. Testing Reel Grid Alignment (1x3 Single-Line) & Near-Miss Mechanics...');
let nearMissCount = 0;
let winCount = 0;
let totalCheckedSpins = 0;

for (let n = 1; n <= 1000; n++) {
    const b = generateSlotBonusSpins(serverSeed, clientSeed, n, 'NATURAL', 1.0);
    for (const spin of b.spins) {
        totalCheckedSpins++;
        if (spin.isWin) {
            winCount++;
            // Winning spin must have 3 identical symbols aligned on CENTER
            assert.strictEqual(spin.reels[0].offset, 'CENTER');
            assert.strictEqual(spin.reels[1].offset, 'CENTER');
            assert.strictEqual(spin.reels[2].offset, 'CENTER');
            assert.strictEqual(spin.reels[0].symbol, spin.symbol);
            assert.strictEqual(spin.reels[1].symbol, spin.symbol);
            assert.strictEqual(spin.reels[2].symbol, spin.symbol);
            assert.strictEqual(spin.isNearMiss, false, 'Winning spin cannot be flagged as near miss');
        } else {
            // Losing spin pays 0
            assert.strictEqual(spin.multiplier, 0, 'Losing spin must pay x0');
            assert.strictEqual(spin.symbol, 'BLANK');
            if (spin.isNearMiss) {
                nearMissCount++;
                // Near miss must have Reel 1 and Reel 2 on CENTER with tease symbol, Reel 3 on UP or DOWN
                assert(spin.nearMissSymbol, 'Near miss must define tease symbol');
                assert.strictEqual(spin.reels[0].symbol, spin.nearMissSymbol);
                assert.strictEqual(spin.reels[1].symbol, spin.nearMissSymbol);
                assert.strictEqual(spin.reels[0].offset, 'CENTER');
                assert.strictEqual(spin.reels[1].offset, 'CENTER');
                assert.strictEqual(spin.reels[2].symbol, spin.nearMissSymbol);
                assert(spin.reels[2].offset === 'UP' || spin.reels[2].offset === 'DOWN', 'Reel 3 must be misaligned UP or DOWN');
            }
        }
    }
}
console.log(`✅ PASSED: Evaluated ${totalCheckedSpins} spins. Wins: ${winCount}, Near-Misses: ${nearMissCount}.\n`);

// 4. STATISTICAL SIMULATION: PERFIL A (NATURAL ENTRY)
console.log('4. Testing Weight Distribution: Perfil A (Entrada Natural)...');
const SIM_ROUNDS = 10000;
const countsA: Record<string, number> = { BLANK: 0, X4: 0, X8: 0, X10: 0, X28: 0, X88: 0 };
let totalSpinsA = 0;

for (let n = 1; n <= SIM_ROUNDS; n++) {
    const b = generateSlotBonusSpins(serverSeed, clientSeed, n, 'NATURAL');
    for (const spin of b.spins) {
        countsA[spin.symbol]++;
        totalSpinsA++;
    }
}

const pctA = (sym: string) => ((countsA[sym] / totalSpinsA) * 100).toFixed(2);
console.log(`Perfil A (${totalSpinsA} spins):`);
console.log(`  BLANK (x0):  ${pctA('BLANK')}% (Expected ~18.0%)`);
console.log(`  X4    (x4):  ${pctA('X4')}% (Expected ~42.0%)`);
console.log(`  X8    (x8):  ${pctA('X8')}% (Expected ~23.0%)`);
console.log(`  X10   (x10): ${pctA('X10')}% (Expected ~13.0%)`);
console.log(`  X28   (x28): ${pctA('X28')}% (Expected ~3.6%)`);
console.log(`  X88   (x88): ${pctA('X88')}% (Expected ~0.4%)`);

assert(Math.abs(countsA['BLANK'] / totalSpinsA - 0.18) < 0.02, 'BLANK rate must be within 2% of 18%');
assert(Math.abs(countsA['X4'] / totalSpinsA - 0.42) < 0.02, 'X4 rate must be within 2% of 42%');
assert(Math.abs(countsA['X8'] / totalSpinsA - 0.23) < 0.02, 'X8 rate must be within 2% of 23%');
assert(Math.abs(countsA['X10'] / totalSpinsA - 0.13) < 0.02, 'X10 rate must be within 2% of 13%');
console.log('✅ PASSED: Perfil A matches mathematical weight table.\n');

// 5. STATISTICAL SIMULATION: PERFIL B (BONUS BUY)
console.log('5. Testing Weight Distribution: Perfil B (Compra Directa)...');
const countsB: Record<string, number> = { BLANK: 0, X4: 0, X8: 0, X10: 0, X28: 0, X88: 0 };
let totalSpinsB = 0;

for (let n = 1; n <= SIM_ROUNDS; n++) {
    const b = generateSlotBonusSpins(serverSeed, clientSeed, n, 'BONUS_BUY');
    for (const spin of b.spins) {
        countsB[spin.symbol]++;
        totalSpinsB++;
    }
}

const pctB = (sym: string) => ((countsB[sym] / totalSpinsB) * 100).toFixed(2);
console.log(`Perfil B (${totalSpinsB} spins):`);
console.log(`  BLANK (x0):  ${pctB('BLANK')}% (Expected ~90.0%)`);
console.log(`  X4    (x4):  ${pctB('X4')}% (Expected ~8.7%)`);
console.log(`  X8    (x8):  ${pctB('X8')}% (Expected ~1.0%)`);
console.log(`  X10   (x10): ${pctB('X10')}% (Expected ~0.25%)`);

assert(Math.abs(countsB['BLANK'] / totalSpinsB - 0.90) < 0.02, 'BLANK rate must be within 2% of 90% (extreme volatility)');
console.log('✅ PASSED: Perfil B matches mathematical weight table (90% Blanks, extreme volatility).\n');

console.log('🎉 ALL 1x3 ARCADE MINI-SLOT PROVABLY FAIR TESTS PASSED PERFECTLY!');
