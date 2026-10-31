import * as THREE from 'three';
import type { PBRTexturePack } from './Textures3D';

const RIBBON_SEGMENTS = 48;
const PLASMA_PARTICLE_COUNT = 820;

const PLASMA_PALETTE_HEX = [
    0x00f0ff, // Quantum Cyan
    0x38bdf8, // Ion Sky Blue
    0xfde047, // White-Hot Engine Ember Gold
    0xf59e0b, // Solar Core Amber Ember
    0x8b5cf6, // Warp Violet
    0x10b981  // Reactor Emerald
];

interface PlasmaParticleData {
    vx: number;
    vy: number;
    vz: number;
    age: number;
    maxAge: number;
    color: THREE.Color;
    isEmber: boolean;
}

/**
 * Constructs a custom faceted crystalline diamond canopy geometry with sharp planar facets.
 * Faithfully matches the signature faceted diamond cockpit canopy from the hero craft reference.
 */
function buildFacetedDiamondCanopyGeometry(scale = 1.0): THREE.BufferGeometry {
    const s = scale;
    const positions: number[] = [];
    const uvs: number[] = [];

    function addTri(
        p1: [number, number, number],
        p2: [number, number, number],
        p3: [number, number, number],
        uv1: [number, number],
        uv2: [number, number],
        uv3: [number, number]
    ) {
        positions.push(p1[0] * s, p1[1] * s, p1[2] * s);
        positions.push(p2[0] * s, p2[1] * s, p2[2] * s);
        positions.push(p3[0] * s, p3[1] * s, p3[2] * s);
        uvs.push(...uv1, ...uv2, ...uv3);
    }

    // Key vertices of the faceted diamond canopy:
    const vNose: [number, number, number] = [0, 0.08, -1.25];
    const vCrest: [number, number, number] = [0, 0.62, -0.20];
    const vAftRidge: [number, number, number] = [0, 0.42, 0.75];

    const vTempleL: [number, number, number] = [-0.58, 0.38, -0.20];
    const vTempleR: [number, number, number] = [0.58, 0.38, -0.20];

    const vBaseNoseL: [number, number, number] = [-0.28, 0.02, -0.92];
    const vBaseNoseR: [number, number, number] = [0.28, 0.02, -0.92];

    const vBaseMidL: [number, number, number] = [-0.62, 0.02, -0.18];
    const vBaseMidR: [number, number, number] = [0.62, 0.02, -0.18];

    const vBaseAftL: [number, number, number] = [-0.44, 0.02, 0.75];
    const vBaseAftR: [number, number, number] = [0.44, 0.02, 0.75];

    // 1. Forward Windshield Facet Pair (Left & Right)
    addTri(vNose, vBaseNoseL, vCrest, [0.5, 0], [0.2, 0.3], [0.5, 0.6]);
    addTri(vNose, vCrest, vBaseNoseR, [0.5, 0], [0.5, 0.6], [0.8, 0.3]);

    // 2. Upper Temple Facet Pair
    addTri(vCrest, vBaseNoseL, vTempleL, [0.5, 0.6], [0.2, 0.3], [0.1, 0.6]);
    addTri(vCrest, vTempleR, vBaseNoseR, [0.5, 0.6], [0.9, 0.6], [0.8, 0.3]);

    // 3. Lower Temple Side Glass Pair
    addTri(vTempleL, vBaseNoseL, vBaseMidL, [0.1, 0.6], [0.2, 0.3], [0.05, 0.5]);
    addTri(vTempleR, vBaseMidR, vBaseNoseR, [0.9, 0.6], [0.95, 0.5], [0.8, 0.3]);

    // 4. Aft Crown Roof Facet Pair
    addTri(vCrest, vTempleL, vAftRidge, [0.5, 0.6], [0.1, 0.6], [0.5, 1.0]);
    addTri(vCrest, vAftRidge, vTempleR, [0.5, 0.6], [0.5, 1.0], [0.9, 0.6]);

    // 5. Aft Flank Upper Facet Pair
    addTri(vAftRidge, vTempleL, vBaseAftL, [0.5, 1.0], [0.1, 0.6], [0.25, 0.95]);
    addTri(vAftRidge, vBaseAftR, vTempleR, [0.5, 1.0], [0.75, 0.95], [0.9, 0.6]);

    // 6. Aft Flank Lower Facet Pair
    addTri(vTempleL, vBaseMidL, vBaseAftL, [0.1, 0.6], [0.05, 0.5], [0.25, 0.95]);
    addTri(vTempleR, vBaseAftR, vBaseMidR, [0.9, 0.6], [0.75, 0.95], [0.95, 0.5]);

    // 7. Rear Bulkhead Wall
    addTri(vAftRidge, vBaseAftL, vBaseAftR, [0.5, 1.0], [0.25, 0.95], [0.75, 0.95]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
}

/**
 * Constructs a sleek swept delta starfighter wing with authentic taper and aerodynamic leading-edge angle.
 * Accurately reproduces the low-profile swept wing from the hero spacecraft reference image.
 */
function buildSweptWingGeometry(isLeft: boolean): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const s = isLeft ? -1 : 1;
    const yT = 0.05;
    const yB = -0.05;

    // Wing corner coordinates in chassis coordinates
    const rLead: [number, number, number] = [s * 0.72, yT, -0.15];
    const rTrail: [number, number, number] = [s * 0.72, yT, 1.15];
    const tLead: [number, number, number] = [s * 1.95, yT, 0.42];
    const tTrail: [number, number, number] = [s * 1.95, yT, 0.90];

    const brLead: [number, number, number] = [s * 0.72, yB, -0.15];
    const brTrail: [number, number, number] = [s * 0.72, yB, 1.15];
    const btLead: [number, number, number] = [s * 1.95, yB, 0.42];
    const btTrail: [number, number, number] = [s * 1.95, yB, 0.90];

    const pos: number[] = [];
    function quad(
        a: [number, number, number],
        b: [number, number, number],
        c: [number, number, number],
        d: [number, number, number]
    ) {
        // Double-sided triangle pairs to guarantee rendering regardless of culling or reflection
        pos.push(...a, ...b, ...c);
        pos.push(...a, ...c, ...d);
        pos.push(...a, ...c, ...b);
        pos.push(...a, ...d, ...c);
    }

    // Top face
    quad(rLead, tLead, tTrail, rTrail);
    // Bottom face
    quad(brTrail, btTrail, btLead, brLead);
    // Leading edge face
    quad(rLead, brLead, btLead, tLead);
    // Trailing edge face
    quad(tTrail, btTrail, brTrail, rTrail);
    // Wingtip face
    quad(tLead, btLead, btTrail, tTrail);
    // Root face
    quad(rTrail, brTrail, brLead, rLead);

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
}

/**
 * Builds the dark carbon leading-edge trim facet running along the swept wing leading edge.
 */
function buildWingTrimGeometry(isLeft: boolean): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const s = isLeft ? -1 : 1;
    const yT = 0.054;
    const yB = -0.054;
    const insetZ = 0.16;

    const rLead: [number, number, number] = [s * 0.72, yT, -0.15];
    const rIn: [number, number, number] = [s * 0.72, yT, -0.15 + insetZ];
    const tLead: [number, number, number] = [s * 1.95, yT, 0.42];
    const tIn: [number, number, number] = [s * 1.95, yT, 0.42 + insetZ * 0.65];

    const brLead: [number, number, number] = [s * 0.72, yB, -0.15];
    const brIn: [number, number, number] = [s * 0.72, yB, -0.15 + insetZ];
    const btLead: [number, number, number] = [s * 1.95, yB, 0.42];
    const btIn: [number, number, number] = [s * 1.95, yB, 0.42 + insetZ * 0.65];

    const pos: number[] = [];
    function quad(
        a: [number, number, number],
        b: [number, number, number],
        c: [number, number, number],
        d: [number, number, number]
    ) {
        // Double-sided triangle pairs to guarantee rendering regardless of culling or reflection
        pos.push(...a, ...b, ...c);
        pos.push(...a, ...c, ...d);
        pos.push(...a, ...c, ...b);
        pos.push(...a, ...d, ...c);
    }

    quad(rLead, tLead, tIn, rIn);
    quad(brIn, btIn, btLead, brLead);
    quad(rLead, brLead, btLead, tLead);
    quad(tLead, btLead, btIn, tIn);

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
}

/**
 * Constructs authentic sleek tapered canted dorsal fins matching the reference hero spacecraft.
 * Compact trapezoidal profile: base chord 0.65, top chord 0.28, height 0.44.
 */
function buildTaperedFinGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const w = 0.038; // half thickness

    const yB = 0.0;
    const yT = 0.46;

    // Base chord along Z
    const bLead: [number, number, number] = [0, yB, 0.55];
    const bTrail: [number, number, number] = [0, yB, 1.35];

    // Top chord along Z (swept back and narrower)
    const tLead: [number, number, number] = [0, yT, 0.90];
    const tTrail: [number, number, number] = [0, yT, 1.25];

    const pos: number[] = [];
    function quad(
        p1: [number, number, number],
        p2: [number, number, number],
        p3: [number, number, number],
        p4: [number, number, number]
    ) {
        pos.push(...p1, ...p2, ...p3);
        pos.push(...p1, ...p3, ...p4);
        pos.push(...p1, ...p3, ...p2);
        pos.push(...p1, ...p4, ...p3);
    }

    const L_bLead: [number, number, number] = [-w, bLead[1], bLead[2]];
    const L_bTrail: [number, number, number] = [-w, bTrail[1], bTrail[2]];
    const L_tLead: [number, number, number] = [-w, tLead[1], tLead[2]];
    const L_tTrail: [number, number, number] = [-w, tTrail[1], tTrail[2]];

    const R_bLead: [number, number, number] = [w, bLead[1], bLead[2]];
    const R_bTrail: [number, number, number] = [w, bTrail[1], bTrail[2]];
    const R_tLead: [number, number, number] = [w, tLead[1], tLead[2]];
    const R_tTrail: [number, number, number] = [w, tTrail[1], tTrail[2]];

    // Left flank
    quad(L_bLead, L_tLead, L_tTrail, L_bTrail);
    // Right flank
    quad(R_bLead, R_bTrail, R_tTrail, R_tLead);
    // Leading edge
    quad(L_bLead, R_bLead, R_tLead, L_tLead);
    // Trailing edge
    quad(L_bTrail, L_tTrail, R_tTrail, R_bTrail);
    // Top crest
    quad(L_tLead, R_tLead, R_tTrail, L_tTrail);
    // Bottom root
    quad(L_bLead, L_bTrail, R_bTrail, R_bLead);

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
}

/**
 * Builds the dark leading edge cap on the tapered dorsal fins.
 */
function buildTaperedFinTrimGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const w = 0.042;
    const yB = 0.0;
    const yT = 0.47;
    const inset = 0.12;

    const bLead: [number, number, number] = [0, yB, 0.54];
    const bBack: [number, number, number] = [0, yB, 0.54 + inset];
    const tLead: [number, number, number] = [0, yT, 0.89];
    const tBack: [number, number, number] = [0, yT, 0.89 + inset * 0.7];

    const pos: number[] = [];
    function quad(
        p1: [number, number, number],
        p2: [number, number, number],
        p3: [number, number, number],
        p4: [number, number, number]
    ) {
        pos.push(...p1, ...p2, ...p3);
        pos.push(...p1, ...p3, ...p4);
        pos.push(...p1, ...p3, ...p2);
        pos.push(...p1, ...p4, ...p3);
    }

    const L_bLead: [number, number, number] = [-w, bLead[1], bLead[2]];
    const L_bBack: [number, number, number] = [-w, bBack[1], bBack[2]];
    const L_tLead: [number, number, number] = [-w, tLead[1], tLead[2]];
    const L_tBack: [number, number, number] = [-w, tBack[1], tBack[2]];

    const R_bLead: [number, number, number] = [w, bLead[1], bLead[2]];
    const R_bBack: [number, number, number] = [w, bBack[1], bBack[2]];
    const R_tLead: [number, number, number] = [w, tLead[1], tLead[2]];
    const R_tBack: [number, number, number] = [w, tBack[1], tBack[2]];

    quad(L_bLead, L_tLead, L_tBack, L_bBack);
    quad(R_bLead, R_bBack, R_tBack, R_tLead);
    quad(L_bLead, R_bLead, R_tLead, L_tLead);
    quad(L_tLead, R_tLead, R_tBack, L_tBack);

    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
}

export class Spaceship3D {
    public readonly root: THREE.Group;
    public readonly chassis: THREE.Group;

    // Articulated Mechanical Sub-Parts of the [SPACE-OVERDRIVE V3] Starfighter (Zero Cage Rings!)
    private leftWingFlap!: THREE.Group;
    private rightWingFlap!: THREE.Group;
    private leftCanard!: THREE.Mesh;
    private rightCanard!: THREE.Mesh;
    private exhaustVents: THREE.Mesh[] = [];
    private leftNozzle!: THREE.Group;
    private rightNozzle!: THREE.Group;
    private centerNozzle!: THREE.Group;
    private leftPlasmaJet!: THREE.Mesh;
    private rightPlasmaJet!: THREE.Mesh;
    private centerPlasmaJet!: THREE.Mesh;

    // Classic Cartoon Looney Tunes Squash & Stretch + Expressive Physics
    public impactWobbleTimer = 0;
    public anticipationSquashTimer = 0;

    // World-space anchors for wingtip ion ribbons & twin rear thruster nozzles
    private wingtipL!: THREE.Object3D;
    private wingtipR!: THREE.Object3D;
    private nozzleTipL!: THREE.Object3D;
    private nozzleTipR!: THREE.Object3D;
    private nozzleTipCenter!: THREE.Object3D;

    // Controlled Illumination (Glow restricted strictly to Rear Thrusters)
    public noseSpotLight!: THREE.SpotLight;
    public noseLightTarget!: THREE.Object3D;
    public enginePointLight!: THREE.PointLight;

    private accentMat!: THREE.MeshStandardMaterial;
    private thrusterCoreMat!: THREE.MeshStandardMaterial;
    private plasmaJetMatL!: THREE.MeshBasicMaterial;
    private plasmaJetMatR!: THREE.MeshBasicMaterial;
    private plasmaJetMatCenter!: THREE.MeshBasicMaterial;

    // Spacecraft 6-DOF Flight, Cursor-Tracking Orientation & Speed-Burst Physics State
    public pos = new THREE.Vector3(0, 1.85, 0);
    public vel = new THREE.Vector3(0, 0, 0);
    public targetPos = new THREE.Vector3(0, 1.85, 0);

    // Interactive Cursor/Touch Tracking Vector (-1..+1)
    public cursorAim = new THREE.Vector2(0, 0);
    private smoothedCursorAim = new THREE.Vector2(0, 0);

    public roll = 0;
    public rollVel = 0;
    public pitch = 0;
    public pitchVel = 0;
    public yaw = 0;
    public yawVel = 0;

    private jumpArcTimer = 0;
    private jumpArcDuration = 0.24;
    private jumpPeakHeight = 1.9;
    private lastTargetZ = 0;
    public hydraulicPartyTimer = 0;
    public postHitStopBurstTimer = 0;
    public crashExplosionTimer = 0;

    // Reusable scratch objects (zero per-frame GC heap allocations in 60/120 FPS loop)
    private readonly scratchThrusterColor = new THREE.Color();
    private readonly scratchWingtipL = new THREE.Vector3();
    private readonly scratchWingtipR = new THREE.Vector3();
    private readonly scratchNozzleTipL = new THREE.Vector3();
    private readonly scratchNozzleTipR = new THREE.Vector3();
    private readonly scratchNozzleTipC = new THREE.Vector3();
    private readonly scratchExhaustDir = new THREE.Vector3();

    // World-space 3D Wingtip Ion Ribbons
    private leftRibbonPos!: Float32Array;
    private rightRibbonPos!: Float32Array;
    private leftRibbonGeo!: THREE.BufferGeometry;
    private rightRibbonGeo!: THREE.BufferGeometry;
    private leftRibbonMat!: THREE.MeshBasicMaterial;
    private rightRibbonMat!: THREE.MeshBasicMaterial;
    private ribbonHistoryL: THREE.Vector3[] = [];
    private ribbonHistoryR: THREE.Vector3[] = [];

    // World-space Rear Thruster GPU Plasma & Glowing Engine Ember System
    private plasmaGeo!: THREE.BufferGeometry;
    private plasmaPositions!: Float32Array;
    private plasmaColors!: Float32Array;
    private plasmaParticles: PlasmaParticleData[] = [];
    private plasmaSpawnCursor = 0;

    private elapsed = 0;

    constructor(scene: THREE.Scene, textures: PBRTexturePack) {
        this.root = new THREE.Group();
        this.chassis = new THREE.Group();
        this.root.add(this.chassis);
        scene.add(this.root);

        this.buildOverdriveSpacecraft(textures);
        this.buildLights(scene);
        this.buildWingtipIonRibbons(scene);
        this.buildPlasmaThrusterParticles(scene, textures.particleGlow);
    }

    /**
     * Updates the normalized (-1..+1) cursor/touch tracking coordinates
     * so the ship dynamically pitches, yaws, and banks toward the user's cursor!
     */
    public setCursorAim(normX: number, normY: number) {
        this.cursorAim.set(
            THREE.MathUtils.clamp(normX, -1, 1),
            THREE.MathUtils.clamp(normY, -1, 1)
        );
    }

    private buildOverdriveSpacecraft(textures: PBRTexturePack) {
        // 1. Satin Matte Ceramic White Hull Armor (Clean, non-glare, satin diffuse)
        const ceramicHullMat = new THREE.MeshStandardMaterial({
            map: textures.hullColor,
            bumpMap: textures.hullBump,
            bumpScale: 0.02,
            roughnessMap: textures.hullRoughness,
            roughness: 0.58,
            metalness: 0.10
        });

        // 2. Matte Dark Carbon / Gunmetal Armor (Surrounds canopy & dorsal deck)
        const darkArmorMat = new THREE.MeshStandardMaterial({
            color: 0x141a24,
            roughness: 0.65,
            metalness: 0.38
        });

        // 3. Satin Titanium Mechanical Trim & Exhaust Flanges
        const titaniumMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.42,
            metalness: 0.72
        });

        // 4. Faceted Cyan Crystal Canopy Glass (Crystalline holographic visor matching image)
        const canopyGlassMat = new THREE.MeshStandardMaterial({
            map: textures.windshieldEyesTex,
            color: 0x06283d,
            emissive: 0x00d2ff,
            emissiveIntensity: 0.65,
            roughness: 0.22,
            metalness: 0.25,
            transparent: true,
            opacity: 0.94,
            side: THREE.DoubleSide
        });

        // Inner Crystalline Hologram Core (Volumetric cyan energy matrix inside visor)
        const innerCoreMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        // Pristine Satin Ceramic Wing Armor (Clean white, non-glare, matching reference image)
        const wingCeramicMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.55,
            metalness: 0.10,
            side: THREE.DoubleSide
        });

        // 5. Crisp Cyan Energy Circuit Trim Lines (Subtle glow, non-glare)
        this.accentMat = new THREE.MeshStandardMaterial({
            color: 0x00d8f0,
            emissive: 0x00d8f0,
            emissiveIntensity: 0.60,
            roughness: 0.25,
            metalness: 0.5
        });

        // 6. Amber / Warm Gold Wingtip Navigation Indicators (Exact match to image)
        const amberNavMat = new THREE.MeshStandardMaterial({
            color: 0xffa000,
            emissive: 0xff8c00,
            emissiveIntensity: 1.4,
            roughness: 0.20,
            metalness: 0.3
        });

        // 7. Controlled Rear Thruster Core Glow (Rich cyan, zero blinding glare)
        this.thrusterCoreMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 1.4,
            roughness: 0.2,
            metalness: 0.5
        });

        // =========================================================================
        // 1. SLEEK LOW-PROFILE CERAMIC WHITE RACER POD LIFTING BODY & NOSE INTAKE
        // =========================================================================
        // 1A. Central Aerodynamic Lifting-Body Hull (Low profile, thin aerodynamic blade)
        const mainSlabGeo = new THREE.BoxGeometry(1.85, 0.28, 2.6);
        const mainSlab = new THREE.Mesh(mainSlabGeo, ceramicHullMat);
        mainSlab.position.set(0, 0.08, 0.30);
        mainSlab.castShadow = true;
        mainSlab.receiveShadow = true;
        this.chassis.add(mainSlab);

        // Forward Tapered Nose Hull
        const noseSlabGeo = new THREE.BoxGeometry(1.25, 0.24, 1.85);
        const noseSlab = new THREE.Mesh(noseSlabGeo, ceramicHullMat);
        noseSlab.position.set(0, 0.06, -1.65);
        noseSlab.castShadow = true;
        this.chassis.add(noseSlab);

        // Aerodynamic Nose Wedge Bevel
        const noseBevelGeo = new THREE.CylinderGeometry(0.24, 0.58, 0.85, 24);
        noseBevelGeo.rotateX(-Math.PI / 2);
        noseBevelGeo.scale(1.15, 0.48, 1.0);
        const noseBevel = new THREE.Mesh(noseBevelGeo, ceramicHullMat);
        noseBevel.position.set(0, 0.08, -2.45);
        this.chassis.add(noseBevel);

        // Recessed Dark Nose Intake Tunnel
        const noseTunnelGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.42, 24);
        noseTunnelGeo.rotateX(-Math.PI / 2);
        const noseTunnel = new THREE.Mesh(noseTunnelGeo, darkArmorMat);
        noseTunnel.position.set(0, 0.08, -2.85);
        this.chassis.add(noseTunnel);

        // Glowing Quantum Cyan Inner Intake Ring
        const noseRingGeo = new THREE.TorusGeometry(0.20, 0.025, 16, 28);
        const noseRing = new THREE.Mesh(noseRingGeo, this.accentMat);
        noseRing.position.set(0, 0.08, -2.95);
        this.chassis.add(noseRing);

        // Dark Chin Skid Plate underneath Nose
        const chinGeo = new THREE.BoxGeometry(0.88, 0.08, 1.25);
        const chinMesh = new THREE.Mesh(chinGeo, darkArmorMat);
        chinMesh.position.set(0, -0.06, -2.10);
        this.chassis.add(chinMesh);

        // Under-cowl Amber Sensors
        const chinSensorGeo = new THREE.BoxGeometry(0.06, 0.06, 0.12);
        const chinSensorL = new THREE.Mesh(chinSensorGeo, amberNavMat);
        chinSensorL.position.set(-0.26, -0.04, -2.68);
        const chinSensorR = new THREE.Mesh(chinSensorGeo, amberNavMat);
        chinSensorR.position.set(0.26, -0.04, -2.68);
        this.chassis.add(chinSensorL, chinSensorR);

        // Aerodynamic Ceramic White Cheek Fairings
        const cheekGeo = new THREE.CylinderGeometry(0.20, 0.38, 2.0, 24);
        cheekGeo.rotateX(-Math.PI / 2);
        cheekGeo.scale(0.85, 0.48, 1.0);
        const cheekL = new THREE.Mesh(cheekGeo, ceramicHullMat);
        cheekL.position.set(-0.76, 0.08, -1.55);
        const cheekR = new THREE.Mesh(cheekGeo, ceramicHullMat);
        cheekR.position.set(0.76, 0.08, -1.55);
        this.chassis.add(cheekL, cheekR);

        // Lower Belly Side Fairing Chines
        const chineGeo = new THREE.BoxGeometry(0.22, 0.16, 2.4);
        const chineL = new THREE.Mesh(chineGeo, ceramicHullMat);
        chineL.position.set(-0.95, -0.02, 0.30);
        const chineR = new THREE.Mesh(chineGeo, ceramicHullMat);
        chineR.position.set(0.95, -0.02, 0.30);
        this.chassis.add(chineL, chineR);

        // =========================================================================
        // 2. DARK CARBON UPPER DECK & CYAN ACCENT CIRCUIT CONDUITS
        // =========================================================================
        const upperDeckGeo = new THREE.BoxGeometry(0.88, 0.08, 3.4);
        const upperDeck = new THREE.Mesh(upperDeckGeo, darkArmorMat);
        upperDeck.position.set(0, 0.24, -0.30);
        upperDeck.castShadow = true;
        this.chassis.add(upperDeck);

        // Dark Carbon Nose Hood Plate
        const hoodPlateGeo = new THREE.BoxGeometry(0.55, 0.06, 1.35);
        const hoodPlate = new THREE.Mesh(hoodPlateGeo, darkArmorMat);
        hoodPlate.position.set(0, 0.20, -1.85);
        hoodPlate.rotation.x = -0.12;
        this.chassis.add(hoodPlate);

        // Sweeping Cyan Circuit Trim Lines along the dark deck border
        const trimGeo = new THREE.BoxGeometry(0.04, 0.035, 2.8);
        const trimL = new THREE.Mesh(trimGeo, this.accentMat);
        trimL.position.set(-0.46, 0.28, -0.25);
        const trimR = new THREE.Mesh(trimGeo, this.accentMat);
        trimR.position.set(0.46, 0.28, -0.25);
        this.chassis.add(trimL, trimR);

        // Angled Circuit Traces stepping outward at 45 degrees
        const branchGeo = new THREE.BoxGeometry(0.04, 0.035, 0.45);
        const branchL = new THREE.Mesh(branchGeo, this.accentMat);
        branchL.position.set(-0.58, 0.28, 0.75);
        branchL.rotation.y = 0.78;
        const branchR = new THREE.Mesh(branchGeo, this.accentMat);
        branchR.position.set(0.58, 0.28, 0.75);
        branchR.rotation.y = -0.78;
        this.chassis.add(branchL, branchR);

        // Forward Canard References (Non-protruding dummy meshes so update() remains robust)
        this.leftCanard = new THREE.Mesh(new THREE.BufferGeometry());
        this.rightCanard = new THREE.Mesh(new THREE.BufferGeometry());
        this.chassis.add(this.leftCanard, this.rightCanard);

        // Sleek aerodynamic upper deck without flapping louvers
        this.exhaustVents = [];

        // =========================================================================
        // 3. FACETED DIAMOND CRYSTAL COCKPIT CANOPY (PROMINENT ELEVATED VISOR)
        // =========================================================================
        // 100% clean crystal diamond visor: all black antenna rods, ribs, and spines removed!
        const canopyGroup = new THREE.Group();
        canopyGroup.position.set(0, 0.26, -0.55);

        // 3A. Outer Faceted Diamond Visor with Sharp Planar Facets
        const diamondGeo = buildFacetedDiamondCanopyGeometry(1.0);
        const diamondMesh = new THREE.Mesh(diamondGeo, canopyGlassMat);
        diamondMesh.castShadow = true;
        canopyGroup.add(diamondMesh);

        // 3B. Inner Holographic Crystalline Core (Volumetric depth inside visor)
        const innerDiamondGeo = buildFacetedDiamondCanopyGeometry(0.85);
        const innerMesh = new THREE.Mesh(innerDiamondGeo, innerCoreMat);
        innerMesh.position.y = 0.03;
        canopyGroup.add(innerMesh);

        this.chassis.add(canopyGroup);

        // =========================================================================
        // 4. TWIN VERTICAL WHITE FINS & SWEPT RACING WINGS WITH SOLID AMBER LIGHTS
        // =========================================================================
        // Twin Upright Dorsal Fins (White Ceramic with Dark Leading Edge, Canted 20° outward)
        // Authentic tapered profile mounted cleanly atop the twin rear nacelles matching the reference image!
        const finGeo = buildTaperedFinGeometry();
        const finTrimGeo = buildTaperedFinTrimGeometry();

        const finL = new THREE.Mesh(finGeo, wingCeramicMat);
        finL.position.set(-0.64, 0.28, 0);
        finL.rotation.z = 0.35;
        finL.castShadow = true;

        const finTrimL = new THREE.Mesh(finTrimGeo, darkArmorMat);
        finTrimL.position.set(-0.64, 0.28, 0);
        finTrimL.rotation.z = 0.35;

        const finR = new THREE.Mesh(finGeo, wingCeramicMat);
        finR.position.set(0.64, 0.28, 0);
        finR.rotation.z = -0.35;
        finR.castShadow = true;

        const finTrimR = new THREE.Mesh(finTrimGeo, darkArmorMat);
        finTrimR.position.set(0.64, 0.28, 0);
        finTrimR.rotation.z = -0.35;

        this.chassis.add(finL, finTrimL, finR, finTrimR);

        // Swept Delta Racing Wings (White Ceramic Hull with Sleek Taper)
        const wingLGeo = buildSweptWingGeometry(true);
        const leftWing = new THREE.Mesh(wingLGeo, wingCeramicMat);
        leftWing.position.set(0, 0.14, 0);
        leftWing.castShadow = true;

        const wingRGeo = buildSweptWingGeometry(false);
        const rightWing = new THREE.Mesh(wingRGeo, wingCeramicMat);
        rightWing.position.set(0, 0.14, 0);
        rightWing.castShadow = true;
        this.chassis.add(leftWing, rightWing);

        // Dark Carbon Leading Edge Swept Wing Trim
        const trimLGeo = buildWingTrimGeometry(true);
        const wingTrimL = new THREE.Mesh(trimLGeo, darkArmorMat);
        wingTrimL.position.set(0, 0.14, 0);

        const trimRGeo = buildWingTrimGeometry(false);
        const wingTrimR = new THREE.Mesh(trimRGeo, darkArmorMat);
        wingTrimR.position.set(0, 0.14, 0);
        this.chassis.add(wingTrimL, wingTrimR);

        // Amber Wingtip Navigation Lights (Exact Match to Reference Image)
        // Positioned firmly at each wingtip's outer forward corner with zero flickering or Z-fighting
        const amberLightGeo = new THREE.BoxGeometry(0.12, 0.08, 0.26);
        const amberBezelGeo = new THREE.BoxGeometry(0.15, 0.09, 0.30);

        // Left Wingtip Light Assembly
        const amberBezelL = new THREE.Mesh(amberBezelGeo, darkArmorMat);
        amberBezelL.position.set(-1.94, 0.14, 0.50);
        amberBezelL.rotation.y = 0.24;

        const amberL = new THREE.Mesh(amberLightGeo, amberNavMat);
        amberL.position.set(-1.96, 0.14, 0.50);
        amberL.rotation.y = 0.24;

        // Right Wingtip Light Assembly
        const amberBezelR = new THREE.Mesh(amberBezelGeo, darkArmorMat);
        amberBezelR.position.set(1.94, 0.14, 0.50);
        amberBezelR.rotation.y = -0.24;

        const amberR = new THREE.Mesh(amberLightGeo, amberNavMat);
        amberR.position.set(1.96, 0.14, 0.50);
        amberR.rotation.y = -0.24;

        this.chassis.add(amberBezelL, amberL, amberBezelR, amberR);

        // Flap groups kept empty so rotation updates run safely with zero geometry clipping or flicker
        this.leftWingFlap = new THREE.Group();
        this.rightWingFlap = new THREE.Group();
        this.chassis.add(this.leftWingFlap, this.rightWingFlap);

        // Wingtip Ion Ribbon Emitter Anchors (Trailing wingtip corners)
        this.wingtipL = new THREE.Object3D();
        this.wingtipL.position.set(-1.95, 0.14, 0.90);
        this.chassis.add(this.wingtipL);

        this.wingtipR = new THREE.Object3D();
        this.wingtipR.position.set(1.95, 0.14, 0.90);
        this.chassis.add(this.wingtipR);

        // =========================================================================
        // 5. TWIN CYLINDRICAL REAR JET ENGINES (EXACT MATCH TO IMAGE - LOW-SLUNG NACELLES)
        // =========================================================================
        this.leftNozzle = new THREE.Group();
        this.leftNozzle.position.set(-0.64, 0.10, 1.48);
        this.chassis.add(this.leftNozzle);

        this.rightNozzle = new THREE.Group();
        this.rightNozzle.position.set(0.64, 0.10, 1.48);
        this.chassis.add(this.rightNozzle);

        // Aerodynamic Center Tail Spine Fairing between the twin engines
        this.centerNozzle = new THREE.Group();
        this.centerNozzle.position.set(0, 0.14, 1.48);
        this.chassis.add(this.centerNozzle);

        const centerSpineGeo = new THREE.BoxGeometry(0.32, 0.28, 1.15);
        const centerSpineMesh = new THREE.Mesh(centerSpineGeo, darkArmorMat);
        this.centerNozzle.add(centerSpineMesh);

        // Cylindrical Thruster Nacelles with Ribbed Collars
        const nacelleGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.15, 24);
        nacelleGeo.rotateX(Math.PI / 2);
        const nacelleL = new THREE.Mesh(nacelleGeo, darkArmorMat);
        const nacelleR = new THREE.Mesh(nacelleGeo, darkArmorMat);
        this.leftNozzle.add(nacelleL);
        this.rightNozzle.add(nacelleR);

        // Titanium Nozzle Exhaust Flange Rings
        const collarGeo = new THREE.TorusGeometry(0.26, 0.035, 12, 24);
        const collarL = new THREE.Mesh(collarGeo, titaniumMat);
        collarL.position.z = 0.55;
        const collarR = new THREE.Mesh(collarGeo, titaniumMat);
        collarR.position.z = 0.55;
        this.leftNozzle.add(collarL);
        this.rightNozzle.add(collarR);

        // Glowing Internal Rear Thruster Cores
        const coreDiscGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.06, 20);
        coreDiscGeo.rotateX(Math.PI / 2);
        const coreL = new THREE.Mesh(coreDiscGeo, this.thrusterCoreMat);
        coreL.position.z = 0.46;
        const coreR = new THREE.Mesh(coreDiscGeo, this.thrusterCoreMat);
        coreR.position.z = 0.46;
        this.leftNozzle.add(coreL);
        this.rightNozzle.add(coreR);

        // Volumetric Rear Plasma Afterburner Plumes (Twin powerful cyan jets)
        this.plasmaJetMatL = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.plasmaJetMatR = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.plasmaJetMatCenter = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.0, // Silent center fairing
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const jetGeo = new THREE.ConeGeometry(0.20, 2.4, 20);
        jetGeo.rotateX(Math.PI / 2);
        jetGeo.translate(0, 0, 1.35);

        const centerJetGeo = new THREE.ConeGeometry(0.05, 0.05, 4);
        centerJetGeo.rotateX(Math.PI / 2);

        this.leftPlasmaJet = new THREE.Mesh(jetGeo, this.plasmaJetMatL);
        this.rightPlasmaJet = new THREE.Mesh(jetGeo, this.plasmaJetMatR);
        this.centerPlasmaJet = new THREE.Mesh(centerJetGeo, this.plasmaJetMatCenter);
        this.leftNozzle.add(this.leftPlasmaJet);
        this.rightNozzle.add(this.rightPlasmaJet);
        this.centerNozzle.add(this.centerPlasmaJet);

        this.nozzleTipL = new THREE.Object3D();
        this.nozzleTipL.position.set(0, 0, 0.58);
        this.leftNozzle.add(this.nozzleTipL);

        this.nozzleTipR = new THREE.Object3D();
        this.nozzleTipR.position.set(0, 0, 0.58);
        this.rightNozzle.add(this.nozzleTipR);

        this.nozzleTipCenter = new THREE.Object3D();
        this.nozzleTipCenter.position.set(0, 0, 0.5);
        this.centerNozzle.add(this.nozzleTipCenter);
    }



    public drawCartoonEyes(
        _mood: string,
        _lookX: number,
        _lookY: number,
        _blink: number,
        _multiplier: number
    ) {
        return;
    }


    private buildLights(scene: THREE.Scene) {
        // Forward targeting spotlight illuminates the floating multiplier cards ahead without blinding the ship hull
        this.noseSpotLight = new THREE.SpotLight(0xe0f2fe, 28, 52, Math.PI / 3.6, 0.5, 1.2);
        this.noseSpotLight.position.set(0, 0.5, -2.95);
        this.noseSpotLight.castShadow = true;
        this.noseSpotLight.shadow.mapSize.width = 1024;
        this.noseSpotLight.shadow.mapSize.height = 1024;
        this.noseSpotLight.shadow.camera.near = 1.5;
        this.noseSpotLight.shadow.camera.far = 48;
        this.chassis.add(this.noseSpotLight);

        this.noseLightTarget = new THREE.Object3D();
        this.noseLightTarget.position.set(0, -1.0, -16);
        this.chassis.add(this.noseLightTarget);
        this.noseSpotLight.target = this.noseLightTarget;
        scene.add(this.noseSpotLight.target);

        // Rear Exhaust Point Light: strictly behind the nozzles (z = 2.95, tight radius = 8.5)
        this.enginePointLight = new THREE.PointLight(0x00f0ff, 11, 8.5, 1.8);
        this.enginePointLight.position.set(0, 0.3, 2.95);
        this.chassis.add(this.enginePointLight);
    }

    private buildWingtipIonRibbons(scene: THREE.Scene) {
        for (let i = 0; i < RIBBON_SEGMENTS; i++) {
            this.ribbonHistoryL.push(new THREE.Vector3(-2.68, 0.18, 1.28));
            this.ribbonHistoryR.push(new THREE.Vector3(2.68, 0.18, 1.28));
        }

        const createRibbonMesh = (posArr: Float32Array, geo: THREE.BufferGeometry, mat: THREE.MeshBasicMaterial) => {
            const indices: number[] = [];
            for (let i = 0; i < RIBBON_SEGMENTS - 1; i++) {
                const a = i * 2;
                const b = i * 2 + 1;
                const c = (i + 1) * 2;
                const d = (i + 1) * 2 + 1;
                indices.push(a, b, c, b, d, c);
            }
            geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
            geo.setIndex(indices);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.frustumCulled = false;
            scene.add(mesh);
        };

        this.leftRibbonPos = new Float32Array(RIBBON_SEGMENTS * 2 * 3);
        this.rightRibbonPos = new Float32Array(RIBBON_SEGMENTS * 2 * 3);
        this.leftRibbonGeo = new THREE.BufferGeometry();
        this.rightRibbonGeo = new THREE.BufferGeometry();

        this.leftRibbonMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.rightRibbonMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        createRibbonMesh(this.leftRibbonPos, this.leftRibbonGeo, this.leftRibbonMat);
        createRibbonMesh(this.rightRibbonPos, this.rightRibbonGeo, this.rightRibbonMat);
    }

    private buildPlasmaThrusterParticles(scene: THREE.Scene, flareTex: THREE.CanvasTexture) {
        this.plasmaGeo = new THREE.BufferGeometry();
        this.plasmaPositions = new Float32Array(PLASMA_PARTICLE_COUNT * 3);
        this.plasmaColors = new Float32Array(PLASMA_PARTICLE_COUNT * 3);

        for (let i = 0; i < PLASMA_PARTICLE_COUNT; i++) {
            this.plasmaPositions[i * 3 + 1] = -999;
            const c = new THREE.Color(PLASMA_PALETTE_HEX[i % PLASMA_PALETTE_HEX.length]);
            this.plasmaColors[i * 3] = c.r;
            this.plasmaColors[i * 3 + 1] = c.g;
            this.plasmaColors[i * 3 + 2] = c.b;
            this.plasmaParticles.push({
                vx: 0,
                vy: 0,
                vz: 0,
                age: 99,
                maxAge: 1,
                color: c.clone(),
                isEmber: i % 3 === 0
            });
        }

        this.plasmaGeo.setAttribute('position', new THREE.BufferAttribute(this.plasmaPositions, 3));
        this.plasmaGeo.setAttribute('color', new THREE.BufferAttribute(this.plasmaColors, 3));

        // Balanced particle size so rear exhaust embers look crisp without blinding the player
        const plasmaMat = new THREE.PointsMaterial({
            size: 0.78,
            map: flareTex,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(this.plasmaGeo, plasmaMat);
        points.frustumCulled = false;
        scene.add(points);
    }

    /**
     * Triggers the sudden post-Hit-Stop burst of speed when breaking through a safe gate!
     */
    public triggerSpeedBurst(durationSec = 0.42) {
        this.postHitStopBurstTimer = durationSec;
        this.pitchVel -= 3.6;
    }

    public triggerHydraulicBlockParty(durationSec = 4.0) {
        this.hydraulicPartyTimer = durationSec;
        this.rollVel += 9.5;
    }

    public snapTo(x: number, y: number, z: number) {
        this.pos.set(x, y, z);
        this.targetPos.set(x, y, z);
        this.vel.set(0, 0, 0);
        this.lastTargetZ = z;
        this.jumpArcTimer = 0;
        this.postHitStopBurstTimer = 0;
        this.impactWobbleTimer = 0;
        this.anticipationSquashTimer = 0;
        this.chassis.position.set(0, 0, 0);
        this.chassis.scale.setScalar(1);
        this.roll = 0;
        this.rollVel = 0;
        this.pitch = 0;
        this.pitchVel = 0;
        this.yaw = 0;
        this.yawVel = 0;
        this.crashExplosionTimer = 0;
        this.chassis.visible = true;
        this.chassis.scale.set(1, 1, 1);
        this.root.position.copy(this.pos);
        this.chassis.rotation.set(0, 0, 0);
        this.root.updateMatrixWorld(true);

        const wL = new THREE.Vector3();
        const wR = new THREE.Vector3();
        this.wingtipL.getWorldPosition(wL);
        this.wingtipR.getWorldPosition(wR);
        for (let i = 0; i < RIBBON_SEGMENTS; i++) {
            this.ribbonHistoryL[i].copy(wL);
            this.ribbonHistoryR[i].copy(wR);
        }
    }

    public setTargetPosition(x: number, y: number, z: number) {
        if (Math.abs(z - this.lastTargetZ) > 1.0) {
            this.lastTargetZ = z;
            this.jumpArcTimer = this.jumpArcDuration;
            this.pitchVel += 3.0;
            this.anticipationSquashTimer = 0.12;
        }
        this.targetPos.set(x, y, z);
    }

    /**
     * Updates 60-FPS Smooth Starfighter Flight Dynamics, Interactive Cursor-Tracking Yaw/Pitch/Roll,
     * Looney Tunes Squash & Stretch, Mechanical Exhaust Vents, and Rear Thruster Plumes
     */
    public update(
        dt: number,
        primaryHex: number,
        isHitStop: boolean,
        hitStopLaneX: number | null,
        hoveredLaneX: number | null,
        _hasShield: boolean,
        isCrashed: boolean,
        _currentMultiplier = 1.0,
        _isCashedOut = false
    ) {
        this.elapsed += dt;

        if (this.hydraulicPartyTimer > 0) {
            this.hydraulicPartyTimer = Math.max(0, this.hydraulicPartyTimer - dt);
        }
        if (this.postHitStopBurstTimer > 0) {
            this.postHitStopBurstTimer = Math.max(0, this.postHitStopBurstTimer - dt);
        }
        if (this.impactWobbleTimer > 0) {
            this.impactWobbleTimer = Math.max(0, this.impactWobbleTimer - dt);
        }
        if (this.anticipationSquashTimer > 0) {
            this.anticipationSquashTimer = Math.max(0, this.anticipationSquashTimer - dt);
        }

        // Smoothly interpolate cursor tracking vector for responsive starfighter aim
        this.smoothedCursorAim.lerp(this.cursorAim, Math.min(1, dt * 14));

        const isBursting = this.postHitStopBurstTimer > 0;
        const thrusterColor = this.scratchThrusterColor.setHex(
            isCrashed ? 0xff1e42 : isBursting ? 0xfde047 : primaryHex
        );
        this.thrusterCoreMat.color.lerp(thrusterColor, dt * 10);
        this.thrusterCoreMat.emissive.lerp(thrusterColor, dt * 10);
        this.enginePointLight.color.lerp(thrusterColor, dt * 10);
        this.enginePointLight.intensity = isBursting ? 22 : isHitStop ? 18 : 11;
        this.plasmaJetMatL.color.lerp(thrusterColor, dt * 10);

        let jumpOffsetY = 0;
        if (this.jumpArcTimer > 0) {
            this.jumpArcTimer = Math.max(0, this.jumpArcTimer - dt);
            const u = 1 - this.jumpArcTimer / this.jumpArcDuration;
            jumpOffsetY = Math.sin(u * Math.PI) * this.jumpPeakHeight;
        }

        const hoverOscY =
            Math.sin(this.elapsed * 3.6) * 0.08 +
            Math.sin(this.elapsed * 1.5 + 1.2) * 0.04 -
            this.smoothedCursorAim.y * 0.18;
        const hoverOscRoll = Math.sin(this.elapsed * 2.4) * 0.035;
        const hoverOscPitch = Math.cos(this.elapsed * 2.8) * 0.025;

        // High-speed spring physics tuned for discrete-time zero-overshoot & sub-300ms exact center snap!
        const stiffness = isBursting ? 270 : 250;
        const damping = 1.68 * Math.sqrt(stiffness);

        const desiredX =
            isHitStop && hitStopLaneX !== null ? hitStopLaneX : this.targetPos.x;
        const desiredY = this.targetPos.y + jumpOffsetY + hoverOscY;
        const desiredZ = this.targetPos.z;

        const ax = (desiredX - this.pos.x) * stiffness - this.vel.x * damping;
        const ay = (desiredY - this.pos.y) * stiffness - this.vel.y * damping;
        const az = (desiredZ - this.pos.z) * stiffness - this.vel.z * damping;

        this.vel.x += ax * dt;
        this.vel.y += ay * dt;
        this.vel.z += az * dt;

        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        this.pos.z += this.vel.z * dt;

        // Exact Center Snap Guarantee with Cartoon Landing Rubbery Wobble Trigger
        if (Math.abs(desiredX - this.pos.x) < 0.04 && Math.abs(this.vel.x) < 0.65) {
            if (Math.abs(this.vel.x) > 0.08) this.impactWobbleTimer = 0.38;
            this.pos.x = desiredX;
            this.vel.x = 0;
        }
        if (Math.abs(desiredZ - this.pos.z) < 0.04 && Math.abs(this.vel.z) < 0.65) {
            if (Math.abs(this.vel.z) > 0.08) this.impactWobbleTimer = 0.38;
            this.pos.z = desiredZ;
            this.vel.z = 0;
        }

        this.root.position.copy(this.pos);

        // Classic Looney Tunes 3D Squash & Stretch Animation
        const speedZ = Math.abs(this.vel.z);
        const speedX = Math.abs(this.vel.x);
        let stretchZ = 1.0 + Math.min(0.40, speedZ * 0.015 + (isBursting ? 0.24 : 0));
        let stretchX = 1.0 + Math.min(0.25, speedX * 0.018);

        // Anticipation compression right before jump
        if (this.anticipationSquashTimer > 0) {
            const c = this.anticipationSquashTimer / 0.12;
            stretchZ *= 1.0 - c * 0.22;
            stretchX *= 1.0 + c * 0.18;
        }

        // Landing rubbery bounce recoil wobble
        let wobbleY = 0;
        let wobbleXZ = 0;
        if (this.impactWobbleTimer > 0) {
            const wt = 0.38 - this.impactWobbleTimer;
            const decay = Math.exp(-this.impactWobbleTimer * 9.2);
            const osc = Math.sin(wt * 32.0) * decay;
            wobbleY = -osc * 0.28;
            wobbleXZ = osc * 0.20;
        }

        // Living breathing cartoon idle hover
        const idleBreathe = Math.sin(this.elapsed * 3.6) * 0.038;

        const finalScaleX = stretchX * (1.0 / Math.sqrt(stretchZ)) * (1.0 + wobbleXZ) * (1.0 - idleBreathe * 0.8);
        const finalScaleY = (1.0 / Math.sqrt(stretchZ * stretchX)) * (1.0 + wobbleY) * (1.0 + idleBreathe * 1.4);
        const finalScaleZ = stretchZ * (1.0 + wobbleXZ) * (1.0 - idleBreathe * 0.8);

        // Comical spin tumble on crash
        if (isCrashed) {
            this.crashExplosionTimer += dt;
            this.rollVel += 18.0 * dt;
            this.pitchVel += 10.0 * dt;
            this.yawVel += 24.0 * dt;
            const collapse = Math.max(0, 1.0 - this.crashExplosionTimer * 3.8);
            this.chassis.scale.setScalar(collapse);
            if (collapse <= 0.02) {
                this.chassis.visible = false;
            }
        } else {
            this.crashExplosionTimer = 0;
            if (!this.chassis.visible) {
                this.chassis.visible = true;
            }
            this.chassis.scale.set(finalScaleX, finalScaleY, finalScaleZ);
        }

        // INTERACTIVE CURSOR-TRACKING ORIENTATION (Yaw, Pitch, and 25° Realistic Bank/Roll)
        const lateralError = desiredX - this.pos.x;
        const cursorRollBias = -this.smoothedCursorAim.x * 0.30;
        const cursorPitchBias = -this.smoothedCursorAim.y * 0.28;
        const cursorYawBias = -this.smoothedCursorAim.x * 0.36;

        const desiredRoll = isCrashed
            ? this.roll + this.rollVel * dt
            : THREE.MathUtils.clamp(
                  -this.vel.x * 0.085 - lateralError * 0.22 + cursorRollBias + hoverOscRoll,
                  -0.65,
                  0.65
              );
        const rollAcc = (desiredRoll - this.roll) * 125 - this.rollVel * 13;
        this.rollVel += rollAcc * dt;
        this.roll += this.rollVel * dt;

        const restingRake = -0.18;
        const desiredPitch = isCrashed
            ? this.pitch + this.pitchVel * dt
            : THREE.MathUtils.clamp(
                  restingRake + this.vel.y * 0.045 + (isHitStop ? 0.24 : 0) - this.vel.z * 0.009 + cursorPitchBias + hoverOscPitch,
                  -0.45,
                  0.48
              );
        const pitchAcc = (desiredPitch - this.pitch) * 110 - this.pitchVel * 11;
        this.pitchVel += pitchAcc * dt;
        this.pitch += this.pitchVel * dt;

        const desiredYaw = isCrashed
            ? this.yaw + this.yawVel * dt
            : THREE.MathUtils.clamp(
                  -this.vel.x * 0.032 - lateralError * 0.085 + cursorYawBias,
                  -0.52,
                  0.52
              );
        const yawAcc = (desiredYaw - this.yaw) * 110 - this.yawVel * 12;
        this.yawVel += yawAcc * dt;
        this.yaw += this.yawVel * dt;

        this.chassis.rotation.order = 'YXZ';
        this.chassis.rotation.y = this.yaw;
        this.chassis.rotation.x = this.pitch;
        this.chassis.rotation.z = this.roll;

        // Articulated Aileron Flaps, Canards, Vector Nozzles & Mechanical Exhaust Vents
        this.leftWingFlap.rotation.z = THREE.MathUtils.clamp(-this.roll * 0.82, -0.58, 0.58);
        this.rightWingFlap.rotation.z = THREE.MathUtils.clamp(-this.roll * 0.82, -0.58, 0.58);
        this.leftCanard.rotation.x = this.pitch * 0.95 + hoverOscPitch;
        this.rightCanard.rotation.x = this.pitch * 0.95 + hoverOscPitch;

        // Vector-thrust nozzles gimballing with cursor yaw/pitch!
        const nozzleYaw = -this.smoothedCursorAim.x * 0.22;
        const nozzlePitch = this.smoothedCursorAim.y * 0.18;
        this.leftNozzle.rotation.set(nozzlePitch, nozzleYaw, 0);
        this.rightNozzle.rotation.set(nozzlePitch, nozzleYaw, 0);
        this.centerNozzle.rotation.set(nozzlePitch, nozzleYaw, 0);

        const ventOpenAngle = isHitStop || isBursting ? 0.5 : 0.18 + Math.sin(this.elapsed * 8) * 0.08;
        for (let i = 0; i < this.exhaustVents.length; i++) {
            this.exhaustVents[i].rotation.x = ventOpenAngle;
        }

        const speedNorm = Math.min(3.2, Math.hypot(this.vel.x, this.vel.z) / 12);
        const jetStretch =
            (isHitStop ? 3.2 : isBursting ? 3.8 : 1.25 + speedNorm * 1.15) +
            Math.sin(this.elapsed * 48) * 0.25;

        this.leftPlasmaJet.scale.set(1 + speedNorm * 0.26, 1 + speedNorm * 0.26, jetStretch);
        this.rightPlasmaJet.scale.set(1 + speedNorm * 0.26, 1 + speedNorm * 0.26, jetStretch);
        this.centerPlasmaJet.scale.set(1 + speedNorm * 0.32, 1 + speedNorm * 0.32, jetStretch * 1.18);

        // Forward Spotlight tracks cursor aim & hovered lane
        const aimWorldX =
            hoveredLaneX !== null
                ? hoveredLaneX
                : this.pos.x + this.smoothedCursorAim.x * 7.5;
        const aimWorldY = -0.4 - this.smoothedCursorAim.y * 3.2;
        this.noseLightTarget.position.set(aimWorldX, aimWorldY, this.pos.z - 16);

        this.root.updateMatrixWorld(true);
        this.updateWingtipIonRibbons();
        this.updatePlasmaParticles(dt, isHitStop || isBursting, speedNorm);
    }

    private updateWingtipIonRibbons() {
        const worldL = this.scratchWingtipL;
        const worldR = this.scratchWingtipR;
        this.wingtipL.getWorldPosition(worldL);
        this.wingtipR.getWorldPosition(worldR);

        for (let i = RIBBON_SEGMENTS - 1; i > 0; i--) {
            this.ribbonHistoryL[i].copy(this.ribbonHistoryL[i - 1]);
            this.ribbonHistoryR[i].copy(this.ribbonHistoryR[i - 1]);
            this.ribbonHistoryL[i].z += 0.22;
            this.ribbonHistoryR[i].z += 0.22;
        }
        this.ribbonHistoryL[0].copy(worldL);
        this.ribbonHistoryR[0].copy(worldR);

        const populateRibbonBuffer = (history: THREE.Vector3[], buf: Float32Array, geo: THREE.BufferGeometry) => {
            for (let i = 0; i < RIBBON_SEGMENTS; i++) {
                const p = history[i];
                const taper = (1 - i / (RIBBON_SEGMENTS - 1)) * 0.2;
                const idx = i * 6;
                buf[idx] = p.x - taper;
                buf[idx + 1] = p.y;
                buf[idx + 2] = p.z;

                buf[idx + 3] = p.x + taper;
                buf[idx + 4] = p.y;
                buf[idx + 5] = p.z;
            }
            (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        };

        populateRibbonBuffer(this.ribbonHistoryL, this.leftRibbonPos, this.leftRibbonGeo);
        populateRibbonBuffer(this.ribbonHistoryR, this.rightRibbonPos, this.rightRibbonGeo);
    }

    private updatePlasmaParticles(dt: number, isOverdrive: boolean, speedNorm: number) {
        const tipL = this.scratchNozzleTipL;
        const tipR = this.scratchNozzleTipR;
        const tipC = this.scratchNozzleTipC;
        this.nozzleTipL.getWorldPosition(tipL);
        this.nozzleTipR.getWorldPosition(tipR);
        this.nozzleTipCenter.getWorldPosition(tipC);

        const exhaustDir = this.scratchExhaustDir.set(0, 0.04, 1).applyQuaternion(this.chassis.quaternion).normalize();

        const spawnSets = isOverdrive ? 10 : 6;
        for (let s = 0; s < spawnSets; s++) {
            this.spawnSinglePlasmaParticle(tipL, exhaustDir, isOverdrive, speedNorm, 0);
            this.spawnSinglePlasmaParticle(tipR, exhaustDir, isOverdrive, speedNorm, 1);
            this.spawnSinglePlasmaParticle(tipC, exhaustDir, isOverdrive, speedNorm, 2);
        }

        for (let i = 0; i < PLASMA_PARTICLE_COUNT; i++) {
            const p = this.plasmaParticles[i];
            if (p.age >= p.maxAge) {
                this.plasmaPositions[i * 3 + 1] = -999;
                continue;
            }

            p.age += dt;

            if (p.isEmber) {
                p.vx += Math.sin(this.elapsed * 22 + i) * 3.0 * dt;
                p.vy += Math.cos(this.elapsed * 18 + i) * 2.2 * dt;
            }

            this.plasmaPositions[i * 3] += p.vx * dt;
            this.plasmaPositions[i * 3 + 1] += p.vy * dt;
            this.plasmaPositions[i * 3 + 2] += p.vz * dt;

            const fade = Math.max(0, 1 - p.age / p.maxAge);
            this.plasmaColors[i * 3] = p.color.r * fade;
            this.plasmaColors[i * 3 + 1] = p.color.g * fade;
            this.plasmaColors[i * 3 + 2] = p.color.b * fade;
        }

        (this.plasmaGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.plasmaGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    }

    private spawnSinglePlasmaParticle(
        origin: THREE.Vector3,
        exhaustDir: THREE.Vector3,
        isOverdrive: boolean,
        speedNorm: number,
        nozzleId: number
    ) {
        const idx = this.plasmaSpawnCursor;
        this.plasmaSpawnCursor = (this.plasmaSpawnCursor + 1) % PLASMA_PARTICLE_COUNT;

        const p = this.plasmaParticles[idx];
        p.age = 0;
        p.isEmber = nozzleId === 2 || idx % 3 === 0;
        p.maxAge = p.isEmber ? 0.34 + Math.random() * 0.36 : 0.22 + Math.random() * 0.2;

        const colorHex = p.isEmber
            ? PLASMA_PALETTE_HEX[idx % 2 === 0 ? 2 : 3]
            : nozzleId === 0
              ? PLASMA_PALETTE_HEX[0]
              : PLASMA_PALETTE_HEX[1];
        p.color.setHex(colorHex);

        const spread = isOverdrive ? 0.22 : 0.14;
        this.plasmaPositions[idx * 3] = origin.x + (Math.random() - 0.5) * spread;
        this.plasmaPositions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * spread;
        this.plasmaPositions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;

        const blastSpeed = (isOverdrive ? 28 : 17 + speedNorm * 6) + Math.random() * 6;
        p.vx = exhaustDir.x * blastSpeed + (Math.random() - 0.5) * (p.isEmber ? 3.5 : 2.2) + this.vel.x * 0.18;
        p.vy = exhaustDir.y * blastSpeed + (Math.random() - 0.5) * (p.isEmber ? 2.8 : 1.6);
        p.vz = exhaustDir.z * blastSpeed + (Math.random() - 0.5) * 2.2;
    }
}
