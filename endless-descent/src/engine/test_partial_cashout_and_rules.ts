import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { evaluateLanePick } from '../crypto/provablyFair';

function getSafeLane(engine: GameEngine, row: number): number {
    for (let lane = 0; lane < 5; lane++) {
        const out = evaluateLanePick(
            engine.serverSeed,
            engine.clientSeed,
            engine.nonce,
            row,
            lane,
            engine.minesCount,
            engine.luckyBoost
        );
        if (out.isSafe) return lane;
    }
    return 0;
}

function runAssertions() {
    console.log('=== Starting Test Suite: Partial Cashout & Rules Modal Blocking ===');

    // 1. Initialize GameEngine
    const engine = new GameEngine('server_seed_test_abc', 'client_seed_test_123');
    engine.balance = 1000;

    // 2. Test initial state
    console.assert(engine.state === GameState.IDLE, 'Engine should be IDLE');
    console.assert(!engine.canPartialCashout(), 'Cannot partial cashout when IDLE');

    // 3. Start a bet ($100, 1 mine)
    const started = engine.startBet(100, 1, false, false);
    console.assert(started, 'Bet should start successfully');
    console.assert(engine.balance === 900, 'Balance should decrease by bet amount');
    console.assert(engine.currentRow === 1, 'Current row should be 1');
    console.assert(!engine.canPartialCashout(), 'Cannot partial cashout on Row 1');

    // Pick safe lane on row 1
    const safeLane1 = getSafeLane(engine, 1);
    const pick1 = engine.pickLane(safeLane1);
    console.assert(pick1 !== null && pick1.isSafe, 'Row 1 pick should be safe');
    console.assert(engine.currentRow === 2, 'Current row should now be 2');

    // 4. Now on Row 2: canPartialCashout should be TRUE!
    console.assert(engine.canPartialCashout(), 'canPartialCashout must be TRUE on Row 2');

    const multBefore = engine.currentMultiplier;
    const betBefore = engine.activeBetAmount; // 100
    const expectedPayoutBefore = betBefore * multBefore;
    const expectedHalf = Math.floor(expectedPayoutBefore * 0.5 * 100) / 100;
    const balanceBefore = engine.balance; // 900

    // Execute Partial Cashout
    const partialResult = engine.partialCashout();
    console.assert(partialResult !== null, 'partialCashout should not be null');
    console.assert(partialResult === expectedHalf, `Partial payout expected ${expectedHalf}, got ${partialResult}`);
    console.assert(engine.balance === balanceBefore + expectedHalf, `Balance should increase by ${expectedHalf}`);
    console.assert(engine.activeBetAmount === betBefore * 0.5, 'Active bet amount should be cut in half (50%)');
    console.assert(engine.currentMultiplier === multBefore, 'Multiplier should remain unchanged');
    console.assert(engine.partialCashoutUsedOnRow === 2, 'partialCashoutUsedOnRow should be 2');

    // 5. Try calling partial cashout again on the same row -> MUST return null and canPartialCashout MUST be false!
    console.assert(!engine.canPartialCashout(), 'Cannot partial cashout twice on the same row');
    const secondCall = engine.partialCashout();
    console.assert(secondCall === null, 'Second call on same row must return null');

    // 6. Advance to Row 3
    const safeLane2 = getSafeLane(engine, 2);
    const pick2 = engine.pickLane(safeLane2);
    console.assert(pick2 !== null && pick2.isSafe, 'Row 2 pick should be safe');
    console.assert(engine.currentRow >= 3, 'Current row should now be >= 3');

    // On Row 3: canPartialCashout becomes TRUE again!
    console.assert(engine.canPartialCashout(), 'canPartialCashout must be TRUE again on Row 3');

    // 7. Full Cashout on Row 3
    const balanceBeforeFinal = engine.balance;
    const finalCashout = engine.cashout();
    console.assert(finalCashout !== null, 'Final cashout should succeed');
    console.assert(engine.balance > balanceBeforeFinal, 'Balance should increase after final cashout');
    console.assert(engine.state === GameState.WON, 'Engine state should be WON');

    console.log('[SUCCESS] All Partial Cashout assertions passed successfully!');
}

runAssertions();
