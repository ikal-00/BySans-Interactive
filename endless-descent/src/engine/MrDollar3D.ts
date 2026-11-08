import * as THREE from 'three';
import gsap from 'gsap';
import type { PBRTexturePack } from './Textures3D';

const ENTRANCE_LINES = [
    "Step right up, spacefarer! Let's spin!",
    'Welcome to the big wheel, kid!',
    'Feeling lucky out here in the void?',
    'Eyes on the wheel, astronaut!'
];

const SPIN_LAUNCH_LINES = [
    'Round and round she goes!',
    'Hold onto your helmet, kid!',
    'Big money! Let her rip!',
    "Let's see what fortune brings!"
];

const NEAR_MISS_LINES = [
    'Ooh, look how close this is...',
    'Easy now... watch that pointer!'
];

const JACKPOT_WIN_LINES = [
    'JACKPOT BABY! Cosmic cash!',
    'Pure gold, partner! Spend it well!',
    'Now THAT is how we roll!'
];

const NORMAL_WIN_LINES = [
    'Cha-ching! Nice haul, kid!',
    'Winner, winner! Straight to the bank!',
    'Not bad at all, space cowboy!'
];

const SLOT_WIN_LINES = [
    'The Arcade Vault! Hit those reels!',
    'Bonus time! Pull that lever, kid!'
];

const EXTRA_SPIN_LINES = [
    'Encore! Give me one more spin!',
    'On the house! Spin it again!'
];

const WIPEOUT_LINES = [
    'Ouch! The house sends its regards!',
    'Tough break, spaceman!',
    'Boom! Better luck next drop, kid!'
];

function pickLine(lines: string[], seedHint: number): string {
    const idx = Math.abs(Math.floor(seedHint)) % lines.length;
    return lines[idx];
}

/**
 * Generates an inflated BackSide outline geometry with welded smoothed vertex normals
 * so extruded bevels, tubes, gloves, shoes, and top hat have continuous bold comic ink outlines.
 */
function makeSmoothComicOutlineGeo(srcGeo: THREE.BufferGeometry, thickness: number): THREE.BufferGeometry {
    const outlineGeo = srcGeo.clone();
    outlineGeo.computeVertexNormals();
    const posAttr = outlineGeo.attributes.position;
    const normAttr = outlineGeo.attributes.normal;
    const dirMap = new Map<string, Map<string, [number, number, number]>>();

    for (let i = 0; i < posAttr.count; i++) {
        const pKey = `${Math.round(posAttr.getX(i) * 1500)},${Math.round(posAttr.getY(i) * 1500)},${Math.round(posAttr.getZ(i) * 1500)}`;
        const nx = normAttr.getX(i);
        const ny = normAttr.getY(i);
        const nz = normAttr.getZ(i);
        const nKey = `${Math.round(nx * 40)},${Math.round(ny * 40)},${Math.round(nz * 40)}`;
        let bucket = dirMap.get(pKey);
        if (!bucket) {
            bucket = new Map();
            dirMap.set(pKey, bucket);
        }
        if (!bucket.has(nKey)) bucket.set(nKey, [nx, ny, nz]);
    }

    const avgMap = new Map<string, [number, number, number]>();
    for (const [pKey, bucket] of dirMap.entries()) {
        let sx = 0;
        let sy = 0;
        let sz = 0;
        for (const [nx, ny, nz] of bucket.values()) {
            sx += nx;
            sy += ny;
            sz += nz;
        }
        const len = Math.hypot(sx, sy, sz) || 1;
        avgMap.set(pKey, [sx / len, sy / len, sz / len]);
    }

    for (let i = 0; i < posAttr.count; i++) {
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        const pz = posAttr.getZ(i);
        const pKey = `${Math.round(px * 1500)},${Math.round(py * 1500)},${Math.round(pz * 1500)}`;
        const [ax, ay, az] = avgMap.get(pKey) || [0, 0, 1];
        posAttr.setXYZ(i, px + ax * thickness, py + ay * thickness, pz + az * thickness);
    }
    posAttr.needsUpdate = true;
    return outlineGeo;
}

function applyPlanarXYUVs(geo: THREE.BufferGeometry) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const spanX = Math.max(0.001, bb.max.x - bb.min.x);
    const spanY = Math.max(0.001, bb.max.y - bb.min.y);
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
        uvs[i * 2] = (pos.getX(i) - bb.min.x) / spanX;
        uvs[i * 2 + 1] = (pos.getY(i) - bb.min.y) / spanY;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

function createDollarFrontGouacheTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Rich vintage banknote sage-emerald gouache gradient
    const baseGrad = ctx.createRadialGradient(470, 440, 60, 512, 512, 560);
    baseGrad.addColorStop(0.0, '#96db7b');
    baseGrad.addColorStop(0.38, '#74be59');
    baseGrad.addColorStop(0.75, '#559c3e');
    baseGrad.addColorStop(1.0, '#3a7229');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Organic painterly gouache mottling patches (deterministic PRNG)
    let seed = 918273;
    const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };

    for (let i = 0; i < 240; i++) {
        const x = rand() * 1024;
        const y = rand() * 1024;
        const rx = 22 + rand() * 78;
        const ry = 16 + rand() * 54;
        const rot = rand() * Math.PI;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle =
            i % 3 === 0
                ? 'rgba(176, 238, 148, 0.14)'
                : i % 3 === 1
                  ? 'rgba(42, 88, 30, 0.12)'
                  : 'rgba(255, 252, 220, 0.07)';
        ctx.fill();
        ctx.restore();
    }

    // Lush painterly gouache brush strokes & soft organic edge shading (no rigid grid lines!)
    for (let i = 0; i < 160; i++) {
        const bx = rand() * 1024;
        const by = rand() * 1024;
        const distEdge = Math.hypot(bx - 512, by - 512);
        if (distEdge > 300) {
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(-0.65 + (rand() - 0.5) * 0.25);
            ctx.strokeStyle = 'rgba(20, 46, 14, 0.22)';
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(-16, 0);
            ctx.lineTo(16, 0);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Fine vintage bill ink scratches & weathering ticks
    ctx.strokeStyle = 'rgba(15, 32, 11, 0.36)';
    ctx.lineWidth = 2.2;
    for (let s = 0; s < 45; s++) {
        const sx = 80 + rand() * 864;
        const sy = 80 + rand() * 864;
        const ang = rand() * Math.PI;
        const len = 8 + rand() * 20;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function createDollarSideSlabTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0.0, '#467f34');
    grad.addColorStop(0.5, '#315f24');
    grad.addColorStop(1.0, '#1f4016');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Dense comic book side-extrusion pen hatching matching reference image
    ctx.strokeStyle = 'rgba(10, 22, 8, 0.52)';
    ctx.lineWidth = 4;
    for (let i = -512; i < 1024; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 240, 512);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createTopHatSilkTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cylinder UV wraps 0..1 around circumference; front-center is around u = 0.25 / 0.75 depending on rotation
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0.0, '#141619');
    grad.addColorStop(0.18, '#23272e');
    grad.addColorStop(0.30, '#4a5058'); // Crisp vertical silk stovepipe sheen!
    grad.addColorStop(0.40, '#262a31');
    grad.addColorStop(0.65, '#121417');
    grad.addColorStop(1.0, '#141619');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Comic cross-hatch shading on the shadow half of the silk crown
    ctx.strokeStyle = 'rgba(5, 6, 8, 0.62)';
    ctx.lineWidth = 3.5;
    for (let x = 480; x < 980; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 70, 512);
        ctx.stroke();
    }
    for (let y = 20; y < 512; y += 22) {
        ctx.beginPath();
        ctx.moveTo(500, y);
        ctx.lineTo(960, y + 36);
        ctx.stroke();
    }

    // Subtle top rim highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(0, 0, 1024, 18);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
}

function createHatBandRibbonTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Deep burgundy-crimson ribbon with warm antique-amber center stripe (matching reference!)
    ctx.fillStyle = '#0d0908';
    ctx.fillRect(0, 0, 512, 128);

    const crimGrad = ctx.createLinearGradient(0, 0, 512, 0);
    crimGrad.addColorStop(0.0, '#5f1612');
    crimGrad.addColorStop(0.32, '#a82b22');
    crimGrad.addColorStop(0.68, '#741b16');
    crimGrad.addColorStop(1.0, '#4c110e');
    ctx.fillStyle = crimGrad;
    ctx.fillRect(0, 10, 512, 108);

    const goldGrad = ctx.createLinearGradient(0, 0, 512, 0);
    goldGrad.addColorStop(0.0, '#9a5219');
    goldGrad.addColorStop(0.32, '#f09a36');
    goldGrad.addColorStop(0.68, '#b8631f');
    goldGrad.addColorStop(1.0, '#7c3f12');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 44, 512, 40);

    ctx.fillStyle = '#0d0908';
    ctx.fillRect(0, 39, 512, 6);
    ctx.fillRect(0, 83, 512, 6);

    // Ribbon keeper fold on right side
    ctx.fillStyle = '#8b231c';
    ctx.fillRect(365, 10, 34, 108);
    ctx.strokeStyle = '#0d0908';
    ctx.lineWidth = 6;
    ctx.strokeRect(365, 10, 34, 108);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
}

function createSpectacleLensTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const g = ctx.createRadialGradient(110, 100, 18, 128, 128, 126);
    g.addColorStop(0, 'rgba(209, 250, 229, 0.10)');
    g.addColorStop(0.75, 'rgba(167, 243, 208, 0.16)');
    g.addColorStop(1, 'rgba(110, 231, 183, 0.28)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    // Classic diagonal white comic lens glare streaks positioned cleanly on lower-left so pupils stay 100% crisp!
    ctx.save();
    ctx.translate(128, 152);
    ctx.rotate(-0.62);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.fillRect(-84, 10, 168, 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(-72, 32, 144, 8);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function createGoldFiligreePommelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const g = ctx.createRadialGradient(96, 86, 10, 128, 128, 128);
    g.addColorStop(0.0, '#fffbeb');
    g.addColorStop(0.28, '#fde047');
    g.addColorStop(0.68, '#eab308');
    g.addColorStop(1.0, '#92400e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    // Ornate engraved scrollwork rings matching the gentleman cane pommel in reference
    ctx.strokeStyle = 'rgba(92, 38, 6, 0.65)';
    ctx.lineWidth = 4.5;
    for (let x = 20; x < 256; x += 42) {
        ctx.beginPath();
        ctx.arc(x, 152, 16, 0, Math.PI * 1.65);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 20, 184, 13, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
}

export class MrDollar3D {
    public readonly root: THREE.Group;
    public readonly bodyPivot: THREE.Group;
    public readonly hatGroup: THREE.Group;
    public readonly caneArmPivot: THREE.Group;
    public readonly spinArmShoulder: THREE.Group;
    public readonly spinArmElbow: THREE.Group;
    public readonly leftLegPivot: THREE.Group;
    public readonly rightLegPivot: THREE.Group;

    private readonly leftBrow: THREE.Group;
    private readonly rightBrow: THREE.Group;
    private readonly leftPupil: THREE.Group;
    private readonly rightPupil: THREE.Group;
    private readonly mouthTalkMesh: THREE.Mesh;

    private speechEl: HTMLDivElement | null = null;
    private speechHideTimer: ReturnType<typeof setTimeout> | null = null;
    private isSpeaking = false;
    private isPerformingAction = false;
    private lineCounter = 0;
    private readonly scratchHeadWorld = new THREE.Vector3();

    constructor(textures: PBRTexturePack) {
        this.root = new THREE.Group();
        this.bodyPivot = new THREE.Group();
        this.root.add(this.bodyPivot);

        const inkOutlineMat = new THREE.MeshBasicMaterial({
            color: 0x080a07,
            side: THREE.BackSide,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: 2,
            polygonOffsetUnits: 2
        });
        const solidBlackInkMat = new THREE.MeshBasicMaterial({ color: 0x0d100c });

        const frontTex = createDollarFrontGouacheTexture();
        const sideTex = createDollarSideSlabTexture();
        const topHatTex = createTopHatSilkTexture();
        const hatBandTex = createHatBandRibbonTexture();
        const lensTex = createSpectacleLensTexture();
        const pommelTex = createGoldFiligreePommelTexture();

        const dollarFrontMat = new THREE.MeshToonMaterial({
            map: frontTex,
            gradientMap: textures.toonGradientMap
        });
        const dollarSideMat = new THREE.MeshToonMaterial({
            map: sideTex,
            gradientMap: textures.toonGradientMap
        });
        const limbGreenMat = new THREE.MeshToonMaterial({
            color: 0x6ab54f,
            gradientMap: textures.toonGradientMap
        });
        const gloveWhiteMat = new THREE.MeshToonMaterial({
            color: 0xf8fafc,
            gradientMap: textures.toonGradientMap
        });
        const scleraWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const topHatSilkMat = new THREE.MeshStandardMaterial({
            map: topHatTex,
            roughness: 0.42,
            metalness: 0.14
        });
        const topHatBrimMat = new THREE.MeshStandardMaterial({
            color: 0x1d2025,
            roughness: 0.38,
            metalness: 0.16
        });
        const hatBandMat = new THREE.MeshStandardMaterial({
            map: hatBandTex,
            roughness: 0.46,
            metalness: 0.12
        });
        const goldPommelMat = new THREE.MeshStandardMaterial({
            map: pommelTex,
            emissive: 0x78350f,
            emissiveIntensity: 0.22,
            roughness: 0.22,
            metalness: 0.65
        });
        const goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0x78350f,
            emissiveIntensity: 0.16,
            roughness: 0.26,
            metalness: 0.62
        });
        const ebonyCaneMat = new THREE.MeshStandardMaterial({
            color: 0x181c24,
            roughness: 0.18,
            metalness: 0.28
        });
        const patentShoeMat = new THREE.MeshToonMaterial({
            color: 0x2f3642,
            gradientMap: textures.toonGradientMap
        });

        // =====================================================================
        // 1. SCULPTED 3D '$' SLAB BODY (Pixel-Matched to Reference Artwork)
        // =====================================================================
        const dollarShape = new THREE.Shape();
        // Top vertical stem tab (tucked under tilted silk top hat)
        dollarShape.moveTo(-0.15, 1.24);
        dollarShape.lineTo(0.12, 1.24);
        dollarShape.lineTo(0.12, 1.08);
        // Upper-right 'S' arch & flat chisel terminal
        dollarShape.bezierCurveTo(0.54, 1.06, 0.84, 0.88, 0.91, 0.56);
        dollarShape.lineTo(0.43, 0.44);
        // Inner right cheek/neck waist
        dollarShape.quadraticCurveTo(0.37, 0.31, 0.41, 0.18);
        // Bold diagonal sweep into lower-right 'S' belly
        dollarShape.bezierCurveTo(0.76, -0.02, 0.94, -0.30, 0.88, -0.58);
        dollarShape.bezierCurveTo(0.81, -0.86, 0.52, -0.98, 0.15, -0.98);
        // Chunky bottom vertical stem block
        dollarShape.lineTo(0.15, -1.23);
        dollarShape.lineTo(-0.21, -1.23);
        dollarShape.lineTo(-0.21, -0.96);
        // Lower-left 'S' tail & flat horizontal serif terminal
        dollarShape.bezierCurveTo(-0.62, -0.92, -0.88, -0.66, -0.91, -0.24);
        dollarShape.lineTo(-0.28, -0.19);
        // Central stem left transition into upper-left 'S' curve
        dollarShape.quadraticCurveTo(-0.28, -0.05, -0.44, 0.04);
        dollarShape.bezierCurveTo(-0.82, 0.22, -0.86, 0.62, -0.66, 0.88);
        dollarShape.bezierCurveTo(-0.51, 1.06, -0.32, 1.11, -0.15, 1.09);
        dollarShape.closePath();

        // True 'D'-shaped through-hole counter in the lower-right 'S' belly
        const dHole = new THREE.Path();
        dHole.moveTo(0.14, -0.08);
        dHole.lineTo(0.14, -0.64);
        dHole.bezierCurveTo(0.38, -0.63, 0.51, -0.48, 0.50, -0.34);
        dHole.bezierCurveTo(0.49, -0.19, 0.34, -0.09, 0.14, -0.08);
        dHole.closePath();
        dollarShape.holes.push(dHole);

        const bodyDepth = 0.44;
        const dollarGeo = new THREE.ExtrudeGeometry(dollarShape, {
            depth: bodyDepth,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.042,
            bevelThickness: 0.042,
            curveSegments: 28
        });
        dollarGeo.translate(0, 0, -bodyDepth * 0.5);
        applyPlanarXYUVs(dollarGeo);

        // ExtrudeGeometry group 0 = front/back caps, group 1 = extruded side & bevel walls
        const dollarMesh = new THREE.Mesh(dollarGeo, [dollarFrontMat, dollarSideMat]);
        const dollarOutline = new THREE.Mesh(makeSmoothComicOutlineGeo(dollarGeo, 0.050), inkOutlineMat);
        dollarOutline.scale.set(1, 1, 0.76);
        dollarOutline.position.z = -0.055; // Keeps all Earcut hole-bridge outline edges cleanly behind +Z front face!
        dollarOutline.renderOrder = -1;
        this.bodyPivot.add(dollarMesh, dollarOutline);

        // Sculpted 3D Comic Ink Relief Groove on front (+Z) articulating the '|' stem overlap on the lower-left tail
        const stemCreaseCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.21, -0.96, 0.268),
            new THREE.Vector3(-0.21, -0.52, 0.268),
            new THREE.Vector3(-0.21, -0.09, 0.268)
        ]);
        const stemCreaseGeo = new THREE.TubeGeometry(stemCreaseCurve, 12, 0.015, 8, false);
        this.bodyPivot.add(new THREE.Mesh(stemCreaseGeo, solidBlackInkMat));

        // =====================================================================
        // 2. EXPRESSIVE 3D FACE RIG (Eyes, Suave Eyelids, Brows, Nose, Glasses, Smirk)
        // =====================================================================
        const faceGroup = new THREE.Group();
        faceGroup.position.set(0, 0, 0.265);
        this.bodyPivot.add(faceGroup);

        const buildComicEye = (ex: number, ey: number, lidTiltZ: number): THREE.Group => {
            const eyeGrp = new THREE.Group();
            eyeGrp.position.set(ex, ey, 0);

            // White eyeball
            const ballGeo = new THREE.SphereGeometry(0.145, 22, 18);
            ballGeo.scale(0.95, 1.18, 0.45);
            const ballMesh = new THREE.Mesh(ballGeo, scleraWhiteMat);
            const ballOut = new THREE.Mesh(makeSmoothComicOutlineGeo(ballGeo, 0.022), inkOutlineMat);
            ballOut.renderOrder = -1;
            eyeGrp.add(ballMesh, ballOut);

            // Suave half-lidded green upper eyelid hood covering upper ~36% of sclera + crisp black lash crease along its rim!
            const lidGeo = new THREE.SphereGeometry(0.155, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
            lidGeo.scale(0.98, 1.18, 0.52);
            const lidGrp = new THREE.Group();
            lidGrp.rotation.x = 0.14;
            lidGrp.rotation.z = lidTiltZ;
            const lidMesh = new THREE.Mesh(lidGeo, limbGreenMat);
            const lidOut = new THREE.Mesh(makeSmoothComicOutlineGeo(lidGeo, 0.022), inkOutlineMat);
            lidOut.renderOrder = -1;
            lidGrp.add(lidMesh, lidOut);

            // Bold black upper eyelash crease hugging the exact lower rim of the green eyelid
            const lashCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.136, 0.008, 0.068),
                new THREE.Vector3(0.0, 0.018, 0.082),
                new THREE.Vector3(0.136, 0.005, 0.068)
            ]);
            const lashMesh = new THREE.Mesh(new THREE.TubeGeometry(lashCurve, 12, 0.015, 8, false), solidBlackInkMat);
            lashMesh.rotation.z = lidTiltZ;
            eyeGrp.add(lidGrp, lashMesh);

            // Rich dark-emerald & black pupil + dual white catchlights centered cleanly in open sclera window!
            const pupilGrp = new THREE.Group();
            pupilGrp.position.set(0.018, -0.044, 0.072);

            const irisGeo = new THREE.CircleGeometry(0.078, 24);
            const irisMat = new THREE.MeshBasicMaterial({ color: 0x123115 });
            const irisMesh = new THREE.Mesh(irisGeo, irisMat);
            pupilGrp.add(irisMesh);

            const coreGeo = new THREE.CircleGeometry(0.058, 20);
            const coreMesh = new THREE.Mesh(coreGeo, solidBlackInkMat);
            coreMesh.position.z = 0.002;
            pupilGrp.add(coreMesh);

            const glintBig = new THREE.Mesh(new THREE.CircleGeometry(0.024, 14), scleraWhiteMat);
            glintBig.position.set(-0.024, 0.022, 0.005);
            const glintSmall = new THREE.Mesh(new THREE.CircleGeometry(0.011, 10), scleraWhiteMat);
            glintSmall.position.set(0.024, -0.022, 0.005);
            pupilGrp.add(glintBig, glintSmall);

            eyeGrp.add(pupilGrp);
            faceGroup.add(eyeGrp);
            return pupilGrp;
        };

        this.leftPupil = buildComicEye(-0.31, 0.62, 0.10);
        this.rightPupil = buildComicEye(0.11, 0.61, -0.14);

        // Bold Glossy-Black Sculpted 3D Eyebrows (Right brow cocked in charismatic showman arch!)
        this.leftBrow = new THREE.Group();
        this.leftBrow.position.set(-0.32, 0.84, 0.035);
        const lBrowCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.15, -0.05, 0),
            new THREE.Vector3(-0.03, 0.04, 0.01),
            new THREE.Vector3(0.12, 0.01, 0)
        ]);
        const lBrowMesh = new THREE.Mesh(new THREE.TubeGeometry(lBrowCurve, 14, 0.032, 10, false), solidBlackInkMat);
        this.leftBrow.add(lBrowMesh);
        faceGroup.add(this.leftBrow);

        this.rightBrow = new THREE.Group();
        this.rightBrow.position.set(0.12, 0.86, 0.035);
        const rBrowCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.14, -0.03, 0),
            new THREE.Vector3(0.02, 0.075, 0.015),
            new THREE.Vector3(0.17, -0.02, 0)
        ]);
        const rBrowMesh = new THREE.Mesh(new THREE.TubeGeometry(rBrowCurve, 14, 0.034, 10, false), solidBlackInkMat);
        this.rightBrow.add(rBrowMesh);
        faceGroup.add(this.rightBrow);

        // Sculpted Bulbous Green Comic Nose
        const noseGroup = new THREE.Group();
        noseGroup.position.set(-0.11, 0.43, 0.065);
        const noseMainGeo = new THREE.SphereGeometry(0.105, 20, 16);
        noseMainGeo.scale(1.08, 0.92, 0.95);
        const noseMainMesh = new THREE.Mesh(noseMainGeo, limbGreenMat);
        const noseMainOut = new THREE.Mesh(makeSmoothComicOutlineGeo(noseMainGeo, 0.022), inkOutlineMat);
        noseMainOut.renderOrder = -1;
        noseGroup.add(noseMainMesh, noseMainOut);
        faceGroup.add(noseGroup);

        // Iconic Round Wire-Rim Gentleman Spectacles with Translucent Glare Lenses
        const glassesGroup = new THREE.Group();
        glassesGroup.position.set(0, 0.50, 0.115);
        faceGroup.add(glassesGroup);

        const rimGeo = new THREE.TorusGeometry(0.165, 0.018, 12, 36);
        const lensGeo = new THREE.CircleGeometry(0.156, 32);
        const lensMat = new THREE.MeshBasicMaterial({
            map: lensTex,
            transparent: true,
            opacity: 0.88,
            depthWrite: false
        });

        for (const gx of [-0.33, 0.11]) {
            const rim = new THREE.Mesh(rimGeo, solidBlackInkMat);
            rim.position.set(gx, 0, 0);
            const lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(gx, 0, 0.003);
            glassesGroup.add(rim, lens);
        }

        // Nose bridge & outer spectacle temple arms
        const bridgeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.165, 0.02, 0),
            new THREE.Vector3(-0.11, 0.065, 0.015),
            new THREE.Vector3(-0.055, 0.02, 0)
        ]);
        glassesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 10, 0.015, 8, false), solidBlackInkMat));

        const leftTempleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.495, 0.01, 0),
            new THREE.Vector3(-0.66, 0.04, -0.10)
        ]);
        const rightTempleCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.275, 0.01, 0),
            new THREE.Vector3(0.43, 0.04, -0.10)
        ]);
        glassesGroup.add(
            new THREE.Mesh(new THREE.TubeGeometry(leftTempleCurve, 8, 0.014, 8, false), solidBlackInkMat),
            new THREE.Mesh(new THREE.TubeGeometry(rightTempleCurve, 8, 0.014, 8, false), solidBlackInkMat)
        );

        // Confident Showman Smirk + Animated Speaking Mouth
        const smirkCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.30, 0.28, 0.01),
            new THREE.Vector3(-0.12, 0.21, 0.025),
            new THREE.Vector3(0.09, 0.27, 0.015),
            new THREE.Vector3(0.16, 0.32, 0.005)
        ]);
        faceGroup.add(new THREE.Mesh(new THREE.TubeGeometry(smirkCurve, 18, 0.018, 8, false), solidBlackInkMat));

        // Corner cheek dimple ticks & lower-chin crease
        const leftDimple = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.33, 0.31, 0.01),
            new THREE.Vector3(-0.29, 0.25, 0.01)
        ]);
        const rightDimple = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.15, 0.35, 0.005),
            new THREE.Vector3(0.19, 0.29, 0.005)
        ]);
        const chinCrease = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.18, 0.14, 0.015),
            new THREE.Vector3(-0.10, 0.12, 0.02),
            new THREE.Vector3(-0.02, 0.14, 0.015)
        ]);
        faceGroup.add(
            new THREE.Mesh(new THREE.TubeGeometry(leftDimple, 6, 0.013, 6, false), solidBlackInkMat),
            new THREE.Mesh(new THREE.TubeGeometry(rightDimple, 6, 0.013, 6, false), solidBlackInkMat),
            new THREE.Mesh(new THREE.TubeGeometry(chinCrease, 8, 0.012, 6, false), solidBlackInkMat)
        );

        // Open talking mouth interior (scales Y dynamically when delivering English lines!)
        const talkGeo = new THREE.CircleGeometry(0.095, 20, Math.PI, Math.PI);
        const talkMat = new THREE.MeshBasicMaterial({ color: 0x3b0d11 });
        this.mouthTalkMesh = new THREE.Mesh(talkGeo, talkMat);
        this.mouthTalkMesh.position.set(-0.08, 0.25, 0.022);
        this.mouthTalkMesh.scale.set(1.25, 0.01, 1);
        this.mouthTalkMesh.visible = false;
        faceGroup.add(this.mouthTalkMesh);

        // =====================================================================
        // 3. JAUNTY TILTED SILK STOVEPIPE TOP HAT (Crimson & Gold Band)
        // =====================================================================
        this.hatGroup = new THREE.Group();
        this.hatGroup.position.set(0.20, 1.15, 0.02);
        this.hatGroup.rotation.set(-0.06, 0.08, -0.32); // Exact -18.3 deg jaunty clockwise tilt!
        this.bodyPivot.add(this.hatGroup);

        // Swooping saddle-curved gentleman's brim
        const brimGeo = new THREE.CylinderGeometry(0.76, 0.76, 0.065, 44, 1);
        brimGeo.scale(1.04, 1.0, 0.84);
        const bPos = brimGeo.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
            const bx = bPos.getX(i);
            const bz = bPos.getZ(i);
            const rNorm = Math.min(1, Math.hypot(bx, bz) / 0.76);
            // Curl left & right wings gracefully upward like a classic showman top hat!
            const curlY = Math.pow(Math.abs(bx) / 0.78, 2.0) * 0.14 - Math.pow(Math.abs(bz) / 0.65, 2.0) * 0.03;
            bPos.setY(i, bPos.getY(i) + curlY * rNorm);
        }
        brimGeo.computeVertexNormals();
        const brimMesh = new THREE.Mesh(brimGeo, topHatBrimMat);
        const brimOut = new THREE.Mesh(makeSmoothComicOutlineGeo(brimGeo, 0.036), inkOutlineMat);
        brimOut.renderOrder = -1;
        this.hatGroup.add(brimMesh, brimOut);

        // Rolled outer brim lip
        const brimLipGeo = new THREE.TorusGeometry(0.75, 0.036, 12, 48);
        brimLipGeo.rotateX(Math.PI / 2);
        brimLipGeo.scale(1.04, 1.0, 0.84);
        const blPos = brimLipGeo.attributes.position;
        for (let i = 0; i < blPos.count; i++) {
            const bx = blPos.getX(i);
            const bz = blPos.getZ(i);
            const curlY = Math.pow(Math.abs(bx) / 0.78, 2.0) * 0.14 - Math.pow(Math.abs(bz) / 0.65, 2.0) * 0.03;
            blPos.setY(i, blPos.getY(i) + curlY);
        }
        brimLipGeo.computeVertexNormals();
        const brimLipMesh = new THREE.Mesh(brimLipGeo, topHatBrimMat);
        const brimLipOut = new THREE.Mesh(makeSmoothComicOutlineGeo(brimLipGeo, 0.026), inkOutlineMat);
        brimLipOut.renderOrder = -1;
        this.hatGroup.add(brimLipMesh, brimLipOut);

        // Flared Silk Stovepipe Crown (wider at top than base, matching reference!)
        const crownHeight = 0.76;
        const crownGeo = new THREE.CylinderGeometry(0.52, 0.43, crownHeight, 40, 1);
        crownGeo.scale(1.02, 1.0, 0.90);
        crownGeo.rotateY(-Math.PI * 0.35); // Align vertical satin sheen strip to front-left!
        const crownMesh = new THREE.Mesh(crownGeo, topHatSilkMat);
        crownMesh.position.y = crownHeight * 0.5 + 0.02;
        const crownOut = new THREE.Mesh(makeSmoothComicOutlineGeo(crownGeo, 0.038), inkOutlineMat);
        crownOut.position.copy(crownMesh.position);
        crownOut.renderOrder = -1;
        this.hatGroup.add(crownMesh, crownOut);

        // Rounded crown top bevel ring
        const crownTopLipGeo = new THREE.TorusGeometry(0.505, 0.026, 12, 40);
        crownTopLipGeo.rotateX(Math.PI / 2);
        crownTopLipGeo.scale(1.02, 1.0, 0.90);
        const crownTopLip = new THREE.Mesh(crownTopLipGeo, topHatBrimMat);
        crownTopLip.position.y = crownHeight + 0.015;
        this.hatGroup.add(crownTopLip);

        // Burgundy-Crimson & Gold Striped Hatband
        const bandGeo = new THREE.CylinderGeometry(0.456, 0.440, 0.17, 40, 1);
        bandGeo.scale(1.025, 1.0, 0.905);
        bandGeo.rotateY(-Math.PI * 0.45);
        const bandMesh = new THREE.Mesh(bandGeo, hatBandMat);
        bandMesh.position.y = 0.11;
        const bandOut = new THREE.Mesh(makeSmoothComicOutlineGeo(bandGeo, 0.026), inkOutlineMat);
        bandOut.position.copy(bandMesh.position);
        bandOut.renderOrder = -1;
        this.hatGroup.add(bandMesh, bandOut);

        // =====================================================================
        // 4. RIGHT ARM (Viewer's Left) + PUFFY GLOVE + GOLD-POMMEL BLACK CANE
        // =====================================================================
        this.caneArmPivot = new THREE.Group();
        this.caneArmPivot.position.set(-0.62, 0.08, 0.04);
        this.bodyPivot.add(this.caneArmPivot);

        const rightArmCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-0.28, -0.14, 0.06),
            new THREE.Vector3(-0.56, -0.22, 0.14),
            new THREE.Vector3(-0.76, -0.18, 0.18)
        ]);
        const rightArmGeo = new THREE.TubeGeometry(rightArmCurve, 20, 0.068, 14, false);
        const rightArmMesh = new THREE.Mesh(rightArmGeo, limbGreenMat);
        const rightArmOut = new THREE.Mesh(makeSmoothComicOutlineGeo(rightArmGeo, 0.028), inkOutlineMat);
        rightArmOut.renderOrder = -1;
        this.caneArmPivot.add(rightArmMesh, rightArmOut);

        // Puffy White Glove draped regally atop the Gold Cane Pommel
        const caneHandGroup = new THREE.Group();
        caneHandGroup.position.set(-0.80, -0.20, 0.19);
        this.caneArmPivot.add(caneHandGroup);

        const cuffGeo = new THREE.TorusGeometry(0.088, 0.036, 12, 24);
        cuffGeo.rotateY(Math.PI / 2 - 0.25);
        const cuffMesh = new THREE.Mesh(cuffGeo, gloveWhiteMat);
        const cuffOut = new THREE.Mesh(makeSmoothComicOutlineGeo(cuffGeo, 0.022), inkOutlineMat);
        cuffOut.renderOrder = -1;
        caneHandGroup.add(cuffMesh, cuffOut);

        const palmGeo = new THREE.SphereGeometry(0.135, 20, 16);
        palmGeo.scale(1.22, 0.86, 1.05);
        const palmMesh = new THREE.Mesh(palmGeo, gloveWhiteMat);
        palmMesh.position.set(-0.12, -0.02, 0.02);
        const palmOut = new THREE.Mesh(makeSmoothComicOutlineGeo(palmGeo, 0.026), inkOutlineMat);
        palmOut.position.copy(palmMesh.position);
        palmOut.renderOrder = -1;
        caneHandGroup.add(palmMesh, palmOut);

        // 4 Sculpted Cartoon Glove Fingers draped naturally downward over the front-left of the gold pommel!
        const fingerGeo = new THREE.CapsuleGeometry(0.042, 0.11, 8, 12);
        const fingerOutGeo = makeSmoothComicOutlineGeo(fingerGeo, 0.020);
        for (let f = 0; f < 4; f++) {
            const fGrp = new THREE.Group();
            fGrp.position.set(-0.24 + f * 0.042, -0.08 - (3 - f) * 0.015, 0.09 + f * 0.012);
            fGrp.rotation.set(0.28, 0.10, 0.36 - f * 0.08);
            const fMesh = new THREE.Mesh(fingerGeo, gloveWhiteMat);
            const fOut = new THREE.Mesh(fingerOutGeo, inkOutlineMat);
            fOut.renderOrder = -1;
            fGrp.add(fMesh, fOut);
            caneHandGroup.add(fGrp);
        }
        // Thumb gripping inner side of pommel
        const thumbGrp = new THREE.Group();
        thumbGrp.position.set(-0.04, -0.08, 0.13);
        thumbGrp.rotation.set(0.35, -0.25, -0.45);
        const tMesh = new THREE.Mesh(fingerGeo, gloveWhiteMat);
        const tOut = new THREE.Mesh(fingerOutGeo, inkOutlineMat);
        tOut.renderOrder = -1;
        thumbGrp.add(tMesh, tOut);
        caneHandGroup.add(thumbGrp);

        // 3 Classic Black Knuckle Darts on top of glove
        for (const dz of [-0.035, 0.005, 0.045]) {
            const dart = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.014), solidBlackInkMat);
            dart.position.set(-0.11, 0.095, dz + 0.02);
            dart.rotation.z = 0.12;
            caneHandGroup.add(dart);
        }

        // Ornate 24k Gold-Pommel Black Gentleman's Cane
        const caneGroup = new THREE.Group();
        caneGroup.position.set(-0.15, -0.17, 0.01);
        caneGroup.rotation.z = 0.13; // Stylish 7.5-deg dapper inward lean matching reference!
        caneHandGroup.add(caneGroup);

        const pommelGeo = new THREE.SphereGeometry(0.165, 24, 20);
        pommelGeo.scale(1.04, 0.96, 1.04);
        const pommelMesh = new THREE.Mesh(pommelGeo, goldPommelMat);
        const pommelOut = new THREE.Mesh(makeSmoothComicOutlineGeo(pommelGeo, 0.028), inkOutlineMat);
        pommelOut.renderOrder = -1;
        caneGroup.add(pommelMesh, pommelOut);

        const collar1Geo = new THREE.TorusGeometry(0.088, 0.026, 10, 24);
        collar1Geo.rotateX(Math.PI / 2);
        const collar1 = new THREE.Mesh(collar1Geo, goldTrimMat);
        collar1.position.y = -0.165;
        const collar2Geo = new THREE.CylinderGeometry(0.082, 0.064, 0.11, 20);
        const collar2 = new THREE.Mesh(collar2Geo, goldTrimMat);
        collar2.position.y = -0.22;
        const collar2Out = new THREE.Mesh(makeSmoothComicOutlineGeo(collar2Geo, 0.022), inkOutlineMat);
        collar2Out.position.copy(collar2.position);
        collar2Out.renderOrder = -1;
        caneGroup.add(collar1, collar2, collar2Out);

        const caneLen = 1.46;
        const caneShaftGeo = new THREE.CylinderGeometry(0.048, 0.032, caneLen, 18);
        const caneShaftMesh = new THREE.Mesh(caneShaftGeo, ebonyCaneMat);
        caneShaftMesh.position.y = -0.27 - caneLen * 0.5;
        const caneShaftOut = new THREE.Mesh(makeSmoothComicOutlineGeo(caneShaftGeo, 0.024), inkOutlineMat);
        caneShaftOut.position.copy(caneShaftMesh.position);
        caneShaftOut.renderOrder = -1;
        caneGroup.add(caneShaftMesh, caneShaftOut);

        // Crisp white comic specular highlight streak along the glossy black cane shaft
        const caneHighlight = new THREE.Mesh(
            new THREE.BoxGeometry(0.012, caneLen * 0.88, 0.012),
            new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
        );
        caneHighlight.position.set(-0.016, -0.27 - caneLen * 0.48, 0.036);
        caneGroup.add(caneHighlight);

        const tipFerruleGeo = new THREE.CylinderGeometry(0.033, 0.026, 0.15, 16);
        const tipFerruleMesh = new THREE.Mesh(tipFerruleGeo, goldTrimMat);
        tipFerruleMesh.position.y = -0.27 - caneLen - 0.06;
        const tipFerruleOut = new THREE.Mesh(makeSmoothComicOutlineGeo(tipFerruleGeo, 0.020), inkOutlineMat);
        tipFerruleOut.position.copy(tipFerruleMesh.position);
        tipFerruleOut.renderOrder = -1;
        caneGroup.add(tipFerruleMesh, tipFerruleOut);

        // =====================================================================
        // 5. ARTICULATED LEFT ARM (Viewer's Right — Hip Pose & Wheel-Spinning Arm!)
        // =====================================================================
        this.spinArmShoulder = new THREE.Group();
        this.spinArmShoulder.position.set(0.68, 0.08, 0.16);
        this.bodyPivot.add(this.spinArmShoulder);

        // Upper arm segment (+0.48 along local +X)
        const upperSegLen = 0.48;
        const upperArmGeo = new THREE.CapsuleGeometry(0.066, upperSegLen, 10, 16);
        upperArmGeo.rotateZ(-Math.PI / 2);
        upperArmGeo.translate(upperSegLen * 0.5, 0, 0);
        const upperArmMesh = new THREE.Mesh(upperArmGeo, limbGreenMat);
        const upperArmOut = new THREE.Mesh(makeSmoothComicOutlineGeo(upperArmGeo, 0.028), inkOutlineMat);
        upperArmOut.renderOrder = -1;
        this.spinArmShoulder.add(upperArmMesh, upperArmOut);

        // Elbow joint + Forearm segment (+0.46 along local +X)
        this.spinArmElbow = new THREE.Group();
        this.spinArmElbow.position.set(upperSegLen, 0, 0);
        this.spinArmShoulder.add(this.spinArmElbow);

        const foreSegLen = 0.46;
        const foreArmGeo = new THREE.CapsuleGeometry(0.064, foreSegLen, 10, 16);
        foreArmGeo.rotateZ(-Math.PI / 2);
        foreArmGeo.translate(foreSegLen * 0.5, 0, 0);
        const foreArmMesh = new THREE.Mesh(foreArmGeo, limbGreenMat);
        const foreArmOut = new THREE.Mesh(makeSmoothComicOutlineGeo(foreArmGeo, 0.028), inkOutlineMat);
        foreArmOut.renderOrder = -1;
        this.spinArmElbow.add(foreArmMesh, foreArmOut);

        // Puffy White Cartoon Glove at end of forearm (oriented so back of glove & 3 knuckle darts face +Z viewer!)
        const spinHandGroup = new THREE.Group();
        spinHandGroup.position.set(foreSegLen + 0.03, 0, 0);
        this.spinArmElbow.add(spinHandGroup);

        const sCuffGeo = new THREE.TorusGeometry(0.095, 0.038, 12, 24);
        sCuffGeo.rotateY(Math.PI / 2);
        const sCuffMesh = new THREE.Mesh(sCuffGeo, gloveWhiteMat);
        const sCuffOut = new THREE.Mesh(makeSmoothComicOutlineGeo(sCuffGeo, 0.022), inkOutlineMat);
        sCuffOut.renderOrder = -1;
        spinHandGroup.add(sCuffMesh, sCuffOut);

        const sPalmGeo = new THREE.SphereGeometry(0.15, 20, 16);
        sPalmGeo.scale(1.22, 1.04, 0.92);
        const sPalmMesh = new THREE.Mesh(sPalmGeo, gloveWhiteMat);
        sPalmMesh.position.set(0.15, 0, 0.02);
        const sPalmOut = new THREE.Mesh(makeSmoothComicOutlineGeo(sPalmGeo, 0.026), inkOutlineMat);
        sPalmOut.position.copy(sPalmMesh.position);
        sPalmOut.renderOrder = -1;
        spinHandGroup.add(sPalmMesh, sPalmOut);

        for (let f = 0; f < 4; f++) {
            const fGrp = new THREE.Group();
            fGrp.position.set(0.24, -0.075 + f * 0.05, 0.04);
            fGrp.rotation.set(0, -0.35, 0.22);
            const fMesh = new THREE.Mesh(fingerGeo, gloveWhiteMat);
            const fOut = new THREE.Mesh(fingerOutGeo, inkOutlineMat);
            fOut.renderOrder = -1;
            fGrp.add(fMesh, fOut);
            spinHandGroup.add(fGrp);
        }
        const sThumbGrp = new THREE.Group();
        sThumbGrp.position.set(0.15, 0.11, 0.07);
        sThumbGrp.rotation.set(0.25, -0.25, -0.55);
        const stMesh = new THREE.Mesh(fingerGeo, gloveWhiteMat);
        const stOut = new THREE.Mesh(fingerOutGeo, inkOutlineMat);
        stOut.renderOrder = -1;
        sThumbGrp.add(stMesh, stOut);
        spinHandGroup.add(sThumbGrp);

        for (const dy of [-0.042, 0.0, 0.042]) {
            const dart = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.016, 0.018), solidBlackInkMat);
            dart.position.set(0.14, dy, 0.15);
            spinHandGroup.add(dart);
        }

        // =====================================================================
        // 6. ARTICULATED LEGS & GLOSSY BLACK PATENT-LEATHER OXFORD DRESS SHOES
        // =====================================================================
        const buildLegAndOxfordShoe = (isRightSideViewer: boolean): THREE.Group => {
            const sx = isRightSideViewer ? 1 : -1;
            const legPivot = new THREE.Group();
            legPivot.position.set(isRightSideViewer ? 0.24 : -0.34, -0.90, 0.0);

            const legCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(sx * 0.12, -0.40, 0.04), // Outward cartoon knee bend!
                new THREE.Vector3(sx * 0.04, -0.78, 0.01)
            ]);
            const legGeo = new THREE.TubeGeometry(legCurve, 18, 0.072, 14, false);
            const legMesh = new THREE.Mesh(legGeo, limbGreenMat);
            const legOut = new THREE.Mesh(makeSmoothComicOutlineGeo(legGeo, 0.028), inkOutlineMat);
            legOut.renderOrder = -1;
            legPivot.add(legMesh, legOut);

            // Sculpted Glossy Charcoal-Black Gentleman's Oxford Dress Shoe (1.24x hero comic proportion!)
            const shoeGroup = new THREE.Group();
            shoeGroup.position.set(sx * 0.05, -0.84, 0.04);
            shoeGroup.scale.setScalar(1.24);
            // Turn outward in classic dapper V-stance matching reference!
            shoeGroup.rotation.y = sx * 1.05;
            legPivot.add(shoeGroup);

            // Ankle collar + vamp + rounded glossy toe box (oriented along +Z in shoe local space)
            const quarterGeo = new THREE.CylinderGeometry(0.115, 0.138, 0.18, 20);
            const quarterMesh = new THREE.Mesh(quarterGeo, patentShoeMat);
            quarterMesh.position.set(0, 0.045, -0.05);
            const quarterOut = new THREE.Mesh(makeSmoothComicOutlineGeo(quarterGeo, 0.024), inkOutlineMat);
            quarterOut.position.copy(quarterMesh.position);
            quarterOut.renderOrder = -1;
            shoeGroup.add(quarterMesh, quarterOut);

            const vampGeo = new THREE.SphereGeometry(0.168, 24, 18);
            vampGeo.scale(0.88, 0.70, 1.72);
            const vampMesh = new THREE.Mesh(vampGeo, patentShoeMat);
            vampMesh.position.set(0, -0.025, 0.14);
            const vampOut = new THREE.Mesh(makeSmoothComicOutlineGeo(vampGeo, 0.026), inkOutlineMat);
            vampOut.position.copy(vampMesh.position);
            vampOut.renderOrder = -1;
            shoeGroup.add(vampMesh, vampOut);

            // Stitched Toe-Cap Arch Seam + Crisp White Comic Specular Highlight
            const capSeamGeo = new THREE.TorusGeometry(0.132, 0.010, 8, 20, Math.PI);
            capSeamGeo.rotateY(0);
            const capSeam = new THREE.Mesh(capSeamGeo, solidBlackInkMat);
            capSeam.position.set(0, -0.03, 0.22);
            shoeGroup.add(capSeam);

            const toeShineGeo = new THREE.CapsuleGeometry(0.020, 0.10, 6, 10);
            toeShineGeo.rotateZ(Math.PI / 2);
            toeShineGeo.rotateY(0.35);
            const toeShine = new THREE.Mesh(toeShineGeo, scleraWhiteMat);
            toeShine.position.set(sx * -0.02, 0.04, 0.31);
            shoeGroup.add(toeShine);

            // 4 Sculpted Oxford Shoelace Cross-Bars
            for (let l = 0; l < 4; l++) {
                const laceGeo = new THREE.CapsuleGeometry(0.015, 0.095, 6, 8);
                laceGeo.rotateZ(Math.PI / 2);
                const lace = new THREE.Mesh(laceGeo, solidBlackInkMat);
                lace.position.set(0, 0.072 - l * 0.018, 0.05 + l * 0.042);
                shoeGroup.add(lace);
            }

            // Welted Sole + Distinct Raised Gentleman's Dress Heel
            const soleGeo = new THREE.BoxGeometry(0.28, 0.06, 0.60);
            const soleMesh = new THREE.Mesh(soleGeo, solidBlackInkMat);
            soleMesh.position.set(0, -0.11, 0.11);
            const heelGeo = new THREE.BoxGeometry(0.26, 0.085, 0.19);
            const heelMesh = new THREE.Mesh(heelGeo, solidBlackInkMat);
            heelMesh.position.set(0, -0.15, -0.09);
            shoeGroup.add(soleMesh, heelMesh);

            return legPivot;
        };

        this.rightLegPivot = buildLegAndOxfordShoe(false);
        this.leftLegPivot = buildLegAndOxfordShoe(true);
        this.bodyPivot.add(this.rightLegPivot, this.leftLegPivot);

        // Warm dedicated key & rim accent lights so Mr. Dollar's emerald gouache, silk hat & gold pommel pop!
        const hostKeyLight = new THREE.PointLight(0xfffbeb, 1.15, 11.0, 1.3);
        hostKeyLight.position.set(0.4, 1.2, 2.8);
        this.root.add(hostKeyLight);

        this.resetToIdlePose();
        this.ensureSpeechElement();
    }

    private ensureSpeechElement() {
        if (typeof document === 'undefined') return;
        let existing = document.getElementById('mr-dollar-speech-bubble') as HTMLDivElement | null;
        if (!existing) {
            existing = document.createElement('div');
            existing.id = 'mr-dollar-speech-bubble';
            Object.assign(existing.style, {
                position: 'fixed',
                left: '0px',
                top: '0px',
                transform: 'translate(-50%, -100%) scale(0.85)',
                transformOrigin: '50% 100%',
                padding: '9px 16px',
                maxWidth: 'min(240px, 80vw)',
                background: 'linear-gradient(180deg, #fffef7 0%, #fef3c7 100%)',
                color: '#0f172a',
                border: '3px solid #090d16',
                borderRadius: '16px',
                boxShadow: '0 6px 0 #090d16, 0 12px 24px rgba(0,0,0,0.45)',
                fontFamily: '"Plus Jakarta Sans", "Rajdhani", system-ui, sans-serif',
                fontWeight: '800',
                fontSize: '13.5px',
                lineHeight: '1.25',
                letterSpacing: '0.01em',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: '45',
                opacity: '0',
                transition: 'opacity 0.18s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
            });

            // Crisp comic speech tail pointing down toward Mr. Dollar's top hat
            const tailBorder = document.createElement('div');
            Object.assign(tailBorder.style, {
                position: 'absolute',
                left: '50%',
                bottom: '-13px',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: '13px solid #090d16'
            });
            const tailFill = document.createElement('div');
            Object.assign(tailFill.style, {
                position: 'absolute',
                left: '50%',
                bottom: '-8px',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '10px solid #fef3c7'
            });
            const textSpan = document.createElement('span');
            textSpan.className = 'mr-dollar-speech-text';
            existing.append(textSpan, tailBorder, tailFill);
            document.body.appendChild(existing);
        }
        this.speechEl = existing;
    }

    public say(text: string, durationMs = 2400) {
        this.ensureSpeechElement();
        if (!this.speechEl) return;
        const span = this.speechEl.querySelector('.mr-dollar-speech-text');
        if (span) span.textContent = text;

        if (this.speechHideTimer) clearTimeout(this.speechHideTimer);
        this.isSpeaking = true;
        this.mouthTalkMesh.visible = true;
        this.speechEl.style.opacity = '1';
        this.speechEl.style.transform = 'translate(-50%, -100%) scale(1)';

        this.speechHideTimer = setTimeout(() => {
            this.hideSpeech();
        }, durationMs);
    }

    public hideSpeech() {
        if (this.speechHideTimer) {
            clearTimeout(this.speechHideTimer);
            this.speechHideTimer = null;
        }
        this.isSpeaking = false;
        this.mouthTalkMesh.visible = false;
        if (this.speechEl) {
            this.speechEl.style.opacity = '0';
            this.speechEl.style.transform = 'translate(-50%, -100%) scale(0.85)';
        }
    }

    /**
     * Resets Mr. Dollar to the exact 1:1 charismatic showman stance from the reference sheet:
     * Right hand resting on Gold-Pommel Cane, Left elbow bent outward with white glove on hip!
     */
    public resetToIdlePose() {
        gsap.killTweensOf([
            this.bodyPivot.position,
            this.bodyPivot.rotation,
            this.bodyPivot.scale,
            this.hatGroup.position,
            this.hatGroup.rotation,
            this.caneArmPivot.rotation,
            this.spinArmShoulder.rotation,
            this.spinArmElbow.rotation,
            this.leftBrow.position,
            this.rightBrow.position
        ]);
        this.isPerformingAction = false;

        this.bodyPivot.position.set(0, 0, 0);
        this.bodyPivot.rotation.set(0, 0, 0);
        this.bodyPivot.scale.set(1, 1, 1);

        this.hatGroup.position.set(0.20, 1.15, 0.02);
        this.hatGroup.rotation.set(-0.06, 0.08, -0.32);

        this.caneArmPivot.rotation.set(0, 0, 0);

        // Cocky hand-on-hip pose matching reference artwork:
        // In Three.js Euler 'XYZ', after R_z(-1.78) points forearm along -Y, negative R_x(-0.56) tilts -Y FORWARD into +Z (z ~ +0.40) right in front of '$' hip!
        this.spinArmShoulder.rotation.set(0.08, -0.10, -0.42);
        this.spinArmElbow.rotation.set(-0.56, 0.08, -1.78);

        this.leftBrow.position.set(-0.32, 0.84, 0.035);
        this.rightBrow.position.set(0.12, 0.86, 0.035);
    }

    public playEntranceAnimation() {
        this.resetToIdlePose();
        this.lineCounter++;
        const line = pickLine(ENTRANCE_LINES, this.lineCounter);

        // Dapper hat bounce + cane flourish + charismatic welcome line
        gsap.fromTo(
            this.hatGroup.position,
            { y: 1.48 },
            { y: 1.15, duration: 0.42, delay: 0.16, ease: 'bounce.out' }
        );
        gsap.fromTo(
            this.caneArmPivot.rotation,
            { z: -0.25 },
            { z: 0, duration: 0.38, ease: 'back.out(2)' }
        );
        setTimeout(() => {
            if (this.root.visible) this.say(line, 2500);
        }, 220);
    }

    /**
     * Animates Mr. Dollar physically reaching his free gloved inner arm (+X) up onto the Giant Wheel's
     * left rim (10 o'clock) and hauling it powerfully downward (10 o'clock -> 7:30 o'clock) to launch
     * the counter-clockwise spin!
     */
    public playWheelGrabAndSpin(onRimYank: () => void) {
        this.isPerformingAction = true;
        this.lineCounter++;
        this.say(pickLine(SPIN_LAUNCH_LINES, this.lineCounter), 2200);

        gsap.killTweensOf([
            this.bodyPivot.position,
            this.bodyPivot.rotation,
            this.bodyPivot.scale,
            this.hatGroup.rotation,
            this.spinArmShoulder.rotation,
            this.spinArmElbow.rotation
        ]);

        const tl = gsap.timeline({
            onComplete: () => {
                this.isPerformingAction = false;
            }
        });

        // Phase 1 (0.00s -> 0.24s): Anticipation Wind-Up — lean toward wheel & reach gloved hand high onto 10 o'clock rim!
        tl.to(
            this.bodyPivot.rotation,
            { z: -0.16, y: 0.16, duration: 0.24, ease: 'power2.out' },
            0
        )
            .to(
                this.bodyPivot.position,
                { x: 0.46, y: 0.14, duration: 0.24, ease: 'power2.out' },
                0
            )
            .to(
                this.spinArmShoulder.rotation,
                { x: -0.08, y: 0.08, z: 0.68, duration: 0.24, ease: 'back.out(1.6)' },
                0
            )
            .to(
                this.spinArmElbow.rotation,
                { x: -0.12, y: 0.08, z: 0.12, duration: 0.24, ease: 'power2.out' },
                0
            )
            .to(
                this.hatGroup.rotation,
                { z: -0.42, duration: 0.24, ease: 'power2.out' },
                0
            )
            // Phase 2 (0.24s -> 0.48s): Power Downward Yank! Hauls the wheel rim down into high-speed CCW spin!
            .call(() => {
                onRimYank();
            })
            .to(
                this.spinArmShoulder.rotation,
                { x: 0.10, y: -0.08, z: -0.92, duration: 0.22, ease: 'power3.in' },
                0.24
            )
            .to(
                this.spinArmElbow.rotation,
                { x: -0.22, y: 0.10, z: -0.35, duration: 0.22, ease: 'power3.in' },
                0.24
            )
            .to(
                this.bodyPivot.position,
                { x: 0.22, y: -0.18, duration: 0.22, ease: 'power3.in' },
                0.24
            )
            .to(
                this.bodyPivot.scale,
                { x: 1.06, y: 0.94, z: 1.04, duration: 0.14, yoyo: true, repeat: 1 },
                0.24
            )
            .to(
                this.hatGroup.rotation,
                { z: -0.22, duration: 0.22, ease: 'back.out(2)' },
                0.24
            )
            // Phase 3 (0.48s -> 0.88s): Smooth swagger return to cocky hand-on-hip showman stance!
            .to(
                this.bodyPivot.position,
                { x: 0, y: 0, duration: 0.38, ease: 'back.out(1.5)' },
                0.48
            )
            .to(
                this.bodyPivot.rotation,
                { z: 0, y: 0, duration: 0.38, ease: 'back.out(1.5)' },
                0.48
            )
            .to(
                this.spinArmShoulder.rotation,
                { x: 0.08, y: -0.10, z: -0.42, duration: 0.40, ease: 'back.out(1.6)' },
                0.48
            )
            .to(
                this.spinArmElbow.rotation,
                { x: -0.56, y: 0.08, z: -1.78, duration: 0.40, ease: 'back.out(1.6)' },
                0.48
            )
            .to(
                this.hatGroup.rotation,
                { z: -0.32, duration: 0.32, ease: 'power2.out' },
                0.48
            );
    }

    public playNearMissReaction() {
        this.lineCounter++;
        this.say(pickLine(NEAR_MISS_LINES, this.lineCounter), 1800);
        gsap.to(this.rightBrow.position, { y: 0.93, duration: 0.2, yoyo: true, repeat: 3 });
    }

    public playOutcomeReaction(segmentType: string, multiplier: number) {
        this.lineCounter++;
        if (segmentType === 'WIPEOUT') {
            this.say(pickLine(WIPEOUT_LINES, this.lineCounter), 2100);
            // Wry casino-boss shrug
            gsap.fromTo(
                this.caneArmPivot.rotation,
                { z: -0.18 },
                { z: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' }
            );
            gsap.fromTo(
                this.hatGroup.rotation,
                { z: -0.44 },
                { z: -0.32, duration: 0.45, ease: 'back.out(2)' }
            );
        } else if (segmentType === 'SLOT') {
            this.say(pickLine(SLOT_WIN_LINES, this.lineCounter), 1900);
            gsap.fromTo(this.bodyPivot.position, { y: 0.24 }, { y: 0, duration: 0.38, ease: 'bounce.out' });
        } else if (segmentType === 'EXTRA_SPIN') {
            this.say(pickLine(EXTRA_SPIN_LINES, this.lineCounter), 1900);
            gsap.fromTo(this.hatGroup.position, { y: 1.36 }, { y: 1.15, duration: 0.36, ease: 'bounce.out' });
        } else if (multiplier >= 10) {
            this.say(pickLine(JACKPOT_WIN_LINES, this.lineCounter), 2400);
            // Grand Jackpot celebration: joyful hop + cane salute + top hat pop!
            gsap.fromTo(this.bodyPivot.position, { y: 0.38 }, { y: 0, duration: 0.48, ease: 'bounce.out' });
            gsap.fromTo(this.hatGroup.position, { y: 1.52 }, { y: 1.15, duration: 0.52, ease: 'bounce.out' });
            gsap.fromTo(this.caneArmPivot.rotation, { z: 0.32 }, { z: 0, duration: 0.55, ease: 'back.out(2)' });
        } else {
            this.say(pickLine(NORMAL_WIN_LINES, this.lineCounter), 2200);
            gsap.fromTo(this.bodyPivot.position, { y: 0.22 }, { y: 0, duration: 0.40, ease: 'bounce.out' });
            gsap.fromTo(this.hatGroup.position, { y: 1.32 }, { y: 1.15, duration: 0.42, ease: 'bounce.out' });
        }
    }

    public update(
        _dt: number,
        elapsed: number,
        camera: THREE.PerspectiveCamera,
        viewportW: number,
        viewportH: number,
        isWheelSpinning: boolean
    ) {
        if (!this.root.visible) {
            if (this.isSpeaking) this.hideSpeech();
            return;
        }

        // Smooth showman hover/breathing & rhythmic cane tap when not mid-yank
        if (!this.isPerformingAction) {
            const cadence = isWheelSpinning ? 5.2 : 2.2;
            const amp = isWheelSpinning ? 0.065 : 0.055;
            this.bodyPivot.position.y = Math.sin(elapsed * cadence) * amp;
            this.bodyPivot.rotation.z = Math.cos(elapsed * 1.7) * 0.025;
            this.caneArmPivot.rotation.z = Math.sin(elapsed * cadence) * (isWheelSpinning ? 0.055 : 0.022);
        }

        // Dynamic pupil tracking: glances toward the spinning wheel (+X) during spins, and between Astronaut & viewer in idle!
        const targetEyeX = isWheelSpinning
            ? 0.046 + Math.sin(elapsed * 3.2) * 0.012
            : 0.018 + Math.sin(elapsed * 1.1) * 0.024;
        const targetEyeY = isWheelSpinning
            ? -0.038 + Math.cos(elapsed * 3.2) * 0.012
            : -0.044 + Math.cos(elapsed * 0.9) * 0.007;
        this.leftPupil.position.x = targetEyeX;
        this.leftPupil.position.y = targetEyeY;
        this.rightPupil.position.x = targetEyeX;
        this.rightPupil.position.y = targetEyeY;

        // Animated speaking mouth & charismatic eyebrow cadence while English bubble is active
        if (this.isSpeaking) {
            const talkOpen = 0.35 + Math.abs(Math.sin(elapsed * 16.0)) * 0.75;
            this.mouthTalkMesh.scale.set(1.25, talkOpen, 1);
            this.rightBrow.position.y = 0.87 + Math.abs(Math.sin(elapsed * 9.0)) * 0.045;
        } else {
            this.rightBrow.position.y = 0.86 + Math.sin(elapsed * 1.6) * 0.015;
        }

        // Project 3D crown anchor above top hat to 2D screen space for crisp comic speech bubble tracking
        if (this.speechEl && this.isSpeaking) {
            this.scratchHeadWorld.set(0.15, 2.28, 0.15);
            this.bodyPivot.localToWorld(this.scratchHeadWorld);
            this.scratchHeadWorld.project(camera);
            if (this.scratchHeadWorld.z < 1.0) {
                const sx = (this.scratchHeadWorld.x * 0.5 + 0.5) * viewportW;
                const sy = (-this.scratchHeadWorld.y * 0.5 + 0.5) * viewportH;
                const halfBubble = Math.min(105, viewportW * 0.35);
                const clampedX = Math.max(halfBubble + 10, Math.min(viewportW - halfBubble - 10, sx));
                const clampedY = Math.max(68, Math.min(viewportH - 180, sy));
                this.speechEl.style.left = `${clampedX.toFixed(1)}px`;
                this.speechEl.style.top = `${clampedY.toFixed(1)}px`;
            }
        }
    }
}
