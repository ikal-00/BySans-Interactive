import * as THREE from 'three';
import gsap from 'gsap';
import { GameState, type RoundPick, type WheelSpinOutcome, type SlotSymbolId, type SlotReelOffset, type SlotSpinOutcome } from '../math/types';
import { calculateNextStepMultiplier } from '../math/multipliers';
import { GameStateController } from './GameState';
import { VFXManager } from './VFX_Manager';
import { createPBRTexturePack, updateHologramBadgeCanvas, updateSlotLedDisplayCanvas, type PBRTexturePack } from './Textures3D';
import { Spaceship3D } from './Spaceship3D';
import { MrDollar3D } from './MrDollar3D';
import { audioController } from './AudioController';

const LANE_COUNT = 5;
const LANE_SPACING_X = 4.35; // Wide 5-lane Cosmic Void spacing: [-8.7, -4.35, 0, +4.35, +8.7]
const ROW_SPACING_Z = 12.2;
const VISIBLE_ROW_SLOTS = 14;
const NEBULA_CLOUD_COUNT = 56;
const NEBULA_FLOW_PARTICLE_COUNT = 650;
const COSMIC_DUST_PARTICLE_COUNT = 1200;
const ASTEROID_COUNT = 64;
const STAR_PARTICLE_COUNT = 2200;
const PLANET_COUNT = 6;
const RING_ASTEROIDS_PER_PLANET = 48; // Lightweight optimized 3D ring asteroids (clean 60+ FPS)
const SHOOTING_STAR_COUNT = 14;
const HOVER_DEBOUNCE_MS = 50;
const SHIP_FLIGHT_Y = 2.1;

interface FloatingMultiplierCard3D {
    group: THREE.Group;       // Stationary world-space anchor (NEVER moves vertically on hover!)
    visualGroup: THREE.Group; // Smoothly lifts on hover without moving hitboxMesh!
    hitboxMesh: THREE.Mesh;   // Oversized invisible stationary raycast target

    // 3D Cardboard Mystery Box Structure
    mysteryBoxGroup: THREE.Group;
    boxBody: THREE.Mesh;
    boxBodyOutline: THREE.Mesh;
    lidLeft: THREE.Group;
    lidRight: THREE.Group;
    lidFlapL: THREE.Mesh;
    lidFlapR: THREE.Mesh;
    lidOutlineL: THREE.Mesh;
    lidOutlineR: THREE.Mesh;

    // Materials for the mystery boxes (6-face array: [+X, -X, +Y Top, -Y Bottom, +Z Front, -Z Back])
    boxMatNormal: THREE.MeshStandardMaterial[];
    boxMatOrange: THREE.MeshStandardMaterial[];
    boxMatAlien: THREE.MeshStandardMaterial[];
    boxMatWheel: THREE.MeshStandardMaterial[];

    // Soft Diffuse Background Atmospheric Glow (Integrated with cosmic space, NO separate floating aura or floor circle)
    diffuseHazeSprite: THREE.Sprite;
    diffuseHazeMat: THREE.SpriteMaterial;

    // Contents inside/underneath the box (Faceted 3D Comic Relics)
    miniSunGroup: THREE.Group;
    solarRelicCrystal: THREE.Mesh;
    solarRelicRing1: THREE.Mesh;
    solarRelicRing2: THREE.Mesh;
    alienPortalGroup: THREE.Group;
    alienRelicUfo: THREE.Group;
    alienRelicRing: THREE.Mesh;
    miniWheelPropGroup: THREE.Group;
    miniWheelMesh: THREE.Mesh;
    wheelStandGroup: THREE.Group;
    wheelStandDisc: THREE.Group;
    wheelStandFlapper: THREE.Group;
    mineGroup: THREE.Group;


    badgeCanvas: HTMLCanvasElement;
    badgeTex: THREE.CanvasTexture;
    badgeSprite: THREE.Sprite;
    badgeMat: THREE.SpriteMaterial;
    lastBadgeSignature: string;

    boxType: 'normal' | 'orange' | 'alien' | 'wheel';
    lidOpenProgress: number; // 0 = closed, 1 = fully open
    boxLiftY: number;        // Smooth upward lift for revealing contents underneath
    isShattered: boolean;
    assignedRow: number;
    lane: number;
}

interface Planet3D {
    group: THREE.Group;
    sphereMesh: THREE.Mesh;
    surfaceMat: THREE.ShaderMaterial;
    atmoMesh: THREE.Mesh;
    ringSystemGroup: THREE.Group | null;
    rotSpeedY: number;
    driftSpeedZ: number;
    baseX: number;
    baseY: number;
}

interface ShootingStar3D {
    group: THREE.Group;
    vel: THREE.Vector3;
    age: number;
    maxAge: number;
    tailMat: THREE.MeshBasicMaterial;
    headSprite: THREE.Sprite;
}

interface Asteroid3D {
    mesh: THREE.Mesh;
    rotSpeedX: number;
    rotSpeedY: number;
    rotSpeedZ: number;
    driftSpeedZ: number;
    baseX: number;
    baseY: number;
}

interface NebulaCloud3D {
    sprite: THREE.Sprite;
    mat: THREE.SpriteMaterial;
    baseX: number;
    baseY: number;
    offsetZ: number;
    driftSpeedZ: number;
    baseHue: number;
    baseLightness: number;
    baseOpacity: number;
}

export class PixiRenderer {
    private canvas: HTMLCanvasElement;
    private gameState: GameStateController;

    public webglRenderer!: THREE.WebGLRenderer;
    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public vfx!: VFXManager;

    private textures!: PBRTexturePack;
    public ship!: Spaceship3D;

    // Controlled Open-Void HDR Cosmic Lighting & Photorealistic Galactic Sky-Dome
    private ambientLight!: THREE.HemisphereLight;
    private dirLight!: THREE.DirectionalLight;
    private skyDomeMesh!: THREE.Mesh;
    private skyDomeMat!: THREE.ShaderMaterial;

    // 3D Open Cosmic Void Pools (Floating Cards, Photorealistic Planets, Shooting Stars, Nebulas, Cosmic Dust)
    private rowSlots: FloatingMultiplierCard3D[][] = [];
    private planets: Planet3D[] = [];
    private shootingStars: ShootingStar3D[] = [];
    private asteroids: Asteroid3D[] = [];
    private nebulaClouds: NebulaCloud3D[] = [];

    // 3D Alien UFO Abduction System
    private alienUfoGroup!: THREE.Group;
    private alienUfoBody!: THREE.Group;
    private alienTractorBeam!: THREE.Mesh;
    private alienTractorRings: THREE.Mesh[] = [];
    public isAbductionActive = false;

    // 3D Giant Comic Prize Wheel (Ruleta) & Floating Astronaut Zero-G Scene
    private giantRouletteGroup!: THREE.Group;
    private giantWheelDisc!: THREE.Group;
    private giantWheelFlapper!: THREE.Group;
    private floatingAstronautGroup!: THREE.Group;
    public mrDollar3D!: MrDollar3D;
    private astro3D!: {
        root: THREE.Group;
        helmet: THREE.Group;
        backpack: THREE.Group;
        leftArm: THREE.Group;
        rightArm: THREE.Group;
        leftLeg: THREE.Group;
        rightLeg: THREE.Group;
    };
    public isRouletteActive = false;
    public isWheelSpinning = false;
    private wheelCurrentAngle = 0;
    private lastFlapperPegIndex = -1;

    // 3D 1x3 Arcade Mini-Slot Machine & Zero-G Bonus Stage
    public miniSlotGroup!: THREE.Group;
    private slotReels: THREE.Mesh[] = [];
    private slotReelAngles: number[] = [0, 0, 0];
    private slotPaylineBeam!: THREE.Mesh;
    private slotPaylineChevrons: THREE.Group[] = [];
    private slotLeverPivot!: THREE.Group;
    private slotSpinOrbs: THREE.Mesh[] = [];
    private slotMarqueeBulbs: THREE.Mesh[] = [];
    public isSlotActive = false;
    public isSlotSpinning = false;

    private starfieldGeo!: THREE.BufferGeometry;
    private starfieldPositions!: Float32Array;

    // Dynamic Nebula Particle Flow Stream (900 flowing plasma particles)
    private nebulaFlowGeo!: THREE.BufferGeometry;
    private nebulaFlowPositions!: Float32Array;
    private nebulaFlowColors!: Float32Array;
    private nebulaFlowPhases!: Float32Array;

    // Camera-Reactive Cosmic Dust Motes (1,600 near/mid-field particles)
    private cosmicDustGeo!: THREE.BufferGeometry;
    private cosmicDustPositions!: Float32Array;

    // 3D Quantum Trajectory Arc
    private trajectoryLine!: THREE.Line;
    private trajectoryPositions!: Float32Array;
    private trajectoryMat!: THREE.LineBasicMaterial;

    // Raycasting & Debounced Anti-Flicker Card Hover State
    private raycaster = new THREE.Raycaster();
    private pointerNdc = new THREE.Vector2();
    private lastHoverNdc = new THREE.Vector2();
    private lastValidHoverTime = 0;
    private interactiveHitboxMeshes: THREE.Object3D[] = [];

    public hoveredLane: number | null = null;
    public hoveredRow: number | null = null;
    private lastHoveredLaneAudio: number | null = null;

    // Strictly Locked Orbital Tactical Camera Rig State
    private camPos = new THREE.Vector3(0, 5.2, 7.8);
    private camVel = new THREE.Vector3(0, 0, 0);
    private camLookAt = new THREE.Vector3(0, 1.45, -7.5);
    public mouseParallax = new THREE.Vector2(0, 0);
    private targetMouseParallax = new THREE.Vector2(0, 0);

    // Reusable Scratch Vectors & Colors (Zero GC Allocations in 60/120 FPS Render Loop)
    private readonly scratchSkyColor = new THREE.Color();
    private readonly scratchFogColor = new THREE.Color();
    private readonly scratchTintColor = new THREE.Color();
    private readonly scratchDesiredLook = new THREE.Vector3();
    private readonly scratchTrajStart = new THREE.Vector3();
    private readonly scratchTrajEnd = new THREE.Vector3();
    private readonly scratchTrajMid = new THREE.Vector3();
    private readonly scratchTrajTmp = new THREE.Vector3();
    private readonly scratchProjVec = new THREE.Vector3();

    public static currentLaneSpacingX = LANE_SPACING_X;
    private cardLayoutScale = 1.0;

    private width = 1280;
    private height = 720;
    private elapsed = 0;
    private lastFrameTime = performance.now();

    constructor(canvas: HTMLCanvasElement, gameState: GameStateController) {
        this.canvas = canvas;
        this.gameState = gameState;

        this.initThreeEngine();
        this.textures = createPBRTexturePack();

        this.buildHdrLightingAndAtmosphere();
        this.buildPhotorealisticGalacticSkyDome();
        this.buildDeepSpaceCosmicVoid();
        this.buildDistantPlanetsWithCityLightsAndAsteroidRings();
        this.buildShootingStars();
        this.buildAsteroidField();
        this.buildFloatingMultiplierCardsPool();
        this.buildTrajectoryPredictor();
        this.buildAlienUfoSaucer();
        this.buildGiantPrizeWheelAndAstronaut();
        this.buildArcadeMiniSlotMachine();

        // Build 3D AAA [SPACE-OVERDRIVE V4] Starfighter (Floats freely in the open cosmic void)
        this.ship = new Spaceship3D(this.scene, this.textures);
        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
        this.ship.setShieldActive(this.gameState.engine.shieldPurchased, false);

        // Populate starfighter cockpit ejection anchor with a compact 3D Comic Astronaut instance
        const miniCockpitAstro = this.buildVolumetric3DAstronaut();
        miniCockpitAstro.root.scale.setScalar(0.34);
        miniCockpitAstro.leftArm.rotation.z = -0.90;
        miniCockpitAstro.rightArm.rotation.z = 0.90;
        this.ship.cockpitAstronaut.add(miniCockpitAstro.root);

        // Initialize Space-Overdrive V4 Next-Gen Post-Processing & 420-Instance Refractive Glass-Shatter Pool
        this.vfx = new VFXManager(
            this.webglRenderer,
            this.scene,
            this.camera,
            this.width,
            this.height,
            this.textures.paintSplatterTex,
            this.textures.particleGlow
        );

        this.setupDPI(true);
        this.bindGameEvents();
        this.bindGlobalCursorTracking();
        this.startRenderLoop();
    }

    public static laneToWorldX(lane: number): number {
        return (lane - 2) * PixiRenderer.currentLaneSpacingX;
    }

    public static rowToWorldZ(row: number): number {
        return -row * ROW_SPACING_Z;
    }

    private initThreeEngine() {
        const parent = this.canvas.parentElement;
        this.width = Math.max(360, parent?.clientWidth || window.innerWidth);
        this.height = Math.max(480, parent?.clientHeight || window.innerHeight);

        this.webglRenderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.webglRenderer.setSize(this.width, this.height, false);
        this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        // Stylized cel-shaded comic rendering: real-time depth shadow maps disabled for 40%+ performance boost & zero shadow flicker!
        this.webglRenderer.shadowMap.enabled = false;
        this.webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.webglRenderer.toneMappingExposure = 0.94;
        this.webglRenderer.outputColorSpace = THREE.SRGBColorSpace;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x02040a);
        this.scene.fog = new THREE.FogExp2(0x02050d, 0.0038);

        this.camera = new THREE.PerspectiveCamera(54, this.width / this.height, 0.2, 420);
        this.camera.position.copy(this.camPos);
    }

    /**
     * Next-Gen HDR PBR Environment Map (`PMREMGenerator`) & Controlled Directional Lighting:
     * Gives metallic ship armor, floating glass cards, and 3D shattered glass shards authentic HDR reflections!
     */
    private buildHdrLightingAndAtmosphere() {
        const pmremGenerator = new THREE.PMREMGenerator(this.webglRenderer);
        pmremGenerator.compileEquirectangularShader();
        const envRenderTarget = pmremGenerator.fromEquirectangular(this.textures.hdrEnvEquirectTex);
        this.scene.environment = envRenderTarget.texture;
        pmremGenerator.dispose();

        this.ambientLight = new THREE.HemisphereLight(0x94a3b8, 0x090d16, 1.08);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xf8fafc, 2.35);
        this.dirLight.position.set(14, 28, 16);
        this.scene.add(this.dirLight);
        this.scene.add(this.dirLight.target);
    }

    /**
     * Builds a Photorealistic 360° Deep-Space Milky Way & Dark Dust-Lane Sky-Dome (`skyDomeMesh`):
     * Uses 3D procedural fBm + ridged dust filaments in GLSL to render a realistic Hubble/JWST
     * galactic band, dark cosmic absorption rifts, ionized H-II regions, and sub-pixel background stars!
     */
    private buildPhotorealisticGalacticSkyDome() {
        const skyGeo = new THREE.SphereGeometry(330, 64, 48);
        this.skyDomeMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSectorTint: { value: new THREE.Color(0x0ea5e9) }
            },
            vertexShader: `
                varying vec3 vDir;
                void main() {
                    vDir = normalize(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uSectorTint;
                varying vec3 vDir;

                float hash31(vec3 p) {
                    p = fract(p * vec3(443.897, 441.423, 437.195));
                    p += dot(p, p.yzx + 19.19);
                    return fract((p.x + p.y) * p.z);
                }

                float noise3(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(
                            mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x),
                            f.y
                        ),
                        mix(
                            mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x),
                            f.y
                        ),
                        f.z
                    );
                }

                float fbm3(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * noise3(p);
                        p = p * 2.03 + vec3(1.7, 9.2, 3.4);
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec3 d = normalize(vDir);

                    // Primary Tilted Galactic Plane
                    float galPlane1 = dot(d, normalize(vec3(0.42, 0.78, 0.46)));
                    float bandMask1 = exp(-galPlane1 * galPlane1 * 5.8);

                    // Secondary Intersecting Cosmic Stream / Galactic Spur
                    float galPlane2 = dot(d, normalize(vec3(-0.64, 0.48, -0.42)));
                    float bandMask2 = exp(-galPlane2 * galPlane2 * 6.4);

                    // Domain-warped cosmic gas & dark dust rifts
                    vec3 q = vec3(
                        fbm3(d * 3.2 + vec3(0.0, uTime * 0.003, 0.0)),
                        fbm3(d * 3.2 + vec3(5.2, 1.3, 2.8)),
                        fbm3(d * 3.2 + vec3(2.1, 7.4, 9.1))
                    );
                    float nebulaGas = fbm3(d * 4.2 + q * 1.6);
                    float darkRift = fbm3(d * 6.5 - q * 1.9);

                    // Dark absorption dust lanes cutting across the Milky Way band
                    float dustOcclusion = smoothstep(0.44, 0.76, darkRift) * 0.78;

                    // Deep Space Atmospheric Gradient (Rich Indigo-Navy to Deep Cosmic Violet, NOT pitch black!)
                    vec3 deepVoid = mix(vec3(0.016, 0.024, 0.052), vec3(0.028, 0.018, 0.046), d.y * 0.5 + 0.5);

                    // Luminous Galactic Core (warm gold-ivory)
                    vec3 galCoreCol = vec3(0.85, 0.74, 0.58) * (bandMask1 * 0.65 + bandMask2 * 0.35) * pow(nebulaGas, 1.35) * 0.62;

                    // Ionized O-III Filaments (electric cyan/teal)
                    vec3 ionizedCyan = mix(vec3(0.08, 0.52, 0.78), uSectorTint, 0.42) * smoothstep(0.38, 0.85, nebulaGas) * 0.36;

                    // Ionized H-Alpha Nebular Gas (rich magenta-rose)
                    vec3 hAlphaRose = vec3(0.72, 0.18, 0.46) * smoothstep(0.46, 0.88, q.x * nebulaGas) * (bandMask1 * 0.55 + bandMask2 * 0.45) * 0.42;

                    // Stellar Amber Dust Veil
                    vec3 amberDust = vec3(0.92, 0.62, 0.32) * pow(q.y * nebulaGas, 1.8) * (bandMask1 * 0.45 + 0.18) * 0.38;

                    // Distant Glowing Spiral Galaxy Core in Deep Space (High Background Landmark)
                    vec3 galDir = normalize(vec3(-0.35, 0.62, -0.70));
                    float gDist = length(d - galDir);
                    float spiralCore = exp(-gDist * 12.0) * 0.85;
                    float spiralAngle = atan(d.y - galDir.y, d.x - galDir.x);
                    float spiralArms = exp(-pow(gDist - 0.08 * sin(spiralAngle * 2.0 + gDist * 20.0), 2.0) * 160.0);
                    vec3 distantGalaxy = (vec3(0.95, 0.88, 0.75) * spiralCore + vec3(0.40, 0.70, 0.95) * spiralArms * 0.55) * smoothstep(0.32, 0.0, gDist);

                    // Central Flight Corridor Clarity Mask: Dims bright gas emissions directly behind the runway to eliminate blinding glare!
                    float centerCorridorDist = length(vec2(d.x * 2.4, d.y - 0.22));
                    float centerClarity = smoothstep(0.08, 0.55, centerCorridorDist);

                    vec3 gasComposite = (galCoreCol + ionizedCyan + hAlphaRose + amberDust) * (1.0 - dustOcclusion) * (0.28 + 0.72 * centerClarity);
                    vec3 skyCol = deepVoid + gasComposite + distantGalaxy;

                    // Multi-Magnitude Sparkling Background Starfield
                    // Layer 1: Bright primary stars (diamond & gold)
                    float star1 = smoothstep(0.992, 1.0, hash31(floor(d * 380.0)));
                    vec3 starCol1 = mix(vec3(1.0, 0.95, 0.85), vec3(0.75, 0.90, 1.0), hash31(floor(d * 380.0) + 1.0));
                    skyCol += starCol1 * star1 * 1.45;

                    // Layer 2: Medium sparkling stars
                    float star2 = smoothstep(0.994, 1.0, hash31(floor(d * 620.0 + 31.0)));
                    vec3 starCol2 = mix(vec3(0.65, 0.85, 1.0), vec3(1.0, 0.82, 0.65), hash31(floor(d * 620.0) + 5.0));
                    skyCol += starCol2 * star2 * 1.15;

                    // Layer 3: Micro stellar dust & distant clusters
                    float star3 = smoothstep(0.988, 1.0, hash31(floor(d * 960.0 + 73.0)));
                    skyCol += vec3(0.85, 0.88, 1.0) * star3 * (0.35 + 0.65 * bandMask1) * 0.65;

                    gl_FragColor = vec4(skyCol, 1.0);
                }
            `,
            side: THREE.BackSide,
            depthWrite: false
        });

        this.skyDomeMesh = new THREE.Mesh(skyGeo, this.skyDomeMat);
        this.skyDomeMesh.frustumCulled = false;
        this.scene.add(this.skyDomeMesh);
    }

    /**
     * Builds the Vast, Rich Cosmic Void:
     * 1. 2,200-Particle 3D Deep-Space Starfield surrounding the 360° void
     * 2. 56 Photorealistic JWST/Hubble Domain-Warped Nebula Clouds (`cartoonCloudTex`, `nebulaPillarTex`, `nebulaVeilTex`)
     * 3. 650-Particle Dynamic Nebula Flow Stream (flowing along sinuous cosmic currents)
     * 4. 1,200 Camera-Reactive Cosmic Dust Motes (reacting to camera velocity & parallax)
     */
    private buildDeepSpaceCosmicVoid() {
        // 1. 2,200-Particle 360° Deep-Space Starfield System
        this.starfieldGeo = new THREE.BufferGeometry();
        this.starfieldPositions = new Float32Array(STAR_PARTICLE_COUNT * 3);
        const starColors = new Float32Array(STAR_PARTICLE_COUNT * 3);

        for (let i = 0; i < STAR_PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 12 + Math.random() * 115;
            this.starfieldPositions[i * 3] = Math.cos(angle) * radius;
            this.starfieldPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.82;
            this.starfieldPositions[i * 3 + 2] = 10 - Math.random() * 320;

            const c = new THREE.Color(
                i % 4 === 0 ? 0x7dd3fc : i % 6 === 0 ? 0xfde047 : i % 5 === 0 ? 0xf472b6 : i % 7 === 0 ? 0xc084fc : 0xffffff
            );
            starColors[i * 3] = c.r;
            starColors[i * 3 + 1] = c.g;
            starColors[i * 3 + 2] = c.b;
        }

        this.starfieldGeo.setAttribute('position', new THREE.BufferAttribute(this.starfieldPositions, 3));
        this.starfieldGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.72,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const starPoints = new THREE.Points(this.starfieldGeo, starMat);
        starPoints.frustumCulled = false;
        this.scene.add(starPoints);

        // 2. 56 Photorealistic Volumetric Deep-Space Nebula Clouds (Framing Flanks, Center Corridor Kept Clear)
        const nebulaTexPool = [
            this.textures.cartoonCloudTex,
            this.textures.nebulaPillarTex,
            this.textures.nebulaVeilTex
        ];
        const baseHues = [0.54, 0.11, 0.88, 0.58, 0.76, 0.48, 0.95, 0.32, 0.05, 0.68];
        for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
            const baseHue = baseHues[i % baseHues.length];
            const side = i % 2 === 0 ? -1 : 1;
            const offsetZ = -18 - (i / NEBULA_CLOUD_COUNT) * 270 - Math.random() * 20;
            const lateralDepth = Math.abs(offsetZ) + 16;

            // Lateral flank placement: guaranteed minimum margin away from central flight runway
            const lateralSpan = lateralDepth * (0.35 + (i % 6) * 0.08 + Math.random() * 0.10) + 18;
            const baseX = side * lateralSpan;
            const baseY = -22 + Math.random() * 44;
            const scale = 42 + Math.random() * 45;

            // Comfortable, deep celestial lightness & opacity (darker & non-blinding)
            const baseLightness = 0.42 + (i % 5) * 0.06; // 0.42 to 0.66 (comfortable, no whiteout!)
            const baseOpacity = 0.36 + (i % 4) * 0.05;   // 0.36 to 0.51 (soft luminous veils)

            const initCol = new THREE.Color().setHSL(baseHue, 0.75, baseLightness);
            const nebulaMat = new THREE.SpriteMaterial({
                map: nebulaTexPool[i % nebulaTexPool.length],
                color: initCol,
                transparent: true,
                opacity: baseOpacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                rotation: (i * 1.1) % (Math.PI * 2)
            });
            const sprite = new THREE.Sprite(nebulaMat);
            sprite.position.set(baseX, baseY, offsetZ);
            sprite.scale.set(scale, scale * 0.85, 1);
            this.scene.add(sprite);

            this.nebulaClouds.push({
                sprite,
                mat: nebulaMat,
                baseX,
                baseY,
                offsetZ,
                driftSpeedZ: 6 + Math.random() * 8,
                baseHue,
                baseLightness,
                baseOpacity
            });
        }

        // 3. 650-Particle Dynamic Nebula Flow Stream (flowing down the lateral flanks)
        this.nebulaFlowGeo = new THREE.BufferGeometry();
        this.nebulaFlowPositions = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT * 3);
        this.nebulaFlowColors = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT * 3);
        this.nebulaFlowPhases = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT);

        for (let i = 0; i < NEBULA_FLOW_PARTICLE_COUNT; i++) {
            const streamSide = i % 2 === 0 ? -1 : 1;
            const z = -Math.random() * 280;
            const lateralDepth = Math.abs(z) + 16;
            const x = streamSide * (lateralDepth * (0.28 + Math.random() * 0.48) + 16);
            const y = -14 + Math.random() * 36;
            this.nebulaFlowPositions[i * 3] = x;
            this.nebulaFlowPositions[i * 3 + 1] = y;
            this.nebulaFlowPositions[i * 3 + 2] = z;
            this.nebulaFlowPhases[i] = Math.random() * Math.PI * 2;

            const c = new THREE.Color().setHSL(0.50 + (i % 12) * 0.035, 0.85, 0.52);
            this.nebulaFlowColors[i * 3] = c.r;
            this.nebulaFlowColors[i * 3 + 1] = c.g;
            this.nebulaFlowColors[i * 3 + 2] = c.b;
        }

        this.nebulaFlowGeo.setAttribute('position', new THREE.BufferAttribute(this.nebulaFlowPositions, 3));
        this.nebulaFlowGeo.setAttribute('color', new THREE.BufferAttribute(this.nebulaFlowColors, 3));

        const nebulaFlowMat = new THREE.PointsMaterial({
            size: 0.95,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const nebulaFlowPoints = new THREE.Points(this.nebulaFlowGeo, nebulaFlowMat);
        nebulaFlowPoints.frustumCulled = false;
        this.scene.add(nebulaFlowPoints);

        // 4. 1,200 Camera-Reactive Cosmic Dust Motes
        this.cosmicDustGeo = new THREE.BufferGeometry();
        this.cosmicDustPositions = new Float32Array(COSMIC_DUST_PARTICLE_COUNT * 3);
        const dustColors = new Float32Array(COSMIC_DUST_PARTICLE_COUNT * 3);

        for (let i = 0; i < COSMIC_DUST_PARTICLE_COUNT; i++) {
            const z = 18 - Math.random() * 180;
            const lateralDepth = Math.abs(z) + 16;
            this.cosmicDustPositions[i * 3] = (Math.random() - 0.5) * lateralDepth * 1.95;
            this.cosmicDustPositions[i * 3 + 1] = (Math.random() - 0.5) * 44 + 3;
            this.cosmicDustPositions[i * 3 + 2] = z;

            const c = new THREE.Color(i % 4 === 0 ? 0xe0f2fe : i % 4 === 1 ? 0x38bdf8 : i % 4 === 2 ? 0xfef08a : 0xf472b6);
            dustColors[i * 3] = c.r;
            dustColors[i * 3 + 1] = c.g;
            dustColors[i * 3 + 2] = c.b;
        }

        this.cosmicDustGeo.setAttribute('position', new THREE.BufferAttribute(this.cosmicDustPositions, 3));
        this.cosmicDustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

        const cosmicDustMat = new THREE.PointsMaterial({
            size: 0.32,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const cosmicDustPoints = new THREE.Points(this.cosmicDustGeo, cosmicDustMat);
        cosmicDustPoints.frustumCulled = false;
        this.scene.add(cosmicDustPoints);
    }

    /**
     * Photorealistic Multi-Layer Planet Surface + Cloud Deck + Terminator Sunset + Night City Lights GLSL Shader:
     * - Samples high-res fBm planetary albedo (`tDay`), drifting cloud deck (`tClouds`), and night city lights (`tCityLights`)
     * - Computes 3D procedural fBm micro-relief bump normals in fragment shader for razor-sharp mountain & crater relief
     * - Renders specular solar ocean glint, cloud shadows, warm Rayleigh sunset scattering at the terminator,
     *   and glowing Night-Side Megacities on the dark hemisphere!
     */
    private createPlanetSurfaceMaterial(
        dayMap: THREE.CanvasTexture,
        cityLightsMap: THREE.CanvasTexture,
        cloudsMap: THREE.CanvasTexture,
        atmoHex: number,
        cloudOpacity: number
    ): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                tDay: { value: dayMap },
                tCityLights: { value: cityLightsMap },
                tClouds: { value: cloudsMap },
                uSunDir: { value: new THREE.Vector3(0.65, 0.42, 0.62).normalize() },
                uAtmoColor: { value: new THREE.Color(atmoHex) },
                uCloudOpacity: { value: cloudOpacity },
                uTime: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldNormal;
                varying vec3 vViewDir;
                varying vec3 vObjPos;
                varying float vDistToCam;
                void main() {
                    vUv = uv;
                    vObjPos = position;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    vDistToCam = length(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform sampler2D tDay;
                uniform sampler2D tCityLights;
                uniform sampler2D tClouds;
                uniform vec3 uSunDir;
                uniform vec3 uAtmoColor;
                uniform float uCloudOpacity;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vWorldNormal;
                varying vec3 vViewDir;
                varying vec3 vObjPos;
                varying float vDistToCam;

                float hash31(vec3 p) {
                    p = fract(p * vec3(443.897, 441.423, 437.195));
                    p += dot(p, p.yzx + 19.19);
                    return fract((p.x + p.y) * p.z);
                }

                float noise3(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(
                            mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
                            mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x),
                            f.y
                        ),
                        mix(
                            mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                            mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x),
                            f.y
                        ),
                        f.z
                    );
                }

                float fbm3(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += a * noise3(p);
                        p = p * 2.05 + vec3(3.1, 5.7, 1.9);
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    // 1. Compute 3D procedural micro-relief normal perturbation (zero UV seam distortion!)
                    vec3 p3 = vObjPos * 14.0;
                    float h0 = fbm3(p3);
                    float hx = fbm3(p3 + vec3(0.06, 0.0, 0.0)) - h0;
                    float hy = fbm3(p3 + vec3(0.0, 0.06, 0.0)) - h0;
                    vec3 N = normalize(vWorldNormal + vec3(hx, hy, 0.0) * 1.45);
                    vec3 V = normalize(vViewDir);
                    float ndotl = dot(N, uSunDir);
                    float rawNdotL = dot(normalize(vWorldNormal), uSunDir);

                    // 2. Sample Photorealistic Surface Albedo & Drifting Cloud Deck
                    vec3 dayAlbedo = texture2D(tDay, vUv).rgb * (0.84 + 0.32 * h0);
                    vec2 cloudUv = vec2(fract(vUv.x + uTime * 0.008), vUv.y);
                    vec2 shadowUv = cloudUv - vec2(0.006, 0.004);
                    float cloudAlpha = texture2D(tClouds, cloudUv).a * uCloudOpacity;
                    float cloudShadow = texture2D(tClouds, shadowUv).a * uCloudOpacity * 0.55;

                    // 3. Cel-Shaded Comic Planet Lighting (Quantized Comic Bands + Bold Comic Rim)
                    float rawDiffuse = smoothstep(-0.12, 0.85, ndotl);
                    float diffuse = floor(rawDiffuse * 4.0 + 0.35) / 4.0;
                    vec3 H = normalize(uSunDir + V);
                    float oceanMask = smoothstep(0.32, 0.65, dayAlbedo.b - dayAlbedo.r * 0.6);
                    float spec = step(0.82, pow(max(0.0, dot(N, H)), 24.0)) * oceanMask * diffuse * 0.65;

                    // Apply cloud shadows onto the surface below, then composite sunlit clouds on top
                    vec3 shadowedSurface = dayAlbedo * (1.0 - cloudShadow);
                    vec3 litSurface = shadowedSurface * (0.18 + diffuse * 1.12) + vec3(1.0, 0.96, 0.88) * spec;

                    // 4. Warm Rayleigh Terminator Sunset Scattering (Amber-Crimson belt along day/night boundary!)
                    float terminatorBand = exp(-pow((rawNdotL - 0.02) * 5.2, 2.0));
                    vec3 sunsetScatter = vec3(1.0, 0.42, 0.14) * terminatorBand * 0.38;

                    // Cloud illumination (bright white on day side, warm orange at terminator)
                    vec3 cloudColor = mix(vec3(1.0, 0.48, 0.22), vec3(0.98, 0.99, 1.0), smoothstep(-0.05, 0.35, rawNdotL));
                    float cloudLit = smoothstep(-0.16, 0.65, rawNdotL);
                    vec3 dayComposite = mix(litSurface, cloudColor * cloudLit * 1.12, cloudAlpha) + sunsetScatter;

                    // 5. Night-Side Megacity & Highway Lights (obscured slightly under heavy clouds!)
                    float nightMask = smoothstep(0.14, -0.24, rawNdotL);
                    vec3 citySample = texture2D(tCityLights, vUv).rgb;
                    vec3 nightCityGlow = citySample * nightMask * (1.0 - cloudAlpha * 0.65) * 1.95;

                    // 6. Atmospheric Rayleigh Fresnel Limb Glow
                    float fresnel = pow(1.0 - max(0.0, dot(normalize(vWorldNormal), V)), 3.2);
                    vec3 atmoRim = uAtmoColor * fresnel * (0.28 + 0.72 * max(0.0, rawNdotL + 0.35));

                    // 7. Seamless Deep-Space Distance Fog Blending (Prevents any abrupt popping at deep range)
                    float distFade = smoothstep(400.0, 260.0, vDistToCam);
                    vec3 spaceBg = vec3(0.008, 0.015, 0.04);
                    vec3 planetColor = mix(spaceBg, dayComposite + nightCityGlow + atmoRim, distFade);

                    gl_FragColor = vec4(planetColor, 1.0);
                }
            `
        });
    }

    /**
     * Creates a Custom GLSL Volumetric Atmospheric Scattering Shell (`THREE.BackSide`)
     * around each planet for authentic Rayleigh/Mie limb glow!
     */
    private createAtmosphereScatteringMaterial(atmoHex: number): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                uAtmoColor: { value: new THREE.Color(atmoHex) },
                uSunDir: { value: new THREE.Vector3(0.65, 0.42, 0.62).normalize() }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewDir;
                varying float vDistToCam;
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    vDistToCam = length(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uAtmoColor;
                uniform vec3 uSunDir;
                varying vec3 vNormal;
                varying vec3 vViewDir;
                varying float vDistToCam;
                void main() {
                    vec3 N = normalize(vNormal);
                    vec3 V = normalize(vViewDir);
                    float rim = pow(clamp(1.0 + dot(N, V), 0.0, 1.0), 2.5);
                    float sunSide = 0.3 + 0.7 * smoothstep(-0.4, 0.8, dot(-N, uSunDir));
                    float distFade = smoothstep(400.0, 260.0, vDistToCam);
                    gl_FragColor = vec4(uAtmoColor * rim * sunSide * 1.35 * distFade, rim * 0.72 * distFade);
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }

    /**
     * Builds 6 Massive Photorealistic 3D Planets featuring:
     * 1. Multi-Layer Surface Shader with 3D fBm Relief, Cloud Deck, Sunset Terminator & Night-Side City Lights
     * 2. Volumetric Atmospheric Scattering Outer Shell (`createAtmosphereScatteringMaterial`)
     * 3. Planetary Rings Composed of 1,440+ Individual 3D Cratered Asteroids (`THREE.InstancedMesh`)
     */
    private buildDistantPlanetsWithCityLightsAndAsteroidRings() {
        const sphereGeo = new THREE.SphereGeometry(1, 64, 48);
        const atmoGeo = new THREE.SphereGeometry(1.12, 48, 36);
        const ringDiscGeo = new THREE.RingGeometry(1.38, 2.58, 64);
        ringDiscGeo.rotateX(Math.PI / 2);

        // Shared geometry & photorealistic cratered PBR material for the 1,440 individual 3D ring asteroids
        const ringRockGeo = new THREE.DodecahedronGeometry(0.18, 1);
        const ringRockMat = new THREE.MeshStandardMaterial({
            map: this.textures.asteroidColor,
            bumpMap: this.textures.asteroidBump,
            bumpScale: 0.08,
            roughnessMap: this.textures.asteroidRoughness,
            roughness: 0.72,
            metalness: 0.32
        });

        const planetConfigs = [
            {
                // Planet 0: Upper-Left Gas Giant with Golden Rings & Orbiting Moon
                tex: this.textures.planetGasGiantTex,
                hasRing: true,
                hasMoon: true,
                radius: 11.0,
                baseX: -60.7,
                baseY: 13.7,
                startZ: -89.5,
                atmoColor: 0x38bdf8,
                cloudOpacity: 0.38
            },
            {
                // Planet 1: Mid-Left Crimson Fiery Magma World with Glowing Veins
                tex: this.textures.planetLavaWorldTex,
                hasRing: false,
                hasMoon: false,
                radius: 11.5,
                baseX: -78.8,
                baseY: -23.3,
                startZ: -128.5,
                atmoColor: 0xf97316,
                cloudOpacity: 0.25
            },
            {
                // Planet 2: Lower-Left Emerald Oceanic Biosphere World with Rings
                tex: this.textures.planetIceWorldTex,
                hasRing: true,
                hasMoon: false,
                radius: 9.0,
                baseX: -67.0,
                baseY: -48.8,
                startZ: -89.7,
                atmoColor: 0x10b981,
                cloudOpacity: 0.48
            },
            {
                // Planet 3: Upper-Right Radiant Cyan Ice World with Rings & Orbiting Moon
                tex: this.textures.planetIceWorldTex,
                hasRing: true,
                hasMoon: true,
                radius: 11.0,
                baseX: 63.4,
                baseY: 14.1,
                startZ: -93.7,
                atmoColor: 0x00f0ff,
                cloudOpacity: 0.55
            },
            {
                // Planet 4: Mid-Right Violet Nebula Colossus with Slanted Rings
                tex: this.textures.planetGasGiantTex,
                hasRing: true,
                hasMoon: false,
                radius: 12.0,
                baseX: 86.2,
                baseY: -26.0,
                startZ: -141.3,
                atmoColor: 0xa855f7,
                cloudOpacity: 0.36
            },
            {
                // Planet 5: Lower-Right Radiant Amber Solar Giant
                tex: this.textures.planetLavaWorldTex,
                hasRing: false,
                hasMoon: false,
                radius: 9.5,
                baseX: 69.5,
                baseY: -50.9,
                startZ: -93.4,
                atmoColor: 0xf59e0b,
                cloudOpacity: 0.30
            }
        ];

        const dummy = new THREE.Object3D();

        for (let i = 0; i < PLANET_COUNT; i++) {
            const cfg = planetConfigs[i];
            const group = new THREE.Group();

            // 1. Planet Sphere with Cel-Shaded Comic Day Albedo + Cloud Deck + Bold Black Ink Outline
            const surfaceMat = this.createPlanetSurfaceMaterial(
                cfg.tex,
                this.textures.planetCityLightsTex,
                this.textures.planetCloudsTex,
                cfg.atmoColor,
                cfg.cloudOpacity
            );
            const sphereMesh = new THREE.Mesh(sphereGeo, surfaceMat);
            sphereMesh.scale.setScalar(cfg.radius);
            sphereMesh.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.26;
            const planetOutline = this.createOutline(sphereGeo, 0.042);
            sphereMesh.add(planetOutline);
            group.add(sphereMesh);

            // 2. Volumetric Atmospheric Scattering Outer Shell
            const atmoMat = this.createAtmosphereScatteringMaterial(cfg.atmoColor);
            const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
            atmoMesh.scale.setScalar(cfg.radius);
            group.add(atmoMesh);

            // 3. Satellite Moon System for Giant Worlds
            if (cfg.hasMoon) {
                const moonGeo = new THREE.SphereGeometry(1, 24, 18);
                const moonMat = new THREE.MeshStandardMaterial({
                    map: this.textures.asteroidColor,
                    bumpMap: this.textures.asteroidBump,
                    bumpScale: 0.06,
                    roughness: 0.82,
                    metalness: 0.12
                });
                const moonMesh = new THREE.Mesh(moonGeo, moonMat);
                const moonRadius = cfg.radius * 0.18;
                moonMesh.scale.setScalar(moonRadius);
                moonMesh.position.set(cfg.radius * 2.1, cfg.radius * 0.35, cfg.radius * 0.45);
                const moonOutline = this.createOutline(moonGeo, 0.055);
                moonMesh.add(moonOutline);
                group.add(moonMesh);
            }

            // 4. Planetary Ring System Composed of Individual 3D Asteroids + High-Density Ringlet Disc
            let ringSystemGroup: THREE.Group | null = null;
            if (cfg.hasRing) {
                ringSystemGroup = new THREE.Group();
                ringSystemGroup.rotation.x = 0.38;
                ringSystemGroup.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.24;

                const ringDiscMat = new THREE.MeshBasicMaterial({
                    map: this.textures.planetRingTex,
                    transparent: true,
                    opacity: 0.68,
                    side: THREE.DoubleSide,
                    depthWrite: false
                });
                const ringDiscMesh = new THREE.Mesh(ringDiscGeo, ringDiscMat);
                ringDiscMesh.scale.setScalar(cfg.radius);
                ringSystemGroup.add(ringDiscMesh);

                const ringAstInstanced = new THREE.InstancedMesh(
                    ringRockGeo,
                    ringRockMat,
                    RING_ASTEROIDS_PER_PLANET
                );
                for (let a = 0; a < RING_ASTEROIDS_PER_PLANET; a++) {
                    const angle = (a / RING_ASTEROIDS_PER_PLANET) * Math.PI * 2 + Math.random() * 0.15;
                    const band = a % 3 === 0 ? 1.44 + Math.random() * 0.42 : 1.98 + Math.random() * 0.56;
                    const orbitR = cfg.radius * band;
                    const rx = Math.cos(angle) * orbitR;
                    const rz = Math.sin(angle) * orbitR;
                    const ry = (Math.random() - 0.5) * 0.45;

                    dummy.position.set(rx, ry, rz);
                    dummy.rotation.set(
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    );
                    const s = (0.45 + Math.random() * 1.35) * (cfg.radius / 11.0);
                    dummy.scale.set(s * 1.2, s * 0.85, s);
                    dummy.updateMatrix();
                    ringAstInstanced.setMatrixAt(a, dummy.matrix);
                }
                ringAstInstanced.instanceMatrix.needsUpdate = true;
                ringSystemGroup.add(ringAstInstanced);
                group.add(ringSystemGroup);
            }

            group.position.set(cfg.baseX, cfg.baseY, cfg.startZ);
            this.scene.add(group);

            this.planets.push({
                group,
                sphereMesh,
                surfaceMat,
                atmoMesh,
                ringSystemGroup,
                rotSpeedY: 0.14 + (i % 3) * 0.06,
                driftSpeedZ: 0.85,
                baseX: cfg.baseX,
                baseY: cfg.baseY
            });
        }
    }

    /**
     * Builds Dynamic 3D Shooting Stars / Comets streaking across the deep-space background!
     */
    private buildShootingStars() {
        const tailGeo = new THREE.CylinderGeometry(0.0, 0.16, 11.5, 8);
        tailGeo.rotateX(Math.PI / 2);
        tailGeo.translate(0, 0, -5.75);

        const tailColors = [0x7dd3fc, 0xfde047, 0xf472b6, 0xa78bfa, 0x34d399, 0xf97316];

        for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
            const group = new THREE.Group();
            const tailColor = tailColors[i % tailColors.length];
            const tailMat = new THREE.MeshBasicMaterial({
                color: tailColor,
                transparent: true,
                opacity: 0.88,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const tailMesh = new THREE.Mesh(tailGeo, tailMat);
            group.add(tailMesh);

            const headMat = new THREE.SpriteMaterial({
                map: this.textures.particleGlow,
                color: 0xffffff,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const headSprite = new THREE.Sprite(headMat);
            headSprite.scale.setScalar(1.45);
            group.add(headSprite);

            this.scene.add(group);

            const starObj: ShootingStar3D = {
                group,
                vel: new THREE.Vector3(),
                age: Math.random() * 2.5,
                maxAge: 1.4 + Math.random() * 1.4,
                tailMat,
                headSprite
            };
            this.respawnShootingStar(starObj, 0);
            this.shootingStars.push(starObj);
        }
    }

    private respawnShootingStar(star: ShootingStar3D, refZ: number) {
        star.age = 0;
        star.maxAge = 1.2 + Math.random() * 1.5;

        const fromLeft = Math.random() > 0.5;
        const startX = (fromLeft ? -1 : 1) * (36 + Math.random() * 64);
        const startY = 8 + Math.random() * 28;
        const startZ = refZ - 55 - Math.random() * 165;

        star.group.position.set(startX, startY, startZ);

        const vx = (fromLeft ? 1 : -1) * (36 + Math.random() * 34);
        const vy = -(10 + Math.random() * 18);
        const vz = 16 + Math.random() * 28;
        star.vel.set(vx, vy, vz);

        const targetPos = star.group.position.clone().add(star.vel);
        star.group.lookAt(targetPos);
    }

    /**
     * Builds 64 Chiseled Cel-Shaded Comic Meteorites & Floating Space Debris:
     * Sharp angular rock facets, slate-blue comic texture with /// ink hatching & rust spots,
     * glowing ore veins (pyrite, cyan ice, amethyst) and bold inverted-hull black comic ink outlines!
     */
    private buildAsteroidField() {
        const rawAstGeo = new THREE.IcosahedronGeometry(1.55, 1);
        const posAttr = rawAstGeo.attributes.position as THREE.BufferAttribute;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < posAttr.count; i++) {
            vertex.fromBufferAttribute(posAttr, i);
            const n1 = Math.sin(vertex.x * 2.1 + vertex.y * 1.7) * Math.cos(vertex.z * 2.0);
            const n2 = Math.cos(vertex.x * 3.8 - vertex.z * 3.2) * 0.14;
            const disp = 1.0 + 0.26 * n1 + n2;
            vertex.multiplyScalar(disp);
            posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        rawAstGeo.computeVertexNormals();

        // Non-indexed geometry gives razor-sharp chiseled flat comic facets
        const baseAstGeo = rawAstGeo.index ? rawAstGeo.toNonIndexed() : rawAstGeo.clone();
        baseAstGeo.computeVertexNormals();

        // Varied asteroid material palette with subtle ore reflections
        const oreEmissives = [0x1e293b, 0x0c4a6e, 0x78350f, 0x581c87, 0x064e3b];
        const astMaterials = oreEmissives.map(emissiveCol => new THREE.MeshStandardMaterial({
            map: this.textures.asteroidColor,
            roughness: 0.85,
            metalness: 0.12,
            emissive: new THREE.Color(emissiveCol),
            emissiveIntensity: 0.32,
            flatShading: true
        }));

        for (let i = 0; i < ASTEROID_COUNT; i++) {
            const mat = astMaterials[i % astMaterials.length];
            const mesh = new THREE.Mesh(baseAstGeo, mat);
            const astOutline = this.createOutline(baseAstGeo, 0.095);
            mesh.add(astOutline);

            let baseX: number;
            let baseY: number;
            let z: number;
            let scale: number;

            if (i < 26) {
                // Left Flank Asteroid Belt
                z = -15 - (i / 26) * 260 - Math.random() * 15;
                const lateralDepth = Math.abs(z) + 18;
                const lateralSpan = lateralDepth * (0.28 + (i % 5) * 0.07 + Math.random() * 0.08);
                baseX = -lateralSpan;
                baseY = -22.0 + Math.random() * 44.0;
                // Near camera: small pebbles; mid-depth: medium/hero meteorites
                scale = (z > -45) ? 0.35 + Math.random() * 0.45 : (i % 4 === 0 ? 1.25 + Math.random() * 0.45 : 0.45 + Math.random() * 0.65);
            } else if (i < 52) {
                // Right Flank Asteroid Belt
                const rIdx = i - 26;
                z = -15 - (rIdx / 26) * 260 - Math.random() * 15;
                const lateralDepth = Math.abs(z) + 18;
                const lateralSpan = lateralDepth * (0.28 + (rIdx % 5) * 0.07 + Math.random() * 0.08);
                baseX = lateralSpan;
                baseY = -22.0 + Math.random() * 44.0;
                scale = (z > -45) ? 0.35 + Math.random() * 0.45 : (rIdx % 4 === 0 ? 1.25 + Math.random() * 0.45 : 0.45 + Math.random() * 0.65);
            } else {
                // Mid-Depth Floating Space Debris (deep behind crates)
                const mIdx = i - 52;
                z = -65 - (mIdx / 12) * 200 - Math.random() * 15;
                baseX = (Math.random() - 0.5) * 44;
                baseY = -12.0 + Math.random() * 26.0;
                scale = 0.28 + Math.random() * 0.42; // Small space pebbles/debris
            }

            mesh.position.set(baseX, baseY, z);
            mesh.scale.set(
                scale * (0.82 + Math.random() * 0.36),
                scale * (0.74 + Math.random() * 0.48),
                scale * (0.82 + Math.random() * 0.36)
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.scene.add(mesh);

            this.asteroids.push({
                mesh,
                rotSpeedX: (Math.random() - 0.5) * 1.35,
                rotSpeedY: (Math.random() - 0.5) * 1.35,
                rotSpeedZ: (Math.random() - 0.5) * 1.35,
                driftSpeedZ: 14 + Math.random() * 18,
                baseX,
                baseY
            });
        }
    }

    /**
     * Helper to create 3D Cel-Shaded Inverted Hull Black Ink Outlines
     */
    private createOutline(
        geo: THREE.BufferGeometry,
        thickness = 0.075,
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
        const m = new THREE.Mesh(outlineGeo, outlineMat);
        if (pos) m.position.copy(pos);
        if (rot) m.rotation.copy(rot);
        m.renderOrder = -1;
        return m;
    }

    /**
     * Builds the 3D Cel-Shaded Floating Cardboard Mystery Boxes, Mini Sun, and ACME Cartoon Naval Bombs
     */
    private buildFloatingMultiplierCardsPool() {
        // Tightly bounded hitbox matching the cardboard crate and its vertical lift trajectory (Y = 0.0..+4.4)
        const hitboxGeo = new THREE.BoxGeometry(2.5, 4.4, 2.3);
        const hitboxMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        });

        // 3D Cardboard Mystery Crate Geometries
        const boxBodyGeo = new THREE.BoxGeometry(2.02, 1.92, 1.92);
        const flapGeo = new THREE.BoxGeometry(1.01, 0.05, 1.92);

        // Classic ACME Cartoon Naval Bomb Geometries
        const bombSphereGeo = new THREE.SphereGeometry(0.68, 24, 20);
        const bombBandGeo = new THREE.CylinderGeometry(0.69, 0.69, 0.22, 24, 1, true);
        const bombNeckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.22, 16);
        const bombWickGeo = new THREE.TorusGeometry(0.18, 0.045, 8, 16, Math.PI * 0.95);
        const bombSparkGeo = new THREE.OctahedronGeometry(0.09, 0);

        // Multi-Materials for the 3 types of mystery crates (Side with '?' + Top with 'X' crossed tape)
        const boxMatNormalSide = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardBoxTex,
            roughness: 0.85,
            metalness: 0.05
        });
        const boxMatNormalTop = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardBoxTopTex,
            roughness: 0.85,
            metalness: 0.05
        });
        const boxMatNormal: THREE.MeshStandardMaterial[] = [
            boxMatNormalSide,
            boxMatNormalSide,
            boxMatNormalTop,
            boxMatNormalSide,
            boxMatNormalSide,
            boxMatNormalSide
        ];

        const boxMatOrangeSide = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardOrangeBoxTex,
            emissive: 0xc2410c,
            emissiveIntensity: 0.14,
            roughness: 0.78,
            metalness: 0.06
        });
        const boxMatOrangeTop = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardOrangeBoxTopTex,
            emissive: 0xc2410c,
            emissiveIntensity: 0.14,
            roughness: 0.78,
            metalness: 0.06
        });
        const boxMatOrange: THREE.MeshStandardMaterial[] = [
            boxMatOrangeSide,
            boxMatOrangeSide,
            boxMatOrangeTop,
            boxMatOrangeSide,
            boxMatOrangeSide,
            boxMatOrangeSide
        ];

        const boxMatAlienSide = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardAlienBoxTex,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.14,
            roughness: 0.78,
            metalness: 0.06
        });
        const boxMatAlienTop = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardAlienBoxTopTex,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.14,
            roughness: 0.78,
            metalness: 0.06
        });
        const boxMatAlien: THREE.MeshStandardMaterial[] = [
            boxMatAlienSide,
            boxMatAlienSide,
            boxMatAlienTop,
            boxMatAlienSide,
            boxMatAlienSide,
            boxMatAlienSide
        ];

        const boxMatWheelSide = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardWheelBoxTex,
            emissive: 0x581c87,
            emissiveIntensity: 0.16,
            roughness: 0.75,
            metalness: 0.08
        });
        const boxMatWheelTop = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardWheelBoxTopTex,
            emissive: 0x581c87,
            emissiveIntensity: 0.16,
            roughness: 0.75,
            metalness: 0.08
        });
        const boxMatWheel: THREE.MeshStandardMaterial[] = [
            boxMatWheelSide,
            boxMatWheelSide,
            boxMatWheelTop,
            boxMatWheelSide,
            boxMatWheelSide,
            boxMatWheelSide
        ];

        // 3D Mini Prize Wheel prop on crate front
        const miniWheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 24);
        miniWheelGeo.rotateX(Math.PI / 2);
        const miniWheelFaceMat = new THREE.MeshStandardMaterial({
            map: this.textures.miniWheelTex,
            roughness: 0.25,
            metalness: 0.2
        });
        const miniWheelRimMat = new THREE.MeshStandardMaterial({
            color: 0xeab308,
            roughness: 0.3,
            metalness: 0.75
        });
        const miniWheelMats = [miniWheelRimMat, miniWheelFaceMat, miniWheelFaceMat];

        // Classic Cartoon Bomb Materials
        const cartoonBombMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            roughness: 0.18,
            metalness: 0.85
        });

        const cartoonHazardBandMat = new THREE.MeshStandardMaterial({
            color: 0xfde047,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.85,
            roughness: 0.25,
            metalness: 0.3
        });

        const cartoonBombNeckMat = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.3,
            metalness: 0.8
        });

        const cartoonWickMat = new THREE.MeshStandardMaterial({
            color: 0xd4d4d8,
            roughness: 0.9,
            metalness: 0.0
        });

        const cartoonSparkMat = new THREE.MeshBasicMaterial({
            color: 0xfde047
        });

        // 3D Comic Solar Relic Geometries & Materials (Faceted Octahedron + Dual Inclined Rings)
        const solarCrystalGeo = new THREE.OctahedronGeometry(0.68, 0);
        const solarCrystalMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.75,
            roughness: 0.12,
            metalness: 0.2
        });
        const solarCoreGeo = new THREE.SphereGeometry(0.32, 12, 10);
        const solarCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const solarRingGeo1 = new THREE.TorusGeometry(1.08, 0.048, 8, 28);
        const solarRingMat1 = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.85
        });
        const solarRingGeo2 = new THREE.TorusGeometry(1.15, 0.040, 8, 28);
        const solarRingMat2 = new THREE.MeshStandardMaterial({
            color: 0xfde047,
            emissive: 0xd97706,
            emissiveIntensity: 0.65
        });
        const solarNodeGeo = new THREE.SphereGeometry(0.10, 8, 6);
        const solarNodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // 3D Comic Mini-UFO Geometries & Materials (Matching reference drawing)
        const miniUfoDomeGeo = new THREE.SphereGeometry(1.35, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52);
        const miniUfoDomeMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoDomeTex,
            roughness: 0.12,
            metalness: 0.08,
            transparent: true,
            opacity: 0.95,
            emissive: 0x10b981,
            emissiveIntensity: 0.25
        });
        const miniUfoCollarGeo = new THREE.CylinderGeometry(1.40, 1.54, 0.32, 20, 1, false);
        const miniUfoCollarMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoCollarTex,
            roughness: 0.3,
            metalness: 0.65
        });
        const miniUfoFlangePoints = [
            new THREE.Vector2(1.50, 0.12),
            new THREE.Vector2(1.85, 0.04),
            new THREE.Vector2(2.25, -0.14),
            new THREE.Vector2(2.55, -0.32),
            new THREE.Vector2(2.62, -0.42),
            new THREE.Vector2(2.58, -0.52),
            new THREE.Vector2(2.50, -0.52),
            new THREE.Vector2(2.20, -0.18),
            new THREE.Vector2(1.80, 0.0),
            new THREE.Vector2(1.48, 0.08)
        ];
        const miniUfoFlangeGeo = new THREE.LatheGeometry(miniUfoFlangePoints, 24);
        const miniUfoFlangeMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoSaucerTex,
            roughness: 0.25,
            metalness: 0.35,
            side: THREE.DoubleSide
        });
        const miniUfoBellyPoints = [
            new THREE.Vector2(2.58, -0.52),
            new THREE.Vector2(2.25, -0.75),
            new THREE.Vector2(1.75, -1.02),
            new THREE.Vector2(1.15, -1.22),
            new THREE.Vector2(0.70, -1.30),
            new THREE.Vector2(0.68, -1.24),
            new THREE.Vector2(1.12, -1.16),
            new THREE.Vector2(1.70, -0.96),
            new THREE.Vector2(2.20, -0.70),
            new THREE.Vector2(2.52, -0.48)
        ];
        const miniUfoBellyGeo = new THREE.LatheGeometry(miniUfoBellyPoints, 24);
        const miniUfoBellyMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoBellyTex,
            roughness: 0.35,
            metalness: 0.55,
            side: THREE.DoubleSide
        });
        const miniUfoRimRingGeo = new THREE.TorusGeometry(2.60, 0.052, 6, 24);
        const miniUfoRimRingMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const miniUfoEnergyRingGeo = new THREE.TorusGeometry(0.72, 0.038, 6, 20);
        const miniUfoEnergyRingMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        // =========================================================================
        // 3D Comic Prize Wheel on Wooden Stand (1:1 Faithful Sculpture of Assets/Ruleta.jpeg)
        // Shared geometries, planar comic UVs & airtight smooth inverted-hull ink outlines
        // =========================================================================
        const wheelInkOutlineMat = new THREE.MeshBasicMaterial({
            color: 0x060505,
            side: THREE.BackSide,
            depthWrite: true
        });

        const makeSmoothOutlineGeo = (
            srcGeo: THREE.BufferGeometry,
            thickness: number
        ): THREE.BufferGeometry => {
            const outlineGeo = srcGeo.clone();
            outlineGeo.computeVertexNormals();
            const posAttr = outlineGeo.attributes.position;
            const normAttr = outlineGeo.attributes.normal;
            const dirMap = new Map<string, Map<string, [number, number, number]>>();

            for (let i = 0; i < posAttr.count; i++) {
                const pKey = `${Math.round(posAttr.getX(i) * 2000)},${Math.round(posAttr.getY(i) * 2000)},${Math.round(posAttr.getZ(i) * 2000)}`;
                const nx = normAttr.getX(i);
                const ny = normAttr.getY(i);
                const nz = normAttr.getZ(i);
                const nKey = `${Math.round(nx * 50)},${Math.round(ny * 50)},${Math.round(nz * 50)}`;
                let bucket = dirMap.get(pKey);
                if (!bucket) {
                    bucket = new Map();
                    dirMap.set(pKey, bucket);
                }
                if (!bucket.has(nKey)) {
                    bucket.set(nKey, [nx, ny, nz]);
                }
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
                const pKey = `${Math.round(posAttr.getX(i) * 2000)},${Math.round(posAttr.getY(i) * 2000)},${Math.round(posAttr.getZ(i) * 2000)}`;
                const [ox, oy, oz] = avgMap.get(pKey)!;
                posAttr.setXYZ(
                    i,
                    posAttr.getX(i) + ox * thickness,
                    posAttr.getY(i) + oy * thickness,
                    posAttr.getZ(i) + oz * thickness
                );
            }
            return outlineGeo;
        };

        const applyPlanarDiscUVs = (geo: THREE.BufferGeometry, maxRadius: number) => {
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            const invSpan = 1 / (maxRadius * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = 0.5 + pos.getX(i) * invSpan;
                uvs[i * 2 + 1] = 0.5 + pos.getY(i) * invSpan;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        const applyBoundsPlanarUVs = (geo: THREE.BufferGeometry) => {
            geo.computeBoundingBox();
            const bb = geo.boundingBox!;
            const spanX = Math.max(1e-4, bb.max.x - bb.min.x);
            const spanY = Math.max(1e-4, bb.max.y - bb.min.y);
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = (pos.getX(i) - bb.min.x) / spanX;
                uvs[i * 2 + 1] = (pos.getY(i) - bb.min.y) / spanY;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        const WHEEL_CY = 1.52;

        // Materials using the custom hand-illustrated comic PBR maps
        const pathWoodRingMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelWoodRingTex,
            emissive: 0x2b1608,
            emissiveIntensity: 0.16,
            roughness: 0.62,
            metalness: 0.04
        });
        const pathWoodPlankMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelWoodPlankTex,
            emissive: 0x2b1608,
            emissiveIntensity: 0.14,
            roughness: 0.65,
            metalness: 0.04
        });
        const pathWoodBackMat = new THREE.MeshStandardMaterial({
            color: 0x361d0a,
            roughness: 0.72,
            metalness: 0.04
        });
        const pathIronMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelIronTex,
            color: 0xe7e2d8,
            emissive: 0x3b3832,
            emissiveIntensity: 0.18,
            roughness: 0.48,
            metalness: 0.22
        });
        const pathGoldBezelMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xffe46b,
            emissive: 0xb45309,
            emissiveIntensity: 0.24,
            roughness: 0.36,
            metalness: 0.28
        });
        const pathBrassHubMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xf7d57c,
            emissive: 0x78350f,
            emissiveIntensity: 0.20,
            roughness: 0.38,
            metalness: 0.24
        });
        const pathWheelFaceMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelFaceTex,
            emissive: 0xffffff,
            emissiveMap: this.textures.pathWheelFaceTex,
            emissiveIntensity: 0.14,
            roughness: 0.38,
            metalness: 0.04
        });
        const pathPegMat = new THREE.MeshStandardMaterial({
            color: 0xffe552,
            emissive: 0xd97706,
            emissiveIntensity: 0.32,
            roughness: 0.28,
            metalness: 0.28
        });
        const pathArrowMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelArrowTex,
            emissive: 0xb91c1c,
            emissiveIntensity: 0.26,
            roughness: 0.28,
            metalness: 0.08
        });

        // 1. Two Separate Beveled Dark-Oak Foot Blocks (open center gap, matching Ruleta.jpeg)
        const footShape = new THREE.Shape();
        footShape.moveTo(-0.29, 0.018);
        footShape.lineTo(0.29, 0.018);
        footShape.lineTo(0.275, 0.135);
        footShape.quadraticCurveTo(0.268, 0.175, 0.225, 0.178);
        footShape.lineTo(-0.225, 0.178);
        footShape.quadraticCurveTo(-0.268, 0.175, -0.275, 0.135);
        footShape.closePath();
        const footGeo = new THREE.ExtrudeGeometry(footShape, {
            depth: 0.46,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.018,
            bevelThickness: 0.018
        });
        footGeo.translate(0, 0, -0.23);
        applyBoundsPlanarUVs(footGeo);
        const footOutlineGeo = makeSmoothOutlineGeo(footGeo, 0.032);

        // Foot horizontal trim groove bar on front face (matching beveled base detail in Ruleta.jpeg)
        const footTrimGeo = new THREE.BoxGeometry(0.50, 0.018, 0.51);
        const footInkBarMat = new THREE.MeshBasicMaterial({ color: 0x160b04 });

        // 2. Two Thick Inward-Angled Splayed Oak Support Legs
        const legShape = new THREE.Shape();
        legShape.moveTo(-0.185, -0.25);
        legShape.lineTo(0.185, -0.25);
        legShape.lineTo(0.165, 0.25);
        legShape.lineTo(-0.165, 0.25);
        legShape.closePath();
        const legGeo = new THREE.ExtrudeGeometry(legShape, {
            depth: 0.28,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.016,
            bevelThickness: 0.016
        });
        legGeo.translate(0, 0, -0.14);
        applyBoundsPlanarUVs(legGeo);
        const legOutlineGeo = makeSmoothOutlineGeo(legGeo, 0.032);

        // 3. Massive Wide Dark-Oak Outer Barrel Ring (CCW Lathe profile -> outward normals)
        const barrelRingPoints = [
            new THREE.Vector2(0.912, -0.185),
            new THREE.Vector2(1.155, -0.185),
            new THREE.Vector2(1.198, -0.145),
            new THREE.Vector2(1.206, -0.055),
            new THREE.Vector2(1.206, 0.055),
            new THREE.Vector2(1.198, 0.145),
            new THREE.Vector2(1.155, 0.185),
            new THREE.Vector2(0.942, 0.185),
            new THREE.Vector2(0.912, 0.148),
            new THREE.Vector2(0.912, -0.148),
            new THREE.Vector2(0.912, -0.185)
        ];
        const woodBarrelRingGeo = new THREE.LatheGeometry(barrelRingPoints, 56);
        woodBarrelRingGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(woodBarrelRingGeo, 1.22);
        const woodBarrelRingOutlineGeo = makeSmoothOutlineGeo(woodBarrelRingGeo, 0.036);

        // Solid dark-wood backing plate behind the wheel face
        const woodBackPlateGeo = new THREE.CylinderGeometry(0.935, 0.935, 0.12, 44);
        woodBackPlateGeo.rotateX(Math.PI / 2);

        // 4. Six Heavy Riveted Forged-Iron U-Clamps wrapping around the oak barrel ring
        const createCurvedIronClampGeo = (halfAngleRad: number) => {
            const rIn = 0.898;
            const rOut = 1.236;
            const s = new THREE.Shape();
            s.moveTo(Math.cos(-halfAngleRad) * rIn, Math.sin(-halfAngleRad) * rIn);
            s.absarc(0, 0, rOut, -halfAngleRad, halfAngleRad, false);
            s.absarc(0, 0, rIn, halfAngleRad, -halfAngleRad, true);
            s.closePath();
            const g = new THREE.ExtrudeGeometry(s, {
                depth: 0.392,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 1,
                bevelSize: 0.015,
                bevelThickness: 0.016
            });
            g.translate(0, 0, -0.196);
            applyBoundsPlanarUVs(g);
            return g;
        };

        const horizClampGeo = createCurvedIronClampGeo((9.4 * Math.PI) / 180);
        const horizClampOutlineGeo = makeSmoothOutlineGeo(horizClampGeo, 0.026);
        const diagClampGeo = createCurvedIronClampGeo((6.8 * Math.PI) / 180);
        const diagClampOutlineGeo = makeSmoothOutlineGeo(diagClampGeo, 0.026);

        const clampRivetGeo = new THREE.SphereGeometry(0.031, 10, 8);
        clampRivetGeo.scale(1, 1, 0.68);
        const clampRivetOutlineGeo = makeSmoothOutlineGeo(clampRivetGeo, 0.016);

        // 5. Raised Inner Golden Brass Bezel Ring (r = 0.850 .. 0.914)
        const goldBezelPoints = [
            new THREE.Vector2(0.850, 0.035),
            new THREE.Vector2(0.914, 0.035),
            new THREE.Vector2(0.914, 0.095),
            new THREE.Vector2(0.896, 0.122),
            new THREE.Vector2(0.866, 0.122),
            new THREE.Vector2(0.850, 0.095),
            new THREE.Vector2(0.850, 0.035)
        ];
        const goldBezelGeo = new THREE.LatheGeometry(goldBezelPoints, 56);
        goldBezelGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(goldBezelGeo, 0.94);
        const goldBezelOutlineGeo = makeSmoothOutlineGeo(goldBezelGeo, 0.022);

        // 6. Spinning 24-Wedge Gouache Wheel Face + 24 Radial Golden Rim Pegs
        const wheelFaceDiscGeo = new THREE.CircleGeometry(0.858, 64);
        const rimPegGeo = new THREE.CapsuleGeometry(0.023, 0.038, 5, 10);
        const rimPegOutlineGeo = makeSmoothOutlineGeo(rimPegGeo, 0.014);

        // 7. Sculpted 3D Antique-Brass 4-Handle Capstan Center Hub (matching Ruleta.jpeg)
        const hubPlatePoints = [
            new THREE.Vector2(0.001, 0.055),
            new THREE.Vector2(0.406, 0.055),
            new THREE.Vector2(0.406, 0.088),
            new THREE.Vector2(0.382, 0.114),
            new THREE.Vector2(0.315, 0.132),
            new THREE.Vector2(0.210, 0.142),
            new THREE.Vector2(0.001, 0.145)
        ];
        const hubPlateGeo = new THREE.LatheGeometry(hubPlatePoints, 44);
        hubPlateGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubPlateGeo, 0.415);
        const hubPlateOutlineGeo = makeSmoothOutlineGeo(hubPlateGeo, 0.024);

        const hubCollarPoints = [
            new THREE.Vector2(0.132, 0.125),
            new THREE.Vector2(0.204, 0.125),
            new THREE.Vector2(0.204, 0.168),
            new THREE.Vector2(0.184, 0.192),
            new THREE.Vector2(0.148, 0.192),
            new THREE.Vector2(0.132, 0.168),
            new THREE.Vector2(0.132, 0.125)
        ];
        const hubCollarGeo = new THREE.LatheGeometry(hubCollarPoints, 32);
        hubCollarGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubCollarGeo, 0.24);
        const hubCollarOutlineGeo = makeSmoothOutlineGeo(hubCollarGeo, 0.020);

        const hubBossPoints = [
            new THREE.Vector2(0.001, 0.165),
            new THREE.Vector2(0.142, 0.165),
            new THREE.Vector2(0.142, 0.198),
            new THREE.Vector2(0.118, 0.228),
            new THREE.Vector2(0.072, 0.246),
            new THREE.Vector2(0.001, 0.252)
        ];
        const hubBossGeo = new THREE.LatheGeometry(hubBossPoints, 32);
        hubBossGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubBossGeo, 0.16);
        const hubBossOutlineGeo = makeSmoothOutlineGeo(hubBossGeo, 0.020);

        // Lathe-turned radial brass baluster handle with tapered waist & bulbous knob tip
        const capstanHandlePoints = [
            new THREE.Vector2(0.001, 0.175),
            new THREE.Vector2(0.052, 0.180),
            new THREE.Vector2(0.044, 0.215),
            new THREE.Vector2(0.034, 0.275),
            new THREE.Vector2(0.038, 0.330),
            new THREE.Vector2(0.064, 0.378),
            new THREE.Vector2(0.073, 0.415),
            new THREE.Vector2(0.062, 0.452),
            new THREE.Vector2(0.034, 0.474),
            new THREE.Vector2(0.001, 0.480)
        ];
        const capstanHandleGeo = new THREE.LatheGeometry(capstanHandlePoints, 20);
        const capstanHandleOutlineGeo = makeSmoothOutlineGeo(capstanHandleGeo, 0.020);

        // 8. Chunky Sculpted 3D Crimson Top Arrow Pointer (12 o'clock, matching Ruleta.jpeg)
        const arrowShape = new THREE.Shape();
        arrowShape.moveTo(-0.088, 0.312);
        arrowShape.lineTo(0.088, 0.312);
        arrowShape.quadraticCurveTo(0.134, 0.312, 0.130, 0.262);
        arrowShape.lineTo(0.104, -0.128);
        arrowShape.lineTo(0.212, -0.106);
        arrowShape.quadraticCurveTo(0.264, -0.098, 0.254, -0.156);
        arrowShape.quadraticCurveTo(0.162, -0.345, 0.032, -0.506);
        arrowShape.quadraticCurveTo(0.0, -0.542, -0.032, -0.506);
        arrowShape.quadraticCurveTo(-0.162, -0.345, -0.254, -0.156);
        arrowShape.quadraticCurveTo(-0.264, -0.098, -0.212, -0.106);
        arrowShape.lineTo(-0.104, -0.128);
        arrowShape.lineTo(-0.130, 0.262);
        arrowShape.quadraticCurveTo(-0.134, 0.312, -0.088, 0.312);
        arrowShape.closePath();

        const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, {
            depth: 0.086,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.020,
            bevelThickness: 0.020
        });
        arrowGeo.translate(0, 0, -0.043);
        applyBoundsPlanarUVs(arrowGeo);
        const arrowOutlineGeo = makeSmoothOutlineGeo(arrowGeo, 0.030);

        const buildWheelStandForTile = () => {
            const wheelStandGroup = new THREE.Group();
            wheelStandGroup.position.set(0, 0, 0);
            wheelStandGroup.visible = false;

            // Inner root aligns front silhouette with adjacent mystery crates & gives heroic path presence
            const standRoot = new THREE.Group();
            standRoot.position.set(0, 0, 0.36);
            standRoot.scale.setScalar(1.07);
            wheelStandGroup.add(standRoot);

            // 1. Two Separate Beveled Wooden Foot Blocks (NO single bottom plank)
            for (const side of [-1, 1]) {
                const footGroup = new THREE.Group();
                footGroup.position.set(side * 0.65, 0.012, 0);
                const footMesh = new THREE.Mesh(footGeo, pathWoodPlankMat);
                const footOut = new THREE.Mesh(footOutlineGeo, wheelInkOutlineMat);
                footOut.renderOrder = -1;
                const trimBar = new THREE.Mesh(footTrimGeo, footInkBarMat);
                trimBar.position.set(0, 0.125, 0);
                footGroup.add(footMesh, footOut, trimBar);
                standRoot.add(footGroup);

                // Inward-angled thick wooden support leg
                const legGroup = new THREE.Group();
                legGroup.position.set(side * 0.56, 0.38, -0.03);
                legGroup.rotation.z = -side * 0.28;
                const legMesh = new THREE.Mesh(legGeo, pathWoodPlankMat);
                const legOut = new THREE.Mesh(legOutlineGeo, wheelInkOutlineMat);
                legOut.renderOrder = -1;
                legGroup.add(legMesh, legOut);
                standRoot.add(legGroup);
            }

            // 2. Massive Dark-Oak Outer Barrel Ring + Solid Wood Backing
            const frameGroup = new THREE.Group();
            frameGroup.position.set(0, WHEEL_CY, 0);
            standRoot.add(frameGroup);

            const backPlateMesh = new THREE.Mesh(woodBackPlateGeo, pathWoodBackMat);
            backPlateMesh.position.z = -0.09;
            frameGroup.add(backPlateMesh);

            const barrelRingMesh = new THREE.Mesh(woodBarrelRingGeo, pathWoodRingMat);
            const barrelRingOut = new THREE.Mesh(woodBarrelRingOutlineGeo, wheelInkOutlineMat);
            barrelRingOut.renderOrder = -1;
            frameGroup.add(barrelRingMesh, barrelRingOut);

            // 3. Six Heavy Riveted Forged-Iron U-Clamps (2 horizontal w/ 3 rivets + 4 diagonal w/ 2 rivets)
            const clampConfigs = [
                { deg: 0, isHoriz: true },
                { deg: 180, isHoriz: true },
                { deg: 43, isHoriz: false },
                { deg: 137, isHoriz: false },
                { deg: 223, isHoriz: false },
                { deg: 317, isHoriz: false }
            ];
            for (const cfg of clampConfigs) {
                const clampPivot = new THREE.Group();
                clampPivot.rotation.z = (cfg.deg * Math.PI) / 180;
                const cMesh = new THREE.Mesh(
                    cfg.isHoriz ? horizClampGeo : diagClampGeo,
                    pathIronMat
                );
                const cOut = new THREE.Mesh(
                    cfg.isHoriz ? horizClampOutlineGeo : diagClampOutlineGeo,
                    wheelInkOutlineMat
                );
                cOut.renderOrder = -1;
                clampPivot.add(cMesh, cOut);

                if (cfg.isHoriz) {
                    // 3 tangential rivets (o o o)
                    for (const dDeg of [-5.2, 0, 5.2]) {
                        const a = (dDeg * Math.PI) / 180;
                        const r = 1.068;
                        const rv = new THREE.Mesh(clampRivetGeo, pathIronMat);
                        rv.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.214);
                        const rvOut = new THREE.Mesh(clampRivetOutlineGeo, wheelInkOutlineMat);
                        rvOut.position.copy(rv.position);
                        rvOut.renderOrder = -1;
                        clampPivot.add(rv, rvOut);
                    }
                } else {
                    // 2 radial rivets (inner + outer)
                    for (const r of [0.985, 1.148]) {
                        const rv = new THREE.Mesh(clampRivetGeo, pathIronMat);
                        rv.position.set(r, 0, 0.214);
                        const rvOut = new THREE.Mesh(clampRivetOutlineGeo, wheelInkOutlineMat);
                        rvOut.position.copy(rv.position);
                        rvOut.renderOrder = -1;
                        clampPivot.add(rv, rvOut);
                    }
                }
                frameGroup.add(clampPivot);
            }

            // 4. Raised Inner Golden Brass Bezel Ring
            const bezelMesh = new THREE.Mesh(goldBezelGeo, pathGoldBezelMat);
            const bezelOut = new THREE.Mesh(goldBezelOutlineGeo, wheelInkOutlineMat);
            bezelOut.renderOrder = -1;
            frameGroup.add(bezelMesh, bezelOut);

            // 5. Rotating Wheel Disc Assembly (24-wedge gouache face + 24 pegs + 4-handle brass capstan)
            const wheelDiscGroup = new THREE.Group();
            wheelDiscGroup.position.set(0, WHEEL_CY, 0);
            standRoot.add(wheelDiscGroup);

            const faceMesh = new THREE.Mesh(wheelFaceDiscGeo, pathWheelFaceMat);
            faceMesh.position.z = 0.052;
            wheelDiscGroup.add(faceMesh);

            // 24 Golden Rim Pegs aligned with the 24 sector divider lines
            for (let i = 0; i < 24; i++) {
                const canvasAng = -Math.PI / 2 + (i * Math.PI * 2) / 24;
                const px = Math.cos(canvasAng) * 0.818;
                const py = -Math.sin(canvasAng) * 0.818;
                const rotZ = Math.atan2(py, px) - Math.PI / 2;

                const pegMesh = new THREE.Mesh(rimPegGeo, pathPegMat);
                pegMesh.position.set(px, py, 0.074);
                pegMesh.rotation.z = rotZ;
                const pegOut = new THREE.Mesh(rimPegOutlineGeo, wheelInkOutlineMat);
                pegOut.position.copy(pegMesh.position);
                pegOut.rotation.copy(pegMesh.rotation);
                pegOut.renderOrder = -1;
                wheelDiscGroup.add(pegMesh, pegOut);
            }

            // Sculpted 3D Antique-Brass 4-Handle Capstan Hub
            const hubPlateMesh = new THREE.Mesh(hubPlateGeo, pathBrassHubMat);
            const hubPlateOut = new THREE.Mesh(hubPlateOutlineGeo, wheelInkOutlineMat);
            hubPlateOut.renderOrder = -1;
            wheelDiscGroup.add(hubPlateMesh, hubPlateOut);

            const hubCollarMesh = new THREE.Mesh(hubCollarGeo, pathBrassHubMat);
            const hubCollarOut = new THREE.Mesh(hubCollarOutlineGeo, wheelInkOutlineMat);
            hubCollarOut.renderOrder = -1;
            wheelDiscGroup.add(hubCollarMesh, hubCollarOut);

            const hubBossMesh = new THREE.Mesh(hubBossGeo, pathGoldBezelMat);
            const hubBossOut = new THREE.Mesh(hubBossOutlineGeo, wheelInkOutlineMat);
            hubBossOut.renderOrder = -1;
            wheelDiscGroup.add(hubBossMesh, hubBossOut);

            for (let h = 0; h < 4; h++) {
                const handleRotZ = (-h * Math.PI) / 2;
                const handleMesh = new THREE.Mesh(capstanHandleGeo, pathBrassHubMat);
                handleMesh.position.z = 0.156;
                handleMesh.rotation.z = handleRotZ;
                const handleOut = new THREE.Mesh(capstanHandleOutlineGeo, wheelInkOutlineMat);
                handleOut.position.copy(handleMesh.position);
                handleOut.rotation.copy(handleMesh.rotation);
                handleOut.renderOrder = -1;
                wheelDiscGroup.add(handleMesh, handleOut);
            }

            // 6. Chunky Sculpted 3D Crimson Top Arrow Pointer at 12 o'clock
            const flapperGroup = new THREE.Group();
            flapperGroup.position.set(0, WHEEL_CY + 1.26, 0.258);
            const flapperMesh = new THREE.Mesh(arrowGeo, pathArrowMat);
            const flapperOut = new THREE.Mesh(arrowOutlineGeo, wheelInkOutlineMat);
            flapperOut.renderOrder = -1;
            flapperGroup.add(flapperMesh, flapperOut);
            standRoot.add(flapperGroup);

            return {
                wheelStandGroup,
                wheelStandDisc: wheelDiscGroup,
                wheelStandFlapper: flapperGroup
            };
        };

        for (let s = 0; s < VISIBLE_ROW_SLOTS; s++) {
            const slotRow: FloatingMultiplierCard3D[] = [];
            for (let lane = 0; lane < LANE_COUNT; lane++) {
                const group = new THREE.Group();
                const visualGroup = new THREE.Group();
                group.add(visualGroup);

                // 1. Stationary Clean Hitbox (Centered to wrap both resting crate & lifted bonus crate)
                const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);
                hitboxMesh.position.set(0, 2.2, 0);
                hitboxMesh.userData = { isVaultPlatform: true, slotIndex: s, lane };
                group.add(hitboxMesh);
                this.interactiveHitboxMeshes.push(hitboxMesh);

                // 2. 3D Cardboard Mystery Crate Structure (Sealed crate with "X" crossed tape on top)
                const mysteryBoxGroup = new THREE.Group();
                const boxBody = new THREE.Mesh(boxBodyGeo, boxMatNormal);
                boxBody.position.set(0, 0.96, 0);
                const boxBodyOutline = this.createOutline(boxBodyGeo, 0.08, boxBody.position);
                mysteryBoxGroup.add(boxBody, boxBodyOutline);

                // Upper Flaps (Hidden on the sealed "X"-taped crate so the crossed tape top is always visible)
                const lidLeft = new THREE.Group();
                lidLeft.position.set(-1.01, 1.92, 0);
                lidLeft.visible = false;
                const lidFlapL = new THREE.Mesh(flapGeo, boxMatNormalSide);
                lidFlapL.position.set(0.505, 0, 0);
                const lidOutlineL = this.createOutline(flapGeo, 0.06, lidFlapL.position);
                lidLeft.add(lidFlapL, lidOutlineL);

                const lidRight = new THREE.Group();
                lidRight.position.set(1.01, 1.92, 0);
                lidRight.visible = false;
                const lidFlapR = new THREE.Mesh(flapGeo, boxMatNormalSide);
                lidFlapR.position.set(-0.505, 0, 0);
                const lidOutlineR = this.createOutline(flapGeo, 0.06, lidFlapR.position);
                lidRight.add(lidFlapR, lidOutlineR);

                mysteryBoxGroup.add(lidLeft, lidRight);


                visualGroup.add(mysteryBoxGroup);

                // 3. Diffuse Atmospheric Background Glow (Integrated with cosmic space, NO separate floating aura or floor circle)
                const diffuseHazeMat = new THREE.SpriteMaterial({
                    map: this.textures.particleGlow,
                    color: 0xf59e0b,
                    transparent: true,
                    opacity: 0.28,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const diffuseHazeSprite = new THREE.Sprite(diffuseHazeMat);
                diffuseHazeSprite.position.set(0, 1.35, -0.4);
                diffuseHazeSprite.scale.set(5.5, 5.5, 1.0);
                diffuseHazeSprite.visible = false;
                visualGroup.add(diffuseHazeSprite);

                // 4. 3D Comic Solar Power Crystal (Revealed underneath Orange/Solar Bonus Box)
                const solarRelicGroup = new THREE.Group();
                solarRelicGroup.position.set(0, 1.05, 0);

                const solarRelicCrystal = new THREE.Mesh(solarCrystalGeo, solarCrystalMat);
                solarRelicCrystal.scale.set(0.85, 1.35, 0.85);
                const crystalOutline = this.createOutline(solarCrystalGeo, 0.055);
                crystalOutline.scale.copy(solarRelicCrystal.scale);
                solarRelicGroup.add(solarRelicCrystal, crystalOutline);

                const solarCore = new THREE.Mesh(solarCoreGeo, solarCoreMat);
                solarRelicGroup.add(solarCore);

                const solarRelicRing1 = new THREE.Mesh(solarRingGeo1, solarRingMat1);
                solarRelicRing1.rotation.x = Math.PI * 0.38;
                solarRelicRing1.rotation.z = Math.PI * 0.15;
                solarRelicGroup.add(solarRelicRing1);

                const solarRelicRing2 = new THREE.Mesh(solarRingGeo2, solarRingMat2);
                solarRelicRing2.rotation.x = -Math.PI * 0.32;
                solarRelicRing2.rotation.z = -Math.PI * 0.22;
                solarRelicGroup.add(solarRelicRing2);

                for (let n = 0; n < 3; n++) {
                    const ang = (n * Math.PI * 2) / 3;
                    const nodeMesh = new THREE.Mesh(solarNodeGeo, solarNodeMat);
                    nodeMesh.position.set(
                        Math.cos(ang) * 1.08,
                        Math.sin(ang) * 1.08 * Math.cos(Math.PI * 0.38),
                        Math.sin(ang) * 1.08 * Math.sin(Math.PI * 0.38)
                    );
                    solarRelicGroup.add(nodeMesh);
                }
                solarRelicGroup.visible = false;
                visualGroup.add(solarRelicGroup);

                // 5. 3D Comic Mini-UFO Relic (Revealed underneath Blue/Alien Bonus Box)
                const alienRelicGroup = new THREE.Group();
                alienRelicGroup.position.set(0, 1.05, 0);

                const alienRelicUfo = new THREE.Group();
                alienRelicUfo.scale.setScalar(0.36);

                const miniDome = new THREE.Mesh(miniUfoDomeGeo, miniUfoDomeMat);
                miniDome.scale.set(1.0, 1.18, 1.0);
                miniDome.position.y = 0.32;
                miniDome.rotation.y = -Math.PI * 0.42;
                const miniDomeOutline = this.createOutline(miniUfoDomeGeo, 0.055, miniDome.position, miniDome.rotation);
                miniDomeOutline.scale.copy(miniDome.scale);
                alienRelicUfo.add(miniDome, miniDomeOutline);

                const miniCollar = new THREE.Mesh(miniUfoCollarGeo, miniUfoCollarMat);
                miniCollar.position.y = 0.22;
                const miniCollarOutline = this.createOutline(miniUfoCollarGeo, 0.045, miniCollar.position);
                alienRelicUfo.add(miniCollar, miniCollarOutline);

                const miniFlange = new THREE.Mesh(miniUfoFlangeGeo, miniUfoFlangeMat);
                const miniFlangeOutline = this.createOutline(miniUfoFlangeGeo, 0.045);
                alienRelicUfo.add(miniFlange, miniFlangeOutline);

                const miniBelly = new THREE.Mesh(miniUfoBellyGeo, miniUfoBellyMat);
                const miniBellyOutline = this.createOutline(miniUfoBellyGeo, 0.045);
                alienRelicUfo.add(miniBelly, miniBellyOutline);

                const miniRimRing = new THREE.Mesh(miniUfoRimRingGeo, miniUfoRimRingMat);
                miniRimRing.rotation.x = Math.PI / 2;
                miniRimRing.position.y = -0.42;
                alienRelicUfo.add(miniRimRing);

                alienRelicGroup.add(alienRelicUfo);

                const alienRelicRing = new THREE.Mesh(miniUfoEnergyRingGeo, miniUfoEnergyRingMat);
                alienRelicRing.rotation.x = Math.PI / 2;
                alienRelicRing.position.y = -0.38;
                alienRelicGroup.add(alienRelicRing);

                alienRelicGroup.visible = false;
                visualGroup.add(alienRelicGroup);

                // 6. Hazard Prop: Classic 3D ACME Cartoon Naval Bomb with Inverted Hull Ink Outlines
                const mineGroup = new THREE.Group();
                mineGroup.position.set(0, 0.85, 0);

                const bombBody = new THREE.Mesh(bombSphereGeo, cartoonBombMat);
                const bombOutline = this.createOutline(bombSphereGeo, 0.08);

                const bombBand = new THREE.Mesh(bombBandGeo, cartoonHazardBandMat);
                const bombNeck = new THREE.Mesh(bombNeckGeo, cartoonBombNeckMat);
                bombNeck.position.y = 0.68;
                const neckOutline = this.createOutline(bombNeckGeo, 0.065, bombNeck.position);

                const bombWick = new THREE.Mesh(bombWickGeo, cartoonWickMat);
                bombWick.rotation.z = Math.PI / 2;
                bombWick.position.set(0.08, 0.85, 0);

                const bombSpark = new THREE.Mesh(bombSparkGeo, cartoonSparkMat);
                bombSpark.position.set(0.18, 1.02, 0);

                mineGroup.add(
                    bombBody,
                    bombOutline,
                    bombBand,
                    bombNeck,
                    neckOutline,
                    bombWick,
                    bombSpark
                );
                mineGroup.visible = false;
                visualGroup.add(mineGroup);

                // 7. High-Contrast Cartoon Cel-Shaded Multiplier Badge
                const badgeCanvas = document.createElement('canvas');
                badgeCanvas.width = 256;
                badgeCanvas.height = 104;
                const badgeTex = new THREE.CanvasTexture(badgeCanvas);
                badgeTex.colorSpace = THREE.SRGBColorSpace;
                const badgeMat = new THREE.SpriteMaterial({
                    map: badgeTex,
                    transparent: true,
                    depthTest: false
                });
                const badgeSprite = new THREE.Sprite(badgeMat);
                badgeSprite.position.set(0, 2.85, 0);
                badgeSprite.scale.set(3.25, 1.32, 1);
                badgeSprite.visible = false;
                visualGroup.add(badgeSprite);

                const miniWheelPropGroup = new THREE.Group();
                miniWheelPropGroup.position.set(0, 1.15, 1.05);
                miniWheelPropGroup.visible = false;
                const miniWheelMesh = new THREE.Mesh(miniWheelGeo, miniWheelMats);
                const miniWheelOutline = this.createOutline(miniWheelGeo, 0.04);
                miniWheelPropGroup.add(miniWheelMesh, miniWheelOutline);
                mysteryBoxGroup.add(miniWheelPropGroup);

                // Standalone 3D Comic Prize Wheel on Wooden Stand (Tile asset matching Ruleta.jpeg)
                const wheelStandData = buildWheelStandForTile();
                visualGroup.add(wheelStandData.wheelStandGroup);

                this.scene.add(group);
                slotRow.push({
                    group,
                    visualGroup,
                    hitboxMesh,
                    mysteryBoxGroup,
                    boxBody,
                    boxBodyOutline,
                    lidLeft,
                    lidRight,
                    lidFlapL,
                    lidFlapR,
                    lidOutlineL,
                    lidOutlineR,
                    boxMatNormal,
                    boxMatOrange,
                    boxMatAlien,
                    boxMatWheel,
                    diffuseHazeSprite,
                    diffuseHazeMat,
                    miniSunGroup: solarRelicGroup,
                    solarRelicCrystal,
                    solarRelicRing1,
                    solarRelicRing2,
                    alienPortalGroup: alienRelicGroup,
                    alienRelicUfo,
                    alienRelicRing,
                    miniWheelPropGroup,
                    miniWheelMesh,
                    wheelStandGroup: wheelStandData.wheelStandGroup,
                    wheelStandDisc: wheelStandData.wheelStandDisc,
                    wheelStandFlapper: wheelStandData.wheelStandFlapper,
                    mineGroup,
                    badgeCanvas,
                    badgeTex,
                    badgeSprite,
                    badgeMat,
                    lastBadgeSignature: '',
                    boxType: 'normal',
                    lidOpenProgress: 0,
                    boxLiftY: 0,
                    isShattered: false,
                    assignedRow: s + 1,
                    lane
                });
            }
            this.rowSlots.push(slotRow);
        }
    }

    private buildTrajectoryPredictor() {
        const segments = 32;
        this.trajectoryPositions = new Float32Array((segments + 1) * 3);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(this.trajectoryPositions, 3));

        this.trajectoryMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.9
        });
        this.trajectoryLine = new THREE.Line(geo, this.trajectoryMat);
        this.trajectoryLine.frustumCulled = false;
        this.trajectoryLine.visible = false;
        this.scene.add(this.trajectoryLine);
    }

    /**
     * Builds the 3D Comic Flying Saucer UFO Mothership based on media_1793752521015_e3b6a340.jpg
     */
    private buildAlienUfoSaucer() {
        this.alienUfoGroup = new THREE.Group();
        this.alienUfoGroup.visible = false;
        this.scene.add(this.alienUfoGroup);

        const ufoBody = new THREE.Group();
        this.alienUfoBody = ufoBody;
        this.alienUfoGroup.add(ufoBody);

        // 1. MINT-GREEN GLASS DOME (Taller, bulbous egg/bell shape matching reference drawing)
        const domeGeo = new THREE.SphereGeometry(1.35, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
        const domeMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoDomeTex,
            roughness: 0.12,
            metalness: 0.08,
            transparent: true,
            opacity: 0.95,
            emissive: 0x10b981,
            emissiveIntensity: 0.25,
            side: THREE.FrontSide
        });
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.scale.set(1.0, 1.18, 1.0);
        domeMesh.position.y = 0.32;
        domeMesh.rotation.y = -Math.PI * 0.42;
        const domeOutline = this.createOutline(domeGeo, 0.055, domeMesh.position, domeMesh.rotation);
        domeOutline.scale.copy(domeMesh.scale);
        ufoBody.add(domeMesh, domeOutline);

        // Cockpit interior: glowing alien pilot orb / eye
        const pilotCoreGeo = new THREE.SphereGeometry(0.44, 16, 12);
        const pilotCoreMat = new THREE.MeshBasicMaterial({ color: 0x064e3b });
        const pilotMesh = new THREE.Mesh(pilotCoreGeo, pilotCoreMat);
        pilotMesh.position.set(0, 0.68, 0);
        ufoBody.add(pilotMesh);

        const eyeGeo = new THREE.SphereGeometry(0.18, 12, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
        eyeMesh.position.set(0, 0.74, 0.35);
        ufoBody.add(eyeMesh);

        // 2. RIVETED METALLIC COLLAR RING
        const collarGeo = new THREE.CylinderGeometry(1.40, 1.54, 0.32, 32, 1, false);
        const collarMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoCollarTex,
            roughness: 0.3,
            metalness: 0.65
        });
        const collarMesh = new THREE.Mesh(collarGeo, collarMat);
        collarMesh.position.y = 0.22;
        const collarOutline = this.createOutline(collarGeo, 0.045, collarMesh.position);
        ufoBody.add(collarMesh, collarOutline);

        // Discrete 3D Rivet Hemispheres
        for (let i = 0; i < 12; i++) {
            const ang = (i * Math.PI * 2) / 12;
            const rRivet = 1.48;
            const rivetGeo = new THREE.SphereGeometry(0.075, 8, 6);
            const rivetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
            const rivetMesh = new THREE.Mesh(rivetGeo, rivetMat);
            rivetMesh.position.set(Math.cos(ang) * rRivet, 0.22, Math.sin(ang) * rRivet);
            ufoBody.add(rivetMesh);
        }

        // 3. UPPER BLUE SAUCER FLANGE (Curved Lathe Profile matching reference)
        const flangePoints = [
            new THREE.Vector2(1.50, 0.12),
            new THREE.Vector2(1.85, 0.04),
            new THREE.Vector2(2.25, -0.14),
            new THREE.Vector2(2.55, -0.32),
            new THREE.Vector2(2.62, -0.42),
            new THREE.Vector2(2.58, -0.52),
            new THREE.Vector2(2.50, -0.52),
            new THREE.Vector2(2.20, -0.18),
            new THREE.Vector2(1.80, 0.0),
            new THREE.Vector2(1.48, 0.08)
        ];
        const flangeGeo = new THREE.LatheGeometry(flangePoints, 36);
        const flangeMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoSaucerTex,
            roughness: 0.25,
            metalness: 0.35,
            side: THREE.DoubleSide
        });
        const flangeMesh = new THREE.Mesh(flangeGeo, flangeMat);
        const flangeOutline = this.createOutline(flangeGeo, 0.045);
        ufoBody.add(flangeMesh, flangeOutline);

        // 4. SEGMENTED METALLIC BELLY (LOWER HULL)
        const bellyPoints = [
            new THREE.Vector2(2.58, -0.52),
            new THREE.Vector2(2.25, -0.75),
            new THREE.Vector2(1.75, -1.02),
            new THREE.Vector2(1.15, -1.22),
            new THREE.Vector2(0.70, -1.30),
            new THREE.Vector2(0.68, -1.24),
            new THREE.Vector2(1.12, -1.16),
            new THREE.Vector2(1.70, -0.96),
            new THREE.Vector2(2.20, -0.70),
            new THREE.Vector2(2.52, -0.48)
        ];
        const bellyGeo = new THREE.LatheGeometry(bellyPoints, 36);
        const bellyMat = new THREE.MeshStandardMaterial({
            map: this.textures.ufoBellyTex,
            roughness: 0.35,
            metalness: 0.55,
            side: THREE.DoubleSide
        });
        const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
        const bellyOutline = this.createOutline(bellyGeo, 0.045);
        ufoBody.add(bellyMesh, bellyOutline);

        // 5. CENTRAL TRACTOR EMITTER APERTURE (BOTTOM CENTER)
        const emitterGeo = new THREE.CylinderGeometry(0.70, 0.50, 0.16, 24);
        const emitterMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x34d399,
            emissiveIntensity: 0.85,
            roughness: 0.1
        });
        const emitterMesh = new THREE.Mesh(emitterGeo, emitterMat);
        emitterMesh.position.y = -1.34;
        const emitterOutline = this.createOutline(emitterGeo, 0.04, emitterMesh.position);
        ufoBody.add(emitterMesh, emitterOutline);

        // Glowing emitter lens
        const lensGeo = new THREE.CircleGeometry(0.48, 20);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, side: THREE.DoubleSide });
        const lensMesh = new THREE.Mesh(lensGeo, lensMat);
        lensMesh.rotation.x = Math.PI / 2;
        lensMesh.position.y = -1.43;
        ufoBody.add(lensMesh);

        // Outer rim bold comic ink edge band ring
        const rimRingGeo = new THREE.TorusGeometry(2.60, 0.052, 8, 36);
        const rimRingMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const rimRing = new THREE.Mesh(rimRingGeo, rimRingMat);
        rimRing.rotation.x = Math.PI / 2;
        rimRing.position.y = -0.42;
        ufoBody.add(rimRing);

        // 6. STYLIZED CEL-SHADED TRACTOR BEAM WITH CONCENTRIC CARTOON RINGS
        const beamConeGeo = new THREE.CylinderGeometry(0.65, 3.8, 10.5, 24, 1, true);
        const beamConeMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.alienTractorBeam = new THREE.Mesh(beamConeGeo, beamConeMat);
        this.alienTractorBeam.position.y = -6.7;
        this.alienUfoGroup.add(this.alienTractorBeam);

        // Concentric Cartoon Energy Rings descending along the beam
        this.alienTractorRings = [];
        for (let i = 0; i < 4; i++) {
            const ringTorusGeo = new THREE.TorusGeometry(1.2 + i * 0.65, 0.048, 8, 28);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x34d399,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const ringMesh = new THREE.Mesh(ringTorusGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.position.y = -2.5 - i * 2.2;
            this.alienTractorRings.push(ringMesh);
            this.alienUfoGroup.add(ringMesh);
        }
    }

    /**
     * Executes the Cinematic 3D Alien UFO Abduction Sequence:
     * 1. Alien box & core vanish immediately upon impact with cosmic particle burst.
     * 2. In that exact instant, Alien UFO swoops down and activates tractor beam.
     * 3. Abducts ship upwards into the beam.
     * 4. Cosmic warp flash transports player forward across the skipped rows.
     * 5. Drops player on a completely clean tile (with NO box on that landing tile!),
     *    facing the fresh boxes of the next row ahead!
     */
    public triggerAlienAbductionSequence(worldX: number, worldZ: number, _rowsSkipped: number) {
        this.isAbductionActive = true;
        this.alienUfoGroup.visible = true;
        this.alienUfoGroup.position.set(worldX, 18, worldZ);
        this.alienTractorBeam.scale.set(0.1, 1, 0.1);

        // Destination is the resting row behind the active next row (currentRow - 1)
        const destinationRow = Math.max(1, this.gameState.engine.currentRow - 1);
        const destinationZ = PixiRenderer.rowToWorldZ(destinationRow);

        audioController.playAlienLaser();

        // 1. Immediately destroy/vanish the alien box, core, and all residual cell elements!
        const card = this.rowSlots
            .flat()
            .find(
                (c) =>
                    Math.abs(c.group.position.z - worldZ) < 1.2 &&
                    Math.abs(c.group.position.x - worldX) < 1.2
            );
        if (card) {
            card.mysteryBoxGroup.visible = false;
            card.alienPortalGroup.visible = false;
            card.miniSunGroup.visible = false;
            card.diffuseHazeSprite.visible = false;
            card.badgeSprite.visible = false;
            card.visualGroup.position.y = 0;
            card.boxLiftY = 0;
        }

        // Also ensure the destination landing tile has NO box!
        const destCard = this.rowSlots
            .flat()
            .find(
                (c) =>
                    Math.abs(c.group.position.z - destinationZ) < 1.2 &&
                    Math.abs(c.group.position.x - worldX) < 1.2
            );
        if (destCard) {
            destCard.mysteryBoxGroup.visible = false;
            destCard.miniSunGroup.visible = false;
            destCard.alienPortalGroup.visible = false;
            destCard.diffuseHazeSprite.visible = false;
            destCard.badgeSprite.visible = false;
            destCard.boxLiftY = 0;
        }

        // 2. Explode with vibrant cyan & mint comic energy particles matching the new UFO asset!
        this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'alien');
        this.vfx.spawnGpuParticleCloud(
            worldX,
            1.0,
            worldZ,
            80,
            [0x34d399, 0x5eead4, 0x00f0ff, 0x2563eb, 0xffffff],
            12,
            28,
            0.55
        );

        gsap.killTweensOf(this.alienUfoGroup.position);
        gsap.killTweensOf(this.alienUfoGroup.rotation);
        gsap.killTweensOf(this.alienTractorBeam.scale);
        gsap.killTweensOf(this.ship.pos);
        this.ship.vel.set(0, 0, 0);

        // 3. UFO swoops down rapidly from deep space with authentic comic banking tilt
        this.alienUfoGroup.rotation.set(0.36, 0, -0.12);
        gsap.to(this.alienUfoGroup.position, {
            y: 5.8,
            duration: 0.22,
            ease: 'back.out(1.4)',
            onComplete: () => {
                // Tractor beam activates and expands
                gsap.to(this.alienTractorBeam.scale, {
                    x: 1.0,
                    z: 1.0,
                    duration: 0.10,
                    ease: 'power2.out'
                });

                // Ship lifts upward into the beam smoothly
                gsap.to(this.ship.pos, {
                    y: 3.4,
                    duration: 0.18,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        this.ship.vel.set(0, 0, 0);
                        this.ship.targetPos.copy(this.ship.pos);
                    },
                    onComplete: () => {
                        // Smooth comic warp glide across the skipped rows with mint shockwave
                        this.vfx.spawnShockwave3D(worldX, 0.4, destinationZ, 0x34d399, 12.0, 0.42);
                        gsap.to(this.alienUfoGroup.rotation, {
                            z: 0.18,
                            x: 0.35,
                            duration: 0.24,
                            ease: 'power2.inOut'
                        });
                        gsap.to(this.alienUfoGroup.position, {
                            z: destinationZ,
                            duration: 0.24,
                            ease: 'power2.inOut'
                        });
                        gsap.to(this.ship.pos, {
                            z: destinationZ,
                            duration: 0.24,
                            ease: 'power2.inOut',
                            onUpdate: () => {
                                this.ship.vel.set(0, 0, 0);
                                this.ship.targetPos.copy(this.ship.pos);
                            },
                            onComplete: () => {
                                this.vfx.spawnGpuParticleCloud(
                                    worldX,
                                    1.2,
                                    destinationZ,
                                    80,
                                    [0x34d399, 0x5eead4, 0x00f0ff, 0x2563eb, 0xffffff],
                                    11,
                                    24,
                                    0.45
                                );
                                this.ship.targetPos.set(worldX, SHIP_FLIGHT_Y, destinationZ);

                                // Lower ship safely onto the clean track
                                gsap.to(this.ship.pos, {
                                    y: SHIP_FLIGHT_Y,
                                    duration: 0.16,
                                    ease: 'back.out(1.2)',
                                    onUpdate: () => {
                                        this.ship.vel.set(0, 0, 0);
                                        this.ship.targetPos.copy(this.ship.pos);
                                    },
                                    onComplete: () => {
                                        this.ship.vel.set(0, 0, 0);
                                        this.ship.targetPos.set(worldX, SHIP_FLIGHT_Y, destinationZ);
                                        this.isAbductionActive = false;
                                        // UFO ascends with comic recoil squash & zips into hyperspace
                                        gsap.to(this.alienUfoGroup.rotation, {
                                            x: -0.35,
                                            z: 0,
                                            duration: 0.22,
                                            ease: 'power2.in'
                                        });
                                        gsap.to(this.alienUfoGroup.position, {
                                            y: 32,
                                            duration: 0.22,
                                            ease: 'power2.in',
                                            onComplete: () => {
                                                this.alienUfoGroup.visible = false;
                                                this.alienUfoGroup.rotation.set(0, 0, 0);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Builds the 3D Giant Comic Prize Wheel (Ruleta) matching Ruleta.jpeg with 12 prize sectors,
     * golden bevel rim, perimeter pegs, mechanical flapper pointer, and the floating zero-G astronaut.
     */
    private buildGiantPrizeWheelAndAstronaut() {
        this.giantRouletteGroup = new THREE.Group();
        this.giantRouletteGroup.visible = false;
        this.scene.add(this.giantRouletteGroup);

        const wheelInkOutlineMat = new THREE.MeshBasicMaterial({
            color: 0x060505,
            side: THREE.BackSide,
            depthWrite: true
        });

        const makeSmoothOutlineGeo = (
            srcGeo: THREE.BufferGeometry,
            thickness: number
        ): THREE.BufferGeometry => {
            const outlineGeo = srcGeo.clone();
            outlineGeo.computeVertexNormals();
            const posAttr = outlineGeo.attributes.position;
            const normAttr = outlineGeo.attributes.normal;
            const dirMap = new Map<string, Map<string, [number, number, number]>>();

            for (let i = 0; i < posAttr.count; i++) {
                const pKey = `${Math.round(posAttr.getX(i) * 1000)},${Math.round(posAttr.getY(i) * 1000)},${Math.round(posAttr.getZ(i) * 1000)}`;
                const nx = normAttr.getX(i);
                const ny = normAttr.getY(i);
                const nz = normAttr.getZ(i);
                const nKey = `${Math.round(nx * 50)},${Math.round(ny * 50)},${Math.round(nz * 50)}`;
                let bucket = dirMap.get(pKey);
                if (!bucket) {
                    bucket = new Map();
                    dirMap.set(pKey, bucket);
                }
                if (!bucket.has(nKey)) {
                    bucket.set(nKey, [nx, ny, nz]);
                }
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
                const pKey = `${Math.round(posAttr.getX(i) * 1000)},${Math.round(posAttr.getY(i) * 1000)},${Math.round(posAttr.getZ(i) * 1000)}`;
                const [ox, oy, oz] = avgMap.get(pKey)!;
                posAttr.setXYZ(
                    i,
                    posAttr.getX(i) + ox * thickness,
                    posAttr.getY(i) + oy * thickness,
                    posAttr.getZ(i) + oz * thickness
                );
            }
            return outlineGeo;
        };

        const applyPlanarDiscUVs = (geo: THREE.BufferGeometry, maxRadius: number) => {
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            const invSpan = 1 / (maxRadius * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = 0.5 + pos.getX(i) * invSpan;
                uvs[i * 2 + 1] = 0.5 + pos.getY(i) * invSpan;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        const applyBoundsPlanarUVs = (geo: THREE.BufferGeometry) => {
            geo.computeBoundingBox();
            const bb = geo.boundingBox!;
            const spanX = Math.max(1e-4, bb.max.x - bb.min.x);
            const spanY = Math.max(1e-4, bb.max.y - bb.min.y);
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = (pos.getX(i) - bb.min.x) / spanX;
                uvs[i * 2 + 1] = (pos.getY(i) - bb.min.y) / spanY;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        // Hand-illustrated comic PBR materials matching Assets/Ruleta.jpeg & path roulette prop
        const giantWoodRingMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelWoodRingTex,
            emissive: 0x3b1d0a,
            emissiveIntensity: 0.24,
            roughness: 0.58,
            metalness: 0.04
        });
        const giantWoodBackMat = new THREE.MeshStandardMaterial({
            color: 0x2e1708,
            roughness: 0.74,
            metalness: 0.04
        });
        const giantIronMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelIronTex,
            color: 0xeae5dc,
            emissive: 0x45413a,
            emissiveIntensity: 0.24,
            roughness: 0.44,
            metalness: 0.24
        });
        const giantGoldBezelMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xffe875,
            emissive: 0xb45309,
            emissiveIntensity: 0.30,
            roughness: 0.32,
            metalness: 0.30
        });
        const giantBrassHubMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xf9db84,
            emissive: 0x78350f,
            emissiveIntensity: 0.26,
            roughness: 0.36,
            metalness: 0.26
        });
        const giantWheelFaceMat = new THREE.MeshStandardMaterial({
            map: this.textures.wheelFaceTex,
            emissive: 0xffffff,
            emissiveMap: this.textures.wheelFaceTex,
            emissiveIntensity: 0.24,
            roughness: 0.34,
            metalness: 0.04
        });
        const giantPegMat = new THREE.MeshStandardMaterial({
            color: 0xffe85c,
            emissive: 0xd97706,
            emissiveIntensity: 0.36,
            roughness: 0.24,
            metalness: 0.34
        });
        const giantArrowMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelArrowTex,
            emissive: 0xb91c1c,
            emissiveIntensity: 0.30,
            roughness: 0.26,
            metalness: 0.08
        });

        // 1. Stationary Outer Carved Dark-Oak Barrel Frame + Solid Wood Backing
        const frameGroup = new THREE.Group();
        this.giantRouletteGroup.add(frameGroup);

        const woodBackPlateGeo = new THREE.CylinderGeometry(3.52, 3.52, 0.34, 64);
        woodBackPlateGeo.rotateX(Math.PI / 2);
        const backPlateMesh = new THREE.Mesh(woodBackPlateGeo, giantWoodBackMat);
        backPlateMesh.position.z = -0.22;
        frameGroup.add(backPlateMesh);

        const barrelRingPoints = [
            new THREE.Vector2(3.42, -0.44),
            new THREE.Vector2(4.22, -0.44),
            new THREE.Vector2(4.36, -0.34),
            new THREE.Vector2(4.40, -0.14),
            new THREE.Vector2(4.40, 0.14),
            new THREE.Vector2(4.36, 0.34),
            new THREE.Vector2(4.22, 0.44),
            new THREE.Vector2(3.53, 0.44),
            new THREE.Vector2(3.42, 0.35),
            new THREE.Vector2(3.42, -0.35),
            new THREE.Vector2(3.42, -0.44)
        ];
        const woodBarrelRingGeo = new THREE.LatheGeometry(barrelRingPoints, 72);
        woodBarrelRingGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(woodBarrelRingGeo, 4.46);
        const woodBarrelRingOutlineGeo = makeSmoothOutlineGeo(woodBarrelRingGeo, 0.072);

        const barrelRingMesh = new THREE.Mesh(woodBarrelRingGeo, giantWoodRingMat);
        const barrelRingOut = new THREE.Mesh(woodBarrelRingOutlineGeo, wheelInkOutlineMat);
        barrelRingOut.renderOrder = -1;
        frameGroup.add(barrelRingMesh, barrelRingOut);

        // 2. Six Heavy Riveted Forged-Iron U-Clamps (2 horizontal w/ 3 rivets + 4 diagonal w/ 2 rivets)
        const createCurvedIronClampGeo = (halfAngleRad: number) => {
            const rIn = 3.37;
            const rOut = 4.50;
            const s = new THREE.Shape();
            s.moveTo(Math.cos(-halfAngleRad) * rIn, Math.sin(-halfAngleRad) * rIn);
            s.absarc(0, 0, rOut, -halfAngleRad, halfAngleRad, false);
            s.absarc(0, 0, rIn, halfAngleRad, -halfAngleRad, true);
            s.closePath();
            const g = new THREE.ExtrudeGeometry(s, {
                depth: 0.94,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 1,
                bevelSize: 0.044,
                bevelThickness: 0.044
            });
            g.translate(0, 0, -0.47);
            applyBoundsPlanarUVs(g);
            return g;
        };

        const horizClampGeo = createCurvedIronClampGeo((9.4 * Math.PI) / 180);
        const horizClampOutlineGeo = makeSmoothOutlineGeo(horizClampGeo, 0.056);
        const diagClampGeo = createCurvedIronClampGeo((6.8 * Math.PI) / 180);
        const diagClampOutlineGeo = makeSmoothOutlineGeo(diagClampGeo, 0.056);

        const clampRivetGeo = new THREE.SphereGeometry(0.108, 12, 10);
        clampRivetGeo.scale(1, 1, 0.66);
        const clampRivetOutlineGeo = makeSmoothOutlineGeo(clampRivetGeo, 0.036);

        const clampConfigs = [
            { deg: 0, isHoriz: true },
            { deg: 180, isHoriz: true },
            { deg: 43, isHoriz: false },
            { deg: 137, isHoriz: false },
            { deg: 223, isHoriz: false },
            { deg: 317, isHoriz: false }
        ];
        for (const cfg of clampConfigs) {
            const clampPivot = new THREE.Group();
            clampPivot.rotation.z = (cfg.deg * Math.PI) / 180;
            const cMesh = new THREE.Mesh(
                cfg.isHoriz ? horizClampGeo : diagClampGeo,
                giantIronMat
            );
            const cOut = new THREE.Mesh(
                cfg.isHoriz ? horizClampOutlineGeo : diagClampOutlineGeo,
                wheelInkOutlineMat
            );
            cOut.renderOrder = -1;
            clampPivot.add(cMesh, cOut);

            if (cfg.isHoriz) {
                for (const dDeg of [-5.2, 0, 5.2]) {
                    const a = (dDeg * Math.PI) / 180;
                    const r = 3.94;
                    const rv = new THREE.Mesh(clampRivetGeo, giantIronMat);
                    rv.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.515);
                    const rvOut = new THREE.Mesh(clampRivetOutlineGeo, wheelInkOutlineMat);
                    rvOut.position.copy(rv.position);
                    rvOut.renderOrder = -1;
                    clampPivot.add(rv, rvOut);
                }
            } else {
                for (const r of [3.67, 4.21]) {
                    const rv = new THREE.Mesh(clampRivetGeo, giantIronMat);
                    rv.position.set(r, 0, 0.515);
                    const rvOut = new THREE.Mesh(clampRivetOutlineGeo, wheelInkOutlineMat);
                    rvOut.position.copy(rv.position);
                    rvOut.renderOrder = -1;
                    clampPivot.add(rv, rvOut);
                }
            }
            frameGroup.add(clampPivot);
        }

        // 3. Raised Inner Golden Brass Bezel Ring
        const goldBezelPoints = [
            new THREE.Vector2(3.22, 0.08),
            new THREE.Vector2(3.46, 0.08),
            new THREE.Vector2(3.46, 0.24),
            new THREE.Vector2(3.40, 0.31),
            new THREE.Vector2(3.28, 0.31),
            new THREE.Vector2(3.22, 0.24),
            new THREE.Vector2(3.22, 0.08)
        ];
        const goldBezelGeo = new THREE.LatheGeometry(goldBezelPoints, 72);
        goldBezelGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(goldBezelGeo, 3.52);
        const goldBezelOutlineGeo = makeSmoothOutlineGeo(goldBezelGeo, 0.048);

        const bezelMesh = new THREE.Mesh(goldBezelGeo, giantGoldBezelMat);
        const bezelOut = new THREE.Mesh(goldBezelOutlineGeo, wheelInkOutlineMat);
        bezelOut.renderOrder = -1;
        frameGroup.add(bezelMesh, bezelOut);

        // 4. Rotating Inner Wheel Assembly (12-wedge symbol face + 12 pegs + 4-handle brass capstan)
        this.giantWheelDisc = new THREE.Group();
        this.giantRouletteGroup.add(this.giantWheelDisc);

        const wheelFaceDiscGeo = new THREE.CircleGeometry(3.26, 72);
        applyPlanarDiscUVs(wheelFaceDiscGeo, 3.27);
        const faceMesh = new THREE.Mesh(wheelFaceDiscGeo, giantWheelFaceMat);
        faceMesh.position.z = 0.10;
        // Aligns planar disc UVs with Provably Fair convention (Sector 9 at 12 o'clock at rotation.z = 0)
        faceMesh.rotation.z = -Math.PI / 2;
        this.giantWheelDisc.add(faceMesh);

        // 12 Sculpted 3D Golden Capsule Rim Pegs aligned with the 12 sector divider lines
        const rimPegGeo = new THREE.CapsuleGeometry(0.068, 0.132, 6, 12);
        const rimPegOutlineGeo = makeSmoothOutlineGeo(rimPegGeo, 0.032);
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (i + 0.5) * ((Math.PI * 2) / 12);
            const px = Math.cos(angle) * 3.10;
            const py = Math.sin(angle) * 3.10;
            const rotZ = Math.atan2(py, px) - Math.PI / 2;

            const pegMesh = new THREE.Mesh(rimPegGeo, giantPegMat);
            pegMesh.position.set(px, py, 0.185);
            pegMesh.rotation.z = rotZ;
            const pegOut = new THREE.Mesh(rimPegOutlineGeo, wheelInkOutlineMat);
            pegOut.position.copy(pegMesh.position);
            pegOut.rotation.copy(pegMesh.rotation);
            pegOut.renderOrder = -1;
            this.giantWheelDisc.add(pegMesh, pegOut);
        }

        // 5. Sculpted 3D Antique-Brass 4-Handle Capstan Center Hub (matching Ruleta.jpeg)
        const hubPlatePoints = [
            new THREE.Vector2(0.001, 0.115),
            new THREE.Vector2(1.08, 0.115),
            new THREE.Vector2(1.08, 0.210),
            new THREE.Vector2(1.01, 0.278),
            new THREE.Vector2(0.84, 0.325),
            new THREE.Vector2(0.56, 0.352),
            new THREE.Vector2(0.001, 0.360)
        ];
        const hubPlateGeo = new THREE.LatheGeometry(hubPlatePoints, 56);
        hubPlateGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubPlateGeo, 1.12);
        const hubPlateOutlineGeo = makeSmoothOutlineGeo(hubPlateGeo, 0.052);

        const hubPlateMesh = new THREE.Mesh(hubPlateGeo, giantBrassHubMat);
        const hubPlateOut = new THREE.Mesh(hubPlateOutlineGeo, wheelInkOutlineMat);
        hubPlateOut.renderOrder = -1;
        this.giantWheelDisc.add(hubPlateMesh, hubPlateOut);

        const hubCollarPoints = [
            new THREE.Vector2(0.35, 0.31),
            new THREE.Vector2(0.55, 0.31),
            new THREE.Vector2(0.55, 0.43),
            new THREE.Vector2(0.49, 0.49),
            new THREE.Vector2(0.40, 0.49),
            new THREE.Vector2(0.35, 0.43),
            new THREE.Vector2(0.35, 0.31)
        ];
        const hubCollarGeo = new THREE.LatheGeometry(hubCollarPoints, 40);
        hubCollarGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubCollarGeo, 0.62);
        const hubCollarOutlineGeo = makeSmoothOutlineGeo(hubCollarGeo, 0.044);

        const hubCollarMesh = new THREE.Mesh(hubCollarGeo, giantBrassHubMat);
        const hubCollarOut = new THREE.Mesh(hubCollarOutlineGeo, wheelInkOutlineMat);
        hubCollarOut.renderOrder = -1;
        this.giantWheelDisc.add(hubCollarMesh, hubCollarOut);

        const hubBossPoints = [
            new THREE.Vector2(0.001, 0.42),
            new THREE.Vector2(0.38, 0.42),
            new THREE.Vector2(0.38, 0.50),
            new THREE.Vector2(0.31, 0.58),
            new THREE.Vector2(0.19, 0.63),
            new THREE.Vector2(0.001, 0.645)
        ];
        const hubBossGeo = new THREE.LatheGeometry(hubBossPoints, 40);
        hubBossGeo.rotateX(Math.PI / 2);
        applyPlanarDiscUVs(hubBossGeo, 0.42);
        const hubBossOutlineGeo = makeSmoothOutlineGeo(hubBossGeo, 0.044);

        const hubBossMesh = new THREE.Mesh(hubBossGeo, giantGoldBezelMat);
        const hubBossOut = new THREE.Mesh(hubBossOutlineGeo, wheelInkOutlineMat);
        hubBossOut.renderOrder = -1;
        this.giantWheelDisc.add(hubBossMesh, hubBossOut);

        const capstanHandlePoints = [
            new THREE.Vector2(0.001, 0.47),
            new THREE.Vector2(0.142, 0.49),
            new THREE.Vector2(0.122, 0.58),
            new THREE.Vector2(0.094, 0.76),
            new THREE.Vector2(0.106, 0.92),
            new THREE.Vector2(0.178, 1.06),
            new THREE.Vector2(0.204, 1.17),
            new THREE.Vector2(0.172, 1.27),
            new THREE.Vector2(0.095, 1.34),
            new THREE.Vector2(0.001, 1.36)
        ];
        const capstanHandleGeo = new THREE.LatheGeometry(capstanHandlePoints, 24);
        const capstanHandleOutlineGeo = makeSmoothOutlineGeo(capstanHandleGeo, 0.046);

        for (let h = 0; h < 4; h++) {
            const handleRotZ = (-h * Math.PI) / 2;
            const handleMesh = new THREE.Mesh(capstanHandleGeo, giantBrassHubMat);
            handleMesh.position.z = 0.395;
            handleMesh.rotation.z = handleRotZ;
            const handleOut = new THREE.Mesh(capstanHandleOutlineGeo, wheelInkOutlineMat);
            handleOut.position.copy(handleMesh.position);
            handleOut.rotation.copy(handleMesh.rotation);
            handleOut.renderOrder = -1;
            this.giantWheelDisc.add(handleMesh, handleOut);
        }

        // 6. Chunky Sculpted 3D Glossy Crimson Top Arrow Pointer at 12 o'clock (matching Ruleta.jpeg)
        this.giantWheelFlapper = new THREE.Group();
        this.giantWheelFlapper.position.set(0, 4.16, 0.58);
        this.giantRouletteGroup.add(this.giantWheelFlapper);

        const arrowScale = 2.42;
        const arrowShape = new THREE.Shape();
        arrowShape.moveTo(-0.088 * arrowScale, 0.312 * arrowScale);
        arrowShape.lineTo(0.088 * arrowScale, 0.312 * arrowScale);
        arrowShape.quadraticCurveTo(0.134 * arrowScale, 0.312 * arrowScale, 0.130 * arrowScale, 0.262 * arrowScale);
        arrowShape.lineTo(0.104 * arrowScale, -0.128 * arrowScale);
        arrowShape.lineTo(0.212 * arrowScale, -0.106 * arrowScale);
        arrowShape.quadraticCurveTo(0.264 * arrowScale, -0.098 * arrowScale, 0.254 * arrowScale, -0.156 * arrowScale);
        arrowShape.quadraticCurveTo(0.162 * arrowScale, -0.345 * arrowScale, 0.032 * arrowScale, -0.506 * arrowScale);
        arrowShape.quadraticCurveTo(0.0, -0.542 * arrowScale, -0.032 * arrowScale, -0.506 * arrowScale);
        arrowShape.quadraticCurveTo(-0.162 * arrowScale, -0.345 * arrowScale, -0.254 * arrowScale, -0.156 * arrowScale);
        arrowShape.quadraticCurveTo(-0.264 * arrowScale, -0.098 * arrowScale, -0.212 * arrowScale, -0.106 * arrowScale);
        arrowShape.lineTo(-0.104 * arrowScale, -0.128 * arrowScale);
        arrowShape.lineTo(-0.130 * arrowScale, 0.262 * arrowScale);
        arrowShape.quadraticCurveTo(-0.134 * arrowScale, 0.312 * arrowScale, -0.088 * arrowScale, 0.312 * arrowScale);
        arrowShape.closePath();

        const flapperExtrude = new THREE.ExtrudeGeometry(arrowShape, {
            depth: 0.21,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.048,
            bevelThickness: 0.048
        });
        flapperExtrude.translate(0, 0, -0.105);
        applyBoundsPlanarUVs(flapperExtrude);
        const flapperOutlineGeo = makeSmoothOutlineGeo(flapperExtrude, 0.064);

        const flapperMesh = new THREE.Mesh(flapperExtrude, giantArrowMat);
        const flapperOutline = new THREE.Mesh(flapperOutlineGeo, wheelInkOutlineMat);
        flapperOutline.renderOrder = -1;
        this.giantWheelFlapper.add(flapperMesh, flapperOutline);

        const wheelGlowLight = new THREE.PointLight(0xfff4d2, 1.65, 26.0, 1.35);
        wheelGlowLight.position.set(0, 2.2, 4.8);
        this.giantRouletteGroup.add(wheelGlowLight);

        // Volumetric 3D Hero Astronaut floating in zero-G void (Matching AEspaldas.jpeg & Flotando.jpeg)
        this.floatingAstronautGroup = new THREE.Group();
        this.floatingAstronautGroup.visible = false;
        this.scene.add(this.floatingAstronautGroup);

        this.astro3D = this.buildVolumetric3DAstronaut();
        this.floatingAstronautGroup.add(this.astro3D.root);

        const astroThrusterLight = new THREE.PointLight(0xffffff, 0.85, 10.0, 1.2);
        astroThrusterLight.position.set(0, 0.5, 2.2);
        this.floatingAstronautGroup.add(astroThrusterLight);

        // Volumetric 3D "Mr. Dollar" Cosmic Croupier / Showman Host spinning the Giant Prize Wheel!
        this.mrDollar3D = new MrDollar3D(this.textures);
        this.mrDollar3D.root.scale.setScalar(1.26);
        this.mrDollar3D.root.visible = false;
        this.scene.add(this.mrDollar3D.root);
    }

    /**
     * Constructs a Full 360-Degree Articulated Cel-Shaded Comic PBR 3D Astronaut Model
     * sculpted 1:1 after the 3 character turnaround reference sheets (Astronauta.jpeg, Flotando.jpeg, AEspaldas.jpeg):
     * - Facing -Z (looking toward the Giant Wheel / Arcade Slot), with +Z Back facing the tactical camera.
     * - Oversized spherical comic helmet with twin riveted seam strips, side ear-comm pods,
     *   18-rivet metallic visor bezel, and domed teal-cyan iridescent glass visor.
     * - Padded ripstop spacesuit torso with center zipper, trapezoidal groin plate, leg & shoulder harnesses,
     *   and front Display & Control Module (blue gauge, red switch, olive readout, rotary knob).
     * - Sculpted PLSS life-support backpack (+Z) with top slate vent window, twin looping braided cables,
     *   and central raised telemetry box (steel slot, olive indicator, slate module, glazed blue screen).
     * - 4 continuous physical 3D ribbed umbilical hoses wrapping from back PLSS ports around both flanks
     *   into the front belly ports with color-coded Blue, Red, Blue, and Yellow metallic collars.
     * - Articulated puff-sleeved arms (shoulder flag & mission patches, back elbow pads, wrist rings, 5-fingered gloves)
     *   and puffy legs (front knee pads, asymmetric zero-G knee bend, chunky moon boots with lugged dark soles).
     */
    private buildVolumetric3DAstronaut(): {
        root: THREE.Group;
        helmet: THREE.Group;
        backpack: THREE.Group;
        leftArm: THREE.Group;
        rightArm: THREE.Group;
        leftLeg: THREE.Group;
        rightLeg: THREE.Group;
    } {
        const root = new THREE.Group();
        root.scale.setScalar(1.36);

        const inkOutlineMat = new THREE.MeshBasicMaterial({
            color: 0x07090d,
            side: THREE.BackSide,
            depthWrite: true
        });
        const darkInkSolidMat = new THREE.MeshBasicMaterial({ color: 0x11151c });

        const makeSmoothOutline = (
            srcGeo: THREE.BufferGeometry,
            thickness: number
        ): THREE.Mesh => {
            const outlineGeo = srcGeo.clone();
            outlineGeo.computeVertexNormals();
            const posAttr = outlineGeo.attributes.position;
            const normAttr = outlineGeo.attributes.normal;
            const dirMap = new Map<string, Map<string, [number, number, number]>>();

            for (let i = 0; i < posAttr.count; i++) {
                const pKey = `${Math.round(posAttr.getX(i) * 2000)},${Math.round(posAttr.getY(i) * 2000)},${Math.round(posAttr.getZ(i) * 2000)}`;
                const nx = normAttr.getX(i);
                const ny = normAttr.getY(i);
                const nz = normAttr.getZ(i);
                const nKey = `${Math.round(nx * 50)},${Math.round(ny * 50)},${Math.round(nz * 50)}`;
                let bucket = dirMap.get(pKey);
                if (!bucket) {
                    bucket = new Map();
                    dirMap.set(pKey, bucket);
                }
                if (!bucket.has(nKey)) {
                    bucket.set(nKey, [nx, ny, nz]);
                }
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
                const pKey = `${Math.round(posAttr.getX(i) * 2000)},${Math.round(posAttr.getY(i) * 2000)},${Math.round(posAttr.getZ(i) * 2000)}`;
                const [ox, oy, oz] = avgMap.get(pKey)!;
                posAttr.setXYZ(
                    i,
                    posAttr.getX(i) + ox * thickness,
                    posAttr.getY(i) + oy * thickness,
                    posAttr.getZ(i) + oz * thickness
                );
            }
            const m = new THREE.Mesh(outlineGeo, inkOutlineMat);
            m.renderOrder = -1;
            return m;
        };

        const addOutlinedMesh = (
            parent: THREE.Object3D,
            geo: THREE.BufferGeometry,
            mat: THREE.Material | THREE.Material[],
            outlineThickness: number,
            pos?: [number, number, number],
            rot?: [number, number, number],
            scl?: [number, number, number]
        ): THREE.Mesh => {
            const holder = new THREE.Group();
            if (pos) holder.position.set(pos[0], pos[1], pos[2]);
            if (rot) holder.rotation.set(rot[0], rot[1], rot[2]);
            if (scl) holder.scale.set(scl[0], scl[1], scl[2]);
            const mesh = new THREE.Mesh(geo, mat);
            const out = makeSmoothOutline(geo, outlineThickness);
            holder.add(mesh, out);
            parent.add(holder);
            return mesh;
        };

        const createRoundedRectShape = (w: number, h: number, r: number): THREE.Shape => {
            const hw = w * 0.5;
            const hh = h * 0.5;
            const cr = Math.min(r, hw * 0.9, hh * 0.9);
            const s = new THREE.Shape();
            s.moveTo(-hw + cr, -hh);
            s.lineTo(hw - cr, -hh);
            s.quadraticCurveTo(hw, -hh, hw, -hh + cr);
            s.lineTo(hw, hh - cr);
            s.quadraticCurveTo(hw, hh, hw - cr, hh);
            s.lineTo(-hw + cr, hh);
            s.quadraticCurveTo(-hw, hh, -hw, hh - cr);
            s.lineTo(-hw, -hh + cr);
            s.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
            s.closePath();
            return s;
        };

        const applyBoundsUVs = (geo: THREE.BufferGeometry, flipU = false) => {
            geo.computeBoundingBox();
            const bb = geo.boundingBox!;
            const sx = Math.max(1e-4, bb.max.x - bb.min.x);
            const sy = Math.max(1e-4, bb.max.y - bb.min.y);
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                const rawU = (pos.getX(i) - bb.min.x) / sx;
                uvs[i * 2] = flipU ? 1.0 - rawU : rawU;
                uvs[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        // 4-Band Nearest-Filtered Cel-Shading Gradient Ramp for Authentic 2D/3D Comic Book Illustration Shading
        const celRampData = new Uint8Array([
            148, 156, 168, 255, // Deep cool slate-blue comic shadow
            188, 195, 205, 255, // Mid-shadow gouache tone
            226, 231, 238, 255, // Clean lit comic off-white
            252, 253, 255, 255  // Crisp comic key-light highlight
        ]);
        const celGradientTex = new THREE.DataTexture(celRampData, 4, 1, THREE.RGBAFormat);
        celGradientTex.minFilter = THREE.NearestFilter;
        celGradientTex.magFilter = THREE.NearestFilter;
        celGradientTex.generateMipmaps = false;
        celGradientTex.needsUpdate = true;

        // Shared Cel-Shaded Comic Toon + Physical Visor Materials
        const suitFabricMat = new THREE.MeshToonMaterial({
            color: 0xf6f8fb,
            map: this.textures.astroSuitFabricTex,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.08
        });
        const helmetShellMat = new THREE.MeshToonMaterial({
            color: 0xf8fafc,
            map: this.textures.astroHelmetShellTex,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.08
        });
        const visorGlassMat = new THREE.MeshPhysicalMaterial({
            map: this.textures.astroVisorTex,
            emissive: 0xffffff,
            emissiveMap: this.textures.astroVisorTex,
            emissiveIntensity: 0.24,
            roughness: 0.10,
            metalness: 0.12,
            clearcoat: 1.0,
            clearcoatRoughness: 0.06
        });
        const armorGreyMat = new THREE.MeshToonMaterial({
            color: 0xc5ced8,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.08
        });
        const bezelMetalMat = new THREE.MeshToonMaterial({
            color: 0x9aa5b1,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.09
        });
        const darkStrapMat = new THREE.MeshToonMaterial({
            color: 0x515c68,
            gradientMap: celGradientTex,
            emissive: 0x0f172a,
            emissiveIntensity: 0.08
        });
        const wristRingMat = new THREE.MeshToonMaterial({
            color: 0x748ba3,
            gradientMap: celGradientTex,
            emissive: 0x172554,
            emissiveIntensity: 0.10
        });
        const tanPatchMat = new THREE.MeshToonMaterial({
            color: 0xd6c08f,
            gradientMap: celGradientTex,
            emissive: 0x453214,
            emissiveIntensity: 0.08
        });
        const bootSoleMat = new THREE.MeshToonMaterial({
            color: 0x5c6877,
            gradientMap: celGradientTex,
            emissive: 0x0f172a,
            emissiveIntensity: 0.08
        });
        const hoseBodyMat = new THREE.MeshToonMaterial({
            color: 0xbcc6d0,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.08
        });
        const chestBoxFaceMat = new THREE.MeshToonMaterial({
            map: this.textures.astroChestBoxTex,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.09
        });
        const backpackFaceMat = new THREE.MeshToonMaterial({
            map: this.textures.astroBackpackPanelTex,
            gradientMap: celGradientTex,
            emissive: 0x1e293b,
            emissiveIntensity: 0.09
        });
        const flagPatchMat = new THREE.MeshToonMaterial({
            map: this.textures.astroPatchFlagTex,
            gradientMap: celGradientTex
        });
        const missionPatchMat = new THREE.MeshToonMaterial({
            map: this.textures.astroPatchMissionTex,
            gradientMap: celGradientTex
        });

        const makePortMat = (hex: number) =>
            new THREE.MeshToonMaterial({
                color: hex,
                gradientMap: celGradientTex,
                emissive: hex,
                emissiveIntensity: 0.12
            });

        // Sculptural Helper A: Organic asymmetric 3D cloth-fold vertex displacement (periodic in angle so lathe seam stays watertight!)
        const sculptOrganicClothFolds = (
            geo: THREE.BufferGeometry,
            yMin: number,
            yMax: number,
            ampRadial: number,
            freqY: number,
            phaseSeed: number
        ) => {
            const pos = geo.attributes.position;
            const spanY = Math.max(1e-4, yMax - yMin);
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
                const r = Math.hypot(x, z);
                if (r < 0.025) continue; // Keep end caps flat & watertight
                const ny = Math.max(0, Math.min(1, (y - yMin) / spanY));
                const endFade = Math.sin(Math.PI * ny);
                const ang = Math.atan2(z, x);
                const diagWave1 = Math.sin(ny * freqY * Math.PI * 2 + Math.sin(ang + phaseSeed) * 1.65);
                const diagWave2 = Math.cos(ny * (freqY * 1.5) * Math.PI * 2 - Math.cos(2 * ang - phaseSeed) * 1.25);
                const dr = ampRadial * endFade * (0.65 * diagWave1 + 0.35 * diagWave2);
                const scaleR = (r + dr) / r;
                pos.setXYZ(i, x * scaleR, y + dr * 0.18 * Math.sin(ang * 2), z * scaleR);
            }
            geo.computeVertexNormals();
        };

        // Sculptural Helper B: Tapered 3D Comic Pen Ink Stroke (sharp calligraphy tips at both ends, bold ink belly in center)
        const addTaperedInkStroke = (
            parent: THREE.Object3D,
            pts: THREE.Vector3[],
            maxRadius = 0.0072,
            tubularSegs = 14
        ) => {
            const curve = new THREE.CatmullRomCurve3(pts);
            const frames = curve.computeFrenetFrames(tubularSegs, false);
            const radialSegs = 6;
            const vertices: number[] = [];
            const indices: number[] = [];

            for (let i = 0; i <= tubularSegs; i++) {
                const u = i / tubularSegs;
                const p = curve.getPointAt(u);
                const N = frames.normals[i];
                const B = frames.binormals[i];
                const r = maxRadius * Math.sin(Math.PI * u) ** 0.72;
                for (let j = 0; j <= radialSegs; j++) {
                    const v = (j / radialSegs) * Math.PI * 2;
                    const cosV = Math.cos(v);
                    const sinV = Math.sin(v);
                    vertices.push(
                        p.x + r * (cosV * N.x + sinV * B.x),
                        p.y + r * (cosV * N.y + sinV * B.y),
                        p.z + r * (cosV * N.z + sinV * B.z)
                    );
                }
            }
            const stride = radialSegs + 1;
            for (let i = 0; i < tubularSegs; i++) {
                for (let j = 0; j < radialSegs; j++) {
                    const a = i * stride + j;
                    const b = (i + 1) * stride + j;
                    const c = (i + 1) * stride + (j + 1);
                    const d = i * stride + (j + 1);
                    indices.push(a, b, d, b, c, d);
                }
            }
            const strokeGeo = new THREE.BufferGeometry();
            strokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            strokeGeo.setIndex(indices);
            strokeGeo.computeVertexNormals();
            parent.add(new THREE.Mesh(strokeGeo, darkInkSolidMat));
        };

        // Sculptural Helper C: True Scalloped Corrugated Bellows Hose Geometry
        const buildCorrugatedHoseGeo = (
            curve: THREE.CatmullRomCurve3,
            tubularSegs: number,
            radialSegs: number,
            baseR: number,
            waveAmp: number,
            waveCount: number
        ): THREE.BufferGeometry => {
            const frames = curve.computeFrenetFrames(tubularSegs, false);
            const vertices: number[] = [];
            const uvs: number[] = [];
            const indices: number[] = [];

            for (let i = 0; i <= tubularSegs; i++) {
                const u = i / tubularSegs;
                const p = curve.getPointAt(u);
                const N = frames.normals[i];
                const B = frames.binormals[i];
                const endEnvelope = Math.sin(Math.PI * u) ** 0.45;
                const r = baseR + waveAmp * endEnvelope * Math.cos(u * waveCount * Math.PI * 2);
                for (let j = 0; j <= radialSegs; j++) {
                    const vFrac = j / radialSegs;
                    const v = vFrac * Math.PI * 2;
                    const cosV = Math.cos(v);
                    const sinV = Math.sin(v);
                    vertices.push(
                        p.x + r * (cosV * N.x + sinV * B.x),
                        p.y + r * (cosV * N.y + sinV * B.y),
                        p.z + r * (cosV * N.z + sinV * B.z)
                    );
                    uvs.push(u, vFrac);
                }
            }
            const stride = radialSegs + 1;
            for (let i = 0; i < tubularSegs; i++) {
                for (let j = 0; j < radialSegs; j++) {
                    const a = i * stride + j;
                    const b = (i + 1) * stride + j;
                    const c = (i + 1) * stride + (j + 1);
                    const d = i * stride + (j + 1);
                    indices.push(a, b, d, b, c, d);
                }
            }
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            g.setIndex(indices);
            g.computeVertexNormals();
            return g;
        };

        const rivetDotGeo = new THREE.SphereGeometry(0.0105, 8, 6);
        const bezelRivetGeo = new THREE.SphereGeometry(0.0125, 8, 6);

        // =====================================================================
        // 1. MULTI-TIERED METALLIC NECK COLLAR & ZERO-CLIP CHIBI BUBBLE HELMET
        //    (Positioned with strict 3D clearance above PLSS backpack top Y=+0.374!)
        // =====================================================================
        const neckCollarGroup = new THREE.Group();
        neckCollarGroup.position.set(0, 0.348, -0.032);
        root.add(neckCollarGroup);

        // Lower Suit Disconnect Flange Ring + Rivets
        const neckBaseRingGeo = new THREE.TorusGeometry(0.286, 0.028, 12, 32);
        neckBaseRingGeo.rotateX(Math.PI / 2);
        addOutlinedMesh(neckCollarGroup, neckBaseRingGeo, bezelMetalMat, 0.016, [0, 0, 0], undefined, [1.08, 1.0, 0.96]);
        for (let nr = 0; nr < 12; nr++) {
            const na = (nr * Math.PI * 2) / 12;
            const nrv = new THREE.Mesh(rivetDotGeo, darkInkSolidMat);
            nrv.position.set(Math.cos(na) * 0.312 * 1.08, 0.012, Math.sin(na) * 0.312 * 0.96);
            neckCollarGroup.add(nrv);
        }

        // Visible Dark Metallic Neck Seal Cylinder (Clearly visible between Helmet & Backpack in Back View AEspaldas.jpeg!)
        const neckSealCylGeo = new THREE.CylinderGeometry(0.278, 0.286, 0.054, 30);
        addOutlinedMesh(neckCollarGroup, neckSealCylGeo, darkStrapMat, 0.016, [0, 0.028, 0], undefined, [1.06, 1.0, 0.95]);

        // Upper Helmet Locking Ring
        const neckTopRingGeo = new THREE.TorusGeometry(0.296, 0.029, 12, 32);
        neckTopRingGeo.rotateX(Math.PI / 2);
        addOutlinedMesh(neckCollarGroup, neckTopRingGeo, bezelMetalMat, 0.017, [0, 0.054, 0], undefined, [1.08, 1.0, 0.97]);

        // Articulated Helmet Group pivoted cleanly at the Upper Locking Ring (Y = 0.402, Z = -0.034)
        const helmet = new THREE.Group();
        helmet.position.set(0, 0.402, -0.034);
        root.add(helmet);

        // Truncated Spherical Helmet Shell (terminates cleanly at neck ring theta = 0.835*PI -> zero downward poke!)
        const helmetCenterY = 0.432;
        const rxH = 0.546;
        const ryH = 0.486;
        const rzH = 0.496;
        const helmetSphereGeo = new THREE.SphereGeometry(1.0, 44, 34, 0, Math.PI * 2, 0, Math.PI * 0.835);
        helmetSphereGeo.scale(rxH, ryH, rzH);
        addOutlinedMesh(helmet, helmetSphereGeo, helmetShellMat, 0.029, [0, helmetCenterY, 0]);

        // Watertight dark interior neck-cap disc inside bottom of truncated sphere
        const helmetBottomCap = new THREE.Mesh(new THREE.CircleGeometry(0.27, 28), darkStrapMat);
        helmetBottomCap.rotation.x = Math.PI / 2;
        helmetBottomCap.position.set(0, 0.012, 0);
        helmet.add(helmetBottomCap);

        // Twin Curved Riveted Panel Seams (terminate cleanly at visor top brow in Front & neck collar in Back!)
        for (const side of [-1, 1]) {
            const seamX = side * 0.205;
            const seamPts: THREE.Vector3[] = [];
            const steps = 26;
            // theta = -0.52 (right at top outer edge of visor bezel!) -> +2.48 (right at back neck locking ring!)
            for (let s = 0; s <= steps; s++) {
                const theta = -0.52 + (s / steps) * 3.00;
                const rem = Math.sqrt(Math.max(0.05, 1 - (seamX / rxH) * (seamX / rxH)));
                const py = helmetCenterY + Math.cos(theta) * ryH * rem * 1.006;
                const pz = Math.sin(theta) * rzH * rem * 1.006;
                seamPts.push(new THREE.Vector3(seamX, py, pz));

                if (s >= 1 && s <= steps - 1 && s % 2 === 1) {
                    const rv = new THREE.Mesh(rivetDotGeo, darkInkSolidMat);
                    rv.position.set(seamX + side * 0.026, py, pz);
                    helmet.add(rv);
                }
            }
            const seamCurve = new THREE.CatmullRomCurve3(seamPts);
            const seamTubeGeo = new THREE.TubeGeometry(seamCurve, 28, 0.0072, 6, false);
            helmet.add(new THREE.Mesh(seamTubeGeo, darkInkSolidMat));
        }

        // Stepped Dual-Tier Ear-Comm Pods (Base Mounting Flange + Beveled Comm Cap + Central Ink Seam)
        const earBaseGeo = new THREE.CylinderGeometry(0.132, 0.136, 0.055, 22);
        earBaseGeo.rotateZ(Math.PI / 2);
        const earCapGeo = new THREE.CylinderGeometry(0.112, 0.124, 0.095, 22);
        earCapGeo.rotateZ(Math.PI / 2);
        const earSeamGeo = new THREE.TorusGeometry(0.120, 0.0072, 6, 22);
        earSeamGeo.rotateY(Math.PI / 2);
        for (const side of [-1, 1]) {
            addOutlinedMesh(
                helmet,
                earBaseGeo,
                bezelMetalMat,
                0.020,
                [side * 0.518, helmetCenterY - 0.022, 0.01],
                undefined,
                [1.0, 1.15, 0.92]
            );
            addOutlinedMesh(
                helmet,
                earCapGeo,
                armorGreyMat,
                0.022,
                [side * 0.558, helmetCenterY - 0.022, 0.01],
                [0, 0, side === 1 ? 0 : Math.PI],
                [1.0, 1.12, 0.90]
            );
            const earSeam = new THREE.Mesh(earSeamGeo, darkInkSolidMat);
            earSeam.position.set(side * 0.562, helmetCenterY - 0.022, 0.01);
            earSeam.scale.set(0.90, 1.13, 1.0);
            helmet.add(earSeam);
        }

        // Front Visor Assembly (-Z face of helmet — Dual-Rim Riveted Bezel + Glossy Clearcoat Bubble Glass)
        const visorGroup = new THREE.Group();
        visorGroup.position.set(0, helmetCenterY - 0.018, -0.268);
        visorGroup.rotation.x = 0.04;
        helmet.add(visorGroup);

        // Outer Metallic Bezel Ring flush with helmet shell
        const visorBezelGeo = new THREE.TorusGeometry(0.376, 0.048, 16, 48);
        visorBezelGeo.scale(1.09, 0.96, 0.76);
        addOutlinedMesh(visorGroup, visorBezelGeo, bezelMetalMat, 0.022);

        // Inner Dark Rubber Gasket Ring framing the glass dome
        const visorGasketGeo = new THREE.TorusGeometry(0.342, 0.018, 10, 44);
        visorGasketGeo.scale(1.09, 0.96, 0.65);
        const visorGasket = new THREE.Mesh(visorGasketGeo, darkInkSolidMat);
        visorGasket.position.z = -0.022;
        visorGroup.add(visorGasket);

        // 18 Crisp Rivets around the metallic visor bezel
        for (let i = 0; i < 18; i++) {
            const a = (i * Math.PI * 2) / 18;
            const rv = new THREE.Mesh(bezelRivetGeo, darkInkSolidMat);
            rv.position.set(Math.cos(a) * 0.376 * 1.09, Math.sin(a) * 0.376 * 0.96, -0.036);
            visorGroup.add(rv);
        }

        // Domed Iridescent Teal-Cyan Bubble Visor Glass
        const visorCapGeo = new THREE.SphereGeometry(0.372, 40, 30, 0, Math.PI * 2, 0, Math.PI * 0.47);
        visorCapGeo.rotateX(-Math.PI / 2);
        visorCapGeo.scale(1.09, 0.96, 0.78);
        applyBoundsUVs(visorCapGeo, true);
        const visorMesh = new THREE.Mesh(visorCapGeo, visorGlassMat);
        visorMesh.position.z = 0.010;
        visorGroup.add(visorMesh);

        // =====================================================================
        // 2. ORGANICALLY SCULPTED SPACE-SUIT TORSO, HARNESSES & FRONT DCM MODULE
        // =====================================================================
        const torsoPoints = [
            new THREE.Vector2(0.001, -0.355),
            new THREE.Vector2(0.275, -0.345),
            new THREE.Vector2(0.378, -0.250),
            new THREE.Vector2(0.405, -0.140),
            new THREE.Vector2(0.394, -0.055),
            new THREE.Vector2(0.412, 0.035),
            new THREE.Vector2(0.398, 0.145),
            new THREE.Vector2(0.398, 0.240),
            new THREE.Vector2(0.348, 0.315),
            new THREE.Vector2(0.275, 0.355),
            new THREE.Vector2(0.001, 0.362)
        ];
        const torsoGeo = new THREE.LatheGeometry(torsoPoints, 38);
        sculptOrganicClothFolds(torsoGeo, -0.355, 0.362, 0.010, 3.0, 0.7);
        torsoGeo.scale(1.11, 1.0, 0.77);
        addOutlinedMesh(root, torsoGeo, suitFabricMat, 0.027);

        // Front Belly & Back Seat Comic Ink Crease Strokes (matching Flotando.jpeg & AEspaldas.jpeg!)
        addTaperedInkStroke(
            root,
            [
                new THREE.Vector3(-0.18, -0.21, -0.295),
                new THREE.Vector3(-0.09, -0.23, -0.312),
                new THREE.Vector3(-0.03, -0.22, -0.316)
            ],
            0.0062
        );
        addTaperedInkStroke(
            root,
            [
                new THREE.Vector3(0.03, -0.22, -0.316),
                new THREE.Vector3(0.09, -0.23, -0.312),
                new THREE.Vector3(0.18, -0.21, -0.295)
            ],
            0.0062
        );
        // Back Pelvis Vertical Seat Seam + Horizontal Seat Crease below PLSS (AEspaldas.jpeg!)
        addTaperedInkStroke(
            root,
            [
                new THREE.Vector3(0, -0.23, 0.295),
                new THREE.Vector3(0, -0.29, 0.275),
                new THREE.Vector3(0, -0.345, 0.220)
            ],
            0.0068
        );
        addTaperedInkStroke(
            root,
            [
                new THREE.Vector3(-0.16, -0.265, 0.272),
                new THREE.Vector3(0, -0.280, 0.285),
                new THREE.Vector3(0.16, -0.265, 0.272)
            ],
            0.0058
        );

        // Front Center Belly Zipper Track (-Z)
        const zipperStripGeo = new THREE.BoxGeometry(0.024, 0.20, 0.018);
        const zipperStrip = new THREE.Mesh(zipperStripGeo, armorGreyMat);
        zipperStrip.position.set(0, -0.09, -0.312);
        root.add(zipperStrip);
        const zipTickGeo = new THREE.BoxGeometry(0.038, 0.008, 0.022);
        for (let zt = 0; zt < 7; zt++) {
            const tick = new THREE.Mesh(zipTickGeo, darkInkSolidMat);
            tick.position.set(0, -0.17 + zt * 0.028, -0.316);
            root.add(tick);
        }

        // Front Trapezoidal Groin Armor Plate (-Z)
        const groinShape = new THREE.Shape();
        groinShape.moveTo(-0.115, 0.075);
        groinShape.lineTo(0.115, 0.075);
        groinShape.lineTo(0.068, -0.075);
        groinShape.lineTo(-0.068, -0.075);
        groinShape.closePath();
        const groinGeo = new THREE.ExtrudeGeometry(groinShape, {
            depth: 0.048,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.012,
            bevelThickness: 0.012
        });
        groinGeo.translate(0, 0, -0.024);
        addOutlinedMesh(root, groinGeo, armorGreyMat, 0.018, [0, -0.245, -0.288]);
        for (const gx of [-0.078, 0.078]) {
            const grv = new THREE.Mesh(bezelRivetGeo, darkInkSolidMat);
            grv.position.set(gx, -0.195, -0.324);
            root.add(grv);
        }

        // V-Shaped Leg Harness Straps wrapping from front groin around hips to back pelvis (Front & Back!)
        for (const side of [-1, 1]) {
            const legStrapCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(side * 0.065, -0.305, -0.272),
                new THREE.Vector3(side * 0.278, -0.215, -0.235),
                new THREE.Vector3(side * 0.425, -0.150, 0.0),
                new THREE.Vector3(side * 0.285, -0.220, 0.238),
                new THREE.Vector3(side * 0.055, -0.315, 0.252)
            ]);
            const legStrapGeo = new THREE.TubeGeometry(legStrapCurve, 22, 0.025, 8, false);
            addOutlinedMesh(root, legStrapGeo, darkStrapMat, 0.013);
        }

        // Two Riveted Grey Shoulder Harness Straps curving over sloped shoulders cleanly into PLSS top!
        for (const side of [-1, 1]) {
            const shCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(side * 0.266, 0.015, -0.302),
                new THREE.Vector3(side * 0.280, 0.205, -0.278),
                new THREE.Vector3(side * 0.276, 0.358, -0.025),
                new THREE.Vector3(side * 0.276, 0.285, 0.195)
            ]);
            const shGeo = new THREE.TubeGeometry(shCurve, 22, 0.033, 8, false);
            addOutlinedMesh(root, shGeo, bezelMetalMat, 0.015);

            for (const tFrac of [0.11, 0.28, 0.45]) {
                const pt = shCurve.getPoint(tFrac);
                const srv = new THREE.Mesh(bezelRivetGeo, darkInkSolidMat);
                srv.position.set(pt.x, pt.y, pt.z - 0.032);
                root.add(srv);
            }

            // Angled V-Suspension Strap from Neck Collar down into top of Chest DCM Module (Flotando.jpeg!)
            const neckVStrap = new THREE.CatmullRomCurve3([
                new THREE.Vector3(side * 0.165, 0.342, -0.215),
                new THREE.Vector3(side * 0.125, 0.275, -0.275),
                new THREE.Vector3(side * 0.095, 0.215, -0.318)
            ]);
            addOutlinedMesh(root, new THREE.TubeGeometry(neckVStrap, 10, 0.014, 6, false), darkStrapMat, 0.008);
        }

        // Chest Utility Pocket Flap (+X) & Stitched Tan Repair Patch (-X)
        addOutlinedMesh(
            root,
            new THREE.BoxGeometry(0.088, 0.042, 0.018),
            suitFabricMat,
            0.009,
            [0.215, 0.095, -0.300],
            [0, -0.18, 0.05]
        );
        addOutlinedMesh(
            root,
            new THREE.BoxGeometry(0.064, 0.068, 0.020),
            tanPatchMat,
            0.010,
            [-0.222, 0.175, -0.298],
            [0, 0.22, -0.10]
        );

        // Front Chest DCM Control Box (-Z) — Detailed 3D Instrument Relief!
        const dcmGroup = new THREE.Group();
        dcmGroup.position.set(0, 0.110, -0.334);
        dcmGroup.rotation.y = Math.PI;
        root.add(dcmGroup);

        const dcmShape = createRoundedRectShape(0.38, 0.245, 0.026);
        const dcmGeo = new THREE.ExtrudeGeometry(dcmShape, {
            depth: 0.086,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.014,
            bevelThickness: 0.014
        });
        dcmGeo.translate(0, 0, -0.043);
        applyBoundsUVs(dcmGeo, false);
        addOutlinedMesh(dcmGroup, dcmGeo, [chestBoxFaceMat, armorGreyMat], 0.020);

        // 3D Cobalt-Blue Pressure Dial + Metallic Rim + Diagonal Pointer Bar (matching Flotando.jpeg!)
        const dcmGaugeGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.022, 20);
        dcmGaugeGeo.rotateX(Math.PI / 2);
        addOutlinedMesh(dcmGroup, dcmGaugeGeo, makePortMat(0x3b6ea5), 0.011, [-0.088, 0.030, 0.055]);
        const dcmNeedleBar = new THREE.BoxGeometry(0.116, 0.016, 0.014);
        addOutlinedMesh(dcmGroup, dcmNeedleBar, bezelMetalMat, 0.007, [-0.088, 0.030, 0.068], [0, 0, 0.62]);

        // 3D Crimson Rocker Switch, Framed Olive LCD Readout & Knurled Rotary Knob
        addOutlinedMesh(dcmGroup, new THREE.BoxGeometry(0.114, 0.034, 0.020), makePortMat(0xc84239), 0.010, [-0.088, -0.062, 0.054]);
        addOutlinedMesh(dcmGroup, new THREE.BoxGeometry(0.096, 0.044, 0.014), makePortMat(0x7e906b), 0.009, [0.090, 0.055, 0.052]);
        const dcmKnobGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.024, 18);
        dcmKnobGeo.rotateX(Math.PI / 2);
        addOutlinedMesh(dcmGroup, dcmKnobGeo, darkStrapMat, 0.010, [0.092, -0.038, 0.056]);
        const dcmKnobNotch = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.048, 0.012), darkInkSolidMat);
        dcmKnobNotch.position.set(0.092, -0.038, 0.070);
        dcmGroup.add(dcmKnobNotch);

        // =====================================================================
        // 3. SCULPTED PLSS LIFE-SUPPORT BACKPACK (+Z HERO BACK VIEW — AEspaldas.jpeg)
        //    Shoulder-to-Waist Proportions (Y in [-0.346, +0.376]) -> Corners peek in Front, ZERO Helmet Clipping!
        // =====================================================================
        const backpack = new THREE.Group();
        backpack.position.set(0, 0.015, 0.312);
        root.add(backpack);

        const plssShape = createRoundedRectShape(0.80, 0.655, 0.074);
        const plssGeo = new THREE.ExtrudeGeometry(plssShape, {
            depth: 0.23,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.034,
            bevelThickness: 0.034
        });
        plssGeo.translate(0, 0, -0.115);
        applyBoundsUVs(plssGeo, false);
        addOutlinedMesh(backpack, plssGeo, suitFabricMat, 0.026);

        // Upper Cap Seam Bar & Twin Vertical Riveted Panel Seams on PLSS Back (+Z)
        const plssBackZ = 0.151;
        const capSeamBar = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.012, 0.012), darkInkSolidMat);
        capSeamBar.position.set(0, 0.165, plssBackZ);
        backpack.add(capSeamBar);

        for (const side of [-1, 1]) {
            const vSeam = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.185, 0.012), darkInkSolidMat);
            vSeam.position.set(side * 0.195, 0.258, plssBackZ);
            backpack.add(vSeam);
            for (let rIdx = 0; rIdx < 4; rIdx++) {
                const rv = new THREE.Mesh(rivetDotGeo, darkInkSolidMat);
                rv.position.set(side * 0.220, 0.192 + rIdx * 0.042, plssBackZ + 0.004);
                backpack.add(rv);
            }
        }

        // Top-Center Slate Vent / Status Badge & Small Tan Seam Tab (AEspaldas.jpeg)
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.155, 0.056, 0.022),
            darkStrapMat,
            0.012,
            [0, 0.258, plssBackZ + 0.006]
        );
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.054, 0.024, 0.016),
            tanPatchMat,
            0.008,
            [-0.245, 0.190, plssBackZ + 0.005]
        );

        // Central Raised Backpack Telemetry Control Box (Group 0 = textured panel face, Group 1 = bevel)
        const teleShape = createRoundedRectShape(0.325, 0.355, 0.026);
        const teleGeo = new THREE.ExtrudeGeometry(teleShape, {
            depth: 0.070,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.013,
            bevelThickness: 0.013
        });
        teleGeo.translate(0, 0, -0.035);
        applyBoundsUVs(teleGeo, false);
        addOutlinedMesh(
            backpack,
            teleGeo,
            [backpackFaceMat, armorGreyMat],
            0.019,
            [0, -0.030, plssBackZ + 0.036]
        );

        // 3D Raised Sub-Modules on Central Telemetry Box (matching AEspaldas.jpeg relief!)
        const teleFrontZ = plssBackZ + 0.084;
        // Top-left brushed steel slot + vertical slit
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.058, 0.096, 0.018),
            bezelMetalMat,
            0.009,
            [-0.076, 0.078, teleFrontZ]
        );
        const slotSlit = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.068, 0.010), darkInkSolidMat);
        slotSlit.position.set(-0.076, 0.078, teleFrontZ + 0.008);
        backpack.add(slotSlit);

        // Top-right olive-brass indicator & mid-right slate module
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.066, 0.048, 0.016),
            makePortMat(0x9f995c),
            0.009,
            [0.076, 0.086, teleFrontZ]
        );
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.062, 0.074, 0.016),
            makePortMat(0x536f86),
            0.009,
            [0.078, -0.004, teleFrontZ]
        );

        // Bottom-left glazed sky-blue telemetry screen + diagonal glass glint streaks
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.116, 0.064, 0.015),
            makePortMat(0x5e89a8),
            0.009,
            [-0.058, -0.126, teleFrontZ]
        );
        const screenGlint = new THREE.Mesh(
            new THREE.BoxGeometry(0.052, 0.010, 0.006),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
        );
        screenGlint.position.set(-0.064, -0.124, teleFrontZ + 0.009);
        screenGlint.rotation.z = 0.65;
        backpack.add(screenGlint);

        // Lower Recessed Waist Plate below Telemetry Box
        addOutlinedMesh(
            backpack,
            new THREE.BoxGeometry(0.240, 0.056, 0.022),
            armorGreyMat,
            0.012,
            [0, -0.285, plssBackZ + 0.006]
        );
        for (const lx of [-0.095, 0.095]) {
            const lrv = new THREE.Mesh(rivetDotGeo, darkInkSolidMat);
            lrv.position.set(lx, -0.285, plssBackZ + 0.019);
            backpack.add(lrv);
        }

        // Upper-Right Stepped Circular Grommet + 4 Segmented Braided Looping Cables into Central Box (AEspaldas.jpeg!)
        const grommetGeo = new THREE.CylinderGeometry(0.044, 0.050, 0.028, 18);
        grommetGeo.rotateX(Math.PI / 2);
        addOutlinedMesh(backpack, grommetGeo, bezelMetalMat, 0.012, [0.272, 0.228, plssBackZ + 0.008]);

        const cableRibGeo = new THREE.TorusGeometry(0.0145, 0.0036, 5, 10);
        const cableZAxis = new THREE.Vector3(0, 0, 1);
        const addBackpackBraidedCable = (pts: THREE.Vector3[]) => {
            const cCurve = new THREE.CatmullRomCurve3(pts);
            const cGeo = new THREE.TubeGeometry(cCurve, 18, 0.013, 8, false);
            addOutlinedMesh(backpack, cGeo, darkStrapMat, 0.008);
            for (let b = 1; b <= 6; b++) {
                const u = b / 7;
                const cp = cCurve.getPoint(u);
                const ct = cCurve.getTangent(u).normalize();
                const crib = new THREE.Mesh(cableRibGeo, darkInkSolidMat);
                crib.position.copy(cp);
                crib.quaternion.setFromUnitVectors(cableZAxis, ct);
                backpack.add(crib);
            }
        };

        addBackpackBraidedCable([
            new THREE.Vector3(0.272, 0.228, plssBackZ + 0.020),
            new THREE.Vector3(0.312, 0.125, plssBackZ + 0.044),
            new THREE.Vector3(0.248, 0.048, plssBackZ + 0.046),
            new THREE.Vector3(0.158, 0.032, plssBackZ + 0.038)
        ]);
        addBackpackBraidedCable([
            new THREE.Vector3(0.258, 0.214, plssBackZ + 0.020),
            new THREE.Vector3(0.278, 0.128, plssBackZ + 0.034),
            new THREE.Vector3(0.222, 0.078, plssBackZ + 0.038),
            new THREE.Vector3(0.158, 0.072, plssBackZ + 0.038)
        ]);
        addBackpackBraidedCable([
            new THREE.Vector3(-0.268, 0.162, plssBackZ + 0.012),
            new THREE.Vector3(-0.278, 0.088, plssBackZ + 0.040),
            new THREE.Vector3(-0.225, 0.042, plssBackZ + 0.044),
            new THREE.Vector3(-0.158, 0.038, plssBackZ + 0.038)
        ]);
        addBackpackBraidedCable([
            new THREE.Vector3(-0.236, 0.162, plssBackZ + 0.012),
            new THREE.Vector3(-0.242, 0.100, plssBackZ + 0.034),
            new THREE.Vector3(-0.200, 0.076, plssBackZ + 0.038),
            new THREE.Vector3(-0.158, 0.076, plssBackZ + 0.038)
        ]);

        // =====================================================================
        // 4. FOUR CLEAN CEL-SHADED SILVER-GREY RIBBED HOSES & STEPPED PORT COLLARS
        // =====================================================================
        const portBaseGeo = new THREE.CylinderGeometry(0.066, 0.072, 0.024, 18);
        portBaseGeo.rotateX(Math.PI / 2);
        const portNozzleGeo = new THREE.CylinderGeometry(0.048, 0.058, 0.048, 18);
        portNozzleGeo.rotateX(Math.PI / 2);
        const hoseValleyRingGeo = new THREE.TorusGeometry(0.038, 0.0052, 6, 16);

        const addWrapAroundRibbedHose = (
            side: -1 | 1,
            yBack: number,
            yMidDrop: number,
            yFront: number,
            flankX: number,
            backPortHex: number,
            frontPortHex: number
        ) => {
            const backMat = makePortMat(backPortHex);
            const frontMat = makePortMat(frontPortHex);
            const pBack = new THREE.Vector3(side * 0.232, yBack, 0.466);
            const pFront = new THREE.Vector3(side * 0.202, yFront, -0.318);

            // Sweeping outward U-loop past waist flanks so silver-grey ribbed hoses shine in BOTH Front & Back views!
            const curve = new THREE.CatmullRomCurve3([
                pBack,
                new THREE.Vector3(side * (flankX - 0.03), yBack - 0.072, 0.392),
                new THREE.Vector3(side * flankX, yMidDrop, 0.06),
                new THREE.Vector3(side * (flankX - 0.025), yFront - 0.072, -0.248),
                pFront
            ]);

            // Smooth plump core tube + non-self-intersecting smooth black outline + subtle gentle bellows front mesh
            const smoothOutlineBaseGeo = new THREE.TubeGeometry(curve, 38, 0.036, 12, false);
            const bellowsFrontGeo = buildCorrugatedHoseGeo(curve, 76, 14, 0.036, 0.0024, 14);
            const hoseGroup = new THREE.Group();
            hoseGroup.add(new THREE.Mesh(bellowsFrontGeo, hoseBodyMat));
            hoseGroup.add(makeSmoothOutline(smoothOutlineBaseGeo, 0.015));
            root.add(hoseGroup);

            const zAxis = new THREE.Vector3(0, 0, 1);
            for (let r = 1; r <= 13; r++) {
                const u = (r + 0.5) / 14;
                const pt = curve.getPointAt(u);
                const tan = curve.getTangentAt(u).normalize();
                const rib = new THREE.Mesh(hoseValleyRingGeo, darkInkSolidMat);
                rib.position.copy(pt);
                rib.quaternion.setFromUnitVectors(zAxis, tan);
                root.add(rib);
            }

            const buildSteppedPort = (pos: THREE.Vector3, lookPt: THREE.Vector3, colMat: THREE.Material) => {
                const pg = new THREE.Group();
                pg.position.copy(pos);
                pg.lookAt(lookPt);
                addOutlinedMesh(pg, portBaseGeo, bezelMetalMat, 0.013, [0, 0, -0.012]);
                addOutlinedMesh(pg, portNozzleGeo, colMat, 0.014, [0, 0, 0.016]);
                root.add(pg);
            };

            buildSteppedPort(pBack, curve.getPoint(0.10), backMat);
            buildSteppedPort(pFront, curve.getPoint(0.90), frontMat);
        };

        // Left Flank (-X): Cobalt Blue upper; Crimson Red on Back (-X screen-left) & Mustard Yellow on Front (-X screen-right)
        addWrapAroundRibbedHose(-1, -0.035, -0.130, -0.015, 0.552, 0x3569a8, 0x3569a8);
        addWrapAroundRibbedHose(-1, -0.165, -0.260, -0.140, 0.576, 0xc43c35, 0xdeb030);

        // Right Flank (+X): Cobalt Blue upper; Mustard Yellow on Back (+X screen-right) & Crimson Red on Front (+X screen-left)
        addWrapAroundRibbedHose(1, -0.035, -0.130, -0.015, 0.552, 0x3569a8, 0x3569a8);
        addWrapAroundRibbedHose(1, -0.165, -0.260, -0.140, 0.576, 0xdeb030, 0xc43c35);

        // =====================================================================
        // 5. SCULPTED PUFF-SLEEVED ARMS, PATCHES, ELBOW PADS & MULTI-JOINTED GLOVES
        // =====================================================================
        const upperArmPoints = [
            new THREE.Vector2(0.001, -0.32),
            new THREE.Vector2(0.142, -0.31),
            new THREE.Vector2(0.166, -0.24),
            new THREE.Vector2(0.154, -0.17),
            new THREE.Vector2(0.172, -0.09),
            new THREE.Vector2(0.156, -0.02),
            new THREE.Vector2(0.130, 0.04),
            new THREE.Vector2(0.001, 0.05)
        ];
        const upperArmGeo = new THREE.LatheGeometry(upperArmPoints, 28);
        sculptOrganicClothFolds(upperArmGeo, -0.32, 0.05, 0.0095, 2.5, 1.3);

        const forearmPoints = [
            new THREE.Vector2(0.001, -0.27),
            new THREE.Vector2(0.124, -0.26),
            new THREE.Vector2(0.150, -0.18),
            new THREE.Vector2(0.138, -0.11),
            new THREE.Vector2(0.154, -0.04),
            new THREE.Vector2(0.134, 0.02),
            new THREE.Vector2(0.001, 0.03)
        ];
        const forearmGeo = new THREE.LatheGeometry(forearmPoints, 28);
        sculptOrganicClothFolds(forearmGeo, -0.27, 0.03, 0.0085, 2.5, 2.4);

        const elbowPadShape = createRoundedRectShape(0.155, 0.155, 0.034);
        const elbowPadGeo = new THREE.ExtrudeGeometry(elbowPadShape, {
            depth: 0.040,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.010,
            bevelThickness: 0.010
        });
        elbowPadGeo.translate(0, 0, -0.020);

        const wristCollarGeo = new THREE.TorusGeometry(0.122, 0.024, 12, 26);
        wristCollarGeo.rotateX(Math.PI / 2);
        const wristStrapGeo = new THREE.TorusGeometry(0.114, 0.015, 10, 24);
        wristStrapGeo.rotateX(Math.PI / 2);

        const palmGeo = new THREE.CapsuleGeometry(0.088, 0.068, 8, 16);
        palmGeo.scale(1.22, 0.78, 0.68);
        const handPlateGeo = new THREE.BoxGeometry(0.146, 0.096, 0.028);
        const fingerProxGeo = new THREE.CapsuleGeometry(0.0235, 0.052, 5, 10);
        const fingerDistGeo = new THREE.CapsuleGeometry(0.0210, 0.048, 5, 10);
        const fingerJointRingGeo = new THREE.TorusGeometry(0.0225, 0.0038, 5, 10);
        fingerJointRingGeo.rotateX(Math.PI / 2);
        const thumbProxGeo = new THREE.CapsuleGeometry(0.027, 0.058, 5, 10);
        const thumbDistGeo = new THREE.CapsuleGeometry(0.023, 0.048, 5, 10);
        const patchGeo = new THREE.BoxGeometry(0.116, 0.086, 0.016);

        const buildArticulatedArm = (side: -1 | 1): THREE.Group => {
            const armPivot = new THREE.Group();
            armPivot.position.set(side * 0.408, 0.242, -0.01);
            armPivot.rotation.z = side * 0.90;

            addOutlinedMesh(armPivot, upperArmGeo, suitFabricMat, 0.024);

            // Tapered 3D comic pen creases in armpit / inner bicep (visible Front & Back!)
            for (const sZ of [-1, 1]) {
                addTaperedInkStroke(
                    armPivot,
                    [
                        new THREE.Vector3(-side * 0.148, -0.13, sZ * 0.06),
                        new THREE.Vector3(-side * 0.085, -0.17, sZ * 0.142),
                        new THREE.Vector3(side * 0.035, -0.19, sZ * 0.158)
                    ],
                    0.0066
                );
                addTaperedInkStroke(
                    armPivot,
                    [
                        new THREE.Vector3(-side * 0.140, -0.22, sZ * 0.05),
                        new THREE.Vector3(-side * 0.065, -0.245, sZ * 0.138),
                        new THREE.Vector3(side * 0.045, -0.255, sZ * 0.148)
                    ],
                    0.0060
                );
            }

            // Cylindrical-tangent Front-Top & Back-Top Shoulder Patches (flush with sleeve!)
            const addTangentSleevePatch = (sZ: -1 | 1, faceMat: THREE.Material) => {
                const alpha = 0.50;
                const nx = side * Math.cos(alpha);
                const nz = sZ * Math.sin(alpha);
                const holder = new THREE.Group();
                holder.position.set(nx * 0.168, -0.098, nz * 0.168);
                holder.rotation.order = 'YXZ';
                holder.rotation.y = Math.atan2(nx, nz);
                holder.rotation.x = 0.08;
                const mats = [tanPatchMat, tanPatchMat, tanPatchMat, tanPatchMat, faceMat, tanPatchMat];
                const mesh = new THREE.Mesh(patchGeo, mats);
                const out = makeSmoothOutline(patchGeo, 0.009);
                holder.add(mesh, out);
                armPivot.add(holder);
            };

            addTangentSleevePatch(-1, side === -1 ? flagPatchMat : missionPatchMat);
            addTangentSleevePatch(1, side === -1 ? missionPatchMat : tanPatchMat);

            // Gentle downward elbow curve
            const elbowPivot = new THREE.Group();
            elbowPivot.position.set(0, -0.295, 0);
            elbowPivot.rotation.z = -side * 0.26;
            elbowPivot.rotation.x = 0.06;
            armPivot.add(elbowPivot);

            addOutlinedMesh(
                elbowPivot,
                elbowPadGeo,
                armorGreyMat,
                0.015,
                [side * 0.03, -0.02, 0.146],
                [0.12, side * 0.22, 0]
            );

            addOutlinedMesh(elbowPivot, forearmGeo, suitFabricMat, 0.022);
            for (const sZ of [-1, 1]) {
                addTaperedInkStroke(
                    elbowPivot,
                    [
                        new THREE.Vector3(-side * 0.128, -0.10, sZ * 0.05),
                        new THREE.Vector3(-side * 0.055, -0.125, sZ * 0.132),
                        new THREE.Vector3(side * 0.045, -0.135, sZ * 0.138)
                    ],
                    0.0058
                );
            }

            // Stitched tan forearm repair patch sitting proudly outside cuff!
            if (side === -1) {
                addOutlinedMesh(
                    elbowPivot,
                    new THREE.BoxGeometry(0.062, 0.058, 0.022),
                    tanPatchMat,
                    0.010,
                    [-0.154, -0.165, -0.01],
                    [0, Math.PI * 0.5, 0.08]
                );
            }

            // Dual-Ring Metallic Wrist Disconnect Collar
            addOutlinedMesh(elbowPivot, wristCollarGeo, wristRingMat, 0.015, [0, -0.254, 0]);
            addOutlinedMesh(elbowPivot, wristStrapGeo, darkStrapMat, 0.012, [0, -0.278, 0]);

            // Multi-Jointed Curved 5-Fingered Comic Space Gauntlet
            const gloveGroup = new THREE.Group();
            gloveGroup.position.set(0, -0.348, 0);
            gloveGroup.rotation.z = -side * 0.22;
            elbowPivot.add(gloveGroup);

            addOutlinedMesh(gloveGroup, palmGeo, suitFabricMat, 0.019);
            addOutlinedMesh(gloveGroup, handPlateGeo, armorGreyMat, 0.012, [0, 0.012, 0.048]);
            addOutlinedMesh(gloveGroup, handPlateGeo, armorGreyMat, 0.012, [0, 0.012, -0.048]);

            // Curved 2-Phalanx Inward Thumb (wide iconic U-shaped gap between thumb & index!)
            addOutlinedMesh(
                gloveGroup,
                thumbProxGeo,
                suitFabricMat,
                0.014,
                [-side * 0.124, -0.028, -0.008],
                [0.08, 0, -side * 0.64]
            );
            addOutlinedMesh(
                gloveGroup,
                thumbDistGeo,
                suitFabricMat,
                0.013,
                [-side * 0.165, -0.092, -0.014],
                [0.14, 0, -side * 0.14]
            );

            // 4 Multi-Jointed Curved Comic Fingers (natural zero-G inward curl + knuckle crease rings!)
            const fingerOffsets = [-0.080, -0.026, 0.028, 0.078];
            const fingerLengths = [0.95, 1.08, 1.02, 0.84];
            const fingerSpread = [-0.14, -0.04, 0.06, 0.18];
            for (let f = 0; f < 4; f++) {
                const fLen = fingerLengths[f];
                const fRoot = new THREE.Group();
                fRoot.position.set(side * fingerOffsets[f], -0.082, 0);
                fRoot.rotation.set(0.10, 0, side * fingerSpread[f]);
                gloveGroup.add(fRoot);

                addOutlinedMesh(
                    fRoot,
                    fingerProxGeo,
                    suitFabricMat,
                    0.013,
                    [0, -0.036 * fLen, 0],
                    undefined,
                    [1.0, fLen, 1.0]
                );

                const jRing = new THREE.Mesh(fingerJointRingGeo, darkInkSolidMat);
                jRing.position.set(0, -0.068 * fLen, 0);
                fRoot.add(jRing);

                const fDist = new THREE.Group();
                fDist.position.set(0, -0.070 * fLen, 0);
                fDist.rotation.set(0.16, 0, -side * 0.08);
                fRoot.add(fDist);

                addOutlinedMesh(
                    fDist,
                    fingerDistGeo,
                    suitFabricMat,
                    0.012,
                    [0, -0.034 * fLen, 0],
                    undefined,
                    [0.95, fLen, 0.95]
                );
            }

            root.add(armPivot);
            return armPivot;
        };

        const leftArm = buildArticulatedArm(-1);
        const rightArm = buildArticulatedArm(1);

        // =====================================================================
        // 6. SCULPTED BOW-STANCE PUFFY LEGS, KNEE PADS & HEEL-COUNTER MOON BOOTS
        // =====================================================================
        const thighPoints = [
            new THREE.Vector2(0.001, -0.28),
            new THREE.Vector2(0.162, -0.27),
            new THREE.Vector2(0.188, -0.20),
            new THREE.Vector2(0.174, -0.13),
            new THREE.Vector2(0.194, -0.06),
            new THREE.Vector2(0.178, 0.01),
            new THREE.Vector2(0.001, 0.03)
        ];
        const thighGeo = new THREE.LatheGeometry(thighPoints, 28);
        sculptOrganicClothFolds(thighGeo, -0.28, 0.03, 0.010, 2.5, 3.1);

        const shinPoints = [
            new THREE.Vector2(0.001, -0.21),
            new THREE.Vector2(0.154, -0.20),
            new THREE.Vector2(0.176, -0.13),
            new THREE.Vector2(0.162, -0.05),
            new THREE.Vector2(0.168, 0.02),
            new THREE.Vector2(0.001, 0.03)
        ];
        const shinGeo = new THREE.LatheGeometry(shinPoints, 26);
        sculptOrganicClothFolds(shinGeo, -0.21, 0.03, 0.0085, 2.0, 4.2);

        const kneePadShape = createRoundedRectShape(0.185, 0.180, 0.034);
        const kneePadGeo = new THREE.ExtrudeGeometry(kneePadShape, {
            depth: 0.046,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.011,
            bevelThickness: 0.011
        });
        kneePadGeo.translate(0, 0, -0.023);

        const bootCuffGeo = new THREE.TorusGeometry(0.156, 0.025, 12, 28);
        bootCuffGeo.rotateX(Math.PI / 2);
        const bootShaftGeo = new THREE.CylinderGeometry(0.150, 0.158, 0.145, 26);
        const bootHeelCounterGeo = new THREE.CylinderGeometry(0.156, 0.164, 0.135, 18, 1, false, -Math.PI * 0.42, Math.PI * 0.84);

        const bootFootShape = createRoundedRectShape(0.288, 0.435, 0.120);
        const bootFootGeo = new THREE.ExtrudeGeometry(bootFootShape, {
            depth: 0.148,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.024,
            bevelThickness: 0.024
        });
        bootFootGeo.rotateX(Math.PI / 2);

        const bootSoleShape = createRoundedRectShape(0.302, 0.450, 0.124);
        const bootSoleGeo = new THREE.ExtrudeGeometry(bootSoleShape, {
            depth: 0.056,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.010,
            bevelThickness: 0.010
        });
        bootSoleGeo.rotateX(Math.PI / 2);

        const soleLugGeo = new THREE.BoxGeometry(0.258, 0.018, 0.022);

        const buildArticulatedLeg = (side: -1 | 1): THREE.Group => {
            const legPivot = new THREE.Group();
            legPivot.position.set(side * 0.238, -0.31, 0);
            legPivot.rotation.z = side * 0.28;
            legPivot.rotation.x = side === 1 ? 0.22 : 0.08;

            addOutlinedMesh(legPivot, thighGeo, suitFabricMat, 0.025);

            // Tapered 3D comic cloth creases across front groin & back hamstring (Flotando.jpeg & AEspaldas.jpeg!)
            for (const sZ of [-1, 1]) {
                addTaperedInkStroke(
                    legPivot,
                    [
                        new THREE.Vector3(-side * 0.155, -0.11, sZ * 0.09),
                        new THREE.Vector3(-side * 0.045, -0.145, sZ * 0.175),
                        new THREE.Vector3(side * 0.095, -0.165, sZ * 0.158)
                    ],
                    0.0066
                );
                addTaperedInkStroke(
                    legPivot,
                    [
                        new THREE.Vector3(-side * 0.145, -0.20, sZ * 0.08),
                        new THREE.Vector3(-side * 0.030, -0.225, sZ * 0.165),
                        new THREE.Vector3(side * 0.090, -0.235, sZ * 0.150)
                    ],
                    0.0062
                );
            }

            // Stitched tan outer-thigh patch sitting proudly outside thigh!
            if (side === 1) {
                addOutlinedMesh(
                    legPivot,
                    new THREE.BoxGeometry(0.024, 0.072, 0.062),
                    tanPatchMat,
                    0.010,
                    [0.198, -0.105, -0.035]
                );
            }

            // Knee joint curves inward (bow-legged zero-G stance) + tilts shin/sole cleanly toward +Z back camera!
            const kneePivot = new THREE.Group();
            kneePivot.position.set(0, -0.255, 0);
            kneePivot.rotation.z = -side * 0.22;
            kneePivot.rotation.x = side === 1 ? -0.68 : -0.38;
            legPivot.add(kneePivot);

            addOutlinedMesh(
                kneePivot,
                kneePadGeo,
                armorGreyMat,
                0.016,
                [side * 0.015, -0.015, -0.166],
                [-0.08, 0, side * 0.05]
            );

            addOutlinedMesh(kneePivot, shinGeo, suitFabricMat, 0.024);
            addTaperedInkStroke(
                kneePivot,
                [
                    new THREE.Vector3(-0.11, -0.11, 0.135),
                    new THREE.Vector3(0, -0.13, 0.168),
                    new THREE.Vector3(0.11, -0.11, 0.135)
                ],
                0.0062
            );

            // Moon Boot Assembly (Ankle Collar + Sculpted Heel Counter + Armored Toe Cap + 7-Groove Lugged Outsole)
            const bootGroup = new THREE.Group();
            bootGroup.position.set(0, -0.195, 0);
            bootGroup.rotation.x = side === 1 ? -0.34 : -0.28;
            bootGroup.rotation.z = -side * 0.06;
            kneePivot.add(bootGroup);

            addOutlinedMesh(bootGroup, bootCuffGeo, darkStrapMat, 0.015, [0, 0.01, 0]);
            addOutlinedMesh(bootGroup, bootShaftGeo, suitFabricMat, 0.022, [0, -0.065, 0]);
            // Structured Rear Heel Counter Panel (visible in AEspaldas.jpeg!)
            addOutlinedMesh(bootGroup, bootHeelCounterGeo, armorGreyMat, 0.012, [0, -0.185, 0.022]);

            addOutlinedMesh(bootGroup, bootFootGeo, suitFabricMat, 0.024, [0, -0.135, -0.055]);
            addOutlinedMesh(
                bootGroup,
                new THREE.SphereGeometry(0.140, 20, 16),
                armorGreyMat,
                0.016,
                [0, -0.175, -0.162],
                undefined,
                [1.04, 0.62, 0.92]
            );

            // Thick Slate-Grey Lugged Rubber Sole + 7 Bold Horizontal Tread Grooves
            addOutlinedMesh(bootGroup, bootSoleGeo, bootSoleMat, 0.018, [0, -0.288, -0.055]);
            for (let lug = 0; lug < 7; lug++) {
                const lugMesh = new THREE.Mesh(soleLugGeo, darkInkSolidMat);
                lugMesh.position.set(0, -0.356, 0.112 - lug * 0.054);
                bootGroup.add(lugMesh);
            }

            root.add(legPivot);
            return legPivot;
        };

        const leftLeg = buildArticulatedLeg(-1);
        const rightLeg = buildArticulatedLeg(1);

        return {
            root,
            helmet,
            backpack,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg
        };
    }

    /**
     * Builds the Volumetric Cel-Shaded 3D Comic Slot Machine (1x3 Single-Line)
     * Sculpted cathedral-arch dark-oak hull, riveted forged-iron armor straps,
     * antique-brass reel bezel & curved mullions, 3D diamond-crown marquee w/ 9 glass bulbs,
     * 3 high-DPI ivory gouache reels, twin crimson arrow pointers, 5 3D spin-charge gems,
     * and an articulated mechanical side pull-lever.
     */
    private buildArcadeMiniSlotMachine() {
        this.miniSlotGroup = new THREE.Group();
        this.miniSlotGroup.visible = false;
        this.scene.add(this.miniSlotGroup);

        const slotInkOutlineMat = new THREE.MeshBasicMaterial({
            color: 0x060505,
            side: THREE.BackSide,
            depthWrite: true
        });

        const makeSmoothOutlineGeo = (
            srcGeo: THREE.BufferGeometry,
            thickness: number
        ): THREE.BufferGeometry => {
            const outlineGeo = srcGeo.clone();
            outlineGeo.computeVertexNormals();
            const posAttr = outlineGeo.attributes.position;
            const normAttr = outlineGeo.attributes.normal;
            const dirMap = new Map<string, Map<string, [number, number, number]>>();

            for (let i = 0; i < posAttr.count; i++) {
                const pKey = `${Math.round(posAttr.getX(i) * 1000)},${Math.round(posAttr.getY(i) * 1000)},${Math.round(posAttr.getZ(i) * 1000)}`;
                const nx = normAttr.getX(i);
                const ny = normAttr.getY(i);
                const nz = normAttr.getZ(i);
                const nKey = `${Math.round(nx * 50)},${Math.round(ny * 50)},${Math.round(nz * 50)}`;
                let bucket = dirMap.get(pKey);
                if (!bucket) {
                    bucket = new Map();
                    dirMap.set(pKey, bucket);
                }
                if (!bucket.has(nKey)) {
                    bucket.set(nKey, [nx, ny, nz]);
                }
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
                const pKey = `${Math.round(posAttr.getX(i) * 1000)},${Math.round(posAttr.getY(i) * 1000)},${Math.round(posAttr.getZ(i) * 1000)}`;
                const [ox, oy, oz] = avgMap.get(pKey)!;
                posAttr.setXYZ(
                    i,
                    posAttr.getX(i) + ox * thickness,
                    posAttr.getY(i) + oy * thickness,
                    posAttr.getZ(i) + oz * thickness
                );
            }
            return outlineGeo;
        };

        const applyBoundsPlanarUVs = (geo: THREE.BufferGeometry, scaleU = 1, scaleV = 1) => {
            geo.computeBoundingBox();
            const bb = geo.boundingBox!;
            const spanX = Math.max(1e-4, bb.max.x - bb.min.x);
            const spanY = Math.max(1e-4, bb.max.y - bb.min.y);
            const pos = geo.attributes.position;
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = ((pos.getX(i) - bb.min.x) / spanX) * scaleU;
                uvs[i * 2 + 1] = ((pos.getY(i) - bb.min.y) / spanY) * scaleV;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        };

        // Artisan Comic PBR Materials (cohesive with Giant Roulette & Astronaut)
        const slotOakMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelWoodPlankTex,
            emissive: 0x3b1d0a,
            emissiveIntensity: 0.24,
            roughness: 0.60,
            metalness: 0.05
        });
        const slotOakArchMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelWoodRingTex,
            emissive: 0x3b1d0a,
            emissiveIntensity: 0.24,
            roughness: 0.58,
            metalness: 0.05
        });
        const slotCavityDarkMat = new THREE.MeshBasicMaterial({
            color: 0x09060c
        });
        const slotIronMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelIronTex,
            color: 0xeae5dc,
            emissive: 0x45413a,
            emissiveIntensity: 0.24,
            roughness: 0.44,
            metalness: 0.25
        });
        const slotGoldBezelMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xffe875,
            emissive: 0xb45309,
            emissiveIntensity: 0.30,
            roughness: 0.32,
            metalness: 0.32
        });
        const slotBrassMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelBrassTex,
            color: 0xf9db84,
            emissive: 0x78350f,
            emissiveIntensity: 0.26,
            roughness: 0.36,
            metalness: 0.28
        });
        const slotCrimsonMat = new THREE.MeshStandardMaterial({
            map: this.textures.pathWheelArrowTex,
            emissive: 0xb91c1c,
            emissiveIntensity: 0.32,
            roughness: 0.24,
            metalness: 0.08
        });
        const slotChromeShaftMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            emissive: 0x64748b,
            emissiveIntensity: 0.20,
            roughness: 0.20,
            metalness: 0.72
        });

        const REEL_Y = -0.02;
        const REEL_Z = -0.44;
        const REEL_RADIUS = 1.32;
        const REEL_WIDTH = 1.18;

        // Helper to trace the outer Cathedral-Arch Slot Cabinet silhouette
        const createCathedralOuterShape = () => {
            const s = new THREE.Shape();
            s.moveTo(-2.68, -1.76);
            s.lineTo(2.68, -1.76);
            s.quadraticCurveTo(2.78, -1.76, 2.78, -1.64);
            s.lineTo(2.78, 1.02);
            s.quadraticCurveTo(2.78, 1.24, 2.60, 1.42);
            s.absarc(0, 0.76, 2.68, 0.25, Math.PI - 0.25, false);
            s.quadraticCurveTo(-2.78, 1.24, -2.78, 1.02);
            s.lineTo(-2.78, -1.64);
            s.quadraticCurveTo(-2.78, -1.76, -2.68, -1.76);
            s.closePath();
            return s;
        };

        // 1A. Solid Rear Vault Wall (seals z = -1.94 .. -1.76 completely)
        const rearBackShape = createCathedralOuterShape();
        const rearBackGeo = new THREE.ExtrudeGeometry(rearBackShape, {
            depth: 0.20,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.05,
            bevelThickness: 0.05
        });
        rearBackGeo.translate(0, 0, -1.94);
        applyBoundsPlanarUVs(rearBackGeo, 2, 2);
        const rearBackMesh = new THREE.Mesh(rearBackGeo, slotOakMat);
        const rearBackOut = new THREE.Mesh(makeSmoothOutlineGeo(rearBackGeo, 0.058), slotInkOutlineMat);
        rearBackOut.renderOrder = -1;
        this.miniSlotGroup.add(rearBackMesh, rearBackOut);

        // 1B. Deep Mid-Hull Cathedral Shell (z = -1.78 .. +0.48) with oversized internal drum cavity
        const midHullShape = createCathedralOuterShape();
        const drumCavityHole = new THREE.Path();
        drumCavityHole.moveTo(-2.18, -1.42);
        drumCavityHole.lineTo(-2.18, 1.36);
        drumCavityHole.lineTo(2.18, 1.36);
        drumCavityHole.lineTo(2.18, -1.42);
        drumCavityHole.closePath();
        midHullShape.holes.push(drumCavityHole);

        const midHullGeo = new THREE.ExtrudeGeometry(midHullShape, {
            depth: 2.24,
            bevelEnabled: false,
            steps: 1
        });
        midHullGeo.translate(0, 0, -1.78);
        applyBoundsPlanarUVs(midHullGeo, 2, 2);
        const midHullMesh = new THREE.Mesh(midHullGeo, slotOakMat);
        const midHullOut = new THREE.Mesh(makeSmoothOutlineGeo(midHullGeo, 0.058), slotInkOutlineMat);
        midHullOut.renderOrder = -1;
        this.miniSlotGroup.add(midHullMesh, midHullOut);

        // 1C. Sculpted Front Cathedral Oak Facade (z = +0.44 .. +0.68) with precision 3-Reel Window Cutout
        const frontFacadeShape = createCathedralOuterShape();
        const windowCutoutHole = new THREE.Path();
        windowCutoutHole.moveTo(-2.14, -0.90);
        windowCutoutHole.lineTo(-2.14, 0.86);
        windowCutoutHole.lineTo(2.14, 0.86);
        windowCutoutHole.lineTo(2.14, -0.90);
        windowCutoutHole.closePath();
        frontFacadeShape.holes.push(windowCutoutHole);

        const frontFacadeGeo = new THREE.ExtrudeGeometry(frontFacadeShape, {
            depth: 0.22,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.055,
            bevelThickness: 0.055
        });
        frontFacadeGeo.translate(0, 0, 0.46);
        applyBoundsPlanarUVs(frontFacadeGeo, 1.2, 1.2);
        const frontFacadeMesh = new THREE.Mesh(frontFacadeGeo, slotOakArchMat);
        const frontFacadeOut = new THREE.Mesh(makeSmoothOutlineGeo(frontFacadeGeo, 0.058), slotInkOutlineMat);
        frontFacadeOut.renderOrder = -1;
        this.miniSlotGroup.add(frontFacadeMesh, frontFacadeOut);

        // Dark light-proof interior liner behind the reels so no starlight ever leaks through seams
        const linerBackGeo = new THREE.PlaneGeometry(4.48, 2.86);
        const linerBackMesh = new THREE.Mesh(linerBackGeo, slotCavityDarkMat);
        linerBackMesh.position.set(0, REEL_Y, -1.74);
        this.miniSlotGroup.add(linerBackMesh);

        // 2. Heavy Stepped Dark-Oak Plinth Base + Forged-Iron Base Shoes
        const plinthShape = new THREE.Shape();
        plinthShape.moveTo(-3.04, -2.08);
        plinthShape.lineTo(3.04, -2.08);
        plinthShape.lineTo(2.96, -1.75);
        plinthShape.lineTo(-2.96, -1.75);
        plinthShape.closePath();
        const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
            depth: 2.84,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.048,
            bevelThickness: 0.048
        });
        plinthGeo.translate(0, 0, -2.02);
        applyBoundsPlanarUVs(plinthGeo, 2, 1);
        const plinthMesh = new THREE.Mesh(plinthGeo, slotOakMat);
        const plinthOut = new THREE.Mesh(makeSmoothOutlineGeo(plinthGeo, 0.058), slotInkOutlineMat);
        plinthOut.renderOrder = -1;
        this.miniSlotGroup.add(plinthMesh, plinthOut);

        // 3. Riveted Forged-Iron Armor Clamps (matching Ruleta.jpeg ironwork!)
        const rivetGeo = new THREE.SphereGeometry(0.088, 12, 10);
        rivetGeo.scale(1, 1, 0.65);
        const rivetOutGeo = makeSmoothOutlineGeo(rivetGeo, 0.032);

        const sideClampGeo = new THREE.BoxGeometry(0.56, 0.68, 2.74);
        applyBoundsPlanarUVs(sideClampGeo, 1, 1);
        const sideClampOutGeo = makeSmoothOutlineGeo(sideClampGeo, 0.048);

        for (const sx of [-1, 1]) {
            for (const cy of [0.64, -0.74]) {
                const clampGrp = new THREE.Group();
                clampGrp.position.set(sx * 2.66, cy, -0.58);
                const cMesh = new THREE.Mesh(sideClampGeo, slotIronMat);
                const cOut = new THREE.Mesh(sideClampOutGeo, slotInkOutlineMat);
                cOut.renderOrder = -1;
                clampGrp.add(cMesh, cOut);

                for (const ry of [-0.19, 0, 0.19]) {
                    const rv = new THREE.Mesh(rivetGeo, slotIronMat);
                    rv.position.set(sx * -0.04, ry, 1.39);
                    const rvOut = new THREE.Mesh(rivetOutGeo, slotInkOutlineMat);
                    rvOut.position.copy(rv.position);
                    rvOut.renderOrder = -1;
                    clampGrp.add(rv, rvOut);
                }
                this.miniSlotGroup.add(clampGrp);
            }

            // Base corner forged-iron shoes
            const shoeGeo = new THREE.BoxGeometry(0.76, 0.36, 2.94);
            applyBoundsPlanarUVs(shoeGeo, 1, 1);
            const shoeOutGeo = makeSmoothOutlineGeo(shoeGeo, 0.046);
            const shoeGrp = new THREE.Group();
            shoeGrp.position.set(sx * 2.74, -1.91, -0.60);
            const sMesh = new THREE.Mesh(shoeGeo, slotIronMat);
            const sOut = new THREE.Mesh(shoeOutGeo, slotInkOutlineMat);
            sOut.renderOrder = -1;
            shoeGrp.add(sMesh, sOut);

            for (const rx of [-0.16, 0.16]) {
                const rv = new THREE.Mesh(rivetGeo, slotIronMat);
                rv.position.set(rx, 0, 1.49);
                const rvOut = new THREE.Mesh(rivetOutGeo, slotInkOutlineMat);
                rvOut.position.copy(rv.position);
                rvOut.renderOrder = -1;
                shoeGrp.add(rv, rvOut);
            }
            this.miniSlotGroup.add(shoeGrp);
        }

        // Top Cathedral Arch Forged-Iron Crest Strap + 7 Radial Rivets
        const archIronShape = new THREE.Shape();
        const archCenterY = 0.76;
        const rArchIn = 2.48;
        const rArchOut = 2.90;
        const aLeft = Math.PI - 0.34;
        const aRight = 0.34;
        archIronShape.moveTo(Math.cos(aRight) * rArchIn, archCenterY + Math.sin(aRight) * rArchIn);
        archIronShape.absarc(0, archCenterY, rArchOut, aRight, aLeft, false);
        archIronShape.absarc(0, archCenterY, rArchIn, aLeft, aRight, true);
        archIronShape.closePath();

        const archIronGeo = new THREE.ExtrudeGeometry(archIronShape, {
            depth: 0.44,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.04,
            bevelThickness: 0.04
        });
        archIronGeo.translate(0, 0, 0.40);
        applyBoundsPlanarUVs(archIronGeo, 2, 1);
        const archIronMesh = new THREE.Mesh(archIronGeo, slotIronMat);
        const archIronOut = new THREE.Mesh(makeSmoothOutlineGeo(archIronGeo, 0.052), slotInkOutlineMat);
        archIronOut.renderOrder = -1;
        this.miniSlotGroup.add(archIronMesh, archIronOut);

        for (let rIdx = 0; rIdx < 7; rIdx++) {
            const ang = 0.46 + (rIdx / 6) * (Math.PI - 0.92);
            const rMid = (rArchIn + rArchOut) * 0.5;
            const rv = new THREE.Mesh(rivetGeo, slotIronMat);
            rv.position.set(Math.cos(ang) * rMid, archCenterY + Math.sin(ang) * rMid, 0.89);
            const rvOut = new THREE.Mesh(rivetOutGeo, slotInkOutlineMat);
            rvOut.position.copy(rv.position);
            rvOut.renderOrder = -1;
            this.miniSlotGroup.add(rv, rvOut);
        }

        // 4. Arched Royal Sunburst Marquee + Brass Frame + 9 3D Bulbs + 3D Diamond-Crown Crest (ZERO TEXT)
        const marqueeArchShape = new THREE.Shape();
        const mqCy = 0.98;
        const mqRadius = 2.16;
        marqueeArchShape.moveTo(-2.06, 1.12);
        marqueeArchShape.lineTo(2.06, 1.12);
        marqueeArchShape.absarc(0, mqCy, mqRadius, 0.16, Math.PI - 0.16, false);
        marqueeArchShape.closePath();

        const marqueePanelGeo = new THREE.ShapeGeometry(marqueeArchShape, 36);
        applyBoundsPlanarUVs(marqueePanelGeo, 1, 1);
        const marqueePanelMat = new THREE.MeshStandardMaterial({
            map: this.textures.slotCabinetMarqueeTex,
            emissive: 0xffffff,
            emissiveMap: this.textures.slotCabinetMarqueeTex,
            emissiveIntensity: 0.28,
            roughness: 0.36,
            metalness: 0.06
        });
        const marqueePanelMesh = new THREE.Mesh(marqueePanelGeo, marqueePanelMat);
        marqueePanelMesh.position.z = 0.75;
        this.miniSlotGroup.add(marqueePanelMesh);

        // Raised Antique-Brass Arched Marquee Bezel
        const mqBezelOuter = new THREE.Shape();
        mqBezelOuter.moveTo(-2.22, 1.04);
        mqBezelOuter.lineTo(2.22, 1.04);
        mqBezelOuter.absarc(0, mqCy, mqRadius + 0.15, 0.09, Math.PI - 0.09, false);
        mqBezelOuter.closePath();

        const mqBezelHole = new THREE.Path();
        mqBezelHole.moveTo(-2.02, 1.16);
        mqBezelHole.absarc(0, mqCy, mqRadius - 0.04, Math.PI - 0.18, 0.18, true);
        mqBezelHole.lineTo(-2.02, 1.16);
        mqBezelHole.closePath();
        mqBezelOuter.holes.push(mqBezelHole);

        const mqBezelGeo = new THREE.ExtrudeGeometry(mqBezelOuter, {
            depth: 0.14,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.032,
            bevelThickness: 0.032
        });
        mqBezelGeo.translate(0, 0, 0.72);
        applyBoundsPlanarUVs(mqBezelGeo, 1.5, 1);
        const mqBezelMesh = new THREE.Mesh(mqBezelGeo, slotGoldBezelMat);
        const mqBezelOut = new THREE.Mesh(makeSmoothOutlineGeo(mqBezelGeo, 0.042), slotInkOutlineMat);
        mqBezelOut.renderOrder = -1;
        this.miniSlotGroup.add(mqBezelMesh, mqBezelOut);

        // 9 Glowing 3D Glass Marquee Bulbs along the Arch
        this.slotMarqueeBulbs = [];
        const bulbCupGeo = new THREE.CylinderGeometry(0.095, 0.105, 0.08, 14);
        bulbCupGeo.rotateX(Math.PI / 2);
        const bulbGlassGeo = new THREE.SphereGeometry(0.076, 14, 12);
        const bulbGlassOutGeo = makeSmoothOutlineGeo(bulbGlassGeo, 0.024);
        const bulbPalette = [0xfde047, 0x38bdf8, 0xef4444, 0x22c55e];

        for (let b = 0; b < 9; b++) {
            const bAng = 0.24 + (b / 8) * (Math.PI - 0.48);
            const rBulb = mqRadius + 0.055;
            const bx = Math.cos(bAng) * rBulb;
            const by = mqCy + Math.sin(bAng) * rBulb;
            const colHex = bulbPalette[b % bulbPalette.length];

            const cup = new THREE.Mesh(bulbCupGeo, slotBrassMat);
            cup.position.set(bx, by, 0.87);
            this.miniSlotGroup.add(cup);

            const bMat = new THREE.MeshStandardMaterial({
                color: colHex,
                emissive: colHex,
                emissiveIntensity: 0.95,
                roughness: 0.16,
                metalness: 0.10
            });
            const bulbMesh = new THREE.Mesh(bulbGlassGeo, bMat);
            bulbMesh.position.set(bx, by, 0.92);
            const bulbOut = new THREE.Mesh(bulbGlassOutGeo, slotInkOutlineMat);
            bulbOut.position.copy(bulbMesh.position);
            bulbOut.renderOrder = -1;
            this.miniSlotGroup.add(bulbMesh, bulbOut);
            this.slotMarqueeBulbs.push(bulbMesh);
        }

        // Sculpted 3D Central Royal Crest Medallion on Marquee Arch (Forged Iron + Brass Bezel + Hand-Inked Crown-Diamond Crest)
        const crestGroup = new THREE.Group();
        crestGroup.position.set(0, 1.70, 0.80);
        this.miniSlotGroup.add(crestGroup);

        const crestBaseGeo = new THREE.CylinderGeometry(0.58, 0.62, 0.10, 36);
        crestBaseGeo.rotateX(Math.PI / 2);
        applyBoundsPlanarUVs(crestBaseGeo, 1, 1);
        const crestBaseMesh = new THREE.Mesh(crestBaseGeo, slotIronMat);
        const crestBaseOut = new THREE.Mesh(makeSmoothOutlineGeo(crestBaseGeo, 0.038), slotInkOutlineMat);
        crestBaseOut.renderOrder = -1;
        crestGroup.add(crestBaseMesh, crestBaseOut);

        const crestFaceGeo = new THREE.CircleGeometry(0.47, 40);
        const crestFaceMat = new THREE.MeshStandardMaterial({
            map: this.textures.slotMarqueeCrestTex,
            emissive: 0xffffff,
            emissiveMap: this.textures.slotMarqueeCrestTex,
            emissiveIntensity: 0.28,
            roughness: 0.45,
            metalness: 0.05
        });
        const crestFaceMesh = new THREE.Mesh(crestFaceGeo, crestFaceMat);
        crestFaceMesh.position.z = 0.065;
        crestGroup.add(crestFaceMesh);

        const crestRingGeo = new THREE.TorusGeometry(0.49, 0.056, 16, 40);
        applyBoundsPlanarUVs(crestRingGeo, 1, 1);
        const crestRingMesh = new THREE.Mesh(crestRingGeo, slotGoldBezelMat);
        crestRingMesh.position.z = 0.075;
        const crestRingOut = new THREE.Mesh(makeSmoothOutlineGeo(crestRingGeo, 0.028), slotInkOutlineMat);
        crestRingOut.position.copy(crestRingMesh.position);
        crestRingOut.renderOrder = -1;
        crestGroup.add(crestRingMesh, crestRingOut);

        const crestStudGeo = new THREE.SphereGeometry(0.044, 10, 8);
        crestStudGeo.scale(1, 1, 0.65);
        const crestStudOutGeo = makeSmoothOutlineGeo(crestStudGeo, 0.020);
        for (let cIdx = 0; cIdx < 8; cIdx++) {
            const cAng = (cIdx * Math.PI * 2) / 8 + Math.PI / 8;
            const sx = Math.cos(cAng) * 0.545;
            const sy = Math.sin(cAng) * 0.545;
            const stud = new THREE.Mesh(crestStudGeo, slotGoldBezelMat);
            stud.position.set(sx, sy, 0.065);
            const studOut = new THREE.Mesh(crestStudOutGeo, slotInkOutlineMat);
            studOut.position.copy(stud.position);
            studOut.renderOrder = -1;
            crestGroup.add(stud, studOut);
        }

        // 5. Sculpted Antique-Brass 3-Reel Bay Frame & Curved Brass Mullions
        const bayOuter = new THREE.Shape();
        bayOuter.moveTo(-2.34, -1.06);
        bayOuter.lineTo(2.34, -1.06);
        bayOuter.quadraticCurveTo(2.42, -1.06, 2.42, -0.98);
        bayOuter.lineTo(2.42, 0.94);
        bayOuter.quadraticCurveTo(2.42, 1.02, 2.34, 1.02);
        bayOuter.lineTo(-2.34, 1.02);
        bayOuter.quadraticCurveTo(-2.42, 1.02, -2.42, 0.94);
        bayOuter.lineTo(-2.42, -0.98);
        bayOuter.quadraticCurveTo(-2.42, -1.06, -2.34, -1.06);
        bayOuter.closePath();

        const bayHole = new THREE.Path();
        bayHole.moveTo(-2.12, -0.88);
        bayHole.lineTo(-2.12, 0.84);
        bayHole.lineTo(2.12, 0.84);
        bayHole.lineTo(2.12, -0.88);
        bayHole.closePath();
        bayOuter.holes.push(bayHole);

        const bayFrameGeo = new THREE.ExtrudeGeometry(bayOuter, {
            depth: 0.24,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.042,
            bevelThickness: 0.042
        });
        bayFrameGeo.translate(0, 0, 0.60);
        applyBoundsPlanarUVs(bayFrameGeo, 1.5, 1.2);
        const bayFrameMesh = new THREE.Mesh(bayFrameGeo, slotGoldBezelMat);
        const bayFrameOut = new THREE.Mesh(makeSmoothOutlineGeo(bayFrameGeo, 0.046), slotInkOutlineMat);
        bayFrameOut.renderOrder = -1;
        this.miniSlotGroup.add(bayFrameMesh, bayFrameOut);

        // 2 Curved Antique-Brass Vertical Mullion Dividers hugging the 3 cylindrical drums
        const mullionArcShape = new THREE.Shape();
        const rMulIn = REEL_RADIUS + 0.015;
        const rMulOut = REEL_RADIUS + 0.095;
        const mAng = 0.64;
        mullionArcShape.moveTo(Math.cos(-mAng) * rMulIn, Math.sin(-mAng) * rMulIn);
        mullionArcShape.absarc(0, 0, rMulOut, -mAng, mAng, false);
        mullionArcShape.absarc(0, 0, rMulIn, mAng, -mAng, true);
        mullionArcShape.closePath();

        const mullionGeo = new THREE.ExtrudeGeometry(mullionArcShape, {
            depth: 0.11,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.018,
            bevelThickness: 0.018
        });
        mullionGeo.translate(0, 0, -0.055);
        mullionGeo.rotateY(-Math.PI / 2);
        const mullionOutGeo = makeSmoothOutlineGeo(mullionGeo, 0.028);

        for (const mx of [-0.71, 0.71]) {
            const mulMesh = new THREE.Mesh(mullionGeo, slotBrassMat);
            mulMesh.position.set(mx, REEL_Y, REEL_Z);
            const mulOut = new THREE.Mesh(mullionOutGeo, slotInkOutlineMat);
            mulOut.position.copy(mulMesh.position);
            mulOut.renderOrder = -1;
            this.miniSlotGroup.add(mulMesh, mulOut);
        }

        // 6. The 3 High-Poly 3D Ivory Gouache Reel Cylinders + Brass Flanges
        const reelGeo = new THREE.CylinderGeometry(REEL_RADIUS, REEL_RADIUS, REEL_WIDTH, 48, 1, true);
        reelGeo.rotateZ(Math.PI / 2);

        const flangeGeo = new THREE.CylinderGeometry(REEL_RADIUS + 0.022, REEL_RADIUS + 0.022, 0.055, 40);
        flangeGeo.rotateZ(Math.PI / 2);

        const reelPositionsX = [-1.42, 0.0, 1.42];
        const initialRestAngle = (Math.PI * 2) / 24; // Centers Sector 0 (X88 Crowned Diamond) cleanly on payline
        this.slotReels = [];
        this.slotReelAngles = [initialRestAngle, initialRestAngle, initialRestAngle];

        for (let i = 0; i < 3; i++) {
            const reelMat = new THREE.MeshStandardMaterial({
                map: this.textures.slotReelStripTex,
                emissive: 0xfff8e7,
                emissiveMap: this.textures.slotReelStripTex,
                emissiveIntensity: 0.25,
                roughness: 0.68,
                metalness: 0.02
            });
            const reelMesh = new THREE.Mesh(reelGeo, reelMat);
            reelMesh.position.set(reelPositionsX[i], REEL_Y, REEL_Z);
            reelMesh.rotation.x = initialRestAngle;
            this.miniSlotGroup.add(reelMesh);
            this.slotReels.push(reelMesh);

            const capLeft = new THREE.Mesh(flangeGeo, slotBrassMat);
            capLeft.position.set(reelPositionsX[i] - REEL_WIDTH * 0.5, REEL_Y, REEL_Z);
            const capRight = new THREE.Mesh(flangeGeo, slotBrassMat);
            capRight.position.set(reelPositionsX[i] + REEL_WIDTH * 0.5, REEL_Y, REEL_Z);
            this.miniSlotGroup.add(capLeft, capRight);
        }

        // 7. Subtle Translucent Payline Hairline (ignites on Win/Near-Miss) & Twin Glossy Crimson 3D Arrow Pointers
        const paylineGeo = new THREE.BoxGeometry(4.28, 0.022, 0.020);
        const paylineMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.85,
            roughness: 0.15,
            metalness: 0.25,
            transparent: true,
            opacity: 0.14
        });
        this.slotPaylineBeam = new THREE.Mesh(paylineGeo, paylineMat);
        this.slotPaylineBeam.position.set(0, REEL_Y, 0.925);
        this.miniSlotGroup.add(this.slotPaylineBeam);

        this.slotPaylineChevrons = [];
        const ptrScale = 1.16;
        const ptrShape = new THREE.Shape();
        ptrShape.moveTo(-0.088 * ptrScale, 0.26 * ptrScale);
        ptrShape.lineTo(0.088 * ptrScale, 0.26 * ptrScale);
        ptrShape.quadraticCurveTo(0.130 * ptrScale, 0.26 * ptrScale, 0.126 * ptrScale, 0.21 * ptrScale);
        ptrShape.lineTo(0.104 * ptrScale, -0.10 * ptrScale);
        ptrShape.lineTo(0.212 * ptrScale, -0.08 * ptrScale);
        ptrShape.quadraticCurveTo(0.260 * ptrScale, -0.07 * ptrScale, 0.250 * ptrScale, -0.13 * ptrScale);
        ptrShape.quadraticCurveTo(0.158 * ptrScale, -0.32 * ptrScale, 0.030 * ptrScale, -0.47 * ptrScale);
        ptrShape.quadraticCurveTo(0.0, -0.50 * ptrScale, -0.030 * ptrScale, -0.47 * ptrScale);
        ptrShape.quadraticCurveTo(-0.158 * ptrScale, -0.32 * ptrScale, -0.250 * ptrScale, -0.13 * ptrScale);
        ptrShape.quadraticCurveTo(-0.260 * ptrScale, -0.07 * ptrScale, -0.212 * ptrScale, -0.08 * ptrScale);
        ptrShape.lineTo(-0.104 * ptrScale, -0.10 * ptrScale);
        ptrShape.lineTo(-0.126 * ptrScale, 0.21 * ptrScale);
        ptrShape.quadraticCurveTo(-0.130 * ptrScale, 0.26 * ptrScale, -0.088 * ptrScale, 0.26 * ptrScale);
        ptrShape.closePath();

        const ptrGeo = new THREE.ExtrudeGeometry(ptrShape, {
            depth: 0.13,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.028,
            bevelThickness: 0.028
        });
        ptrGeo.translate(0, 0, -0.065);
        applyBoundsPlanarUVs(ptrGeo, 1, 1);
        const ptrOutGeo = makeSmoothOutlineGeo(ptrGeo, 0.042);

        // Left crimson pointer pointing right (+X) -> rotate +PI/2 around Z (since tip is at -Y)
        const chevLeftGroup = new THREE.Group();
        chevLeftGroup.position.set(-2.42, REEL_Y, 0.95);
        const leftPtrMesh = new THREE.Mesh(ptrGeo, slotCrimsonMat);
        leftPtrMesh.rotation.z = Math.PI / 2;
        const leftPtrOut = new THREE.Mesh(ptrOutGeo, slotInkOutlineMat);
        leftPtrOut.rotation.z = Math.PI / 2;
        leftPtrOut.renderOrder = -1;
        chevLeftGroup.add(leftPtrMesh, leftPtrOut);
        this.miniSlotGroup.add(chevLeftGroup);
        this.slotPaylineChevrons.push(chevLeftGroup);

        // Right crimson pointer pointing left (-X) -> rotate -PI/2 around Z
        const chevRightGroup = new THREE.Group();
        chevRightGroup.position.set(2.42, REEL_Y, 0.95);
        const rightPtrMesh = new THREE.Mesh(ptrGeo, slotCrimsonMat);
        rightPtrMesh.rotation.z = -Math.PI / 2;
        const rightPtrOut = new THREE.Mesh(ptrOutGeo, slotInkOutlineMat);
        rightPtrOut.rotation.z = -Math.PI / 2;
        rightPtrOut.renderOrder = -1;
        chevRightGroup.add(rightPtrMesh, rightPtrOut);
        this.miniSlotGroup.add(chevRightGroup);
        this.slotPaylineChevrons.push(chevRightGroup);

        // 8. Lower Stepped Brass & Iron Deck with 5 Physical 3D Spin-Charge Cabochon Gems (ZERO TEXT)
        const deckShape = new THREE.Shape();
        deckShape.moveTo(-2.12, -1.62);
        deckShape.lineTo(2.12, -1.62);
        deckShape.quadraticCurveTo(2.22, -1.62, 2.22, -1.52);
        deckShape.lineTo(2.22, -1.24);
        deckShape.quadraticCurveTo(2.22, -1.16, 2.12, -1.16);
        deckShape.lineTo(-2.12, -1.16);
        deckShape.quadraticCurveTo(-2.22, -1.16, -2.22, -1.24);
        deckShape.lineTo(-2.22, -1.52);
        deckShape.quadraticCurveTo(-2.22, -1.62, -2.12, -1.62);
        deckShape.closePath();

        const deckGeo = new THREE.ExtrudeGeometry(deckShape, {
            depth: 0.16,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.032,
            bevelThickness: 0.032
        });
        deckGeo.translate(0, 0, 0.66);
        applyBoundsPlanarUVs(deckGeo, 2, 1);
        const deckMesh = new THREE.Mesh(deckGeo, slotIronMat);
        const deckOut = new THREE.Mesh(makeSmoothOutlineGeo(deckGeo, 0.042), slotInkOutlineMat);
        deckOut.renderOrder = -1;
        this.miniSlotGroup.add(deckMesh, deckOut);

        this.slotSpinOrbs = [];
        const orbBezelGeo = new THREE.CylinderGeometry(0.175, 0.195, 0.08, 20);
        orbBezelGeo.rotateX(Math.PI / 2);
        const orbBezelOutGeo = makeSmoothOutlineGeo(orbBezelGeo, 0.028);
        const orbGemGeo = new THREE.SphereGeometry(0.132, 18, 14);
        orbGemGeo.scale(1, 1, 0.62);
        const orbGemOutGeo = makeSmoothOutlineGeo(orbGemGeo, 0.024);

        for (let sIdx = 0; sIdx < 5; sIdx++) {
            const ox = (sIdx - 2) * 0.74;
            const oy = -1.39;

            const bzMesh = new THREE.Mesh(orbBezelGeo, slotGoldBezelMat);
            bzMesh.position.set(ox, oy, 0.85);
            const bzOut = new THREE.Mesh(orbBezelOutGeo, slotInkOutlineMat);
            bzOut.position.copy(bzMesh.position);
            bzOut.renderOrder = -1;
            this.miniSlotGroup.add(bzMesh, bzOut);

            const orbMat = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0ea5e9,
                emissiveIntensity: 0.95,
                roughness: 0.14,
                metalness: 0.15
            });
            const orbMesh = new THREE.Mesh(orbGemGeo, orbMat);
            orbMesh.position.set(ox, oy, 0.89);
            const orbOut = new THREE.Mesh(orbGemOutGeo, slotInkOutlineMat);
            orbOut.position.copy(orbMesh.position);
            orbOut.scale.copy(orbMesh.scale);
            orbOut.renderOrder = -1;
            this.miniSlotGroup.add(orbMesh, orbOut);
            this.slotSpinOrbs.push(orbMesh);
        }

        // 9. Articulated 3D Mechanical Side Pull-Lever Assembly (Right Flank)
        const leverMountGroup = new THREE.Group();
        leverMountGroup.position.set(2.84, -0.28, -0.18);
        this.miniSlotGroup.add(leverMountGroup);

        const gearboxGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.44, 24);
        gearboxGeo.rotateZ(Math.PI / 2);
        applyBoundsPlanarUVs(gearboxGeo, 1, 1);
        const gearboxMesh = new THREE.Mesh(gearboxGeo, slotIronMat);
        gearboxMesh.position.x = 0.16;
        const gearboxOut = new THREE.Mesh(makeSmoothOutlineGeo(gearboxGeo, 0.044), slotInkOutlineMat);
        gearboxOut.position.copy(gearboxMesh.position);
        gearboxOut.renderOrder = -1;
        leverMountGroup.add(gearboxMesh, gearboxOut);

        const hubCapGeo = new THREE.CylinderGeometry(0.28, 0.30, 0.12, 24);
        hubCapGeo.rotateZ(Math.PI / 2);
        const hubCapMesh = new THREE.Mesh(hubCapGeo, slotGoldBezelMat);
        hubCapMesh.position.x = 0.42;
        const hubCapOut = new THREE.Mesh(makeSmoothOutlineGeo(hubCapGeo, 0.036), slotInkOutlineMat);
        hubCapOut.position.copy(hubCapMesh.position);
        hubCapOut.renderOrder = -1;
        leverMountGroup.add(hubCapMesh, hubCapOut);

        this.slotLeverPivot = new THREE.Group();
        this.slotLeverPivot.position.set(0.36, 0, 0);
        leverMountGroup.add(this.slotLeverPivot);

        const shaftCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.14, 0.42, 0.10),
            new THREE.Vector3(0.20, 1.08, 0.22),
            new THREE.Vector3(0.20, 1.68, 0.28)
        ]);
        const shaftGeo = new THREE.TubeGeometry(shaftCurve, 20, 0.088, 14, false);
        const shaftMesh = new THREE.Mesh(shaftGeo, slotChromeShaftMat);
        const shaftOut = new THREE.Mesh(makeSmoothOutlineGeo(shaftGeo, 0.038), slotInkOutlineMat);
        shaftOut.renderOrder = -1;
        this.slotLeverPivot.add(shaftMesh, shaftOut);

        const ferruleGeo = new THREE.CylinderGeometry(0.145, 0.125, 0.16, 18);
        const ferruleMesh = new THREE.Mesh(ferruleGeo, slotGoldBezelMat);
        ferruleMesh.position.set(0.20, 1.62, 0.27);
        const ferruleOut = new THREE.Mesh(makeSmoothOutlineGeo(ferruleGeo, 0.030), slotInkOutlineMat);
        ferruleOut.position.copy(ferruleMesh.position);
        ferruleOut.renderOrder = -1;
        this.slotLeverPivot.add(ferruleMesh, ferruleOut);

        const knobGeo = new THREE.SphereGeometry(0.34, 24, 20);
        applyBoundsPlanarUVs(knobGeo, 1, 1);
        const knobMesh = new THREE.Mesh(knobGeo, slotCrimsonMat);
        knobMesh.position.set(0.20, 1.94, 0.30);
        const knobOut = new THREE.Mesh(makeSmoothOutlineGeo(knobGeo, 0.048), slotInkOutlineMat);
        knobOut.position.copy(knobMesh.position);
        knobOut.renderOrder = -1;
        this.slotLeverPivot.add(knobMesh, knobOut);

        // 10. Warm Studio Key Illumination for Reels, Brass & Oak Cabinet
        const slotKeyLight = new THREE.PointLight(0xfff5d6, 1.45, 22.0, 1.25);
        slotKeyLight.position.set(0, 1.4, 5.4);
        this.miniSlotGroup.add(slotKeyLight);

        const slotRimAccent = new THREE.PointLight(0xa855f7, 0.75, 16.0, 1.25);
        slotRimAccent.position.set(0, 2.8, 3.2);
        this.miniSlotGroup.add(slotRimAccent);

        this.miniSlotGroup.scale.setScalar(1.24);
    }

    /**
     * Updates the 5 physical 3D spin-charge cabochon gems on the lower brass slot deck (zero text).
     */
    private syncSlotCabinetIndicators(spinsLeft: number, maxSpins: number, accumulator: number) {
        updateSlotLedDisplayCanvas(this.textures.slotLedDisplayCanvas, spinsLeft, maxSpins, accumulator);
        this.textures.slotLedDisplayTex.needsUpdate = true;

        const activeCount = Math.max(0, Math.min(this.slotSpinOrbs.length, spinsLeft));
        const hasAccum = accumulator > 0;
        for (let i = 0; i < this.slotSpinOrbs.length; i++) {
            const mat = this.slotSpinOrbs[i].material as THREE.MeshStandardMaterial;
            if (i < activeCount) {
                mat.color.setHex(hasAccum ? 0xfde047 : 0x38bdf8);
                mat.emissive.setHex(hasAccum ? 0xd97706 : 0x0284c7);
                mat.emissiveIntensity = 0.95;
            } else {
                mat.color.setHex(0x1e293b);
                mat.emissive.setHex(0x090d16);
                mat.emissiveIntensity = 0.12;
            }
        }
    }

    /**
     * Cinematic Roulette Sequence:
     * 1. Starfighter approaches and brakes smoothly right before touching the crate.
     * 2. Small roulette on the crate vanishes with golden pop effect.
     * 3. Astronaut opens cockpit canopy, pressurized smoke vents, and he jumps into the void.
     * 4. Cosmic void scene: astronaut floats from behind facing Giant 3D Prize Wheel.
     * 5. Activates Yellow "GIRAR" button.
     */
    public triggerRouletteSequence(worldX: number, worldZ: number, _pick: RoundPick) {
        this.isRouletteActive = true;
        this.isWheelSpinning = false;
        this.isSlotActive = false;
        this.isSlotSpinning = false;
        if (this.miniSlotGroup) this.miniSlotGroup.visible = false;
        this.lastFlapperPegIndex = -1;

        // 1. Starfighter approaches and brakes smoothly right before the box
        gsap.killTweensOf(this.ship.pos);
        this.ship.vel.set(0, 0, 0);
        gsap.to(this.ship.pos, {
            x: worldX,
            y: SHIP_FLIGHT_Y,
            z: worldZ + 1.85,
            duration: 0.22,
            ease: 'power2.out',
            onComplete: () => {
                // 2. 3D Prize Wheel stand vanishes with golden pop burst
                const hitCard = this.rowSlots
                    .flat()
                    .find(
                        (c) =>
                            Math.abs(c.group.position.z - worldZ) < 1.2 &&
                            Math.abs(c.group.position.x - worldX) < 1.2
                    );
                if (hitCard && hitCard.wheelStandGroup) {
                    audioController.playWheelPop();
                    this.vfx.spawnShockwave3D(worldX, 1.55, worldZ, 0xfacc15, 6.0, 0.35);
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.55,
                        worldZ,
                        90,
                        [0xfde047, 0xfacc15, 0xeab308, 0xffffff],
                        8,
                        20,
                        0.55
                    );
                    gsap.to(hitCard.wheelStandGroup.scale, {
                        x: 1.6,
                        y: 1.6,
                        z: 1.6,
                        duration: 0.12,
                        ease: 'back.out(2)',
                        onComplete: () => {
                            hitCard.wheelStandGroup.visible = false;
                        }
                    });
                }

                // 3. Canopy opens & pressurized smoke vents out
                this.ship.openCockpitCanopy(0.18);
                this.vfx.spawnGpuParticleCloud(
                    worldX,
                    SHIP_FLIGHT_Y + 0.45,
                    worldZ + 1.85,
                    65,
                    [0xffffff, 0xe0f2fe, 0xbae6fd, 0x38bdf8],
                    4,
                    12,
                    0.5
                );
                this.vfx.spawnGpuParticleCloud(
                    worldX + 0.15,
                    SHIP_FLIGHT_Y + 0.35,
                    worldZ + 1.95,
                    45,
                    [0xffffff, 0xf1f5f9],
                    3,
                    10,
                    0.5
                );

                // 4. Astronaut ejects into zero-G void
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);
                gsap.to(this.ship.cockpitAstronaut.position, {
                    y: 2.4,
                    z: 0.7,
                    duration: 0.22,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.ship.cockpitAstronaut.visible = false;
                        this.ship.root.visible = false; // Starfighter leaves focus so scene is purely astronaut in zero-G void!

                        // 5. Cosmic Void Scene Setup: Giant Wheel center, Mr. Dollar croupier on left, Astronaut watching on right!
                        const wheelZ = worldZ - 7.5;
                        const wheelY = SHIP_FLIGHT_Y + 0.85;

                        this.giantRouletteGroup.visible = true;
                        this.giantRouletteGroup.position.set(worldX, wheelY + 14, wheelZ);
                        this.wheelCurrentAngle = 0;
                        this.giantWheelDisc.rotation.z = 0;

                        gsap.to(this.giantRouletteGroup.position, {
                            y: wheelY,
                            duration: 0.38,
                            ease: 'back.out(1.15)'
                        });

                        const hostX = worldX - 4.48;
                        const hostY = wheelY - 0.55;
                        const hostZ = wheelZ + 0.85;
                        this.mrDollar3D.root.visible = true;
                        this.mrDollar3D.root.rotation.set(0, 0.22, 0);
                        this.mrDollar3D.root.position.set(hostX - 2.4, hostY + 6.5, hostZ);
                        gsap.to(this.mrDollar3D.root.position, {
                            x: hostX,
                            y: hostY,
                            z: hostZ,
                            duration: 0.38,
                            ease: 'back.out(1.2)'
                        });
                        this.mrDollar3D.playEntranceAnimation();

                        this.floatingAstronautGroup.visible = true;
                        this.floatingAstronautGroup.position.set(
                            worldX + 3.85,
                            SHIP_FLIGHT_Y - 0.78,
                            wheelZ + 4.85
                        );
                        this.floatingAstronautGroup.rotation.y = 0.46;
                        gsap.fromTo(
                            this.floatingAstronautGroup.position,
                            { y: SHIP_FLIGHT_Y + 1.6 },
                            { y: SHIP_FLIGHT_Y - 0.78, duration: 0.32, ease: 'power2.out' }
                        );

                        // Signal UI that yellow GIRAR button is now active!
                        window.dispatchEvent(new CustomEvent('roulette-ready'));
                    }
                });
            }
        });
    }

    /**
     * Executes the Provably Fair spin animation of the Giant Prize Wheel
     * with authentic flapper audio clicks, near-miss suspense deceleration, and payout celebration!
     */
    public spinGiantWheel(outcome: WheelSpinOutcome, onComplete: () => void) {
        if (this.isWheelSpinning) return;
        this.isWheelSpinning = true;

        const startAngle = this.wheelCurrentAngle;
        const currentMod = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const targetMod = ((outcome.spinAngleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let delta = (targetMod - currentMod) % (Math.PI * 2);
        if (delta < 0) delta += Math.PI * 2;
        const baseFullRevs = Math.max(5 * Math.PI * 2, Math.floor(outcome.spinAngleRad / (Math.PI * 2)) * (Math.PI * 2));
        const targetAngle = startAngle + baseFullRevs + delta;
        const totalDuration = outcome.isNearMiss ? 5.8 : 4.4;

        const spinTracker = { progress: 0 };
        this.lastFlapperPegIndex = -1;
        let nearMissQuipped = false;

        // Slight clockwise anticipation tension on wheel while Mr. Dollar reaches up to grip the 10 o'clock rim!
        const windupStartAngle = startAngle - 0.08;
        gsap.to(this.giantWheelDisc.rotation, {
            z: windupStartAngle,
            duration: 0.22,
            ease: 'power2.out'
        });

        this.mrDollar3D.playWheelGrabAndSpin(() => {
            // Mr. Dollar yanks the 10 o'clock rim downward -> golden sparks & full CCW wheel launch!
            const wx = this.giantRouletteGroup.position.x;
            const wy = this.giantRouletteGroup.position.y;
            const wz = this.giantRouletteGroup.position.z;
            this.vfx.spawnGpuParticleCloud(
                wx - 3.35,
                wy + 0.15,
                wz + 0.55,
                45,
                [0xfde047, 0xfacc15, 0x86efac, 0xffffff],
                5,
                13,
                0.42
            );

            gsap.to(spinTracker, {
                progress: 1.0,
                duration: totalDuration,
                ease: outcome.isNearMiss ? 'power2.out' : 'power3.out',
                onUpdate: () => {
                    let t = spinTracker.progress;
                    // Near-miss agonizing crawl as wheel slows right next to jackpot/high prize
                    if (outcome.isNearMiss && t > 0.68) {
                        const localT = (t - 0.68) / 0.32;
                        t = 0.68 + Math.pow(localT, 2.2) * 0.32;
                        if (!nearMissQuipped && spinTracker.progress > 0.72) {
                            nearMissQuipped = true;
                            this.mrDollar3D.playNearMissReaction();
                        }
                    }

                    const currentAngle = windupStartAngle + (targetAngle - windupStartAngle) * t;
                    this.wheelCurrentAngle = currentAngle;
                    this.giantWheelDisc.rotation.z = currentAngle;

                    const sectorSize = (Math.PI * 2) / 12;
                    const shiftedPegAngle = currentAngle + sectorSize * 0.5;
                    const pegIndex = Math.floor(shiftedPegAngle / sectorSize);

                    // Flapper mechanical deflection as 3D golden rim peg pushes arrow tip left at 12 o'clock
                    const sectorOffset = ((shiftedPegAngle % sectorSize) + sectorSize) % sectorSize;
                    const normInSector = sectorOffset / sectorSize;
                    if (normInSector > 0.72) {
                        this.giantWheelFlapper.rotation.z = -(normInSector - 0.72) * 1.25;
                    }

                    if (pegIndex !== this.lastFlapperPegIndex) {
                        this.lastFlapperPegIndex = pegIndex;

                        // Elastic snapback of mechanical flapper
                        gsap.to(this.giantWheelFlapper.rotation, {
                            z: 0,
                            duration: 0.08,
                            ease: 'back.out(2.5)'
                        });

                        const speed = 1.0 - t;
                        const pitch = 0.7 + speed * 0.9;
                        audioController.playWheelTick(pitch);

                        // Near-miss suspense heartbeat pulse & screen micro-shake
                        if (outcome.isNearMiss && t > 0.80) {
                            audioController.playWheelNearMiss();
                            this.vfx.triggerScreenShake(0.12, 0.08);
                        }
                    }
                },
                onComplete: () => {
                    // Keep this.isWheelSpinning = true throughout result display & celebration
                    // so the user cannot trigger duplicate spins or see the wheel prematurely vanish!
                    const worldX = this.giantRouletteGroup.position.x;
                    const wheelY = this.giantRouletteGroup.position.y;
                    const wheelZ = this.giantRouletteGroup.position.z;

                    this.mrDollar3D.playOutcomeReaction(outcome.segment.type, outcome.segment.multiplier);

                    this.vfx.triggerScreenShake(0.35, 0.25);
                    this.vfx.spawnShockwave3D(worldX, wheelY, wheelZ, 0xfacc15, 9.0, 0.45);
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        wheelY,
                        wheelZ,
                        160,
                        [0xfde047, 0xfacc15, 0xeab308, 0xffffff, 0xec4899],
                        12,
                        26,
                        0.72
                    );

                    const isBonusBuy = this.gameState.engine.wheelProfile === 'BONUS_BUY';
                    if (outcome.segment.type === 'WIPEOUT') {
                        audioController.playWheelWipeout();
                        this.vfx.spawnCrashExplosion3D(worldX, SHIP_FLIGHT_Y, wheelZ - 2.0);
                        this.vfx.triggerScreenShake(0.65, 0.45);
                        const wipeoutDelay = isBonusBuy ? 1100 : 1800;
                        setTimeout(() => {
                            this.finishRouletteSequence(() => {
                                this.isWheelSpinning = false;
                                onComplete();
                            });
                        }, wipeoutDelay);
                    } else if (outcome.segment.type === 'EXTRA_SPIN') {
                        audioController.playGoldenHit();
                        setTimeout(() => {
                            this.isWheelSpinning = false;
                            onComplete();
                        }, 1100);
                    } else if (outcome.segment.type === 'SLOT') {
                        audioController.playGoldenHit();
                        setTimeout(() => {
                            this.isRouletteActive = false;
                            this.isWheelSpinning = false;
                            const spinsCount = this.gameState.engine.slotBundle?.spins.length || 5;
                            this.triggerSlotSequence(worldX, wheelZ + 7.5, spinsCount, 0);
                            onComplete();
                        }, 1200);
                    } else {
                        audioController.playCashout(outcome.segment.multiplier >= 10);
                        this.vfx.spawnGraffitiMultiplierTag3D(
                            worldX,
                            wheelY + 1.2,
                            wheelZ,
                            this.gameState.engine.currentMultiplier,
                            this.gameState.engine.currentRow
                        );

                        const winDelay = isBonusBuy ? 1300 : 2000;
                        setTimeout(() => {
                            this.finishRouletteSequence(() => {
                                this.isWheelSpinning = false;
                                onComplete();
                            });
                        }, winDelay);
                    }
                }
            });
        });
    }

    public finishRouletteSequence(onComplete?: () => void) {
        const engine = this.gameState.engine;
        const isBonusBuy = engine.wheelProfile === 'BONUS_BUY';
        const mult = engine.currentMultiplier;
        const payout = isBonusBuy ? Math.round(engine.betAmount * mult * 100) / 100 : 0;

        const exitDuration = 0.28;

        // Giant Roulette & Mr. Dollar rise smoothly out of frame
        this.mrDollar3D.hideSpeech();
        if (this.mrDollar3D.root.visible) {
            gsap.to(this.mrDollar3D.root.position, {
                y: this.mrDollar3D.root.position.y + 16,
                duration: exitDuration,
                ease: 'power2.in',
                onComplete: () => {
                    this.mrDollar3D.root.visible = false;
                }
            });
        }

        gsap.to(this.giantRouletteGroup.position, {
            y: this.giantRouletteGroup.position.y + 18,
            duration: exitDuration,
            ease: 'power2.in',
            onComplete: () => {
                this.giantRouletteGroup.visible = false;
                this.isRouletteActive = false;
            }
        });

        // Astronaut floats back and boards starfighter concurrently
        gsap.to(this.floatingAstronautGroup.position, {
            y: SHIP_FLIGHT_Y + 1.8,
            duration: exitDuration * 0.85,
            ease: 'power2.in',
            onComplete: () => {
                this.floatingAstronautGroup.visible = false;
                this.floatingAstronautGroup.rotation.y = 0;
                this.ship.root.visible = true;
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);

                this.ship.closeCockpitCanopy(0.16, () => {
                    this.ship.cockpitAstronaut.visible = false;
                    if (isBonusBuy) {
                        this.resetCameraAndShipToBase();
                        engine.completeBonusBuyRound(payout, mult);
                        if (onComplete) onComplete();
                    } else {
                        this.ship.triggerSpeedBurst(0.45);
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }

    /**
     * Direct VIP Bonus Buy trigger for Cosmic Prize Wheel.
     * Glides the Starfighter forward into the open cosmic void, vents canopy smoke,
     * ejects astronaut into zero-G, hides crates, and descends the Giant Prize Wheel.
     */
    public triggerDirectWheelBonusSequence(onReady?: () => void) {
        this.isRouletteActive = true;
        this.isWheelSpinning = false;
        this.isSlotActive = false;
        this.isSlotSpinning = false;
        if (this.miniSlotGroup) this.miniSlotGroup.visible = false;
        this.lastFlapperPegIndex = -1;

        // Hide crate platforms so the cosmic void is 100% clean
        this.rowSlots.flat().forEach(slot => { slot.group.visible = false; });

        const worldX = 0;
        const targetShipZ = -3.0;
        const wheelZ = targetShipZ - 7.5;
        const wheelY = SHIP_FLIGHT_Y + 0.85;

        gsap.killTweensOf(this.ship.pos);
        this.ship.vel.set(0, 0, 0);
        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
        this.ship.root.visible = true;
        this.ship.resetCockpit();

        audioController.playStartRound();
        gsap.to(this.ship.pos, {
            x: worldX,
            y: SHIP_FLIGHT_Y,
            z: targetShipZ,
            duration: 0.28,
            ease: 'power3.out',
            onComplete: () => {
                // Canopy opens & pressurized smoke vents out
                audioController.playWheelPop();
                this.ship.openCockpitCanopy(0.18);
                this.vfx.spawnGpuParticleCloud(worldX, SHIP_FLIGHT_Y + 0.45, targetShipZ, 55, [0xffffff, 0xe0f2fe, 0xbae6fd, 0x38bdf8], 4, 12, 0.5);

                // Astronaut ejects into zero-G void
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);
                gsap.to(this.ship.cockpitAstronaut.position, {
                    y: 2.4,
                    z: 0.7,
                    duration: 0.22,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.ship.cockpitAstronaut.visible = false;
                        this.ship.root.visible = false;

                        // Cosmic Void Scene Setup: Giant Wheel center, Mr. Dollar croupier on left, Astronaut watching on right!
                        this.giantRouletteGroup.visible = true;
                        this.giantRouletteGroup.position.set(worldX, wheelY + 14, wheelZ);
                        this.wheelCurrentAngle = 0;
                        this.giantWheelDisc.rotation.z = 0;

                        gsap.to(this.giantRouletteGroup.position, {
                            y: wheelY,
                            duration: 0.38,
                            ease: 'back.out(1.15)'
                        });

                        const hostX = worldX - 4.48;
                        const hostY = wheelY - 0.55;
                        const hostZ = wheelZ + 0.85;
                        this.mrDollar3D.root.visible = true;
                        this.mrDollar3D.root.rotation.set(0, 0.22, 0);
                        this.mrDollar3D.root.position.set(hostX - 2.4, hostY + 6.5, hostZ);
                        gsap.to(this.mrDollar3D.root.position, {
                            x: hostX,
                            y: hostY,
                            z: hostZ,
                            duration: 0.38,
                            ease: 'back.out(1.2)'
                        });
                        this.mrDollar3D.playEntranceAnimation();

                        this.floatingAstronautGroup.visible = true;
                        this.floatingAstronautGroup.position.set(worldX + 3.85, SHIP_FLIGHT_Y - 0.78, wheelZ + 4.85);
                        this.floatingAstronautGroup.rotation.y = 0.46;
                        gsap.fromTo(
                            this.floatingAstronautGroup.position,
                            { y: SHIP_FLIGHT_Y + 1.6 },
                            { y: SHIP_FLIGHT_Y - 0.78, duration: 0.32, ease: 'power2.out' }
                        );

                        window.dispatchEvent(new CustomEvent('roulette-ready'));
                        if (onReady) onReady();
                    }
                });
            }
        });
    }

    /**
     * Maps a SlotSymbolId and SlotReelOffset to the exact cylinder rotation angle.
     */
    private getSlotReelTargetAngle(currentAngle: number, symbol: SlotSymbolId, offset: SlotReelOffset): number {
        const sectorAngle = (Math.PI * 2) / 12;
        const indicesMap: Record<SlotSymbolId, number[]> = {
            'X88': [0, 6],
            'X28': [4, 9],
            'X10': [2, 8],
            'X8':  [5, 10],
            'X4':  [1, 3, 7, 11],
            'BLANK': [1, 3, 5, 7, 10]
        };

        const available = indicesMap[symbol] || [0];
        const targetSector = available[0];

        // Offset: CENTER = 0, UP = +0.38 sectors, DOWN = -0.38 sectors (placing symbol half a step off-center)
        const offsetShift = offset === 'UP' ? 0.38 * sectorAngle : (offset === 'DOWN' ? -0.38 * sectorAngle : 0);
        const targetSectorBase = (targetSector + 0.5) * sectorAngle + offsetShift;

        // Ensure at least 4 full forward revolutions for exhilarating visual spin
        const minRevolutions = 4 * Math.PI * 2;
        const currentMod = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let delta = (targetSectorBase - currentMod) % (Math.PI * 2);
        if (delta < 0) delta += Math.PI * 2;

        return currentAngle + minRevolutions + delta;
    }

    /**
     * Transitions from Cosmic Prize Wheel or Direct Bonus Buy into the 3D Arcade Mini-Slot Machine (1x3).
     * Astronaut remains in zero-G void floating and observing the cyber arcade cabinet!
     */
    public triggerSlotSequence(worldX: number, worldZ: number, spinsLeft: number, accumulator: number) {
        this.isSlotActive = true;
        this.isSlotSpinning = false;
        this.isRouletteActive = false;
        this.isWheelSpinning = false;
        this.gameState.engine.activateSlotBonus();

        const slotZ = worldZ - 6.2;
        const slotY = SHIP_FLIGHT_Y + 1.16;

        // Ensure floating astronaut glides cleanly to the lower-left without overlapping the slot clamps
        this.floatingAstronautGroup.visible = true;
        gsap.to(this.floatingAstronautGroup.position, {
            x: worldX - 3.92,
            y: SHIP_FLIGHT_Y - 0.88,
            z: worldZ - 2.6,
            duration: 0.34,
            ease: 'power2.out'
        });
        gsap.to(this.floatingAstronautGroup.rotation, {
            y: -0.38,
            duration: 0.34,
            ease: 'power2.out'
        });
        this.ship.root.visible = false;

        // Slide the Giant Prize Wheel & Mr. Dollar out of view if visible
        this.mrDollar3D.hideSpeech();
        if (this.mrDollar3D.root.visible) {
            gsap.to(this.mrDollar3D.root.position, {
                y: this.mrDollar3D.root.position.y + 16,
                duration: 0.28,
                ease: 'power2.in',
                onComplete: () => {
                    this.mrDollar3D.root.visible = false;
                }
            });
        }
        if (this.giantRouletteGroup && this.giantRouletteGroup.visible) {
            gsap.to(this.giantRouletteGroup.position, {
                y: this.giantRouletteGroup.position.y + 18,
                duration: 0.28,
                ease: 'power2.in',
                onComplete: () => {
                    this.giantRouletteGroup.visible = false;
                }
            });
        }

        // Reset reels to centered hero Jackpot emblem & initialize 3D spin-charge cabochon gems
        const restAng = (Math.PI * 2) / 24;
        for (let r = 0; r < this.slotReels.length; r++) {
            this.slotReelAngles[r] = restAng;
            this.slotReels[r].rotation.x = restAng;
        }
        if (this.slotLeverPivot) this.slotLeverPivot.rotation.set(0, 0, 0);

        this.syncSlotCabinetIndicators(
            spinsLeft,
            this.gameState.engine.slotBundle?.spins.length || 5,
            accumulator
        );

        // Animate Mini-Slot dropping into view in front of the astronaut with high impact
        this.miniSlotGroup.visible = true;
        this.miniSlotGroup.position.set(worldX, slotY + 14, slotZ);

        gsap.to(this.miniSlotGroup.position, {
            y: slotY,
            duration: 0.38,
            ease: 'back.out(1.15)',
            onComplete: () => {
                this.vfx.spawnShockwave3D(worldX, slotY, slotZ, 0x38bdf8, 6.0, 0.28);
                this.vfx.spawnGpuParticleCloud(
                    worldX,
                    slotY,
                    slotZ + 0.5,
                    60,
                    [0x38bdf8, 0xa855f7, 0xfde047, 0xffffff],
                    6,
                    15,
                    0.5
                );
                audioController.playSlotLineWin(false);
                window.dispatchEvent(new CustomEvent('slot-ready'));
            }
        });
    }

    /**
     * Direct VIP Bonus Buy trigger for 3D Arcade Mini-Slot Machine.
     * Glides the Starfighter forward into the open cosmic void, vents canopy smoke,
     * ejects astronaut into zero-G facing slot, hides crates, and descends the Arcade Slot Machine!
     */
    public triggerDirectSlotBonusSequence(spinsCount: number, onReady?: () => void) {
        this.isSlotActive = true;
        this.isSlotSpinning = false;
        this.isRouletteActive = false;
        this.isWheelSpinning = false;
        if (this.giantRouletteGroup) this.giantRouletteGroup.visible = false;
        if (this.mrDollar3D) {
            this.mrDollar3D.hideSpeech();
            this.mrDollar3D.root.visible = false;
        }

        // Hide crate platforms so the cosmic void is 100% clean
        this.rowSlots.flat().forEach(slot => { slot.group.visible = false; });

        const worldX = 0;
        const targetShipZ = -3.0;
        const slotZ = targetShipZ - 6.2;
        const slotY = SHIP_FLIGHT_Y + 1.16;

        gsap.killTweensOf(this.ship.pos);
        this.ship.vel.set(0, 0, 0);
        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
        this.ship.root.visible = true;
        this.ship.resetCockpit();

        audioController.playStartRound();
        gsap.to(this.ship.pos, {
            x: worldX,
            y: SHIP_FLIGHT_Y,
            z: targetShipZ,
            duration: 0.28,
            ease: 'power3.out',
            onComplete: () => {
                // Canopy opens & pressurized smoke vents out
                audioController.playWheelPop();
                this.ship.openCockpitCanopy(0.18);
                this.vfx.spawnGpuParticleCloud(worldX, SHIP_FLIGHT_Y + 0.45, targetShipZ, 55, [0xffffff, 0xe0f2fe, 0xbae6fd, 0x38bdf8], 4, 12, 0.5);

                // Astronaut ejects into zero-G void
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);
                gsap.to(this.ship.cockpitAstronaut.position, {
                    y: 2.4,
                    z: 0.7,
                    duration: 0.22,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.ship.cockpitAstronaut.visible = false;
                        this.ship.root.visible = false;

                        // Position floating astronaut flanking cleanly to the lower-left of the slot
                        this.floatingAstronautGroup.visible = true;
                        this.floatingAstronautGroup.position.set(
                            worldX - 3.92,
                            SHIP_FLIGHT_Y - 0.88,
                            targetShipZ - 2.6
                        );
                        this.floatingAstronautGroup.rotation.y = -0.38;

                        const restAng = (Math.PI * 2) / 24;
                        for (let r = 0; r < this.slotReels.length; r++) {
                            this.slotReelAngles[r] = restAng;
                            this.slotReels[r].rotation.x = restAng;
                        }
                        if (this.slotLeverPivot) this.slotLeverPivot.rotation.set(0, 0, 0);

                        this.syncSlotCabinetIndicators(spinsCount, spinsCount, 0);

                        // Animate Mini-Slot dropping into view in front of astronaut
                        this.miniSlotGroup.visible = true;
                        this.miniSlotGroup.position.set(worldX, slotY + 14, slotZ);

                        gsap.to(this.miniSlotGroup.position, {
                            y: slotY,
                            duration: 0.38,
                            ease: 'back.out(1.15)',
                            onComplete: () => {
                                this.vfx.spawnShockwave3D(worldX, slotY, slotZ, 0x38bdf8, 6.0, 0.28);
                                this.vfx.spawnGpuParticleCloud(
                                    worldX,
                                    slotY,
                                    slotZ + 0.5,
                                    60,
                                    [0x38bdf8, 0xa855f7, 0xfde047, 0xffffff],
                                    6,
                                    15,
                                    0.5
                                );
                                audioController.playSlotLineWin(false);
                                window.dispatchEvent(new CustomEvent('slot-ready'));
                                if (onReady) onReady();
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Executes the Provably Fair spin animation of the 3D 1x3 Arcade Mini-Slot Machine.
     * Features tactile 3D side-lever crank, staggered reel stops (CLANK), agonizing near-miss
     * slow crawl on Reel 3, central payline ignition, and 3D spin-gem indicator updates!
     */
    public spinSlotReels(
        outcome: SlotSpinOutcome,
        spinsLeft: number,
        accumulator: number,
        onComplete: () => void
    ) {
        if (this.isSlotSpinning) return;
        this.isSlotSpinning = true;

        const totalSpins = this.gameState.engine.slotBundle?.spins.length || 5;

        // Tactile 3D Mechanical Side Pull-Lever Crank & Spring Return
        if (this.slotLeverPivot) {
            gsap.killTweensOf(this.slotLeverPivot.rotation);
            gsap.timeline()
                .to(this.slotLeverPivot.rotation, {
                    x: 0.92,
                    duration: 0.14,
                    ease: 'power2.in'
                })
                .to(this.slotLeverPivot.rotation, {
                    x: 0,
                    duration: 0.36,
                    ease: 'back.out(2.4)'
                });
        }

        // Sound: continuous mechanical reel spin
        audioController.playSlotReelSpin();

        // Target angles for each of the 3 reels
        const tgt0 = this.getSlotReelTargetAngle(this.slotReelAngles[0], outcome.reels[0].symbol, outcome.reels[0].offset);
        const tgt1 = this.getSlotReelTargetAngle(this.slotReelAngles[1], outcome.reels[1].symbol, outcome.reels[1].offset);
        const tgt2 = this.getSlotReelTargetAngle(this.slotReelAngles[2], outcome.reels[2].symbol, outcome.reels[2].offset);

        const reel0Obj = { angle: this.slotReelAngles[0] };
        const reel1Obj = { angle: this.slotReelAngles[1] };
        const reel2Obj = { angle: this.slotReelAngles[2] };

        // 1. Reel 0 Stops at 0.75s
        gsap.to(reel0Obj, {
            angle: tgt0,
            duration: 0.75,
            ease: 'back.out(1.4)',
            onUpdate: () => {
                this.slotReelAngles[0] = reel0Obj.angle;
                this.slotReels[0].rotation.x = reel0Obj.angle;
            },
            onComplete: () => {
                audioController.playSlotReelStop(0);
                this.vfx.triggerScreenShake(0.08, 0.05);
            }
        });

        // 2. Reel 1 Stops at 1.35s
        gsap.to(reel1Obj, {
            angle: tgt1,
            duration: 1.35,
            ease: 'back.out(1.4)',
            onUpdate: () => {
                this.slotReelAngles[1] = reel1Obj.angle;
                this.slotReels[1].rotation.x = reel1Obj.angle;
            },
            onComplete: () => {
                audioController.playSlotReelStop(1);
                this.vfx.triggerScreenShake(0.12, 0.06);

                if (outcome.isNearMiss) {
                    // Start Near-Miss high tension audio as Reel 3 crawls agonizingly slow!
                    audioController.playSlotNearMissTension();
                    // Flash payline beam with warning crimson/amber
                    const payMat = this.slotPaylineBeam.material as THREE.MeshStandardMaterial;
                    gsap.to(payMat, {
                        opacity: 0.82,
                        emissiveIntensity: 2.2,
                        duration: 0.15,
                        yoyo: true,
                        repeat: 5,
                        onComplete: () => {
                            payMat.opacity = 0.14;
                            payMat.emissiveIntensity = 0.85;
                        }
                    });
                }
            }
        });

        // 3. Reel 2 Stops with Stagger & Near-Miss / Win Drama
        const reel2Duration = outcome.isNearMiss ? 3.1 : 1.95;
        const reel2Ease = outcome.isNearMiss ? 'power1.out' : 'back.out(1.3)';

        gsap.to(reel2Obj, {
            angle: tgt2,
            duration: reel2Duration,
            ease: reel2Ease,
            onUpdate: () => {
                this.slotReelAngles[2] = reel2Obj.angle;
                this.slotReels[2].rotation.x = reel2Obj.angle;

                if (outcome.isNearMiss && reel2Obj.angle > tgt2 - 1.2) {
                    this.vfx.triggerScreenShake(0.04, 0.04);
                }
            },
            onComplete: () => {
                audioController.playSlotReelStop(2);

                const slotPos = this.miniSlotGroup.position;

                if (outcome.isWin) {
                    // Win Animation: Payline laser ignition, marquee bulb flash & electric sparks!
                    audioController.playSlotLineWin(outcome.multiplier >= 28);
                    this.vfx.triggerScreenShake(0.35, 0.22);
                    this.vfx.spawnShockwave3D(slotPos.x, slotPos.y + 0.05, slotPos.z + 1.0, 0xfde047, 8.0, 0.4);
                    this.vfx.spawnGpuParticleCloud(
                        slotPos.x,
                        slotPos.y + 0.05,
                        slotPos.z + 1.1,
                        120,
                        [0xfde047, 0xfacc15, 0x38bdf8, 0xffffff],
                        10,
                        22,
                        0.7
                    );

                    // Pulse payline beam & 9 3D marquee arch bulbs
                    const payMat = this.slotPaylineBeam.material as THREE.MeshStandardMaterial;
                    gsap.fromTo(
                        payMat,
                        { opacity: 0.96, emissiveIntensity: 2.6 },
                        { opacity: 0.14, emissiveIntensity: 0.85, duration: 0.65, ease: 'power2.out' }
                    );
                    gsap.fromTo(
                        this.slotPaylineBeam.scale,
                        { y: 3.5, z: 3.5 },
                        { y: 1.0, z: 1.0, duration: 0.45, ease: 'elastic.out(1.2, 0.4)' }
                    );
                    this.slotMarqueeBulbs.forEach((bulb, bIdx) => {
                        const bMat = bulb.material as THREE.MeshStandardMaterial;
                        gsap.fromTo(
                            bMat,
                            { emissiveIntensity: 2.8 },
                            { emissiveIntensity: 0.95, duration: 0.55, delay: bIdx * 0.03 }
                        );
                    });
                } else if (outcome.isNearMiss) {
                    // Agonizing Near-Miss halt!
                    this.vfx.triggerScreenShake(0.2, 0.15);
                    this.vfx.spawnShockwave3D(slotPos.x + 1.4, slotPos.y + 0.05, slotPos.z + 1.0, 0xef4444, 4.0, 0.25);
                }

                // Update 3D spin-charge cabochon gems & backing LED state
                this.syncSlotCabinetIndicators(spinsLeft, totalSpins, accumulator);

                // Fast, snappy resolution without lingering lag
                const postSpinDelay = spinsLeft === 0 ? 180 : 380;
                setTimeout(() => {
                    this.isSlotSpinning = false;
                    onComplete();
                }, postSpinDelay);
            }
        });
    }

    /**
     * Finishes the 1x3 Arcade Mini-Slot Bonus sequence:
     * Celebrates total accumulated multiplier payout, returns astronaut to starfighter,
     * and resumes gameplay flow.
     */
    public finishSlotSequence(finalAccumulator: number, onComplete?: () => void) {
        const slotPos = this.miniSlotGroup.position;
        const engine = this.gameState.engine;
        const isBonusBuy = engine.slotBundle?.profile === 'BONUS_BUY' || engine.wheelProfile === 'BONUS_BUY';
        const effectiveMult = isBonusBuy ? finalAccumulator : engine.currentMultiplier;
        const payout = isBonusBuy ? Math.round(engine.betAmount * effectiveMult * 100) / 100 : 0;

        if (finalAccumulator > 0) {
            // Big Celebration for accumulated multiplier
            audioController.playCashout(finalAccumulator >= 10);
            this.vfx.triggerScreenShake(0.35, 0.22);
            this.vfx.spawnShockwave3D(slotPos.x, slotPos.y, slotPos.z, 0xfacc15, 10.0, 0.45);
            this.vfx.spawnGpuParticleCloud(
                slotPos.x,
                slotPos.y,
                slotPos.z,
                140,
                [0xfde047, 0xfacc15, 0xa855f7, 0x38bdf8, 0xffffff],
                12,
                24,
                0.7
            );
            this.vfx.spawnGraffitiMultiplierTag3D(
                slotPos.x,
                slotPos.y + 1.6,
                slotPos.z + 1.0,
                effectiveMult,
                engine.currentRow
            );
        } else {
            // 0x (Direct Bonus Buy loss)
            audioController.playWheelWipeout();
            this.vfx.spawnCrashExplosion3D(slotPos.x, SHIP_FLIGHT_Y, slotPos.z);
        }

        const exitDuration = 0.28;

        // Mini-Slot rises smoothly out of frame
        gsap.to(this.miniSlotGroup.position, {
            y: this.miniSlotGroup.position.y + 18,
            duration: exitDuration,
            ease: 'power2.in',
            onComplete: () => {
                this.miniSlotGroup.visible = false;
                this.isSlotActive = false;
            }
        });

        // Astronaut floats back and boards starfighter concurrently
        gsap.to(this.floatingAstronautGroup.position, {
            y: SHIP_FLIGHT_Y + 1.8,
            duration: exitDuration * 0.85,
            ease: 'power2.in',
            onComplete: () => {
                this.floatingAstronautGroup.visible = false;
                this.floatingAstronautGroup.rotation.y = 0;
                this.ship.root.visible = true;
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);

                this.ship.closeCockpitCanopy(0.16, () => {
                    this.ship.cockpitAstronaut.visible = false;
                    if (isBonusBuy) {
                        this.resetCameraAndShipToBase();
                        engine.completeBonusBuyRound(payout, effectiveMult);
                        if (onComplete) onComplete();
                    } else {
                        this.ship.triggerSpeedBurst(0.45);
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }

    /**
     * Resets the Starfighter and Orbital Tactical Camera to the default idle base position
     * and restores crate visibility. Used to cleanly reset after Bonus Buy rounds.
     */
    public resetCameraAndShipToBase() {
        this.isRouletteActive = false;
        this.isWheelSpinning = false;
        this.isSlotActive = false;
        this.isSlotSpinning = false;
        if (this.giantRouletteGroup) {
            this.giantRouletteGroup.visible = false;
        }
        if (this.mrDollar3D) {
            this.mrDollar3D.hideSpeech();
            this.mrDollar3D.root.visible = false;
        }
        if (this.miniSlotGroup) {
            this.miniSlotGroup.visible = false;
        }
        if (this.floatingAstronautGroup) {
            this.floatingAstronautGroup.visible = false;
            this.floatingAstronautGroup.rotation.y = 0;
        }

        this.rowSlots.flat().forEach(slot => {
            slot.group.visible = true;
            slot.wheelStandGroup.scale.set(1, 1, 1);
        });

        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
        this.ship.setTargetPosition(0, SHIP_FLIGHT_Y, 0);
        this.ship.vel.set(0, 0, 0);
        this.ship.root.visible = true;
        this.ship.resetCockpit();
        this.ship.cockpitAstronaut.visible = false;

        const aspect = this.width / Math.max(1, this.height);
        const isPortrait916 = aspect < 1.0;
        const narrowFactor = isPortrait916 ? Math.max(0, (0.65 - aspect) * 9.5) : 0;
        const offsetY = isPortrait916 ? 6.5 + narrowFactor * 0.55 : 4.4;
        const offsetZ = isPortrait916 ? 10.5 + narrowFactor : 7.2;
        const lookAheadZ = isPortrait916 ? -8.5 : -9.5;
        const baseFov = isPortrait916 ? 64 : 54;

        this.camVel.set(0, 0, 0);
        this.camPos.set(0, SHIP_FLIGHT_Y + offsetY, offsetZ);
        this.camLookAt.set(0, isPortrait916 ? 0.25 : 1.05, lookAheadZ);
        this.camera.position.copy(this.camPos);
        this.camera.lookAt(this.camLookAt);
        this.camera.fov = baseFov;
        this.camera.updateProjectionMatrix();

        this.vfx.clearGraffitiTags();
    }

    /**
     * Tracks cursor and touch movement across the entire viewport so the Starfighter
     * dynamically pitches, yaws, and banks toward the user's cursor in real time!
     */
    private bindGlobalCursorTracking() {
        let lastClientX = -9999;
        let lastClientY = -9999;

        const updateFromCoords = (clientX: number, clientY: number) => {
            const rect = this.canvas.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const normX = ((clientX - rect.left) / rect.width - 0.5) * 2;
            const normY = ((clientY - rect.top) / rect.height - 0.5) * 2;
            // Gentle tanh clamping prevents edge/corner jumping
            this.targetMouseParallax.set(
                Math.tanh(THREE.MathUtils.clamp(normX, -1, 1) * 0.85),
                Math.tanh(THREE.MathUtils.clamp(normY, -1, 1) * 0.85)
            );
        };

        window.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') {
                this.targetMouseParallax.set(0, 0);
                return;
            }
            if (Math.hypot(e.clientX - lastClientX, e.clientY - lastClientY) < 1.5) return;
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            updateFromCoords(e.clientX, e.clientY);
        });

        window.addEventListener('pointerleave', () => {
            this.targetMouseParallax.set(0, 0);
        });
        document.addEventListener('mouseleave', () => {
            this.targetMouseParallax.set(0, 0);
        });
    }

    private bindGameEvents() {
        const engine = this.gameState.engine;

        engine.onStateChange((state) => {
            if (state === GameState.PLAYING && engine.currentRow === 1 && engine.currentPicks.length === 0) {
                this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
                this.vfx.clearGraffitiTags();
                this.ship.setShieldActive(engine.hasActiveShield, true);
                this.ship.root.visible = true;
                this.isRouletteActive = false;
                this.isWheelSpinning = false;
                this.isSlotActive = false;
                this.isSlotSpinning = false;
                this.giantRouletteGroup.visible = false;
                if (this.mrDollar3D) {
                    this.mrDollar3D.hideSpeech();
                    this.mrDollar3D.root.visible = false;
                }
                if (this.miniSlotGroup) this.miniSlotGroup.visible = false;
                this.floatingAstronautGroup.visible = false;
                this.ship.resetCockpit();
                this.rowSlots.flat().forEach(slot => {
                    slot.wheelStandGroup.scale.set(1, 1, 1);
                });
            } else if (state === GameState.IDLE) {
                this.vfx.clearGraffitiTags();
                this.ship.vel.set(0, 0, 0);
                this.camVel.set(0, 0, 0);
                if (this.ship.pos.z < -14) {
                    this.ship.pos.set(0, SHIP_FLIGHT_Y, -12);
                    this.camPos.set(0, 8.65, -0.8);
                }
                this.ship.setTargetPosition(0, SHIP_FLIGHT_Y, 0);
                this.ship.setShieldActive(engine.shieldPurchased, true);
                this.ship.root.visible = true;
                this.isRouletteActive = false;
                this.isWheelSpinning = false;
                this.isSlotActive = false;
                this.isSlotSpinning = false;
                this.giantRouletteGroup.visible = false;
                if (this.mrDollar3D) {
                    this.mrDollar3D.hideSpeech();
                    this.mrDollar3D.root.visible = false;
                }
                if (this.miniSlotGroup) this.miniSlotGroup.visible = false;
                this.floatingAstronautGroup.visible = false;
                this.ship.resetCockpit();
                this.rowSlots.flat().forEach(slot => {
                    slot.wheelStandGroup.scale.set(1, 1, 1);
                });
            } else if (state === GameState.CRASHED || state === GameState.WON) {
                this.ship.setShieldActive(false, true);
            }
        });

        this.gameState.onHitStopStart((row, lane) => {
            const worldX = PixiRenderer.laneToWorldX(lane);
            const worldZ = PixiRenderer.rowToWorldZ(row);
            const specials = engine.getSpecialsForRow(row);

            if (lane === specials.wheelLane) {
                // Wheel box: ship glides towards it, ready to brake smoothly
                this.ship.setTargetPosition(worldX, SHIP_FLIGHT_Y, worldZ + 1.85);
            } else if (lane === specials.alienLane) {
                // Alien box: ship flies directly toward item underneath, pausing right before impact
                this.ship.setTargetPosition(worldX, 1.05, worldZ + 2.0);
            } else {
                // Normal or Orange box: dive and impact directly onto what is underneath!
                this.ship.setTargetPosition(worldX, 1.05, worldZ);
            }
        });

        this.gameState.onHitStopResolve((pick) => {
            const worldX = PixiRenderer.laneToWorldX(pick.lane);
            const worldZ = PixiRenderer.rowToWorldZ(pick.row);

            // Immediately destroy the entire cell and clear all residual elements (unless wheel sequence)!
            const hitCard = this.rowSlots
                .flat()
                .find(
                    (c) =>
                        Math.abs(c.group.position.z - worldZ) < 1.2 &&
                        Math.abs(c.group.position.x - worldX) < 1.2
                );
            if (hitCard && pick.specialType !== 'WHEEL') {
                hitCard.mysteryBoxGroup.visible = false;
                hitCard.miniSunGroup.visible = false;
                hitCard.alienPortalGroup.visible = false;
                hitCard.diffuseHazeSprite.visible = false;
                hitCard.badgeSprite.visible = false;
                hitCard.boxLiftY = 0;
            }

            if (pick.isSafe) {
                if (pick.specialType === 'NONE') {
                    // 1. Traditional Cardboard Box: explodes into chunky cardboard pieces & brown/tan fibers (ZERO BLUE)!
                    this.vfx.spawnShockwave3D(worldX, 0.4, worldZ, 0xb47b46, 7.5, 0.38);
                    this.vfx.triggerScreenShake(0.25, 0.22);
                    this.vfx.stampPermanentPaintSplatter(worldZ, false, 0x8b5a2b);
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'normal');
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.0,
                        worldZ,
                        140,
                        [0x8b5a2b, 0x5c3a1e, 0xb47b46, 0xc58b54, 0x3d2314, 0xd4a373, 0xa06d3b],
                        7,
                        22,
                        0.65
                    );
                    this.ship.triggerSpeedBurst(0.44);
                    this.vfx.spawnGraffitiMultiplierTag3D(
                        worldX,
                        0.8,
                        worldZ,
                        pick.stepMultiplierAfter,
                        pick.row
                    );
                    this.ship.setTargetPosition(worldX, SHIP_FLIGHT_Y, worldZ);
                } else if (pick.specialType === 'GOLDEN') {
                    // 2. Solar/Orange Box: destroys entire cell cleanly, exploding with intense solar amber/golden particles!
                    this.vfx.spawnShockwave3D(worldX, 0.4, worldZ, 0xf59e0b, 10.5, 0.44);
                    this.vfx.spawnShockwave3D(worldX, 0.4, worldZ, 0xfde047, 6.5, 0.34);
                    this.vfx.triggerScreenShake(0.42, 0.28);
                    this.vfx.stampPermanentPaintSplatter(worldZ, true, 0xf59e0b);
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'orange');
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.1,
                        worldZ,
                        280,
                        [0xff7700, 0xf59e0b, 0xfbbf24, 0xfde047, 0xea580c, 0xffa500, 0xffd700, 0xffffff],
                        10,
                        28,
                        0.72
                    );
                    this.ship.triggerSpeedBurst(0.65);
                    this.vfx.spawnGraffitiMultiplierTag3D(
                        worldX,
                        1.4,
                        worldZ,
                        pick.stepMultiplierAfter,
                        pick.row
                    );
                    this.ship.setTargetPosition(worldX, SHIP_FLIGHT_Y, worldZ);
                } else if (pick.specialType === 'ALIEN') {
                    // 3. Purple Alien Box: disappears immediately, abducting ship to clean destination row!
                    this.triggerAlienAbductionSequence(worldX, worldZ, pick.rowsSkipped);
                } else if (pick.specialType === 'WHEEL') {
                    // 4. Rare Prize Wheel (Ruleta) Box: approaches, brakes smoothly, mini-wheel pops, astronaut jumps into void!
                    this.triggerRouletteSequence(worldX, worldZ, pick);
                }

                // Cinematic Near-Miss Tension: check if an adjacent lane held a deadly mine
                const rowHazards = engine.getHazardsForActionRow(pick.row);
                const isNearMiss = rowHazards.some((h) => Math.abs(h - pick.lane) === 1);
                if (isNearMiss && pick.specialType === 'GOLDEN') {
                    this.vfx.triggerScreenShake(0.32, 0.22);
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        0.8,
                        worldZ,
                        100,
                        [0xfde047, 0xf59e0b, 0xff7700],
                        6,
                        18,
                        0.45
                    );
                }
            } else if (pick.shieldSaved) {
                // Quantum Shield absorbed the mine impact!
                if (pick.specialType === 'NONE') {
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'normal');
                }
                this.vfx.spawnShieldDeflect3D(worldX, 0.9, worldZ);
                this.vfx.triggerScreenShake(0.35, 0.25);
                this.ship.setTargetPosition(worldX, SHIP_FLIGHT_Y, worldZ);
                this.ship.triggerShieldImpact(worldX, 0.9, worldZ);
            } else {
                // Fatal mine hit!
                if (pick.specialType === 'NONE') {
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'normal');
                }
                this.ship.crashExplosionTimer = 0.001;
                this.vfx.spawnCrashExplosion3D(worldX, 0.3, worldZ);
            }
        });

        engine.onCashout((_payout, multiplier) => {
            this.vfx.triggerSupernovaExplosion3D(
                this.ship.pos.x,
                this.ship.pos.y,
                this.ship.pos.z,
                multiplier >= 2.0
            );
            this.ship.triggerHydraulicBlockParty(4.0);
        });
    }

    public setupDPI(force = false) {
        const parent = this.canvas.parentElement;
        const newW = Math.max(280, parent?.clientWidth || window.innerWidth);
        const newH = Math.max(240, parent?.clientHeight || window.innerHeight);

        if (!force && newW === this.width && newH === this.height) return;

        this.width = newW;
        this.height = newH;
        const aspect = this.width / this.height;

        if (aspect < 0.72) {
            PixiRenderer.currentLaneSpacingX = 3.18;
            this.cardLayoutScale = 0.75;
            this.ship?.root.scale.setScalar(0.73);
        } else if (aspect < 1.05) {
            PixiRenderer.currentLaneSpacingX = 3.68;
            this.cardLayoutScale = 0.86;
            this.ship?.root.scale.setScalar(0.84);
        } else {
            PixiRenderer.currentLaneSpacingX = LANE_SPACING_X;
            this.cardLayoutScale = 1.0;
            this.ship?.root.scale.setScalar(1.0);
        }

        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        this.webglRenderer.setSize(this.width, this.height, false);
        this.vfx?.setSize(this.width, this.height);
    }

    /**
     * Raycasts against the stationary oversized `interactiveHitboxMeshes`,
     * with magnetic screen-space touch assist and debounced hover fallback
     * so tapping or clicking near the edge of an active card ALWAYS registers 100%!
     */
    public getClickTarget(
        clientX: number,
        clientY: number,
        currentRow: number
    ): { row: number; lane: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        const hits = this.raycaster.intersectObjects(this.interactiveHitboxMeshes, false);

        for (const hit of hits) {
            const hitObj = hit.object;
            const slotIdx = hitObj.userData.slotIndex as number;
            const lane = hitObj.userData.lane as number;
            const card = this.rowSlots[slotIdx]?.[lane];
            if (card && card.group.visible && card.assignedRow === currentRow) {
                return { row: card.assignedRow, lane: card.lane };
            }
        }

        // Magnetic Screen-Space Touch Target Assist for active row (zero missed thumb taps on mobile!)
        const rowZ = PixiRenderer.rowToWorldZ(currentRow);
        let bestLane: number | null = null;
        let bestDistSq = Infinity;
        const maxDx = Math.max(42, rect.width * 0.115);
        const maxDy = Math.max(66, rect.height * 0.095);

        for (let lane = 0; lane < LANE_COUNT; lane++) {
            const worldX = PixiRenderer.laneToWorldX(lane);
            this.scratchProjVec.set(worldX, 1.12 * this.cardLayoutScale, rowZ);
            this.scratchProjVec.project(this.camera);
            const sx = rect.left + (this.scratchProjVec.x * 0.5 + 0.5) * rect.width;
            const sy = rect.top + (-this.scratchProjVec.y * 0.5 + 0.5) * rect.height;
            const dx = Math.abs(clientX - sx);
            const dy = Math.abs(clientY - sy);
            if (dx <= maxDx && dy <= maxDy) {
                const distSq = dx * dx + dy * dy * 0.65;
                if (distSq < bestDistSq) {
                    bestDistSq = distSq;
                    bestLane = lane;
                }
            }
        }

        if (bestLane !== null) {
            return { row: currentRow, lane: bestLane };
        }

        if (hits.length > 0) {
            const hitObj = hits[0].object;
            const slotIdx = hitObj.userData.slotIndex as number;
            const lane = hitObj.userData.lane as number;
            const card = this.rowSlots[slotIdx]?.[lane];
            if (card && card.group.visible) {
                return { row: card.assignedRow, lane: card.lane };
            }
        }

        if (
            this.hoveredRow === currentRow &&
            this.hoveredLane !== null &&
            performance.now() - this.lastValidHoverTime <= HOVER_DEBOUNCE_MS * 1.6
        ) {
            return { row: this.hoveredRow, lane: this.hoveredLane };
        }

        return null;
    }

    /**
     * Anti-Flicker Debounced Card Hover Detection:
     * Uses stationary oversized hitboxes + a 90ms spatial-temporal debounce window
     * so hovering near the edge of a card never flickers!
     */
    public updateHover(clientX: number, clientY: number, currentRow: number) {
        const rect = this.canvas.getBoundingClientRect();
        const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.pointerNdc.set(ndcX, ndcY);
        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        const hits = this.raycaster.intersectObjects(this.interactiveHitboxMeshes, false);

        let matchedCard: FloatingMultiplierCard3D | null = null;
        for (const hit of hits) {
            const slotIdx = hit.object.userData.slotIndex as number;
            const lane = hit.object.userData.lane as number;
            const card = this.rowSlots[slotIdx]?.[lane];
            if (card && card.group.visible && card.assignedRow === currentRow) {
                matchedCard = card;
                break;
            }
        }

        const now = performance.now();

        if (matchedCard) {
            this.hoveredRow = matchedCard.assignedRow;
            this.hoveredLane = matchedCard.lane;
            this.lastValidHoverTime = now;
            this.lastHoverNdc.set(ndcX, ndcY);
            this.canvas.style.cursor = 'pointer';

            if (this.lastHoveredLaneAudio !== matchedCard.lane) {
                this.lastHoveredLaneAudio = matchedCard.lane;
                audioController.playHoverTick(matchedCard.lane);
            }
            return;
        }

        // Brief anti-flicker grace period so moving across subpixel ray boundaries never chatters
        if (
            this.hoveredLane !== null &&
            this.hoveredRow === currentRow &&
            now - this.lastValidHoverTime < HOVER_DEBOUNCE_MS
        ) {
            this.canvas.style.cursor = 'pointer';
            return;
        }

        this.hoveredRow = null;
        this.hoveredLane = null;
        this.lastHoveredLaneAudio = null;
        this.canvas.style.cursor = 'default';
    }

    public clearHover() {
        this.hoveredRow = null;
        this.hoveredLane = null;
        this.lastHoveredLaneAudio = null;
        this.canvas.style.cursor = 'default';
    }

    private startRenderLoop() {
        const animate = (now: number) => {
            const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
            this.lastFrameTime = now;
            this.elapsed += dt;

            this.updateScene3D(dt);

            // Direct WebGL hardware MSAA rendering:
            // Eliminates 11 full-screen down/up passes per frame for buttery smooth 60-120 FPS
            // and pristine, razor-sharp hand-drawn comic ink outlines with ZERO buffer flickering.
            if (this.vfx.supernovaFlashIntensity > 0.01) {
                this.vfx.composer.render();
            } else {
                this.webglRenderer.render(this.scene, this.camera);
            }

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    private updateScene3D(dt: number) {
        const engine = this.gameState.engine;
        const theme = this.gameState.getAtmosphereTheme();
        const isPlaying = engine.state === GameState.PLAYING;
        const isCrashed = engine.state === GameState.CRASHED;
        const isHitStop = this.gameState.isHitStopActive;

        // 1. Controlled HDR Exposure & Galactic Sky-Dome Sync
        const targetExposure = 0.92 + Math.min(0.24, Math.log10(Math.max(1, engine.currentMultiplier)) * 0.14);
        this.webglRenderer.toneMappingExposure = THREE.MathUtils.lerp(
            this.webglRenderer.toneMappingExposure,
            targetExposure,
            dt * 4
        );

        const skyTarget = this.scratchSkyColor.setHex(theme.bgTopHex);
        const fogTarget = this.scratchFogColor.setHex(theme.bgBottomHex);
        (this.scene.background as THREE.Color).lerp(skyTarget, dt * 3.5);
        (this.scene.fog as THREE.FogExp2).color.lerp(fogTarget, dt * 3.5);

        // Keep the 360° Galactic Milky Way Sky-Dome centered on the camera
        this.skyDomeMesh.position.copy(this.camera.position);
        this.skyDomeMat.uniforms['uTime'].value = this.elapsed;
        (this.skyDomeMat.uniforms['uSectorTint'].value as THREE.Color).lerp(
            this.scratchTintColor.setHex(theme.primaryHex),
            dt * 2.5
        );

        // 2. Determine Exact Center 3D Target Coordinates for the Avatar
        let shipRow = 0;
        let shipLane = 2;
        if (isHitStop && this.gameState.hitStopRow !== null && this.gameState.hitStopLane !== null) {
            shipRow = this.gameState.hitStopRow;
            shipLane = this.gameState.hitStopLane;
        } else if ((isPlaying || isCrashed) && engine.currentPicks.length > 0) {
            const lastPick = engine.currentPicks[engine.currentPicks.length - 1];
            shipRow = lastPick.row + (lastPick.rowsSkipped || 0);
            shipLane = lastPick.lane;
        }

        const targetShipX = PixiRenderer.laneToWorldX(shipLane);
        const targetShipZ = PixiRenderer.rowToWorldZ(shipRow);
        if (!this.isAbductionActive && !this.isRouletteActive && !this.isSlotActive) {
            this.ship.setTargetPosition(targetShipX, SHIP_FLIGHT_Y, targetShipZ);
        }

        // Zero-G cosmic void drift for 3D volumetric astronaut watching Mr. Dollar spin the wheel or observing the slot!
        if ((this.isRouletteActive || this.isSlotActive) && this.floatingAstronautGroup.visible && this.astro3D) {
            const bob = Math.sin(this.elapsed * 1.8) * 0.10;
            const roll = Math.cos(this.elapsed * 1.4) * 0.045;
            const pitch = Math.sin(this.elapsed * 1.6) * 0.035;
            this.astro3D.root.position.y = bob;
            this.astro3D.root.rotation.z = roll;
            this.astro3D.root.rotation.x = pitch;

            // When watching the wheel, astronaut glances toward Mr. Dollar (+Y head turn) and tracks the spinning wheel!
            const watchBiasY = this.isRouletteActive ? (this.isWheelSpinning ? 0.08 : 0.22) : 0.0;
            this.astro3D.helmet.rotation.y = watchBiasY + Math.sin(this.elapsed * 1.15) * 0.09;
            this.astro3D.helmet.rotation.x = Math.cos(this.elapsed * 1.35) * 0.04;
            this.astro3D.leftArm.rotation.z = -0.90 + Math.sin(this.elapsed * 1.5) * 0.06;
            this.astro3D.rightArm.rotation.z = 0.90 - Math.sin(this.elapsed * 1.5 + 0.4) * 0.06;
            this.astro3D.leftLeg.rotation.x = 0.08 + Math.sin(this.elapsed * 1.3) * 0.05;
            this.astro3D.rightLeg.rotation.x = 0.22 + Math.sin(this.elapsed * 1.3 + 0.5) * 0.05;
        }

        if (this.mrDollar3D) {
            this.mrDollar3D.update(
                dt,
                this.elapsed,
                this.camera,
                this.width,
                this.height,
                this.isWheelSpinning
            );
        }

        const hitStopX =
            isHitStop && this.gameState.hitStopLane !== null
                ? PixiRenderer.laneToWorldX(this.gameState.hitStopLane)
                : null;
        const hoverX =
            isPlaying && this.hoveredLane !== null
                ? PixiRenderer.laneToWorldX(this.hoveredLane)
                : null;

        const currentMult = engine.currentMultiplier || 1.0;
        const isCashedOut = engine.state === GameState.WON;

        // Smoothly interpolate mouseParallax toward targetMouseParallax so corner returns never snap!
        this.mouseParallax.lerp(this.targetMouseParallax, Math.min(1, dt * 12));
        this.ship.setCursorAim(this.mouseParallax.x, this.mouseParallax.y);

        this.ship.update(
            dt,
            theme.primaryHex,
            isHitStop,
            hitStopX,
            hoverX,
            false,
            isCrashed,
            currentMult,
            isCashedOut,
            this.isAbductionActive
        );
        this.updateOrbitalTacticalCamera(dt, isHitStop, hitStopX, hoverX);

        this.dirLight.position.set(this.ship.pos.x + 14, 28, this.ship.pos.z + 16);
        this.dirLight.target.position.set(this.ship.pos.x, 0, this.ship.pos.z - 12);

        this.updateFloatingMultiplierCards(dt, theme.primaryHex);
        this.updateAlienUfo(dt);
        this.updateDeepSpaceEnvironment(dt);
        this.updateTrajectoryArc(isPlaying, isHitStop, theme.primaryHex);

        this.vfx.update(
            dt,
            engine.currentMultiplier,
            isHitStop,
            this.gameState.hitStopProgress,
            this.ship.pos
        );
    }

    /**
     * Animates the 3D Comic UFO Mothership and Cel-Shaded Abduction Rings
     */
    private updateAlienUfo(_dt: number) {
        if (!this.alienUfoGroup || !this.alienUfoGroup.visible) return;

        // Hover wobble & cartoon breathing bobbing on ufoBody
        if (this.alienUfoBody) {
            this.alienUfoBody.position.y = Math.sin(this.elapsed * 5.5) * 0.12;
            this.alienUfoBody.rotation.z = Math.sin(this.elapsed * 3.8) * 0.05;
            this.alienUfoBody.rotation.x = Math.cos(this.elapsed * 3.2) * 0.04;
        }

        // Concentric cartoon energy rings streaming downwards along the tractor beam
        const ringCount = this.alienTractorRings.length;
        const totalTravel = 8.0;
        const baseSpeed = 4.2;
        for (let i = 0; i < ringCount; i++) {
            const ring = this.alienTractorRings[i];
            const cycleProgress = ((this.elapsed * baseSpeed + (i * totalTravel) / ringCount) % totalTravel) / totalTravel;
            ring.position.y = -2.2 - cycleProgress * totalTravel;
            // Flare ring scale outwards as it expands down the beam
            const s = 0.8 + cycleProgress * 0.75;
            ring.scale.set(s, s, 1);
            // Smooth fade at ends
            const ringOpacity = Math.sin(cycleProgress * Math.PI) * 0.85;
            (ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
        }
    }

    /**
     * Strictly Locked "Orbital Tactical" Camera View:
     * Elevated tactical orbital perspective behind the ship with 300ms Hit-Stop zoom & speed-burst FOV kick!
     */
    private updateOrbitalTacticalCamera(
        dt: number,
        isHitStop: boolean,
        hitStopX: number | null,
        _hoverX: number | null
    ) {
        const aspect = this.width / Math.max(1, this.height);
        const isPortrait916 = aspect < 1.0;

        // Cinematic framing for Cosmic Prize Wheel / Arcade Mini-Slot & Floating Astronaut in Zero-G
        if (this.isRouletteActive || this.isSlotActive) {
            const activeGroup = this.isSlotActive ? this.miniSlotGroup : this.giantRouletteGroup;
            const rouZ = activeGroup.position.z;
            const rouX = activeGroup.position.x;
            const camTargetZ = rouZ + (isPortrait916 ? 16.8 : 15.6);
            const camTargetY = SHIP_FLIGHT_Y + (isPortrait916 ? 2.6 : 2.0);
            const camTargetX = rouX * 0.12;

            this.camPos.x = THREE.MathUtils.lerp(this.camPos.x, camTargetX, dt * 5.0);
            this.camPos.y = THREE.MathUtils.lerp(this.camPos.y, camTargetY, dt * 5.0);
            this.camPos.z = THREE.MathUtils.lerp(this.camPos.z, camTargetZ, dt * 5.0);

            this.camera.position.copy(this.camPos).add(this.vfx.shakeOffset);

            const lookY = SHIP_FLIGHT_Y + (isPortrait916 ? 1.6 : 1.3);
            const desiredLook = this.scratchDesiredLook.set(rouX, lookY, rouZ);
            this.camLookAt.lerp(desiredLook, dt * 8);
            this.camera.lookAt(this.camLookAt);
            this.camera.rotation.z += this.vfx.shakeRoll;
            return;
        }

        const narrowFactor = isPortrait916 ? Math.max(0, (0.65 - aspect) * 9.5) : 0;
        let offsetY = isPortrait916 ? 6.5 + narrowFactor * 0.55 : 4.4;
        let offsetZ = isPortrait916 ? 10.5 + narrowFactor : 7.2;
        const lookAheadZ = isPortrait916 ? -8.5 : -9.5;
        let baseFov = isPortrait916 ? 64 : 54;

        const engine = this.gameState.engine;
        const isCrashed = engine.state === GameState.CRASHED;

        if (isCrashed) {
            const crashP = Math.min(1, this.ship.crashExplosionTimer / 0.65);
            offsetZ += 5.2 * (1 - crashP);
            offsetY += 2.0 * (1 - crashP);
            baseFov += 16.5 * (1 - crashP);
        } else if (isHitStop) {
            const p = this.gameState.hitStopProgress;
            offsetZ -= 2.85 * p;
            offsetY -= 0.92 * p;
            baseFov -= 8.0 * p;
        } else if (this.ship.postHitStopBurstTimer > 0) {
            const burstNorm = this.ship.postHitStopBurstTimer / 0.44;
            baseFov += 14.5 * burstNorm;
        }

        const panScale = isPortrait916 ? 0.12 : 0.65;
        const parallaxXScale = isPortrait916 ? 0.12 : 0.48;

        // Do NOT shift camera position or rotation based on hoverX — this prevents raycast feedback oscillation on bonus crates!
        const targetCamX =
            this.ship.pos.x * panScale +
            this.mouseParallax.x * parallaxXScale;
        const targetCamY = this.ship.pos.y + offsetY - this.mouseParallax.y * 0.30;
        const targetCamZ = this.ship.pos.z + offsetZ;

        const camStiff = 135;
        const camDamp = 18.0;
        this.camVel.x += ((targetCamX - this.camPos.x) * camStiff - this.camVel.x * camDamp) * dt;
        this.camVel.y += ((targetCamY - this.camPos.y) * camStiff - this.camVel.y * camDamp) * dt;
        this.camVel.z += ((targetCamZ - this.camPos.z) * camStiff - this.camVel.z * camDamp) * dt;

        this.camPos.x += this.camVel.x * dt;
        this.camPos.y += this.camVel.y * dt;
        this.camPos.z += this.camVel.z * dt;

        this.camera.position.copy(this.camPos).add(this.vfx.shakeOffset);

        if (Math.abs(this.camera.fov - baseFov) > 0.05) {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, baseFov, dt * 15);
            this.camera.updateProjectionMatrix();
        }

        const lookScale = isPortrait916 ? 0.10 : 0.45;
        const focusLaneX =
            hitStopX !== null
                ? THREE.MathUtils.lerp(this.ship.pos.x, hitStopX, isPortrait916 ? 0.25 : 0.55)
                : this.ship.pos.x * lookScale + this.mouseParallax.x * (isPortrait916 ? 0.15 : 0.65);

        const baseLookY = isPortrait916 ? 0.25 : 1.05;
        const desiredLook = this.scratchDesiredLook.set(
            focusLaneX,
            baseLookY - this.mouseParallax.y * (isPortrait916 ? 0.12 : 0.32),
            this.ship.pos.z + lookAheadZ
        );
        this.camLookAt.lerp(desiredLook, dt * 16);
        this.camera.lookAt(this.camLookAt);

        this.camera.rotation.z += this.vfx.shakeRoll;
    }

    /**
     * Updates the 5-Lane Floating Multiplier Cards in the Open Cosmic Void.
     */
    private updateFloatingMultiplierCards(dt: number, _primaryHex: number) {
        const engine = this.gameState.engine;
        const isPlaying = engine.state === GameState.PLAYING;
        const activeRow = isPlaying ? engine.currentRow : Math.max(1, engine.currentRow);
        const visualShipRow = Math.max(1, Math.floor(-this.ship.pos.z / ROW_SPACING_Z));
        const startRow = isPlaying
            ? Math.max(1, Math.min(activeRow - 1, visualShipRow))
            : Math.max(1, activeRow - 1);

        for (let s = 0; s < VISIBLE_ROW_SLOTS; s++) {
            const rowNumber = startRow + s;
            const rowZ = PixiRenderer.rowToWorldZ(rowNumber);
            const isCurrentRow = isPlaying && rowNumber === engine.currentRow;

            const pickForRow = engine.currentPicks.find((p) => p.row === rowNumber);
            for (let lane = 0; lane < LANE_COUNT; lane++) {
                const plat = this.rowSlots[s][lane];

                // If slot was reassigned to a new row, completely reset state to fresh!
                if (plat.assignedRow !== rowNumber) {
                    plat.assignedRow = rowNumber;
                    plat.boxLiftY = 0;
                    plat.mysteryBoxGroup.position.y = 0;
                    plat.lidOpenProgress = 0;
                    plat.lidLeft.rotation.z = 0;
                    plat.lidRight.rotation.z = 0;
                    plat.visualGroup.position.y = 0;
                    plat.mysteryBoxGroup.visible = true;
                    plat.wheelStandGroup.visible = false;
                    plat.wheelStandGroup.scale.set(1, 1, 1);
                    plat.miniSunGroup.visible = false;
                    plat.alienPortalGroup.visible = false;
                    plat.miniWheelPropGroup.visible = false;
                    plat.mineGroup.visible = false;
                    plat.diffuseHazeSprite.visible = false;
                    plat.badgeSprite.visible = false;
                }
                if (this.isRouletteActive || this.isSlotActive || engine.wheelProfile === 'BONUS_BUY' || engine.slotBundle?.profile === 'BONUS_BUY') {
                    plat.group.visible = false;
                    continue;
                }
                plat.group.visible = true;

                const laneX = PixiRenderer.laneToWorldX(lane);
                const isHovered =
                    isCurrentRow && this.hoveredLane === lane && this.hoveredRow === rowNumber;
                const isHitStopTarget =
                    this.gameState.isHitStopActive &&
                    this.gameState.hitStopRow === rowNumber &&
                    this.gameState.hitStopLane === lane;

                const rowSpecials = engine.getSpecialsForRow(rowNumber);
                let boxType: 'normal' | 'orange' | 'alien' | 'wheel' = 'normal';
                if (lane === rowSpecials.wheelLane) {
                    boxType = 'wheel';
                } else if (lane === rowSpecials.alienLane) {
                    boxType = 'alien';
                } else if (lane === rowSpecials.goldenLane) {
                    boxType = 'orange';
                }
                plat.boxType = boxType;

                // Bind appropriate cartoon texture array
                const activeMat =
                    boxType === 'wheel'
                        ? plat.boxMatWheel
                        : boxType === 'orange'
                          ? plat.boxMatOrange
                          : boxType === 'alien'
                            ? plat.boxMatAlien
                            : plat.boxMatNormal;

                if (plat.boxBody.material !== activeMat) {
                    plat.boxBody.material = activeMat;
                }

                // Keep plat.group stationary at Y = 0 so hitboxMesh never oscillates on hover!
                plat.group.position.set(laneX, 0, rowZ);
                plat.group.scale.setScalar(this.cardLayoutScale);

                // Stable rock-solid resting position - ZERO jitter, ZERO trembling, ZERO oscillation!
                const targetHoverLift = isHitStopTarget
                    ? 0.38
                    : isHovered
                      ? 0.22
                      : 0;

                plat.visualGroup.position.y = THREE.MathUtils.lerp(
                    plat.visualGroup.position.y,
                    targetHoverLift,
                    Math.min(1, dt * 14)
                );

                const targetScale = isHitStopTarget ? 1.06 : isHovered ? 1.03 : 1.0;
                plat.visualGroup.scale.setScalar(
                    THREE.MathUtils.lerp(plat.visualGroup.scale.x, targetScale, Math.min(1, dt * 14))
                );

                // Upward Box Lift & Flap Opening Animation
                // Bonus boxes elevate sufficiently high (y ≈ 3.6 - 4.4) so the full contents
                // underneath are 100% visible without the box overlapping or occluding anything!
                let targetBoxLiftY = 0;
                let targetLidProgress = 0;

                if (boxType !== 'normal') {
                    if (isHitStopTarget) {
                        targetBoxLiftY = 3.4;
                        targetLidProgress = 1.0;
                    } else if (isHovered) {
                        targetBoxLiftY = 2.2;
                        targetLidProgress = 0.65;
                    }
                }

                plat.boxLiftY = THREE.MathUtils.lerp(
                    plat.boxLiftY,
                    targetBoxLiftY,
                    Math.min(1, dt * 26)
                );
                plat.mysteryBoxGroup.position.y = plat.boxLiftY;

                plat.lidOpenProgress = THREE.MathUtils.lerp(
                    plat.lidOpenProgress,
                    targetLidProgress,
                    Math.min(1, dt * 26)
                );

                const flapAngle = plat.lidOpenProgress * (Math.PI * 0.72);
                plat.lidLeft.rotation.z = flapAngle;
                plat.lidRight.rotation.z = -flapAngle;

                // Diffuse, background-integrated neon glow (Feathered atmospheric haze, NO floating aura or floor circle)
                if (boxType === 'orange') {
                    plat.diffuseHazeSprite.visible = true;
                    plat.diffuseHazeMat.color.setHex(0xf59e0b);
                    const pulse = 0.24 + 0.08 * Math.sin(this.elapsed * 3.2 + lane * 0.9);
                    plat.diffuseHazeMat.opacity = isHovered ? Math.min(0.45, pulse * 1.4) : pulse;
                    plat.miniWheelPropGroup.visible = false;
                    plat.wheelStandGroup.visible = false;
                } else if (boxType === 'alien') {
                    plat.diffuseHazeSprite.visible = true;
                    plat.diffuseHazeMat.color.setHex(0x2563eb);
                    const pulse = 0.24 + 0.08 * Math.sin(this.elapsed * 3.2 + lane * 0.9 + 1.2);
                    plat.diffuseHazeMat.opacity = isHovered ? Math.min(0.45, pulse * 1.4) : pulse;
                    plat.miniWheelPropGroup.visible = false;
                    plat.wheelStandGroup.visible = false;
                } else if (boxType === 'wheel') {
                    plat.diffuseHazeSprite.visible = true;
                    plat.diffuseHazeMat.color.setHex(0xfacc15);
                    const pulse = 0.32 + 0.12 * Math.sin(this.elapsed * 3.6 + lane);
                    plat.diffuseHazeMat.opacity = isHovered ? Math.min(0.55, pulse * 1.5) : pulse;
                    plat.miniWheelPropGroup.visible = false;
                    plat.mysteryBoxGroup.visible = false; // Strictly hide cardboard box on wheel tile!

                    const shouldShowWheelStand =
                        !plat.isShattered &&
                        (!this.isRouletteActive || engine.currentRow !== rowNumber);
                    plat.wheelStandGroup.visible = shouldShowWheelStand;
                    if (shouldShowWheelStand) {
                        plat.wheelStandDisc.rotation.z = -this.elapsed * 1.35;
                        const pegPhase =
                            ((Math.abs(plat.wheelStandDisc.rotation.z) * 24) / (Math.PI * 2)) % 1;
                        const tickKick =
                            Math.pow(1 - pegPhase, 3.2) * Math.sin(pegPhase * Math.PI * 3.5);
                        plat.wheelStandFlapper.rotation.z = 0.13 * Math.max(-0.2, tickKick);
                    }
                } else {
                    plat.diffuseHazeSprite.visible = false;
                    plat.miniWheelPropGroup.visible = false;
                    plat.wheelStandGroup.visible = false;
                }

                // Underneath Content Reveal Logic:
                // Revealed only while the box is lifted up, before impact destroys the cell
                const isExposed = plat.boxLiftY > 0.4 && (!pickForRow || !pickForRow.isSafe);

                plat.miniSunGroup.visible = false;
                plat.alienPortalGroup.visible = false;
                plat.mineGroup.visible = false;
                plat.badgeSprite.visible = false;

                if (isExposed) {
                    // CRITICAL: Bonus boxes when lifted must NEVER reveal the bomb icon even if a mine exists here!
                    // This prevents giving premature clues to the player. They always show their respective prize icon!
                    if (boxType === 'orange') {
                        plat.miniSunGroup.visible = true;
                        plat.miniSunGroup.position.y = 1.05 + Math.sin(this.elapsed * 3.6 + lane) * 0.08;
                        if (plat.solarRelicCrystal) plat.solarRelicCrystal.rotation.y = this.elapsed * 1.8;
                        if (plat.solarRelicRing1) plat.solarRelicRing1.rotation.z = this.elapsed * 2.2;
                        if (plat.solarRelicRing2) plat.solarRelicRing2.rotation.z = -this.elapsed * 1.8;
                    } else if (boxType === 'alien') {
                        plat.alienPortalGroup.visible = true;
                        plat.alienPortalGroup.position.y = 1.05 + Math.sin(this.elapsed * 3.6 + lane) * 0.08;
                        if (plat.alienRelicUfo) {
                            plat.alienRelicUfo.rotation.y = this.elapsed * 2.0;
                            plat.alienRelicUfo.rotation.z = Math.sin(this.elapsed * 3.2) * 0.08;
                        }
                        if (plat.alienRelicRing) plat.alienRelicRing.rotation.z = this.elapsed * 2.8;
                    }
                }

                // Check ship current coordinates and alien warp status
                const lastPick =
                    engine.currentPicks.length > 0
                        ? engine.currentPicks[engine.currentPicks.length - 1]
                        : null;
                const currentShipRow = lastPick ? lastPick.row + (lastPick.rowsSkipped || 0) : 0;
                const currentShipLane = lastPick ? lastPick.lane : 2;

                const isTraversedOrSkipped = engine.currentPicks.some(
                    (p) =>
                        p.isSafe &&
                        (p.rowsSkipped || 0) > 0 &&
                        rowNumber >= p.row &&
                        rowNumber <= p.row + (p.rowsSkipped || 0)
                );
                const isShipRestingTile = currentShipRow === rowNumber && currentShipLane === lane;
                const isAlienLandingRow =
                    currentShipRow === rowNumber &&
                    lastPick !== null &&
                    (lastPick.rowsSkipped || 0) > 0;

                // Evaluated Row Pick Resolution:
                // When an impact occurs, DESTROY THE ENTIRE CELL COMPLETELY:
                // No lingering box, no leftover sun, no residual clutter!
                if (pickForRow) {
                    const isPicked = pickForRow.lane === lane;
                    const isMine = pickForRow.hazards.includes(lane);

                    if (isPicked) {
                        if (pickForRow.isSafe) {
                            // SAFE IMPACT: Cell is completely destroyed, clean & empty!
                            // Except during active roulette sequence where wheel stand stays visible until astronaut ejects!
                            if (pickForRow.specialType === 'WHEEL' && this.isRouletteActive) {
                                plat.mysteryBoxGroup.visible = false;
                                plat.wheelStandGroup.visible = !this.floatingAstronautGroup.visible;
                            } else {
                                plat.mysteryBoxGroup.visible = false;
                                plat.miniWheelPropGroup.visible = false;
                                plat.wheelStandGroup.visible = false;
                            }
                            plat.miniSunGroup.visible = false;
                            plat.alienPortalGroup.visible = false;
                            plat.mineGroup.visible = false;
                            plat.diffuseHazeSprite.visible = false;
                            plat.badgeSprite.visible = false;
                        } else {
                            // Fatal mine detonation
                            plat.mysteryBoxGroup.visible = false;
                            plat.miniWheelPropGroup.visible = false;
                            plat.wheelStandGroup.visible = false;
                            plat.miniSunGroup.visible = false;
                            plat.alienPortalGroup.visible = false;
                            plat.mineGroup.visible = true;
                            plat.diffuseHazeSprite.visible = false;
                            plat.badgeSprite.visible = false;
                            plat.mineGroup.rotation.y = this.elapsed * 2.5;
                        }
                    } else if (isMine && !isPlaying) {
                        // Round finished: show hazard bombs in unpicked lanes
                        plat.mysteryBoxGroup.visible = false;
                        plat.miniWheelPropGroup.visible = false;
                        plat.wheelStandGroup.visible = false;
                        plat.mineGroup.visible = true;
                        plat.mineGroup.rotation.y = this.elapsed * 2.5;
                    } else {
                        // Unpicked safe lanes on already played rows stay clean
                        const canShow = !isTraversedOrSkipped && rowNumber >= engine.currentRow;
                        plat.mysteryBoxGroup.visible = canShow && boxType !== 'wheel';
                        plat.wheelStandGroup.visible = canShow && boxType === 'wheel';
                    }
                } else if (rowNumber < engine.currentRow) {
                    // Row was skipped or bypassed by alien abduction warp!
                    // MUST BE COMPLETELY CLEAN - NO BOXES, NO RESIDUAL CLUTTER!
                    plat.mysteryBoxGroup.visible = false;
                    plat.miniWheelPropGroup.visible = false;
                    plat.wheelStandGroup.visible = false;
                    plat.miniSunGroup.visible = false;
                    plat.alienPortalGroup.visible = false;
                    plat.mineGroup.visible = false;
                    plat.diffuseHazeSprite.visible = false;
                    plat.badgeSprite.visible = false;
                } else {
                    // Current and future unpicked rows: ALL BOXES ARE 100% VISIBLE EXCEPT WHEEL TILE!
                    plat.mysteryBoxGroup.visible = boxType !== 'wheel';
                    plat.wheelStandGroup.visible = boxType === 'wheel';
                }

                // Guaranteed cleanliness for avatar landing tile, alien landing row, and all passed rows:
                const isPassedRow = isPlaying && rowNumber < engine.currentRow;
                const isAbductionLandingRow =
                    this.isAbductionActive && rowNumber === Math.max(1, engine.currentRow - 1);

                if (
                    (isShipRestingTile && (!this.isRouletteActive || pickForRow?.specialType !== 'WHEEL')) ||
                    isAlienLandingRow ||
                    isPassedRow ||
                    isAbductionLandingRow ||
                    (isTraversedOrSkipped && rowNumber < engine.currentRow)
                ) {
                    plat.mysteryBoxGroup.visible = false;
                    plat.miniWheelPropGroup.visible = false;
                    plat.wheelStandGroup.visible = false;
                    plat.miniSunGroup.visible = false;
                    plat.alienPortalGroup.visible = false;
                    plat.mineGroup.visible = false;
                    plat.diffuseHazeSprite.visible = false;
                    plat.badgeSprite.visible = false;
                }

                if (isCurrentRow) {
                    plat.badgeSprite.visible = !this.isRouletteActive && !this.isSlotActive;
                    plat.badgeSprite.position.y = boxType === 'wheel' ? 3.76 : 2.85;
                    const isFirst = engine.currentRow === 1;
                    const nextM = calculateNextStepMultiplier(
                        engine.currentMultiplier,
                        engine.minesCount,
                        isFirst
                    );

                    let subText = `${nextM.toFixed(2)}×`;
                    let accentCss = isHovered ? '#fde047' : '#38bdf8';
                    let isSpecial = false;

                    if (boxType === 'orange') {
                        const boostedM = Math.round(nextM * 1.5 * 100) / 100;
                        subText = `SOLAR ${boostedM.toFixed(2)}×`;
                        accentCss = '#f59e0b';
                        isSpecial = true;
                    } else if (boxType === 'alien') {
                        subText = `UFO WARP +2F`;
                        accentCss = '#c084fc';
                        isSpecial = true;
                    } else if (boxType === 'wheel') {
                        subText = `RULETA ×1000`;
                        accentCss = '#facc15';
                        isSpecial = true;
                    }

                    const sig = `${lane + 1}|${subText}|${accentCss}|${isHovered}`;
                    if (plat.lastBadgeSignature !== sig) {
                        plat.lastBadgeSignature = sig;
                        updateHologramBadgeCanvas(
                            plat.badgeCanvas,
                            lane + 1,
                            subText,
                            accentCss,
                            isSpecial,
                            isHovered
                        );
                        plat.badgeTex.needsUpdate = true;
                    }
                    plat.badgeSprite.scale.setScalar(isHovered ? 1.14 : 1.0);
                    plat.badgeSprite.scale.x *= 3.25;
                    plat.badgeSprite.scale.y *= 1.32;
                }
            }
        }
    }

    /**
     * Dynamically scrolls and animates the Photorealistic [SPACE-OVERDRIVE V4] Cosmic Void:
     * 1. 1,800-Particle Starfield
     * 2. 6 Massive Photorealistic Planets with 3D fBm Relief, Drifting Cloud Decks, Sunset Terminators,
     *    Night-Side City Lights & 1,440 Orbiting Ring Asteroids
     * 3. 4 Distant Supernovas pulsing with expanding shockwave shells & God-ray cones
     * 4. 18 Streaking 3D Shooting Stars / Comets
     * 5. 36 Photorealistic JWST/Hubble Nebula Filaments + 900 Flowing Nebula Stream Particles
     * 6. 1,600 Camera-Reactive Cosmic Dust Motes
     */
    private updateDeepSpaceEnvironment(dt: number) {
        const camZ = this.camera.position.z;
        const isBursting = this.ship.postHitStopBurstTimer > 0;
        const theme = this.gameState.getAtmosphereTheme();
        const phaseFactor = 1.0 + Math.max(0, theme.tier) * 0.42;
        const speedMult = (isBursting ? 2.6 : 1.0) * phaseFactor;

        // 1. Starfield Scrolling (Recycles safely well behind the camera)
        const starSpeed = (isBursting ? 115 : 34) * phaseFactor;
        for (let i = 0; i < STAR_PARTICLE_COUNT; i++) {
            let sz = this.starfieldPositions[i * 3 + 2];
            sz += dt * starSpeed;
            if (sz > camZ + 25) {
                sz -= 300;
            } else if (sz < camZ - 300) {
                sz += 300;
            }
            this.starfieldPositions[i * 3 + 2] = sz;
        }
        (this.starfieldGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // 2. Massive Photorealistic Planets Rotating (Cloud Deck Drift + Day/Night City Lights + Asteroid Ring Belts)
        // Uniform synchronized cosmic drift ensures planets NEVER collide or drift into each other!
        for (const p of this.planets) {
            p.sphereMesh.rotation.y += p.rotSpeedY * dt;
            p.surfaceMat.uniforms['uTime'].value = this.elapsed;
            if (p.ringSystemGroup) {
                p.ringSystemGroup.rotation.y -= p.rotSpeedY * 0.45 * dt;
            }
            p.group.position.z += p.driftSpeedZ * speedMult * dt;

            // Only recycled once completely behind the camera frustum (camZ + 85, well past rings).
            if (p.group.position.z > camZ + 85) {
                p.group.position.z -= 280;
            } else if (p.group.position.z < camZ - 365) {
                p.group.position.z += 280;
            }
        }

        // 3. Shooting Stars / Comets Streaking Across the Void
        for (const s of this.shootingStars) {
            s.age += dt;
            if (s.age >= s.maxAge || s.group.position.z > camZ + 30) {
                this.respawnShootingStar(s, this.ship.pos.z);
                continue;
            }
            s.group.position.addScaledVector(s.vel, dt * (isBursting ? 1.5 : 1.0));
            const lifeNorm = s.age / s.maxAge;
            const fade = Math.sin(lifeNorm * Math.PI);

            // Proximity fade so comets smoothly disappear if nearing camera plane, never popping
            const distToCam = camZ - s.group.position.z;
            const proximityFade = THREE.MathUtils.clamp((distToCam - 6.0) / 20.0, 0.0, 1.0);
            s.tailMat.opacity = fade * proximityFade * 0.88;
            (s.headSprite.material as THREE.SpriteMaterial).opacity = fade * proximityFade;
        }

        // 5. Cratered Regolith Asteroids Tumbling & Scrolling (Fly naturally past camera, never pop ahead)
        const isBonusStageClearZone = this.isRouletteActive || this.isSlotActive;
        const camX = this.camera.position.x;
        for (const ast of this.asteroids) {
            ast.mesh.rotation.x += ast.rotSpeedX * dt;
            ast.mesh.rotation.y += ast.rotSpeedY * dt;
            ast.mesh.rotation.z += ast.rotSpeedZ * dt;
            ast.mesh.position.z += ast.driftSpeedZ * speedMult * dt;

            // Keep foreground corridor unobstructed during Giant Wheel / Mini-Slot showcases
            if (
                isBonusStageClearZone &&
                ast.mesh.position.z > camZ - 19 &&
                ast.mesh.position.z < camZ + 6 &&
                Math.abs(ast.mesh.position.x - camX) < 11.5
            ) {
                const pushDir = ast.mesh.position.x >= camX ? 1 : -1;
                ast.mesh.position.x = camX + pushDir * 13.5;
            }

            // Only recycle once asteroid has completely tumbled past and exited behind camera
            if (ast.mesh.position.z > camZ + 35) {
                ast.mesh.position.z -= 280;
                const lateralDepth = Math.abs(ast.mesh.position.z - camZ) + 18;
                const side = Math.sign(ast.baseX);
                if (side !== 0) {
                    ast.mesh.position.x = side * lateralDepth * (0.24 + Math.random() * 0.38);
                } else {
                    ast.mesh.position.x = (Math.random() - 0.5) * 42;
                }
            } else if (ast.mesh.position.z < camZ - 310) {
                ast.mesh.position.z += 280;
                const lateralDepth = Math.abs(ast.mesh.position.z - camZ) + 18;
                const side = Math.sign(ast.baseX);
                if (side !== 0) {
                    ast.mesh.position.x = side * lateralDepth * (0.24 + Math.random() * 0.38);
                } else {
                    ast.mesh.position.x = (Math.random() - 0.5) * 42;
                }
            }
        }

        // 6. Photorealistic Volumetric Nebulas with Shifting Colors & Proximity Opacity Feathering
        for (const c of this.nebulaClouds) {
            c.sprite.position.y = c.baseY + Math.sin(this.elapsed * 1.2 + c.offsetZ) * 1.2;
            c.sprite.position.x = c.baseX + Math.cos(this.elapsed * 0.65 + c.offsetZ) * 1.8;
            c.sprite.position.z += c.driftSpeedZ * speedMult * dt;

            const shiftedHue = (c.baseHue + this.elapsed * 0.018 + Math.sin(c.offsetZ) * 0.06) % 1.0;
            c.mat.color.setHSL(shiftedHue, 0.75, c.baseLightness);

            // Smooth proximity opacity feathering: near fade and far fade (zero popping)
            const distZ = camZ - c.sprite.position.z;
            const nearFade = THREE.MathUtils.clamp((distZ - 10.0) / 38.0, 0.0, 1.0);
            const farFade = THREE.MathUtils.clamp((280.0 - distZ) / 60.0, 0.0, 1.0);
            c.mat.opacity = c.baseOpacity * nearFade * farFade;

            // Recycle along the lateral flanks: NEVER drift into the center flight corridor!
            if (c.sprite.position.z > camZ + 30) {
                c.sprite.position.z -= 280;
                const lateralDepth = Math.abs(c.sprite.position.z - camZ) + 16;
                const side = Math.sign(c.baseX) || (Math.random() > 0.5 ? 1 : -1);
                c.baseX = side * (lateralDepth * (0.35 + Math.random() * 0.38) + 18);
            } else if (c.sprite.position.z < camZ - 310) {
                c.sprite.position.z += 280;
                const lateralDepth = Math.abs(c.sprite.position.z - camZ) + 16;
                const side = Math.sign(c.baseX) || (Math.random() > 0.5 ? 1 : -1);
                c.baseX = side * (lateralDepth * (0.35 + Math.random() * 0.38) + 18);
            }
        }

        // Animate 900 Nebula Flow Stream Particles along sinuous cosmic currents
        const flowSpeedZ = isBursting ? 42 : 16;
        for (let i = 0; i < NEBULA_FLOW_PARTICLE_COUNT; i++) {
            const phase = this.nebulaFlowPhases[i];
            let fx = this.nebulaFlowPositions[i * 3];
            let fy = this.nebulaFlowPositions[i * 3 + 1];
            let fz = this.nebulaFlowPositions[i * 3 + 2];

            fx += Math.sin(this.elapsed * 1.4 + phase + fz * 0.03) * 2.4 * dt;
            fy += Math.cos(this.elapsed * 1.1 + phase + fx * 0.04) * 1.8 * dt;
            fz += flowSpeedZ * dt;

            if (fz > camZ + 20) {
                fz -= 260;
            } else if (fz < camZ - 260) {
                fz += 260;
            }

            this.nebulaFlowPositions[i * 3] = fx;
            this.nebulaFlowPositions[i * 3 + 1] = fy;
            this.nebulaFlowPositions[i * 3 + 2] = fz;
        }
        (this.nebulaFlowGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // 7. Camera-Reactive Cosmic Dust Motes (reacting to camera velocity & parallax!)
        const camSlipX = -this.camVel.x * 0.38 - this.mouseParallax.x * 3.2;
        const camSlipY = -this.camVel.y * 0.38 + this.mouseParallax.y * 2.4;
        const dustSpeedZ = (isBursting ? 68 : 24) - this.camVel.z * 0.45;

        for (let i = 0; i < COSMIC_DUST_PARTICLE_COUNT; i++) {
            let dx = this.cosmicDustPositions[i * 3] + camSlipX * dt;
            let dy = this.cosmicDustPositions[i * 3 + 1] + camSlipY * dt;
            let dz = this.cosmicDustPositions[i * 3 + 2] + dustSpeedZ * dt;

            const maxLateralX = Math.abs(dz - camZ) * 0.95 + 28;
            if (dx > maxLateralX) dx -= maxLateralX * 2;
            else if (dx < -maxLateralX) dx += maxLateralX * 2;

            if (dy > 18) dy -= 32;
            else if (dy < -14) dy += 32;

            if (dz > camZ + 15) {
                dz -= 160;
            } else if (dz < camZ - 160) {
                dz += 160;
            }

            this.cosmicDustPositions[i * 3] = dx;
            this.cosmicDustPositions[i * 3 + 1] = dy;
            this.cosmicDustPositions[i * 3 + 2] = dz;
        }
        (this.cosmicDustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    private updateTrajectoryArc(isPlaying: boolean, isHitStop: boolean, primaryHex: number) {
        const engine = this.gameState.engine;
        const targetLane = isHitStop ? this.gameState.hitStopLane : this.hoveredLane;

        if (!isPlaying || targetLane === null) {
            this.trajectoryLine.visible = false;
            return;
        }

        const start = this.scratchTrajStart.set(this.ship.pos.x, this.ship.pos.y + 0.2, this.ship.pos.z - 2.2);
        const end = this.scratchTrajEnd.set(
            PixiRenderer.laneToWorldX(targetLane),
            1.1,
            PixiRenderer.rowToWorldZ(engine.currentRow)
        );
        const mid = this.scratchTrajMid.set(
            (start.x + end.x) * 0.5,
            Math.max(start.y, end.y) + 2.0,
            (start.z + end.z) * 0.5
        );

        const segments = 32;
        const tmp = this.scratchTrajTmp;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const inv = 1 - t;
            tmp.set(
                inv * inv * start.x + 2 * inv * t * mid.x + t * t * end.x,
                inv * inv * start.y + 2 * inv * t * mid.y + t * t * end.y,
                inv * inv * start.z + 2 * inv * t * mid.z + t * t * end.z
            );
            this.trajectoryPositions[i * 3] = tmp.x;
            this.trajectoryPositions[i * 3 + 1] = tmp.y;
            this.trajectoryPositions[i * 3 + 2] = tmp.z;
        }

        (this.trajectoryLine.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        this.trajectoryMat.color.setHex(isHitStop ? 0xfde047 : primaryHex);
        this.trajectoryLine.visible = true;
    }
}
