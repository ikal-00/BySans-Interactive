import { GameEngine } from './src/game/engine';
import { GameState } from './src/math/types';
import { evaluateLanePick } from './src/crypto/provablyFair';

function assert(condition: boolean, msg: string) {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${msg}`);
        process.exit(1);
    }
    console.log(`✅ PASSED: ${msg}`);
}

console.log('=== TEST: BOX ORDER CONSISTENCY BETWEEN IDLE AND BETTING ===\n');

const engine = new GameEngine('stake_server_seed_test_123', 'stake_client_seed_test_456');

for (let round = 1; round <= 5; round++) {
    console.log(`--- Round ${round} ---`);
    assert(engine.state === GameState.IDLE, `State before bet must be IDLE (got ${engine.state})`);

    // In IDLE: Sample 5 rows of box configurations as seen by renderer
    const idleSpecials: any[] = [];
    for (let r = 1; r <= 5; r++) {
        idleSpecials.push(engine.getSpecialsForRow(r));
    }

    const currentNonce = engine.nonce;
    console.log(`Round ${round} preview nonce: ${currentNonce}`);
    console.log(`Row 1 preview: goldenLane=${idleSpecials[0].goldenLane}, alienLane=${idleSpecials[0].alienLane}`);

    // User clicks Bet ("DROP CAPSULE")
    const betSuccess = engine.startBet(10, 3, false, false);
    assert(betSuccess, 'startBet must succeed');
    assert(engine.state === GameState.PLAYING, 'State must now be PLAYING');
    assert(engine.nonce === currentNonce, `Nonce must NOT change on startBet (expected ${currentNonce}, got ${engine.nonce})`);

    // In PLAYING: Sample the same 5 rows of box configurations
    for (let r = 1; r <= 5; r++) {
        const playingSpecials = engine.getSpecialsForRow(r);
        assert(
            playingSpecials.goldenLane === idleSpecials[r - 1].goldenLane,
            `Row ${r} goldenLane must match! IDLE: ${idleSpecials[r - 1].goldenLane}, PLAYING: ${playingSpecials.goldenLane}`
        );
        assert(
            playingSpecials.alienLane === idleSpecials[r - 1].alienLane,
            `Row ${r} alienLane must match! IDLE: ${idleSpecials[r - 1].alienLane}, PLAYING: ${playingSpecials.alienLane}`
        );
        assert(
            playingSpecials.goldenBoost === idleSpecials[r - 1].goldenBoost,
            `Row ${r} goldenBoost must match!`
        );
        assert(
            playingSpecials.catLane === idleSpecials[r - 1].catLane,
            `Row ${r} catLane must match! IDLE: ${idleSpecials[r - 1].catLane}, PLAYING: ${playingSpecials.catLane}`
        );
        if (playingSpecials.catLane !== null) {
            assert(
                playingSpecials.catLane !== playingSpecials.goldenLane &&
                playingSpecials.catLane !== playingSpecials.alienLane,
                `Row ${r} catLane must be on a normal box only!`
            );
        }
    }
    console.log(`✅ Boxes on rows 1..5 are 100% IDENTICAL before and after clicking Bet!`);

    // Pick lanes: either cashout on round 1, 3, 5 or crash on round 2, 4
    if (round % 2 === 1) {
        // Find safe lane on row 1 and row 2
        for (let r = 1; r <= 2; r++) {
            let safeLane = 0;
            for (let l = 0; l < 5; l++) {
                const evalPick = evaluateLanePick(engine.serverSeed, engine.clientSeed, engine.nonce, r, l, 3, false);
                if (evalPick.isSafe) { safeLane = l; break; }
            }
            engine.pickLane(safeLane);
        }
        // Cashout
        const payout = engine.cashout();
        assert(payout !== null && payout > 0, 'Cashout must return payout');
        assert(engine.state === GameState.WON, 'State must be WON');
        assert(engine.nonce === currentNonce + 1, `Nonce must advance to ${currentNonce + 1} upon round completion`);
        assert(engine.recentSummaries[0].nonce === currentNonce, `Summary must record nonce ${currentNonce}`);
    } else {
        // Crash intentionally by hitting a hazard
        const hazards = engine.getHazardsForActionRow(1);
        engine.pickLane(hazards[0]);
        assert(engine.state === GameState.CRASHED, 'State must be CRASHED');
        assert(engine.nonce === currentNonce + 1, `Nonce must advance to ${currentNonce + 1} upon round completion`);
        assert(engine.recentSummaries[0].nonce === currentNonce, `Summary must record nonce ${currentNonce}`);
    }

    // Reset to IDLE for next round
    engine.resetToIdle();
    assert(engine.state === GameState.IDLE, 'State must reset to IDLE');
    assert(engine.nonce === currentNonce + 1, `Nonce stays at ${currentNonce + 1} during IDLE`);
}

console.log('\n🎉 ALL BOX CONSISTENCY & NONCE ADVANCEMENT ASSERTIONS PASSED PERFECTLY!\n');
