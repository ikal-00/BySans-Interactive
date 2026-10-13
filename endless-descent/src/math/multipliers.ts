export const MAX_PAYOUT = 250000;
export const MAX_MULTIPLIER = 1000000;
export const THEORETICAL_RTP = 0.99;

/**
 * Calculates the exact multiplier for a given row and hazard count.
 * Multiplier Formula: floor(0.99 * ((5 / (5 - M)) ^ k) * 10000) / 10000
 * @param row The row index (k >= 1, 1-indexed)
 * @param mines The number of hazards (M in {1, 2, 3, 4})
 * @returns The exact multiplier truncated to 4 decimals
 */
export function calculateMultiplier(row: number, mines: number): number {
  if (row <= 0) return 1.0;

  const baseProb = 5 / (5 - mines);
  const rawMult = THEORETICAL_RTP * Math.pow(baseProb, row);

  return Math.floor(rawMult * 10000) / 10000;
}

/**
 * Calculates payout and caps it at MAX_PAYOUT / MAX_MULTIPLIER.
 * @param betAmount The player's wager
 * @param multiplier The current exact multiplier
 * @returns The capped payout amount
 */
export function calculatePayout(betAmount: number, multiplier: number): number {
  let payout = betAmount * multiplier;

  // Cap at max multiplier
  if (multiplier > MAX_MULTIPLIER) {
      payout = betAmount * MAX_MULTIPLIER;
  }

  // Cap at max payout
  if (payout > MAX_PAYOUT) {
      payout = MAX_PAYOUT;
  }

  return payout;
}
