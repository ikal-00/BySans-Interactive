import { runSimulation } from './src/game/simulation';
import type { SimulationStrategy } from './src/math/types';

function verifyRTP() {
    console.log("=== Endless Descent Monte Carlo RTP Benchmark (All 4 New Mechanics @ 96.00% RTP / 4.00% House Edge) ===");

    const configs: {
        name: string;
        rounds: number;
        minesCount: number;
        targetCashoutRow: number;
        strategy: SimulationStrategy;
    }[] = [
        { name: "1. Standard Play (Mines 2, Row 2)", rounds: 250000, minesCount: 2, targetCashoutRow: 2, strategy: 'normal' },
        { name: "2. ★ Golden Card Hunter (2x/3x Boost + Lucky Mode)", rounds: 250000, minesCount: 1, targetCashoutRow: 1, strategy: 'golden_hunter' },
        { name: "3. 👽 Alien UFO Row-Breaker (+2 Rows Destroyed)", rounds: 250000, minesCount: 1, targetCashoutRow: 2, strategy: 'alien_hunter' },
        { name: "4. 🛡️ Energy Shield Mode (Blocks 1 Mine)", rounds: 250000, minesCount: 2, targetCashoutRow: 2, strategy: 'shield_mode' },
        { name: "5. 💰 50% Partial Cashout + Continue Strategy", rounds: 250000, minesCount: 2, targetCashoutRow: 2, strategy: 'partial_cashout' }
    ];

    let totalRounds = 0;
    let totalTime = 0;

    for (const cfg of configs) {
        const t0 = performance.now();
        const results = runSimulation({
            rounds: cfg.rounds,
            minesCount: cfg.minesCount,
            targetCashoutRow: cfg.targetCashoutRow,
            betAmount: 10,
            strategy: cfg.strategy
        });
        const t1 = performance.now();
        const elapsed = t1 - t0;
        totalTime += elapsed;
        totalRounds += cfg.rounds;

        const rtpPct = (results.rtp * 100).toFixed(3);
        console.log(`\n[${cfg.name}]`);
        console.log(`  Rounds: ${cfg.rounds.toLocaleString()} in ${elapsed.toFixed(2)} ms (${results.roundsPerSecond.toLocaleString()} rps)`);
        console.log(`  Turnover: $${results.totalTurnover.toLocaleString()} | Payout: $${results.totalPayout.toLocaleString()}`);
        console.log(`  Simulated RTP: ${rtpPct}% (Theoretical: 96.00%) | House Edge: ${(results.houseEdge * 100).toFixed(3)}%`);
        console.log(`  Specials: ★Golden=${results.goldenHits.toLocaleString()} | 👽Alien=${results.alienAttacks.toLocaleString()} | 🛡️ShieldSaves=${results.shieldSaves.toLocaleString()} | 💰Partial50%=${results.partialCashouts.toLocaleString()}`);

        if (Math.abs(results.rtp - 0.96) > 0.008) {
            throw new Error(`RTP deviation too high for ${cfg.name}: ${rtpPct}% (Expected ~96.00%)`);
        }
    }

    console.log(`\nTOTAL: ${totalRounds.toLocaleString()} rounds executed in ${totalTime.toFixed(2)} ms.`);
    if (totalTime > 2000) {
        throw new Error(`Total execution time exceeded 2 seconds limit: ${totalTime.toFixed(2)} ms`);
    }

    console.log("SUCCESS: All 5 strategies (Normal, Golden Cards, Alien UFO, Energy Shield, 50% Partial Cashout) strictly converged to 96.00% RTP (4.00% House Edge)!");
}

verifyRTP();
