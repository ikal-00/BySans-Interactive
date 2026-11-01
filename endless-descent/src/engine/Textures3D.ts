import * as THREE from 'three';

export interface PBRTexturePack {
    hullColor: THREE.CanvasTexture;
    hullBump: THREE.CanvasTexture;
    hullRoughness: THREE.CanvasTexture;
    windshieldEyesTex: THREE.CanvasTexture;
    platformColor: THREE.CanvasTexture;
    platformBump: THREE.CanvasTexture;
    archBump: THREE.CanvasTexture;
    brickWallColor: THREE.CanvasTexture;
    asphaltColor: THREE.CanvasTexture;
    paintSplatterTex: THREE.CanvasTexture;
    cartoonCloudTex: THREE.CanvasTexture;
    nebulaPillarTex: THREE.CanvasTexture;
    nebulaVeilTex: THREE.CanvasTexture;
    chainLinkTex: THREE.CanvasTexture;
    glassCardTex: THREE.CanvasTexture;
    cardboardBoxTex: THREE.Texture;
    cardboardBoxTopTex: THREE.Texture;
    cardboardOrangeBoxTex: THREE.Texture;
    cardboardOrangeBoxTopTex: THREE.Texture;
    cardboardAlienBoxTex: THREE.Texture;
    cardboardAlienBoxTopTex: THREE.Texture;
    miniSunTex: THREE.CanvasTexture;
    alienSymbolTex: THREE.CanvasTexture;
    dollarBillTex: THREE.CanvasTexture;
    particleGlow: THREE.CanvasTexture;
    asteroidColor: THREE.CanvasTexture;
    asteroidBump: THREE.CanvasTexture;
    asteroidRoughness: THREE.CanvasTexture;
    hologramGateTex: THREE.CanvasTexture;
    supernovaFlareTex: THREE.CanvasTexture;
    planetGasGiantTex: THREE.CanvasTexture;
    planetIceWorldTex: THREE.CanvasTexture;
    planetLavaWorldTex: THREE.CanvasTexture;
    planetCityLightsTex: THREE.CanvasTexture;
    planetCloudsTex: THREE.CanvasTexture;
    planetRingTex: THREE.CanvasTexture;
    hdrEnvEquirectTex: THREE.CanvasTexture;
    toonGradientMap: THREE.DataTexture;
}

// =============================================================================
// FAST DETERMINISTIC MULTI-OCTAVE PERLIN/VALUE FBM, RIDGED NOISE & WORLEY CRATERS
// Synthesizes photorealistic NASA / JWST-grade planetary, nebula & asteroid maps
// =============================================================================
const PERM = new Uint8Array(512);
const GRAD_X = new Float32Array(256);
const GRAD_Y = new Float32Array(256);
(() => {
    let seed = 1337420;
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        const tmp = p[i];
        p[i] = p[j];
        p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
        PERM[i] = p[i & 255];
    }
    for (let i = 0; i < 256; i++) {
        const angle = (i / 256) * Math.PI * 2;
        GRAD_X[i] = Math.cos(angle);
        GRAD_Y[i] = Math.sin(angle);
    }
})();

function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
}

/**
 * Seamless tileable 2D Gradient Noise in range [-1, 1]
 */
function noise2D(x: number, y: number, periodX = 256, periodY = 256): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    const X0 = ((xi % periodX) + periodX) % periodX & 255;
    const Y0 = ((yi % periodY) + periodY) % periodY & 255;
    const X1 = (((xi + 1) % periodX) + periodX) % periodX & 255;
    const Y1 = (((yi + 1) % periodY) + periodY) % periodY & 255;

    const u = fade(xf);
    const v = fade(yf);

    const g00 = PERM[X0 + PERM[Y0]];
    const g10 = PERM[X1 + PERM[Y0]];
    const g01 = PERM[X0 + PERM[Y1]];
    const g11 = PERM[X1 + PERM[Y1]];

    const n00 = GRAD_X[g00] * xf + GRAD_Y[g00] * yf;
    const n10 = GRAD_X[g10] * (xf - 1) + GRAD_Y[g10] * yf;
    const n01 = GRAD_X[g01] * xf + GRAD_Y[g01] * (yf - 1);
    const n11 = GRAD_X[g11] * (xf - 1) + GRAD_Y[g11] * (yf - 1);

    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

/**
 * Multi-Octave Fractional Brownian Motion (fBm) in range [0, 1]
 */
function fbm2D(
    x: number,
    y: number,
    octaves = 5,
    lacunarity = 2.0,
    gain = 0.5,
    periodX = 256,
    periodY = 256
): number {
    let total = 0;
    let amp = 0.5;
    let freq = 1.0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
        total += amp * noise2D(x * freq, y * freq, Math.round(periodX * freq), Math.round(periodY * freq));
        norm += amp;
        amp *= gain;
        freq *= lacunarity;
    }
    return THREE.MathUtils.clamp((total / norm) * 0.5 + 0.5, 0, 1);
}

/**
 * Ridged Multifractal Noise for sharp mountain chains, nebula filaments & tectonic cracks [0, 1]
 */
function ridgedFbm2D(x: number, y: number, octaves = 5, periodX = 256, periodY = 256): number {
    let total = 0;
    let amp = 0.5;
    let freq = 1.0;
    let weight = 1.0;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
        let signal = 1.0 - Math.abs(noise2D(x * freq, y * freq, Math.round(periodX * freq), Math.round(periodY * freq)));
        signal = signal * signal * weight;
        weight = THREE.MathUtils.clamp(signal * 2.0, 0, 1);
        total += signal * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2.05;
    }
    return THREE.MathUtils.clamp(total / norm, 0, 1);
}

/**
 * Generates all procedural AAA Photorealistic [SPACE-OVERDRIVE V4] PBR & HDR Cosmic Void Textures:
 * - Photorealistic Domain-WarpedJWST/Hubble Volumetric Nebula Filaments (`cartoonCloudTex`, `nebulaPillarTex`, `nebulaVeilTex`)
 * - Photorealistic Regolith & Cratered Asteroid Albedo, Bump & Roughness Maps (`asteroidColor`, `asteroidBump`, `asteroidRoughness`)
 * - Photorealistic High-Res Planetary Maps (`planetGasGiantTex`, `planetIceWorldTex`, `planetLavaWorldTex`, `planetCityLightsTex`, `planetCloudsTex`, `planetRingTex`)
 */
export function createPBRTexturePack(): PBRTexturePack {
    // =========================================================================
    // 1. AAA SCI-FI CERAMIC WHITE & DARK CARBON COMPOSITE HULL (512x512)
    // =========================================================================
    const hullColorCanvas = document.createElement('canvas');
    hullColorCanvas.width = 512;
    hullColorCanvas.height = 512;
    const hCtx = hullColorCanvas.getContext('2d')!;

    // 1A. Satin Pristine Ceramic White Base
    const hullGrad = hCtx.createLinearGradient(0, 0, 512, 512);
    hullGrad.addColorStop(0, '#f8fafc');
    hullGrad.addColorStop(0.5, '#e2e8f0');
    hullGrad.addColorStop(1, '#cbd5e1');
    hCtx.fillStyle = hullGrad;
    hCtx.fillRect(0, 0, 512, 512);

    // Subtle composite fiber weave (matte, non-glare)
    hCtx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let y = 0; y < 512; y += 4) {
        hCtx.fillRect(0, y, 512, 1.5);
    }

    // 1B. Dark Carbon / Gunmetal Armor Insets
    const darkPlates = [
        [24, 24, 216, 180],
        [272, 24, 216, 180],
        [36, 234, 440, 110],
        [48, 368, 196, 120],
        [268, 368, 196, 120]
    ];
    for (const [x, y, w, h] of darkPlates) {
        // Dark carbon plate fill
        hCtx.fillStyle = '#0f172a';
        hCtx.fillRect(x, y, w, h);

        // Carbon fiber micro-weave
        hCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let py = y + 3; py < y + h - 3; py += 4) {
            hCtx.fillRect(x + 3, py, w - 6, 1.5);
        }

        // Inner beveled stroke
        hCtx.strokeStyle = '#1e293b';
        hCtx.lineWidth = 3;
        hCtx.strokeRect(x, y, w, h);

        // Cyan LED Seam Glow along borders
        hCtx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        hCtx.lineWidth = 2;
        hCtx.beginPath();
        hCtx.moveTo(x + 8, y + 2);
        hCtx.lineTo(x + w - 8, y + 2);
        hCtx.stroke();
    }

    // 1C. Technical Stencils and Chevron Indicators
    hCtx.fillStyle = '#0f172a';
    hCtx.font = '900 18px sans-serif';
    hCtx.fillText('EXP-07', 38, 52);
    hCtx.fillText('BYSANS', 384, 52);

    // Cyan circuit indicator lines
    hCtx.strokeStyle = '#00f0ff';
    hCtx.lineWidth = 3;
    hCtx.beginPath();
    hCtx.moveTo(40, 214);
    hCtx.lineTo(160, 214);
    hCtx.lineTo(190, 226);
    hCtx.stroke();

    hCtx.beginPath();
    hCtx.moveTo(472, 214);
    hCtx.lineTo(352, 214);
    hCtx.lineTo(322, 226);
    hCtx.stroke();

    // =========================================================================
    // 2. HIGH-TECH FACETED CRYSTALLINE COCKPIT CANOPY (512x256)
    // =========================================================================
    const eyesCanvas = document.createElement('canvas');
    eyesCanvas.width = 512;
    eyesCanvas.height = 256;
    const eCtx = eyesCanvas.getContext('2d')!;

    // Deep polarized obsidian / cyber-cyan background
    const glassGrad = eCtx.createLinearGradient(0, 0, 512, 256);
    glassGrad.addColorStop(0, '#06101e');
    glassGrad.addColorStop(0.5, '#0b1d35');
    glassGrad.addColorStop(1, '#06101e');
    eCtx.fillStyle = glassGrad;
    eCtx.fillRect(0, 0, 512, 256);

    // Faceted geometric grid / hexagonal crystalline lattice
    eCtx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    eCtx.lineWidth = 2;
    const hexSize = 28;
    for (let hy = 0; hy < 256; hy += hexSize * 1.5) {
        for (let hx = 0; hx < 512; hx += hexSize * Math.sqrt(3)) {
            const cx = hx + ((Math.floor(hy / (hexSize * 1.5)) % 2) * (hexSize * Math.sqrt(3)) / 2);
            eCtx.beginPath();
            for (let a = 0; a < 6; a++) {
                const angle = (a * Math.PI) / 3;
                const px = cx + hexSize * 0.55 * Math.cos(angle);
                const py = hy + hexSize * 0.55 * Math.sin(angle);
                if (a === 0) eCtx.moveTo(px, py);
                else eCtx.lineTo(px, py);
            }
            eCtx.closePath();
            eCtx.stroke();
        }
    }

    // Central structural mullion strut
    eCtx.fillStyle = '#0f172a';
    eCtx.fillRect(248, 0, 16, 256);
    eCtx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    eCtx.lineWidth = 2;
    eCtx.strokeRect(248, 0, 16, 256);

    // Subtle soft diagonal reflection sheen
    eCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    eCtx.beginPath();
    eCtx.moveTo(100, 256);
    eCtx.lineTo(210, 0);
    eCtx.lineTo(250, 0);
    eCtx.lineTo(140, 256);
    eCtx.closePath();
    eCtx.fill();

    // Thick outer dark frame border
    eCtx.strokeStyle = '#050a14';
    eCtx.lineWidth = 12;
    eCtx.strokeRect(6, 6, 500, 244);

    const hullBumpCanvas = document.createElement('canvas');
    hullBumpCanvas.width = 256;
    hullBumpCanvas.height = 256;
    const hbCtx = hullBumpCanvas.getContext('2d')!;
    hbCtx.fillStyle = '#808080';
    hbCtx.fillRect(0, 0, 256, 256);
    hbCtx.strokeStyle = '#ffffff';
    hbCtx.lineWidth = 3;
    hbCtx.strokeRect(10, 10, 236, 236);
    hbCtx.strokeStyle = '#202020';
    hbCtx.lineWidth = 2;
    hbCtx.strokeRect(128, 10, 2, 236);
    for (let y = 24; y < 232; y += 18) {
        hbCtx.fillStyle = '#ffffff';
        hbCtx.fillRect(24, y, 56, 5);
        hbCtx.fillRect(176, y, 56, 5);
    }

    const hullRoughCanvas = document.createElement('canvas');
    hullRoughCanvas.width = 256;
    hullRoughCanvas.height = 256;
    const hrCtx = hullRoughCanvas.getContext('2d')!;
    // Soft satin/matte roughness (eliminates harsh glare/overwhelming shine)
    hrCtx.fillStyle = '#9e9e9e';
    hrCtx.fillRect(0, 0, 256, 256);

    // =========================================================================
    // 3. SCI-FI QUANTUM CARD FRAME TEXTURE (256x256)
    // =========================================================================
    const platColorCanvas = document.createElement('canvas');
    platColorCanvas.width = 256;
    platColorCanvas.height = 256;
    const pCtx = platColorCanvas.getContext('2d')!;
    pCtx.fillStyle = '#090f1d';
    pCtx.fillRect(0, 0, 256, 256);

    const platBumpCanvas = document.createElement('canvas');
    platBumpCanvas.width = 128;
    platBumpCanvas.height = 128;
    const pbCtx = platBumpCanvas.getContext('2d')!;
    pbCtx.fillStyle = '#808080';
    pbCtx.fillRect(0, 0, 128, 128);

    const brickCanvas = document.createElement('canvas');
    brickCanvas.width = 128;
    brickCanvas.height = 128;
    const bCtx = brickCanvas.getContext('2d')!;
    bCtx.fillStyle = '#03060d';
    bCtx.fillRect(0, 0, 128, 128);

    const archBumpCanvas = document.createElement('canvas');
    archBumpCanvas.width = 128;
    archBumpCanvas.height = 128;
    const abCtx = archBumpCanvas.getContext('2d')!;
    abCtx.fillStyle = '#808080';
    abCtx.fillRect(0, 0, 128, 128);

    const asphaltCanvas = document.createElement('canvas');
    asphaltCanvas.width = 128;
    asphaltCanvas.height = 128;
    const aCtx = asphaltCanvas.getContext('2d')!;
    aCtx.fillStyle = '#02050b';
    aCtx.fillRect(0, 0, 128, 128);

    // =========================================================================
    // 4. HAND-DRAWN CEL-SHADED COMIC METEORITE TEXTURE (Matches Reference Image 4)
    //    Chiseled slate-blue facets, heavy black comic shadows, ink hatching (///) & rust spots!
    // =========================================================================
    const astW = 512;
    const astH = 512;
    const astColorCanvas = document.createElement('canvas');
    astColorCanvas.width = astW;
    astColorCanvas.height = astH;
    const acCtx = astColorCanvas.getContext('2d')!;

    const astBumpCanvas = document.createElement('canvas');
    astBumpCanvas.width = astW;
    astBumpCanvas.height = astH;
    const abmCtx = astBumpCanvas.getContext('2d')!;

    const astRoughCanvas = document.createElement('canvas');
    astRoughCanvas.width = astW;
    astRoughCanvas.height = astH;
    const arCtx = astRoughCanvas.getContext('2d')!;

    // Base cel-shaded slate-blue rock fill
    acCtx.fillStyle = '#4a5d73';
    acCtx.fillRect(0, 0, astW, astH);

    // Chiseled angular polygon facets (Lit Slate, Mid Steel, Deep Shadow, Pure Black Comic Shadow)
    const comicFacets: Array<{ pts: [number, number][]; fill: string; hatch?: boolean }> = [
        { pts: [[0, 0], [180, 0], [140, 130], [0, 110]], fill: '#657e99' },
        { pts: [[180, 0], [360, 0], [310, 150], [140, 130]], fill: '#3d4f63', hatch: true },
        { pts: [[360, 0], [512, 0], [512, 140], [310, 150]], fill: '#080b11' },
        { pts: [[0, 110], [140, 130], [190, 270], [40, 290], [0, 240]], fill: '#576f88' },
        { pts: [[140, 130], [310, 150], [270, 290], [190, 270]], fill: '#070a10', hatch: true },
        { pts: [[310, 150], [512, 140], [512, 310], [390, 320], [270, 290]], fill: '#475a70', hatch: true },
        { pts: [[0, 240], [40, 290], [190, 270], [150, 410], [0, 390]], fill: '#080b11', hatch: true },
        { pts: [[190, 270], [270, 290], [340, 420], [150, 410]], fill: '#627b96' },
        { pts: [[270, 290], [390, 320], [512, 310], [512, 440], [340, 420]], fill: '#283545', hatch: true },
        { pts: [[0, 390], [150, 410], [170, 512], [0, 512]], fill: '#4c6078' },
        { pts: [[150, 410], [340, 420], [350, 512], [170, 512]], fill: '#070a10', hatch: true },
        { pts: [[340, 420], [512, 440], [512, 512], [350, 512]], fill: '#5b738c' }
    ];

    for (const f of comicFacets) {
        acCtx.beginPath();
        f.pts.forEach(([px, py], idx) => {
            if (idx === 0) acCtx.moveTo(px, py);
            else acCtx.lineTo(px, py);
        });
        acCtx.closePath();
        acCtx.fillStyle = f.fill;
        acCtx.fill();

        // Diagonal comic ink hatching strokes (///) inside shaded facets
        if (f.hatch) {
            acCtx.save();
            acCtx.clip();
            acCtx.strokeStyle = '#06080e';
            acCtx.lineWidth = 2.6;
            for (let d = -512; d < 1024; d += 11) {
                acCtx.beginPath();
                acCtx.moveTo(d, 0);
                acCtx.lineTo(d + 220, 512);
                acCtx.stroke();
            }
            acCtx.restore();
        }
    }

    // Subtle rusty-ochre weathering patches near lit ridges (exactly like Image 4)
    const rustSpots: Array<[number, number, number, number]> = [
        [85, 62, 26, 14],
        [112, 84, 18, 11],
        [68, 185, 32, 16],
        [235, 345, 28, 15],
        [425, 215, 24, 12],
        [448, 468, 22, 13]
    ];
    for (const [rx, ry, rw, rh] of rustSpots) {
        acCtx.save();
        acCtx.translate(rx, ry);
        acCtx.rotate(0.42);
        acCtx.fillStyle = 'rgba(148, 78, 44, 0.72)';
        acCtx.beginPath();
        acCtx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
        acCtx.fill();
        acCtx.fillStyle = 'rgba(176, 98, 54, 0.55)';
        acCtx.beginPath();
        acCtx.ellipse(rw * 0.25, -rh * 0.2, rw * 0.45, rh * 0.45, 0, 0, Math.PI * 2);
        acCtx.fill();
        acCtx.restore();
    }

    // Bold hand-drawn black comic ink ridge lines between facets
    acCtx.strokeStyle = '#05070c';
    acCtx.lineWidth = 5.5;
    acCtx.lineJoin = 'bevel';
    acCtx.lineCap = 'round';
    for (const f of comicFacets) {
        acCtx.beginPath();
        f.pts.forEach(([px, py], idx) => {
            if (idx === 0) acCtx.moveTo(px, py);
            else acCtx.lineTo(px, py);
        });
        acCtx.closePath();
        acCtx.stroke();
    }

    // Neutral flat bump and matte comic roughness maps
    abmCtx.fillStyle = '#808080';
    abmCtx.fillRect(0, 0, astW, astH);
    arCtx.fillStyle = '#dcdcdc';
    arCtx.fillRect(0, 0, astW, astH);

    // =========================================================================
    // 5. FLOATING CRYSTALLINE SCI-FI GLASS MULTIPLIER CARD TEXTURE (512x340)
    // =========================================================================
    const glassCardCanvas = document.createElement('canvas');
    glassCardCanvas.width = 512;
    glassCardCanvas.height = 340;
    const gcCtx = glassCardCanvas.getContext('2d')!;
    gcCtx.clearRect(0, 0, 512, 340);

    const gcGrad = gcCtx.createLinearGradient(0, 0, 512, 340);
    gcGrad.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
    gcGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.54)');
    gcGrad.addColorStop(1, 'rgba(0, 240, 255, 0.36)');
    gcCtx.fillStyle = gcGrad;
    gcCtx.fillRect(8, 8, 496, 324);

    gcCtx.fillStyle = 'rgba(255, 255, 255, 0.30)';
    gcCtx.beginPath();
    gcCtx.moveTo(70, 332);
    gcCtx.lineTo(190, 8);
    gcCtx.lineTo(245, 8);
    gcCtx.lineTo(125, 332);
    gcCtx.closePath();
    gcCtx.fill();

    gcCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    gcCtx.beginPath();
    gcCtx.moveTo(275, 332);
    gcCtx.lineTo(395, 8);
    gcCtx.lineTo(425, 8);
    gcCtx.lineTo(305, 332);
    gcCtx.closePath();
    gcCtx.fill();

    gcCtx.strokeStyle = 'rgba(224, 242, 254, 0.88)';
    gcCtx.lineWidth = 4;
    gcCtx.strokeRect(10, 10, 492, 320);

    gcCtx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    gcCtx.lineWidth = 2;
    gcCtx.strokeRect(24, 24, 464, 292);

    gcCtx.beginPath();
    gcCtx.moveTo(256, 48);
    gcCtx.lineTo(376, 170);
    gcCtx.lineTo(256, 292);
    gcCtx.lineTo(136, 170);
    gcCtx.closePath();
    gcCtx.stroke();

    gcCtx.beginPath();
    gcCtx.arc(256, 170, 48, 0, Math.PI * 2);
    gcCtx.stroke();

    // =========================================================================
    // 5B. CLASSIC CARTOON 3D WOODEN/CARDBOARD MYSTERY CRATES & MINI SUN (512x512)
    // =========================================================================
    function createCardboardBoxCanvas(type: 'normal' | 'orange' | 'alien'): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        let p1: string, p2: string, p3: string, p4: string;
        let frameC: string, frameHi: string, frameSh: string;
        let inkC: string, tapeC: string, tapeHi: string;
        let haloC: string, qFill: string;

        if (type === 'orange') {
            p1 = '#c2410c'; p2 = '#ea580c'; p3 = '#b45309'; p4 = '#9a3412';
            frameC = '#f59e0b'; frameHi = '#fde047'; frameSh = '#b45309';
            inkC = '#18100c'; tapeC = '#fde047'; tapeHi = '#fef08a';
            haloC = '#fef08a'; qFill = '#18100c';
        } else if (type === 'alien') {
            p1 = '#2d248a'; p2 = '#372ea3'; p3 = '#251c78'; p4 = '#1f1666';
            frameC = '#453bc2'; frameHi = '#5e54db'; frameSh = '#221969';
            inkC = '#0a0818'; tapeC = '#4895ef'; tapeHi = '#72efdd';
            haloC = '#0a0818'; qFill = '#38f6ff';
        } else {
            p1 = '#c58b53'; p2 = '#b87e49'; p3 = '#ab713e'; p4 = '#bc8350';
            frameC = '#d29a65'; frameHi = '#e5b382'; frameSh = '#9d6738';
            inkC = '#16110d'; tapeC = '#d7d0c3'; tapeHi = '#eae4da';
            haloC = '#ffffff'; qFill = '#16110d';
        }

        // 1. Recessed Wood Planks (4 horizontal planks)
        const plankH = 128;
        const colors = [p1, p2, p3, p4];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(0, i * plankH, 512, plankH);

            // Subtle organic woodgrain fibers
            ctx.strokeStyle = type === 'alien' ? 'rgba(30, 10, 60, 0.25)' : 'rgba(80, 45, 18, 0.22)';
            ctx.lineWidth = 2.5;
            for (let y = i * plankH + 14; y < (i + 1) * plankH; y += 16) {
                ctx.beginPath();
                ctx.moveTo(10, y + Math.sin(y * 0.18) * 2);
                ctx.lineTo(502, y + Math.cos(y * 0.14) * 2);
                ctx.stroke();
            }

            // Seam between planks
            if (i > 0) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, i * plankH - 1); ctx.lineTo(512, i * plankH - 1); ctx.stroke();

                ctx.strokeStyle = inkC;
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(0, i * plankH); ctx.lineTo(512, i * plankH); ctx.stroke();

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(0, i * plankH + 2); ctx.lineTo(512, i * plankH + 2); ctx.stroke();
            }
        }

        // 2. Beveled Wooden Perimeter Frame (width 54px)
        const fw = 54;
        ctx.fillStyle = frameC;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(fw, fw); ctx.lineTo(fw, 512 - fw); ctx.lineTo(0, 512); ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(512, 0); ctx.lineTo(512 - fw, fw); ctx.lineTo(512 - fw, 512 - fw); ctx.lineTo(512, 512); ctx.closePath();
        ctx.fill();

        ctx.fillStyle = frameHi;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(512, 0); ctx.lineTo(512 - fw, fw); ctx.lineTo(fw, fw); ctx.closePath();
        ctx.fill();

        ctx.fillStyle = frameSh;
        ctx.beginPath();
        ctx.moveTo(0, 512); ctx.lineTo(512, 512); ctx.lineTo(512 - fw, 512 - fw); ctx.lineTo(fw, 512 - fw); ctx.closePath();
        ctx.fill();

        // 45° Corner Miter seams
        ctx.strokeStyle = inkC;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(fw, fw); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(512, 0); ctx.lineTo(512 - fw, fw); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(fw, 512 - fw); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(512, 512); ctx.lineTo(512 - fw, 512 - fw); ctx.stroke();

        // Inner & Outer Frame Borders
        ctx.strokeRect(fw, fw, 512 - fw * 2, 512 - fw * 2);
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 512, 512);

        // Hand-drawn comic notches in frame
        ctx.fillStyle = 'rgba(50, 25, 10, 0.7)';
        const notches: [number, number][][] = [
            [[fw - 8, 160], [fw + 8, 172], [fw - 6, 184]],
            [[512 - fw - 6, 320], [512 - fw + 10, 332], [512 - fw + 4, 344]],
            [[180, fw - 6], [195, fw + 10], [210, fw - 4]],
            [[360, 512 - fw + 6], [375, 512 - fw - 10], [390, 512 - fw + 4]]
        ];
        for (const poly of notches) {
            ctx.beginPath();
            ctx.moveTo(poly[0][0], poly[0][1]);
            ctx.lineTo(poly[1][0], poly[1][1]);
            ctx.lineTo(poly[2][0], poly[2][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = inkC;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // 3. Top Hanging Tape Tab (draped from top edge with frayed teeth)
        const tx0 = 204, tx1 = 308;
        ctx.fillStyle = tapeC;
        ctx.beginPath();
        ctx.moveTo(tx0, 0);
        ctx.lineTo(tx0, 130);
        ctx.lineTo(tx0 + 16, 148);
        ctx.lineTo(tx0 + 34, 128);
        ctx.lineTo(tx0 + 52, 154);
        ctx.lineTo(tx0 + 70, 134);
        ctx.lineTo(tx0 + 88, 148);
        ctx.lineTo(tx1, 130);
        ctx.lineTo(tx1, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = tapeHi;
        ctx.fillRect(tx0 + 10, 0, 32, 126);

        ctx.strokeStyle = 'rgba(100, 80, 60, 0.35)';
        ctx.lineWidth = 2;
        for (let y = 20; y < 125; y += 22) {
            ctx.beginPath(); ctx.moveTo(tx0 + 8, y); ctx.lineTo(tx1 - 8, y + 2); ctx.stroke();
        }

        ctx.strokeStyle = inkC;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Bottom Tape Tab (wrapped up from bottom edge)
        ctx.fillStyle = tapeC;
        ctx.beginPath();
        ctx.moveTo(tx0 + 10, 512);
        ctx.lineTo(tx0 + 10, 512 - 75);
        ctx.lineTo(tx0 + 30, 512 - 92);
        ctx.lineTo(tx0 + 55, 512 - 76);
        ctx.lineTo(tx0 + 75, 512 - 90);
        ctx.lineTo(tx1 - 10, 512 - 72);
        ctx.lineTo(tx1 - 10, 512);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = inkC;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Corner peeled paper tabs
        ctx.fillStyle = type === 'alien' ? '#5ce1e6' : '#ece3ce';
        ctx.beginPath();
        ctx.moveTo(512 - fw - 25, fw + 10);
        ctx.lineTo(512 - fw + 8, fw - 6);
        ctx.lineTo(512 - fw - 4, fw + 32);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = inkC;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 4. Iconic Cartoon Question Mark ("?")
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 248px "Arial Black", Impact, sans-serif';

        if (type === 'alien') {
            // Outer Neon Cyan Halo + Dark Comic Ink Contour + Glowing Cyan Fill + White Glints
            ctx.shadowColor = 'rgba(56, 246, 255, 0.85)';
            ctx.shadowBlur = 22;
            ctx.strokeStyle = '#38f6ff';
            ctx.lineWidth = 34;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText('?', 256, 276);

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#0a0818';
            ctx.lineWidth = 22;
            ctx.strokeText('?', 256, 276);

            ctx.fillStyle = '#38f6ff';
            ctx.fillText('?', 256, 276);

            // Specular White Glints on top curve
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(228, 195, 16, 9, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(248, 184, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'orange') {
            // Warm Solar Halo + Dark Comic Ink Contour + Bright Yellow Fill + White Specular Glints
            ctx.shadowColor = 'rgba(251, 146, 60, 0.85)';
            ctx.shadowBlur = 22;
            ctx.strokeStyle = '#fb923c';
            ctx.lineWidth = 34;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText('?', 256, 276);

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#261408';
            ctx.lineWidth = 24;
            ctx.strokeText('?', 256, 276);

            ctx.fillStyle = '#fde047';
            ctx.fillText('?', 256, 276);

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(228, 195, 16, 9, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(248, 184, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.shadowColor = 'rgba(16, 12, 10, 0.45)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 8;

            ctx.strokeStyle = haloC;
            ctx.lineWidth = 28;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText('?', 256, 276);

            ctx.shadowColor = 'transparent';
            ctx.fillStyle = qFill;
            ctx.fillText('?', 256, 276);
        }
        ctx.restore();

        return canvas;
    }

    function createCardboardBoxTopCanvas(type: 'normal' | 'orange' | 'alien'): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        let p1: string, p2: string, p3: string, p4: string;
        let frameC: string, frameHi: string, frameSh: string;
        let inkC: string, tapeC: string, tapeHi: string;

        if (type === 'orange') {
            p1 = '#c2410c'; p2 = '#ea580c'; p3 = '#b45309'; p4 = '#9a3412';
            frameC = '#f59e0b'; frameHi = '#fde047'; frameSh = '#b45309';
            inkC = '#18100c'; tapeC = '#fde047'; tapeHi = '#fef08a';
        } else if (type === 'alien') {
            p1 = '#2d248a'; p2 = '#372ea3'; p3 = '#251c78'; p4 = '#1f1666';
            frameC = '#453bc2'; frameHi = '#5e54db'; frameSh = '#221969';
            inkC = '#0a0818'; tapeC = '#4895ef'; tapeHi = '#72efdd';
        } else {
            p1 = '#c58b53'; p2 = '#b87e49'; p3 = '#ab713e'; p4 = '#bc8350';
            frameC = '#d29a65'; frameHi = '#e5b382'; frameSh = '#9d6738';
            inkC = '#16110d'; tapeC = '#d7d0c3'; tapeHi = '#eae4da';
        }

        // Planks
        const plankH = 128;
        const colors = [p1, p2, p3, p4];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(0, i * plankH, 512, plankH);
            if (i > 0) {
                ctx.strokeStyle = inkC; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(0, i * plankH); ctx.lineTo(512, i * plankH); ctx.stroke();
            }
        }

        // Outer Frame
        const fw = 54;
        ctx.fillStyle = frameC;
        ctx.fillRect(0, 0, fw, 512);
        ctx.fillRect(512 - fw, 0, fw, 512);
        ctx.fillStyle = frameHi;
        ctx.fillRect(0, 0, 512, fw);
        ctx.fillStyle = frameSh;
        ctx.fillRect(0, 512 - fw, 512, fw);

        ctx.strokeStyle = inkC; ctx.lineWidth = 4;
        ctx.strokeRect(fw, fw, 512 - fw * 2, 512 - fw * 2);
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 512, 512);

        // Diagonal "X" Crossed Packaging Tape
        const tapeW = 96;

        // Strip 1: Top-Left to Bottom-Right
        ctx.save();
        ctx.translate(256, 256);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = tapeC;
        ctx.fillRect(-380, -tapeW / 2, 760, tapeW);
        ctx.fillStyle = tapeHi;
        ctx.fillRect(-380, -tapeW / 2 + 10, 760, 26);
        ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
        ctx.lineWidth = 2;
        for (let x = -360; x < 360; x += 28) {
            ctx.beginPath(); ctx.moveTo(x, -tapeW / 2); ctx.lineTo(x + 4, tapeW / 2); ctx.stroke();
        }
        ctx.strokeStyle = inkC;
        ctx.lineWidth = 4;
        ctx.strokeRect(-380, -tapeW / 2, 760, tapeW);
        ctx.restore();

        // Strip 2: Top-Right to Bottom-Left
        ctx.save();
        ctx.translate(256, 256);
        ctx.rotate(-Math.PI / 4);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = tapeC;
        ctx.fillRect(-380, -tapeW / 2, 760, tapeW);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = tapeHi;
        ctx.fillRect(-380, -tapeW / 2 + 10, 760, 26);
        ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
        ctx.lineWidth = 2;
        for (let x = -360; x < 360; x += 28) {
            ctx.beginPath(); ctx.moveTo(x, -tapeW / 2); ctx.lineTo(x + 4, tapeW / 2); ctx.stroke();
        }
        ctx.strokeStyle = inkC;
        ctx.lineWidth = 4;
        ctx.strokeRect(-380, -tapeW / 2, 760, tapeW);
        ctx.restore();

        return canvas;
    }

    function createComicOrbCanvas(theme: 'orange' | 'blue'): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const cx = 256;
        const cy = 256;
        const r = 240;

        // 1. Circular Comic Body Gradient
        const grad = ctx.createRadialGradient(cx - 24, cy - 24, 18, cx, cy, r);
        if (theme === 'orange') {
            grad.addColorStop(0, '#fde047');
            grad.addColorStop(0.45, '#f97316');
            grad.addColorStop(0.85, '#ea580c');
            grad.addColorStop(1, '#9a3412');
        } else {
            grad.addColorStop(0, '#67e8f9');
            grad.addColorStop(0.45, '#06b6d4');
            grad.addColorStop(0.85, '#0284c7');
            grad.addColorStop(1, '#1e3a8a');
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // 2. Comic Crosshatching (###) Around Lower & Side Rim
        ctx.strokeStyle = theme === 'orange' ? '#290f04' : '#06152d';
        ctx.lineWidth = 2.4;
        for (let a = 0.2; a < Math.PI - 0.1; a += 0.08) {
            const rx = cx + Math.cos(a) * (r - 28);
            const ry = cy + Math.sin(a) * (r - 28);
            ctx.beginPath();
            ctx.moveTo(rx - 22, ry - 14);
            ctx.lineTo(rx + 22, ry + 14);
            ctx.moveTo(rx + 18, ry - 18);
            ctx.lineTo(rx - 18, ry + 18);
            ctx.stroke();
        }

        // 3. Hand-Drawn Comic Ink Craters & Swirling Plasma Lines
        ctx.lineCap = 'round';
        for (const [crx, cry, crr, ang] of [
            [162, 168, 32, -0.5],
            [196, 206, 22, -0.4],
            [348, 250, 14, 0.3]
        ] as const) {
            ctx.save();
            ctx.translate(crx, cry);
            ctx.rotate(ang);
            ctx.fillStyle = theme === 'orange' ? '#9a3412' : '#0c4a6e';
            ctx.beginPath();
            ctx.ellipse(0, 0, crr, crr * 0.62, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#080b11';
            ctx.stroke();
            ctx.restore();
        }

        // 4. Licking Comic Flame / Plasma Flares with Bright Glowing Cores
        for (const [fx, fy, sc] of [
            [335, 168, 1.1],
            [305, 205, 0.78],
            [168, 338, 0.95],
            [332, 342, 0.85]
        ] as const) {
            const flGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 42 * sc);
            flGrad.addColorStop(0, '#ffffff');
            flGrad.addColorStop(0.4, theme === 'orange' ? '#fef08a' : '#a5f3fc');
            flGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = flGrad;
            ctx.beginPath();
            ctx.arc(fx, fy, 42 * sc, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 5. Bold Dark Comic Outer Circular Ink Border
        ctx.strokeStyle = theme === 'orange' ? '#431407' : '#082f49';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.stroke();

        return canvas;
    }

    // =========================================================================
    // 6. PHOTOREALISTIC HIGH-RES PLANET TEXTURES (512x256 Pixel-Synthesized fBm)
    //    Complemented by 3D Simplex/fBm Per-Pixel Detail in our Custom Planet GLSL Shader!
    // =========================================================================
    const pw = 512;
    const ph = 256;

    // 6A. Photorealistic Jovian Gas Giant (Domain-warped zonal bands + Kelvin-Helmholtz eddies)
    const gasGiantCanvas = document.createElement('canvas');
    gasGiantCanvas.width = pw;
    gasGiantCanvas.height = ph;
    const ggCtx = gasGiantCanvas.getContext('2d')!;
    const ggImg = ggCtx.createImageData(pw, ph);

    // 6B. Photorealistic Continental / Cryo-Ocean World + Land/Ocean Mask for City Lights
    const icePlanetCanvas = document.createElement('canvas');
    icePlanetCanvas.width = pw;
    icePlanetCanvas.height = ph;
    const ipCtx = icePlanetCanvas.getContext('2d')!;
    const ipImg = ipCtx.createImageData(pw, ph);

    // 6C. Photorealistic Tectonic Magma & Basalt Planet
    const lavaPlanetCanvas = document.createElement('canvas');
    lavaPlanetCanvas.width = pw;
    lavaPlanetCanvas.height = ph;
    const lpCtx = lavaPlanetCanvas.getContext('2d')!;
    const lpImg = lpCtx.createImageData(pw, ph);

    // 6D. Photorealistic Night-Side City Lights (Organic coastal & continental clusters)
    const cityLightsCanvas = document.createElement('canvas');
    cityLightsCanvas.width = pw;
    cityLightsCanvas.height = ph;
    const clightCtx = cityLightsCanvas.getContext('2d')!;
    const clImg = clightCtx.createImageData(pw, ph);

    // 6E. Photorealistic Planetary Cloud Deck Layer (Cyclonic swirls & trade wind bands)
    const cloudsCanvas = document.createElement('canvas');
    cloudsCanvas.width = pw;
    cloudsCanvas.height = ph;
    const pclCtx = cloudsCanvas.getContext('2d')!;
    const pclImg = pclCtx.createImageData(pw, ph);

    for (let y = 0; y < ph; y++) {
        const v = y / ph;
        const lat = Math.abs(v - 0.5) * 2.0; // 0 at equator, 1 at poles

        for (let x = 0; x < pw; x++) {
            const u = x / pw;
            const idx = (y * pw + x) * 4;

            // --- A. JOVIAN GAS GIANT ---
            const warpX = fbm2D(u * 6.0, v * 12.0, 4, 2.0, 0.5, 6, 12) * 0.25;
            const warpY = fbm2D(u * 8.0 + 5.2, v * 16.0 + 1.3, 5, 2.0, 0.5, 8, 16) * 0.085;
            const bandCoord = (v + warpY) * 18.0;
            const zone = Math.sin(bandCoord * Math.PI) * 0.5 + 0.5;
            const fineTurbulence = fbm2D((u + warpX) * 12.0, (v + warpY) * 24.0, 5, 2.0, 0.5, 12, 24);

            // Great Red/Amber Anticyclonic Vortex at (u=0.62, v=0.58)
            const dxStorm = (u - 0.62) * 2.2;
            const dyStorm = (v - 0.58) * 4.2;
            const stormDist = Math.sqrt(dxStorm * dxStorm + dyStorm * dyStorm);
            const stormSwirl = Math.max(0, 1.0 - stormDist);

            const jMix = THREE.MathUtils.clamp(zone * 0.65 + fineTurbulence * 0.35, 0, 1);
            // Realistic Cassini Jupiter/Saturn palette (Cream, Ochre, Rust Amber, Deep Slate Belt)
            let jr = lerp(38, 228, jMix) + stormSwirl * 65;
            let jg = lerp(48, 192, jMix) - stormSwirl * 15;
            let jb = lerp(72, 148, jMix) - stormSwirl * 45;
            const polarDark = 1.0 - Math.pow(lat, 2.6) * 0.55;
            ggImg.data[idx] = THREE.MathUtils.clamp(jr * polarDark, 0, 255);
            ggImg.data[idx + 1] = THREE.MathUtils.clamp(jg * polarDark, 0, 255);
            ggImg.data[idx + 2] = THREE.MathUtils.clamp(jb * polarDark, 0, 255);
            ggImg.data[idx + 3] = 255;

            // --- B. CONTINENTAL / CRYO-OCEAN WORLD & D. NIGHT-SIDE CITY LIGHTS ---
            const contElevation = fbm2D(u * 5.0 + 1.4, v * 5.0 + 2.1, 6, 2.05, 0.52, 5, 5);
            const mountainRidges = ridgedFbm2D(u * 10.0, v * 10.0, 5, 10, 10);
            const isLand = contElevation > 0.49;
            const isPolarIce = lat + (contElevation - 0.5) * 0.32 > 0.78;

            let er = 0;
            let eg = 0;
            let eb = 0;
            if (isPolarIce) {
                const iceDetail = 0.85 + 0.15 * mountainRidges;
                er = 225 * iceDetail;
                eg = 242 * iceDetail;
                eb = 255 * iceDetail;
            } else if (isLand) {
                const landH = THREE.MathUtils.clamp((contElevation - 0.49) / 0.51, 0, 1);
                const alpine = mountainRidges * landH;
                // Realistic satellite Earth/Super-Earth biome colors (deep forest, arid plateau, snow peaks)
                er = lerp(28, 128, landH) + alpine * 85;
                eg = lerp(64, 118, landH) + alpine * 82;
                eb = lerp(42, 96, landH) + alpine * 90;
            } else {
                // Deep ocean & turquoise continental shelf
                const shelf = THREE.MathUtils.clamp(contElevation / 0.49, 0, 1);
                const shelfPow = Math.pow(shelf, 3.5);
                er = lerp(4, 22, shelfPow);
                eg = lerp(16, 98, shelfPow);
                eb = lerp(44, 158, shelfPow);
            }
            ipImg.data[idx] = THREE.MathUtils.clamp(er, 0, 255);
            ipImg.data[idx + 1] = THREE.MathUtils.clamp(eg, 0, 255);
            ipImg.data[idx + 2] = THREE.MathUtils.clamp(eb, 0, 255);
            ipImg.data[idx + 3] = 255;

            // Night-Side City Lights: Clustered organically along coastlines & low-elevation continents!
            let cityIntensity = 0;
            if (isLand && !isPolarIce && lat < 0.72) {
                const coastProximity = 1.0 - THREE.MathUtils.clamp((contElevation - 0.49) / 0.16, 0, 1);
                const urbanCluster = fbm2D(u * 18.0 + 3.7, v * 18.0 + 6.1, 4, 2.2, 0.55, 18, 18);
                const fineGrid = ridgedFbm2D(u * 36.0, v * 36.0, 3, 36, 36);
                const settlement = (urbanCluster * 0.75 + coastProximity * 0.35) * Math.pow(fineGrid, 2.2);
                if (settlement > 0.36) {
                    cityIntensity = THREE.MathUtils.clamp((settlement - 0.36) * 2.8, 0, 1);
                }
            }
            clImg.data[idx] = Math.round(cityIntensity * 255);
            clImg.data[idx + 1] = Math.round(cityIntensity * 195);
            clImg.data[idx + 2] = Math.round(Math.pow(cityIntensity, 1.6) * 115);
            clImg.data[idx + 3] = 255;

            // --- C. VOLCANIC BASALT & TECTONIC MAGMA WORLD ---
            const basalt = fbm2D(u * 8.0, v * 8.0, 5, 2.0, 0.5, 8, 8);
            const magmaCrack = ridgedFbm2D(u * 7.0 + basalt * 0.35, v * 7.0 + basalt * 0.35, 5, 7, 7);
            const lavaGlow = Math.pow(THREE.MathUtils.clamp((magmaCrack - 0.62) / 0.38, 0, 1), 2.2);
            const crustShade = 14 + basalt * 32;
            lpImg.data[idx] = THREE.MathUtils.clamp(crustShade + lavaGlow * 255, 0, 255);
            lpImg.data[idx + 1] = THREE.MathUtils.clamp(crustShade * 0.9 + Math.pow(lavaGlow, 1.6) * 185, 0, 255);
            lpImg.data[idx + 2] = THREE.MathUtils.clamp(crustShade * 1.1 + Math.pow(lavaGlow, 3.0) * 90, 0, 255);
            lpImg.data[idx + 3] = 255;

            // --- E. PLANETARY ATMOSPHERIC CLOUD DECK ---
            const cSwirlX = fbm2D(u * 4.0 + 7.1, v * 4.0, 4, 2.0, 0.5, 4, 4) * 0.35;
            const cSwirlY = fbm2D(u * 4.0, v * 4.0 + 9.3, 4, 2.0, 0.5, 4, 4) * 0.35;
            const cloudDensity = fbm2D((u + cSwirlX) * 8.0, (v + cSwirlY) * 8.0, 6, 2.05, 0.52, 8, 8);
            const cloudAlpha = THREE.MathUtils.clamp((cloudDensity - 0.44) * 2.4, 0, 1);
            const cByte = Math.round(cloudAlpha * 255);
            pclImg.data[idx] = 255;
            pclImg.data[idx + 1] = 255;
            pclImg.data[idx + 2] = 255;
            pclImg.data[idx + 3] = cByte;
        }
    }

    ggCtx.putImageData(ggImg, 0, 0);
    ipCtx.putImageData(ipImg, 0, 0);
    lpCtx.putImageData(lpImg, 0, 0);
    clightCtx.putImageData(clImg, 0, 0);
    pclCtx.putImageData(pclImg, 0, 0);

    // Overlay Hand-Drawn Comic Ink Contours, Hatching & Magma Cracks on Background Planets (Matches Image 4)
    const applyComicPlanetInk = (ctx: CanvasRenderingContext2D, accentColor: string) => {
        ctx.save();
        ctx.strokeStyle = '#05070c';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        // Equatorial & tropical comic ink contour lines + crosshatching
        for (let by = 36; by < ph - 28; by += 44) {
            ctx.beginPath();
            for (let bx = 0; bx <= pw; bx += 16) {
                const wy = by + Math.sin((bx / pw) * Math.PI * 4 + by) * 6;
                if (bx === 0) ctx.moveTo(bx, wy);
                else ctx.lineTo(bx, wy);
            }
            ctx.stroke();

            // Comic diagonal hatching ticks along band shadow edge
            ctx.lineWidth = 1.8;
            for (let hx = 12; hx < pw; hx += 22) {
                const wy = by + Math.sin((hx / pw) * Math.PI * 4 + by) * 6;
                ctx.beginPath();
                ctx.moveTo(hx, wy);
                ctx.lineTo(hx - 8, wy + 10);
                ctx.stroke();
            }
            ctx.lineWidth = 3.2;
        }
        // Glowing comic fissure cracks (like the orange/violet background planet in Image 4)
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.6;
        for (let i = 0; i < 14; i++) {
            const sx = (i * 73 + 29) % (pw - 60) + 30;
            const sy = (i * 47 + 41) % (ph - 60) + 30;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + 14, sy + 8);
            ctx.lineTo(sx + 8, sy + 20);
            ctx.stroke();
        }
        ctx.restore();
    };
    applyComicPlanetInk(ggCtx, '#f97316');
    applyComicPlanetInk(ipCtx, '#38bdf8');
    applyComicPlanetInk(lpCtx, '#fde047');

    // 6F. Hand-Drawn Cel-Shaded Comic Planetary Ring System (512x512 with ink bands & black rock silhouettes like Image 4)
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 512;
    const rgCtx = ringCanvas.getContext('2d')!;
    const rgImg = rgCtx.createImageData(512, 512);

    for (let y = 0; y < 512; y++) {
        const dy = y - 256;
        for (let x = 0; x < 512; x++) {
            const dx = x - 256;
            const r = Math.sqrt(dx * dx + dy * dy);
            const idx = (y * 512 + x) * 4;
            if (r < 112 || r > 250) {
                rgImg.data[idx + 3] = 0;
                continue;
            }
            const normR = (r - 112) / (250 - 112);
            const cassiniMask =
                normR > 0.54 && normR < 0.61
                    ? 0.04
                    : normR > 0.86 && normR < 0.885
                      ? 0.06
                      : 1.0;

            // Posterized cel-shaded ring bands + black comic ink divider rings
            const isInkLine =
                Math.abs(normR - 0.02) < 0.018 ||
                Math.abs(normR - 0.53) < 0.015 ||
                Math.abs(normR - 0.62) < 0.015 ||
                Math.abs(normR - 0.98) < 0.018;

            if (isInkLine) {
                rgImg.data[idx] = 8;
                rgImg.data[idx + 1] = 11;
                rgImg.data[idx + 2] = 18;
                rgImg.data[idx + 3] = 240;
                continue;
            }

            const bandStep = Math.floor(normR * 8) / 8;
            const radialEnvelope = Math.sin(normR * Math.PI);
            const alpha = THREE.MathUtils.clamp(
                radialEnvelope * cassiniMask * 0.88,
                0,
                1
            );

            rgImg.data[idx] = Math.round(lerp(148, 224, bandStep));
            rgImg.data[idx + 1] = Math.round(lerp(182, 238, bandStep));
            rgImg.data[idx + 2] = Math.round(lerp(225, 255, bandStep));
            rgImg.data[idx + 3] = Math.round(alpha * 255);
        }
    }
    rgCtx.putImageData(rgImg, 0, 0);

    // Scatter comic black ink rock silhouettes along the planetary rings (matching Image 4 background)
    rgCtx.fillStyle = '#06080f';
    for (let i = 0; i < 64; i++) {
        const ang = (i / 64) * Math.PI * 2 + (i % 3) * 0.17;
        const rad = 128 + ((i * 29) % 108);
        const rx = 256 + Math.cos(ang) * rad;
        const ry = 256 + Math.sin(ang) * rad;
        const sz = 2.5 + (i % 4) * 1.4;
        rgCtx.beginPath();
        rgCtx.moveTo(rx - sz, ry);
        rgCtx.lineTo(rx, ry - sz * 0.8);
        rgCtx.lineTo(rx + sz, ry + sz * 0.3);
        rgCtx.lineTo(rx - sz * 0.4, ry + sz);
        rgCtx.closePath();
        rgCtx.fill();
    }

    // =========================================================================
    // 7. THREE PHOTOREALISTIC JWST / HUBBLE VOLUMETRIC NEBULA TEXTURES (384x384 ImageData)
    //    Domain-warped ridged fBm gas filaments + dark Bok globule dust lanes!
    // =========================================================================
    const synthesizeNebulaTexture = (
        seedOffset: number,
        coreR: number,
        coreG: number,
        coreB: number,
        rimR: number,
        rimG: number,
        rimB: number
    ): THREE.CanvasTexture => {
        const nw = 384;
        const nh = 384;
        const canvas = document.createElement('canvas');
        canvas.width = nw;
        canvas.height = nh;
        const ctx = canvas.getContext('2d')!;
        const img = ctx.createImageData(nw, nh);

        for (let y = 0; y < nh; y++) {
            const ny = (y / nh - 0.5) * 2.0;
            for (let x = 0; x < nw; x++) {
                const nx = (x / nw - 0.5) * 2.0;
                const dist = Math.sqrt(nx * nx + ny * ny);
                const idx = (y * nw + x) * 4;
                if (dist >= 1.0) {
                    img.data[idx + 3] = 0;
                    continue;
                }

                // Soft organic radial falloff so sprite edges never clip
                const radialFalloff = Math.pow(1.0 - dist * dist, 1.85);

                // Domain-warped coordinates for wispy interstellar gas filaments
                const u = (x / nw) * 4.5 + seedOffset;
                const v = (y / nh) * 4.5 + seedOffset * 0.7;
                const qx = fbm2D(u, v, 4, 2.0, 0.5, 16, 16) - 0.5;
                const qy = fbm2D(u + 5.2, v + 1.3, 4, 2.0, 0.5, 16, 16) - 0.5;

                const filament = ridgedFbm2D(u + qx * 2.2, v + qy * 2.2, 5, 16, 16);
                const cloudBody = fbm2D(u * 0.8 + qx * 1.4, v * 0.8 + qy * 1.4, 5, 2.0, 0.52, 16, 16);

                // Dark dust absorption lanes carving through the emission nebula
                const darkDust = fbm2D(u * 1.6 - qy * 1.5, v * 1.6 + qx * 1.5, 4, 2.1, 0.5, 16, 16);
                const dustExtinction = THREE.MathUtils.clamp((darkDust - 0.56) * 2.6, 0, 0.78);

                const density = THREE.MathUtils.clamp(
                    (cloudBody * 0.55 + Math.pow(filament, 1.6) * 0.65) * (1.0 - dustExtinction) * radialFalloff,
                    0,
                    1
                );

                // Blend between ionized core emission and outer filament rim
                const filFactor = THREE.MathUtils.clamp(Math.pow(filament, 2.0), 0, 1);
                const r = lerp(rimR, coreR, filFactor) * (0.65 + 0.65 * filament);
                const g = lerp(rimG, coreG, filFactor) * (0.65 + 0.65 * filament);
                const b = lerp(rimB, coreB, filFactor) * (0.65 + 0.65 * filament);

                img.data[idx] = THREE.MathUtils.clamp(r, 0, 255);
                img.data[idx + 1] = THREE.MathUtils.clamp(g, 0, 255);
                img.data[idx + 2] = THREE.MathUtils.clamp(b, 0, 255);
                img.data[idx + 3] = Math.round(Math.pow(density, 1.15) * 235);
            }
        }
        ctx.putImageData(img, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    };

    // 1. Orion / Lagoon Cyan-Teal & Violet Ionized Nebula
    const cartoonCloudTex = synthesizeNebulaTexture(1.2, 85, 235, 255, 139, 92, 246);
    // 2. Carina / Pillars of Creation Golden-Amber & Deep Turquoise Nebula
    const nebulaPillarTex = synthesizeNebulaTexture(8.7, 254, 215, 102, 14, 165, 233);
    // 3. Cygnus Veil / Rosette Crimson-Magenta & Electric Blue Supernova Remnant
    const nebulaVeilTex = synthesizeNebulaTexture(19.4, 244, 114, 182, 56, 189, 248);

    // =========================================================================
    // 8. PROCEDURAL HDR EQUIRECTANGULAR ENVIRONMENT MAP (512x256)
    // =========================================================================
    const hdrCanvas = document.createElement('canvas');
    hdrCanvas.width = 512;
    hdrCanvas.height = 256;
    const hdrCtx = hdrCanvas.getContext('2d')!;

    const envGrad = hdrCtx.createLinearGradient(0, 0, 0, 256);
    envGrad.addColorStop(0.0, '#0f172a');
    envGrad.addColorStop(0.35, '#1e3a8a');
    envGrad.addColorStop(0.5, '#38bdf8');
    envGrad.addColorStop(0.65, '#311042');
    envGrad.addColorStop(1.0, '#020617');
    hdrCtx.fillStyle = envGrad;
    hdrCtx.fillRect(0, 0, 512, 256);

    for (const [hx, hy, hr, col] of [
        [128, 84, 56, 'rgba(255, 255, 255, 0.9)'],
        [360, 110, 72, 'rgba(0, 240, 255, 0.85)'],
        [240, 168, 64, 'rgba(253, 224, 71, 0.75)'],
        [440, 64, 48, 'rgba(168, 85, 247, 0.7)']
    ] as const) {
        const g = hdrCtx.createRadialGradient(hx, hy, 2, hx, hy, hr);
        g.addColorStop(0, col);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        hdrCtx.fillStyle = g;
        hdrCtx.beginPath();
        hdrCtx.arc(hx, hy, hr, 0, Math.PI * 2);
        hdrCtx.fill();
    }

    // =========================================================================
    // 9. HOLOGRAPHIC GATE PATTERN DISC, SUPERNOVA FLARE & PARTICLE GLOW
    // =========================================================================
    const holoGateCanvas = document.createElement('canvas');
    holoGateCanvas.width = 256;
    holoGateCanvas.height = 256;
    const hgCtx = holoGateCanvas.getContext('2d')!;
    hgCtx.clearRect(0, 0, 256, 256);

    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 512;
    flareCanvas.height = 256;
    const flCtx = flareCanvas.getContext('2d')!;
    flCtx.clearRect(0, 0, 512, 256);

    const coreFlGrad = flCtx.createRadialGradient(256, 128, 4, 256, 128, 120);
    coreFlGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreFlGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
    coreFlGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.45)');
    coreFlGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flCtx.fillStyle = coreFlGrad;
    flCtx.fillRect(0, 0, 512, 256);

    const splatCanvas = document.createElement('canvas');
    splatCanvas.width = 256;
    splatCanvas.height = 256;
    const sCtx = splatCanvas.getContext('2d')!;
    const pGrad = sCtx.createRadialGradient(128, 128, 6, 128, 128, 118);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    pGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.55)');
    pGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.22)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = pGrad;
    sCtx.beginPath();
    sCtx.arc(128, 128, 118, 0, Math.PI * 2);
    sCtx.fill();

    const chainCanvas = document.createElement('canvas');
    chainCanvas.width = 128;
    chainCanvas.height = 128;

    const billCanvas = document.createElement('canvas');
    billCanvas.width = 128;
    billCanvas.height = 64;

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext('2d')!;
    const rad = gCtx.createRadialGradient(64, 64, 2, 64, 64, 60);
    rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    rad.addColorStop(0.32, 'rgba(56, 189, 248, 0.85)');
    rad.addColorStop(0.72, 'rgba(59, 130, 246, 0.3)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gCtx.fillStyle = rad;
    gCtx.beginPath();
    gCtx.arc(64, 64, 60, 0, Math.PI * 2);
    gCtx.fill();

    const toonData = new Uint8Array([80, 150, 215, 255]);
    const toonGradientMap = new THREE.DataTexture(toonData, 4, 1, THREE.RedFormat);
    toonGradientMap.minFilter = THREE.NearestFilter;
    toonGradientMap.magFilter = THREE.NearestFilter;
    toonGradientMap.needsUpdate = true;

    const hullColor = new THREE.CanvasTexture(hullColorCanvas);
    hullColor.colorSpace = THREE.SRGBColorSpace;

    const windshieldEyesTex = new THREE.CanvasTexture(eyesCanvas);
    windshieldEyesTex.colorSpace = THREE.SRGBColorSpace;

    const hullBump = new THREE.CanvasTexture(hullBumpCanvas);
    const hullRoughness = new THREE.CanvasTexture(hullRoughCanvas);

    const platformColor = new THREE.CanvasTexture(platColorCanvas);
    platformColor.colorSpace = THREE.SRGBColorSpace;

    const platformBump = new THREE.CanvasTexture(platBumpCanvas);
    const archBump = new THREE.CanvasTexture(archBumpCanvas);

    const brickWallColor = new THREE.CanvasTexture(brickCanvas);
    brickWallColor.colorSpace = THREE.SRGBColorSpace;

    const asphaltColor = new THREE.CanvasTexture(asphaltCanvas);
    asphaltColor.colorSpace = THREE.SRGBColorSpace;

    const paintSplatterTex = new THREE.CanvasTexture(splatCanvas);
    paintSplatterTex.colorSpace = THREE.SRGBColorSpace;

    const chainLinkTex = new THREE.CanvasTexture(chainCanvas);
    const glassCardTex = new THREE.CanvasTexture(glassCardCanvas);
    glassCardTex.colorSpace = THREE.SRGBColorSpace;

    const normalSideCanvas = createCardboardBoxCanvas('normal');
    const cardboardBoxTex = new THREE.CanvasTexture(normalSideCanvas);
    cardboardBoxTex.colorSpace = THREE.SRGBColorSpace;

    const normalTopCanvas = createCardboardBoxTopCanvas('normal');
    const cardboardBoxTopTex = new THREE.CanvasTexture(normalTopCanvas);
    cardboardBoxTopTex.colorSpace = THREE.SRGBColorSpace;

    const orangeSideCanvas = createCardboardBoxCanvas('orange');
    const cardboardOrangeBoxTex = new THREE.CanvasTexture(orangeSideCanvas);
    cardboardOrangeBoxTex.colorSpace = THREE.SRGBColorSpace;

    const orangeTopCanvas = createCardboardBoxTopCanvas('orange');
    const cardboardOrangeBoxTopTex = new THREE.CanvasTexture(orangeTopCanvas);
    cardboardOrangeBoxTopTex.colorSpace = THREE.SRGBColorSpace;

    const alienSideCanvas = createCardboardBoxCanvas('alien');
    const cardboardAlienBoxTex = new THREE.CanvasTexture(alienSideCanvas);
    cardboardAlienBoxTex.colorSpace = THREE.SRGBColorSpace;

    const alienTopCanvas = createCardboardBoxTopCanvas('alien');
    const cardboardAlienBoxTopTex = new THREE.CanvasTexture(alienTopCanvas);
    cardboardAlienBoxTopTex.colorSpace = THREE.SRGBColorSpace;

    const miniSunCanvas = createComicOrbCanvas('orange');
    const miniSunTex = new THREE.CanvasTexture(miniSunCanvas);
    miniSunTex.colorSpace = THREE.SRGBColorSpace;

    const alienSymbolCanvas = createComicOrbCanvas('blue');
    const alienSymbolTex = new THREE.CanvasTexture(alienSymbolCanvas);
    alienSymbolTex.colorSpace = THREE.SRGBColorSpace;

    // Upgrade synchronously-initialized canvas textures with the extracted reference PNG assets
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
        const texLoader = new THREE.TextureLoader();
        const upgradeCanvas = (canvas: HTMLCanvasElement, tex: THREE.CanvasTexture, url: string, clearFirst = false) => {
            texLoader.load(url, (t) => {
                if (t.image) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        if (clearFirst) ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(t.image, 0, 0, canvas.width, canvas.height);
                        tex.needsUpdate = true;
                    }
                }
            });
        };
        upgradeCanvas(normalSideCanvas, cardboardBoxTex, '/assets/crate_side_normal.png');
        upgradeCanvas(normalTopCanvas, cardboardBoxTopTex, '/assets/crate_top_normal.png');
        upgradeCanvas(orangeSideCanvas, cardboardOrangeBoxTex, '/assets/crate_side_orange.png');
        upgradeCanvas(orangeTopCanvas, cardboardOrangeBoxTopTex, '/assets/crate_top_orange.png');
        upgradeCanvas(alienSideCanvas, cardboardAlienBoxTex, '/assets/crate_side_alien.png');
        upgradeCanvas(alienTopCanvas, cardboardAlienBoxTopTex, '/assets/crate_top_alien.png');
        upgradeCanvas(miniSunCanvas, miniSunTex, '/assets/bonus_sun_comic.png', true);
        upgradeCanvas(alienSymbolCanvas, alienSymbolTex, '/assets/bonus_blue_comic.png', true);
    }

    const dollarBillTex = new THREE.CanvasTexture(billCanvas);
    const particleGlow = new THREE.CanvasTexture(glowCanvas);
    particleGlow.colorSpace = THREE.SRGBColorSpace;

    const asteroidColor = new THREE.CanvasTexture(astColorCanvas);
    asteroidColor.colorSpace = THREE.SRGBColorSpace;
    asteroidColor.wrapS = asteroidColor.wrapT = THREE.RepeatWrapping;

    const asteroidBump = new THREE.CanvasTexture(astBumpCanvas);
    asteroidBump.wrapS = asteroidBump.wrapT = THREE.RepeatWrapping;

    const asteroidRoughness = new THREE.CanvasTexture(astRoughCanvas);
    asteroidRoughness.wrapS = asteroidRoughness.wrapT = THREE.RepeatWrapping;

    const hologramGateTex = new THREE.CanvasTexture(holoGateCanvas);
    const supernovaFlareTex = new THREE.CanvasTexture(flareCanvas);
    supernovaFlareTex.colorSpace = THREE.SRGBColorSpace;

    const planetGasGiantTex = new THREE.CanvasTexture(gasGiantCanvas);
    planetGasGiantTex.colorSpace = THREE.SRGBColorSpace;
    planetGasGiantTex.wrapS = THREE.RepeatWrapping;

    const planetIceWorldTex = new THREE.CanvasTexture(icePlanetCanvas);
    planetIceWorldTex.colorSpace = THREE.SRGBColorSpace;
    planetIceWorldTex.wrapS = THREE.RepeatWrapping;

    const planetLavaWorldTex = new THREE.CanvasTexture(lavaPlanetCanvas);
    planetLavaWorldTex.colorSpace = THREE.SRGBColorSpace;
    planetLavaWorldTex.wrapS = THREE.RepeatWrapping;

    const planetCityLightsTex = new THREE.CanvasTexture(cityLightsCanvas);
    planetCityLightsTex.colorSpace = THREE.SRGBColorSpace;
    planetCityLightsTex.wrapS = THREE.RepeatWrapping;

    const planetCloudsTex = new THREE.CanvasTexture(cloudsCanvas);
    planetCloudsTex.colorSpace = THREE.SRGBColorSpace;
    planetCloudsTex.wrapS = THREE.RepeatWrapping;

    const planetRingTex = new THREE.CanvasTexture(ringCanvas);
    planetRingTex.colorSpace = THREE.SRGBColorSpace;

    const hdrEnvEquirectTex = new THREE.CanvasTexture(hdrCanvas);
    hdrEnvEquirectTex.mapping = THREE.EquirectangularReflectionMapping;
    hdrEnvEquirectTex.colorSpace = THREE.SRGBColorSpace;

    return {
        hullColor,
        hullBump,
        hullRoughness,
        windshieldEyesTex,
        platformColor,
        platformBump,
        archBump,
        brickWallColor,
        asphaltColor,
        paintSplatterTex,
        cartoonCloudTex,
        nebulaPillarTex,
        nebulaVeilTex,
        chainLinkTex,
        glassCardTex,
        cardboardBoxTex,
        cardboardBoxTopTex,
        cardboardOrangeBoxTex,
        cardboardOrangeBoxTopTex,
        cardboardAlienBoxTex,
        cardboardAlienBoxTopTex,
        miniSunTex,
        alienSymbolTex,
        dollarBillTex,
        particleGlow,
        asteroidColor,
        asteroidBump,
        asteroidRoughness,
        hologramGateTex,
        supernovaFlareTex,
        planetGasGiantTex,
        planetIceWorldTex,
        planetLavaWorldTex,
        planetCityLightsTex,
        planetCloudsTex,
        planetRingTex,
        hdrEnvEquirectTex,
        toonGradientMap
    };
}

/**
 * Renders a Punchy, High-Contrast Cartoon Cel-Shaded Badge above each Platform Gate
 */
export function updateHologramBadgeCanvas(
    canvas: HTMLCanvasElement,
    laneNum: number,
    subText: string,
    accentHex: string,
    isSpecial: boolean,
    isHovered: boolean
) {
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 6;
    const rw = w - pad * 2;
    const rh = h - pad * 2;

    // Drop shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(pad + 3, pad + 3, rw, rh, 12);
    ctx.fill();

    // Comic card background
    ctx.fillStyle = isHovered
        ? '#0c223e'
        : isSpecial
          ? '#2d1804'
          : '#0a0f1d';
    ctx.beginPath();
    ctx.roundRect(pad, pad, rw, rh, 12);
    ctx.fill();

    // Bold cartoon ink border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner bright accent rim
    ctx.strokeStyle = isHovered ? '#fde047' : accentHex;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(pad + 2, pad + 2, rw - 4, rh - 4, 10);
    ctx.stroke();

    // Top banner ribbon
    ctx.fillStyle = isHovered ? '#fde047' : accentHex;
    ctx.beginPath();
    ctx.roundRect(pad + 4, pad + 4, rw - 8, 28, 7);
    ctx.fill();

    // Ribbon ink outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 14px "Plus Jakarta Sans", "Arial Black", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`GATE ${laneNum}`, w / 2, 26, rw - 20);

    const valFontPx = subText.length > 10 ? 21 : subText.length > 8 ? 23 : 26;
    ctx.font = `900 ${valFontPx}px "Plus Jakarta Sans", "Arial Black", sans-serif`;

    // Text ink outline for high cartoon contrast
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(subText, w / 2, 68, rw - 20);

    ctx.fillStyle = isHovered ? '#fde047' : isSpecial ? '#fef08a' : '#ffffff';
    ctx.fillText(subText, w / 2, 68, rw - 20);
}

/**
 * Dynamically creates a 3D Holographic Quantum Multiplier Projection ("3.12x")
 * with strict bounding-box fit so no characters ever overflow the frame.
 */
export function createGraffitiMultiplierTexture(
    multiplierText: string,
    neonColor: string
): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 256);

    const grad = ctx.createRadialGradient(256, 128, 12, 256, 128, 210);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    grad.addColorStop(0.65, 'rgba(9, 14, 28, 0.88)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(44, 48, 424, 160, 24);
    ctx.fill();

    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    const fontSize = multiplierText.length > 7 ? 56 : multiplierText.length > 5 ? 66 : 76;
    ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", "JetBrains Mono", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(multiplierText, 256, 129, 380);
    ctx.shadowBlur = 0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
