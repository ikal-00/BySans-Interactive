export const MAX_PAYOUT = 250000;
export const MAX_MULTIPLIER = 1000000;
export const THEORETICAL_RTP = 0.96; // 96.00% Return to Player (4.00% House Edge)
export const THEORETICAL_HOUSE_EDGE = 0.04; // 4.00% House Edge
export const BTC_USD_RATE = 20000; // Simulated rate: 1 BTC = $20,000 (0.0125 BTC = $250.00)

/**
 * Calculates the exact multiplier for a given row and hazard count.
 * Multiplier Formula: floor(0.96 * ((5 / (5 - M)) ^ k) * 10000) / 10000
 * @param row The row index (k >= 1, 1-indexed)
 * @param mines The number of hazards (M in {1, 2, 3, 4})
 * @returns The exact multiplier truncated to 4 decimals
 */
export function calculateMultiplier(row: number, mines: number): number {
  if (row <= 0) return 1.0;
  if (mines < 1 || mines > 4) return 1.0;

  const baseProb = 5 / (5 - mines);
  const rawMult = THEORETICAL_RTP * Math.pow(baseProb, row);

  return Math.floor(rawMult * 10000) / 10000;
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
 * @param betAmount The player's wager
 * @param multiplier The current exact multiplier
 * @returns The capped payout amount
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
