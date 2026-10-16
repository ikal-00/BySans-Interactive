export const MAX_PAYOUT = 250000;
export const MAX_MULTIPLIER = 1000000;
export const THEORETICAL_RTP = 0.96; // 96.00% Return to Player (4.00% House Edge)
export const THEORETICAL_HOUSE_EDGE = 0.04; // 4.00% House Edge
export const SHIELD_RETENTION_FACTOR = 0.50; // Retains 50% of value when shield absorbs a mine
export const BTC_USD_RATE = 20000; // Simulated rate: 1 BTC = $20,000 (0.0125 BTC = $250.00)

/**
 * Calculates the baseline exact multiplier for a given row and hazard count (standard path).
 * Multiplier Formula: floor(0.96 * ((5 / (5 - M)) ^ k) * 10000) / 10000
 */
export function calculateMultiplier(row: number, mines: number): number {
    if (row <= 0) return 1.0;
    if (mines < 1 || mines > 4) return 1.0;

    const baseProb = 5 / (5 - mines);
    const rawMult = THEORETICAL_RTP * Math.pow(baseProb, row);

    return Math.floor(rawMult * 10000) / 10000;
}

/**
 * Computes the exact lane survival probability given mines count M and special boost factor G.
 * For normal lanes (G = 1), p_win = (5 - M) / 5.
 * For Golden (G = 2, 3) or Alien (G = 2.5) lanes, p_win = ((5 - M) / 5) / G.
 * This inverse proportionality keeps the Expected Value (EV) strictly invariant at 96.00% RTP.
 */
export function getLaneWinProbability(mines: number, boostFactor = 1.0): number {
    const baseSafeProb = (5 - mines) / 5;
    return Math.min(0.95, Math.max(0.02, baseSafeProb / boostFactor));
}

/**
 * Computes the next accumulated multiplier after surviving a step.
 * Preserves exact 96.00% RTP (4.00% House Edge) across Normal, Golden, Alien, and Shield states.
 */
export function calculateNextStepMultiplier(
    currentMultiplier: number,
    mines: number,
    isFirstStep: boolean,
    boostFactor = 1.0,
    hasActiveShield = false
): number {
    const pWin = getLaneWinProbability(mines, boostFactor);

    let stepFactor: number;
    if (hasActiveShield) {
        // Conservation of expectation with Shield:
        // pWin * stepFactor + (1 - pWin) * SHIELD_RETENTION_FACTOR = 1.0
        stepFactor = (1.0 - (1.0 - pWin) * SHIELD_RETENTION_FACTOR) / pWin;
    } else {
        stepFactor = 1.0 / pWin;
    }

    const rtpFactor = isFirstStep ? THEORETICAL_RTP : 1.0;
    const rawNext = currentMultiplier * stepFactor * rtpFactor;

    return Math.floor(rawNext * 10000) / 10000;
}

/**
 * Computes the resulting multiplier when an active Energy Shield absorbs a mine hit.
 */
export function calculateShieldSaveMultiplier(
    currentMultiplier: number,
    isFirstStep: boolean
): number {
    const rtpFactor = isFirstStep ? THEORETICAL_RTP : 1.0;
    const rawSaved = currentMultiplier * SHIELD_RETENTION_FACTOR * rtpFactor;
    return Math.floor(rawSaved * 10000) / 10000;
}

/**
 * Calculates total effective wager when Bonus de Suerte (+25%) or Escudo (+25%) are active.
 */
export function calculateEffectiveBet(
    baseBet: number,
    luckyBoost: boolean,
    shieldActive: boolean
): number {
    let mult = 1.0;
    if (luckyBoost) mult += 0.25;
    if (shieldActive) mult += 0.25;
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
