import * as THREE from 'three';
import gsap from 'gsap';
import { GameState, type RoundPick, type WheelSpinOutcome } from '../math/types';
import { calculateNextStepMultiplier } from '../math/multipliers';
import { GameStateController } from './GameState';
import { VFXManager } from './VFX_Manager';
import { createPBRTexturePack, updateHologramBadgeCanvas, type PBRTexturePack } from './Textures3D';
import { Spaceship3D } from './Spaceship3D';
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
    wheelStandDisc: THREE.Mesh;
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

        // Build 3D AAA [SPACE-OVERDRIVE V4] Starfighter (Floats freely in the open cosmic void)
        this.ship = new Spaceship3D(this.scene, this.textures);
        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
        this.ship.setShieldActive(this.gameState.engine.shieldPurchased, false);

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

        // 3D Comic Prize Wheel on Wooden Stand (Matching Ruleta.jpeg)
        const basePlankGeo = new THREE.BoxGeometry(2.35, 0.22, 0.44);
        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x92400e,
            roughness: 0.55,
            metalness: 0.08
        });
        const boltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.24, 8);
        const boltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
        const legGeo = new THREE.BoxGeometry(0.20, 2.35, 0.20);
        const crossGeo = new THREE.BoxGeometry(1.65, 0.18, 0.20);
        const rimGeo = new THREE.TorusGeometry(1.38, 0.14, 12, 32);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5, metalness: 0.15 });
        const studGeo = new THREE.SphereGeometry(0.042, 8, 8);
        const studMat = new THREE.MeshStandardMaterial({
            color: 0xfde047,
            emissive: 0xd97706,
            emissiveIntensity: 0.35,
            roughness: 0.2,
            metalness: 0.9
        });
        const wheelDiscGeo = new THREE.CylinderGeometry(1.34, 1.34, 0.10, 32);
        wheelDiscGeo.rotateX(Math.PI / 2);
        const hubGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 16);
        hubGeo.rotateX(Math.PI / 2);
        const hubMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xb45309,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.85
        });

        const flapperShape = new THREE.Shape();
        flapperShape.moveTo(-0.14, 0.18);
        flapperShape.lineTo(0.14, 0.18);
        flapperShape.lineTo(0.0, -0.38);
        flapperShape.closePath();
        const flapperGeo = new THREE.ExtrudeGeometry(flapperShape, {
            depth: 0.08,
            bevelEnabled: true,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.02,
            bevelThickness: 0.02
        });
        const flapperMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            emissive: 0x991b1b,
            emissiveIntensity: 0.45,
            roughness: 0.2,
            metalness: 0.6
        });

        const buildWheelStandForTile = () => {
            const wheelStandGroup = new THREE.Group();
            wheelStandGroup.position.set(0, 0, 0);
            wheelStandGroup.visible = false;

            // 1. Base Footing Plank
            const basePlankMesh = new THREE.Mesh(basePlankGeo, woodMat);
            basePlankMesh.position.set(0, 0.11, 0);
            const baseOutline = this.createOutline(basePlankGeo, 0.04, basePlankMesh.position);
            wheelStandGroup.add(basePlankMesh, baseOutline);

            for (const bx of [-0.95, -0.65, 0.65, 0.95]) {
                const bolt = new THREE.Mesh(boltGeo, boltMat);
                bolt.position.set(bx, 0.12, 0);
                wheelStandGroup.add(bolt);
            }

            // 2. Upright Legs (A-frame)
            const leftLeg = new THREE.Mesh(legGeo, woodMat);
            leftLeg.position.set(-0.54, 1.18, -0.05);
            leftLeg.rotation.z = -0.21;
            const leftLegOutline = this.createOutline(legGeo, 0.038, leftLeg.position, leftLeg.rotation);
            wheelStandGroup.add(leftLeg, leftLegOutline);

            const rightLeg = new THREE.Mesh(legGeo, woodMat);
            rightLeg.position.set(0.54, 1.18, -0.05);
            rightLeg.rotation.z = 0.21;
            const rightLegOutline = this.createOutline(legGeo, 0.038, rightLeg.position, rightLeg.rotation);
            wheelStandGroup.add(rightLeg, rightLegOutline);

            // 3. Crossbeam
            const crossMesh = new THREE.Mesh(crossGeo, woodMat);
            crossMesh.position.set(0, 0.72, -0.04);
            const crossOutline = this.createOutline(crossGeo, 0.035, crossMesh.position);
            wheelStandGroup.add(crossMesh, crossOutline);

            // 4. Circular Wooden Rim with golden studs
            const rimMesh = new THREE.Mesh(rimGeo, rimMat);
            rimMesh.position.set(0, 1.95, 0.08);
            const rimOutline = this.createOutline(rimGeo, 0.035, rimMesh.position);
            wheelStandGroup.add(rimMesh, rimOutline);

            for (let i = 0; i < 12; i++) {
                const ang = (i * Math.PI * 2) / 12;
                const stud = new THREE.Mesh(studGeo, studMat);
                stud.position.set(Math.cos(ang) * 1.38, 1.95 + Math.sin(ang) * 1.38, 0.21);
                wheelStandGroup.add(stud);
            }

            // 5. Rotating Wheel Disc
            const wheelDiscMesh = new THREE.Mesh(wheelDiscGeo, miniWheelMats);
            wheelDiscMesh.position.set(0, 1.95, 0.08);
            const wheelDiscOutline = this.createOutline(wheelDiscGeo, 0.035);
            wheelDiscMesh.add(wheelDiscOutline);
            wheelStandGroup.add(wheelDiscMesh);

            const hubMesh = new THREE.Mesh(hubGeo, hubMat);
            hubMesh.position.set(0, 0, 0.08);
            wheelDiscMesh.add(hubMesh);

            // 6. Flapper pointer at 12 o'clock
            const flapperGroup = new THREE.Group();
            flapperGroup.position.set(0, 3.42, 0.18);
            const flapperMesh = new THREE.Mesh(flapperGeo, flapperMat);
            flapperMesh.position.z = -0.04;
            const flapperOutline = this.createOutline(flapperGeo, 0.03);
            flapperGroup.add(flapperMesh, flapperOutline);
            wheelStandGroup.add(flapperGroup);

            return {
                wheelStandGroup,
                wheelStandDisc: wheelDiscMesh,
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

        this.giantWheelDisc = new THREE.Group();
        this.giantRouletteGroup.add(this.giantWheelDisc);

        const wheelGeo = new THREE.CylinderGeometry(4.6, 4.6, 0.38, 48);
        wheelGeo.rotateX(Math.PI / 2);

        const wheelRimMat = new THREE.MeshStandardMaterial({
            color: 0x78350f,
            roughness: 0.32,
            metalness: 0.28
        });
        const wheelFaceMat = new THREE.MeshStandardMaterial({
            map: this.textures.wheelFaceTex,
            roughness: 0.22,
            metalness: 0.12
        });
        const wheelBackMat = new THREE.MeshStandardMaterial({
            color: 0x451a03,
            roughness: 0.65,
            metalness: 0.05
        });

        const wheelMesh = new THREE.Mesh(wheelGeo, [wheelRimMat, wheelFaceMat, wheelBackMat]);
        const wheelOutline = this.createOutline(wheelGeo, 0.065);
        this.giantWheelDisc.add(wheelMesh, wheelOutline);

        // 12 Outer 3D Golden Pegs around perimeter
        const pegGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.28, 12);
        pegGeo.rotateX(Math.PI / 2);
        const pegMat = new THREE.MeshStandardMaterial({
            color: 0xfde047,
            emissive: 0xd97706,
            emissiveIntensity: 0.25,
            roughness: 0.15,
            metalness: 0.95
        });
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (i + 0.5) * (Math.PI * 2 / 12);
            const px = Math.cos(angle) * 4.25;
            const py = Math.sin(angle) * 4.25;
            const pegMesh = new THREE.Mesh(pegGeo, pegMat);
            pegMesh.position.set(px, py, 0.22);
            this.giantWheelDisc.add(pegMesh);
        }

        // Center 3D Golden Boss Stud (compact radius matching Ruleta.jpeg)
        const bossGeo = new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        bossGeo.rotateX(Math.PI / 2);
        const bossMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xb45309,
            emissiveIntensity: 0.35,
            roughness: 0.18,
            metalness: 0.85
        });
        const bossMesh = new THREE.Mesh(bossGeo, bossMat);
        bossMesh.position.set(0, 0, 0.20);
        this.giantWheelDisc.add(bossMesh);

        // Top Flapper / Pointer Assembly at 12 o'clock (matching crimson teardrop pointer of Ruleta.jpeg)
        this.giantWheelFlapper = new THREE.Group();
        this.giantWheelFlapper.position.set(0, 4.62, 0.32);
        this.giantRouletteGroup.add(this.giantWheelFlapper);

        const flapperShape = new THREE.Shape();
        flapperShape.moveTo(-0.24, 0.28);
        flapperShape.lineTo(0.24, 0.28);
        flapperShape.lineTo(0.0, -0.65);
        flapperShape.closePath();

        const flapperExtrude = new THREE.ExtrudeGeometry(flapperShape, {
            depth: 0.12,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.03,
            bevelThickness: 0.03
        });
        const flapperMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            emissive: 0x991b1b,
            emissiveIntensity: 0.45,
            roughness: 0.2,
            metalness: 0.7
        });
        const flapperMesh = new THREE.Mesh(flapperExtrude, flapperMat);
        flapperMesh.position.z = -0.06;
        const flapperOutline = this.createOutline(flapperExtrude, 0.04);
        this.giantWheelFlapper.add(flapperMesh, flapperOutline);

        const bracketGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16);
        bracketGeo.rotateX(Math.PI / 2);
        const bracketMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 });
        const bracketMesh = new THREE.Mesh(bracketGeo, bracketMat);
        bracketMesh.position.set(0, 0.26, 0);
        this.giantWheelFlapper.add(bracketMesh);

        const wheelGlowLight = new THREE.PointLight(0xfef08a, 1.4, 24.0, 1.4);
        wheelGlowLight.position.set(0, 2.5, 3.2);
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
    }

    /**
     * Constructs a true 3D Sculpted Comic Astronaut model for the zero-G void scene.
     * 100% faithful to AEspaldas.jpeg:
     * - Sculpted 3D heightfield relief matching the exact illustration proportions, linework, and colors.
     * - Watertight extruded dark-ink side bevel giving 0.50 units of volumetric 3D thickness.
     * - Front face mapped to astronautBackTex and astronautNormalTex for realistic specular PBR response.
     * - 4 physical 3D ribbed umbilical hoses with cyan, red, cobalt blue, and yellow metallic collars.
     * - 3D telemetry life support monitor on the backpack with glowing CRT display and LED indicators.
     * - Dual 3D RCS thruster cones emitting subtle zero-G blue ion attitude stabilization thrust.
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
        root.scale.setScalar(1.45);

        const worldWidth = 2.45;
        const worldHeight = 2.95;
        const gridW = 54;
        const gridH = 66;

        // Depth profile function for anatomical 3D relief
        const evaluateAstroDepth = (u: number, v: number): number => {
            const dx = u - 0.5;
            // 1. Helmet dome (curves outward towards viewer)
            const distH = Math.hypot(dx * 1.05, (v - 0.17) * 1.15);
            const zDome = distH < 0.18 ? Math.cos((distH / 0.18) * Math.PI * 0.5) * 0.18 : 0;

            // 2. PLSS Backpack block
            const bx = Math.min(1.0, Math.abs(dx) / 0.22);
            const by = Math.min(1.0, Math.abs(v - 0.435) / 0.165);
            const boxFalloff = Math.max(0, 1.0 - Math.pow(bx, 6) - Math.pow(by, 6));
            const zBackpack = boxFalloff * 0.22;

            // 3. Central Telemetry Unit
            const tx = Math.min(1.0, Math.abs(dx) / 0.10);
            const ty = Math.min(1.0, Math.abs(v - 0.46) / 0.08);
            const zTelemetry = Math.max(0, 1.0 - Math.pow(tx, 4) - Math.pow(ty, 4)) * 0.04;

            // 4. Torso & harness
            const distT = Math.hypot(dx * 1.8, (v - 0.45) * 1.5);
            const zTorso = Math.max(0, 1.0 - distT) * 0.14;

            // 5. Arms
            const zArmL = Math.max(0, 1.0 - Math.abs(u - 0.20) / 0.12) * Math.max(0, 1.0 - Math.abs(v - 0.50) / 0.18) * 0.12;
            const zArmR = Math.max(0, 1.0 - Math.abs(u - 0.80) / 0.12) * Math.max(0, 1.0 - Math.abs(v - 0.50) / 0.18) * 0.12;

            // 6. Legs
            const zLegL = v > 0.65 ? Math.max(0, 1.0 - Math.abs(u - 0.40) / 0.12) * 0.14 : 0;
            const zLegR = v > 0.65 ? Math.max(0, 1.0 - Math.abs(u - 0.60) / 0.12) * 0.14 : 0;

            // 7. Boots soles
            const zBoots = v > 0.86 ? ((v - 0.86) / 0.14) * 0.06 : 0;

            return Math.max(0.04, zDome, zBackpack + zTelemetry, zTorso, zArmL, zArmR, zLegL, zLegR) + zBoots;
        };

        // Watertight 3D Geometry Builder
        const buildAstroGeometry = (alphaGrid: Float32Array): THREE.BufferGeometry => {
            const positions: number[] = [];
            const uvs: number[] = [];
            const indices: number[] = [];

            const vCols = gridW + 1;
            const vRows = gridH + 1;
            const frontVertIdx = new Int32Array(vCols * vRows).fill(-1);

            const isCellActive = (cx: number, cy: number): boolean => {
                if (cx < 0 || cx >= gridW || cy < 0 || cy >= gridH) return false;
                return alphaGrid[cy * gridW + cx] > 0.08;
            };

            const getOrAddFrontVert = (vx: number, vy: number): number => {
                const key = vy * vCols + vx;
                if (frontVertIdx[key] !== -1) return frontVertIdx[key];

                const u = vx / gridW;
                const v = vy / gridH;
                const x = (u - 0.5) * worldWidth;
                const y = (0.5 - v) * worldHeight;
                const z = evaluateAstroDepth(u, v);

                const idx = positions.length / 3;
                positions.push(x, y, z);
                uvs.push(u, 1.0 - v);
                frontVertIdx[key] = idx;
                return idx;
            };

            // 1. Front Sculpted Mesh
            for (let cy = 0; cy < gridH; cy++) {
                for (let cx = 0; cx < gridW; cx++) {
                    if (!isCellActive(cx, cy)) continue;

                    const f00 = getOrAddFrontVert(cx, cy);
                    const f10 = getOrAddFrontVert(cx + 1, cy);
                    const f01 = getOrAddFrontVert(cx, cy + 1);
                    const f11 = getOrAddFrontVert(cx + 1, cy + 1);

                    indices.push(f00, f01, f10);
                    indices.push(f10, f01, f11);
                }
            }

            // 2. Extruded Bevel Side Shell (Dark Ink Edge)
            const zBack = -0.16;
            const addSideQuad = (
                x1: number, y1: number, z1: number, u1: number, v1: number,
                x2: number, y2: number, z2: number, u2: number, v2: number
            ) => {
                const i0 = positions.length / 3;
                positions.push(x1, y1, z1);
                uvs.push(u1, 1.0 - v1);

                const i1 = positions.length / 3;
                positions.push(x2, y2, z2);
                uvs.push(u2, 1.0 - v2);

                const i2 = positions.length / 3;
                positions.push(x2, y2, zBack);
                uvs.push(u2, 1.0 - v2);

                const i3 = positions.length / 3;
                positions.push(x1, y1, zBack);
                uvs.push(u1, 1.0 - v1);

                indices.push(i0, i1, i2);
                indices.push(i0, i2, i3);
            };

            for (let cy = 0; cy < gridH; cy++) {
                for (let cx = 0; cx < gridW; cx++) {
                    if (!isCellActive(cx, cy)) continue;

                    const u0 = cx / gridW;
                    const u1 = (cx + 1) / gridW;
                    const v0 = cy / gridH;
                    const v1 = (cy + 1) / gridH;

                    const x0 = (u0 - 0.5) * worldWidth;
                    const x1 = (u1 - 0.5) * worldWidth;
                    const y0 = (0.5 - v0) * worldHeight;
                    const y1 = (0.5 - v1) * worldHeight;

                    const z00 = evaluateAstroDepth(u0, v0);
                    const z10 = evaluateAstroDepth(u1, v0);
                    const z01 = evaluateAstroDepth(u0, v1);
                    const z11 = evaluateAstroDepth(u1, v1);

                    // Top Edge
                    if (!isCellActive(cx, cy - 1)) {
                        addSideQuad(x0, y0, z00, u0, v0, x1, y0, z10, u1, v0);
                    }
                    // Bottom Edge
                    if (!isCellActive(cx, cy + 1)) {
                        addSideQuad(x1, y1, z11, u1, v1, x0, y1, z01, u0, v1);
                    }
                    // Left Edge
                    if (!isCellActive(cx - 1, cy)) {
                        addSideQuad(x0, y1, z01, u0, v1, x0, y0, z00, u0, v0);
                    }
                    // Right Edge
                    if (!isCellActive(cx + 1, cy)) {
                        addSideQuad(x1, y0, z10, u1, v0, x1, y1, z11, u1, v1);
                    }
                }
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geo.setIndex(indices);
            geo.computeVertexNormals();
            return geo;
        };

        const suitPbrMat = new THREE.MeshStandardMaterial({
            map: this.textures.astronautBackTex,
            normalMap: this.textures.astronautNormalTex,
            normalScale: new THREE.Vector2(0.85, 0.85),
            roughness: 0.38,
            metalness: 0.15,
            side: THREE.DoubleSide
        });

        // Elliptical fallback alpha while image loads
        const initAlpha = new Float32Array(gridW * gridH);
        for (let cy = 0; cy < gridH; cy++) {
            const v = (cy + 0.5) / gridH;
            for (let cx = 0; cx < gridW; cx++) {
                const u = (cx + 0.5) / gridW;
                const d = Math.hypot((u - 0.5) * 1.35, (v - 0.48) * 1.15);
                initAlpha[cy * gridW + cx] = d < 0.52 ? 1.0 : 0.0;
            }
        }
        const astroGeo = buildAstroGeometry(initAlpha);
        const astroMesh = new THREE.Mesh(astroGeo, suitPbrMat);
        root.add(astroMesh);

        // Update with exact image alpha from texture canvas
        const updateWithExactImageAlpha = (img: HTMLImageElement | HTMLCanvasElement) => {
            const off = document.createElement('canvas');
            off.width = gridW;
            off.height = gridH;
            const octx = off.getContext('2d')!;
            octx.drawImage(img, 0, 0, gridW, gridH);
            const data = octx.getImageData(0, 0, gridW, gridH).data;
            const exactAlpha = new Float32Array(gridW * gridH);
            for (let i = 0; i < gridW * gridH; i++) {
                exactAlpha[i] = data[i * 4 + 3] / 255.0;
            }
            astroMesh.geometry.dispose();
            astroMesh.geometry = buildAstroGeometry(exactAlpha);
        };

        if (this.textures.astronautBackTex.image) {
            updateWithExactImageAlpha(this.textures.astronautBackTex.image as any);
        } else {
            const ldr = new THREE.TextureLoader();
            ldr.load('/assets/astronaut_back.png', (t) => {
                if (t.image) updateWithExactImageAlpha(t.image);
            });
        }

        // =====================================================================
        // 3D PHYSICAL ATTACHMENTS IN REAL 3D SPACE
        // =====================================================================
        // 1. Four 3D Umbilical Hoses with Metallic Colored Collars
        const rubberHoseMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.65,
            metalness: 0.20
        });
        const makeCollarMat = (hex: number) =>
            new THREE.MeshStandardMaterial({
                color: hex,
                roughness: 0.25,
                metalness: 0.85,
                emissive: hex,
                emissiveIntensity: 0.25
            });

        const hoseGroup = new THREE.Group();
        root.add(hoseGroup);

        const collarGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12);
        collarGeo.rotateX(Math.PI / 2);

        const addHose = (points: THREE.Vector3[], collarHex: number) => {
            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.026, 8, false);
            const hose = new THREE.Mesh(tubeGeo, rubberHoseMat);
            const collar = new THREE.Mesh(collarGeo, makeCollarMat(collarHex));
            collar.position.copy(points[0]);
            collar.lookAt(points[1]);
            hoseGroup.add(hose, collar);
        };

        // Top-Right Hose (Cyan collar 0x06b6d4)
        addHose([
            new THREE.Vector3(0.24, 0.42, 0.38),
            new THREE.Vector3(0.38, 0.30, 0.42),
            new THREE.Vector3(0.42, 0.16, 0.32),
            new THREE.Vector3(0.28, 0.06, 0.22)
        ], 0x06b6d4);

        // Bottom-Right Hose (Yellow collar 0xfacc15)
        addHose([
            new THREE.Vector3(0.18, -0.06, 0.36),
            new THREE.Vector3(0.36, -0.10, 0.38),
            new THREE.Vector3(0.42, -0.14, 0.26),
            new THREE.Vector3(0.26, -0.18, 0.20)
        ], 0xfacc15);

        // Top-Left Hose (Cobalt Blue collar 0x2563eb)
        addHose([
            new THREE.Vector3(-0.16, 0.24, 0.38),
            new THREE.Vector3(-0.36, 0.20, 0.42),
            new THREE.Vector3(-0.42, 0.12, 0.30),
            new THREE.Vector3(-0.28, 0.04, 0.22)
        ], 0x2563eb);

        // Bottom-Left Hose (Red collar 0xef4444)
        addHose([
            new THREE.Vector3(-0.22, -0.06, 0.36),
            new THREE.Vector3(-0.38, -0.10, 0.38),
            new THREE.Vector3(-0.44, -0.16, 0.26),
            new THREE.Vector3(-0.26, -0.22, 0.20)
        ], 0xef4444);

        // 2. 3D Telemetry Life Support Monitor on Backpack
        const telemetryGroup = new THREE.Group();
        telemetryGroup.position.set(0, 0.12, 0.38);
        root.add(telemetryGroup);

        const bezelGeo = new THREE.BoxGeometry(0.32, 0.40, 0.04);
        const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
        telemetryGroup.add(new THREE.Mesh(bezelGeo, bezelMat));

        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 128;
        screenCanvas.height = 80;
        const sctx = screenCanvas.getContext('2d')!;
        sctx.fillStyle = '#051912';
        sctx.fillRect(0, 0, 128, 80);
        sctx.strokeStyle = '#10b981';
        sctx.lineWidth = 2.5;
        sctx.beginPath();
        for (let x = 0; x < 128; x++) {
            const y = 40 + Math.sin(x * 0.15) * 18 + (x % 16 === 0 ? -12 : 0);
            if (x === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
        }
        sctx.stroke();
        const screenTex = new THREE.CanvasTexture(screenCanvas);
        screenTex.colorSpace = THREE.SRGBColorSpace;
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
        const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), screenMat);
        screenMesh.position.set(0, 0.08, 0.025);
        telemetryGroup.add(screenMesh);

        const ledGeo = new THREE.SphereGeometry(0.018, 8, 8);
        const ledG = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        ledG.position.set(-0.08, -0.08, 0.025);
        const ledY = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        ledY.position.set(0, -0.08, 0.025);
        const ledC = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
        ledC.position.set(0.08, -0.08, 0.025);
        telemetryGroup.add(ledG, ledY, ledC);

        // 3. Dual 3D RCS Attitude Thruster Nozzles
        const rcsGroup = new THREE.Group();
        root.add(rcsGroup);

        const rcsConeGeo = new THREE.CylinderGeometry(0.032, 0.055, 0.10, 8);
        rcsConeGeo.rotateX(Math.PI / 2);
        const rcsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.85 });

        const rcsL = new THREE.Mesh(rcsConeGeo, rcsMat);
        rcsL.position.set(-0.35, 0.50, 0.32);
        const rcsR = new THREE.Mesh(rcsConeGeo, rcsMat);
        rcsR.position.set(0.35, 0.50, 0.32);
        rcsGroup.add(rcsL, rcsR);

        const dummyGroup = new THREE.Group();

        return {
            root,
            helmet: dummyGroup,
            backpack: telemetryGroup,
            leftArm: dummyGroup,
            rightArm: dummyGroup,
            leftLeg: dummyGroup,
            rightLeg: dummyGroup
        };
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
        this.lastFlapperPegIndex = -1;

        // 1. Starfighter approaches and brakes smoothly right before the box
        gsap.killTweensOf(this.ship.pos);
        this.ship.vel.set(0, 0, 0);
        gsap.to(this.ship.pos, {
            x: worldX,
            y: SHIP_FLIGHT_Y,
            z: worldZ + 1.85,
            duration: 0.36,
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
                    this.vfx.spawnShockwave3D(worldX, 1.95, worldZ, 0xfacc15, 6.0, 0.35);
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.95,
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
                        duration: 0.14,
                        ease: 'back.out(2)',
                        onComplete: () => {
                            hitCard.wheelStandGroup.visible = false;
                        }
                    });
                }

                // 3. Canopy opens & pressurized smoke vents out
                this.ship.openCockpitCanopy(0.40);
                this.vfx.spawnGpuParticleCloud(
                    worldX,
                    SHIP_FLIGHT_Y + 0.45,
                    worldZ + 1.85,
                    65,
                    [0xffffff, 0xe0f2fe, 0xbae6fd, 0x38bdf8],
                    4,
                    12,
                    0.7
                );
                this.vfx.spawnGpuParticleCloud(
                    worldX + 0.15,
                    SHIP_FLIGHT_Y + 0.35,
                    worldZ + 1.95,
                    45,
                    [0xffffff, 0xf1f5f9],
                    3,
                    10,
                    0.65
                );

                // 4. Astronaut ejects into zero-G void
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);
                gsap.to(this.ship.cockpitAstronaut.position, {
                    y: 2.4,
                    z: 0.7,
                    duration: 0.42,
                    ease: 'power1.out',
                    onComplete: () => {
                        this.ship.cockpitAstronaut.visible = false;
                        this.ship.root.visible = false; // Starfighter leaves focus so scene is purely astronaut in zero-G void!

                        // 5. Cosmic Void Scene Setup
                        const wheelZ = worldZ - 7.5;
                        const wheelY = SHIP_FLIGHT_Y + 0.85;

                        this.giantRouletteGroup.visible = true;
                        this.giantRouletteGroup.position.set(worldX, wheelY + 16, wheelZ);
                        this.wheelCurrentAngle = 0;
                        this.giantWheelDisc.rotation.z = 0;

                        gsap.to(this.giantRouletteGroup.position, {
                            y: wheelY,
                            duration: 0.75,
                            ease: 'back.out(1.2)'
                        });

                        this.floatingAstronautGroup.visible = true;
                        this.floatingAstronautGroup.position.set(
                            worldX,
                            SHIP_FLIGHT_Y - 0.20,
                            worldZ - 1.8
                        );
                        gsap.fromTo(
                            this.floatingAstronautGroup.position,
                            { y: SHIP_FLIGHT_Y + 1.8 },
                            { y: SHIP_FLIGHT_Y - 0.20, duration: 0.65, ease: 'power2.out' }
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
        const targetAngle = startAngle + outcome.spinAngleRad;
        const totalDuration = outcome.isNearMiss ? 5.8 : 4.4;

        const spinTracker = { progress: 0 };
        this.lastFlapperPegIndex = -1;

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
                }

                const currentAngle = startAngle + (targetAngle - startAngle) * t;
                this.wheelCurrentAngle = currentAngle;
                this.giantWheelDisc.rotation.z = currentAngle;

                const sectorSize = (Math.PI * 2) / 12;
                const pegIndex = Math.floor(currentAngle / sectorSize);

                // Flapper mechanical deflection as peg pushes against it
                const sectorOffset = ((currentAngle % sectorSize) + sectorSize) % sectorSize;
                const normInSector = sectorOffset / sectorSize;
                if (normInSector > 0.72) {
                    this.giantWheelFlapper.rotation.z = (normInSector - 0.72) * 1.5;
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
                this.isWheelSpinning = false;

                const worldX = this.giantRouletteGroup.position.x;
                const wheelY = this.giantRouletteGroup.position.y;
                const wheelZ = this.giantRouletteGroup.position.z;

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

                if (outcome.segment.type === 'WIPEOUT') {
                    audioController.playWheelWipeout();
                    this.vfx.spawnCrashExplosion3D(worldX, SHIP_FLIGHT_Y, wheelZ - 2.0);
                    this.vfx.triggerScreenShake(0.65, 0.45);
                    setTimeout(() => {
                        this.finishRouletteSequence(onComplete);
                    }, 1400);
                } else if (outcome.segment.type === 'EXTRA_SPIN' || outcome.segment.type === 'SLOT') {
                    audioController.playGoldenHit();
                    onComplete();
                } else {
                    audioController.playCashout(outcome.segment.multiplier >= 10);
                    this.vfx.spawnGraffitiMultiplierTag3D(
                        worldX,
                        wheelY + 1.2,
                        wheelZ,
                        this.gameState.engine.currentMultiplier,
                        this.gameState.engine.currentRow
                    );

                    setTimeout(() => {
                        this.finishRouletteSequence(onComplete);
                    }, 1800);
                }
            }
        });
    }

    public finishRouletteSequence(onComplete?: () => void) {
        gsap.to(this.floatingAstronautGroup.position, {
            y: SHIP_FLIGHT_Y + 1.8,
            duration: 0.50,
            ease: 'power2.in',
            onComplete: () => {
                this.floatingAstronautGroup.visible = false;
                this.ship.root.visible = true;
                this.ship.cockpitAstronaut.visible = true;
                this.ship.cockpitAstronaut.position.set(0, 0.32, 0.08);

                this.ship.closeCockpitCanopy(0.38, () => {
                    this.ship.cockpitAstronaut.visible = false;
                });

                gsap.to(this.giantRouletteGroup.position, {
                    y: this.giantRouletteGroup.position.y + 18,
                    duration: 0.65,
                    ease: 'power2.in',
                    onComplete: () => {
                        this.giantRouletteGroup.visible = false;
                        this.isRouletteActive = false;
                        this.ship.triggerSpeedBurst(0.65);
                        if (onComplete) onComplete();
                    }
                });
            }
        });
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
                this.giantRouletteGroup.visible = false;
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
                this.giantRouletteGroup.visible = false;
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
        if (!this.isAbductionActive && !this.isRouletteActive) {
            this.ship.setTargetPosition(targetShipX, SHIP_FLIGHT_Y, targetShipZ);
        }

        // Zero-G cosmic void drift for 3D volumetric astronaut facing the giant prize wheel
        if (this.isRouletteActive && this.floatingAstronautGroup.visible && this.astro3D) {
            const bob = Math.sin(this.elapsed * 1.8) * 0.10;
            const roll = Math.cos(this.elapsed * 1.4) * 0.04;
            const pitch = Math.sin(this.elapsed * 1.6) * 0.03;
            this.astro3D.root.position.y = bob;
            this.astro3D.root.rotation.z = roll;
            this.astro3D.root.rotation.x = pitch;

            this.astro3D.leftArm.rotation.z = -0.38 + Math.sin(this.elapsed * 1.5) * 0.04;
            this.astro3D.rightArm.rotation.z = 0.38 - Math.sin(this.elapsed * 1.5 + 0.4) * 0.04;
            this.astro3D.leftLeg.rotation.x = 0.20 + Math.sin(this.elapsed * 1.3) * 0.03;
            this.astro3D.rightLeg.rotation.x = 0.16 + Math.sin(this.elapsed * 1.3 + 0.5) * 0.03;
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

        // Cinematic framing for Cosmic Prize Wheel & Floating Astronaut in Zero-G
        if (this.isRouletteActive) {
            const rouZ = this.giantRouletteGroup.position.z;
            const rouX = this.giantRouletteGroup.position.x;
            const camTargetZ = rouZ + (isPortrait916 ? 14.8 : 12.8);
            const camTargetY = SHIP_FLIGHT_Y + (isPortrait916 ? 1.6 : 1.20);
            const camTargetX = rouX * 0.15;

            this.camPos.x = THREE.MathUtils.lerp(this.camPos.x, camTargetX, dt * 6.5);
            this.camPos.y = THREE.MathUtils.lerp(this.camPos.y, camTargetY, dt * 6.5);
            this.camPos.z = THREE.MathUtils.lerp(this.camPos.z, camTargetZ, dt * 6.5);

            this.camera.position.copy(this.camPos).add(this.vfx.shakeOffset);

            const lookY = SHIP_FLIGHT_Y + (isPortrait916 ? 1.4 : 1.20);
            const desiredLook = this.scratchDesiredLook.set(rouX, lookY, rouZ);
            this.camLookAt.lerp(desiredLook, dt * 10);
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
                if (this.isRouletteActive) {
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
                        plat.wheelStandDisc.rotation.z = this.elapsed * 1.2;
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
                    plat.badgeSprite.visible = !this.isRouletteActive;
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
        for (const ast of this.asteroids) {
            ast.mesh.rotation.x += ast.rotSpeedX * dt;
            ast.mesh.rotation.y += ast.rotSpeedY * dt;
            ast.mesh.rotation.z += ast.rotSpeedZ * dt;
            ast.mesh.position.z += ast.driftSpeedZ * speedMult * dt;

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
