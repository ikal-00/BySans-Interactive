import * as THREE from 'three';

/**
 * Universal Asset URL resolver:
 * Safely resolves assets whether running in:
 * 1. Vite dev server (http://localhost:5173/)
 * 2. Static root deployment (http://example.com/index.html)
 * 3. Subfolder / nested path deployment (http://example.com/Stake/Interface/.../index.html)
 * 4. Local test server / file sandbox
 */
export function getAssetUrl(relativePath: string): string {
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

    // Vite injects import.meta.env.BASE_URL (configured as './' in vite.config.ts)
    let baseUrl = './';
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.BASE_URL === 'string') {
            baseUrl = import.meta.env.BASE_URL;
        }
    } catch {
        baseUrl = './';
    }

    const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return base + cleanPath;
}

/**
 * Robust texture loader with progressive path fallback:
 * Tries:
 *  1. getAssetUrl(path) (e.g. './assets/ship_albedo.png')
 *  2. './' + cleanPath
 *  3. cleanPath (relative to current document)
 *  4. '/' + cleanPath (root path fallback)
 */
export function loadTextureSafe(
    loader: THREE.TextureLoader,
    path: string,
    onSuccess: (tex: THREE.Texture) => void,
    onError?: (err: unknown) => void
): THREE.Texture {
    const clean = path.startsWith('/') ? path.slice(1) : path;
    const candidates = [
        getAssetUrl(clean),
        './' + clean,
        clean,
        '/' + clean
    ];
    const uniqueCandidates = Array.from(new Set(candidates));

    const tryCandidate = (index: number) => {
        if (index >= uniqueCandidates.length) {
            if (onError) onError(new Error(`[loadTextureSafe] Failed all candidate paths for ${path}`));
            return;
        }
        const url = uniqueCandidates[index];
        loader.load(
            url,
            (tex) => {
                onSuccess(tex);
            },
            undefined,
            () => {
                tryCandidate(index + 1);
            }
        );
    };

    return loader.load(
        uniqueCandidates[0],
        (t) => onSuccess(t),
        undefined,
        () => tryCandidate(1)
    );
}
