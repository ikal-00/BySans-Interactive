import { deriveHazards } from './src/crypto/provablyFair';

function test() {
    const hazards = deriveHazards('server_seed_123', 'client_seed_456', 1, 1, 3);
    console.log("Hazards derived:", hazards);

    const hazards2 = deriveHazards('server_seed_123', 'client_seed_456', 1, 1, 3);
    if (JSON.stringify(hazards) !== JSON.stringify(hazards2)) {
        throw new Error("Mismatch! Should be deterministic.");
    } else {
        console.log("Deterministic check passed.");
    }
}

test();
