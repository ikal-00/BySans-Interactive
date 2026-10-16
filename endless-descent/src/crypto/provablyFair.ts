import CryptoJS from 'crypto-js';
import type { LaneSpecialType, RowSpecialConfig } from '../math/types';
import { getLaneWinProbability } from '../math/multipliers';

/**
 * Computes HMAC-SHA256 of the message using the given server seed.
 */
export function generateHMAC(serverSeed: string, clientSeed: string, nonce: number, row: number): string {
    const message = `${clientSeed}:${nonce}:${row}`;
    return CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
}

/**
 * Helper to parse 32 raw bytes from a 64-char hex HMAC hash.
 */
export function parseHashBytes(hash: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hash.length; i += 2) {
        bytes.push(parseInt(hash.substring(i, i + 2), 16));
    }
    return bytes;
}

/**
 * Derives hazard lanes for a given row.
 * Uses Fisher-Yates shuffle with exact byte consumption (bytes 0..15),
 * avoiding modulo bias by using rejection sampling.
 */
export function deriveHazards(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    minesCount: number
): number[] {
    const hash = generateHMAC(serverSeed, clientSeed, nonce, row);
    const bytes = parseHashBytes(hash);

    const lanes = [0, 1, 2, 3, 4];
    const hazards: number[] = [];

    let byteIndex = 0;

    for (let i = 0; i < minesCount; i++) {
        const numRemaining = lanes.length;
        let chosenIndex = -1;

        while (chosenIndex === -1) {
            if (byteIndex >= 16) {
                chosenIndex = 0;
                break;
            }

            const maxValidValue = 256 - (256 % numRemaining);
            const randByte = bytes[byteIndex];
            byteIndex++;

            if (randByte < maxValidValue) {
                chosenIndex = randByte % numRemaining;
            }
        }

        hazards.push(lanes[chosenIndex]);
        lanes.splice(chosenIndex, 1);
    }

    return hazards;
}

/**
 * Deterministically derives Golden Card (★) and Alien UFO (👽) special lanes for a row
 * using bytes 16..23 of the row's HMAC-SHA256 digest.
 */
export function deriveRowSpecials(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    luckyBoost = false
): RowSpecialConfig {
    const hash = generateHMAC(serverSeed, clientSeed, nonce, row);
    const bytes = parseHashBytes(hash);

    // Byte 16: Golden Card spawn roll (40% normal, 90% in Lucky Boost mode)
    const goldenThreshold = luckyBoost ? Math.floor(256 * 0.90) : Math.floor(256 * 0.40);
    const hasGolden = bytes[16] < goldenThreshold;

    let goldenLane: number | null = null;
    let goldenBoost = 2.0;

    if (hasGolden) {
        goldenLane = bytes[17] % 5;
        // In Lucky Boost mode or on high rolls, Golden Card can be 3.0x
        const isSuperGold = luckyBoost ? (bytes[18] < 110) : (bytes[18] < 50);
        goldenBoost = isSuperGold ? 3.0 : 2.0;
    }

    // Byte 19: Alien UFO Beacon spawn roll (22% normal, 65% in Lucky Boost mode)
    const alienThreshold = luckyBoost ? Math.floor(256 * 0.65) : Math.floor(256 * 0.22);
    const hasAlien = bytes[19] < alienThreshold;

    let alienLane: number | null = null;
    const alienBoost = 2.5;
    const alienSkipRows = 2;

    if (hasAlien) {
        const remainingLanes = [0, 1, 2, 3, 4].filter((l) => l !== goldenLane);
        alienLane = remainingLanes[bytes[20] % remainingLanes.length];
    }

    return {
        row,
        goldenLane,
        goldenBoost,
        alienLane,
        alienBoost,
        alienSkipRows
    };
}

/**
 * Evaluates whether picking `lane` on `row` is safe, taking into account
 * Golden Card or Alien UFO probability scaling so that EV = 96.00% RTP on every choice.
 */
export function evaluateLanePick(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    lane: number,
    minesCount: number,
    luckyBoost = false
): {
    isSafe: boolean;
    specialType: LaneSpecialType;
    boostFactor: number;
    rowsSkipped: number;
    hazards: number[];
} {
    const baseHazards = deriveHazards(serverSeed, clientSeed, nonce, row, minesCount);
    const specials = deriveRowSpecials(serverSeed, clientSeed, nonce, row, luckyBoost);

    let specialType: LaneSpecialType = 'NONE';
    let boostFactor = 1.0;
    let rowsSkipped = 0;

    if (specials.goldenLane === lane) {
        specialType = 'GOLDEN';
        boostFactor = specials.goldenBoost;
    } else if (specials.alienLane === lane) {
        specialType = 'ALIEN';
        boostFactor = specials.alienBoost;
        rowsSkipped = specials.alienSkipRows;
    }

    if (specialType === 'NONE') {
        const isSafe = !baseHazards.includes(lane);
        return {
            isSafe,
            specialType,
            boostFactor: 1.0,
            rowsSkipped: 0,
            hazards: baseHazards
        };
    }

    // For GOLDEN or ALIEN lanes: use 32-bit integer from bytes 24..27 for exact p_win = ((5 - M) / 5) / boostFactor
    const hash = generateHMAC(serverSeed, clientSeed, nonce, row);
    const bytes = parseHashBytes(hash);
    const uint32 =
        ((bytes[24] << 24) >>> 0) +
        ((bytes[25] << 16) >>> 0) +
        ((bytes[26] << 8) >>> 0) +
        (bytes[27] >>> 0);
    const u01 = uint32 / 0x100000000;

    const pWin = getLaneWinProbability(minesCount, boostFactor);
    const isSafe = u01 < pWin;

    // Ensure revealed hazards list reflects the special lane's outcome consistently
    const adjustedHazards = [...baseHazards];
    if (isSafe && adjustedHazards.includes(lane)) {
        const idx = adjustedHazards.indexOf(lane);
        const replacement = [0, 1, 2, 3, 4].find((l) => l !== lane && !adjustedHazards.includes(l));
        if (replacement !== undefined) adjustedHazards[idx] = replacement;
    } else if (!isSafe && !adjustedHazards.includes(lane)) {
        adjustedHazards[0] = lane;
    }

    return {
        isSafe,
        specialType,
        boostFactor,
        rowsSkipped: isSafe ? rowsSkipped : 0,
        hazards: adjustedHazards
    };
}

/**
 * Generate a cryptographically strong 64-char hex string for server seed
 */
export function generateServerSeed(): string {
    const words = CryptoJS.lib.WordArray.random(32);
    return words.toString(CryptoJS.enc.Hex);
}

/**
 * Generate a randomized client seed
 */
export function generateClientSeed(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < 16; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
}

/**
 * Hash the server seed using SHA-256 for public pre-round display
 */
export function hashServerSeed(serverSeed: string): string {
    return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}
