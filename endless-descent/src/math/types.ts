export enum GameState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    WON = 'WON',
    CRASHED = 'CRASHED'
}

export type LaneSpecialType = 'NONE' | 'GOLDEN' | 'ALIEN' | 'WHEEL';

export type SimulationStrategy =
    | 'normal'
    | 'golden_hunter'
    | 'alien_hunter'
    | 'shield_mode'
    | 'partial_cashout';

export type WheelPrizeType =
    | 'JACKPOT'      // x1000
    | 'HIGH_10'      // x10
    | 'COMMON_1_2'   // x1.2
    | 'MEDIUM_3'     // x3
    | 'LOW_RESCUE'   // x0.2
    | 'COMMON_2'     // x2
    | 'EXTRA_SPIN'   // +1 Spin
    | 'WIPEOUT'      // x0
    | 'SLOT'         // Slot spins access (placeholder)
    | 'COMMON_1_2B'  // x1.2
    | 'MEDIUM_5'     // x5
    | 'HIGH_8';      // x8

export interface WheelSegmentConfig {
    index: number;         // 0..11
    label: string;         // e.g. "x1000", "x10", "x0", "+1 SPIN", etc.
    type: WheelPrizeType;
    multiplier: number;    // Multiplier factor (0 for extra spin / wipeout)
    colorHex: string;
    isNearMissHighlight?: boolean;
}

export interface WheelSpinOutcome {
    segmentIndex: number;
    segment: WheelSegmentConfig;
    rawRoll: number;
    spinAngleRad: number;
    isNearMiss: boolean;
}

export interface RowSpecialConfig {
    row: number;
    goldenLane: number | null;
    goldenBoost: number;
    alienLane: number | null;
    alienBoost: number;
    alienSkipRows: number;
    wheelLane: number | null;
    catLane?: number | null;
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

// =============================================================================
// ARCADE MINI-SLOT (1x3) PROVABLY FAIR TYPES
// =============================================================================
export type SlotSymbolId = 'BLANK' | 'X4' | 'X8' | 'X10' | 'X28' | 'X88';
export type SlotReelOffset = 'CENTER' | 'UP' | 'DOWN';
export type SlotSpinProfile = 'NATURAL' | 'BONUS_BUY';

export interface SlotReelView {
    symbol: SlotSymbolId;
    offset: SlotReelOffset;
}

export interface SlotSpinOutcome {
    spinIndex: number;
    profile: SlotSpinProfile;
    isWin: boolean;
    symbol: SlotSymbolId;
    multiplier: number;
    reels: [SlotReelView, SlotReelView, SlotReelView];
    isNearMiss: boolean;
    nearMissSymbol?: SlotSymbolId;
}

export interface SlotBonusBundle {
    profile: SlotSpinProfile;
    totalSpins: number;
    spins: SlotSpinOutcome[];
    totalAccumulatedMultiplier: number;
    preMultiplier: number;
    finalMultiplier: number;
}

