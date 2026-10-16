export enum GameState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    WON = 'WON',
    CRASHED = 'CRASHED'
}

export type LaneSpecialType = 'NONE' | 'GOLDEN' | 'ALIEN';

export type SimulationStrategy =
    | 'normal'
    | 'golden_hunter'
    | 'alien_hunter'
    | 'shield_mode'
    | 'partial_cashout';

export interface RowSpecialConfig {
    row: number;
    goldenLane: number | null;
    goldenBoost: number;
    alienLane: number | null;
    alienBoost: number;
    alienSkipRows: number;
}

export interface BonusConfig {
    luckyBoost: boolean;   // +25% bet: Dramatically increases Golden Cards & Alien UFO frequency
    shieldActive: boolean; // +25% bet: Grants 1-hit energy shield that absorbs a mine
}

export interface BetConfig {
    betAmount: number;
    minesCount: number;
    luckyBoost?: boolean;
    shieldActive?: boolean;
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
    shieldSaved: boolean;
    specialType: LaneSpecialType;
    boostApplied: number;
    rowsSkipped: number;
    hazards: number[];
    stepMultiplierAfter: number;
}

export interface RoundSummary {
    id: string;
    betAmount: number;
    effectiveBet: number;
    minesCount: number;
    clearedRows: number;
    finalMultiplier: number;
    payout: number;
    partialPayoutBanked: number;
    isWin: boolean;
    luckyBoost: boolean;
    shieldUsed: boolean;
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
    strategy?: SimulationStrategy;
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
    goldenHits: number;
    alienAttacks: number;
    shieldSaves: number;
    partialCashouts: number;
}

export interface AuditRowResult {
    row: number;
    message: string;
    hmacHash: string;
    rawBytes: number[];
    chosenHazards: number[];
    safeLanes: number[];
    specials: RowSpecialConfig;
}

export interface AuditRoundResult {
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
    isHashValid: boolean;
    rows: AuditRowResult[];
}
