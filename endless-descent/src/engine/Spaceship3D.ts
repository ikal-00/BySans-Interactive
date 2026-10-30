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
 * Creates a thick bold black cartoon ink outline using the inverted hull technique
 * (extruding vertices along face/vertex normals with BackSide rendering).
 * Delivers clean, authentic Looney Tunes cel-shaded borders in full 3D!
 */
function createInvertedHullOutline(
    geo: THREE.BufferGeometry,
    thickness = 0.08,
    pos?: THREE.Vector3,
    rot?: THREE.Euler
): THREE.Mesh {
    const outlineGeo = geo.clone();
    const posAttr = outlineGeo.attributes.position;
    const normAttr = outlineGeo.attributes.normal;
    if (posAttr && normAttr) {
        for (let i = 0; i < posAttr.count; i++) {
            posAttr.setXYZ(
                i,
                posAttr.getX(i) + normAttr.getX(i) * thickness,
                posAttr.getY(i) + normAttr.getY(i) * thickness,
                posAttr.getZ(i) + normAttr.getZ(i) * thickness
            );
        }
        outlineGeo.computeVertexNormals();
    }
    const outlineMat = new THREE.MeshBasicMaterial({
        color: 0x050508,
        side: THREE.BackSide,
        depthWrite: true
    });
    const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
    if (pos) outlineMesh.position.copy(pos);
    if (rot) outlineMesh.rotation.copy(rot);
    outlineMesh.renderOrder = -1;
    return outlineMesh;
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
    private reactorCore!: THREE.Mesh;
    private leftNozzle!: THREE.Group;
    private rightNozzle!: THREE.Group;
    private centerNozzle!: THREE.Group;
    private leftPlasmaJet!: THREE.Mesh;
    private rightPlasmaJet!: THREE.Mesh;
    private centerPlasmaJet!: THREE.Mesh;

    // Classic Cartoon Looney Tunes Squash & Stretch + Expressive Physics
    public impactWobbleTimer = 0;
    public anticipationSquashTimer = 0;

    // World-space anchors for wingtip ion ribbons & triple rear thruster nozzles
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
    public pos = new THREE.Vector3(0, 1.25, 0);
    public vel = new THREE.Vector3(0, 0, 0);
    public targetPos = new THREE.Vector3(0, 1.25, 0);

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

    // Classic Looney Tunes Expressive Dynamic Cartoon Eyes & Canopy Visor
    private eyesCanvas!: HTMLCanvasElement;
    private eyesCtx!: CanvasRenderingContext2D;
    public eyesTex!: THREE.CanvasTexture;
    private visorMesh!: THREE.Mesh;
    private blinkTimer = 2.8;
    private blinkProgress = 0; // 0 = open, 1 = fully shut
    private currentLookX = 0;
    private currentLookY = 0;

    private elapsed = 0;

    constructor(scene: THREE.Scene, textures: PBRTexturePack) {
        this.root = new THREE.Group();
        this.chassis = new THREE.Group();
        this.root.add(this.chassis);
        scene.add(this.root);

        this.buildOverdriveSpacecraft(textures);
        this.buildCartoonVisorAndEyes();
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
        // Metallic hull reflects ambient & directional light cleanly (zero self-emissive blowout)
        const hullMat = new THREE.MeshStandardMaterial({
            map: textures.hullColor,
            bumpMap: textures.hullBump,
            bumpScale: 0.065,
            roughnessMap: textures.hullRoughness,
            roughness: 0.28,
            metalness: 0.82
        });

        const darkArmorMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.34,
            metalness: 0.88
        });

        const mechanicalSteelMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.25,
            metalness: 0.92
        });

        const canopyGlassMat = new THREE.MeshPhysicalMaterial({
            map: textures.windshieldEyesTex,
            color: 0x1e293b,
            roughness: 0.08,
            metalness: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });

        // Subtle hull trim material (non-blinding so mechanical hull details stay crisp)
        this.accentMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.38,
            roughness: 0.22,
            metalness: 0.75
        });

        // High-energy glow restricted strictly to Rear Thruster Nozzles & Exhaust
        this.thrusterCoreMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 2.1,
            roughness: 0.12,
            metalness: 0.5
        });

        // 1. Central Starfighter Armored Fuselage & Sculpted Chiseled Nose Cone
        const coreHullGeo = new THREE.BoxGeometry(1.72, 0.74, 3.95);
        const coreHull = new THREE.Mesh(coreHullGeo, hullMat);
        coreHull.position.set(0, 0.26, 0.1);
        coreHull.castShadow = true;
        coreHull.receiveShadow = true;
        this.chassis.add(coreHull);

        // Dorsal Spine Mechanical Armor Ridge
        const spineGeo = new THREE.BoxGeometry(0.58, 0.22, 2.85);
        const spineMesh = new THREE.Mesh(spineGeo, darkArmorMat);
        spineMesh.position.set(0, 0.66, 0.45);
        spineMesh.castShadow = true;
        this.chassis.add(spineMesh);

        const noseConeGeo = new THREE.ConeGeometry(0.92, 2.45, 6);
        noseConeGeo.rotateX(-Math.PI / 2);
        noseConeGeo.scale(1.12, 0.5, 1.0);
        const noseCone = new THREE.Mesh(noseConeGeo, hullMat);
        noseCone.position.set(0, 0.21, -2.92);
        noseCone.castShadow = true;
        noseCone.receiveShadow = true;
        this.chassis.add(noseCone);

        // Forward Twin Canard Stabilizer Fins (Articulated with Cursor Pitch)
        const canardGeo = new THREE.BoxGeometry(0.78, 0.08, 0.62);
        this.leftCanard = new THREE.Mesh(canardGeo, hullMat);
        this.leftCanard.position.set(-0.98, 0.22, -1.75);
        this.leftCanard.rotation.y = 0.35;

        this.rightCanard = new THREE.Mesh(canardGeo, hullMat);
        this.rightCanard.position.set(0.98, 0.22, -1.75);
        this.rightCanard.rotation.y = -0.35;
        this.chassis.add(this.leftCanard, this.rightCanard);

        // 2. Mechanical Articulated Thermal Exhaust Louver Vents (6 Dorsal Radiator Flaps)
        const ventFlapGeo = new THREE.BoxGeometry(0.46, 0.06, 0.26);
        for (let i = 0; i < 3; i++) {
            const zPos = 0.25 + i * 0.46;
            const ventL = new THREE.Mesh(ventFlapGeo, mechanicalSteelMat);
            ventL.position.set(-0.58, 0.66, zPos);
            const ventR = new THREE.Mesh(ventFlapGeo, mechanicalSteelMat);
            ventR.position.set(0.58, 0.66, zPos);
            this.chassis.add(ventL, ventR);
            this.exhaustVents.push(ventL, ventR);
        }

        // 3. Polarized Cockpit Canopy + Armored Frame
        const canopyGeo = new THREE.BoxGeometry(1.12, 0.46, 1.85);
        const canopy = new THREE.Mesh(canopyGeo, canopyGlassMat);
        canopy.position.set(0, 0.68, -0.58);
        canopy.rotation.x = -0.12;
        this.chassis.add(canopy);

        // 4. Dorsal Mechanical Power Core (Clean faceted crystal — NO cage rings!)
        const reactorGeo = new THREE.OctahedronGeometry(0.28, 0);
        this.reactorCore = new THREE.Mesh(reactorGeo, this.accentMat);
        this.reactorCore.position.set(0, 0.76, 1.15);
        this.chassis.add(this.reactorCore);

        // 5. Swept Variable-Geometry Delta Wings + Mechanical Pods + Aileron Flaps
        const wingShape = new THREE.BoxGeometry(1.92, 0.14, 2.45);
        const leftWing = new THREE.Mesh(wingShape, hullMat);
        leftWing.position.set(-1.62, 0.18, 0.35);
        leftWing.rotation.y = 0.28;
        leftWing.castShadow = true;
        leftWing.receiveShadow = true;

        const rightWing = new THREE.Mesh(wingShape, hullMat);
        rightWing.position.set(1.62, 0.18, 0.35);
        rightWing.rotation.y = -0.28;
        rightWing.castShadow = true;
        rightWing.receiveShadow = true;
        this.chassis.add(leftWing, rightWing);

        // Under-wing Weapon / Telemetry Pods
        const podGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.65, 10);
        podGeo.rotateX(Math.PI / 2);
        const podL = new THREE.Mesh(podGeo, darkArmorMat);
        podL.position.set(-1.95, 0.06, 0.05);
        const podR = new THREE.Mesh(podGeo, darkArmorMat);
        podR.position.set(1.95, 0.06, 0.05);
        this.chassis.add(podL, podR);

        // Subtle Wing Leading-Edge Trim
        const edgeStripGeo = new THREE.BoxGeometry(1.65, 0.06, 0.1);
        const edgeL = new THREE.Mesh(edgeStripGeo, this.accentMat);
        edgeL.position.set(-1.62, 0.2, -0.82);
        edgeL.rotation.y = 0.28;
        const edgeR = new THREE.Mesh(edgeStripGeo, this.accentMat);
        edgeR.position.set(1.62, 0.2, -0.82);
        edgeR.rotation.y = -0.28;
        this.chassis.add(edgeL, edgeR);

        // Articulated Wing Flaps
        this.leftWingFlap = new THREE.Group();
        this.leftWingFlap.position.set(-2.45, 0.18, 0.68);
        const flapGeo = new THREE.BoxGeometry(0.72, 0.1, 1.42);
        const flapL = new THREE.Mesh(flapGeo, darkArmorMat);
        this.leftWingFlap.add(flapL);

        this.rightWingFlap = new THREE.Group();
        this.rightWingFlap.position.set(2.45, 0.18, 0.68);
        const flapR = new THREE.Mesh(flapGeo, darkArmorMat);
        this.rightWingFlap.add(flapR);
        this.chassis.add(this.leftWingFlap, this.rightWingFlap);

        // Angled Twin Vertical Tail Stabilizers
        const finGeo = new THREE.BoxGeometry(0.14, 0.98, 1.55);
        const finL = new THREE.Mesh(finGeo, hullMat);
        finL.position.set(-0.96, 0.76, 1.38);
        finL.rotation.z = 0.32;
        finL.castShadow = true;

        const finR = new THREE.Mesh(finGeo, hullMat);
        finR.position.set(0.96, 0.76, 1.38);
        finR.rotation.z = -0.32;
        finR.castShadow = true;
        this.chassis.add(finL, finR);

        // Wingtip Emitter Anchors
        this.wingtipL = new THREE.Object3D();
        this.wingtipL.position.set(-2.68, 0.18, 1.28);
        this.chassis.add(this.wingtipL);

        this.wingtipR = new THREE.Object3D();
        this.wingtipR.position.set(2.68, 0.18, 1.28);
        this.chassis.add(this.wingtipR);

        // 6. Triple Vector-Thrust Rear Plasma Engine Nacelles (z > 2.0)
        //    Heavy glow restricted strictly here at the rear exhaust!
        this.leftNozzle = new THREE.Group();
        this.leftNozzle.position.set(-0.66, 0.22, 2.1);
        this.chassis.add(this.leftNozzle);

        this.rightNozzle = new THREE.Group();
        this.rightNozzle.position.set(0.66, 0.22, 2.1);
        this.chassis.add(this.rightNozzle);

        this.centerNozzle = new THREE.Group();
        this.centerNozzle.position.set(0, 0.34, 2.16);
        this.chassis.add(this.centerNozzle);

        const nacelleGeo = new THREE.CylinderGeometry(0.36, 0.45, 0.94, 16);
        nacelleGeo.rotateX(Math.PI / 2);
        const nacelleL = new THREE.Mesh(nacelleGeo, darkArmorMat);
        const nacelleR = new THREE.Mesh(nacelleGeo, darkArmorMat);
        this.leftNozzle.add(nacelleL);
        this.rightNozzle.add(nacelleR);

        const centerNacelleGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.85, 16);
        centerNacelleGeo.rotateX(Math.PI / 2);
        const nacelleC = new THREE.Mesh(centerNacelleGeo, darkArmorMat);
        this.centerNozzle.add(nacelleC);

        // Glowing Internal Rear Thruster Cores (strictly inside rear nozzles)
        const coreDiscGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
        coreDiscGeo.rotateX(Math.PI / 2);
        const coreL = new THREE.Mesh(coreDiscGeo, this.thrusterCoreMat);
        coreL.position.z = 0.44;
        const coreR = new THREE.Mesh(coreDiscGeo, this.thrusterCoreMat);
        coreR.position.z = 0.44;
        this.leftNozzle.add(coreL);
        this.rightNozzle.add(coreR);

        const centerCoreGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 16);
        centerCoreGeo.rotateX(Math.PI / 2);
        const coreC = new THREE.Mesh(centerCoreGeo, this.thrusterCoreMat);
        coreC.position.z = 0.42;
        this.centerNozzle.add(coreC);

        // Volumetric Rear Plasma Afterburner Plumes
        this.plasmaJetMatL = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.plasmaJetMatR = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.plasmaJetMatCenter = new THREE.MeshBasicMaterial({
            color: 0xfde047,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const jetGeo = new THREE.ConeGeometry(0.32, 2.55, 14);
        jetGeo.rotateX(Math.PI / 2);
        jetGeo.translate(0, 0, 1.45);

        const centerJetGeo = new THREE.ConeGeometry(0.25, 2.95, 14);
        centerJetGeo.rotateX(Math.PI / 2);
        centerJetGeo.translate(0, 0, 1.62);

        this.leftPlasmaJet = new THREE.Mesh(jetGeo, this.plasmaJetMatL);
        this.rightPlasmaJet = new THREE.Mesh(jetGeo, this.plasmaJetMatR);
        this.centerPlasmaJet = new THREE.Mesh(centerJetGeo, this.plasmaJetMatCenter);
        this.leftNozzle.add(this.leftPlasmaJet);
        this.rightNozzle.add(this.rightPlasmaJet);
        this.centerNozzle.add(this.centerPlasmaJet);

        this.nozzleTipL = new THREE.Object3D();
        this.nozzleTipL.position.set(0, 0, 0.5);
        this.leftNozzle.add(this.nozzleTipL);

        this.nozzleTipR = new THREE.Object3D();
        this.nozzleTipR.position.set(0, 0, 0.5);
        this.rightNozzle.add(this.nozzleTipR);

        this.nozzleTipCenter = new THREE.Object3D();
        this.nozzleTipCenter.position.set(0, 0, 0.48);
        this.centerNozzle.add(this.nozzleTipCenter);

        // 7. Bold Classic Looney Tunes 3D Inverted Hull Black Ink Outlines
        this.chassis.add(createInvertedHullOutline(coreHullGeo, 0.088, coreHull.position));
        this.chassis.add(createInvertedHullOutline(spineGeo, 0.075, spineMesh.position));
        this.chassis.add(createInvertedHullOutline(noseConeGeo, 0.095, noseCone.position));
        this.chassis.add(createInvertedHullOutline(canopyGeo, 0.082, canopy.position, canopy.rotation));

        this.leftCanard.add(createInvertedHullOutline(canardGeo, 0.075));
        this.rightCanard.add(createInvertedHullOutline(canardGeo, 0.075));

        this.chassis.add(createInvertedHullOutline(wingShape, 0.085, leftWing.position, leftWing.rotation));
        this.chassis.add(createInvertedHullOutline(wingShape, 0.085, rightWing.position, rightWing.rotation));

        this.leftWingFlap.add(createInvertedHullOutline(flapGeo, 0.075));
        this.rightWingFlap.add(createInvertedHullOutline(flapGeo, 0.075));

        this.chassis.add(createInvertedHullOutline(finGeo, 0.082, finL.position, finL.rotation));
        this.chassis.add(createInvertedHullOutline(finGeo, 0.082, finR.position, finR.rotation));

        this.leftNozzle.add(createInvertedHullOutline(nacelleGeo, 0.075));
        this.rightNozzle.add(createInvertedHullOutline(nacelleGeo, 0.075));
        this.centerNozzle.add(createInvertedHullOutline(centerNacelleGeo, 0.075));
    }

    private buildCartoonVisorAndEyes() {
        this.eyesCanvas = document.createElement('canvas');
        this.eyesCanvas.width = 512;
        this.eyesCanvas.height = 256;
        this.eyesCtx = this.eyesCanvas.getContext('2d')!;
        this.eyesTex = new THREE.CanvasTexture(this.eyesCanvas);
        this.eyesTex.colorSpace = THREE.SRGBColorSpace;

        // Visor plate angled back (~50°) directly facing the elevated 3D camera on the top of the canopy
        const visorGeo = new THREE.PlaneGeometry(1.24, 0.98);
        visorGeo.rotateX(-Math.PI * 0.28);
        const visorMat = new THREE.MeshBasicMaterial({
            map: this.eyesTex,
            side: THREE.DoubleSide,
            depthTest: true
        });
        this.visorMesh = new THREE.Mesh(visorGeo, visorMat);
        this.visorMesh.position.set(0, 0.96, -0.50);
        this.visorMesh.renderOrder = 10;
        this.chassis.add(this.visorMesh);

        this.drawCartoonEyes('idle', 0, 0, 0, 1.0);
    }

    public drawCartoonEyes(
        mood: 'idle' | 'jumping' | 'nervous' | 'panic' | 'crashed' | 'win',
        lookX: number,
        lookY: number,
        blink: number,
        _multiplier: number
    ) {
        const ctx = this.eyesCtx;
        const w = 512;
        const h = 256;

        // 1. Deep Cel-Shaded Midnight Navy / Cyan Visor Background
        const glassGrad = ctx.createLinearGradient(0, 0, w, h);
        glassGrad.addColorStop(0, '#060a14');
        glassGrad.addColorStop(0.5, '#0e1c32');
        glassGrad.addColorStop(1, '#060a14');
        ctx.fillStyle = glassGrad;
        ctx.fillRect(0, 0, w, h);

        // Bold Looney Tunes diagonal cartoon glass sheen streaks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(80, 0);
        ctx.lineTo(135, 0);
        ctx.lineTo(35, h);
        ctx.lineTo(-20, h);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(170, 0);
        ctx.lineTo(195, 0);
        ctx.lineTo(95, h);
        ctx.lineTo(70, h);
        ctx.closePath();
        ctx.fill();

        // Thick comic black ink border
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = 14;
        ctx.strokeRect(7, 7, w - 14, h - 14);

        const eyeCenters = [
            { x: 168, y: 130 },
            { x: 344, y: 130 }
        ];

        // 2. Comedic Defeat / Crashed State (Classic Cartoon "X" Eyes!)
        if (mood === 'crashed') {
            for (const { x, y } of eyeCenters) {
                // Sclera oval
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.ellipse(x, y, 56, 68, 0, 0, Math.PI * 2);
                ctx.fill();

                // Heavy black ink outline
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.ellipse(x, y, 56, 68, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Bold cartoon red X with black underlay
                const s = 28;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 14;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x - s, y - s);
                ctx.lineTo(x + s, y + s);
                ctx.moveTo(x + s, y - s);
                ctx.lineTo(x - s, y + s);
                ctx.stroke();

                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(x - s, y - s);
                ctx.lineTo(x + s, y + s);
                ctx.moveTo(x + s, y - s);
                ctx.lineTo(x - s, y + s);
                ctx.stroke();
            }
            this.eyesTex.needsUpdate = true;
            return;
        }

        // 3. Victory / Cashed Out State (Happy Crescent Eyes ^  ^ with Golden Sparkles!)
        if (mood === 'win') {
            for (const { x, y } of eyeCenters) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 18;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(x, y + 16, 42, Math.PI * 1.15, Math.PI * 1.85, false);
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 10;
                ctx.stroke();

                // Cartoon celebration sparkle star
                ctx.fillStyle = '#fde047';
                ctx.beginPath();
                const starSize = 14;
                ctx.moveTo(x, y - 40 - starSize);
                ctx.lineTo(x + 4, y - 40);
                ctx.lineTo(x + starSize, y - 40);
                ctx.lineTo(x + 5, y - 40 + 5);
                ctx.lineTo(x + 8, y - 40 + starSize);
                ctx.lineTo(x, y - 40 + 8);
                ctx.lineTo(x - 8, y - 40 + starSize);
                ctx.lineTo(x - 5, y - 40 + 5);
                ctx.lineTo(x - starSize, y - 40);
                ctx.lineTo(x - 4, y - 40);
                ctx.closePath();
                ctx.fill();
            }
            this.eyesTex.needsUpdate = true;
            return;
        }

        // 4. Dynamic Expressive Cartoon Eyes (Idle, Jumping, Nervous, Panic)
        const isPanic = mood === 'panic';
        const isNervous = mood === 'nervous';
        const isJumping = mood === 'jumping';

        for (let i = 0; i < 2; i++) {
            const { x, y } = eyeCenters[i];
            const eyeW = isJumping ? 54 : isPanic ? 62 : 56;
            const eyeH = isJumping ? 76 : isPanic ? 72 : 68;

            // Eye drop shadow
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(x, y + 4, eyeW + 2, eyeH + 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Thick cartoon black ink outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.ellipse(x, y, eyeW, eyeH, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Sclera fill (pure glossy white)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(x, y, eyeW - 3, eyeH - 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Clip region so pupils never escape eyeball boundaries
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(x, y, eyeW - 4, eyeH - 4, 0, 0, Math.PI * 2);
            ctx.clip();

            let pOffsetX = lookX * 20;
            let pOffsetY = lookY * 15;

            // Panic high-multiplier jitter
            if (isPanic) {
                pOffsetX += Math.sin(this.elapsed * 48 + i) * 3.5;
                pOffsetY += Math.cos(this.elapsed * 48 + i) * 3.5;
            }

            const pupilCenterX = x + pOffsetX;
            const pupilCenterY = y + pOffsetY;

            const irisRadius = isPanic ? 16 : isNervous ? 24 : 32;
            const pupilRadius = isPanic ? 8 : isNervous ? 14 : 20;

            // Electric Cyan / Blue cel iris
            const irisGrad = ctx.createLinearGradient(
                pupilCenterX - irisRadius,
                pupilCenterY - irisRadius,
                pupilCenterX + irisRadius,
                pupilCenterY + irisRadius
            );
            irisGrad.addColorStop(0, '#38bdf8');
            irisGrad.addColorStop(0.55, '#0284c7');
            irisGrad.addColorStop(1, '#0369a1');
            ctx.fillStyle = irisGrad;
            ctx.beginPath();
            ctx.ellipse(pupilCenterX, pupilCenterY, irisRadius, irisRadius * 1.15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Solid black pupil
            ctx.fillStyle = '#050508';
            ctx.beginPath();
            ctx.arc(pupilCenterX, pupilCenterY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            // Double white specular highlights
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pupilCenterX - pupilRadius * 0.45, pupilCenterY - pupilRadius * 0.45, isPanic ? 3 : 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pupilCenterX + pupilRadius * 0.38, pupilCenterY + pupilRadius * 0.38, isPanic ? 1.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Blinking eyelid
            if (blink > 0) {
                const eyelidH = eyeH * 2 * blink;
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.rect(x - eyeW - 5, y - eyeH - 5, (eyeW + 5) * 2, eyelidH);
                ctx.fill();

                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.moveTo(x - eyeW, y - eyeH - 5 + eyelidH);
                ctx.lineTo(x + eyeW, y - eyeH - 5 + eyelidH);
                ctx.stroke();
            }

            ctx.restore();

            // Eyebrows
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            if (isPanic) {
                const browY = y - eyeH - 8 + Math.sin(this.elapsed * 40 + i) * 2;
                const slant = i === 0 ? 12 : -12;
                ctx.moveTo(x - 34, browY + slant);
                ctx.quadraticCurveTo(x, browY - 14, x + 34, browY - slant);
            } else if (isNervous) {
                const browY = y - eyeH - 6;
                const slant = i === 0 ? 9 : -9;
                ctx.moveTo(x - 30, browY + slant);
                ctx.lineTo(x + 30, browY - slant);
            } else {
                const browY = y - eyeH - 8;
                ctx.moveTo(x - 28, browY + 6);
                ctx.quadraticCurveTo(x, browY - 10, x + 28, browY + 4);
            }
            ctx.stroke();
        }

        // Animated Cartoon Sweat Droplets on temples in tension/panic
        if (isPanic || isNervous) {
            const sweatY = 55 + (this.elapsed * 55) % 80;
            ctx.fillStyle = '#38bdf8';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(435, sweatY);
            ctx.quadraticCurveTo(442, sweatY + 12, 435, sweatY + 18);
            ctx.quadraticCurveTo(428, sweatY + 12, 435, sweatY);
            ctx.fill();
            ctx.stroke();

            if (isPanic) {
                const sweat2Y = 68 + (this.elapsed * 65 + 40) % 75;
                ctx.beginPath();
                ctx.moveTo(75, sweat2Y);
                ctx.quadraticCurveTo(82, sweat2Y + 10, 75, sweat2Y + 16);
                ctx.quadraticCurveTo(68, sweat2Y + 10, 75, sweat2Y);
                ctx.fill();
                ctx.stroke();
            }
        }

        this.eyesTex.needsUpdate = true;
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
        currentMultiplier = 1.0,
        isCashedOut = false
    ) {
        this.elapsed += dt;

        // Dynamic Looney Tunes Cartoon Eyes: Blinking, Iris Aim & Tension Reactions
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            this.blinkProgress += dt * 8.5;
            if (this.blinkProgress >= 1.0) {
                this.blinkProgress = 0;
                this.blinkTimer = 2.2 + Math.random() * 3.0;
            }
        } else {
            this.blinkProgress = 0;
        }

        const targetLookX =
            hoveredLaneX !== null
                ? THREE.MathUtils.clamp((hoveredLaneX - this.pos.x) / 4.8, -1, 1)
                : this.smoothedCursorAim.x;
        const targetLookY = isHitStop ? -0.4 : this.smoothedCursorAim.y * 0.45;

        this.currentLookX = THREE.MathUtils.lerp(this.currentLookX, targetLookX, Math.min(1, dt * 12));
        this.currentLookY = THREE.MathUtils.lerp(this.currentLookY, targetLookY, Math.min(1, dt * 12));

        let mood: 'idle' | 'jumping' | 'nervous' | 'panic' | 'crashed' | 'win' = 'idle';
        if (isCrashed) {
            mood = 'crashed';
        } else if (isCashedOut) {
            mood = 'win';
        } else if (isHitStop) {
            mood = 'jumping';
        } else if (currentMultiplier >= 3.8) {
            mood = 'panic';
        } else if (currentMultiplier >= 1.7) {
            mood = 'nervous';
        }

        this.drawCartoonEyes(mood, this.currentLookX, this.currentLookY, this.blinkProgress, currentMultiplier);

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

        const desiredPitch = isCrashed
            ? this.pitch + this.pitchVel * dt
            : THREE.MathUtils.clamp(
                  this.vel.y * 0.045 + (isHitStop ? 0.24 : 0) - this.vel.z * 0.009 + cursorPitchBias + hoverOscPitch,
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

        // Spinning Dorsal Reactor Crystal
        this.reactorCore.rotation.y = this.elapsed * 4.5;
        this.reactorCore.rotation.x = this.elapsed * 3.0;

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
