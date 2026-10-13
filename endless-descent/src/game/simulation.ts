import { GameEngine, GameState } from './engine';
import { generateServerSeed } from '../crypto/provablyFair';

export interface SimulationConfig {
    rounds: number;
    minesCount: number;
    targetCashoutRow: number; // Row index (k >= 1) to cashout at
    betAmount: number;
}

export interface SimulationResult {
    totalTurnover: number;
    totalPayout: number;
    rtp: number;
    maxStreakWin: number;
    maxStreakLoss: number;
}

export function runSimulation(config: SimulationConfig): SimulationResult {
    const { rounds, minesCount, targetCashoutRow, betAmount } = config;

    // We can instantiate one engine to reuse logic
    const serverSeed = generateServerSeed();
    const clientSeed = 'simulation_seed';

    const engine = new GameEngine(serverSeed, clientSeed);

    let totalTurnover = 0;
    let totalPayout = 0;

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxStreakWin = 0;
    let maxStreakLoss = 0;

    for (let r = 0; r < rounds; r++) {
        // Run a round
        engine.startBet(betAmount, minesCount);
        totalTurnover += betAmount;

        let crashed = false;

        // Fast forward clicking lanes
        while (engine.state === GameState.PLAYING) {
            // Always click lane 0 for simulation (lane doesn't affect RTP due to uniform shuffle)
            const result = engine.pickLane(0);

            if (!result || !result.isSafe) {
                crashed = true;
                break;
            }

            // If we successfully reached target cashout row, cashout
            if (engine.currentRow > targetCashoutRow) {
                // The engine's row has incremented, so if we wanted to cashout AT row k, we do it when currentRow is k+1
                let roundPayout = 0;
                engine.setCallbacks((_state, _eng) => {}, (p, _m) => {
                    roundPayout = p;
                });
                engine.cashout();
                totalPayout += roundPayout;
                break;
            }
        }

        if (crashed) {
            currentLossStreak++;
            currentWinStreak = 0;
            if (currentLossStreak > maxStreakLoss) maxStreakLoss = currentLossStreak;
        } else {
            currentWinStreak++;
            currentLossStreak = 0;
            if (currentWinStreak > maxStreakWin) maxStreakWin = currentWinStreak;
        }
    }

    return {
        totalTurnover,
        totalPayout,
        rtp: totalTurnover > 0 ? totalPayout / totalTurnover : 0,
        maxStreakWin,
        maxStreakLoss
    };
}
