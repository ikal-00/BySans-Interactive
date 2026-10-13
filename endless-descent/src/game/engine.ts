import { deriveHazards, generateServerSeed } from '../crypto/provablyFair';
import { calculateMultiplier, calculatePayout } from '../math/multipliers';

export enum GameState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    WON = 'WON',
    CRASHED = 'CRASHED'
}

export type StateChangeCallback = (state: GameState, engine: GameEngine) => void;
export type CashoutCallback = (payout: number, multiplier: number) => void;

export class GameEngine {
    public state: GameState = GameState.IDLE;
    public betAmount: number = 0;
    public minesCount: number = 3;

    public currentRow: number = 0; // The row player is currently deciding on. (1-indexed for math)

    // Provably fair config
    public serverSeed: string = '';
    public clientSeed: string = '';
    public previousServerSeed: string = '';
    public nonce: number = 0;

    public currentMultiplier: number = 1.0;

    private onStateChange: StateChangeCallback = () => {};
    private onCashout: CashoutCallback = () => {};

    constructor(serverSeed: string, clientSeed: string) {
        this.serverSeed = serverSeed;
        this.clientSeed = clientSeed;
    }

    public setCallbacks(onStateChange: StateChangeCallback, onCashout: CashoutCallback) {
        this.onStateChange = onStateChange;
        this.onCashout = onCashout;
    }

    private changeState(newState: GameState) {
        this.state = newState;
        this.onStateChange(this.state, this);
    }

    public startBet(betAmount: number, minesCount: number) {
        if (this.state !== GameState.IDLE && this.state !== GameState.WON && this.state !== GameState.CRASHED) return;
        if (betAmount <= 0) return;
        if (minesCount < 1 || minesCount > 4) return;

        this.betAmount = betAmount;
        this.minesCount = minesCount;
        this.currentRow = 1;
        this.currentMultiplier = 1.0;
        this.nonce++;

        this.changeState(GameState.PLAYING);
    }

    public getHazardsForActionRow(row: number): number[] {
        return deriveHazards(this.serverSeed, this.clientSeed, this.nonce, row, this.minesCount);
    }

    public pickLane(laneIndex: number): { isSafe: boolean, hazards: number[] } | null {
        if (this.state !== GameState.PLAYING) return null;
        if (laneIndex < 0 || laneIndex > 4) return null;

        const hazards = this.getHazardsForActionRow(this.currentRow);
        const isSafe = !hazards.includes(laneIndex);

        if (isSafe) {
            this.currentMultiplier = calculateMultiplier(this.currentRow, this.minesCount);
            this.currentRow++;
            this.onStateChange(GameState.PLAYING, this);
            return { isSafe: true, hazards };
        } else {
            // Explode
            this.previousServerSeed = this.serverSeed;
            this.serverSeed = generateServerSeed();
            this.changeState(GameState.CRASHED);
            return { isSafe: false, hazards };
        }
    }

    public cashout() {
        if (this.state !== GameState.PLAYING) return;
        if (this.currentRow <= 1) return; // Cannot cashout before making at least 1 move

        const payout = calculatePayout(this.betAmount, this.currentMultiplier);
        this.onCashout(payout, this.currentMultiplier);
        this.previousServerSeed = this.serverSeed;
        this.serverSeed = generateServerSeed();
        this.changeState(GameState.WON);
    }
}
