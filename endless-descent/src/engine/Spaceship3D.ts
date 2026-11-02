import * as THREE from 'three';
import gsap from 'gsap';
import type { PBRTexturePack } from './Textures3D';

/**
 * [SPACE-OVERDRIVE V4] AAA 3D Sculpted Comic Starfighter (`Spaceship3D`):
 * Built directly from the official ship reference illustration (`/assets/ship_albedo.png`,
 * `/assets/ship_normal.png`, `/assets/ship_emissive.png`) as a watertight, multi-layered
 * 3D depth-sculpted and extruded volumetric mesh with 60 FPS dynamic comic blue thruster fire:
 *  1. Polar `(r, θ)` Multi-Spike Radial Pumping & Transverse Whip Deformation at 60 FPS
 *     across all vertices of the left and right blue plasma plumes (`updateDynamicPlumeMeshVertices`),
 *     making individual comic fire spikes shoot in/out and whip independently while keeping
 *     all metal hull, wings, and central bulkhead vertices 100% rigid.
 *  2. 6 High-Contrast `NormalBlending` Comic Plasma Streak & Spike Layers (3 per engine)
 *     with cobalt-blue, electric-cyan, dark-ink, and pure-white jagged rays that continuously
 *     rush outward from the nozzle cores down to the plume tips.
 *  3. 22 `NormalBlending` Comic-Inked Cyan/White Plasma Droplets (`comicDroplets`) that
 *     replace the static droplets and continuously rocket outward along the exhaust cones.
 */

function createAnimatedComicStreaksTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 512);

    const cx = 256;
    const cy = 64;

    // Clean, luminous cyan & white comic plasma tongues with 100% smooth feathered origin (zero flat base line!)
    const rayAngles = [-0.30, -0.19, -0.09, 0.0, 0.09, 0.19, 0.30];
    for (let i = 0; i < rayAngles.length; i++) {
        const ang = rayAngles[i];
        const sinA = Math.sin(ang);
        const cosA = Math.cos(ang);
        const perpX = cosA;
        const perpY = sinA;

        const rStart = 18;
        const rEnd = 340 + (i % 2) * 52;
        const halfW = 15 + (i % 2) * 5;

        const x0 = cx + sinA * rStart;
        const y0 = cy + cosA * rStart;
        const xTip = cx + sinA * rEnd;
        const yTip = cy + cosA * rEnd;

        const grad = ctx.createLinearGradient(x0, y0, xTip, yTip);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
        grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.88)');
        grad.addColorStop(0.55, 'rgba(125, 211, 252, 0.76)');
        grad.addColorStop(0.85, 'rgba(56, 189, 248, 0.36)');
        grad.addColorStop(1.0, 'rgba(14, 165, 233, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(
            x0 - perpX * halfW,
            y0 + cosA * 68 - perpY * halfW,
            xTip,
            yTip
        );
        ctx.quadraticCurveTo(
            x0 + perpX * halfW,
            y0 + cosA * 68 + perpY * halfW,
            x0,
            y0
        );
        ctx.closePath();
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

/**
 * Hand-inked comic cyan/white plasma droplet texture matching the flying droplets in the reference art.
 */
function createComicDropletTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 64, 128);

    // Dark comic outline teardrop
    ctx.fillStyle = '#091326';
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.bezierCurveTo(52, 36, 54, 92, 32, 120);
    ctx.bezierCurveTo(10, 92, 12, 36, 32, 6);
    ctx.closePath();
    ctx.fill();

    // Cobalt blue outer rim
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(32, 12);
    ctx.bezierCurveTo(47, 38, 48, 88, 32, 113);
    ctx.bezierCurveTo(16, 88, 17, 38, 32, 12);
    ctx.closePath();
    ctx.fill();

    // Electric cyan inner fill
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(32, 18);
    ctx.bezierCurveTo(43, 42, 44, 84, 32, 106);
    ctx.bezierCurveTo(20, 84, 21, 42, 32, 18);
    ctx.closePath();
    ctx.fill();

    // Bright white inner core highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 60, 5.5, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

/**
 * C^2 smooth cosine-squared bell (`0` for `dist >= radius`, `1` at `dist === 0`,
 * with zero value jump and zero derivative jump at `dist === radius`).
 */
function smoothBell(dist: number, radius: number): number {
    if (dist >= radius) return 0.0;
    const t = dist / radius;
    const c = Math.cos(t * Math.PI * 0.5);
    return c * c;
}

function smoothBand(x: number, center: number, halfWidth: number): number {
    return smoothBell(Math.abs(x - center), halfWidth);
}

/**
 * Evaluates a 100% C^2 smooth, continuous 3D anatomical height/relief `zFront(u, v)`
 * for normalized image coordinates `(u, v) ∈ [0, 1]^2` of the reference ship illustration.
 * Zero piecewise `if` step discontinuities or creases anywhere on the hull, wings, or engines.
 */
function evaluateShipAnatomicalDepth(u: number, v: number): { zFront: number; zBack: number } {
    const dx = u - 0.5;

    // 1. Smooth Fuselage & Wing Camber Dome
    const hullDist = Math.hypot(dx * 1.48, (v - 0.45) * 1.32);
    const fuselageDome = smoothBell(hullDist, 1.0) * 0.28;

    // 2. Smooth Central Vertical Stabilizer Fin
    const finRelief = smoothBand(dx, 0.0, 0.036) * smoothBand(v, 0.18, 0.16) * 0.15;

    // 3. Smooth Curved Cyan Glass Cockpit Canopy
    const canopyDist = Math.hypot(dx * 5.2, (v - 0.20) * 6.2);
    const canopyRelief = smoothBell(canopyDist, 1.0) * 0.10;

    // 4. Smooth Central Octagonal Rear Bulkhead & Recessed Sub-Drive Nozzle
    const centerNozzleR = Math.hypot(dx * 1.79, v - 0.542);
    const bulkheadRelief = smoothBell(centerNozzleR, 0.22) * 0.14;
    const nozzleRecess = smoothBell(centerNozzleR, 0.092) * -0.22;

    // 5. Continuous Twin Engine Barrels & Plasma Plume Ridges (zero horizontal or vertical steps!)
    const rawPlumeT = Math.max(0.0, Math.min(1.0, (v - 0.54) / 0.46));
    const smoothPlumeT = rawPlumeT * rawPlumeT * (3.0 - 2.0 * rawPlumeT);
    const leftEngineAxisU = 0.352 - 0.096 * smoothPlumeT;
    const rightEngineAxisU = 0.648 + 0.092 * smoothPlumeT;

    const leftEngineBell = smoothBell(Math.abs(u - leftEngineAxisU), 0.165);
    const rightEngineBell = smoothBell(Math.abs(u - rightEngineAxisU), 0.165);
    const engineVerticalEnvelope = smoothBand(v, 0.68, 0.34);
    const twinEnginesRelief = (leftEngineBell + rightEngineBell) * engineVerticalEnvelope * 0.18;

    const zFront =
        fuselageDome +
        finRelief +
        canopyRelief +
        bulkheadRelief +
        nozzleRecess +
        twinEnginesRelief;
    const zBack = -0.18;

    return { zFront, zBack };
}

interface PlumeVertexPolarParams {
    side: number;
    weight: number;
    radialNorm: number;
    rayAngle: number;
    dirX: number;
    dirY: number;
}

/**
 * Computes exact polar nozzle coordinates `(radialNorm, rayAngle, dirX, dirY)` for every
 * vertex inside the Left (-1) or Right (+1) blue thruster fire.
 * Guaranteed `weight === 0` on all rigid metal parts (wings, side pods, central bulkhead, upper hull).
 */
function evaluatePlumeVertexAnimationParams(u: number, v: number): PlumeVertexPolarParams {
    const zero: PlumeVertexPolarParams = {
        side: 0,
        weight: 0,
        radialNorm: 0,
        rayAngle: 0,
        dirX: 0,
        dirY: -1
    };

    const side = u < 0.5 ? -1 : 1;
    const nozzleU = side < 0 ? 0.344 : 0.648;
    const nozzleV = 0.602;
    if (v <= nozzleV) return zero;

    const dxWorld = (u - nozzleU) * 1.79;
    const dyWorld = -(v - nozzleV);
    const dist = Math.hypot(dxWorld, dyWorld);
    if (dist <= 0.055) return zero;

    const dirX = dxWorld / dist;
    const dirY = dyWorld / dist;
    const rayAngle = Math.atan2(dxWorld, -dyWorld);

    // Polar cone mask around each engine's central exhaust axis (-0.26 rad for Left, +0.26 rad for Right)
    const coneCenter = side * 0.26;
    const coneHalfWidth = 0.64;
    const angleDiff = Math.abs(rayAngle - coneCenter);
    if (angleDiff >= coneHalfWidth) return zero;
    const coneMask = smoothBell(angleDiff, coneHalfWidth);

    // Keep outer metal wings (u < 0.255 or u > 0.745 for v < 0.738) and central bulkhead 100% rigid
    const outerWingGuard =
        u < 0.255 && v < 0.738
            ? Math.max(0, Math.min(1, (u - (0.278 - (v - 0.58) * 0.34)) / 0.028))
            : u > 0.745 && v < 0.738
              ? Math.max(0, Math.min(1, (0.722 + (v - 0.58) * 0.34 - u) / 0.028))
              : 1.0;
    const bulkheadMask = Math.max(0, Math.min(1, (Math.abs(u - 0.498) - 0.096) / 0.038));

    // True radial distance norm starting inside the uniform solid white nozzle core (dist = 0.055)
    const radialNorm = Math.max(0, Math.min(1, (dist - 0.055) / 0.38));
    const smoothRadial = radialNorm * radialNorm * (3.0 - 2.0 * radialNorm);
    const weight = smoothRadial * coneMask * outerWingGuard * bulkheadMask;
    if (weight <= 0.0001) return zero;

    return {
        side,
        weight,
        radialNorm,
        rayAngle,
        dirX,
        dirY
    };
}

interface SculptedShipGeometryBundle {
    geo: THREE.BufferGeometry;
    basePositions: Float32Array;
    plumeSide: Int8Array;
    plumeWeight: Float32Array;
    plumeRadialNorm: Float32Array;
    plumeRayAngle: Float32Array;
    plumeDirX: Float32Array;
    plumeDirY: Float32Array;
}

/**
 * Builds a closed, watertight 3D sculpted & extruded BufferGeometry from an alpha mask grid
 * of dimension `(gridW x gridH)`, along with precomputed polar nozzle parameters for
 * 60 FPS multi-spike radial thruster fire movement.
 */
function buildSculpted3DShipGeometry(
    gridW: number,
    gridH: number,
    alphaGrid: Float32Array,
    worldWidth: number,
    worldHeight: number
): SculptedShipGeometryBundle {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const vSide: number[] = [];
    const vWeight: number[] = [];
    const vRadialNorm: number[] = [];
    const vRayAngle: number[] = [];
    const vDirX: number[] = [];
    const vDirY: number[] = [];

    const vCols = gridW + 1;
    const vRows = gridH + 1;
    const frontVertIdx = new Int32Array(vCols * vRows).fill(-1);

    const isCellFrontActive = (cx: number, cy: number): boolean => {
        if (cx < 0 || cx >= gridW || cy < 0 || cy >= gridH) return false;
        for (let dy = -1; dy <= 1; dy++) {
            const ny = cy + dy;
            if (ny < 0 || ny >= gridH) continue;
            for (let dx = -1; dx <= 1; dx++) {
                const nx = cx + dx;
                if (nx < 0 || nx >= gridW) continue;
                if (alphaGrid[ny * gridW + nx] > 0.01) return true;
            }
        }
        return false;
    };

    const eps = 0.005;
    const getOrAddFrontVert = (vx: number, vy: number): number => {
        const key = vy * vCols + vx;
        if (frontVertIdx[key] !== -1) return frontVertIdx[key];

        const u = vx / gridW;
        const v = vy / gridH;
        const x = (u - 0.5) * worldWidth;
        const y = (0.5 - v) * worldHeight;
        const { zFront } = evaluateShipAnatomicalDepth(u, v);
        const anim = evaluatePlumeVertexAnimationParams(u, v);

        // Smooth analytical surface normal from the C^2 heightfield gradient (zero facet or wall seams!)
        const zR = evaluateShipAnatomicalDepth(Math.min(1, u + eps), v).zFront;
        const zL = evaluateShipAnatomicalDepth(Math.max(0, u - eps), v).zFront;
        const zD = evaluateShipAnatomicalDepth(u, Math.min(1, v + eps)).zFront;
        const zU = evaluateShipAnatomicalDepth(u, Math.max(0, v - eps)).zFront;
        const dzdx = (zR - zL) / (2.0 * eps * worldWidth);
        const dzdy = (zU - zD) / (2.0 * eps * worldHeight);
        let nx = -dzdx;
        let ny = -dzdy;
        let nz = 1.0;
        const nLen = Math.hypot(nx, ny, nz) || 1.0;
        nx /= nLen;
        ny /= nLen;
        nz /= nLen;

        const idx = positions.length / 3;
        positions.push(x, y, zFront);
        normals.push(nx, ny, nz);
        uvs.push(u, 1.0 - v);
        vSide.push(anim.side);
        vWeight.push(anim.weight);
        vRadialNorm.push(anim.radialNorm);
        vRayAngle.push(anim.rayAngle);
        vDirX.push(anim.dirX);
        vDirY.push(anim.dirY);
        frontVertIdx[key] = idx;
        return idx;
    };

    for (let cy = 0; cy < gridH; cy++) {
        for (let cx = 0; cx < gridW; cx++) {
            if (!isCellFrontActive(cx, cy)) continue;

            const f00 = getOrAddFrontVert(cx, cy);
            const f10 = getOrAddFrontVert(cx + 1, cy);
            const f01 = getOrAddFrontVert(cx, cy + 1);
            const f11 = getOrAddFrontVert(cx + 1, cy + 1);

            indices.push(f00, f01, f10);
            indices.push(f10, f01, f11);
        }
    }

    const basePositions = new Float32Array(positions);
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.Float32BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    return {
        geo,
        basePositions,
        plumeSide: new Int8Array(vSide),
        plumeWeight: new Float32Array(vWeight),
        plumeRadialNorm: new Float32Array(vRadialNorm),
        plumeRayAngle: new Float32Array(vRayAngle),
        plumeDirX: new Float32Array(vDirX),
        plumeDirY: new Float32Array(vDirY)
    };
}

interface ComicFlameTongueLayer {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    phaseOffset: number;
    side: number;
    layerIdx: number;
}

interface ComicDropletInstance {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    side: number;
    angleOffset: number;
    speed: number;
    phase: number;
    radialStart: number;
}

export class Spaceship3D {
    public readonly root: THREE.Group;
    public readonly chassis: THREE.Group;

    // Sculpted 3D Ship & Real-Time Plume Vertex Deformation Buffers
    private sculptedShipMesh!: THREE.Mesh;
    private sculptedShipMat!: THREE.MeshStandardMaterial;
    private plumeBundle!: SculptedShipGeometryBundle;

    // Multi-Layer Flowing Comic Flame Tongues & Streaming Comic Droplets
    private flameTongues: ComicFlameTongueLayer[] = [];
    private comicDroplets: ComicDropletInstance[] = [];
    private leftPlasmaJet!: THREE.Group;
    private rightPlasmaJet!: THREE.Group;
    private centerPlasmaJet!: THREE.Mesh;
    private leftNozzle!: THREE.Group;
    private rightNozzle!: THREE.Group;
    private centerNozzle!: THREE.Group;
    private leftCanard!: THREE.Mesh;
    private rightCanard!: THREE.Mesh;
    private leftWingFlap!: THREE.Group;
    private rightWingFlap!: THREE.Group;

    // Classic Cartoon Looney Tunes Squash & Stretch + Expressive Physics
    public impactWobbleTimer = 0;
    public anticipationSquashTimer = 0;
    public hydraulicPartyTimer = 0;
    private cursorAimX = 0;
    private cursorAimY = 0;

    // World-space anchors for wingtips & twin rear thruster nozzles
    private wingtipL!: THREE.Object3D;
    private wingtipR!: THREE.Object3D;
    private thrusterAnchorL!: THREE.Object3D;
    private thrusterAnchorR!: THREE.Object3D;

    // Wingtip Ion Ribbons (disabled for clean comic silhouette)
    private ribbonMeshL!: THREE.Mesh;
    private ribbonMeshR!: THREE.Mesh;
    private ribbonMatL!: THREE.MeshBasicMaterial;
    private ribbonMatR!: THREE.MeshBasicMaterial;
    private ribbonHistoryL: THREE.Vector3[] = [];
    private ribbonHistoryR: THREE.Vector3[] = [];
    private readonly ribbonSegments = 26;

    // Dynamic PointLight cast by the twin plasma thrusters onto nearby space/crates
    public readonly engineLight: THREE.PointLight;

    // High-Density 3D Comic Plasma Droplet Particle Trail
    private readonly trailPoints: THREE.Points;
    private readonly trailGeo: THREE.BufferGeometry;
    private readonly trailMat: THREE.PointsMaterial;
    private readonly trailCount = 96;
    private readonly trailPositions: Float32Array;
    private readonly trailColors: Float32Array;
    private readonly trailVelocities: Float32Array;
    private readonly trailAges: Float32Array;
    private readonly trailLifetimes: Float32Array;
    private trailSpawnCursor = 0;

    // 48-Piece Explosive Hull & Wing Shards + Expanding Shockwave Rings on Fatal Mine Impact
    private crashShardsGroup!: THREE.Group;
    private crashShards: {
        mesh: THREE.Mesh;
        basePos: THREE.Vector3;
        vel: THREE.Vector3;
        rotVel: THREE.Vector3;
    }[] = [];
    private primaryShockRing!: THREE.Mesh;
    private secondaryShockRing!: THREE.Mesh;
    private shockRingMat1!: THREE.MeshBasicMaterial;
    private shockRingMat2!: THREE.MeshBasicMaterial;
    private fireballCoreSprite!: THREE.Sprite;
    private fireballMat!: THREE.SpriteMaterial;
    public crashExplosionTimer = 0;
    private wasCrashed = false;

    // 3D Quantum Cyber-Shield Barrier (`shield_hex_pattern`)
    public shieldGroup!: THREE.Group;
    private shieldMesh!: THREE.Mesh;
    private shieldCoreMesh!: THREE.Mesh;
    private shieldMat!: THREE.MeshStandardMaterial;
    private shieldCoreMat!: THREE.MeshBasicMaterial;
    private shieldPointLight!: THREE.PointLight;
    public isShieldActive = false;
    public shieldTargetScale = 0;
    public shieldCurrentScale = 0;
    public shieldImpactTimer = 0;
    private shieldEnergyPhase = 0;
    private readonly shieldBaseColor = new THREE.Color(0x00f0ff);
    private readonly shieldHitColor = new THREE.Color(0xffffff);

    // 3D Hexagonal Impact Shards Pool
    private readonly shieldShardsCount = 28;
    private shieldShardsGroup!: THREE.Group;
    private shieldShards: {
        mesh: THREE.Mesh;
        vel: THREE.Vector3;
        rotVel: THREE.Vector3;
        lifetime: number;
        age: number;
        active: boolean;
    }[] = [];

    // Spring-damper physical state
    public readonly pos = new THREE.Vector3(0, 0.65, 0);
    public readonly vel = new THREE.Vector3(0, 0, 0);
    public readonly targetPos = new THREE.Vector3(0, 0.65, 0);

    public roll = 0;
    private rollVel = 0;
    public pitch = 0;
    private pitchVel = 0;
    public yaw = 0;
    private yawVel = 0;

    private elapsed = 0;
    private thrusterMat!: THREE.MeshBasicMaterial;

    // Post-Hit-Stop Speed-Burst Tracking
    private wasInHitStop = false;
    public postHitStopBurstTimer = 0;

    // Zero-GC Scratch Vectors
    private readonly scratchNozzleL = new THREE.Vector3();
    private readonly scratchNozzleR = new THREE.Vector3();
    private readonly scratchTipL = new THREE.Vector3();
    private readonly scratchTipR = new THREE.Vector3();
    private readonly scratchColor = new THREE.Color();

    constructor(scene: THREE.Scene, textures: PBRTexturePack) {
        this.root = new THREE.Group();
        this.chassis = new THREE.Group();
        this.root.add(this.chassis);
        scene.add(this.root);

        this.buildSculptedStarfighterChassis(textures);
        this.buildCrashShardsPool();
        this.buildWingtipRibbons(scene);

        // Twin thruster dynamic PointLight
        this.engineLight = new THREE.PointLight(0x38bdf8, 3.6, 15.0, 1.8);
        this.engineLight.position.set(0, 0.35, 0.85);
        this.root.add(this.engineLight);

        // Initialize 96-particle 3D plasma droplet trail
        this.trailGeo = new THREE.BufferGeometry();
        this.trailPositions = new Float32Array(this.trailCount * 3);
        this.trailColors = new Float32Array(this.trailCount * 3);
        this.trailVelocities = new Float32Array(this.trailCount * 3);
        this.trailAges = new Float32Array(this.trailCount);
        this.trailLifetimes = new Float32Array(this.trailCount);

        for (let i = 0; i < this.trailCount; i++) {
            this.trailAges[i] = 999;
            this.trailLifetimes[i] = 0.35 + Math.random() * 0.35;
            this.trailPositions[i * 3 + 1] = -9999;
            this.trailColors[i * 3] = 0.45;
            this.trailColors[i * 3 + 1] = 0.88;
            this.trailColors[i * 3 + 2] = 1.0;
        }

        this.trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        this.trailGeo.setAttribute('color', new THREE.BufferAttribute(this.trailColors, 3));

        this.trailMat = new THREE.PointsMaterial({
            size: 0.42,
            map: textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.trailPoints = new THREE.Points(this.trailGeo, this.trailMat);
        this.trailPoints.frustumCulled = false;
        scene.add(this.trailPoints);
    }

    private buildSculptedStarfighterChassis(_textures: PBRTexturePack) {
        const worldWidth = 4.95;
        const worldHeight = worldWidth * (571 / 1024); // Exact aspect ratio (2.76)

        // High-density 180x102 grid so every comic fire spike deforms smoothly at 60 FPS
        const gridW = 180;
        const gridH = 102;
        const initAlpha = new Float32Array(gridW * gridH);
        for (let cy = 0; cy < gridH; cy++) {
            const v = (cy + 0.5) / gridH;
            for (let cx = 0; cx < gridW; cx++) {
                const u = (cx + 0.5) / gridW;
                const d = Math.hypot((u - 0.5) * 1.4, (v - 0.5) * 1.3);
                initAlpha[cy * gridW + cx] = d < 0.55 ? 1.0 : 0.0;
            }
        }

        this.plumeBundle = buildSculpted3DShipGeometry(
            gridW,
            gridH,
            initAlpha,
            worldWidth,
            worldHeight
        );

        const texLoader = new THREE.TextureLoader();
        const albedoTex = texLoader.load('/assets/ship_albedo.png', (loadedTex) => {
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            loadedTex.anisotropy = 8;
            loadedTex.needsUpdate = true;

            const img = loadedTex.image as HTMLImageElement;
            if (img && img.width > 0 && img.height > 0) {
                const offCanvas = document.createElement('canvas');
                offCanvas.width = gridW;
                offCanvas.height = gridH;
                const ctx = offCanvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, gridW, gridH);
                const imgData = ctx.getImageData(0, 0, gridW, gridH).data;
                const exactAlpha = new Float32Array(gridW * gridH);
                for (let i = 0; i < gridW * gridH; i++) {
                    exactAlpha[i] = imgData[i * 4 + 3] / 255.0;
                }
                const exactBundle = buildSculpted3DShipGeometry(
                    gridW,
                    gridH,
                    exactAlpha,
                    worldWidth,
                    worldHeight
                );
                this.sculptedShipMesh.geometry.dispose();
                this.sculptedShipMesh.geometry = exactBundle.geo;
                this.plumeBundle = exactBundle;
            }
        });
        albedoTex.colorSpace = THREE.SRGBColorSpace;

        const normalTex = texLoader.load('/assets/ship_normal.png', (t) => {
            t.anisotropy = 8;
            t.needsUpdate = true;
        });

        const emissiveTex = texLoader.load('/assets/ship_emissive.png', (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 8;
            t.needsUpdate = true;
        });
        emissiveTex.colorSpace = THREE.SRGBColorSpace;

        this.sculptedShipMat = new THREE.MeshStandardMaterial({
            map: albedoTex,
            normalMap: normalTex,
            normalScale: new THREE.Vector2(0.52, 0.52),
            emissiveMap: emissiveTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.34,
            roughness: 0.68,
            metalness: 0.14,
            envMapIntensity: 0.28,
            alphaTest: 0.015,
            transparent: true,
            side: THREE.DoubleSide
        });

        const shipAssembly = new THREE.Group();
        shipAssembly.position.set(0, 0.56, -0.45);
        shipAssembly.rotation.x = -0.36;

        this.sculptedShipMesh = new THREE.Mesh(this.plumeBundle.geo, this.sculptedShipMat);
        this.sculptedShipMesh.castShadow = false;
        this.sculptedShipMesh.receiveShadow = false;
        shipAssembly.add(this.sculptedShipMesh);

        // Dynamic 3D Articulated Thruster Plumes & High-Contrast Comic Streak Layers
        const comicStreaksTex = createAnimatedComicStreaksTexture();
        const comicDropletTex = createComicDropletTexture();

        this.thrusterMat = new THREE.MeshBasicMaterial({
            map: _textures.particleGlow,
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const buildDynamicNozzleAssembly = (
            xOffset: number,
            yOffset: number,
            tiltZ: number,
            side: number
        ): THREE.Group => {
            const nozzleGroup = new THREE.Group();
            // Positioned strictly in front of the smooth plume relief (max zFront ~0.46) -> ZERO mesh intersection!
            nozzleGroup.position.set(xOffset, yOffset, 0.56);
            nozzleGroup.rotation.z = tiltZ;

            const jetGroup = new THREE.Group();

            // Soft feathered radial nozzle plasma core (zero hard sphere or clipping edges)
            const coreGlowGeo = new THREE.PlaneGeometry(0.52, 0.44);
            const coreGlowMesh = new THREE.Mesh(coreGlowGeo, this.thrusterMat);
            jetGroup.add(coreGlowMesh);

            // 3 Luminous Additive Comic Plasma Streak Layers per engine (contained strictly inside the fire cone)
            for (let layerIdx = 0; layerIdx < 3; layerIdx++) {
                const mat = new THREE.MeshBasicMaterial({
                    map: comicStreaksTex,
                    color: layerIdx === 0 ? 0xffffff : layerIdx === 1 ? 0x7dd3fc : 0x38bdf8,
                    transparent: true,
                    opacity: 0.36,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const w = 0.50 + layerIdx * 0.08;
                const h = 1.05 + layerIdx * 0.14;
                const planeGeo = new THREE.PlaneGeometry(w, h);
                planeGeo.translate(0, -h * 0.42, 0.02 + layerIdx * 0.015);
                const mesh = new THREE.Mesh(planeGeo, mat);
                jetGroup.add(mesh);

                this.flameTongues.push({
                    mesh,
                    mat,
                    phaseOffset: layerIdx / 3.0 + (side < 0 ? 0.0 : 0.17),
                    side,
                    layerIdx
                });
            }

            // 11 Streaming Comic-Inked Cyan/White Plasma Droplets per engine (replacing the static droplets!)
            const dropletGeo = new THREE.PlaneGeometry(0.088, 0.23);
            for (let dIdx = 0; dIdx < 11; dIdx++) {
                const dMat = new THREE.MeshBasicMaterial({
                    map: comicDropletTex,
                    transparent: true,
                    opacity: 0.95,
                    blending: THREE.NormalBlending,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const dMesh = new THREE.Mesh(dropletGeo, dMat);
                // Place droplets along the outer left & right flanks of each plume cone (matching reference art)
                const flankSign = dIdx % 2 === 0 ? -1 : 1;
                const angleOffset = flankSign * (0.34 + (dIdx % 4) * 0.075);
                dMesh.rotation.z = angleOffset;
                nozzleGroup.add(dMesh);

                this.comicDroplets.push({
                    mesh: dMesh,
                    mat: dMat,
                    side,
                    angleOffset,
                    speed: 1.95 + (dIdx % 4) * 0.42,
                    phase: (dIdx / 11.0 + (side < 0 ? 0.0 : 0.45)) % 1.0,
                    radialStart: 0.28 + (dIdx % 3) * 0.09
                });
            }

            nozzleGroup.add(jetGroup);
            return nozzleGroup;
        };

        this.leftNozzle = buildDynamicNozzleAssembly(-0.77, -0.32, -0.36, -1);
        this.leftPlasmaJet = this.leftNozzle.children[this.leftNozzle.children.length - 1] as THREE.Group;

        this.rightNozzle = buildDynamicNozzleAssembly(0.74, -0.32, 0.36, 1);
        this.rightPlasmaJet = this.rightNozzle.children[this.rightNozzle.children.length - 1] as THREE.Group;

        this.centerNozzle = new THREE.Group();
        this.centerNozzle.position.set(0, -0.12, 0.52);
        this.centerPlasmaJet = new THREE.Mesh(
            new THREE.RingGeometry(0.08, 0.16, 20),
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        this.centerNozzle.add(this.centerPlasmaJet);

        shipAssembly.add(this.leftNozzle, this.rightNozzle, this.centerNozzle);
        this.chassis.add(shipAssembly);

        // Compatibility sub-part references
        this.leftCanard = new THREE.Mesh(new THREE.BufferGeometry());
        this.rightCanard = new THREE.Mesh(new THREE.BufferGeometry());
        this.leftWingFlap = new THREE.Group();
        this.rightWingFlap = new THREE.Group();
        this.chassis.add(this.leftCanard, this.rightCanard, this.leftWingFlap, this.rightWingFlap);

        // Wingtip & Thruster Emitter World-Space Anchors
        this.wingtipL = new THREE.Object3D();
        this.wingtipL.position.set(-2.35, -0.25, 0.15);
        shipAssembly.add(this.wingtipL);

        this.wingtipR = new THREE.Object3D();
        this.wingtipR.position.set(2.35, -0.25, 0.15);
        shipAssembly.add(this.wingtipR);

        this.thrusterAnchorL = new THREE.Object3D();
        this.thrusterAnchorL.position.set(-1.15, -0.95, 0.72);
        shipAssembly.add(this.thrusterAnchorL);

        this.thrusterAnchorR = new THREE.Object3D();
        this.thrusterAnchorR.position.set(1.15, -0.95, 0.72);
        shipAssembly.add(this.thrusterAnchorR);

        // Build 3D Quantum Cyber-Shield Barrier
        this.buildQuantumCyberShield(shipAssembly, _textures);
    }

    /**
     * Constructs the 3D Curved Quantum Cyber-Shield Barrier (`shield_hex_pattern.png`):
     * Features a dual-layered aerodynamic energy visor ahead of the cockpit canopy
     * with pulsating hexagonal honeycomb cells, neon cyan outer rim, and dynamic PointLight illumination.
     */
    private buildQuantumCyberShield(shipAssembly: THREE.Group, textures: PBRTexturePack) {
        this.shieldGroup = new THREE.Group();
        // Positioned behind/above the cockpit canopy along the forward flight vector
        this.shieldGroup.position.set(0, 1.25, 0.12);
        this.shieldGroup.rotation.x = 0.16; // angled slightly upright like an aerodynamic blast visor
        this.shieldGroup.scale.setScalar(0.0001); // starts retracted/invisible until armed
        shipAssembly.add(this.shieldGroup);

        const sW = 4.6;
        const sH = 2.3;
        const segX = 32;
        const segY = 16;
        const shieldGeo = new THREE.PlaneGeometry(sW, sH, segX, segY);

        const posAttr = shieldGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const vx = posAttr.getX(i);
            const vy = posAttr.getY(i);
            const normX = vx / (sW / 2); // -1 to 1
            // Swept wings curve back
            const zCurve = -Math.pow(normX, 2) * 0.42;
            // Aerodynamic vertical arch
            const zArch = (1.0 - Math.pow(vy / (sH / 2), 2)) * 0.08;
            posAttr.setZ(i, zCurve + zArch);
        }
        shieldGeo.computeVertexNormals();

        // 1. Primary Holographic Hex Barrier Layer
        this.shieldMat = new THREE.MeshStandardMaterial({
            map: textures.shieldHexTex,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            emissive: new THREE.Color(0x00f0ff),
            emissiveMap: textures.shieldHexTex,
            emissiveIntensity: 0.95,
            roughness: 0.22,
            metalness: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
        this.shieldMesh.castShadow = false;
        this.shieldMesh.receiveShadow = false;
        this.shieldGroup.add(this.shieldMesh);

        // 2. Inner Glowing Energy Core Membrane
        this.shieldCoreMat = new THREE.MeshBasicMaterial({
            map: textures.shieldHexTex,
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.shieldCoreMesh = new THREE.Mesh(shieldGeo, this.shieldCoreMat);
        this.shieldCoreMesh.scale.set(0.985, 0.985, 0.985);
        this.shieldCoreMesh.position.set(0, 0, -0.018);
        this.shieldGroup.add(this.shieldCoreMesh);

        // 3. Dynamic Cyan PointLight on Cockpit & Hull
        this.shieldPointLight = new THREE.PointLight(0x00f0ff, 0.0, 6.5, 1.8);
        this.shieldPointLight.position.set(0, 0.85, 0.65);
        shipAssembly.add(this.shieldPointLight);

        // 4. Hexagonal Impact Shards Pool
        this.shieldShardsGroup = new THREE.Group();
        this.root.add(this.shieldShardsGroup);

        const hexShardGeo = new THREE.CircleGeometry(0.18, 6);
        const hexShardMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        for (let i = 0; i < this.shieldShardsCount; i++) {
            const shardMesh = new THREE.Mesh(hexShardGeo, hexShardMat.clone());
            shardMesh.visible = false;
            this.shieldShardsGroup.add(shardMesh);

            this.shieldShards.push({
                mesh: shardMesh,
                vel: new THREE.Vector3(),
                rotVel: new THREE.Vector3(),
                lifetime: 0.55,
                age: 999,
                active: false
            });
        }
    }

    /**
     * Animates all vertices of the left and right blue thruster plumes in real time at 60 FPS
     * using smooth polar nozzle coordinates `(radialNorm, rayAngle, dirX, dirY)`:
     * - Coherent angular wave frequencies (`theta * 4.5` & `theta * 7.5`) keep all hand-drawn
     *   comic ink lines 100% crisp and untorn while making the blue fire plumes pump, wave,
     *   and whip dynamically at 60 FPS!
     */
    private updateDynamicPlumeMeshVertices(thrustBoost: number) {
        const bundle = this.plumeBundle;
        if (!bundle) return;

        const posAttr = bundle.geo.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        const basePos = bundle.basePositions;
        const sides = bundle.plumeSide;
        const weights = bundle.plumeWeight;
        const radials = bundle.plumeRadialNorm;
        const angles = bundle.plumeRayAngle;
        const dirXs = bundle.plumeDirX;
        const dirYs = bundle.plumeDirY;
        const count = sides.length;

        const time = this.elapsed;

        for (let i = 0; i < count; i++) {
            const side = sides[i];
            if (side === 0) continue;

            const w = weights[i];
            if (w <= 0.0001) continue;

            const rNorm = radials[i];
            const theta = angles[i];
            const dx = dirXs[i];
            const dy = dirYs[i];

            const idx3 = i * 3;
            const bx = basePos[idx3];
            const by = basePos[idx3 + 1];
            const bz = basePos[idx3 + 2];

            const enginePhase = side < 0 ? 0.0 : 2.1;

            // Purely Radial Multi-Spike Pumping along (dx, dy) from the nozzle center:
            // Because displacement is 100% collinear with the radial ray (dx, dy) of each spike,
            // every radial comic ink line stays 100% straight, taut, and free of any horizontal kink or shear line!
            const spikeStretch1 = 0.5 + 0.5 * Math.sin(time * 24.0 + theta * 5.0 + enginePhase);
            const spikeStretch2 = 0.5 + 0.5 * Math.cos(time * 37.0 - theta * 8.0 + enginePhase * 0.7);
            const globalPulse = 0.5 + 0.5 * Math.sin(time * 16.0 + enginePhase);

            const radialPump =
                rNorm *
                w *
                (0.22 * spikeStretch1 +
                    0.13 * spikeStretch2 +
                    0.09 * globalPulse +
                    thrustBoost * 0.32);

            // Subtle 3D Z-depth billowing
            const zFlutter = w * Math.sin(time * 26.0 - rNorm * 4.0 + theta * 3.0) * 0.04;

            posArr[idx3] = bx + dx * radialPump;
            posArr[idx3 + 1] = by + dy * radialPump;
            posArr[idx3 + 2] = bz + zFlutter;
        }

        posAttr.needsUpdate = true;
    }

    /**
     * Animates the 6 high-contrast comic plasma streak layers and 22 flying comic droplets
     * so streaks and droplets continuously rocket out from the nozzle cores to the plume tips.
     */
    private updateCascadingFlameTonguesAndDroplets(dt: number, thrustBoost: number) {
        const time = this.elapsed;

        // 1. Cascading High-Contrast Comic Streak & Spike Layers
        for (let i = 0; i < this.flameTongues.length; i++) {
            const ft = this.flameTongues[i];
            const cycle = (time * (3.1 + thrustBoost * 1.5) + ft.phaseOffset) % 1.0;

            // Shoot radially downward along the plume axis from the white nozzle core
            ft.mesh.position.y = -0.06 - cycle * 0.46;
            ft.mesh.rotation.z =
                Math.sin(time * 30.0 + i * 2.3) * 0.14 +
                (ft.layerIdx - 1) * 0.08 * Math.cos(time * 22.0 + i);

            const scaleX =
                0.78 + 0.42 * Math.sin(cycle * Math.PI) + 0.15 * Math.cos(time * 38.0 + i);
            const scaleY = 0.48 + cycle * (0.95 + thrustBoost * 0.38);
            ft.mesh.scale.set(scaleX, scaleY, 1.0);

            ft.mat.opacity = Math.sin(cycle * Math.PI) * (0.38 + Math.min(0.24, thrustBoost * 0.2));
        }

        // 2. Streaming Comic-Inked Plasma Droplets
        for (let i = 0; i < this.comicDroplets.length; i++) {
            const d = this.comicDroplets[i];
            d.phase = (d.phase + dt * d.speed * (1.0 + thrustBoost * 0.55)) % 1.0;
            const p = d.phase;

            // Travel outward along the droplet's fan angle from the nozzle rim past the outer plume tips
            const dist = d.radialStart + p * (1.22 + thrustBoost * 0.28);
            const sinA = Math.sin(d.angleOffset);
            const cosA = Math.cos(d.angleOffset);

            d.mesh.position.set(sinA * dist, -cosA * dist, 0.04);
            const stretch = 0.72 + p * 0.72;
            d.mesh.scale.set(0.88, stretch, 1.0);
            d.mat.opacity = Math.sin(p * Math.PI) * 0.96;
        }
    }

    /**
     * Pre-allocates 48 explosive 3D hull & wing fragments plus dual shockwave rings for mine detonation.
     */
    private buildCrashShardsPool() {
        this.crashShardsGroup = new THREE.Group();
        this.crashShardsGroup.visible = false;
        this.root.add(this.crashShardsGroup);

        const shardPalette = [0xf8fafc, 0x334155, 0x1e293b, 0x38bdf8, 0xf97316, 0x0ea5e9];
        const boxGeo = new THREE.BoxGeometry(0.32, 0.12, 0.42);
        const tetraGeo = new THREE.TetrahedronGeometry(0.28, 0);
        const plateGeo = new THREE.OctahedronGeometry(0.26, 0);

        for (let i = 0; i < 48; i++) {
            const colorHex = shardPalette[i % shardPalette.length];
            const mat = new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: 0.35,
                metalness: 0.45,
                emissive: i % 3 === 0 ? 0xf97316 : 0x38bdf8,
                emissiveIntensity: 0.65
            });
            const geo = i % 3 === 0 ? boxGeo : i % 3 === 1 ? tetraGeo : plateGeo;
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
            const radius = 0.2 + Math.random() * 1.1;
            const bx = Math.cos(angle) * radius;
            const by = (Math.random() - 0.3) * 0.6;
            const bz = Math.sin(angle) * radius;

            const basePos = new THREE.Vector3(bx, by, bz);
            const speed = 7.5 + Math.random() * 14.0;
            const vel = new THREE.Vector3(
                Math.cos(angle) * speed,
                3.5 + Math.random() * 9.5,
                Math.sin(angle) * speed
            );
            const rotVel = new THREE.Vector3(
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18
            );

            this.crashShardsGroup.add(mesh);
            this.crashShards.push({ mesh, basePos, vel, rotVel });
        }

        const ringGeo1 = new THREE.RingGeometry(0.65, 1.05, 40);
        ringGeo1.rotateX(-Math.PI / 2);
        this.shockRingMat1 = new THREE.MeshBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.primaryShockRing = new THREE.Mesh(ringGeo1, this.shockRingMat1);
        this.crashShardsGroup.add(this.primaryShockRing);

        const ringGeo2 = new THREE.RingGeometry(0.45, 0.9, 36);
        ringGeo2.rotateX(-Math.PI / 3);
        ringGeo2.rotateZ(Math.PI / 6);
        this.shockRingMat2 = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.secondaryShockRing = new THREE.Mesh(ringGeo2, this.shockRingMat2);
        this.crashShardsGroup.add(this.secondaryShockRing);

        const fbCanvas = document.createElement('canvas');
        fbCanvas.width = 128;
        fbCanvas.height = 128;
        const fbCtx = fbCanvas.getContext('2d')!;
        const fbGrad = fbCtx.createRadialGradient(64, 64, 2, 64, 64, 62);
        fbGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        fbGrad.addColorStop(0.25, 'rgba(253, 224, 71, 0.95)');
        fbGrad.addColorStop(0.55, 'rgba(249, 115, 22, 0.65)');
        fbGrad.addColorStop(1.0, 'rgba(239, 68, 68, 0.0)');
        fbCtx.fillStyle = fbGrad;
        fbCtx.fillRect(0, 0, 128, 128);
        const fbTex = new THREE.CanvasTexture(fbCanvas);

        this.fireballMat = new THREE.SpriteMaterial({
            map: fbTex,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.fireballCoreSprite = new THREE.Sprite(this.fireballMat);
        this.crashShardsGroup.add(this.fireballCoreSprite);
    }

    private buildWingtipRibbons(scene: THREE.Scene) {
        for (let i = 0; i < this.ribbonSegments; i++) {
            this.ribbonHistoryL.push(new THREE.Vector3(0, -999, 0));
            this.ribbonHistoryR.push(new THREE.Vector3(0, -999, 0));
        }

        const createRibbonGeo = () => {
            const geo = new THREE.BufferGeometry();
            const positions = new Float32Array(this.ribbonSegments * 2 * 3);
            const indices: number[] = [];
            for (let i = 0; i < this.ribbonSegments - 1; i++) {
                const a = i * 2;
                const b = i * 2 + 1;
                const c = (i + 1) * 2;
                const d = (i + 1) * 2 + 1;
                indices.push(a, b, c, b, d, c);
            }
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setIndex(indices);
            return geo;
        };

        this.ribbonMatL = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.ribbonMatR = this.ribbonMatL.clone();

        this.ribbonMeshL = new THREE.Mesh(createRibbonGeo(), this.ribbonMatL);
        this.ribbonMeshR = new THREE.Mesh(createRibbonGeo(), this.ribbonMatR);
        this.ribbonMeshL.visible = false;
        this.ribbonMeshR.visible = false;
        scene.add(this.ribbonMeshL, this.ribbonMeshR);
    }

    public setTargetPosition(x: number, y: number, z: number) {
        const distSq =
            (x - this.targetPos.x) * (x - this.targetPos.x) +
            (z - this.targetPos.z) * (z - this.targetPos.z);
        if (distSq > 0.25) {
            this.anticipationSquashTimer = 0.24;
        }
        this.targetPos.set(x, y, z);
    }

    public setCursorAim(normX: number, normY: number) {
        this.cursorAimX = THREE.MathUtils.clamp(normX, -1, 1);
        this.cursorAimY = THREE.MathUtils.clamp(normY, -1, 1);
    }

    public triggerSpeedBurst(duration = 0.44) {
        this.postHitStopBurstTimer = Math.max(this.postHitStopBurstTimer, duration);
        this.impactWobbleTimer = 0.48;
    }

    public triggerHydraulicBlockParty(duration = 3.5) {
        this.hydraulicPartyTimer = duration;
        this.impactWobbleTimer = 0.65;
    }

    public triggerImpactSquash() {
        this.impactWobbleTimer = 0.48;
    }

    /**
     * Arms or retracts the 3D Quantum Cyber-Shield Barrier ahead of the starfighter canopy
     */
    public setShieldActive(active: boolean, animate = true) {
        this.isShieldActive = active;
        this.shieldTargetScale = active ? 1.0 : 0.0;
        if (!animate) {
            this.shieldCurrentScale = this.shieldTargetScale;
            this.shieldGroup.scale.setScalar(Math.max(0.0001, this.shieldCurrentScale));
            if (!active) this.shieldPointLight.intensity = 0;
        } else {
            gsap.killTweensOf(this);
            if (active) {
                gsap.to(this, {
                    shieldCurrentScale: 1.0,
                    duration: 0.44,
                    ease: 'back.out(2.2)',
                    onUpdate: () => {
                        this.shieldGroup.scale.setScalar(Math.max(0.0001, this.shieldCurrentScale));
                    }
                });
            } else {
                gsap.to(this, {
                    shieldCurrentScale: 0.0,
                    duration: 0.28,
                    ease: 'power2.in',
                    onUpdate: () => {
                        this.shieldGroup.scale.setScalar(Math.max(0.0001, this.shieldCurrentScale));
                    }
                });
            }
        }
    }

    /**
     * Executes the violent 3D shield deflection animation when absorbing a lethal mine impact:
     * - Blinding white/cyan plasma flash & surface overload ripple
     * - Physical recoil displacement and camera screen shake trigger
     * - 28 bursting 3D hexagonal energy shards exploding forward into space
     */
    public triggerShieldImpact(hitX?: number, hitY?: number, hitZ?: number) {
        this.shieldImpactTimer = 0.65;
        this.triggerImpactSquash();

        const originX = hitX ?? this.pos.x;
        const originY = hitY ?? this.pos.y + 0.6;
        const originZ = hitZ ?? this.pos.z - 0.4;

        for (let i = 0; i < this.shieldShards.length; i++) {
            const s = this.shieldShards[i];
            s.active = true;
            s.age = 0;
            s.lifetime = 0.45 + Math.random() * 0.35;
            s.mesh.visible = true;
            s.mesh.position.set(
                originX + (Math.random() - 0.5) * 2.2,
                originY + (Math.random() - 0.5) * 1.2,
                originZ + (Math.random() - 0.5) * 0.8
            );
            s.mesh.scale.setScalar(0.7 + Math.random() * 0.6);

            const angle = Math.random() * Math.PI * 2;
            const speed = 7.0 + Math.random() * 14.0;
            s.vel.set(
                Math.cos(angle) * speed,
                (Math.random() - 0.4) * speed * 0.8,
                Math.sin(angle) * speed * 0.6 + 4.0
            );

            s.rotVel.set(
                (Math.random() - 0.5) * 18.0,
                (Math.random() - 0.5) * 18.0,
                (Math.random() - 0.5) * 18.0
            );
        }
    }

    public hasShieldActive(): boolean {
        return this.isShieldActive;
    }

    public snapTo(x: number, y: number, z: number) {
        this.pos.set(x, y, z);
        this.targetPos.set(x, y, z);
        this.vel.set(0, 0, 0);
        this.roll = 0;
        this.rollVel = 0;
        this.pitch = 0;
        this.pitchVel = 0;
        this.yaw = 0;
        this.yawVel = 0;
        this.root.position.copy(this.pos);
        this.chassis.rotation.set(0, 0, 0);

        this.chassis.updateMatrixWorld(true);
        const tipL = this.wingtipL.getWorldPosition(this.scratchTipL);
        const tipR = this.wingtipR.getWorldPosition(this.scratchTipR);
        for (let i = 0; i < this.ribbonSegments; i++) {
            this.ribbonHistoryL[i].copy(tipL);
            this.ribbonHistoryR[i].copy(tipR);
        }
    }

    public update(
        dt: number,
        accentColorHex: number,
        isHitStop: boolean,
        hitStopTargetX: number | null,
        hoverTargetX: number | null,
        isFreeLook = false,
        isCrashed = false,
        currentMultiplier = 1.0,
        isCashedOut = false,
        isAbducted = false
    ) {
        this.elapsed += dt;

        if (this.wasInHitStop && !isHitStop && !isCrashed) {
            this.postHitStopBurstTimer = 0.44;
            this.impactWobbleTimer = 0.48;
        }
        this.wasInHitStop = isHitStop;

        if (this.postHitStopBurstTimer > 0) {
            this.postHitStopBurstTimer = Math.max(0, this.postHitStopBurstTimer - dt);
        }
        if (this.impactWobbleTimer > 0) {
            this.impactWobbleTimer = Math.max(0, this.impactWobbleTimer - dt);
        }
        if (this.anticipationSquashTimer > 0) {
            this.anticipationSquashTimer = Math.max(0, this.anticipationSquashTimer - dt);
        }

        const isBursting = this.postHitStopBurstTimer > 0;

        // 1. Spring-Damper Translation Physics (Paused during UFO Abduction so GSAP tweens smoothly without fighting!)
        if (isAbducted) {
            this.vel.set(0, 0, 0);
            this.targetPos.copy(this.pos);
        } else {
            // Snappy high-response arcade physics: moves instantly with satisfying damp
            const stiffness = isHitStop ? 85 : isBursting ? 320 : 200;
            const damping = isHitStop ? 14 : isBursting ? 22 : 18;

            const forceX = (this.targetPos.x - this.pos.x) * stiffness;
            const forceY = (this.targetPos.y - this.pos.y) * stiffness;
            const forceZ = (this.targetPos.z - this.pos.z) * stiffness;

            this.vel.x += (forceX - this.vel.x * damping) * dt;
            this.vel.y += (forceY - this.vel.y * damping) * dt;
            this.vel.z += (forceZ - this.vel.z * damping) * dt;

            this.pos.x += this.vel.x * dt;
            this.pos.y += this.vel.y * dt;
            this.pos.z += this.vel.z * dt;
        }

        // 2. Aerodynamic Banking (Roll), Pitch, and Yaw
        let desiredRoll = THREE.MathUtils.clamp(-this.vel.x * 0.065 - this.cursorAimX * 0.06, -0.42, 0.42);
        let desiredPitch = THREE.MathUtils.clamp(this.vel.z * 0.022 - this.cursorAimY * 0.04, -0.22, 0.22);
        let desiredYaw = THREE.MathUtils.clamp(-this.vel.x * 0.032 - this.cursorAimX * 0.04, -0.28, 0.28);

        if (isHitStop && hitStopTargetX !== null) {
            const dx = hitStopTargetX - this.pos.x;
            desiredRoll = THREE.MathUtils.clamp(-dx * 0.10, -0.45, 0.45);
            desiredYaw = THREE.MathUtils.clamp(-dx * 0.065, -0.35, 0.35);
            desiredPitch = 0.10;
        } else if (hoverTargetX !== null) {
            const dx = hoverTargetX - this.pos.x;
            desiredRoll += THREE.MathUtils.clamp(-dx * 0.035, -0.18, 0.18);
            desiredYaw += THREE.MathUtils.clamp(-dx * 0.024, -0.14, 0.14);
        }

        const rotStiff = 120;
        const rotDamp = 14;
        this.rollVel += ((desiredRoll - this.roll) * rotStiff - this.rollVel * rotDamp) * dt;
        this.pitchVel += ((desiredPitch - this.pitch) * rotStiff - this.pitchVel * rotDamp) * dt;
        this.yawVel += ((desiredYaw - this.yaw) * rotStiff - this.yawVel * rotDamp) * dt;

        this.roll += this.rollVel * dt;
        this.pitch += this.pitchVel * dt;
        this.yaw += this.yawVel * dt;

        const hoverBobY = isFreeLook ? 0 : Math.sin(this.elapsed * 3.8) * 0.045;
        const hoverSwayRoll = isFreeLook ? 0 : Math.cos(this.elapsed * 2.4) * 0.015;

        this.root.position.set(this.pos.x, this.pos.y + hoverBobY, this.pos.z);

        // 3. Fatal Mine Explosion Disintegration Animation
        if (isCrashed) {
            if (!this.wasCrashed) {
                this.wasCrashed = true;
                this.crashExplosionTimer = 0;
            }
            this.crashExplosionTimer += dt;
            this.chassis.visible = false;
            this.crashShardsGroup.visible = true;
            this.engineLight.intensity = Math.max(0, 18.0 * (1.0 - this.crashExplosionTimer * 1.4));
            this.engineLight.color.setHex(0xf97316);

            const t = this.crashExplosionTimer;
            for (let i = 0; i < this.crashShards.length; i++) {
                const s = this.crashShards[i];
                s.mesh.position.set(
                    s.basePos.x + s.vel.x * t,
                    s.basePos.y + s.vel.y * t - 0.5 * 19.5 * t * t,
                    s.basePos.z + s.vel.z * t
                );
                s.mesh.rotation.set(s.rotVel.x * t, s.rotVel.y * t, s.rotVel.z * t);
                const scaleFade = Math.max(0.001, 1.0 - t * 0.78);
                s.mesh.scale.setScalar(scaleFade);
            }

            const shockProgress1 = Math.min(1.0, t / 0.65);
            this.primaryShockRing.scale.setScalar(0.5 + shockProgress1 * 14.5);
            this.shockRingMat1.opacity = (1.0 - shockProgress1) * 0.92;

            const shockProgress2 = Math.min(1.0, t / 0.85);
            this.secondaryShockRing.scale.setScalar(0.4 + shockProgress2 * 18.0);
            this.shockRingMat2.opacity = (1.0 - shockProgress2) * 0.78;

            const fbProgress = Math.min(1.0, t / 0.42);
            this.fireballCoreSprite.scale.setScalar(1.5 + Math.sin(fbProgress * Math.PI) * 9.5);
            this.fireballMat.opacity = (1.0 - fbProgress) * 0.95;
        } else {
            if (this.wasCrashed) {
                this.wasCrashed = false;
                this.crashExplosionTimer = 0;
            }
            this.chassis.visible = true;
            this.crashShardsGroup.visible = false;
        }

        // 4. Subtle Squash & Stretch + Banking Transform
        const speedMagnitude = this.vel.length();
        const stretchFactor = THREE.MathUtils.clamp(speedMagnitude * 0.008, 0, 0.14);

        let sx = 1.0 - stretchFactor * 0.35;
        let sy = 1.0 - stretchFactor * 0.35;
        let sz = 1.0 + stretchFactor * 0.75;

        if (this.anticipationSquashTimer > 0) {
            const p = this.anticipationSquashTimer / 0.24;
            const anticipationCurve = Math.sin(p * Math.PI);
            sx += anticipationCurve * 0.10;
            sy -= anticipationCurve * 0.12;
            sz -= anticipationCurve * 0.08;
        }

        if (this.impactWobbleTimer > 0) {
            const t = 1.0 - this.impactWobbleTimer / 0.48;
            const env = Math.exp(-t * 6.5);
            const osc = Math.cos(t * Math.PI * 4.5) * env;
            sx += osc * 0.10;
            sy -= osc * 0.12;
            sz += osc * 0.08;
        }

        this.chassis.scale.set(sx, sy, sz);
        this.chassis.rotation.set(this.pitch, this.yaw, this.roll + hoverSwayRoll, 'YXZ');

        // 5. Real-Time 60 FPS Blue Thruster Fire Movement (Polar Multi-Spike Vertex Wave + Comic Streaks + Droplets)
        const multProgress = THREE.MathUtils.clamp(Math.log2(Math.max(1, currentMultiplier)) / 6.5, 0, 1);
        const speedBoost = THREE.MathUtils.clamp(speedMagnitude * 0.08, 0, 1.2);
        const burstBoost = isBursting ? (this.postHitStopBurstTimer / 0.44) * 1.4 : 0;
        const winBoost = isCashedOut ? 0.65 + 0.35 * Math.sin(this.elapsed * 18.0) : 0;
        const totalThrustBoost = speedBoost + burstBoost + winBoost;

        if (!isCrashed) {
            this.updateDynamicPlumeMeshVertices(totalThrustBoost);
            this.updateCascadingFlameTonguesAndDroplets(dt, totalThrustBoost);
        }

        // Dynamic comic plumes deform smoothly without high-frequency scale strobing
        this.leftPlasmaJet.scale.set(1.0, 1.0, 1.0);
        this.rightPlasmaJet.scale.set(1.0, 1.0, 1.0);

        // Calm, stable emissive glow (eliminates 22 rad/s emissive flickering on the ship)
        this.sculptedShipMat.emissiveIntensity =
            0.36 + burstBoost * 0.22 + multProgress * 0.10;

        this.engineLight.color.setHex(isCashedOut ? 0x34d399 : accentColorHex || 0x38bdf8);
        this.engineLight.intensity = isCrashed
            ? this.engineLight.intensity
            : 3.4 + speedBoost * 2.2 + burstBoost * 4.0 + multProgress * 1.8;

        this.chassis.updateMatrixWorld(true);

        // 6. Emit 3D Comic Plasma Droplet Particles from the Twin Lateral Thrusters
        if (!isCrashed) {
            this.emitThrusterParticles(dt, totalThrustBoost, isCashedOut);
        }
        this.updateThrusterParticles(dt);

        // 7. Animate 3D Quantum Cyber-Shield Barrier & Bursting Impact Shards
        this.updateQuantumCyberShield(dt);
    }

    private updateQuantumCyberShield(dt: number) {
        this.shieldEnergyPhase += dt * 3.6;

        if (this.shieldImpactTimer > 0) {
            this.shieldImpactTimer -= dt;
            const norm = Math.max(0, this.shieldImpactTimer / 0.65);

            // Blinding white-hot flash decaying back to electric cyan
            this.shieldMat.emissive.lerpColors(this.shieldBaseColor, this.shieldHitColor, norm);
            this.shieldMat.emissiveIntensity = 0.95 + norm * 2.8;
            this.shieldPointLight.intensity = 2.2 + norm * 7.5;
            this.shieldPointLight.color.lerpColors(this.shieldBaseColor, this.shieldHitColor, norm);

            // Violent high-frequency micro-jitter
            this.shieldGroup.position.x = (Math.random() - 0.5) * 0.22 * norm;
            this.shieldGroup.position.y = 1.25 + (Math.random() - 0.5) * 0.16 * norm;

            if (this.shieldImpactTimer <= 0) {
                this.setShieldActive(false, true);
            }
        } else {
            this.shieldGroup.position.x = 0;
            this.shieldGroup.position.y = 1.25;
            this.shieldMat.emissive.copy(this.shieldBaseColor);
            this.shieldMat.emissiveIntensity = 0.95;

            // Living energy breathing pulse and honeycomb shimmer
            const pulse = 0.84 + Math.sin(this.shieldEnergyPhase) * 0.10;
            this.shieldMat.opacity = pulse * this.shieldCurrentScale;
            this.shieldCoreMat.opacity =
                (0.35 + Math.sin(this.shieldEnergyPhase * 1.4) * 0.08) * this.shieldCurrentScale;
            this.shieldPointLight.intensity = this.isShieldActive
                ? (1.6 + Math.sin(this.shieldEnergyPhase * 1.5) * 0.5) * this.shieldCurrentScale
                : 0;
            this.shieldPointLight.color.copy(this.shieldBaseColor);
        }

        // 3D Hexagonal impact shards physics
        for (let i = 0; i < this.shieldShards.length; i++) {
            const s = this.shieldShards[i];
            if (!s.active) continue;
            s.age += dt;
            if (s.age >= s.lifetime) {
                s.active = false;
                s.mesh.visible = false;
                continue;
            }
            const p = s.age / s.lifetime;
            s.mesh.position.addScaledVector(s.vel, dt);
            s.mesh.rotation.x += s.rotVel.x * dt;
            s.mesh.rotation.y += s.rotVel.y * dt;
            s.mesh.rotation.z += s.rotVel.z * dt;
            (s.mesh.material as THREE.MeshBasicMaterial).opacity = (1.0 - p) * 0.9;
            s.mesh.scale.setScalar((1.0 - p * 0.6) * 1.2);
        }
    }

    private emitThrusterParticles(dt: number, thrustPower: number, isCashedOut: boolean) {
        const spawnRate = Math.min(4, Math.ceil((18 + thrustPower * 28) * dt));
        const posL = this.thrusterAnchorL.getWorldPosition(this.scratchNozzleL);
        const posR = this.thrusterAnchorR.getWorldPosition(this.scratchNozzleR);

        for (let s = 0; s < spawnRate; s++) {
            const idx = this.trailSpawnCursor;
            this.trailSpawnCursor = (this.trailSpawnCursor + 1) % this.trailCount;

            const isLeft = idx % 2 === 0;
            const origin = isLeft ? posL : posR;
            const lateralSign = isLeft ? -1 : 1;

            this.trailPositions[idx * 3] = origin.x + (Math.random() - 0.5) * 0.35;
            this.trailPositions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.22;
            this.trailPositions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.25;

            const speedZ = 4.8 + thrustPower * 5.5 + Math.random() * 2.8;
            this.trailVelocities[idx * 3] = lateralSign * (1.2 + Math.random() * 1.6);
            this.trailVelocities[idx * 3 + 1] = -1.4 - Math.random() * 1.4;
            this.trailVelocities[idx * 3 + 2] = speedZ;

            if (isCashedOut) {
                this.scratchColor.setHex(idx % 3 === 0 ? 0xffffff : 0x6ee7b7);
            } else {
                this.scratchColor.setHex(idx % 3 === 0 ? 0xffffff : idx % 3 === 1 ? 0x7dd3fc : 0x38bdf8);
            }
            this.trailColors[idx * 3] = this.scratchColor.r;
            this.trailColors[idx * 3 + 1] = this.scratchColor.g;
            this.trailColors[idx * 3 + 2] = this.scratchColor.b;

            this.trailAges[idx] = 0;
            this.trailLifetimes[idx] = 0.22 + Math.random() * 0.24;
        }
    }

    private updateThrusterParticles(dt: number) {
        for (let i = 0; i < this.trailCount; i++) {
            this.trailAges[i] += dt;
            if (this.trailAges[i] >= this.trailLifetimes[i]) {
                this.trailPositions[i * 3 + 1] = -9999;
                continue;
            }
            this.trailPositions[i * 3] += this.trailVelocities[i * 3] * dt;
            this.trailPositions[i * 3 + 1] += this.trailVelocities[i * 3 + 1] * dt;
            this.trailPositions[i * 3 + 2] += this.trailVelocities[i * 3 + 2] * dt;
        }
        (this.trailGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.trailGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    }
}
