import { generateHMAC, hashServerSeed, deriveRowSpecials } from './provablyFair';
import type { AuditRowResult, AuditRoundResult } from '../math/types';

/**
 * Verify whether an unhashed server seed matches a previously published SHA-256 hash.
 */
export function verifyServerSeedHash(serverSeed: string, expectedHash: string): boolean {
    const computedHash = hashServerSeed(serverSeed.trim());
    return computedHash.toLowerCase() === expectedHash.trim().toLowerCase();
}

/**
 * Audits a single row's hazard generation and special cards (Golden / Alien) with full cryptographic transparency.
 */
export function auditRow(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    minesCount: number,
    luckyBoost = false
): AuditRowResult {
    const message = `${clientSeed}:${nonce}:${row}`;
    const hmacHash = generateHMAC(serverSeed, clientSeed, nonce, row);

    const rawBytes: number[] = [];
    for (let i = 0; i < hmacHash.length; i += 2) {
        rawBytes.push(parseInt(hmacHash.substring(i, i + 2), 16));
    }

    const lanes = [0, 1, 2, 3, 4];
    const chosenHazards: number[] = [];
    let byteIndex = 0;

    for (let i = 0; i < minesCount; i++) {
        const numRemaining = lanes.length;
        let chosenIndex = -1;

        while (chosenIndex === -1 && byteIndex < 16) {
            const maxValidValue = 256 - (256 % numRemaining);
            const randByte = rawBytes[byteIndex];
            byteIndex++;

            if (randByte < maxValidValue) {
                chosenIndex = randByte % numRemaining;
            }
        }

        if (chosenIndex === -1) {
            chosenIndex = 0;
        }

        chosenHazards.push(lanes[chosenIndex]);
        lanes.splice(chosenIndex, 1);
    }

    const safeLanes = [0, 1, 2, 3, 4].filter((l) => !chosenHazards.includes(l));
    const specials = deriveRowSpecials(serverSeed, clientSeed, nonce, row, luckyBoost);

    return {
        row,
        message,
        hmacHash,
        rawBytes: rawBytes.slice(0, 12),
        chosenHazards,
        safeLanes,
        specials
    };
}

/**
 * Audits an entire round up to maxRows.
 */
export function auditPastRound(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    maxRows: number,
    minesCount: number,
    expectedHash?: string
): AuditRoundResult {
    const computedHash = hashServerSeed(serverSeed);
    const isHashValid = expectedHash ? verifyServerSeedHash(serverSeed, expectedHash) : true;

    const rows: AuditRowResult[] = [];
    for (let r = 1; r <= maxRows; r++) {
        rows.push(auditRow(serverSeed, clientSeed, nonce, r, minesCount));
    }

    return {
        serverSeed,
        serverSeedHash: computedHash,
        clientSeed,
        nonce,
        isHashValid,
        rows
    };
}
