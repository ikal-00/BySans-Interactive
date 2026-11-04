import {
    deriveHazards,
    deriveRowSpecials,
    deriveWheelSpinOutcome,
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
import type { RoundPick, RoundSummary, RowSpecialConfig, WheelSpinOutcome } from '../math/types';
import { stakeRGS } from '../engine/StakeRGSBridge';

export type StateListener = (state: GameState, engine: GameEngine) => void;
export type CashoutListener = (payout: number, multiplier: number, engine: GameEngine) => void;
export type PartialCashoutListener = (bankedAmount: number, remainingBet: number, engine: GameEngine) => void;
export type StepListener = (pick: RoundPick, engine: GameEngine) => void;
export type BalanceListener = (balance: number, engine: GameEngine) => void;
export type HistoryListener = (summaries: RoundSummary[], engine: GameEngine) => void;
export type WheelTriggerListener = (row: number, lane: number, engine: GameEngine) => void;
export type WheelSpinListener = (outcome: WheelSpinOutcome, engine: GameEngine) => void;

export class GameEngine {
    public state: GameState = GameState.IDLE;
    public betAmount: number = 10.0;
    public activeBetAmount: number = 10.0;
    public initialEffectiveBet: number = 10.0;
    public minesCount: number = 3;
    public balance: number = 250.0; // Starting simulated balance ($250.00 = 0.0125 BTC)

    // Legacy compatibility getters/setters for clean integration
    public gameMode: 'base' = 'base';
    public luckyBoost: boolean = false;
    public shieldPurchased: boolean = false;
    public hasActiveShield: boolean = false;
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

    // Prize Wheel (Ruleta) state tracking
    public isWheelActive: boolean = false;
    public wheelSpinsRemaining: number = 0;
    public wheelSpinIndex: number = 0;
    public wheelRow: number = 0;
    public wheelLane: number = 0;
    public wheelPendingPick: RoundPick | null = null;

    // Provably fair config
    public serverSeed: string = '';
    public clientSeed: string = '';
    public previousServerSeed: string = '';
    public nonce: number = 1;

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
    private wheelTriggerListeners: Set<WheelTriggerListener> = new Set();
    private wheelSpinListeners: Set<WheelSpinListener> = new Set();

    constructor(serverSeed: string, clientSeed: string) {
        this.serverSeed = serverSeed || generateServerSeed();
        this.clientSeed = clientSeed || 'stake_player_1';
        this.loadPersistedState();
    }

    private loadPersistedState() {
        try {
            if (!stakeRGS.session.isLiveRGS) {
                const savedBalance = localStorage.getItem('endless_descent_balance');
                if (savedBalance !== null) {
                    const parsed = parseFloat(savedBalance);
                    if (!isNaN(parsed) && parsed > 0) this.balance = parsed;
                }
            }
            const savedClientSeed = localStorage.getItem('endless_descent_client_seed');
            if (savedClientSeed) {
                this.clientSeed = savedClientSeed;
            }
            const savedNonce = localStorage.getItem('endless_descent_nonce');
            if (savedNonce) {
                this.nonce = Math.max(1, parseInt(savedNonce, 10) || 1);
            } else {
                this.nonce = 1;
            }
        } catch {
            // Ignore in headless/Node environments
        }
    }

    private persistState() {
        try {
            if (!stakeRGS.session.isLiveRGS) {
                localStorage.setItem('endless_descent_balance', this.balance.toFixed(2));
            }
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

    public onWheelTrigger(listener: WheelTriggerListener): () => void {
        this.wheelTriggerListeners.add(listener);
        return () => this.wheelTriggerListeners.delete(listener);
    }

    public onWheelSpin(listener: WheelSpinListener): () => void {
        this.wheelSpinListeners.add(listener);
        return () => this.wheelSpinListeners.delete(listener);
    }

    public setCallbacks(onStateChange?: StateListener, onCashout?: CashoutListener) {
        if (onStateChange) this.onStateChange(onStateChange);
        if (onCashout) this.onCashout(onCashout);
    }

    private emitStateChange(state: GameState) {
        this.state = state;
        this.stateListeners.forEach((fn) => fn(state, this));
    }

    public emitBalanceChange() {
        this.persistState();
        this.balanceListeners.forEach((fn) => fn(this.balance, this));
    }

    public setBalance(amount: number) {
        this.balance = Math.max(0, Math.round(amount * 100) / 100);
        this.emitBalanceChange();
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
        return calculateEffectiveBet(baseBet, this.luckyBoost, this.shieldPurchased, this.gameMode);
    }

    public startBet(
        betAmount: number,
        minesCount: number,
        luckyBoost = false,
        shieldPurchased = this.shieldPurchased,
        _gameMode = 'base'
    ): boolean {
        if (this.state === GameState.PLAYING) return false;
        if (!Number.isFinite(betAmount) || betAmount <= 0) return false;
        if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > 4) return false;

        const sanitizedBet = Math.min(1000000, Math.round(betAmount * 100) / 100);
        const effectiveBet = calculateEffectiveBet(sanitizedBet, luckyBoost, shieldPurchased);

        // In Live RGS mode, verify real balance sufficiency; in Sandbox demo, auto top-up
        if (!stakeRGS.session.isLiveRGS && this.balance < effectiveBet) {
            this.balance = Math.max(250.0, effectiveBet * 5);
            this.emitBalanceChange();
        } else if (stakeRGS.session.isLiveRGS && this.balance < effectiveBet) {
            stakeRGS.showToast('Saldo insuficiente en tu cuenta de Stake.', 'error', 3500);
            return false;
        }

        this.betAmount = sanitizedBet;
        this.activeBetAmount = sanitizedBet;
        this.initialEffectiveBet = effectiveBet;
        this.minesCount = minesCount;
        this.luckyBoost = luckyBoost;
        this.shieldPurchased = shieldPurchased;
        this.hasActiveShield = shieldPurchased;
        this.shieldUsedInRound = false;
        this.partialPayoutBanked = 0;
        this.partialCashoutUsedOnRow = 0;

        this.isWheelActive = false;
        this.wheelSpinsRemaining = 0;
        this.wheelSpinIndex = 0;
        this.wheelRow = 0;
        this.wheelLane = 0;
        this.wheelPendingPick = null;

        this.currentRow = 1;
        this.currentMultiplier = 1.0;
        this.lastCrashedRow = null;
        this.lastCrashedLane = null;
        this.currentPicks = [];
        this.alienDestroyedRows.clear();
        this.persistState();

        // Deduct base wager from balance
        this.adjustBalance(-effectiveBet);

        this.emitStateChange(GameState.PLAYING);
        return true;
    }

    public getHazardsForActionRow(row: number): number[] {
        const hazards = deriveHazards(this.serverSeed, this.clientSeed, this.nonce, row, this.minesCount);
        if (typeof window !== 'undefined' && (window as any).__devGodMode) {
            return [];
        }
        return hazards;
    }

    public getSpecialsForRow(row: number): RowSpecialConfig {
        const specials = deriveRowSpecials(this.serverSeed, this.clientSeed, this.nonce, row, this.luckyBoost);
        if (typeof window !== 'undefined') {
            if ((window as any).__devForceSolar) {
                specials.goldenLane = 0;
                specials.goldenBoost = 1.5;
            }
            if ((window as any).__devForceAlien) {
                specials.alienLane = 2;
                specials.alienBoost = 2.0;
                specials.alienSkipRows = 2;
            }
            if ((window as any).__devForceWheel) {
                specials.wheelLane = 1;
            }
        }
        return specials;
    }

    public pickLane(laneIndex: number): RoundPick | null {
        if (this.state !== GameState.PLAYING) return null;
        if (this.isWheelActive) return null; // Cannot pick new lane while roulette is active
        if (!Number.isInteger(laneIndex) || laneIndex < 0 || laneIndex > 4) return null;

        const actingRow = this.currentRow;
        const isFirstStep = this.currentPicks.length === 0;

        const outcome = evaluateLanePick(
            this.serverSeed,
            this.clientSeed,
            this.nonce,
            actingRow,
            laneIndex,
            this.minesCount,
            false
        );

        // Developer Mode Overrides
        if (typeof window !== 'undefined') {
            if ((window as any).__devGodMode && !outcome.isSafe) {
                outcome.isSafe = true;
                outcome.hazards = outcome.hazards.filter((h) => h !== laneIndex);
            }
            if ((window as any).__devForceSolar && laneIndex === 0) {
                outcome.specialType = 'GOLDEN';
                outcome.boostFactor = 1.5;
            } else if ((window as any).__devForceAlien && laneIndex === 2) {
                outcome.specialType = 'ALIEN';
                outcome.boostFactor = 2.0;
                outcome.rowsSkipped = 2;
            } else if ((window as any).__devForceWheel && laneIndex === 1) {
                outcome.specialType = 'WHEEL';
                outcome.isSafe = true;
            }
        }

        this.lastChosenLane = laneIndex;

        // CASE 1: SAFE STEP
        if (outcome.isSafe) {
            // Special Case: WHEEL (Roulette) Box
            if (outcome.specialType === 'WHEEL') {
                this.isWheelActive = true;
                this.wheelSpinsRemaining = 1;
                this.wheelSpinIndex = 0;
                this.wheelRow = actingRow;
                this.wheelLane = laneIndex;

                const pick: RoundPick = {
                    row: actingRow,
                    lane: laneIndex,
                    isSafe: true,
                    shieldSaved: false,
                    specialType: 'WHEEL',
                    boostApplied: 1.0,
                    rowsSkipped: 0,
                    hazards: outcome.hazards,
                    stepMultiplierAfter: this.currentMultiplier
                };
                this.currentPicks.push(pick);
                this.wheelPendingPick = pick;

                this.stepListeners.forEach((fn) => fn(pick, this));
                this.wheelTriggerListeners.forEach((fn) => fn(actingRow, laneIndex, this));
                this.emitStateChange(GameState.PLAYING);
                return pick;
            }

            this.currentMultiplier = calculateNextStepMultiplier(
                this.currentMultiplier,
                this.minesCount,
                isFirstStep
            );
            if (outcome.boostFactor > 1.0) {
                this.currentMultiplier = Math.round(this.currentMultiplier * outcome.boostFactor * 10000) / 10000;
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

        // CASE 2: SHIELD ABSORPTION (Deflects 1 fatal mine hit and retains 50% multiplier!)
        if (this.hasActiveShield) {
            this.hasActiveShield = false;
            this.shieldUsedInRound = true;
            this.currentMultiplier = calculateShieldSaveMultiplier(this.currentMultiplier);

            const pick: RoundPick = {
                row: actingRow,
                lane: laneIndex,
                isSafe: false,
                shieldSaved: true,
                specialType: outcome.specialType,
                boostApplied: 1.0,
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

        // CASE 3: FATAL CRASH
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
        this.nonce++;
        this.persistState();

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
        this.nonce++;
        this.persistState();

        this.emitStateChange(GameState.WON);
        this.emitHistoryUpdate();
        this.cashoutListeners.forEach((fn) => fn(totalRoundPayout, effectiveFinalMult, this));

        return totalRoundPayout;
    }

    /**
     * Executes a spin of the Giant Prize Wheel (Ruleta) in accordance with Provably Fair math.
     */
    public spinWheel(): WheelSpinOutcome | null {
        if (!this.isWheelActive || this.wheelSpinsRemaining <= 0) return null;

        const outcome = deriveWheelSpinOutcome(
            this.serverSeed,
            this.clientSeed,
            this.nonce,
            this.wheelRow,
            this.wheelSpinIndex
        );
        this.wheelSpinIndex++;

        // Outcome Case 1: WIPEOUT (Nada - x0)
        if (outcome.segment.type === 'WIPEOUT') {
            this.currentMultiplier = 0.0;
            this.isWheelActive = false;
            this.wheelSpinsRemaining = 0;
            this.lastCrashedRow = this.wheelRow;
            this.lastCrashedLane = this.wheelLane;

            if (this.wheelPendingPick) {
                this.wheelPendingPick.isSafe = false;
                this.wheelPendingPick.stepMultiplierAfter = 0;
            }

            const summary: RoundSummary = {
                id: `rnd_${Date.now()}_${this.nonce}`,
                betAmount: this.betAmount,
                effectiveBet: this.initialEffectiveBet,
                minesCount: this.minesCount,
                clearedRows: Math.max(0, this.wheelRow - 1),
                finalMultiplier: 0.0,
                payout: 0.0,
                partialPayoutBanked: this.partialPayoutBanked,
                isWin: false,
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
            this.nonce++;
            this.persistState();

            this.wheelSpinListeners.forEach((fn) => fn(outcome, this));
            this.emitStateChange(GameState.CRASHED);
            this.emitHistoryUpdate();
            return outcome;
        }

        // Outcome Case 2: EXTRA SPIN (+1 Spin)
        if (outcome.segment.type === 'EXTRA_SPIN') {
            this.wheelSpinsRemaining += 1;
            this.wheelSpinListeners.forEach((fn) => fn(outcome, this));
            this.emitStateChange(GameState.PLAYING);
            return outcome;
        }

        // Outcome Case 3: SLOT ACCESS (Teaser placeholder)
        if (outcome.segment.type === 'SLOT') {
            this.wheelSpinsRemaining += 1;
            this.wheelSpinListeners.forEach((fn) => fn(outcome, this));
            this.emitStateChange(GameState.PLAYING);
            return outcome;
        }

        // Outcome Case 4: MULTIPLIER REWARDS (x0.2, x1.2, x2, x3, x5, x8, x10, x1000)
        const mult = outcome.segment.multiplier;
        if (this.currentMultiplier > 1.0) {
            // Apply on current round profit
            this.currentMultiplier = Math.round(this.currentMultiplier * mult * 10000) / 10000;
        } else {
            // First step or baseline without profit: apply on base bet
            this.currentMultiplier = Math.round(mult * 10000) / 10000;
        }

        if (this.wheelPendingPick) {
            this.wheelPendingPick.boostApplied = mult;
            this.wheelPendingPick.stepMultiplierAfter = this.currentMultiplier;
        }

        this.wheelSpinsRemaining--;
        if (this.wheelSpinsRemaining <= 0) {
            this.isWheelActive = false;
            this.currentRow = this.wheelRow + 1;
        }

        this.wheelSpinListeners.forEach((fn) => fn(outcome, this));
        this.emitStateChange(GameState.PLAYING);
        return outcome;
    }

    /**
     * Resets the game state back to IDLE at the starting base (Row 0 / Ready for Row 1)
     * for both the Victory (Cashout) and Loss ("TRY AGAIN") zero-friction retention loops.
     */
    public resetToIdle() {
        this.currentRow = 1;
        this.currentMultiplier = 1.0;
        this.lastChosenLane = 2;
        this.lastCrashedRow = null;
        this.lastCrashedLane = null;
        this.currentPicks = [];
        this.alienDestroyedRows.clear();
        this.emitStateChange(GameState.IDLE);
    }
}
