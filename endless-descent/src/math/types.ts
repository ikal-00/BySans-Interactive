export enum GameState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    WON = 'WON',
    CRASHED = 'CRASHED'
}

export interface BetConfig {
    betAmount: number;
    minesCount: number;
}

export interface GameConfig {
    laneCount: number;
    minMines: number;
    maxMines: number;
    theoreticalRTP: number;
    maxPayout: number;
    maxMultiplier: number;
}

export interface RoundPick {
    row: number;
    lane: number;
    isSafe: boolean;
    hazards: number[];
}

export interface RoundSummary {
    id: string;
    betAmount: number;
    minesCount: number;
    clearedRows: number;
    finalMultiplier: number;
    payout: number;
    isWin: boolean;
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
    picks: RoundPick[];
    timestamp: number;
}

export interface SimulationConfig {
    rounds: number;
    minesCount: number;
    targetCashoutRow: number;
    betAmount: number;
    mode?: 'fast' | 'crypto';
}

export interface SimulationResult {
    totalTurnover: number;
    totalPayout: number;
    rtp: number;
    theoreticalRtp: number;
    houseEdge: number;
    maxStreakWin: number;
    maxStreakLoss: number;
    wins: number;
    losses: number;
    winRate: number;
    variance: number;
    standardDeviation: number;
    durationMs: number;
    roundsPerSecond: number;
}

export interface AuditRowResult {
    row: number;
    message: string;
    hmacHash: string;
    rawBytes: number[];
    chosenHazards: number[];
    safeLanes: number[];
}

export interface AuditRoundResult {
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
    isHashValid: boolean;
    rows: AuditRowResult[];
}
