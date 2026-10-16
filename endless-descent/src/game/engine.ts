import {
    deriveHazards,
    deriveRowSpecials,
    evaluateLanePick,
    generateServerSeed,
    hashServerSeed
} from '../crypto/provablyFair';
import {
    calculateEffectiveBet,
    calculateNextStepMultiplier,
    calculatePayout,
    calculateShieldSaveMultiplier
} from '../math/multipliers';
import { GameState } from '../math/types';
import type { RoundPick, RoundSummary, RowSpecialConfig } from '../math/types';

export type StateListener = (state: GameState, engine: GameEngine) => void;
export type CashoutListener = (payout: number, multiplier: number, engine: GameEngine) => void;
export type PartialCashoutListener = (bankedAmount: number, remainingBet: number, engine: GameEngine) => void;
export type StepListener = (pick: RoundPick, engine: GameEngine) => void;
export type BalanceListener = (balance: number, engine: GameEngine) => void;
export type HistoryListener = (summaries: RoundSummary[], engine: GameEngine) => void;

export class GameEngine {
    public state: GameState = GameState.IDLE;
    public betAmount: number = 10.0;
    public activeBetAmount: number = 10.0;
    public initialEffectiveBet: number = 10.0;
    public minesCount: number = 3;
    public balance: number = 250.0; // Starting simulated balance ($250.00 = 0.0125 BTC)

    // Bonus / Power-up Toggles
    public luckyBoost: boolean = false;      // ⚡ Bonus de Suerte (+25% bet)
    public shieldPurchased: boolean = false; // 🛡️ Escudo Deflector (+25% bet)
    public hasActiveShield: boolean = false; // Intact shield during active round
    public shieldUsedInRound: boolean = false;

    // Partial Cashout tracking
    public partialPayoutBanked: number = 0;
    public partialCashoutUsedOnRow: number = 0;

    public currentRow: number = 0; // 1-indexed active decision row
    public currentMultiplier: number = 1.0;
    public lastChosenLane: number = 2; // Default center lane (0-4)
    public lastCrashedRow: number | null = null;
    public lastCrashedLane: number | null = null;
    public alienDestroyedRows: Set<number> = new Set();

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
    private partialCashoutListeners: Set<PartialCashoutListener> = new Set();
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
            // Ignore in headless/Node environments
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

    public onPartialCashout(listener: PartialCashoutListener): () => void {
        this.partialCashoutListeners.add(listener);
        return () => this.partialCashoutListeners.delete(listener);
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

    public getEffectiveBet(baseBet = this.betAmount): number {
        return calculateEffectiveBet(baseBet, this.luckyBoost, this.shieldPurchased);
    }

    public startBet(
        betAmount: number,
        minesCount: number,
        luckyBoost = this.luckyBoost,
        shieldPurchased = this.shieldPurchased
    ): boolean {
        if (this.state === GameState.PLAYING) return false;
        if (betAmount <= 0) return false;
        if (minesCount < 1 || minesCount > 4) return false;

        this.luckyBoost = luckyBoost;
        this.shieldPurchased = shieldPurchased;

        const effectiveBet = calculateEffectiveBet(betAmount, luckyBoost, shieldPurchased);

        // Auto top-up if simulated balance runs low
        if (this.balance < effectiveBet) {
            this.balance = Math.max(250.0, effectiveBet * 5);
            this.emitBalanceChange();
        }

        this.betAmount = betAmount;
        this.activeBetAmount = effectiveBet;
        this.initialEffectiveBet = effectiveBet;
        this.minesCount = minesCount;
        this.hasActiveShield = shieldPurchased;
        this.shieldUsedInRound = false;
        this.partialPayoutBanked = 0;
        this.partialCashoutUsedOnRow = 0;

        this.currentRow = 1;
        this.currentMultiplier = 1.0;
        this.lastCrashedRow = null;
        this.lastCrashedLane = null;
        this.currentPicks = [];
        this.alienDestroyedRows.clear();
        this.nonce++;
        this.persistState();

        // Deduct full effective wager from balance
        this.adjustBalance(-effectiveBet);

        this.emitStateChange(GameState.PLAYING);
        return true;
    }

    public getHazardsForActionRow(row: number): number[] {
        return deriveHazards(this.serverSeed, this.clientSeed, this.nonce, row, this.minesCount);
    }

    public getSpecialsForRow(row: number): RowSpecialConfig {
        return deriveRowSpecials(this.serverSeed, this.clientSeed, this.nonce, row, this.luckyBoost);
    }

    public pickLane(laneIndex: number): RoundPick | null {
        if (this.state !== GameState.PLAYING) return null;
        if (laneIndex < 0 || laneIndex > 4) return null;

        const actingRow = this.currentRow;
        const isFirstStep = this.currentPicks.length === 0;
        const shieldWasActive = this.hasActiveShield;

        const outcome = evaluateLanePick(
            this.serverSeed,
            this.clientSeed,
            this.nonce,
            actingRow,
            laneIndex,
            this.minesCount,
            this.luckyBoost
        );

        this.lastChosenLane = laneIndex;

        // CASE 1: SAFE STEP (Normal, Golden ★, or Alien UFO 👽)
        if (outcome.isSafe) {
            this.currentMultiplier = calculateNextStepMultiplier(
                this.currentMultiplier,
                this.minesCount,
                isFirstStep,
                outcome.boostFactor,
                shieldWasActive
            );

            // If Alien UFO triggered, mark the next 2 rows as destroyed by the Alien spaceship!
            if (outcome.specialType === 'ALIEN' && outcome.rowsSkipped > 0) {
                for (let s = 1; s <= outcome.rowsSkipped; s++) {
                    this.alienDestroyedRows.add(actingRow + s);
                }
            }

            const pick: RoundPick = {
                row: actingRow,
                lane: laneIndex,
                isSafe: true,
                shieldSaved: false,
                specialType: outcome.specialType,
                boostApplied: outcome.boostFactor,
                rowsSkipped: outcome.rowsSkipped,
                hazards: outcome.hazards,
                stepMultiplierAfter: this.currentMultiplier
            };
            this.currentPicks.push(pick);

            this.currentRow = actingRow + 1 + outcome.rowsSkipped;

            this.stepListeners.forEach((fn) => fn(pick, this));
            this.emitStateChange(GameState.PLAYING);
            return pick;
        }

        // CASE 2: HIT A MINE, BUT ENERGY SHIELD ABSORBS THE EXPLOSION!
        if (shieldWasActive) {
            this.hasActiveShield = false;
            this.shieldUsedInRound = true;
            this.currentMultiplier = calculateShieldSaveMultiplier(
                this.currentMultiplier,
                isFirstStep
            );

            const pick: RoundPick = {
                row: actingRow,
                lane: laneIndex,
                isSafe: false,
                shieldSaved: true,
                specialType: outcome.specialType,
                boostApplied: 0.5,
                rowsSkipped: 0,
                hazards: outcome.hazards,
                stepMultiplierAfter: this.currentMultiplier
            };
            this.currentPicks.push(pick);

            this.currentRow = actingRow + 1;

            this.stepListeners.forEach((fn) => fn(pick, this));
            this.emitStateChange(GameState.PLAYING);
            return pick;
        }

        // CASE 3: FATAL CRASH (No shield remaining)
        this.lastCrashedRow = actingRow;
        this.lastCrashedLane = laneIndex;

        const pick: RoundPick = {
            row: actingRow,
            lane: laneIndex,
            isSafe: false,
            shieldSaved: false,
            specialType: outcome.specialType,
            boostApplied: 0,
            rowsSkipped: 0,
            hazards: outcome.hazards,
            stepMultiplierAfter: 0
        };
        this.currentPicks.push(pick);

        const summary: RoundSummary = {
            id: `rnd_${Date.now()}_${this.nonce}`,
            betAmount: this.betAmount,
            effectiveBet: this.initialEffectiveBet,
            minesCount: this.minesCount,
            clearedRows: actingRow - 1,
            finalMultiplier: this.partialPayoutBanked > 0
                ? Math.round((this.partialPayoutBanked / this.initialEffectiveBet) * 100) / 100
                : 0.0,
            payout: this.partialPayoutBanked,
            partialPayoutBanked: this.partialPayoutBanked,
            isWin: this.partialPayoutBanked > 0,
            luckyBoost: this.luckyBoost,
            shieldUsed: this.shieldUsedInRound,
            serverSeed: this.serverSeed,
            serverSeedHash: hashServerSeed(this.serverSeed),
            clientSeed: this.clientSeed,
            nonce: this.nonce,
            picks: [...this.currentPicks],
            timestamp: Date.now()
        };
        this.recentSummaries.unshift(summary);
        if (this.recentSummaries.length > 20) this.recentSummaries.pop();

        this.previousServerSeed = this.serverSeed;
        this.serverSeed = generateServerSeed();

        this.stepListeners.forEach((fn) => fn(pick, this));
        this.emitStateChange(GameState.CRASHED);
        this.emitHistoryUpdate();

        return pick;
    }

    /**
     * Banks 50% of the current accumulated payout immediately to the player's balance
     * and keeps the remaining 50% active in the descent!
     */
    public partialCashout(): number | null {
        if (this.state !== GameState.PLAYING) return null;
        if (this.currentRow <= 1) return null;
        if (this.partialCashoutUsedOnRow === this.currentRow) return null;

        const currentTotalValue = calculatePayout(this.activeBetAmount, this.currentMultiplier);
        const halfPayout = Math.floor(currentTotalValue * 0.5 * 100) / 100;
        if (halfPayout < 0.01) return null;

        // Credit 50% immediately to balance
        this.adjustBalance(halfPayout);

        this.partialPayoutBanked = Math.round((this.partialPayoutBanked + halfPayout) * 100) / 100;
        this.activeBetAmount = Math.round(this.activeBetAmount * 0.5 * 10000) / 10000;
        this.partialCashoutUsedOnRow = this.currentRow;

        this.partialCashoutListeners.forEach((fn) => fn(halfPayout, this.activeBetAmount, this));
        this.emitStateChange(GameState.PLAYING);

        return halfPayout;
    }

    public canPartialCashout(): boolean {
        return (
            this.state === GameState.PLAYING &&
            this.currentRow > 1 &&
            this.partialCashoutUsedOnRow !== this.currentRow &&
            this.activeBetAmount * this.currentMultiplier >= 0.04
        );
    }

    public cashout(): number | null {
        if (this.state !== GameState.PLAYING) return null;
        if (this.currentRow <= 1) return null;

        const remainingPayout = calculatePayout(this.activeBetAmount, this.currentMultiplier);
        this.adjustBalance(remainingPayout);

        const totalRoundPayout = Math.round((remainingPayout + this.partialPayoutBanked) * 100) / 100;
        const effectiveFinalMult = Math.round((totalRoundPayout / this.initialEffectiveBet) * 10000) / 10000;

        const summary: RoundSummary = {
            id: `rnd_${Date.now()}_${this.nonce}`,
            betAmount: this.betAmount,
            effectiveBet: this.initialEffectiveBet,
            minesCount: this.minesCount,
            clearedRows: this.currentRow - 1,
            finalMultiplier: effectiveFinalMult,
            payout: totalRoundPayout,
            partialPayoutBanked: this.partialPayoutBanked,
            isWin: true,
            luckyBoost: this.luckyBoost,
            shieldUsed: this.shieldUsedInRound,
            serverSeed: this.serverSeed,
            serverSeedHash: hashServerSeed(this.serverSeed),
            clientSeed: this.clientSeed,
            nonce: this.nonce,
            picks: [...this.currentPicks],
            timestamp: Date.now()
        };
        this.recentSummaries.unshift(summary);
        if (this.recentSummaries.length > 20) this.recentSummaries.pop();

        this.previousServerSeed = this.serverSeed;
        this.serverSeed = generateServerSeed();

        this.cashoutListeners.forEach((fn) => fn(totalRoundPayout, effectiveFinalMult, this));
        this.emitStateChange(GameState.WON);
        this.emitHistoryUpdate();

        return totalRoundPayout;
    }
}
