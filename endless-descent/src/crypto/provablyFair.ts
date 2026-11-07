import CryptoJS from 'crypto-js';
import type {
    LaneSpecialType,
    RowSpecialConfig,
    WheelSegmentConfig,
    WheelSpinOutcome,
    SlotSymbolId,
    SlotSpinProfile,
    SlotSpinOutcome,
    SlotBonusBundle,
    SlotReelView
} from '../math/types';
import { getLaneWinProbability } from '../math/multipliers';

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
 * Deterministically derives Orange / Solar Box (★) and Alien UFO (👽) special lanes for a row
 * using bytes 16..20 of the row's HMAC-SHA256 digest.
 */
export function deriveRowSpecials(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    luckyBoost = false
): RowSpecialConfig {
    const bytes = getCachedHmacBytes(serverSeed, clientSeed, nonce, row);

    // Byte 16: Orange Box spawn roll (natural occurrence: ~28% normal, ~70% in lucky boost)
    const goldenThreshold = luckyBoost ? Math.floor(256 * 0.70) : Math.floor(256 * 0.28);
    const hasGolden = bytes[16] < goldenThreshold;

    let goldenLane: number | null = null;
    let goldenBoost = 1.5;

    if (hasGolden) {
        goldenLane = bytes[17] % 5;
        // High rolls yield 2.0x
        const isSuperGold = bytes[18] < 64;
        goldenBoost = isSuperGold ? 2.0 : 1.5;
    }

    // Byte 19: Alien UFO Box spawn roll (more rare than orange: ~14% normal, ~45% in lucky boost)
    const alienThreshold = luckyBoost ? Math.floor(256 * 0.45) : Math.floor(256 * 0.14);
    const hasAlien = bytes[19] < alienThreshold;

    let alienLane: number | null = null;
    const alienBoost = 2.0;
    const alienSkipRows = 2;

    if (hasAlien) {
        const remainingLanes = [0, 1, 2, 3, 4].filter((l) => l !== goldenLane);
        alienLane = remainingLanes[bytes[20] % remainingLanes.length];
    }

    // Byte 23: Rare Prize Wheel (Ruleta) spawn roll (~5.5% normal, ~13% in lucky boost)
    const wheelThreshold = luckyBoost ? Math.floor(256 * 0.13) : Math.floor(256 * 0.055);
    const hasWheel = bytes[23] < wheelThreshold;

    let wheelLane: number | null = null;
    if (hasWheel) {
        const availForWheel = [0, 1, 2, 3, 4].filter((l) => l !== goldenLane && l !== alienLane);
        if (availForWheel.length > 0) {
            wheelLane = availForWheel[bytes[24] % availForWheel.length];
        }
    }

    const catLane: number | null = null;

    return {
        row,
        goldenLane,
        goldenBoost,
        alienLane,
        alienBoost,
        alienSkipRows,
        wheelLane,
        catLane
    };
}

/**
 * Evaluates whether picking `lane` on `row` is safe, taking into account
 * Orange (Solar) Box or Purple Alien UFO probability scaling so that EV = 96.00% RTP on every choice.
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
    } else if (specials.wheelLane === lane) {
        specialType = 'WHEEL';
        // Wheel crate has normal hazard probability
        const isSafe = !baseHazards.includes(lane);
        return {
            isSafe,
            specialType,
            boostFactor: 1.0,
            rowsSkipped: 0,
            hazards: baseHazards
        };
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

    // For GOLDEN (Orange) or ALIEN lanes: use 32-bit integer from bytes 24..27 for exact p_win = ((5 - M) / 5) / boostFactor
    const bytes = getCachedHmacBytes(serverSeed, clientSeed, nonce, row);
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

/**
 * The 12 segments of the Comic Prize Wheel matching Ruleta.jpeg:
 *  0: x1000 💎 Jackpot Imposible
 *  1: x10 ⭐ Premio Alto
 *  2: x1.2 ❓ Piso Común
 *  3: x3 ☘️ Premio Medio
 *  4: x0.2 ❓ Rescate Bajo
 *  5: x2 ❓ Piso Común
 *  6: +1 SPIN ☘️ Tirada Extra
 *  7: x0 💀 Wipeout (Nada)
 *  8: SLOT 🎰 Acceso a Slot (Placeholder)
 *  9: x1.2 ❓ Piso Común
 * 10: x5 ❓ Premio Medio
 * 11: x8 ☘️ Premio Alto
 */
export const WHEEL_SEGMENTS: WheelSegmentConfig[] = [
    { index: 0, label: 'x1000', type: 'JACKPOT', multiplier: 1000, colorHex: '#dc2626', isNearMissHighlight: true },
    { index: 1, label: 'x10', type: 'HIGH_10', multiplier: 10, colorHex: '#16a34a', isNearMissHighlight: true },
    { index: 2, label: 'x1.2', type: 'COMMON_1_2', multiplier: 1.2, colorHex: '#eab308' },
    { index: 3, label: 'x3', type: 'MEDIUM_3', multiplier: 3, colorHex: '#2563eb' },
    { index: 4, label: 'x0.2', type: 'LOW_RESCUE', multiplier: 0.2, colorHex: '#9333ea' },
    { index: 5, label: 'x2', type: 'COMMON_2', multiplier: 2, colorHex: '#eab308' },
    { index: 6, label: '+1 SPIN', type: 'EXTRA_SPIN', multiplier: 0, colorHex: '#ec4899' },
    { index: 7, label: 'x0', type: 'WIPEOUT', multiplier: 0, colorHex: '#991b1b' },
    { index: 8, label: 'SLOT', type: 'SLOT', multiplier: 0, colorHex: '#7c3aed' },
    { index: 9, label: 'x1.2', type: 'COMMON_1_2B', multiplier: 1.2, colorHex: '#eab308' },
    { index: 10, label: 'x5', type: 'MEDIUM_5', multiplier: 5, colorHex: '#dc2626' },
    { index: 11, label: 'x8', type: 'HIGH_8', multiplier: 8, colorHex: '#16a34a', isNearMissHighlight: true }
];

export const WHEEL_WEIGHTS_NATURAL = [
    8,    // 0: x1000 (0.08% Jackpot)
    250,  // 1: x10   (2.50%)
    1850, // 2: x1.2  (18.50%)
    750,  // 3: x3    (7.50%)
    1600, // 4: x0.2  (16.00%)
    1400, // 5: x2    (14.00%)
    500,  // 6: +1 SP (5.00%)
    1142, // 7: x0    (11.42%)
    300,  // 8: SLOT  (3.00%)
    1500, // 9: x1.2  (15.00%)
    400,  // 10: x5   (4.00%)
    300   // 11: x8   (3.00%)
]; // Sum = 10,000

/**
 * Perfil B: Ruleta Comprada (Bonus Buy Directo)
 * Probabilidad fuertemente castigada: El jugador comprador tiene una tasa de pérdida (Wipeout x0 y rescate bajo x0.2)
 * drásticamente superior (~66% entre x0 y x0.2), con Wipeout pasando de 11.42% a 38.00% y premios altos fuertemente reducidos.
 */
export const WHEEL_WEIGHTS_BONUS_BUY = [
    1,    // 0: x1000 (0.01% Ultra Jackpot)
    50,   // 1: x10   (0.50%)
    1000, // 2: x1.2  (10.00%)
    350,  // 3: x3    (3.50%)
    2800, // 4: x0.2  (28.00% Rescate Mínimo)
    700,  // 5: x2    (7.00%)
    50,   // 6: +1 SP (0.50% Tirada Extra)
    3800, // 7: x0    (38.00% Wipeout / Pérdida Total)
    19,   // 8: SLOT  (0.19% Entrada a Slot)
    1000, // 9: x1.2  (10.00%)
    150,  // 10: x5   (1.50%)
    80    // 11: x8   (0.80%)
]; // Sum = 10,000

export const WHEEL_WEIGHTS = WHEEL_WEIGHTS_NATURAL;

/**
 * Deterministically computes the provably fair outcome of spinning the Giant Prize Wheel.
 */
export function deriveWheelSpinOutcome(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    row: number,
    spinIndex = 0,
    profile: 'NATURAL' | 'BONUS_BUY' = 'NATURAL'
): WheelSpinOutcome {
    const message = `${clientSeed}:${nonce}:${row}:wheel:${spinIndex}:${profile}`;
    const hash = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
    const bytes = parseHashBytes(hash);

    // 32-bit roll in range [0, 10000)
    const uint32 =
        ((bytes[0] << 24) >>> 0) +
        ((bytes[1] << 16) >>> 0) +
        ((bytes[2] << 8) >>> 0) +
        (bytes[3] >>> 0);
    const rawRoll = uint32 / 0x100000000;
    const rollInt = Math.floor(rawRoll * 10000);

    const weights = profile === 'BONUS_BUY' ? WHEEL_WEIGHTS_BONUS_BUY : WHEEL_WEIGHTS_NATURAL;
    let accum = 0;
    let chosenSegmentIndex = 0;
    for (let i = 0; i < weights.length; i++) {
        accum += weights[i];
        if (rollInt < accum) {
            chosenSegmentIndex = i;
            break;
        }
    }

    // Developer QA override: force landing on SLOT (Sector 8)
    if (typeof window !== 'undefined' && (window as any).__devForceWheelSlot) {
        chosenSegmentIndex = 8;
    }

    const segment = WHEEL_SEGMENTS[chosenSegmentIndex];

    // Jitter inside sector: within +/- 0.35 of the segment's half-width to avoid resting on pegs
    const sectorAngle = (Math.PI * 2) / 12;
    const jitterNorm = ((bytes[4] / 255) - 0.5) * 0.7; // -0.35 .. +0.35
    const jitterAngle = jitterNorm * (sectorAngle * 0.5);

    // Base revolutions (6 full spins = 12 * Math.PI)
    const baseRevs = 6 + (bytes[5] % 3); // 6, 7, or 8 revolutions
    // Final target rotation angle for wheel: Sector 9 (x1.2 PISO) is at 12 o'clock at rotation 0
    const targetSectorsFromZero = ((chosenSegmentIndex - 9) % 12 + 12) % 12;
    const spinAngleRad = baseRevs * (Math.PI * 2) + targetSectorsFromZero * sectorAngle + jitterAngle;

    // Near-miss flag: when result is adjacent to the x1000 jackpot (segment 11 or segment 1),
    // landed on high multiplier (segment 10 = x5, segment 1 = x10, segment 0 = x1000),
    // or deterministically flagged for an agonizing near-miss suspense crawl (~45% of spins)
    const isNearMiss =
        chosenSegmentIndex === 1 ||
        chosenSegmentIndex === 11 ||
        chosenSegmentIndex === 10 ||
        chosenSegmentIndex === 0 ||
        (bytes[6] % 100 < 45);

    return {
        segmentIndex: chosenSegmentIndex,
        segment,
        rawRoll,
        spinAngleRad,
        isNearMiss
    };
}

// =============================================================================
// ARCADE MINI-SLOT (1x3 SINGLE-LINE) PROVABLY FAIR GENERATOR
// =============================================================================

export interface SlotSymbolConfig {
    symbol: SlotSymbolId;
    multiplier: number;
    weight: number;
}

/**
 * Conditional Weight Tables for the Arcade Mini-Slot (1x3 Single-Line):
 *
 * Perfil A: Entrada Natural (Desde la Ruleta)
 * EV altísimo. Reducción drástica del símbolo vacío (Blank). Conexiones medias frecuentes (x4 a x10),
 * y tasa baja pero presente de x28 y x88.
 */
export const SLOT_WEIGHTS_NATURAL: SlotSymbolConfig[] = [
    { symbol: 'BLANK', multiplier: 0,  weight: 1800 }, // 18.00%
    { symbol: 'X4',    multiplier: 4,  weight: 4200 }, // 42.00%
    { symbol: 'X8',    multiplier: 8,  weight: 2300 }, // 23.00%
    { symbol: 'X10',   multiplier: 10, weight: 1300 }, // 13.00%
    { symbol: 'X28',   multiplier: 28, weight: 360  }, //  3.60%
    { symbol: 'X88',   multiplier: 88, weight: 40   }  //  0.40%
]; // Sum = 10,000 | EV per spin = 6.18x

/**
 * Perfil B: Compra Directa (Bonus Buy Directo a Slot)
 * Volatilidad extrema (All-or-Nothing). 90% de los giros programados como tiradas muertas/desalineadas (Blanks).
 * Rescates frecuentes en x4, y probabilidad fraccional minúscula en x28 y x88.
 */
export const SLOT_WEIGHTS_BONUS_BUY: SlotSymbolConfig[] = [
    { symbol: 'BLANK', multiplier: 0,  weight: 9000 }, // 90.00%
    { symbol: 'X4',    multiplier: 4,  weight: 870  }, //  8.70%
    { symbol: 'X8',    multiplier: 8,  weight: 100  }, //  1.00%
    { symbol: 'X10',   multiplier: 10, weight: 25   }, //  0.25%
    { symbol: 'X28',   multiplier: 28, weight: 4    }, //  0.04%
    { symbol: 'X88',   multiplier: 88, weight: 1    }  //  0.01%
]; // Sum = 10,000 | EV per spin = 0.473x

/**
 * Generates the complete block of N spins for the 1x3 Arcade Mini-Slot
 * deterministically via HMAC_SHA256(ServerSeed, ClientSeed : Nonce : Stage) in Stage 2.
 */
export function generateSlotBonusSpins(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    profile: SlotSpinProfile = 'NATURAL',
    preMultiplier = 1.0,
    forcedSpinsCount?: number
): SlotBonusBundle {
    // Stage 2 metadata hash to determine spin count N (3 to 5 spins)
    const stageMessage = `${clientSeed}:${nonce}:STAGE_2_SLOT`;
    const metaHash = CryptoJS.HmacSHA256(`${stageMessage}:META`, serverSeed).toString(CryptoJS.enc.Hex);
    const metaBytes = parseHashBytes(metaHash);

    const totalSpins = forcedSpinsCount ?? (profile === 'NATURAL' ? 3 + (metaBytes[0] % 3) : 5);
    const spins: SlotSpinOutcome[] = [];
    const weights = profile === 'NATURAL' ? SLOT_WEIGHTS_NATURAL : SLOT_WEIGHTS_BONUS_BUY;

    for (let i = 0; i < totalSpins; i++) {
        const spinMessage = `${stageMessage}:${i}`;
        const spinHash = CryptoJS.HmacSHA256(spinMessage, serverSeed).toString(CryptoJS.enc.Hex);
        const bytes = parseHashBytes(spinHash);

        const uint32 =
            ((bytes[0] << 24) >>> 0) +
            ((bytes[1] << 16) >>> 0) +
            ((bytes[2] << 8) >>> 0) +
            (bytes[3] >>> 0);
        const rawRoll = uint32 / 0x100000000;
        const rollInt = Math.floor(rawRoll * 10000);

        let accum = 0;
        let chosen = weights[0];
        for (let w = 0; w < weights.length; w++) {
            accum += weights[w].weight;
            if (rollInt < accum) {
                chosen = weights[w];
                break;
            }
        }

        const isWin = chosen.symbol !== 'BLANK';
        let isNearMiss = false;
        let nearMissSymbol: SlotSymbolId | undefined;
        let reels: [SlotReelView, SlotReelView, SlotReelView];

        if (isWin) {
            // Winning spin: 3 identical symbols aligned on center payline!
            reels = [
                { symbol: chosen.symbol, offset: 'CENTER' },
                { symbol: chosen.symbol, offset: 'CENTER' },
                { symbol: chosen.symbol, offset: 'CENTER' }
            ];
        } else {
            // Losing spin: determine if this triggers a high-tension Near-Miss visual
            const nearMissRoll = bytes[4] % 100;
            isNearMiss = nearMissRoll < 55; // 55% of blanks trigger near-miss drama

            if (isNearMiss) {
                // Tease symbol: x88 (top prize) in 50% of near-misses, else x28 or x10
                const teaseRoll = bytes[5];
                nearMissSymbol = teaseRoll < 128 ? 'X88' : (teaseRoll < 192 ? 'X28' : 'X10');
                const offsetUpOrDown: 'UP' | 'DOWN' = (bytes[6] % 2 === 0) ? 'UP' : 'DOWN';

                // Reels 1 and 2 nail the jackpot/high symbol dead-center; Reel 3 misses by half a centimeter!
                reels = [
                    { symbol: nearMissSymbol, offset: 'CENTER' },
                    { symbol: nearMissSymbol, offset: 'CENTER' },
                    { symbol: nearMissSymbol, offset: offsetUpOrDown }
                ];
            } else {
                // Scattered blank (non-matching symbols, with varied offsets)
                const candidateSymbols: SlotSymbolId[] = ['X4', 'X8', 'X10', 'X28'];
                const s1 = candidateSymbols[bytes[7] % candidateSymbols.length];
                let s2 = candidateSymbols[bytes[8] % candidateSymbols.length];
                let s3 = candidateSymbols[bytes[9] % candidateSymbols.length];
                if (s1 === s2 && s2 === s3) {
                    s3 = candidateSymbols[(bytes[9] + 1) % candidateSymbols.length];
                }
                const off3: 'UP' | 'DOWN' | 'CENTER' =
                    bytes[10] % 3 === 0 ? 'UP' : (bytes[10] % 3 === 1 ? 'DOWN' : 'CENTER');
                reels = [
                    { symbol: s1, offset: 'CENTER' },
                    { symbol: s2, offset: 'CENTER' },
                    { symbol: s3, offset: off3 }
                ];
            }
        }

        spins.push({
            spinIndex: i,
            profile,
            isWin,
            symbol: chosen.symbol,
            multiplier: chosen.multiplier,
            reels,
            isNearMiss,
            nearMissSymbol
        });
    }

    const totalAccumulatedMultiplier = spins.reduce((sum, s) => sum + s.multiplier, 0);
    const finalMultiplier = Math.round(preMultiplier * totalAccumulatedMultiplier * 10000) / 10000;

    return {
        profile,
        totalSpins,
        spins,
        totalAccumulatedMultiplier,
        preMultiplier,
        finalMultiplier
    };
}

