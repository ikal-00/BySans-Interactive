import { deriveHazards, generateServerSeed, hashServerSeed } from '../crypto/provablyFair';
import { calculateMultiplier, calculatePayout } from '../math/multipliers';
import { GameState } from '../math/types';
import type { RoundPick, RoundSummary } from '../math/types';

export type StateListener = (state: GameState, engine: GameEngine) => void;
export type CashoutListener = (payout: number, multiplier: number, engine: GameEngine) => void;
export type StepListener = (pick: RoundPick, engine: GameEngine) => void;
export type BalanceListener = (balance: number, engine: GameEngine) => void;
export type HistoryListener = (summaries: RoundSummary[], engine: GameEngine) => void;

export class GameEngine {
    public state: GameState = GameState.IDLE;
    public betAmount: number = 10.0;
    public minesCount: number = 3;
    public balance: number = 250.0; // Starting simulated balance ($250.00 = 0.0125 BTC)

    public currentRow: number = 0; // 1-indexed active decision row
    public currentMultiplier: number = 1.0;
    public lastChosenLane: number = 2; // Default center lane (0-4)
    public lastCrashedRow: number | null = null;
    public lastCrashedLane: number | null = null;

    // Provably fair config
    public serverSeed: string = '';
    public clientSeed: string = '';
    public previousServerSeed: string = '';
    public nonce: number = 0;

    // Round state tracking
    public currentPicks: RoundPick[] = [];
    public recentSummaries: RoundSummary[] = [];

    // Event subscribers
    private stateListeners: Set<StateListener> = new Set();
    private cashoutListeners: Set<CashoutListener> = new Set();
    private stepListeners: Set<StepListener> = new Set();
    private balanceListeners: Set<BalanceListener> = new Set();
    private historyListeners: Set<HistoryListener> = new Set();

    constructor(serverSeed: string, clientSeed: string) {
        this.serverSeed = serverSeed || generateServerSeed();
        this.clientSeed = clientSeed || 'stake_player_1';
        this.loadPersistedState();
    }

    private loadPersistedState() {
        try {
            const savedBalance = localStorage.getItem('endless_descent_balance');
            if (savedBalance !== null) {
                const parsed = parseFloat(savedBalance);
                if (!isNaN(parsed) && parsed > 0) this.balance = parsed;
            }
            const savedClientSeed = localStorage.getItem('endless_descent_client_seed');
            if (savedClientSeed) {
                this.clientSeed = savedClientSeed;
            }
            const savedNonce = localStorage.getItem('endless_descent_nonce');
            if (savedNonce) {
                this.nonce = parseInt(savedNonce, 10) || 0;
            }
        } catch {
            // Ignore in environments without localStorage
        }
    }

    private persistState() {
        try {
            localStorage.setItem('endless_descent_balance', this.balance.toFixed(2));
            localStorage.setItem('endless_descent_client_seed', this.clientSeed);
            localStorage.setItem('endless_descent_nonce', this.nonce.toString());
        } catch {
            // Ignore
        }
    }

    // Subscription methods
    public onStateChange(listener: StateListener): () => void {
        this.stateListeners.add(listener);
        return () => this.stateListeners.delete(listener);
    }

    public onCashout(listener: CashoutListener): () => void {
        this.cashoutListeners.add(listener);
        return () => this.cashoutListeners.delete(listener);
    }

    public onStep(listener: StepListener): () => void {
        this.stepListeners.add(listener);
        return () => this.stepListeners.delete(listener);
    }

    public onBalanceChange(listener: BalanceListener): () => void {
        this.balanceListeners.add(listener);
        return () => this.balanceListeners.delete(listener);
    }

    public onHistoryUpdate(listener: HistoryListener): () => void {
        this.historyListeners.add(listener);
        return () => this.historyListeners.delete(listener);
    }

    // Backward-compatibility hook
    public setCallbacks(onStateChange?: StateListener, onCashout?: CashoutListener) {
        if (onStateChange) this.onStateChange(onStateChange);
        if (onCashout) this.onCashout(onCashout);
    }

    private emitStateChange(state: GameState) {
        this.state = state;
        this.stateListeners.forEach((fn) => fn(state, this));
    }

    private emitBalanceChange() {
        this.persistState();
        this.balanceListeners.forEach((fn) => fn(this.balance, this));
    }

    private emitHistoryUpdate() {
        this.historyListeners.forEach((fn) => fn(this.recentSummaries, this));
    }

    public updateClientSeed(newClientSeed: string) {
        if (!newClientSeed.trim()) return;
        this.clientSeed = newClientSeed.trim();
        this.persistState();
    }

    public adjustBalance(delta: number) {
        this.balance = Math.max(0, Math.round((this.balance + delta) * 100) / 100);
        this.emitBalanceChange();
    }

    public resetBalance(amount = 250.0) {
        this.balance = amount;
        this.emitBalanceChange();
    }

    public startBet(betAmount: number, minesCount: number): boolean {
        if (this.state === GameState.PLAYING) return false;
        if (betAmount <= 0) return false;
        if (minesCount < 1 || minesCount > 4) return false;

        // Auto top-up if broke for endless testing
        if (this.balance < betAmount) {
            this.balance = Math.max(250.0, betAmount * 5);
            this.emitBalanceChange();
        }

        this.betAmount = betAmount;
        this.minesCount = minesCount;
        this.currentRow = 1;
        this.currentMultiplier = 1.0;
        this.lastCrashedRow = null;
        this.lastCrashedLane = null;
        this.currentPicks = [];
        this.nonce++;
        this.persistState();

        // Deduct bet from balance
        this.adjustBalance(-betAmount);

        this.emitStateChange(GameState.PLAYING);
        return true;
    }

    public getHazardsForActionRow(row: number): number[] {
        return deriveHazards(this.serverSeed, this.clientSeed, this.nonce, row, this.minesCount);
    }

    public pickLane(laneIndex: number): { isSafe: boolean; hazards: number[] } | null {
        if (this.state !== GameState.PLAYING) return null;
        if (laneIndex < 0 || laneIndex > 4) return null;

        const hazards = this.getHazardsForActionRow(this.currentRow);
        const isSafe = !hazards.includes(laneIndex);

        this.lastChosenLane = laneIndex;

        const pick: RoundPick = {
            row: this.currentRow,
            lane: laneIndex,
            isSafe,
            hazards
        };
        this.currentPicks.push(pick);

        this.stepListeners.forEach((fn) => fn(pick, this));

        if (isSafe) {
            this.currentMultiplier = calculateMultiplier(this.currentRow, this.minesCount);
            this.currentRow++;
            this.emitStateChange(GameState.PLAYING);
            return { isSafe: true, hazards };
        } else {
            // Hazard triggered - Crash!
            this.lastCrashedRow = this.currentRow;
            this.lastCrashedLane = laneIndex;

            const summary: RoundSummary = {
                id: `rnd_${Date.now()}_${this.nonce}`,
                betAmount: this.betAmount,
                minesCount: this.minesCount,
                clearedRows: this.currentRow - 1,
                finalMultiplier: 0.0,
                payout: 0.0,
                isWin: false,
                serverSeed: this.serverSeed,
                serverSeedHash: hashServerSeed(this.serverSeed),
                clientSeed: this.clientSeed,
                nonce: this.nonce,
                picks: [...this.currentPicks],
                timestamp: Date.now()
            };
            this.recentSummaries.unshift(summary);
            if (this.recentSummaries.length > 20) this.recentSummaries.pop();

            // Rotate server seed
            this.previousServerSeed = this.serverSeed;
            this.serverSeed = generateServerSeed();

            this.emitStateChange(GameState.CRASHED);
            this.emitHistoryUpdate();

            return { isSafe: false, hazards };
        }
    }

    public cashout(): number | null {
        if (this.state !== GameState.PLAYING) return null;
        if (this.currentRow <= 1) return null; // Must clear at least 1 row to cashout

        const payout = calculatePayout(this.betAmount, this.currentMultiplier);

        // Add payout to balance
        this.adjustBalance(payout);

        const summary: RoundSummary = {
            id: `rnd_${Date.now()}_${this.nonce}`,
            betAmount: this.betAmount,
            minesCount: this.minesCount,
            clearedRows: this.currentRow - 1,
            finalMultiplier: this.currentMultiplier,
            payout,
            isWin: true,
            serverSeed: this.serverSeed,
            serverSeedHash: hashServerSeed(this.serverSeed),
            clientSeed: this.clientSeed,
            nonce: this.nonce,
            picks: [...this.currentPicks],
            timestamp: Date.now()
        };
        this.recentSummaries.unshift(summary);
        if (this.recentSummaries.length > 20) this.recentSummaries.pop();

        // Rotate server seed
        this.previousServerSeed = this.serverSeed;
        this.serverSeed = generateServerSeed();

        this.cashoutListeners.forEach((fn) => fn(payout, this.currentMultiplier, this));
        this.emitStateChange(GameState.WON);
        this.emitHistoryUpdate();

        return payout;
    }
}
