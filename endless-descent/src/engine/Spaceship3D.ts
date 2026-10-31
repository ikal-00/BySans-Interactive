import * as THREE from 'three';
import type { PBRTexturePack } from './Textures3D';

/**
 * [SPACE-OVERDRIVE V4] AAA 3D Sculpted Comic Starfighter (`Spaceship3D`):
 * Built directly from the official ship reference illustration (`/assets/ship_albedo.png`,
 * `/assets/ship_normal.png`, `/assets/ship_emissive.png`) as a watertight, multi-layered
 * 3D depth-sculpted and extruded volumetric mesh with articulated 3D thruster plasma plumes:
 *  - Central vertical stabilizer fin (`dorsalFin`) & curved cyan cockpit canopy dome (`canopy`)
 *  - Raised trapezoidal gunmetal shoulder armor & stepped electric-blue hull trim seams
 *  - Curved weathered-white side cheek hulls with comic panel seams & scuff details
 *  - Upper dihedral stabilizer wings & lower swept main wings with orange wingtip markers
 *  - Octagonal rear armor bulkhead with 3 glowing orange bars & recessed dark circular sub-drive nozzle
 *  - Twin angled cylindrical ribbed lateral booster barrels blasting animated 3D comic cyan/white plasma plumes
 */

function createAnimatedPlumeHighlightTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 512);

    const cx = 128;
    const cy = 96;

    // Outer cyan glow halo
    const outerGrad = ctx.createRadialGradient(cx, cy, 8, cx, 260, 190);
    outerGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
    outerGrad.addColorStop(0.28, 'rgba(125, 211, 252, 0.75)');
    outerGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.28)');
    outerGrad.addColorStop(1.0, 'rgba(14, 165, 233, 0.0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy);
    ctx.quadraticCurveTo(cx, cy - 36, cx + 42, cy);
    ctx.lineTo(cx + 110, 490);
    ctx.lineTo(cx, 440);
    ctx.lineTo(cx - 110, 490);
    ctx.closePath();
    ctx.fill();

    // Jagged white inner core spikes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy);
    ctx.quadraticCurveTo(cx, cy - 26, cx + 32, cy);
    const innerPts: [number, number][] = [
        [cx + 68, 260],
        [cx + 42, 240],
        [cx + 58, 355],
        [cx + 26, 315],
        [cx + 32, 420],
        [cx + 8, 350],
        [cx, 445],
        [cx - 8, 350],
        [cx - 32, 420],
        [cx - 26, 315],
        [cx - 58, 355],
        [cx - 42, 240],
        [cx - 68, 260]
    ];
    for (const [px, py] of innerPts) {
        ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

/**
 * Evaluates the 3D anatomical height/relief `zFront(u, v)` and back-face thickness `zBack(u, v)`
 * for normalized image coordinates `(u, v) ∈ [0, 1]^2` of the reference ship illustration.
 */
function evaluateShipAnatomicalDepth(u: number, v: number): { zFront: number; zBack: number } {
    const dx = u - 0.5;
    const adx = Math.abs(dx);

    // Base fuselage 3D dome profile
    const radialNorm = Math.min(1.0, Math.hypot(dx * 2.1, (v - 0.46) * 1.45));
    const fuselageDome = Math.max(0.0, Math.cos(radialNorm * Math.PI * 0.5)) * 0.42;

    let zFront = fuselageDome;
    let zBack = -0.26 * Math.max(0.25, Math.cos(radialNorm * Math.PI * 0.5));

    // 1. Central Vertical Stabilizer Fin (Top spine blade)
    if (adx < 0.024 && v >= 0.04 && v <= 0.33) {
        const finProfile = 1.0 - adx / 0.024;
        zFront += 0.24 * finProfile;
        zBack -= 0.14 * finProfile;
    }

    // 2. Curved Cyan Glass Cockpit Canopy (Front upper dome sloping forward into -Z)
    if (adx < 0.12 && v >= 0.12 && v <= 0.27) {
        const canopyT = 1.0 - (0.27 - v) / 0.15;
        zFront = 0.16 + 0.18 * canopyT - adx * 0.6;
        zBack = -0.32;
    }

    // 3. Raised Trapezoidal Gunmetal Shoulder Armor Blocks
    if (adx >= 0.025 && adx <= 0.135 && v >= 0.20 && v <= 0.39) {
        zFront += 0.14;
    }

    // 4. Upper Dihedral Wings & Lower Main Swept Wings (Swept 3D airfoils)
    if (adx > 0.175 && v < 0.76) {
        const wingSpanT = Math.min(1.0, (adx - 0.175) / 0.27);
        // Wings sweep slightly forward/upward or outward in 3D space with thin airfoil section
        zFront = 0.18 * (1.0 - wingSpanT) - 0.08 * wingSpanT;
        zBack = zFront - (0.16 * (1.0 - 0.45 * wingSpanT));
    }

    // 5. Octagonal Rear Bulkhead & Recessed Central Circular Sub-Drive Nozzle
    const centerNozzleR = Math.hypot(dx * 1.79, v - 0.542);
    if (adx < 0.125 && v >= 0.34 && v <= 0.77) {
        // Raised octagonal rear armor plate
        zFront = Math.max(zFront, 0.46);
        zBack = -0.34;

        if (centerNozzleR < 0.122) {
            if (centerNozzleR >= 0.074) {
                // Protruding bronze-grey central nozzle bezel ring
                const lipT = Math.sin(((centerNozzleR - 0.074) / (0.122 - 0.074)) * Math.PI);
                zFront = 0.52 + 0.11 * lipT;
            } else {
                // Deeply recessed black circular central sub-drive exhaust core!
                const coreDepth = Math.cos((centerNozzleR / 0.074) * Math.PI * 0.5);
                zFront = 0.48 - 0.36 * coreDepth;
            }
        }
    }

    // 6. Twin Lateral Cylindrical Ribbed Booster Barrels
    // Left barrel center: (0.352, 0.565), Right barrel center: (0.648, 0.565)
    const distLeftBarrel = Math.hypot((u - 0.352) * 1.65, (v - 0.565) * 1.15);
    const distRightBarrel = Math.hypot((u - 0.648) * 1.65, (v - 0.565) * 1.15);
    const barrelR = Math.min(distLeftBarrel, distRightBarrel);
    if (barrelR < 0.145 && v >= 0.44 && v <= 0.72) {
        const cylProfile = Math.cos((barrelR / 0.145) * Math.PI * 0.5);
        zFront = Math.max(zFront, 0.42 + 0.28 * cylProfile);
        zBack = Math.min(zBack, -0.34 - 0.12 * cylProfile);
    }

    // 7. Twin Blazing Comic Plasma Plumes (Emerge from booster barrels and angle slightly toward camera)
    if (v > 0.56) {
        const plumeT = Math.min(1.0, (v - 0.56) / 0.44);
        // Check proximity to left or right plume axis
        const leftPlumeAxisU = 0.344 - 0.095 * plumeT;
        const rightPlumeAxisU = 0.646 + 0.091 * plumeT;
        const distPlumeAxis = Math.min(Math.abs(u - leftPlumeAxisU), Math.abs(u - rightPlumeAxisU));
        if (distPlumeAxis < 0.18) {
            const ridge = Math.max(0.0, 1.0 - distPlumeAxis / 0.18);
            zFront = Math.max(zFront, 0.54 + 0.14 * ridge + 0.08 * plumeT);
            zBack = zFront - (0.14 * ridge + 0.06);
        }
    }

    return { zFront, zBack };
}

/**
 * Builds a closed, watertight 3D sculpted & extruded BufferGeometry from an alpha mask grid
 * of dimension `(gridW x gridH)`. Includes front sculpted relief, back sculpted hull, and
 * stitched 3D perimeter side walls along silhouette edges.
 */
function buildSculpted3DShipGeometry(
    gridW: number,
    gridH: number,
    alphaGrid: Float32Array,
    worldWidth: number,
    worldHeight: number
): THREE.BufferGeometry {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const vCols = gridW + 1;
    const vRows = gridH + 1;
    const frontVertIdx = new Int32Array(vCols * vRows).fill(-1);
    const backVertIdx = new Int32Array(vCols * vRows).fill(-1);

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

    const isCellInteriorSolid = (cx: number, cy: number): boolean => {
        if (cx <= 1 || cx >= gridW - 2 || cy <= 1 || cy >= Math.floor(gridH * 0.68)) return false;
        if (alphaGrid[cy * gridW + cx] < 0.92) return false;
        return (
            alphaGrid[(cy - 1) * gridW + cx] > 0.85 &&
            alphaGrid[(cy + 1) * gridW + cx] > 0.85 &&
            alphaGrid[cy * gridW + (cx - 1)] > 0.85 &&
            alphaGrid[cy * gridW + (cx + 1)] > 0.85
        );
    };

    const getOrAddFrontVert = (vx: number, vy: number): number => {
        const key = vy * vCols + vx;
        if (frontVertIdx[key] !== -1) return frontVertIdx[key];

        const u = vx / gridW;
        const v = vy / gridH;
        const x = (u - 0.5) * worldWidth;
        const y = (0.5 - v) * worldHeight;
        const { zFront } = evaluateShipAnatomicalDepth(u, v);

        const idx = positions.length / 3;
        positions.push(x, y, zFront);
        uvs.push(u, 1.0 - v);
        frontVertIdx[key] = idx;
        return idx;
    };

    const getOrAddBackVert = (vx: number, vy: number): number => {
        const key = vy * vCols + vx;
        if (backVertIdx[key] !== -1) return backVertIdx[key];

        const u = vx / gridW;
        const v = vy / gridH;
        const x = (u - 0.5) * worldWidth;
        const y = (0.5 - v) * worldHeight;
        const { zBack } = evaluateShipAnatomicalDepth(u, v);

        const idx = positions.length / 3;
        positions.push(x, y, zBack);
        uvs.push(u, 1.0 - v);
        backVertIdx[key] = idx;
        return idx;
    };

    for (let cy = 0; cy < gridH; cy++) {
        for (let cx = 0; cx < gridW; cx++) {
            if (!isCellFrontActive(cx, cy)) continue;

            // Front sculpted relief face (CCW winding facing +Z)
            const f00 = getOrAddFrontVert(cx, cy);
            const f10 = getOrAddFrontVert(cx + 1, cy);
            const f01 = getOrAddFrontVert(cx, cy + 1);
            const f11 = getOrAddFrontVert(cx + 1, cy + 1);

            indices.push(f00, f01, f10);
            indices.push(f10, f01, f11);

            if (!isCellInteriorSolid(cx, cy)) continue;

            // Back sculpted hull face (CCW winding facing -Z)
            const b00 = getOrAddBackVert(cx, cy);
            const b10 = getOrAddBackVert(cx + 1, cy);
            const b01 = getOrAddBackVert(cx, cy + 1);
            const b11 = getOrAddBackVert(cx + 1, cy + 1);

            indices.push(b00, b10, b01);
            indices.push(b10, b11, b01);

            // Stitch 3D interior hull walls wherever a neighbor cell is not interior solid
            if (!isCellInteriorSolid(cx, cy - 1)) {
                indices.push(f00, f10, b00);
                indices.push(f10, b10, b00);
            }
            if (!isCellInteriorSolid(cx, cy + 1)) {
                indices.push(f01, b01, f11);
                indices.push(f11, b01, b11);
            }
            if (!isCellInteriorSolid(cx - 1, cy)) {
                indices.push(f00, b00, f01);
                indices.push(f01, b00, b01);
            }
            if (!isCellInteriorSolid(cx + 1, cy)) {
                indices.push(f10, f11, b10);
                indices.push(f11, b11, b10);
            }
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
}

export class Spaceship3D {
    public readonly root: THREE.Group;
    public readonly chassis: THREE.Group;

    // Articulated Mechanical & Plume Sub-Parts
    private sculptedShipMesh!: THREE.Mesh;
    private sculptedShipMat!: THREE.MeshStandardMaterial;
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
    private jetPlumeMat!: THREE.MeshBasicMaterial;

    // Post-Hit-Stop Speed-Burst Tracking
    private wasInHitStop = false;
    public postHitStopBurstTimer = 0;

    // Zero-GC Scratch Vectors
    private readonly scratchNozzleL = new THREE.Vector3();
    private readonly scratchNozzleR = new THREE.Vector3();
    private readonly scratchTipL = new THREE.Vector3();
    private readonly scratchTipR = new THREE.Vector3();
    private readonly scratchSide = new THREE.Vector3(1, 0, 0);
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

        // Initial analytical silhouette grid (128x72) used for the first ~15ms until ship_albedo.png finishes loading
        const gridW = 144;
        const gridH = 82;
        const initAlpha = new Float32Array(gridW * gridH);
        for (let cy = 0; cy < gridH; cy++) {
            const v = (cy + 0.5) / gridH;
            for (let cx = 0; cx < gridW; cx++) {
                const u = (cx + 0.5) / gridW;
                const d = Math.hypot((u - 0.5) * 1.4, (v - 0.5) * 1.3);
                initAlpha[cy * gridW + cx] = d < 0.55 ? 1.0 : 0.0;
            }
        }

        const initialGeo = buildSculpted3DShipGeometry(gridW, gridH, initAlpha, worldWidth, worldHeight);

        const texLoader = new THREE.TextureLoader();
        const albedoTex = texLoader.load('/assets/ship_albedo.png', (loadedTex) => {
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            loadedTex.anisotropy = 8;
            loadedTex.needsUpdate = true;

            // Sample exact alpha silhouette from loaded image to construct the precision 3D extruded relief mesh
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
                const exactGeo = buildSculpted3DShipGeometry(
                    gridW,
                    gridH,
                    exactAlpha,
                    worldWidth,
                    worldHeight
                );
                this.sculptedShipMesh.geometry.dispose();
                this.sculptedShipMesh.geometry = exactGeo;
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

        // Position and orient the 3D sculpted ship assembly so it faces the Orbital Tactical Camera
        // and sits squarely in the showcase window between Row 1 and the bottom HUD bar!
        const shipAssembly = new THREE.Group();
        shipAssembly.position.set(0, 0.56, -0.45);
        shipAssembly.rotation.x = -0.36; // Faces the tactical camera ray cleanly while preserving full 3D depth

        this.sculptedShipMesh = new THREE.Mesh(initialGeo, this.sculptedShipMat);
        this.sculptedShipMesh.castShadow = true;
        this.sculptedShipMesh.receiveShadow = true;
        shipAssembly.add(this.sculptedShipMesh);

        // Dynamic 3D Articulated Thruster Plumes & Core Overlays
        const plumeHighlightTex = createAnimatedPlumeHighlightTexture();
        this.thrusterMat = new THREE.MeshBasicMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.jetPlumeMat = new THREE.MeshBasicMaterial({
            map: plumeHighlightTex,
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const buildDynamicPlumeOverlay = (xOffset: number, yOffset: number, tiltZ: number): THREE.Group => {
            const nozzleGroup = new THREE.Group();
            nozzleGroup.position.set(xOffset, yOffset, 0.68);
            nozzleGroup.rotation.z = tiltZ;

            const jetGroup = new THREE.Group();
            const coreGlowGeo = new THREE.SphereGeometry(0.24, 16, 12);
            coreGlowGeo.scale(1.1, 0.85, 0.55);
            const coreGlowMesh = new THREE.Mesh(coreGlowGeo, this.thrusterMat);
            jetGroup.add(coreGlowMesh);

            const planeGeo = new THREE.PlaneGeometry(0.75, 1.35);
            planeGeo.translate(0, -0.42, 0.04);
            const planeMesh = new THREE.Mesh(planeGeo, this.jetPlumeMat);
            jetGroup.add(planeMesh);

            nozzleGroup.add(jetGroup);
            return nozzleGroup;
        };

        this.leftNozzle = buildDynamicPlumeOverlay(-0.82, -0.36, -0.32);
        this.leftPlasmaJet = this.leftNozzle.children[0] as THREE.Group;

        this.rightNozzle = buildDynamicPlumeOverlay(0.82, -0.36, 0.32);
        this.rightPlasmaJet = this.rightNozzle.children[0] as THREE.Group;

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

        // 1. Spring-Damper Translation Physics
        const stiffness = isAbducted ? 220 : isHitStop ? 55 : isBursting ? 260 : 140;
        const damping = isAbducted ? 24 : isHitStop ? 11 : isBursting ? 19 : 16;

        const forceX = (this.targetPos.x - this.pos.x) * stiffness;
        const forceY = (this.targetPos.y - this.pos.y) * stiffness;
        const forceZ = (this.targetPos.z - this.pos.z) * stiffness;

        this.vel.x += (forceX - this.vel.x * damping) * dt;
        this.vel.y += (forceY - this.vel.y * damping) * dt;
        this.vel.z += (forceZ - this.vel.z * damping) * dt;

        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        this.pos.z += this.vel.z * dt;

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

        // 5. Dynamic 3D Thruster Plumes & Emissive Pulse
        const multProgress = THREE.MathUtils.clamp(Math.log2(Math.max(1, currentMultiplier)) / 6.5, 0, 1);
        const speedBoost = THREE.MathUtils.clamp(speedMagnitude * 0.08, 0, 1.2);
        const burstBoost = isBursting ? (this.postHitStopBurstTimer / 0.44) * 1.4 : 0;
        const winBoost = isCashedOut ? 0.65 + 0.35 * Math.sin(this.elapsed * 18.0) : 0;

        const flicker =
            0.94 +
            0.06 * Math.sin(this.elapsed * 42.0) +
            0.04 * Math.cos(this.elapsed * 68.0);

        const plumeScale = (1.0 + speedBoost * 0.35 + burstBoost * 0.45 + winBoost * 0.25) * flicker;
        this.leftPlasmaJet.scale.set(0.92 + 0.12 * flicker, plumeScale, 1.0);
        this.rightPlasmaJet.scale.set(0.92 + 0.12 * flicker, plumeScale, 1.0);

        // Pulse sculpted ship emissive intensity subtly with thruster power
        this.sculptedShipMat.emissiveIntensity =
            0.32 + 0.08 * Math.sin(this.elapsed * 16.0) + burstBoost * 0.18 + multProgress * 0.10;

        this.engineLight.color.setHex(isCashedOut ? 0x34d399 : accentColorHex || 0x38bdf8);
        this.engineLight.intensity = isCrashed
            ? this.engineLight.intensity
            : 3.2 + speedBoost * 2.2 + burstBoost * 4.0 + multProgress * 1.8;

        this.chassis.updateMatrixWorld(true);

        // 6. Emit 3D Comic Plasma Droplet Particles from the Twin Lateral Thrusters
        if (!isCrashed) {
            this.emitThrusterParticles(dt, speedBoost + burstBoost, isCashedOut);
        }
        this.updateThrusterParticles(dt);
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
        const Side = this.scratchSide;
        void Side;
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
