import * as THREE from 'three';
import gsap from 'gsap';
import { GameState } from '../math/types';
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
const NEBULA_CLOUD_COUNT = 36;
const NEBULA_FLOW_PARTICLE_COUNT = 900;
const COSMIC_DUST_PARTICLE_COUNT = 1600;
const ASTEROID_COUNT = 36;
const STAR_PARTICLE_COUNT = 1800;
const PLANET_COUNT = 6;
const RING_ASTEROIDS_PER_PLANET = 360; // 1,440 individual 3D asteroids across the 4 ringed planets!
const SHOOTING_STAR_COUNT = 18;
const DISTANT_SUPERNOVA_COUNT = 4;
const HOVER_DEBOUNCE_MS = 90;
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

    // Materials for the 3 types of boxes
    boxMatNormal: THREE.MeshStandardMaterial;
    boxMatOrange: THREE.MeshStandardMaterial;
    boxMatAlien: THREE.MeshStandardMaterial;

    // Soft Diffuse Background Atmospheric Glow (Integrated with cosmic space, NO separate floating aura or floor circle)
    diffuseHazeSprite: THREE.Sprite;
    diffuseHazeMat: THREE.SpriteMaterial;

    // Contents inside/underneath the box
    miniSunGroup: THREE.Group;
    miniSunCore: THREE.Mesh;
    miniSunCorona: THREE.Sprite;
    alienPortalGroup: THREE.Group;
    alienCoreMesh: THREE.Mesh;
    alienRingMesh: THREE.Mesh;
    mineGroup: THREE.Group;

    badgeCanvas: HTMLCanvasElement;
    badgeTex: THREE.CanvasTexture;
    badgeSprite: THREE.Sprite;
    badgeMat: THREE.SpriteMaterial;
    lastBadgeSignature: string;

    boxType: 'normal' | 'orange' | 'alien';
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

interface DistantSupernova3D {
    group: THREE.Group;
    coreSprite: THREE.Sprite;
    shockRing: THREE.Mesh;
    shockMat: THREE.MeshBasicMaterial;
    rayGroup: THREE.Group;
    rayMat: THREE.MeshBasicMaterial;
    age: number;
    cycleDuration: number;
    baseX: number;
    baseY: number;
    baseZ: number;
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

    // 3D Open Cosmic Void Pools (Floating Cards, Photorealistic Planets, Supernovas, Shooting Stars, Nebulas, Cosmic Dust)
    private rowSlots: FloatingMultiplierCard3D[][] = [];
    private planets: Planet3D[] = [];
    private distantSupernovas: DistantSupernova3D[] = [];
    private shootingStars: ShootingStar3D[] = [];
    private asteroids: Asteroid3D[] = [];
    private nebulaClouds: NebulaCloud3D[] = [];

    // 3D Alien UFO Abduction System
    private alienUfoGroup!: THREE.Group;
    private alienTractorBeam!: THREE.Mesh;
    public isAbductionActive = false;

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
        this.buildDistantSupernovas();
        this.buildShootingStars();
        this.buildAsteroidField();
        this.buildFloatingMultiplierCardsPool();
        this.buildTrajectoryPredictor();
        this.buildAlienUfoSaucer();

        // Build 3D AAA [SPACE-OVERDRIVE V4] Starfighter (Floats freely in the open cosmic void)
        this.ship = new Spaceship3D(this.scene, this.textures);
        this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);

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
        this.webglRenderer.shadowMap.enabled = true;
        this.webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

        this.dirLight = new THREE.DirectionalLight(0xf8fafc, 2.25);
        this.dirLight.position.set(14, 28, 16);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 2;
        this.dirLight.shadow.camera.far = 110;
        const d = 30;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.dirLight.shadow.bias = -0.0005;
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

                    // Tilted Galactic Plane Coordinate
                    float galPlane = dot(d, normalize(vec3(0.42, 0.78, 0.46)));
                    float bandMask = exp(-galPlane * galPlane * 7.5);

                    // Domain-warped cosmic gas & dark dust rifts
                    vec3 q = vec3(
                        fbm3(d * 3.2 + vec3(0.0, uTime * 0.004, 0.0)),
                        fbm3(d * 3.2 + vec3(5.2, 1.3, 2.8)),
                        fbm3(d * 3.2 + vec3(2.1, 7.4, 9.1))
                    );
                    float nebulaGas = fbm3(d * 4.5 + q * 1.8);
                    float darkRift = fbm3(d * 6.8 - q * 2.1);

                    // Dark absorption dust lanes cutting across the Milky Way band
                    float dustOcclusion = smoothstep(0.46, 0.72, darkRift) * 0.85;

                    // Realistic Galactic Core (warm gold-ivory) + Ionized H-II / O-III Filaments (teal/crimson/violet)
                    vec3 deepVoid = vec3(0.008, 0.014, 0.032);
                    vec3 galCoreCol = vec3(0.78, 0.68, 0.55) * bandMask * pow(nebulaGas, 1.5) * 0.52;
                    vec3 ionizedCyan = mix(vec3(0.06, 0.45, 0.68), uSectorTint, 0.35) * smoothstep(0.45, 0.82, nebulaGas) * 0.28;
                    vec3 hAlphaRose = vec3(0.62, 0.16, 0.38) * smoothstep(0.52, 0.88, q.x * nebulaGas) * bandMask * 0.32;

                    vec3 skyCol = deepVoid + (galCoreCol + ionizedCyan + hAlphaRose) * (1.0 - dustOcclusion);

                    // Sub-pixel background starfield glittering in the sky dome
                    float starCell = hash31(floor(d * 420.0));
                    float starSpark = smoothstep(0.9965, 1.0, starCell);
                    skyCol += vec3(0.88, 0.94, 1.0) * starSpark * (0.4 + 0.6 * bandMask);

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
     * Builds the Vast, Open Cosmic Void:
     * 1. 1,800-Particle 3D Deep-Space Starfield surrounding the 360° void
     * 2. 36 Photorealistic JWST/Hubble Domain-Warped Nebula Clouds (`cartoonCloudTex`, `nebulaPillarTex`, `nebulaVeilTex`)
     * 3. 900-Particle Dynamic Nebula Flow Stream (particles flowing along sinuous cosmic currents)
     * 4. 1,600 Camera-Reactive Cosmic Dust Motes (reacting to camera velocity & parallax)
     */
    private buildDeepSpaceCosmicVoid() {
        // 1. 1,800-Particle 360° Deep-Space Starfield System
        this.starfieldGeo = new THREE.BufferGeometry();
        this.starfieldPositions = new Float32Array(STAR_PARTICLE_COUNT * 3);
        const starColors = new Float32Array(STAR_PARTICLE_COUNT * 3);

        for (let i = 0; i < STAR_PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 14 + Math.random() * 92;
            this.starfieldPositions[i * 3] = Math.cos(angle) * radius;
            this.starfieldPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.75;
            this.starfieldPositions[i * 3 + 2] = -Math.random() * 270;

            const c = new THREE.Color(
                i % 3 === 0 ? 0x7dd3fc : i % 5 === 0 ? 0xfde047 : i % 7 === 0 ? 0xc084fc : 0xffffff
            );
            starColors[i * 3] = c.r;
            starColors[i * 3 + 1] = c.g;
            starColors[i * 3 + 2] = c.b;
        }

        this.starfieldGeo.setAttribute('position', new THREE.BufferAttribute(this.starfieldPositions, 3));
        this.starfieldGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.65,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const starPoints = new THREE.Points(this.starfieldGeo, starMat);
        starPoints.frustumCulled = false;
        this.scene.add(starPoints);

        // 2. 36 Photorealistic Volumetric Deep-Space Nebula Filaments
        const nebulaTexPool = [
            this.textures.cartoonCloudTex,
            this.textures.nebulaPillarTex,
            this.textures.nebulaVeilTex
        ];
        const baseHues = [0.54, 0.11, 0.88, 0.58, 0.76, 0.48];
        for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
            const baseHue = baseHues[i % baseHues.length];
            const initCol = new THREE.Color().setHSL(baseHue, 0.68, 0.72);
            const nebulaMat = new THREE.SpriteMaterial({
                map: nebulaTexPool[i % nebulaTexPool.length],
                color: initCol,
                transparent: true,
                opacity: 0.46,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                rotation: (i * 1.1) % (Math.PI * 2)
            });
            const sprite = new THREE.Sprite(nebulaMat);
            const side = i % 2 === 0 ? -1 : 1;
            const baseX =
                i % 5 === 0
                    ? (Math.random() - 0.5) * 48
                    : side * (16 + Math.random() * 38);
            const baseY = i % 5 === 0 ? -16 - Math.random() * 14 : -12 + Math.random() * 34;
            const offsetZ = -Math.random() * 250;
            sprite.position.set(baseX, baseY, offsetZ);
            const scale = 24 + Math.random() * 28;
            sprite.scale.set(scale, scale * 0.82, 1);
            this.scene.add(sprite);

            this.nebulaClouds.push({
                sprite,
                mat: nebulaMat,
                baseX,
                baseY,
                offsetZ,
                driftSpeedZ: 8 + Math.random() * 12,
                baseHue
            });
        }

        // 3. 900-Particle Dynamic Nebula Flow Stream (shifting colors & sinuous particle currents)
        this.nebulaFlowGeo = new THREE.BufferGeometry();
        this.nebulaFlowPositions = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT * 3);
        this.nebulaFlowColors = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT * 3);
        this.nebulaFlowPhases = new Float32Array(NEBULA_FLOW_PARTICLE_COUNT);

        for (let i = 0; i < NEBULA_FLOW_PARTICLE_COUNT; i++) {
            const streamSide = i % 2 === 0 ? -1 : 1;
            const x = streamSide * (14 + Math.random() * 32);
            const y = -10 + Math.random() * 28;
            const z = -Math.random() * 240;
            this.nebulaFlowPositions[i * 3] = x;
            this.nebulaFlowPositions[i * 3 + 1] = y;
            this.nebulaFlowPositions[i * 3 + 2] = z;
            this.nebulaFlowPhases[i] = Math.random() * Math.PI * 2;

            const c = new THREE.Color().setHSL(0.52 + (i % 10) * 0.035, 0.9, 0.6);
            this.nebulaFlowColors[i * 3] = c.r;
            this.nebulaFlowColors[i * 3 + 1] = c.g;
            this.nebulaFlowColors[i * 3 + 2] = c.b;
        }

        this.nebulaFlowGeo.setAttribute('position', new THREE.BufferAttribute(this.nebulaFlowPositions, 3));
        this.nebulaFlowGeo.setAttribute('color', new THREE.BufferAttribute(this.nebulaFlowColors, 3));

        const nebulaFlowMat = new THREE.PointsMaterial({
            size: 1.35,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.48,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const nebulaFlowPoints = new THREE.Points(this.nebulaFlowGeo, nebulaFlowMat);
        nebulaFlowPoints.frustumCulled = false;
        this.scene.add(nebulaFlowPoints);

        // 4. 1,600 Camera-Reactive Cosmic Dust Motes
        this.cosmicDustGeo = new THREE.BufferGeometry();
        this.cosmicDustPositions = new Float32Array(COSMIC_DUST_PARTICLE_COUNT * 3);
        const dustColors = new Float32Array(COSMIC_DUST_PARTICLE_COUNT * 3);

        for (let i = 0; i < COSMIC_DUST_PARTICLE_COUNT; i++) {
            this.cosmicDustPositions[i * 3] = (Math.random() - 0.5) * 44;
            this.cosmicDustPositions[i * 3 + 1] = (Math.random() - 0.5) * 28 + 2;
            this.cosmicDustPositions[i * 3 + 2] = 15 - Math.random() * 145;

            const c = new THREE.Color(i % 3 === 0 ? 0xe0f2fe : i % 3 === 1 ? 0x38bdf8 : 0xfef08a);
            dustColors[i * 3] = c.r;
            dustColors[i * 3 + 1] = c.g;
            dustColors[i * 3 + 2] = c.b;
        }

        this.cosmicDustGeo.setAttribute('position', new THREE.BufferAttribute(this.cosmicDustPositions, 3));
        this.cosmicDustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

        const cosmicDustMat = new THREE.PointsMaterial({
            size: 0.28,
            map: this.textures.particleGlow,
            vertexColors: true,
            transparent: true,
            opacity: 0.58,
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
                void main() {
                    vUv = uv;
                    vObjPos = position;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
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

                    // 3. Day-Side Diffuse + Specular Ocean/Ice Solar Highlight
                    float diffuse = smoothstep(-0.08, 0.85, ndotl);
                    vec3 H = normalize(uSunDir + V);
                    float oceanMask = smoothstep(0.32, 0.65, dayAlbedo.b - dayAlbedo.r * 0.6);
                    float spec = pow(max(0.0, dot(N, H)), 38.0) * oceanMask * diffuse * 0.78;

                    // Apply cloud shadows onto the surface below, then composite sunlit clouds on top
                    vec3 shadowedSurface = dayAlbedo * (1.0 - cloudShadow);
                    vec3 litSurface = shadowedSurface * (0.04 + diffuse * 1.18) + vec3(1.0, 0.96, 0.88) * spec;

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

                    gl_FragColor = vec4(dayComposite + nightCityGlow + atmoRim, 1.0);
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
                void main() {
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vNormal = normalize(mat3(modelMatrix) * normal);
                    vViewDir = normalize(cameraPosition - worldPos.xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uAtmoColor;
                uniform vec3 uSunDir;
                varying vec3 vNormal;
                varying vec3 vViewDir;
                void main() {
                    vec3 N = normalize(vNormal);
                    vec3 V = normalize(vViewDir);
                    float rim = pow(clamp(1.0 + dot(N, V), 0.0, 1.0), 2.5);
                    float sunSide = 0.3 + 0.7 * smoothstep(-0.4, 0.8, dot(-N, uSunDir));
                    gl_FragColor = vec4(uAtmoColor * rim * sunSide * 1.35, rim * 0.72);
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
                tex: this.textures.planetGasGiantTex,
                hasRing: true,
                radius: 14.0,
                baseX: -43,
                baseY: 16,
                startZ: -82,
                atmoColor: 0x38bdf8,
                cloudOpacity: 0.32
            },
            {
                tex: this.textures.planetIceWorldTex,
                hasRing: true,
                radius: 10.6,
                baseX: 39,
                baseY: 11,
                startZ: -142,
                atmoColor: 0x00f0ff,
                cloudOpacity: 0.68
            },
            {
                tex: this.textures.planetLavaWorldTex,
                hasRing: false,
                radius: 8.6,
                baseX: -32,
                baseY: -13,
                startZ: -195,
                atmoColor: 0xf97316,
                cloudOpacity: 0.22
            },
            {
                tex: this.textures.planetGasGiantTex,
                hasRing: true,
                radius: 15.5,
                baseX: 46,
                baseY: -9,
                startZ: -252,
                atmoColor: 0xa855f7,
                cloudOpacity: 0.38
            },
            {
                tex: this.textures.planetIceWorldTex,
                hasRing: false,
                radius: 8.2,
                baseX: -29,
                baseY: 22,
                startZ: -44,
                atmoColor: 0x38bdf8,
                cloudOpacity: 0.72
            },
            {
                tex: this.textures.planetLavaWorldTex,
                hasRing: true,
                radius: 11.6,
                baseX: 36,
                baseY: 20,
                startZ: -298,
                atmoColor: 0xf59e0b,
                cloudOpacity: 0.25
            }
        ];

        const dummy = new THREE.Object3D();

        for (let i = 0; i < PLANET_COUNT; i++) {
            const cfg = planetConfigs[i];
            const group = new THREE.Group();

            // 1. Planet Sphere with Photorealistic Day Albedo + Cloud Deck + Terminator + Night City Lights
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
            group.add(sphereMesh);

            // 2. Volumetric Atmospheric Scattering Outer Shell
            const atmoMat = this.createAtmosphereScatteringMaterial(cfg.atmoColor);
            const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
            atmoMesh.scale.setScalar(cfg.radius);
            group.add(atmoMesh);

            // 3. Planetary Ring System Composed of 360 Individual 3D Asteroids + High-Density Ringlet Disc
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
                driftSpeedZ: 7.5 + (i % 3) * 2.5,
                baseX: cfg.baseX,
                baseY: cfg.baseY
            });
        }
    }

    /**
     * Builds 4 Distant Supernovas in Deep Space that periodically flare up with
     * expanding shockwave shells and volumetric 3D God-ray light shafts!
     */
    private buildDistantSupernovas() {
        const ringGeo = new THREE.RingGeometry(0.8, 1.35, 36);
        const rayConeGeo = new THREE.ConeGeometry(0.65, 16.0, 12, 1, true);

        const coords = [
            { x: -52, y: 26, z: -165, col: 0xfde047 },
            { x: 54, y: 24, z: -230, col: 0x00f0ff },
            { x: -140, y: -45, z: -320, col: 0xa855f7 },
            { x: 48, y: 28, z: -290, col: 0xf97316 }
        ];

        for (let i = 0; i < DISTANT_SUPERNOVA_COUNT; i++) {
            const cfg = coords[i];
            const group = new THREE.Group();
            group.position.set(cfg.x, cfg.y, cfg.z);

            const coreMat = new THREE.SpriteMaterial({
                map: this.textures.particleGlow,
                color: cfg.col,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const coreSprite = new THREE.Sprite(coreMat);
            coreSprite.scale.setScalar(14);
            group.add(coreSprite);

            const shockMat = new THREE.MeshBasicMaterial({
                color: cfg.col,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const shockRing = new THREE.Mesh(ringGeo, shockMat);
            group.add(shockRing);

            const rayGroup = new THREE.Group();
            const rayMat = new THREE.MeshBasicMaterial({
                color: cfg.col,
                transparent: true,
                opacity: 0.28,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            for (let r = 0; r < 6; r++) {
                const cone = new THREE.Mesh(rayConeGeo, rayMat);
                cone.rotation.z = (r * Math.PI) / 3;
                rayGroup.add(cone);
            }
            group.add(rayGroup);

            this.scene.add(group);
            this.distantSupernovas.push({
                group,
                coreSprite,
                shockRing,
                shockMat,
                rayGroup,
                rayMat,
                age: i * 1.8,
                cycleDuration: 6.5 + i * 1.2,
                baseX: cfg.x,
                baseY: cfg.y,
                baseZ: cfg.z
            });
        }
    }

    /**
     * Builds 18 Dynamic 3D Shooting Stars / Comets streaking across the deep-space background!
     */
    private buildShootingStars() {
        const tailGeo = new THREE.CylinderGeometry(0.0, 0.14, 10.5, 8);
        tailGeo.rotateX(Math.PI / 2);
        tailGeo.translate(0, 0, -5.25);

        for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
            const group = new THREE.Group();
            const isGold = i % 4 === 0;
            const tailMat = new THREE.MeshBasicMaterial({
                color: isGold ? 0xfde047 : 0x7dd3fc,
                transparent: true,
                opacity: 0.85,
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
            headSprite.scale.setScalar(1.35);
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
        const startX = (fromLeft ? -1 : 1) * (24 + Math.random() * 44);
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
     * Builds 36 Sculpted 3D Deep-Space Asteroids with Photorealistic Worley Cratered Regolith PBR Maps
     */
    private buildAsteroidField() {
        const baseAstGeo = new THREE.IcosahedronGeometry(1.6, 3);
        const posAttr = baseAstGeo.attributes.position as THREE.BufferAttribute;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < posAttr.count; i++) {
            vertex.fromBufferAttribute(posAttr, i);
            const n1 = Math.sin(vertex.x * 2.4 + vertex.y * 1.9) * Math.cos(vertex.z * 2.2);
            const n2 = Math.sin(vertex.x * 5.3 - vertex.z * 4.7) * 0.08;
            const disp = 1.0 + 0.24 * n1 + n2;
            vertex.multiplyScalar(disp);
            posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        baseAstGeo.computeVertexNormals();

        const asteroidMat = new THREE.MeshStandardMaterial({
            map: this.textures.asteroidColor,
            bumpMap: this.textures.asteroidBump,
            bumpScale: 0.22,
            roughnessMap: this.textures.asteroidRoughness,
            roughness: 0.78,
            metalness: 0.28
        });

        for (let i = 0; i < ASTEROID_COUNT; i++) {
            const mesh = new THREE.Mesh(baseAstGeo, asteroidMat);
            const side = i % 2 === 0 ? -1 : 1;
            const baseX = side * (15.5 + Math.random() * 24.0);
            const baseY = -8.0 + Math.random() * 26.0;
            const z = -Math.random() * 220;

            mesh.position.set(baseX, baseY, z);
            const scale = 0.65 + Math.random() * 1.95;
            mesh.scale.set(
                scale * (0.8 + Math.random() * 0.4),
                scale * (0.7 + Math.random() * 0.5),
                scale * (0.8 + Math.random() * 0.4)
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.scene.add(mesh);

            this.asteroids.push({
                mesh,
                rotSpeedX: (Math.random() - 0.5) * 1.8,
                rotSpeedY: (Math.random() - 0.5) * 1.8,
                rotSpeedZ: (Math.random() - 0.5) * 1.8,
                driftSpeedZ: 14 + Math.random() * 20,
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
        const hitboxGeo = new THREE.BoxGeometry(4.24, 3.95, 2.95);
        const hitboxMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        });

        // 3D Cardboard Mystery Box Geometries
        const boxBodyGeo = new THREE.BoxGeometry(2.1, 1.8, 1.8);
        const flapGeo = new THREE.BoxGeometry(1.06, 0.06, 1.82);

        // 3D Mini Sun Geometries
        const sunCoreGeo = new THREE.SphereGeometry(0.52, 16, 14);

        // Classic ACME Cartoon Naval Bomb Geometries
        const bombSphereGeo = new THREE.SphereGeometry(0.68, 24, 20);
        const bombBandGeo = new THREE.CylinderGeometry(0.69, 0.69, 0.22, 24, 1, true);
        const bombNeckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.22, 16);
        const bombWickGeo = new THREE.TorusGeometry(0.18, 0.045, 8, 16, Math.PI * 0.95);
        const bombSparkGeo = new THREE.OctahedronGeometry(0.09, 0);

        // Materials for the 3 types of mystery boxes
        const boxMatNormal = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardBoxTex,
            roughness: 0.88,
            metalness: 0.05
        });

        const boxMatOrange = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardOrangeBoxTex,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.38,
            roughness: 0.75,
            metalness: 0.08
        });

        const boxMatAlien = new THREE.MeshStandardMaterial({
            map: this.textures.cardboardAlienBoxTex,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.42,
            roughness: 0.75,
            metalness: 0.08
        });

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

        // Shared Geometries & Materials for Alien Core (Underneath Alien Box - NO ground circle)
        const alienCoreGeo = new THREE.OctahedronGeometry(0.5, 0);
        const alienRingGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 24);

        const alienCoreMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0xa855f7,
            emissiveIntensity: 0.75,
            roughness: 0.15,
            metalness: 0.85
        });
        const alienRingMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        for (let s = 0; s < VISIBLE_ROW_SLOTS; s++) {
            const slotRow: FloatingMultiplierCard3D[] = [];
            for (let lane = 0; lane < LANE_COUNT; lane++) {
                const group = new THREE.Group();
                const visualGroup = new THREE.Group();
                group.add(visualGroup);

                // 1. Stationary Oversized Invisible Hitbox (Fixes Edge Hover Flicker 100%!)
                const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);
                hitboxMesh.position.set(0, 1.35, 0);
                hitboxMesh.userData = { isVaultPlatform: true, slotIndex: s, lane };
                group.add(hitboxMesh);
                this.interactiveHitboxMeshes.push(hitboxMesh);

                // 2. 3D Cardboard Mystery Box Structure
                const mysteryBoxGroup = new THREE.Group();
                const boxBody = new THREE.Mesh(boxBodyGeo, boxMatNormal);
                boxBody.position.set(0, 0.95, 0);
                const boxBodyOutline = this.createOutline(boxBodyGeo, 0.08, boxBody.position);
                mysteryBoxGroup.add(boxBody, boxBodyOutline);

                // Upper Dual Flaps (Hinged to swing open upwards)
                const lidLeft = new THREE.Group();
                lidLeft.position.set(-1.05, 1.85, 0);
                const lidFlapL = new THREE.Mesh(flapGeo, boxMatNormal);
                lidFlapL.position.set(0.53, 0, 0);
                const lidOutlineL = this.createOutline(flapGeo, 0.06, lidFlapL.position);
                lidLeft.add(lidFlapL, lidOutlineL);

                const lidRight = new THREE.Group();
                lidRight.position.set(1.05, 1.85, 0);
                const lidFlapR = new THREE.Mesh(flapGeo, boxMatNormal);
                lidFlapR.position.set(-0.53, 0, 0);
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

                // 4. Mini Sun (Revealed underneath Orange Box)
                const miniSunGroup = new THREE.Group();
                miniSunGroup.position.set(0, 0.95, 0);

                const miniSunMat = new THREE.MeshBasicMaterial({ color: 0xfff08a });
                const miniSunCore = new THREE.Mesh(sunCoreGeo, miniSunMat);
                const sunCoronaMat = new THREE.SpriteMaterial({
                    map: this.textures.miniSunTex,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.9
                });
                const miniSunCorona = new THREE.Sprite(sunCoronaMat);
                miniSunCorona.scale.set(2.4, 2.4, 1.0);
                miniSunGroup.add(miniSunCore, miniSunCorona, this.createOutline(sunCoreGeo, 0.07));
                miniSunGroup.visible = false;
                visualGroup.add(miniSunGroup);

                // 5. Alien Cosmic Portal / Core (Revealed underneath Alien Box - clean, NO floor circle)
                const alienPortalGroup = new THREE.Group();
                alienPortalGroup.position.set(0, 0.95, 0);

                const alienCoreMesh = new THREE.Mesh(alienCoreGeo, alienCoreMat);
                const alienCoreOutline = this.createOutline(alienCoreGeo, 0.07);

                const alienRingMesh = new THREE.Mesh(alienRingGeo, alienRingMat);
                alienRingMesh.rotation.x = Math.PI * 0.25;

                const alienGlowMat = new THREE.SpriteMaterial({
                    map: this.textures.particleGlow,
                    color: 0xa855f7,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.75
                });
                const alienGlowSprite = new THREE.Sprite(alienGlowMat);
                alienGlowSprite.scale.set(2.4, 2.4, 1.0);

                alienPortalGroup.add(alienCoreMesh, alienCoreOutline, alienRingMesh, alienGlowSprite);
                alienPortalGroup.visible = false;
                visualGroup.add(alienPortalGroup);

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
                    diffuseHazeSprite,
                    diffuseHazeMat,
                    miniSunGroup,
                    miniSunCore,
                    miniSunCorona,
                    alienPortalGroup,
                    alienCoreMesh,
                    alienRingMesh,
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
     * Builds the 3D Looney Tunes Styled Alien UFO Saucer with Tractor Beam
     */
    private buildAlienUfoSaucer() {
        this.alienUfoGroup = new THREE.Group();
        this.alienUfoGroup.visible = false;
        this.scene.add(this.alienUfoGroup);

        const saucerBodyGeo = new THREE.CylinderGeometry(1.4, 2.5, 0.44, 24);
        const saucerMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.22,
            metalness: 0.88
        });
        const saucerMesh = new THREE.Mesh(saucerBodyGeo, saucerMat);
        this.alienUfoGroup.add(saucerMesh, this.createOutline(saucerBodyGeo, 0.08));

        // Glass Cockpit Dome with Cel-Shaded Cyan Tint
        const domeGeo = new THREE.SphereGeometry(0.88, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const domeMat = new THREE.MeshPhysicalMaterial({
            color: 0x00f0ff,
            roughness: 0.05,
            metalness: 0.3,
            transmission: 0.85,
            transparent: true,
            opacity: 0.88
        });
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.position.y = 0.22;
        this.alienUfoGroup.add(domeMesh, this.createOutline(domeGeo, 0.07, domeMesh.position));

        // Perimeter glowing alien lights
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const lightGeo = new THREE.SphereGeometry(0.12, 12, 8);
            const lightColor = i % 2 === 0 ? 0x00f0ff : 0xa855f7;
            const lightMat = new THREE.MeshBasicMaterial({ color: lightColor });
            const lightMesh = new THREE.Mesh(lightGeo, lightMat);
            lightMesh.position.set(Math.cos(angle) * 2.3, 0, Math.sin(angle) * 2.3);
            this.alienUfoGroup.add(lightMesh);
        }

        // Abduction Tractor Beam Cone
        const beamGeo = new THREE.CylinderGeometry(0.35, 2.6, 9.5, 20, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.alienTractorBeam = new THREE.Mesh(beamGeo, beamMat);
        this.alienTractorBeam.position.y = -4.75;
        this.alienUfoGroup.add(this.alienTractorBeam);
    }

    /**
     * Executes the Cinematic 3D Alien UFO Abduction Sequence:
     * 1. Alien box & core vanish immediately upon impact with cosmic particle burst.
     * 2. In that exact instant, Alien UFO swoops down and activates tractor beam.
     * 3. Abducts ship upwards into the beam.
     * 4. Cosmic warp flash transports player forward to the destination row.
     * 5. Drops player on a completely clean row so visuals are pristine and next targets are clear!
     */
    public triggerAlienAbductionSequence(worldX: number, worldZ: number, _rowsSkipped: number) {
        this.isAbductionActive = true;
        this.alienUfoGroup.visible = true;
        this.alienUfoGroup.position.set(worldX, 18, worldZ);
        this.alienTractorBeam.scale.set(0.1, 1, 0.1);

        const targetRow = this.gameState.engine.currentRow;
        const targetZ = PixiRenderer.rowToWorldZ(targetRow);

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

        // 2. Explode with vibrant purple cosmic particles of the alien box's color
        this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'alien');
        this.vfx.spawnGpuParticleCloud(
            worldX,
            1.0,
            worldZ,
            160,
            [0xa855f7, 0xc084fc, 0x00f0ff, 0x8b5cf6, 0xffffff],
            12,
            28,
            0.65
        );

        gsap.killTweensOf(this.alienUfoGroup.position);
        gsap.killTweensOf(this.alienTractorBeam.scale);
        gsap.killTweensOf(this.ship.pos);

        // 3. UFO swoops down rapidly from deep space
        gsap.to(this.alienUfoGroup.position, {
            y: 8.0,
            duration: 0.22,
            ease: 'back.out(1.5)',
            onComplete: () => {
                // Tractor beam activates and expands
                gsap.to(this.alienTractorBeam.scale, {
                    x: 1.0,
                    z: 1.0,
                    duration: 0.14,
                    ease: 'power2.out'
                });

                // Ship lifts upward into the beam
                gsap.to(this.ship.pos, {
                    y: 4.8,
                    duration: 0.28,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        // Cosmic warp jump! UFO and ship streak forward to clean destination row!
                        this.vfx.spawnSafeBurst3D(worldX, 4.8, worldZ, true);
                        this.ship.pos.set(worldX, 4.8, targetZ);
                        this.alienUfoGroup.position.set(worldX, 8.0, targetZ);
                        this.ship.targetPos.set(worldX, SHIP_FLIGHT_Y, targetZ);

                        // Lower ship safely onto the clean track
                        gsap.to(this.ship.pos, {
                            y: SHIP_FLIGHT_Y,
                            duration: 0.26,
                            ease: 'back.out(1.2)',
                            onComplete: () => {
                                // UFO ascends and vanishes into hyperspace
                                gsap.to(this.alienUfoGroup.position, {
                                    y: 30,
                                    duration: 0.35,
                                    ease: 'power2.in',
                                    onComplete: () => {
                                        this.alienUfoGroup.visible = false;
                                        this.isAbductionActive = false;
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
     * Tracks cursor and touch movement across the entire viewport so the Starfighter
     * dynamically pitches, yaws, and banks toward the user's cursor in real time!
     */
    private bindGlobalCursorTracking() {
        const updateFromCoords = (clientX: number, clientY: number) => {
            const rect = this.canvas.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const normX = ((clientX - rect.left) / rect.width - 0.5) * 2;
            const normY = ((clientY - rect.top) / rect.height - 0.5) * 2;
            this.mouseParallax.set(
                THREE.MathUtils.clamp(normX, -1, 1),
                THREE.MathUtils.clamp(normY, -1, 1)
            );
            this.ship.setCursorAim(this.mouseParallax.x, this.mouseParallax.y);
        };

        window.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') {
                this.mouseParallax.set(0, 0);
                this.ship.setCursorAim(0, 0);
                return;
            }
            updateFromCoords(e.clientX, e.clientY);
        });
    }

    private bindGameEvents() {
        const engine = this.gameState.engine;

        engine.onStateChange((state) => {
            if (state === GameState.PLAYING && engine.currentRow === 1 && engine.currentPicks.length === 0) {
                this.ship.snapTo(0, SHIP_FLIGHT_Y, 0);
                this.vfx.clearGraffitiTags();
            } else if (state === GameState.IDLE) {
                this.vfx.clearGraffitiTags();
                this.ship.vel.set(0, 0, 0);
                this.camVel.set(0, 0, 0);
                if (this.ship.pos.z < -14) {
                    this.ship.pos.set(0, SHIP_FLIGHT_Y, -12);
                    this.camPos.set(0, 8.65, -0.8);
                }
                this.ship.setTargetPosition(0, SHIP_FLIGHT_Y, 0);
            }
        });

        this.gameState.onHitStopStart((row, lane) => {
            const worldX = PixiRenderer.laneToWorldX(lane);
            const worldZ = PixiRenderer.rowToWorldZ(row);
            const specials = engine.getSpecialsForRow(row);

            if (lane === specials.alienLane) {
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

            // Immediately destroy the entire cell and clear all residual elements!
            const hitCard = this.rowSlots
                .flat()
                .find(
                    (c) =>
                        Math.abs(c.group.position.z - worldZ) < 1.2 &&
                        Math.abs(c.group.position.x - worldX) < 1.2
                );
            if (hitCard) {
                hitCard.mysteryBoxGroup.visible = false;
                hitCard.miniSunGroup.visible = false;
                hitCard.alienPortalGroup.visible = false;
                hitCard.diffuseHazeSprite.visible = false;
                hitCard.badgeSprite.visible = false;
                hitCard.boxLiftY = 0;
            }

            if (pick.isSafe) {
                if (pick.specialType === 'NONE') {
                    // 1. Traditional Cardboard Box: explodes into chunky cardboard pieces & brown/tan fibers!
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'normal');
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.0,
                        worldZ,
                        70,
                        [0x8b5a2b, 0x5c3a1e, 0xb47b46, 0xc58b54, 0x3d2314],
                        8,
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
                    this.vfx.spawnSafeBurst3D(worldX, 0.3, worldZ, false);
                    this.ship.setTargetPosition(worldX, SHIP_FLIGHT_Y, worldZ);
                } else if (pick.specialType === 'GOLDEN') {
                    // 2. Solar/Orange Box: destroys entire cell cleanly, exploding with amber/golden particles!
                    this.vfx.spawnVolumetricCardboardShatter3D(worldX, 0.95, worldZ, 'orange');
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        1.0,
                        worldZ,
                        160,
                        [0xf59e0b, 0xfbbf24, 0xfde047, 0xea580c, 0xffffff],
                        12,
                        26,
                        0.65
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
                }

                // Cinematic Near-Miss Tension: check if an adjacent lane held a deadly mine
                const rowHazards = engine.getHazardsForActionRow(pick.row);
                const isNearMiss = rowHazards.some((h) => Math.abs(h - pick.lane) === 1);
                if (isNearMiss && pick.specialType !== 'ALIEN') {
                    this.vfx.triggerScreenShake(0.32, 0.22);
                    this.vfx.spawnGpuParticleCloud(
                        worldX,
                        0.8,
                        worldZ,
                        140,
                        [0xfde047, 0xf59e0b, 0xffffff],
                        6,
                        18,
                        0.45
                    );
                }
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

        this.mouseParallax.x = THREE.MathUtils.clamp(ndcX, -1, 1);
        this.mouseParallax.y = THREE.MathUtils.clamp(-ndcY, -1, 1);
        this.ship.setCursorAim(this.mouseParallax.x, this.mouseParallax.y);

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

        const cursorDelta = Math.hypot(ndcX - this.lastHoverNdc.x, ndcY - this.lastHoverNdc.y);
        if (
            this.hoveredLane !== null &&
            this.hoveredRow === currentRow &&
            (now - this.lastValidHoverTime < HOVER_DEBOUNCE_MS || cursorDelta < 0.048)
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
        this.mouseParallax.set(0, 0);
        this.ship.setCursorAim(0, 0);
        this.canvas.style.cursor = 'default';
    }

    private startRenderLoop() {
        const animate = (now: number) => {
            const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
            this.lastFrameTime = now;
            this.elapsed += dt;

            this.updateScene3D(dt);
            this.vfx.composer.render();

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
        this.ship.setTargetPosition(targetShipX, SHIP_FLIGHT_Y, targetShipZ);

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
        this.ship.update(dt, theme.primaryHex, isHitStop, hitStopX, hoverX, false, isCrashed, currentMult, isCashedOut);
        this.updateOrbitalTacticalCamera(dt, isHitStop, hitStopX, hoverX);

        this.dirLight.position.set(this.ship.pos.x + 14, 28, this.ship.pos.z + 16);
        this.dirLight.target.position.set(this.ship.pos.x, 0, this.ship.pos.z - 12);

        this.updateFloatingMultiplierCards(dt, theme.primaryHex);
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
     * Strictly Locked "Orbital Tactical" Camera View:
     * Elevated tactical orbital perspective behind the ship with 300ms Hit-Stop zoom & speed-burst FOV kick!
     */
    private updateOrbitalTacticalCamera(
        dt: number,
        isHitStop: boolean,
        hitStopX: number | null,
        hoverX: number | null
    ) {
        const aspect = this.width / Math.max(1, this.height);
        const isPortrait916 = aspect < 1.0;
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
        const hoverPanScale = isPortrait916 ? 0.05 : 0.15;
        const parallaxXScale = isPortrait916 ? 0.12 : 0.55;

        const targetCamX =
            this.ship.pos.x * panScale +
            (hoverX !== null ? (hoverX - this.ship.pos.x) * hoverPanScale : 0) +
            this.mouseParallax.x * parallaxXScale;
        const targetCamY = this.ship.pos.y + offsetY - this.mouseParallax.y * 0.35;
        const targetCamZ = this.ship.pos.z + offsetZ;

        const camStiff = 82;
        const camDamp = 14.0;
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
                : hoverX !== null
                  ? THREE.MathUtils.lerp(this.ship.pos.x, hoverX, isPortrait916 ? 0.10 : 0.25)
                  : this.ship.pos.x * lookScale + this.mouseParallax.x * (isPortrait916 ? 0.15 : 0.8);

        const baseLookY = isPortrait916 ? 0.25 : 1.05;
        const desiredLook = this.scratchDesiredLook.set(
            focusLaneX,
            baseLookY - this.mouseParallax.y * (isPortrait916 ? 0.12 : 0.4),
            this.ship.pos.z + lookAheadZ
        );
        this.camLookAt.lerp(desiredLook, dt * 16);
        this.camera.lookAt(this.camLookAt);

        this.camera.rotation.z += -this.ship.roll * 0.2 + this.vfx.shakeRoll;
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
                    plat.miniSunGroup.visible = false;
                    plat.alienPortalGroup.visible = false;
                    plat.mineGroup.visible = false;
                    plat.diffuseHazeSprite.visible = false;
                    plat.badgeSprite.visible = false;
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
                let boxType: 'normal' | 'orange' | 'alien' = 'normal';
                if (lane === rowSpecials.alienLane) {
                    boxType = 'alien';
                } else if (lane === rowSpecials.goldenLane) {
                    boxType = 'orange';
                }
                plat.boxType = boxType;

                // Bind appropriate cartoon texture
                const activeMat =
                    boxType === 'orange'
                        ? plat.boxMatOrange
                        : boxType === 'alien'
                          ? plat.boxMatAlien
                          : plat.boxMatNormal;

                if (plat.boxBody.material !== activeMat) {
                    plat.boxBody.material = activeMat;
                    plat.lidFlapL.material = activeMat;
                    plat.lidFlapR.material = activeMat;
                }

                // Keep plat.group stationary at Y = 0 so hitboxMesh never oscillates on hover!
                plat.group.position.set(laneX, 0, rowZ);
                plat.group.scale.setScalar(this.cardLayoutScale);

                const targetHoverLift = isHitStopTarget
                    ? 0.45
                    : isHovered
                      ? 0.28
                      : Math.sin(this.elapsed * 3.2 + lane * 0.8 + rowNumber * 0.5) * 0.08;

                plat.visualGroup.position.y = THREE.MathUtils.lerp(
                    plat.visualGroup.position.y,
                    targetHoverLift,
                    Math.min(1, dt * 16)
                );

                const targetScale = isHitStopTarget ? 1.08 : isHovered ? 1.05 : 1.0;
                plat.visualGroup.scale.setScalar(
                    THREE.MathUtils.lerp(plat.visualGroup.scale.x, targetScale, Math.min(1, dt * 16))
                );

                // Upward Box Lift & Flap Opening Animation
                // Bonus boxes elevate sufficiently high (y ≈ 3.6 - 4.4) so the full contents
                // underneath are 100% visible without the box overlapping or occluding anything!
                let targetBoxLiftY = 0;
                let targetLidProgress = 0;

                if (boxType !== 'normal') {
                    if (isHitStopTarget) {
                        targetBoxLiftY = 4.4;
                        targetLidProgress = 1.0;
                    } else if (isHovered) {
                        targetBoxLiftY = 3.6;
                        targetLidProgress = 0.65;
                    }
                }

                plat.boxLiftY = THREE.MathUtils.lerp(
                    plat.boxLiftY,
                    targetBoxLiftY,
                    Math.min(1, dt * 12)
                );
                plat.mysteryBoxGroup.position.y = plat.boxLiftY;

                plat.lidOpenProgress = THREE.MathUtils.lerp(
                    plat.lidOpenProgress,
                    targetLidProgress,
                    Math.min(1, dt * 14)
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
                } else if (boxType === 'alien') {
                    plat.diffuseHazeSprite.visible = true;
                    plat.diffuseHazeMat.color.setHex(0x9333ea);
                    const pulse = 0.24 + 0.08 * Math.sin(this.elapsed * 3.2 + lane * 0.9 + 1.2);
                    plat.diffuseHazeMat.opacity = isHovered ? Math.min(0.45, pulse * 1.4) : pulse;
                } else {
                    plat.diffuseHazeSprite.visible = false;
                }

                // Underneath Content Reveal Logic:
                // Revealed only while the box is lifted up, before impact destroys the cell
                const rowHazards = engine.getHazardsForActionRow(rowNumber);
                const isHazard = rowHazards.includes(lane);
                const isExposed = plat.boxLiftY > 0.4 && (!pickForRow || !pickForRow.isSafe);

                plat.miniSunGroup.visible = false;
                plat.alienPortalGroup.visible = false;
                plat.mineGroup.visible = false;
                plat.badgeSprite.visible = false;

                if (isExposed) {
                    if (isHazard) {
                        plat.mineGroup.visible = true;
                        plat.mineGroup.position.y = 0.85;
                        plat.mineGroup.rotation.y = this.elapsed * 2.5;
                    } else if (boxType === 'orange') {
                        plat.miniSunGroup.visible = true;
                        plat.miniSunGroup.position.y = 1.05 + Math.sin(this.elapsed * 3.6 + lane) * 0.08;
                        plat.miniSunGroup.rotation.y = this.elapsed * 2.8;
                    } else if (boxType === 'alien') {
                        plat.alienPortalGroup.visible = true;
                        plat.alienPortalGroup.position.y = 1.0;
                        plat.alienPortalGroup.rotation.y = this.elapsed * 2.4;
                        plat.alienRingMesh.rotation.x = this.elapsed * 2.8;
                        plat.alienRingMesh.rotation.y = this.elapsed * 1.8;
                    }
                }

                // Evaluated Row Pick Resolution:
                // When an impact occurs, DESTROY THE ENTIRE CELL COMPLETELY:
                // No lingering box, no leftover sun, no residual clutter!
                if (pickForRow) {
                    const isPicked = pickForRow.lane === lane;
                    const isMine = pickForRow.hazards.includes(lane);

                    if (isPicked) {
                        if (pickForRow.isSafe) {
                            // SAFE IMPACT: Cell is completely destroyed, clean & empty!
                            plat.mysteryBoxGroup.visible = false;
                            plat.miniSunGroup.visible = false;
                            plat.alienPortalGroup.visible = false;
                            plat.mineGroup.visible = false;
                            plat.diffuseHazeSprite.visible = false;
                            plat.badgeSprite.visible = false;
                        } else {
                            // Fatal mine detonation
                            plat.mysteryBoxGroup.visible = false;
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
                        plat.mineGroup.visible = true;
                        plat.mineGroup.rotation.y = this.elapsed * 2.5;
                    } else {
                        // Unpicked safe lanes on already played rows stay clean or subtle
                        plat.mysteryBoxGroup.visible = true;
                    }
                } else {
                    // Current and future unpicked rows: ALL BOXES ARE 100% VISIBLE!
                    plat.mysteryBoxGroup.visible = true;
                }

                if (isCurrentRow) {
                    plat.badgeSprite.visible = true;
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

        // 1. Starfield Scrolling
        const starSpeed = (isBursting ? 115 : 34) * phaseFactor;
        for (let i = 0; i < STAR_PARTICLE_COUNT; i++) {
            let sz = this.starfieldPositions[i * 3 + 2];
            sz += dt * starSpeed;
            if (sz > camZ + 10) {
                sz -= 260;
            } else if (sz < camZ - 260) {
                sz += 260;
            }
            this.starfieldPositions[i * 3 + 2] = sz;
        }
        (this.starfieldGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // 2. Massive Photorealistic Planets Rotating (Cloud Deck Drift + Day/Night City Lights + Asteroid Ring Belts)
        for (const p of this.planets) {
            p.sphereMesh.rotation.y += p.rotSpeedY * dt;
            p.surfaceMat.uniforms['uTime'].value = this.elapsed;
            if (p.ringSystemGroup) {
                p.ringSystemGroup.rotation.y -= p.rotSpeedY * 0.45 * dt;
            }
            p.group.position.z += p.driftSpeedZ * speedMult * dt;

            if (p.group.position.z > camZ + 32) {
                p.group.position.z -= 320;
            } else if (p.group.position.z < camZ - 300) {
                p.group.position.z += 320;
            }
        }

        // 3. Distant Supernovas Pulsing & Expanding Shockwave Shells in Deep Space
        for (const sn of this.distantSupernovas) {
            sn.age = (sn.age + dt) % sn.cycleDuration;
            const phase = sn.age / sn.cycleDuration;
            const flash = Math.sin(phase * Math.PI);

            sn.coreSprite.scale.setScalar(10 + flash * 16);
            (sn.coreSprite.material as THREE.SpriteMaterial).opacity = 0.35 + flash * 0.65;

            const ringScale = 1.0 + phase * 18.0;
            sn.shockRing.scale.setScalar(ringScale);
            sn.shockMat.opacity = (1.0 - phase) * 0.78;

            sn.rayGroup.rotation.z += dt * 0.45;
            sn.rayMat.opacity = flash * 0.32;

            sn.group.position.z += 6.5 * speedMult * dt;
            if (sn.group.position.z > camZ + 25) {
                sn.group.position.z -= 295;
            } else if (sn.group.position.z < camZ - 295) {
                sn.group.position.z += 295;
            }
        }

        // 4. Shooting Stars / Comets Streaking Across the Void
        for (const s of this.shootingStars) {
            s.age += dt;
            if (s.age >= s.maxAge || s.group.position.z > camZ + 15) {
                this.respawnShootingStar(s, this.ship.pos.z);
                continue;
            }
            s.group.position.addScaledVector(s.vel, dt * (isBursting ? 1.5 : 1.0));
            const lifeNorm = s.age / s.maxAge;
            const fade = Math.sin(lifeNorm * Math.PI);
            s.tailMat.opacity = fade * 0.88;
            (s.headSprite.material as THREE.SpriteMaterial).opacity = fade;
        }

        // 5. Cratered Regolith Asteroids Tumbling & Scrolling
        for (const ast of this.asteroids) {
            ast.mesh.rotation.x += ast.rotSpeedX * dt;
            ast.mesh.rotation.y += ast.rotSpeedY * dt;
            ast.mesh.rotation.z += ast.rotSpeedZ * dt;
            ast.mesh.position.z += ast.driftSpeedZ * speedMult * dt;

            if (ast.mesh.position.z > camZ + 12) {
                ast.mesh.position.z -= 220;
            } else if (ast.mesh.position.z < camZ - 220) {
                ast.mesh.position.z += 220;
            }
        }

        // 6. Photorealistic Volumetric Nebulas with Shifting Colors & Dynamic Particle Flow Stream
        for (const c of this.nebulaClouds) {
            c.sprite.position.y = c.baseY + Math.sin(this.elapsed * 1.2 + c.offsetZ) * 1.2;
            c.sprite.position.x = c.baseX + Math.cos(this.elapsed * 0.65 + c.offsetZ) * 1.8;
            c.sprite.position.z += c.driftSpeedZ * speedMult * dt;

            const shiftedHue = (c.baseHue + this.elapsed * 0.018 + Math.sin(c.offsetZ) * 0.06) % 1.0;
            c.mat.color.setHSL(shiftedHue, 0.72, 0.72);

            if (c.sprite.position.z > camZ + 18) {
                c.sprite.position.z -= 245;
            } else if (c.sprite.position.z < camZ - 245) {
                c.sprite.position.z += 245;
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

            if (fz > camZ + 12) {
                fz -= 235;
            } else if (fz < camZ - 235) {
                fz += 235;
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

            if (dx > 24) dx -= 48;
            else if (dx < -24) dx += 48;

            if (dy > 18) dy -= 32;
            else if (dy < -14) dy += 32;

            if (dz > camZ + 6) {
                dz -= 140;
            } else if (dz < camZ - 140) {
                dz += 140;
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
