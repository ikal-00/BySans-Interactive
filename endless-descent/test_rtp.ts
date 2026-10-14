import { runSimulation } from './src/game/simulation';

function verifyRTP() {
    console.log("=== Endless Descent Monte Carlo RTP Benchmark (96.00% RTP / 4.00% House Edge) ===");

    const configs = [
        { name: "Mines 1, Row 1 (Low Variance)", rounds: 200000, minesCount: 1, targetCashoutRow: 1 },
        { name: "Mines 2, Row 2 (Medium Variance)", rounds: 300000, minesCount: 2, targetCashoutRow: 2 },
        { name: "Mines 3, Row 1 (High Mines)", rounds: 200000, minesCount: 3, targetCashoutRow: 1 },
    ];

    let totalRounds = 0;
    let totalTime = 0;

    for (const cfg of configs) {
        const t0 = performance.now();
        const results = runSimulation({
            rounds: cfg.rounds,
            minesCount: cfg.minesCount,
            targetCashoutRow: cfg.targetCashoutRow,
            betAmount: 10
        });
        const t1 = performance.now();
        const elapsed = t1 - t0;
        totalTime += elapsed;
        totalRounds += cfg.rounds;

        const rtpPct = (results.rtp * 100).toFixed(3);
        console.log(`[${cfg.name}]`);
        console.log(`  Rounds: ${cfg.rounds.toLocaleString()} in ${elapsed.toFixed(2)} ms (${results.roundsPerSecond.toLocaleString()} rps)`);
        console.log(`  Turnover: $${results.totalTurnover.toLocaleString()} | Payout: $${results.totalPayout.toLocaleString()}`);
        console.log(`  Simulated RTP: ${rtpPct}% (Theoretical: 96.00%) | House Edge: ${(results.houseEdge * 100).toFixed(3)}%`);
        console.log(`  Variance: ${results.variance} | StdDev: ${results.standardDeviation}`);

        // Check reasonable statistical convergence to 96.00% (+/- 0.7%)
        if (Math.abs(results.rtp - 0.96) > 0.007) {
            throw new Error(`RTP deviation too high for ${cfg.name}: ${rtpPct}% (Expected ~96.00%)`);
        }
    }

    console.log(`\nTOTAL: ${totalRounds.toLocaleString()} rounds executed in ${totalTime.toFixed(2)} ms.`);
    if (totalTime > 2000) {
        throw new Error(`Total execution time exceeded 2 seconds limit: ${totalTime.toFixed(2)} ms`);
    }

    console.log("SUCCESS: All Monte Carlo benchmarks completed in under 2 seconds and verified 96.00% RTP convergence (4.00% House Edge)!");
}

verifyRTP();
