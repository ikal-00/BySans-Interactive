import CryptoJS from 'crypto-js';
import type { LaneSpecialType, RowSpecialConfig } from '../math/types';

const hmacBytesCache = new Map<string, number[]>();
const MAX_HMAC_CACHE_SIZE = 512;

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
    const bytes: number[] = new Array(32);
    for (let i = 0; i < 64; i += 2) {
        bytes[i >> 1] = parseInt(hash.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Cached 32-byte HMAC-SHA256 lookup for `(serverSeed, clientSeed, nonce, row)`.
 * Extracts raw bytes directly from CryptoJS 32-bit words (zero hex string slicing or parseInt overhead!).
 */
export function getCachedHmacBytes(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number
): number[] {
    const key = `${serverSeed}:${clientSeed}:${nonce}:${row}`;
    const cached = hmacBytesCache.get(key);
    if (cached) return cached;

    const digest = CryptoJS.HmacSHA256(`${clientSeed}:${nonce}:${row}`, serverSeed);
    const words = digest.words;
    const bytes: number[] = new Array(32);
    for (let i = 0; i < 8; i++) {
        const w = words[i];
        const base = i << 2;
        bytes[base] = (w >>> 24) & 0xff;
        bytes[base + 1] = (w >>> 16) & 0xff;
        bytes[base + 2] = (w >>> 8) & 0xff;
        bytes[base + 3] = w & 0xff;
    }

    if (hmacBytesCache.size >= MAX_HMAC_CACHE_SIZE) {
        const oldestKey = hmacBytesCache.keys().next().value;
        if (oldestKey !== undefined) hmacBytesCache.delete(oldestKey);
    }
    hmacBytesCache.set(key, bytes);
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
    const bytes = getCachedHmacBytes(serverSeed, clientSeed, nonce, row);

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
 * Pure base multipliers configuration (No golden boost, no alien skips).
 */
export function deriveRowSpecials(
    _serverSeed: string,
    _clientSeed: string,
    _nonce: number,
    row: number,
    _luckyBoost = false
): RowSpecialConfig {
    return {
        row,
        goldenLane: null,
        goldenBoost: 1.0,
        alienLane: null,
        alienBoost: 1.0,
        alienSkipRows: 0
    };
}

/**
 * Evaluates whether picking `lane` on `row` is safe.
 * Standard provably fair hazard derivation: if chosen lane contains a mine -> crash; otherwise -> safe step!
 */
export function evaluateLanePick(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    lane: number,
    minesCount: number,
    _luckyBoost = false
): {
    isSafe: boolean;
    specialType: LaneSpecialType;
    boostFactor: number;
    rowsSkipped: number;
    hazards: number[];
} {
    const baseHazards = deriveHazards(serverSeed, clientSeed, nonce, row, minesCount);
    const isSafe = !baseHazards.includes(lane);
    return {
        isSafe,
        specialType: 'NONE',
        boostFactor: 1.0,
        rowsSkipped: 0,
        hazards: baseHazards
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
