import CryptoJS from 'crypto-js';

/**
 * Computes HMAC-SHA256 of the message using the given server seed.
 */
export function generateHMAC(serverSeed: string, clientSeed: string, nonce: number, row: number): string {
    const message = `${clientSeed}:${nonce}:${row}`;
    return CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
}

/**
 * Derives hazard lanes for a given row.
 * Uses Fisher-Yates shuffle with exact byte consumption per standard provably fair algos.
 * avoiding modulo bias by using rejection sampling.
 */
export function deriveHazards(serverSeed: string, clientSeed: string, nonce: number, row: number, minesCount: number): number[] {
    const hash = generateHMAC(serverSeed, clientSeed, nonce, row);

    // We parse bytes from the hex hash
    const bytes: number[] = [];
    for (let i = 0; i < hash.length; i += 2) {
        bytes.push(parseInt(hash.substring(i, i + 2), 16));
    }

    const lanes = [0, 1, 2, 3, 4];
    const hazards: number[] = [];

    let byteIndex = 0;

    // Pick minesCount hazards
    for (let i = 0; i < minesCount; i++) {
        // We are drawing an item from the remaining lanes (which has length `lanes.length`)
        const numRemaining = lanes.length;

        let chosenIndex = -1;
        while (chosenIndex === -1) {
             if (byteIndex >= bytes.length) {
                 // Fallback if we run out of bytes (rare for a 32-byte hash when drawing up to 4 items out of 5)
                 // A true implementation might hash the hash again, but 32 bytes is way more than enough
                 // to pick 4 items from 5 with rejection sampling.
                 break;
             }

             // rejection sampling: to pick from numRemaining evenly, we need a max value that is a multiple of numRemaining
             const maxValidValue = 256 - (256 % numRemaining);
             const randByte = bytes[byteIndex];
             byteIndex++;

             if (randByte < maxValidValue) {
                 chosenIndex = randByte % numRemaining;
             }
        }

        // Safety fallback if byte array exhausted
        if (chosenIndex === -1) {
            chosenIndex = 0; // deterministic fallback
        }

        hazards.push(lanes[chosenIndex]);
        lanes.splice(chosenIndex, 1);
    }

    return hazards;
}

/**
 * Generate a random 64-char hex string for server seed
 */
export function generateServerSeed(): string {
    const words = CryptoJS.lib.WordArray.random(32);
    return words.toString(CryptoJS.enc.Hex);
}

/**
 * Hash the server seed for public display
 */
export function hashServerSeed(serverSeed: string): string {
    return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}
