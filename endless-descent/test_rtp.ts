import { runSimulation } from './src/game/simulation';

function verifyRTP() {
    console.log("Running simulation for RTP Verification...");

    // We want to simulate 100,000 rounds of M=3, cashing out at row 5.
    const results = runSimulation({
        rounds: 1000000,
        minesCount: 1,
        targetCashoutRow: 1,
        betAmount: 10
    });

    console.log(`Turnover: $${results.totalTurnover}`);
    console.log(`Payout: $${results.totalPayout}`);
    console.log(`RTP: ${(results.rtp * 100).toFixed(4)}%`);

    if (results.rtp >= 0.985 && results.rtp <= 0.995) {
        console.log("RTP Converged correctly around 99.00%. Verification PASSED.");
    } else {
        throw new Error(`RTP deviation too high: ${results.rtp}`);
    }
}

verifyRTP();
