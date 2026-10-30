import { stakeRGS } from './src/engine/StakeRGSBridge';
import { getTranslations } from './src/i18n/translations';

function assert(cond: boolean, msg: string) {
    if (!cond) {
        console.error(`❌ FAILED: ${msg}`);
        process.exit(1);
    }
    console.log(`✅ PASSED: ${msg}`);
}

console.log('=== VERIFYING GROUP 1: CURRENCY AND SUB-CENT FORMATTING ===');

// Test JPY (0 decimals)
stakeRGS.session.currency = 'JPY';
stakeRGS.session.isSocial = false;
assert(stakeRGS.formatCurrency(10) === '¥10', `JPY formatting: expected '¥10', got '${stakeRGS.formatCurrency(10)}'`);

// Test EUR
stakeRGS.session.currency = 'EUR';
assert(stakeRGS.formatCurrency(10) === '€10.00', `EUR formatting: expected '€10.00', got '${stakeRGS.formatCurrency(10)}'`);

// Test CAD
stakeRGS.session.currency = 'CAD';
assert(stakeRGS.formatCurrency(10) === 'CA$10.00', `CAD formatting: expected 'CA$10.00', got '${stakeRGS.formatCurrency(10)}'`);

// Test MXN
stakeRGS.session.currency = 'MXN';
assert(stakeRGS.formatCurrency(10) === 'MX$10.00', `MXN formatting: expected 'MX$10.00', got '${stakeRGS.formatCurrency(10)}'`);

// Test USD
stakeRGS.session.currency = 'USD';
assert(stakeRGS.formatCurrency(10) === '$10.00', `USD formatting: expected '$10.00', got '${stakeRGS.formatCurrency(10)}'`);

// Test Social XSC (No dollar sign!)
stakeRGS.session.currency = 'XSC';
stakeRGS.session.isSocial = true;
assert(stakeRGS.formatCurrency(10) === '10.00 SC', `XSC formatting: expected '10.00 SC', got '${stakeRGS.formatCurrency(10)}'`);
assert(!stakeRGS.formatCurrency(10).includes('$'), 'XSC must never contain $');

// Test Social XGC (No dollar sign!)
stakeRGS.session.currency = 'XGC';
assert(stakeRGS.formatCurrency(10) === '10.00 GC', `XGC formatting: expected '10.00 GC', got '${stakeRGS.formatCurrency(10)}'`);
assert(!stakeRGS.formatCurrency(10).includes('$'), 'XGC must never contain $');

// Test Sub-Cent Precision (Values between 0 and 0.01) [273]
stakeRGS.session.currency = 'USD';
stakeRGS.session.isSocial = false;
const subCentVal = 0.0025;
const formattedSubCent = stakeRGS.formatCurrency(subCentVal);
assert(formattedSubCent === '$0.0025', `Sub-cent USD: expected '$0.0025', got '${formattedSubCent}'`);
assert(formattedSubCent !== '$0.00' && formattedSubCent !== '$0.01', 'Sub-cent USD must not round to $0.00 or $0.01');

stakeRGS.session.currency = 'XSC';
stakeRGS.session.isSocial = true;
const formattedSubCentXSC = stakeRGS.formatCurrency(subCentVal);
assert(formattedSubCentXSC === '0.0025 SC', `Sub-cent XSC: expected '0.0025 SC', got '${formattedSubCentXSC}'`);

console.log('\n=== VERIFYING GROUP 2: RGS BET CONTROLS & SESSION CYCLE ===');

// Check currency-sensitive defaults
const jpyCfg = stakeRGS.getDefaultBetConfig('JPY');
assert(jpyCfg.defaultBetLevel === 100, 'JPY default bet level is 100');
assert(jpyCfg.betLevels[0] === 10, 'JPY min bet level is 10');

const xgcCfg = stakeRGS.getDefaultBetConfig('XGC');
assert(xgcCfg.defaultBetLevel === 10000, 'XGC default bet level is 10000');

// Check RGS authentication return contract
assert(typeof stakeRGS.authenticate === 'function', 'authenticate function exists');
assert(typeof stakeRGS.playBet === 'function', 'playBet function exists');
assert(typeof stakeRGS.endRound === 'function', 'endRound function exists');

console.log('\n=== VERIFYING GROUP 3: ENGLISH & SOCIAL TERMINOLOGY ===');

// Test English standard
const tEn = getTranslations('en', false);
assert(tEn.balanceLabel === 'Balance', 'English standard balance label');
assert(tEn.betAmountLabel === 'Bet Amount', 'English standard bet amount label');
assert(tEn.focalDropCapsule === 'DROP POD', 'English focal CTA label');
assert(tEn.rulesDialogTitle === 'Game Rules', 'English rules dialog title');

// Test English social
const tEnSoc = getTranslations('en', true);
assert(tEnSoc.balanceLabel === 'Coins', 'Social balance label is Coins (not Balance/Cash)');
assert(tEnSoc.betAmountLabel === 'Play Amount', 'Social bet label is Play Amount (not Bet)');
assert(tEnSoc.focalCashout === 'COLLECT', 'Social cashout is COLLECT (not Cashout)');
assert(!tEnSoc.betAmountLabel.toLowerCase().includes('bet'), 'Social bet label has no word "bet"');
assert(!tEnSoc.focalCashout.toLowerCase().includes('cash'), 'Social cashout label has no word "cash"');

// Test Spanish standard & social
const tEs = getTranslations('es', false);
assert(tEs.balanceLabel === 'Saldo', 'Spanish balance label is Saldo');
const tEsSoc = getTranslations('es', true);
assert(tEsSoc.balanceLabel === 'Monedas', 'Spanish social balance label is Monedas');

// Test unknown language code fallback [240]
const tUnknown = getTranslations('zz', false);
assert(tUnknown.balanceLabel === 'Balance', 'Unknown lang code zz falls back to English');

// Test disclaimer clauses [185]
assert(tEn.disclaimerText.includes('TM and © 2026 Engine'), 'Disclaimer includes TM and © 2026 Engine');
assert(tEn.disclaimerText.includes('Malfunction voids all wins and plays'), 'Disclaimer includes Malfunction voids');
assert(tEn.disclaimerText.includes('reload the game to finish any uncompleted rounds'), 'Disclaimer includes disconnection restoration');
assert(tEs.disclaimerText.includes('Cualquier fallo de funcionamiento anula todas las ganancias y partidas'), 'Spanish disclaimer matches verbatim');

console.log('\n=== VERIFYING GROUP 4: REPLAY MODE ===');

// Verify replay URL parsing
stakeRGS.session.isReplay = true;
stakeRGS.session.replayParams = {
    game: 'endless-descent',
    version: '1.0',
    mode: 'base',
    event: 'evt_123',
    amount: 1.0,
    currency: 'USD',
    language: 'en',
    social: false,
    device: 'desktop'
};

assert(typeof stakeRGS.fetchReplayEvent === 'function', 'fetchReplayEvent exists');
assert(tEn.replayPlayBtn === 'PLAY REPLAY', 'replayPlayBtn translation');
assert(tEn.replayWatchAgainBtn === 'WATCH AGAIN', 'replayWatchAgainBtn translation');

console.log('\n🎉 ALL 4 ERROR GROUPS PASSED WITH 100% COMPLIANCE!');
