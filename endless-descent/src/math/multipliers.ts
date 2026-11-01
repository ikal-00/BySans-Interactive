export const MAX_PAYOUT = 250000;
export const MAX_MULTIPLIER = 1000000;
export const THEORETICAL_RTP = 0.96; // 96.00% Return to Player (4.00% House Edge)
export const THEORETICAL_HOUSE_EDGE = 0.04; // 4.00% House Edge
export const BTC_USD_RATE = 20000; // Simulated rate: 1 BTC = $20,000 (0.0125 BTC = $250.00)
export const SHIELD_RETENTION_FACTOR = 0.50; // Deflecting a mine retains 50% of accumulated multiplier

/**
 * Calculates the baseline exact multiplier for a given row and hazard count (standard path).
 * Multiplier Formula: floor(0.96 * ((5 / (5 - M)) ^ k) * 10000) / 10000
 */
export function calculateMultiplier(row: number, mines: number): number {
    if (!Number.isFinite(row) || row <= 0) return 1.0;
    if (!Number.isFinite(mines) || mines < 1 || mines > 4) return 1.0;

    const baseProb = 5 / (5 - mines);
    const rawMult = THEORETICAL_RTP * Math.pow(baseProb, row);

    return Math.min(MAX_MULTIPLIER, Math.floor(rawMult * 10000) / 10000);
}

/**
 * Computes the exact lane survival probability given mines count M and optional boostFactor.
 * Safe probability: p_win = ((5 - M) / 5) / boostFactor.
 */
export function getLaneWinProbability(mines: number, boostFactor = 1.0): number {
    return ((5 - mines) / 5) / (boostFactor || 1.0);
}

/**
 * Computes the next accumulated multiplier after surviving a step.
 * Preserves exact 96.00% RTP (4.00% House Edge).
 */
export function calculateNextStepMultiplier(
    currentMultiplier: number,
    mines: number,
    isFirstStep: boolean
): number {
    const pWin = getLaneWinProbability(mines);
    const stepFactor = 1.0 / pWin;
    const rtpFactor = isFirstStep ? THEORETICAL_RTP : 1.0;
    const rawNext = currentMultiplier * stepFactor * rtpFactor;

    return Math.min(MAX_MULTIPLIER, Math.floor(rawNext * 10000) / 10000);
}

/**
 * Computes the multiplier after a Quantum Shield deflects a fatal mine impact.
 * Retains 50% of the accumulated multiplier (minimum 0.50x).
 */
export function calculateShieldSaveMultiplier(previousStepMultiplier: number): number {
    const retained = previousStepMultiplier * SHIELD_RETENTION_FACTOR;
    return Math.max(0.5, Math.floor(retained * 10000) / 10000);
}

/**
 * Calculates total effective wager including optional +25% Quantum Shield surcharge.
 */
export function calculateEffectiveBet(
    baseBet: number,
    _luckyBoost = false,
    shieldActive = false,
    _gameMode = 'base'
): number {
    const mult = shieldActive ? 1.25 : 1.0;
    return Math.round(baseBet * mult * 100) / 100;
}

/**
 * Calculates multiplier delta between row k and row k-1.
 */
export function calculateStepDelta(row: number, mines: number): number {
    if (row <= 0) return 0;
    const current = calculateMultiplier(row, mines);
    const prev = row === 1 ? 1.0 : calculateMultiplier(row - 1, mines);
    return Math.round((current - prev) * 100) / 100;
}

/**
 * Calculates payout and caps it at MAX_PAYOUT / MAX_MULTIPLIER.
 */
export function calculatePayout(betAmount: number, multiplier: number): number {
    let payout = betAmount * multiplier;

    if (multiplier > MAX_MULTIPLIER) {
        payout = betAmount * MAX_MULTIPLIER;
    }

    if (payout > MAX_PAYOUT) {
        payout = MAX_PAYOUT;
    }

    return Math.floor(payout * 100) / 100;
}

/**
 * Formats a multiplier to 2 decimals for UI display (e.g. 1.20x, 2.40x)
 */
export function formatMultiplier(mult: number): string {
    return `${mult.toFixed(2)}x`;
}

/**
 * Formats a USD amount to 2 decimals (e.g. $10.00)
 */
export function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Converts USD amount to simulated BTC amount string (e.g. 0.0125 BTC)
 */
export function formatBtc(usdAmount: number): string {
    const btc = usdAmount / BTC_USD_RATE;
    return `${btc.toFixed(4)} BTC`;
}
