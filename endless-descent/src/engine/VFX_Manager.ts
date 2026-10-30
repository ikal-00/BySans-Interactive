import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import confetti from 'canvas-confetti';
import { createGraffitiMultiplierTexture } from './Textures3D';

const PLASMA_COLORS = [0x00f0ff, 0x38bdf8, 0xf59e0b, 0x10b981, 0xa855f7, 0xfde047];
const PLASMA_CSS = ['#38bdf8', '#00f0ff', '#f59e0b', '#10b981', '#a855f7'];
const GPU_BURST_PARTICLE_COUNT = 2200;
const GLASS_SHARD_INSTANCES = 420;

/**
 * Custom GLSL Next-Gen [SPACE-OVERDRIVE V4] Cinematic Post-Processing Shader:
 * - Subtle Anamorphic Barrel Lens Distortion (`uLensDistortion`)
 * - Screen-Space Ambient Occlusion / Cavity Micro-Contrast (`uAoStrength`)
 * - Peripheral Cinematic Depth-of-Field (DoF) Bokeh (`uDofStrength`) — keeps center 100% razor-sharp!
 * - Volumetric Crepuscular God Rays (`uGodRays`) on Mega Win "SUPERNOVA" & Hit-Stop Warp Locks
 * - Rear Thruster Heat Distortion Wave + 5-Tap Motion Blur + Harsh Chromatic Aberration Split on Crashes
 */
const SpaceOverdrivePostShader = {
    uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
        uRgbSplit: { value: 0.0014 },
        uWarpStrength: { value: 0.0 },
        uMotionBlur: { value: 0.0 },
        uHitStopFlash: { value: 0.0 },
        uSupernovaFlash: { value: 0.0 },
        uHeatDistortion: { value: 0.0022 },
        uLensDistortion: { value: 0.042 },
        uDofStrength: { value: 0.24 },
        uAoStrength: { value: 0.32 },
        uGodRays: { value: 0.0 },
        uTime: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uRgbSplit;
        uniform float uWarpStrength;
        uniform float uMotionBlur;
        uniform float uHitStopFlash;
        uniform float uSupernovaFlash;
        uniform float uHeatDistortion;
        uniform float uLensDistortion;
        uniform float uDofStrength;
        uniform float uAoStrength;
        uniform float uGodRays;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 centeredUv = vUv - center;
            float r2 = dot(centeredUv, centeredUv);
            float dist = sqrt(r2);

            // 1. Subtle Anamorphic Barrel Lens Distortion
            float barrel = 1.0 + r2 * (uLensDistortion + uWarpStrength * 0.28);
            vec2 lensUv = center + centeredUv * barrel;
            vec2 toCenter = center - lensUv;

            // 2. Rear Thruster Heat Distortion Wave (localized to compact rear nozzle wake)
            float thrusterMask = smoothstep(0.16, 0.0, length(lensUv - vec2(0.5, 0.23)));
            vec2 heatWave = vec2(
                sin(lensUv.y * 95.0 - uTime * 30.0),
                cos(lensUv.x * 75.0 - uTime * 25.0)
            ) * uHeatDistortion * thrusterMask;

            // 3. Radial Hyperspace Warp during 300ms Hit-Stop & Speed Bursts
            vec2 uv = clamp(lensUv + heatWave + toCenter * uWarpStrength * dist * 0.55, 0.002, 0.998);

            // 4. Chromatic Aberration Split + Conditional 5-Tap Radial Motion Blur
            float chromaMag = uRgbSplit * (0.25 + dist * 1.55);
            vec2 dir = normalize(toCenter + vec2(0.0001));
            vec2 texel = 1.0 / max(uResolution, vec2(320.0));

            vec3 col;
            if (uMotionBlur > 0.015) {
                float dofMask = smoothstep(0.34, 0.78, dist) * uDofStrength;
                vec3 accumCol = vec3(0.0);
                float totalWeight = 0.0;
                for (int i = 0; i < 5; i++) {
                    float fi = float(i) / 4.0 - 0.5;
                    vec2 blurOffset = toCenter * fi * uMotionBlur * dist * 0.34;
                    vec2 bokehOffset = vec2(cos(float(i) * 1.256), sin(float(i) * 1.256)) * texel * dofMask * 2.8;
                    vec2 sampleUv = clamp(uv + blurOffset + bokehOffset, 0.002, 0.998);

                    float r = texture2D(tDiffuse, clamp(sampleUv + dir * chromaMag, 0.002, 0.998)).r;
                    float g = texture2D(tDiffuse, sampleUv).g;
                    float b = texture2D(tDiffuse, clamp(sampleUv - dir * chromaMag, 0.002, 0.998)).b;

                    float w = 1.0 - abs(fi);
                    accumCol += vec3(r, g, b) * w;
                    totalWeight += w;
                }
                col = accumCol / totalWeight;
            } else {
                float r = texture2D(tDiffuse, clamp(uv + dir * chromaMag, 0.002, 0.998)).r;
                float g = texture2D(tDiffuse, uv).g;
                float b = texture2D(tDiffuse, clamp(uv - dir * chromaMag, 0.002, 0.998)).b;
                col = vec3(r, g, b);
            }

            // 5. Fast Screen-Space Cavity Contrast
            float lumaC = dot(col, vec3(0.299, 0.587, 0.114));
            float lumaH = dot(texture2D(tDiffuse, clamp(uv + vec2(texel.x * 2.0, texel.y * 2.0), 0.002, 0.998)).rgb, vec3(0.299, 0.587, 0.114));
            float cavity = clamp((lumaH - lumaC) * 2.8, 0.0, 1.0);
            col *= (1.0 - cavity * uAoStrength);

            // 6. Volumetric Crepuscular God Rays (Radial Light Shafts on Supernova & Hit-Stop)
            if (uGodRays > 0.01) {
                vec2 rayOrigin = vec2(0.5, 0.54);
                vec2 rayDelta = (uv - rayOrigin) * 0.11;
                vec2 marchUv = uv;
                vec3 godRayAccum = vec3(0.0);
                float decay = 1.0;
                for (int s = 0; s < 6; s++) {
                    marchUv -= rayDelta;
                    vec3 sCol = texture2D(tDiffuse, clamp(marchUv, 0.002, 0.998)).rgb;
                    float bright = smoothstep(0.52, 1.0, dot(sCol, vec3(0.333)));
                    godRayAccum += sCol * bright * decay;
                    decay *= 0.82;
                }
                float angle = atan(centeredUv.y, centeredUv.x);
                float rayBeam = 0.65 + 0.35 * sin(angle * 12.0 + uTime * 3.5);
                col += godRayAccum * uGodRays * rayBeam * 0.26;
            }

            // 7. Clean Cinematic Edge Vignette (preserves center gameplay clarity)
            float vig = smoothstep(0.95, 0.32, dist);
            col *= mix(0.72, 1.02, vig);

            // 8. 300ms Hit-Stop Quantum Capacitor Freeze Edge Pulse
            if (uHitStopFlash > 0.01) {
                float border = smoothstep(0.34, 0.58, dist);
                col += vec3(0.0, 0.85, 1.0) * border * uHitStopFlash * 0.38;
            }

            // 9. Mega Win "SUPERNOVA" Golden Light Flood, God-Ray Starburst & Anamorphic Lens Flare
            if (uSupernovaFlash > 0.01) {
                float radialGlow = exp(-dist * 2.6) * uSupernovaFlash;
                float anamorphicStreak = exp(-abs(vUv.y - 0.52) * 26.0) * exp(-abs(vUv.x - 0.5) * 2.0) * uSupernovaFlash;
                float angle = atan(centeredUv.y, centeredUv.x);
                float crepuscularShafts = pow(0.5 + 0.5 * cos(angle * 16.0 - uTime * 2.5), 3.0) * exp(-dist * 2.2) * uSupernovaFlash;
                vec3 goldLight = vec3(1.0, 0.86, 0.32) * (radialGlow * 0.85 + anamorphicStreak * 1.18 + crepuscularShafts * 0.65);
                col += goldLight;
            }

            gl_FragColor = vec4(col, 1.0);
        }
    `
};

interface VolumetricGlassShard {
    active: boolean;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Euler;
    rotVel: THREE.Vector3;
    scale: THREE.Vector3;
    baseScale: THREE.Vector3;
    age: number;
    maxAge: number;
    baseColor: THREE.Color;
}

interface DebrisShard3D {
    mesh: THREE.Mesh;
    mat: THREE.MeshStandardMaterial;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number;
    rz: number;
    age: number;
    maxAge: number;
}

interface GpuBurstParticle {
    vx: number;
    vy: number;
    vz: number;
    age: number;
    maxAge: number;
    color: THREE.Color;
}

interface ShockwaveRing3D {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    age: number;
    maxAge: number;
    maxScale: number;
}

interface MothershipStrike3D {
    group: THREE.Group;
    mothership: THREE.Group;
    coreRing: THREE.Mesh;
    beamMat: THREE.MeshBasicMaterial;
    age: number;
    maxAge: number;
}

export class VFXManager {
    private scene: THREE.Scene;
    public composer!: EffectComposer;
    public bloomPass!: UnrealBloomPass;
    public warpPass!: ShaderPass;

    // 3D Volumetric Glass-Shatter InstancedMesh System (420 Faceted Refractive PBR Glass Shards)
    private glassShardMesh!: THREE.InstancedMesh;
    private glassShards: VolumetricGlassShard[] = [];
    private glassShardCursor = 0;
    private glassDummy = new THREE.Object3D();
    private glassTempColor = new THREE.Color();
    private readonly glassWhiteColor = new THREE.Color(0xffffff);

    private hullShardPool: DebrisShard3D[] = [];
    private plasmaGlobPool: DebrisShard3D[] = [];
    private activeDebris: DebrisShard3D[] = [];
    private activeRings: ShockwaveRing3D[] = [];
    private activeMothershipStrikes: MothershipStrike3D[] = [];

    // 2,200-Particle GPU Burst System
    private gpuBurstGeo!: THREE.BufferGeometry;
    private gpuBurstPositions!: Float32Array;
    private gpuBurstColors!: Float32Array;
    private gpuBurstData: GpuBurstParticle[] = [];
    private gpuBurstCursor = 0;

    private scorchPool: THREE.Mesh[] = [];
    private scorchCursor = 0;
    private hologramTags: THREE.Sprite[] = [];

    private hullShardGeo: THREE.TetrahedronGeometry;
    private plasmaGlobGeo: THREE.OctahedronGeometry;
    private ringGeo: THREE.RingGeometry;
    private scorchPlaneGeo: THREE.PlaneGeometry;

    // 3D Mathematical Screen Shake & Rotational Trauma State
    private shakeIntensity = 0;
    private shakeDuration = 0;
    private shakeTimer = 0;
    public shakeOffset = new THREE.Vector3();
    public shakeRoll = 0;

    // Post-processing dynamic states
    private rgbSplitIntensity = 0.0014;
    private warpIntensity = 0;
    private motionBlurIntensity = 0;
    private supernovaFlashIntensity = 0;
    private godRaysIntensity = 0;
    private elapsed = 0;

    // Mega Win Supernova Beacons & Confetti
    private coinFountainActive = false;
    private confettiInterval: number | null = null;
    private beaconLightCyan!: THREE.PointLight;
    private beaconLightGold!: THREE.PointLight;

    constructor(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        width: number,
        height: number,
        scorchTex?: THREE.CanvasTexture,
        flareTex?: THREE.CanvasTexture
    ) {
        this.scene = scene;
        this.hullShardGeo = new THREE.TetrahedronGeometry(0.42, 0);
        this.plasmaGlobGeo = new THREE.OctahedronGeometry(0.26, 1);
        this.ringGeo = new THREE.RingGeometry(0.7, 1.2, 36);
        this.ringGeo.rotateX(-Math.PI / 2);
        this.scorchPlaneGeo = new THREE.PlaneGeometry(3.6, 3.6);

        this.initPostProcessing(renderer, scene, camera, width, height);
        this.initVolumetricGlassShatterPool();
        this.prewarmDebrisPools(75, 90);
        this.initGpuBurstParticleSystem(flareTex || scorchTex);
        if (scorchTex) {
            this.initPlasmaScorchPool(scorchTex, 55);
        }
        this.initOrbitalBeacons();
    }

    private initPostProcessing(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        width: number,
        height: number
    ) {
        this.composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // Controlled Half-Resolution HDR Bloom: High threshold (0.85) & low initial strength (0.26)
        // Cuts GPU bloom fill-rate by 75% while keeping floating multiplier cards 100% razor-sharp!
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(Math.max(160, Math.floor(width * 0.5)), Math.max(160, Math.floor(height * 0.5))),
            0.26,
            0.38,
            0.85
        );
        this.composer.addPass(this.bloomPass);

        this.warpPass = new ShaderPass(SpaceOverdrivePostShader);
        this.warpPass.uniforms['uResolution'].value.set(width, height);
        this.composer.addPass(this.warpPass);
    }

    public setSize(width: number, height: number) {
        this.composer.setSize(width, height);
        this.bloomPass.resolution.set(
            Math.max(160, Math.floor(width * 0.5)),
            Math.max(160, Math.floor(height * 0.5))
        );
        this.warpPass.uniforms['uResolution'].value.set(width, height);
    }

    /**
     * Initializes the 420-Instance 3D Volumetric Glass-Shatter Pool:
     * Faceted 3D triangular crystal/glass prism shards using `THREE.MeshPhysicalMaterial`
     * with `ior: 1.52`, `clearcoat: 1.0`, and `envMapIntensity: 2.2` to refract and reflect
     * the HDR cosmic environment light as they scatter off-screen!
     */
    private initVolumetricGlassShatterPool() {
        const shardGeo = new THREE.CylinderGeometry(0.03, 0.35, 0.06, 3);
        shardGeo.rotateX(Math.PI / 2);
        shardGeo.computeVertexNormals();

        const shardMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.42,
            roughness: 0.04,
            metalness: 0.25,
            ior: 1.52,
            reflectivity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            envMapIntensity: 2.2,
            flatShading: true,
            side: THREE.DoubleSide
        });

        this.glassShardMesh = new THREE.InstancedMesh(shardGeo, shardMat, GLASS_SHARD_INSTANCES);
        this.glassShardMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.glassShardMesh.frustumCulled = false;

        this.glassDummy.position.set(0, -9999, 0);
        this.glassDummy.scale.set(0, 0, 0);
        this.glassDummy.updateMatrix();

        for (let i = 0; i < GLASS_SHARD_INSTANCES; i++) {
            this.glassShardMesh.setMatrixAt(i, this.glassDummy.matrix);
            this.glassShardMesh.setColorAt(i, new THREE.Color(0xe0f2fe));
            this.glassShards.push({
                active: false,
                pos: new THREE.Vector3(0, -9999, 0),
                vel: new THREE.Vector3(),
                rot: new THREE.Euler(),
                rotVel: new THREE.Vector3(),
                scale: new THREE.Vector3(1, 1, 1),
                baseScale: new THREE.Vector3(1, 1, 1),
                age: 99,
                maxAge: 1,
                baseColor: new THREE.Color(0xe0f2fe)
            });
        }
        this.glassShardMesh.instanceMatrix.needsUpdate = true;
        if (this.glassShardMesh.instanceColor) {
            this.glassShardMesh.instanceColor.needsUpdate = true;
        }
        this.scene.add(this.glassShardMesh);
    }

    /**
     * Shatters the Floating Multiplier Glass Card into 240+ Volumetric 3D Glass Shards
     * that refract and reflect environmental light as they tumble off-screen!
     */
    public spawnVolumetricGlassShatter3D(x: number, y: number, z: number, isGolden = false) {
        const shardCount = 240;
        const cardWidth = 3.04;
        const cardHeight = 1.95;

        const glassPalette = isGolden
            ? [0xffffff, 0xfef08a, 0xfde047, 0xf59e0b, 0x38bdf8]
            : [0xffffff, 0xe0f2fe, 0x7dd3fc, 0x38bdf8, 0x00f0ff];

        for (let i = 0; i < shardCount; i++) {
            const idx = this.glassShardCursor;
            this.glassShardCursor = (this.glassShardCursor + 1) % GLASS_SHARD_INSTANCES;

            const s = this.glassShards[idx];
            s.active = true;
            s.age = 0;
            s.maxAge = 0.74 + Math.random() * 0.48;

            const localX = (Math.random() - 0.5) * cardWidth;
            const localY = (Math.random() - 0.5) * cardHeight;
            s.pos.set(x + localX, y + 1.05 + localY, z + (Math.random() - 0.5) * 0.25);

            const radialX = localX * (4.5 + Math.random() * 6.5) + (Math.random() - 0.5) * 7.0;
            const radialY = localY * (4.0 + Math.random() * 5.5) + 2.5 + Math.random() * 5.0;
            const scatterZ = (Math.random() < 0.65 ? 1 : -1) * (8.0 + Math.random() * 18.0);
            s.vel.set(radialX, radialY, scatterZ);

            s.rot.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            s.rotVel.set(
                (Math.random() - 0.5) * 28,
                (Math.random() - 0.5) * 28,
                (Math.random() - 0.5) * 28
            );

            const sx = 0.55 + Math.random() * 1.45;
            const sy = 0.65 + Math.random() * 1.65;
            const sz = 0.8 + Math.random() * 0.9;
            s.baseScale.set(sx, sy, sz);
            s.scale.copy(s.baseScale);

            s.baseColor.setHex(glassPalette[i % glassPalette.length]);
        }
    }

    private initGpuBurstParticleSystem(particleTex?: THREE.CanvasTexture) {
        this.gpuBurstGeo = new THREE.BufferGeometry();
        this.gpuBurstPositions = new Float32Array(GPU_BURST_PARTICLE_COUNT * 3);
        this.gpuBurstColors = new Float32Array(GPU_BURST_PARTICLE_COUNT * 3);

        for (let i = 0; i < GPU_BURST_PARTICLE_COUNT; i++) {
            this.gpuBurstPositions[i * 3 + 1] = -9999;
            const c = new THREE.Color(PLASMA_COLORS[i % PLASMA_COLORS.length]);
            this.gpuBurstColors[i * 3] = c.r;
            this.gpuBurstColors[i * 3 + 1] = c.g;
            this.gpuBurstColors[i * 3 + 2] = c.b;
            this.gpuBurstData.push({
                vx: 0,
                vy: 0,
                vz: 0,
                age: 99,
                maxAge: 1,
                color: c.clone()
            });
        }

        this.gpuBurstGeo.setAttribute('position', new THREE.BufferAttribute(this.gpuBurstPositions, 3));
        this.gpuBurstGeo.setAttribute('color', new THREE.BufferAttribute(this.gpuBurstColors, 3));

        const burstMat = new THREE.PointsMaterial({
            size: 0.78,
            map: particleTex,
            vertexColors: true,
            transparent: true,
            opacity: 0.82,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(this.gpuBurstGeo, burstMat);
        points.frustumCulled = false;
        this.scene.add(points);
    }

    public spawnGpuParticleCloud(
        x: number,
        y: number,
        z: number,
        count: number,
        palette: number[],
        minSpeed: number,
        maxSpeed: number,
        maxLife = 0.78
    ) {
        for (let i = 0; i < count; i++) {
            const idx = this.gpuBurstCursor;
            this.gpuBurstCursor = (this.gpuBurstCursor + 1) % GPU_BURST_PARTICLE_COUNT;

            const p = this.gpuBurstData[idx];
            p.age = 0;
            p.maxAge = maxLife * (0.55 + Math.random() * 0.65);
            p.color.setHex(palette[i % palette.length]);

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

            this.gpuBurstPositions[idx * 3] = x + (Math.random() - 0.5) * 1.4;
            this.gpuBurstPositions[idx * 3 + 1] = y + (Math.random() - 0.5) * 1.2;
            this.gpuBurstPositions[idx * 3 + 2] = z + (Math.random() - 0.5) * 1.0;

            p.vx = Math.sin(phi) * Math.cos(theta) * speed;
            p.vy = Math.cos(phi) * speed + 2.2;
            p.vz = Math.sin(phi) * Math.sin(theta) * speed;
        }
    }

    private prewarmDebrisPools(shardCount: number, plasmaCount: number) {
        for (let i = 0; i < shardCount; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xe0f2fe : 0x94a3b8,
                emissive: i % 2 === 0 ? 0x0284c7 : 0x1e293b,
                emissiveIntensity: 0.55,
                roughness: 0.12,
                metalness: 0.9,
                transparent: true,
                opacity: 1
            });
            const mesh = new THREE.Mesh(this.hullShardGeo, mat);
            mesh.visible = false;
            this.scene.add(mesh);

            this.hullShardPool.push({
                mesh,
                mat,
                vx: 0,
                vy: 0,
                vz: 0,
                rx: 0,
                ry: 0,
                rz: 0,
                age: 0,
                maxAge: 1
            });
        }

        for (let i = 0; i < plasmaCount; i++) {
            const col = PLASMA_COLORS[i % PLASMA_COLORS.length];
            const mat = new THREE.MeshStandardMaterial({
                color: col,
                emissive: col,
                emissiveIntensity: 1.4,
                roughness: 0.1,
                metalness: 0.25,
                transparent: true,
                opacity: 1
            });
            const mesh = new THREE.Mesh(this.plasmaGlobGeo, mat);
            mesh.visible = false;
            this.scene.add(mesh);

            this.plasmaGlobPool.push({
                mesh,
                mat,
                vx: 0,
                vy: 0,
                vz: 0,
                rx: 0,
                ry: 0,
                rz: 0,
                age: 0,
                maxAge: 1
            });
        }
    }

    private initPlasmaScorchPool(scorchTex: THREE.CanvasTexture, count: number) {
        for (let i = 0; i < count; i++) {
            const col = PLASMA_COLORS[i % PLASMA_COLORS.length];
            const mat = new THREE.MeshBasicMaterial({
                map: scorchTex,
                color: col,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(this.scorchPlaneGeo, mat);
            mesh.visible = false;
            this.scene.add(mesh);
            this.scorchPool.push(mesh);
        }
    }

    private initOrbitalBeacons() {
        this.beaconLightCyan = new THREE.PointLight(0x00f0ff, 0, 55, 1.2);
        this.beaconLightGold = new THREE.PointLight(0xf59e0b, 0, 55, 1.2);
        this.scene.add(this.beaconLightCyan, this.beaconLightGold);
    }

    public stampPermanentPaintSplatter(zPos: number, _forceWall = false, customColorHex?: number) {
        if (this.scorchPool.length === 0) return;

        const mesh = this.scorchPool[this.scorchCursor];
        this.scorchCursor = (this.scorchCursor + 1) % this.scorchPool.length;

        const colorHex = customColorHex ?? PLASMA_COLORS[Math.floor(Math.random() * PLASMA_COLORS.length)];
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        mesh.visible = true;

        const scale = 0.85 + Math.random() * 1.1;
        mesh.scale.setScalar(scale);
        mesh.position.set((Math.random() - 0.5) * 16, -0.32, zPos + (Math.random() - 0.5) * 4);
        mesh.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    }

    /**
     * Projects a clean, centered 3D Holographic Multiplier Readout ("1.20×") directly above the cleared barrier gate,
     * floating smoothly upward and dissolving over 0.72s so it never clips off screen edges or blocks future cards!
     */
    public spawnGraffitiMultiplierTag3D(x: number, y: number, z: number, multiplier: number, row: number) {
        const colorCss = PLASMA_CSS[row % PLASMA_CSS.length];
        const tex = createGraffitiMultiplierTexture(`${multiplier.toFixed(2)}×`, colorCss);
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.96,
            depthTest: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x, y + 3.4, z);
        sprite.scale.set(2.3, 1.15, 1);
        sprite.userData = { age: 0, maxAge: 0.62 };
        this.scene.add(sprite);
        this.hologramTags.push(sprite);

        if (this.hologramTags.length > 6) {
            const old = this.hologramTags.shift()!;
            this.scene.remove(old);
            old.material.map?.dispose();
            old.material.dispose();
        }
    }

    public clearGraffitiTags() {
        for (const s of this.hologramTags) {
            this.scene.remove(s);
            s.material.map?.dispose();
            s.material.dispose();
        }
        this.hologramTags = [];
    }

    private acquireHullShard(): DebrisShard3D | null {
        const shard = this.hullShardPool.pop();
        if (!shard) return null;
        shard.mesh.visible = true;
        this.activeDebris.push(shard);
        return shard;
    }

    private acquirePlasmaGlob(): DebrisShard3D | null {
        const drop = this.plasmaGlobPool.pop();
        if (!drop) return null;
        drop.mesh.visible = true;
        this.activeDebris.push(drop);
        return drop;
    }

    public spawnShockwave3D(x: number, y: number, z: number, colorHex: number, maxScale = 6.5, duration = 0.42) {
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ringMesh = new THREE.Mesh(this.ringGeo, ringMat);
        ringMesh.position.set(x, y + 0.18, z);
        this.scene.add(ringMesh);
        this.activeRings.push({
            mesh: ringMesh,
            mat: ringMat,
            age: 0,
            maxAge: duration,
            maxScale
        });
    }

    /**
     * 3D VOLUMETRIC GLASS GATE SHATTER:
     * Physically shatters the gate's crystalline glass card into 240+ 3D volumetric glass shards
     * that refract environmental light as they scatter off-screen + GPU shimmer sparks!
     */
    public spawnSafeBurst3D(x: number, y: number, z: number, isGolden = false) {
        const primaryColor = isGolden ? 0xf59e0b : 0x38bdf8;
        this.spawnShockwave3D(x, y, z, primaryColor, isGolden ? 9.5 : 7.0, 0.42);

        this.triggerScreenShake(isGolden ? 0.4 : 0.25, 0.24);
        this.rgbSplitIntensity = Math.max(this.rgbSplitIntensity, isGolden ? 0.012 : 0.0065);
        this.motionBlurIntensity = Math.max(this.motionBlurIntensity, isGolden ? 0.36 : 0.24);
        this.warpIntensity = Math.max(this.warpIntensity, 0.18);
        this.godRaysIntensity = Math.max(this.godRaysIntensity, isGolden ? 0.55 : 0.28);

        this.stampPermanentPaintSplatter(z, false, primaryColor);

        // 1. Shatter the Gate Card into 240 Volumetric 3D Refractive Glass Shards!
        this.spawnVolumetricGlassShatter3D(x, y, z, isGolden);

        // 2. Balanced GPU Crystalline Spark Cloud
        this.spawnGpuParticleCloud(
            x,
            y + 1.0,
            z,
            isGolden ? 340 : 240,
            isGolden ? [0xfde047, 0xf59e0b, 0xffffff] : [0xe0f2fe, 0x38bdf8, 0x00f0ff],
            7,
            22,
            0.68
        );
    }

    /**
     * BRUTAL THERMONUCLEAR CRASH EXPLOSION:
     * Violent mathematical screen shake + Harsh Chromatic Aberration Split + Motion Blur!
     */
    public spawnCrashExplosion3D(x: number, y: number, z: number) {
        this.spawnShockwave3D(x, y, z, 0xff1e42, 15.0, 0.72);
        this.spawnShockwave3D(x, y + 0.4, z, 0xf59e0b, 11.0, 0.54);

        this.triggerScreenShake(2.15, 0.85);
        this.rgbSplitIntensity = 0.044;
        this.motionBlurIntensity = 0.65;
        this.warpIntensity = 0.32;

        this.stampPermanentPaintSplatter(z, false, 0xff1e42);

        this.spawnGpuParticleCloud(
            x,
            y + 0.9,
            z,
            780,
            [0xff1e42, 0xf59e0b, 0xfde047, 0xffffff],
            10,
            32,
            1.0
        );

        for (let i = 0; i < 38; i++) {
            const shard = this.acquireHullShard();
            if (!shard) break;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 9 + Math.random() * 18;

            shard.mat.color.setHex(i % 2 === 0 ? 0xff1e42 : 0xf59e0b);
            shard.mat.emissive.setHex(0xff1e42);
            shard.mat.opacity = 1;
            shard.mesh.position.set(x, y + 0.7, z);
            shard.mesh.scale.setScalar(0.9 + Math.random() * 1.4);

            shard.vx = Math.cos(theta) * Math.sin(phi) * speed;
            shard.vy = Math.cos(phi) * speed;
            shard.vz = Math.sin(theta) * Math.sin(phi) * speed;
            shard.rx = (Math.random() - 0.5) * 28;
            shard.ry = (Math.random() - 0.5) * 28;
            shard.rz = (Math.random() - 0.5) * 28;
            shard.age = 0;
            shard.maxAge = 0.9 + Math.random() * 0.38;
        }

        for (let i = 0; i < 46; i++) {
            const drop = this.acquirePlasmaGlob();
            if (!drop) break;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.75;
            const speed = 10 + Math.random() * 21;
            const col = i % 2 === 0 ? 0xff1e42 : 0xf59e0b;

            drop.mat.color.setHex(col);
            drop.mat.emissive.setHex(col);
            drop.mat.opacity = 1;
            drop.mesh.position.set(x, y + 0.7, z);
            drop.mesh.scale.setScalar(0.95 + Math.random() * 1.5);

            drop.vx = Math.cos(theta) * Math.sin(phi) * speed;
            drop.vy = Math.cos(phi) * speed + 3.5;
            drop.vz = Math.sin(theta) * Math.sin(phi) * speed;
            drop.rx = 18;
            drop.ry = 18;
            drop.rz = 18;
            drop.age = 0;
            drop.maxAge = 0.82 + Math.random() * 0.38;
        }
    }

    /**
     * MEGA WIN "SUPERNOVA" EXPLOSION:
     * Blinding golden light flood, volumetric God rays, lens flares, 1,400 GPU golden particles,
     * and refractive glass/gold burst!
     */
    public triggerSupernovaExplosion3D(x: number, y: number, z: number, isMega = true) {
        this.supernovaFlashIntensity = isMega ? 0.42 : 0.28;
        this.godRaysIntensity = isMega ? 0.38 : 0.24;
        this.rgbSplitIntensity = Math.max(this.rgbSplitIntensity, 0.008);
        this.triggerScreenShake(isMega ? 0.35 : 0.22, 0.32);

        this.spawnShockwave3D(x, y + 0.4, z, 0x00e676, 12.0, 0.55);

        this.spawnGpuParticleCloud(
            x,
            y + 1.2,
            z - 1.5,
            isMega ? 150 : 90,
            [0x00e676, 0xfde047, 0x00f0ff, 0xffffff],
            9,
            24,
            0.75
        );
    }

    public spawnShieldDeflect3D(x: number, y: number, z: number) {
        this.spawnShockwave3D(x, y + 0.6, z, 0x38bdf8, 11.0, 0.52);
        this.triggerScreenShake(0.7, 0.4);
        this.rgbSplitIntensity = 0.016;
        this.motionBlurIntensity = 0.28;
        this.spawnVolumetricGlassShatter3D(x, y, z, false);
    }

    /**
     * Spawns a 3D Orbital Dreadnought / Alien Mothership above the Cosmic Void
     * that fires twin Quantum Plasma Pillars to vaporize the next 2 rows!
     */
    public triggerAlienMothershipStrike3D(originX: number, originZ: number, targetRowZs: number[]) {
        this.triggerScreenShake(0.62, 0.48);
        this.rgbSplitIntensity = 0.016;
        this.motionBlurIntensity = 0.32;
        this.godRaysIntensity = Math.max(this.godRaysIntensity, 0.48);

        const group = new THREE.Group();
        const mothership = new THREE.Group();
        const destZ =
            targetRowZs.length > 0 ? targetRowZs[targetRowZs.length - 1] : originZ - 12.2;

        // Snap Mothership directly to the exact lane center (originX) and destination row (destZ)
        mothership.position.set(originX, 10.5, destZ);

        const saucerGeo = new THREE.CylinderGeometry(1.4, 3.2, 0.85, 16);
        const saucerMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.75,
            metalness: 0.88,
            roughness: 0.2
        });
        const saucer = new THREE.Mesh(saucerGeo, saucerMat);

        const coreRingGeo = new THREE.TorusGeometry(2.6, 0.14, 8, 24);
        coreRingGeo.rotateX(Math.PI / 2);
        const coreRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);

        mothership.add(saucer, coreRing);
        group.add(mothership);

        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        for (const rZ of targetRowZs) {
            const beamGeo = new THREE.CylinderGeometry(0.6, 3.2, 11.0, 20, 1, true);
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(originX, 5.0, rZ);
            group.add(beam);

            this.spawnShockwave3D(originX, 0.2, rZ, 0x38bdf8, 12.5, 0.65);
            this.spawnVolumetricGlassShatter3D(originX, 0.4, rZ, false);
        }

        this.scene.add(group);
        this.activeMothershipStrikes.push({
            group,
            mothership,
            coreRing,
            beamMat,
            age: 0,
            maxAge: 0.95
        });
    }

    public triggerScreenShake(intensity: number, duration: number) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
        this.shakeTimer = this.shakeDuration;
    }

    public triggerDesktopConfetti(isMega = false) {
        try {
            if (isMega) {
                confetti({
                    particleCount: 115,
                    angle: 90,
                    spread: 125,
                    origin: { x: 0.5, y: 0.82 },
                    gravity: 0.82,
                    scalar: 1.3,
                    colors: ['#fde047', '#f59e0b', '#00f0ff', '#10b981', '#ffffff']
                });
            } else {
                confetti({
                    particleCount: 55,
                    spread: 85,
                    origin: { x: 0.5, y: 0.6 },
                    colors: ['#00f0ff', '#fde047', '#f59e0b', '#10b981']
                });
            }
        } catch {
            // Ignore in headless environments
        }
    }

    public startCoinFountain() {
        this.coinFountainActive = true;
        this.triggerDesktopConfetti(true);
        if (this.confettiInterval !== null) clearInterval(this.confettiInterval);
        this.confettiInterval = window.setInterval(() => {
            if (!this.coinFountainActive) return;
            this.triggerDesktopConfetti(true);
        }, 1050);
    }

    public stopCoinFountain() {
        this.coinFountainActive = false;
        this.beaconLightCyan.intensity = 0;
        this.beaconLightGold.intensity = 0;
        if (this.confettiInterval !== null) {
            clearInterval(this.confettiInterval);
            this.confettiInterval = null;
        }
    }

    public update(
        dt: number,
        multiplier: number,
        isHitStop: boolean,
        hitStopProgress: number,
        shipPos: THREE.Vector3
    ) {
        this.elapsed += dt;

        // 1. Update Brutal Mathematical Damped-Harmonic Screen Shake + Rotational Roll Trauma
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const norm = Math.max(0, this.shakeTimer / Math.max(0.001, this.shakeDuration));
            const expDecay = norm * norm;
            const harmonicX = Math.sin(this.elapsed * 68) * 0.65 + (Math.random() - 0.5) * 0.7;
            const harmonicY = Math.cos(this.elapsed * 59) * 0.65 + (Math.random() - 0.5) * 0.7;
            const mag = this.shakeIntensity * expDecay;

            this.shakeOffset.set(
                harmonicX * mag,
                harmonicY * mag,
                (Math.random() - 0.5) * mag * 0.75
            );
            this.shakeRoll = Math.sin(this.elapsed * 52) * mag * 0.048;
        } else {
            this.shakeIntensity = 0;
            this.shakeOffset.set(0, 0, 0);
            this.shakeRoll = 0;
        }

        // 2. Controlled HDR Bloom & Next-Gen Post-Processing Uniforms
        const baseBloom = 0.24 + Math.min(0.28, Math.log10(Math.max(1, multiplier)) * 0.14);
        this.bloomPass.strength =
            baseBloom +
            (isHitStop ? 0.28 * hitStopProgress : 0) +
            this.supernovaFlashIntensity * 0.75;

        if (isHitStop) {
            this.warpIntensity = THREE.MathUtils.lerp(this.warpIntensity, 0.22 * hitStopProgress, dt * 16);
            this.rgbSplitIntensity = Math.max(this.rgbSplitIntensity, 0.0095 * hitStopProgress);
            this.motionBlurIntensity = Math.max(this.motionBlurIntensity, 0.2 * hitStopProgress);
            this.godRaysIntensity = Math.max(this.godRaysIntensity, 0.42 * hitStopProgress);
            this.warpPass.uniforms['uHitStopFlash'].value = hitStopProgress;
            this.warpPass.uniforms['uDofStrength'].value = 0.24 + 0.35 * hitStopProgress;
        } else {
            this.warpIntensity = Math.max(0, this.warpIntensity - dt * 0.55);
            this.rgbSplitIntensity = Math.max(0.0014, this.rgbSplitIntensity - dt * 0.042);
            this.motionBlurIntensity = Math.max(0, this.motionBlurIntensity - dt * 0.75);
            this.godRaysIntensity = Math.max(0, this.godRaysIntensity - dt * 0.85);
            this.warpPass.uniforms['uHitStopFlash'].value = 0.0;
            this.warpPass.uniforms['uDofStrength'].value = 0.24;
        }

        if (this.supernovaFlashIntensity > 0) {
            this.supernovaFlashIntensity = Math.max(0, this.supernovaFlashIntensity - dt * 0.85);
        }

        this.warpPass.uniforms['uWarpStrength'].value = this.warpIntensity;
        this.warpPass.uniforms['uRgbSplit'].value = this.rgbSplitIntensity;
        this.warpPass.uniforms['uMotionBlur'].value = this.motionBlurIntensity;
        this.warpPass.uniforms['uSupernovaFlash'].value = this.supernovaFlashIntensity;
        this.warpPass.uniforms['uGodRays'].value = Math.max(this.godRaysIntensity, this.supernovaFlashIntensity);
        this.warpPass.uniforms['uHeatDistortion'].value = isHitStop ? 0.0055 : 0.0022;
        this.warpPass.uniforms['uTime'].value = this.elapsed;

        if (this.coinFountainActive) {
            const pulse = Math.sin(this.elapsed * 18) > 0;
            this.beaconLightCyan.position.set(shipPos.x - 7, shipPos.y + 8, shipPos.z - 6);
            this.beaconLightGold.position.set(shipPos.x + 7, shipPos.y + 8, shipPos.z - 6);
            this.beaconLightCyan.intensity = pulse ? 32 : 4;
            this.beaconLightGold.intensity = pulse ? 4 : 32;
        }

        // 3. Simulate 420-Instance 3D Volumetric Glass Shards (Refracting & Reflecting Specular Glints!)
        let glassUpdated = false;
        for (let i = 0; i < GLASS_SHARD_INSTANCES; i++) {
            const s = this.glassShards[i];
            if (!s.active) continue;

            glassUpdated = true;
            s.age += dt;
            if (s.age >= s.maxAge) {
                s.active = false;
                this.glassDummy.position.set(0, -9999, 0);
                this.glassDummy.scale.set(0, 0, 0);
                this.glassDummy.updateMatrix();
                this.glassShardMesh.setMatrixAt(i, this.glassDummy.matrix);
                continue;
            }

            s.vel.y -= 6.5 * dt;
            s.pos.addScaledVector(s.vel, dt);
            s.rot.x += s.rotVel.x * dt;
            s.rot.y += s.rotVel.y * dt;
            s.rot.z += s.rotVel.z * dt;

            const life = 1 - s.age / s.maxAge;
            const shrink = life < 0.25 ? life / 0.25 : 1.0;

            this.glassDummy.position.copy(s.pos);
            this.glassDummy.rotation.copy(s.rot);
            this.glassDummy.scale.copy(s.baseScale).multiplyScalar(shrink);
            this.glassDummy.updateMatrix();
            this.glassShardMesh.setMatrixAt(i, this.glassDummy.matrix);

            // Dynamic chromatic refraction & specular glint as the glass shard rotates
            const glint = Math.pow(Math.max(0, Math.sin(s.rot.x * 2.0 + s.rot.y * 2.0)), 6);
            this.glassTempColor.copy(s.baseColor).lerp(this.glassWhiteColor, glint * 0.88);
            this.glassShardMesh.setColorAt(i, this.glassTempColor);
        }
        if (glassUpdated) {
            this.glassShardMesh.instanceMatrix.needsUpdate = true;
            if (this.glassShardMesh.instanceColor) {
                this.glassShardMesh.instanceColor.needsUpdate = true;
            }
        }

        // 4. Simulate GPU Particle Cloud
        let gpuUpdated = false;
        for (let i = 0; i < GPU_BURST_PARTICLE_COUNT; i++) {
            const p = this.gpuBurstData[i];
            if (p.age >= p.maxAge) continue;

            gpuUpdated = true;
            p.age += dt;
            if (p.age >= p.maxAge) {
                this.gpuBurstPositions[i * 3 + 1] = -9999;
                continue;
            }

            p.vx *= 1 - dt * 1.4;
            p.vy *= 1 - dt * 1.4;
            p.vz *= 1 - dt * 1.4;

            this.gpuBurstPositions[i * 3] += p.vx * dt;
            this.gpuBurstPositions[i * 3 + 1] += p.vy * dt;
            this.gpuBurstPositions[i * 3 + 2] += p.vz * dt;

            const fade = Math.max(0, 1 - p.age / p.maxAge);
            this.gpuBurstColors[i * 3] = p.color.r * fade;
            this.gpuBurstColors[i * 3 + 1] = p.color.g * fade;
            this.gpuBurstColors[i * 3 + 2] = p.color.b * fade;
        }
        if (gpuUpdated) {
            (this.gpuBurstGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            (this.gpuBurstGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
        }

        // 5. Simulate Active Zero-G 3D Hull Shards & Plasma Sparks
        for (let i = this.activeDebris.length - 1; i >= 0; i--) {
            const d = this.activeDebris[i];
            d.age += dt;
            if (d.age >= d.maxAge) {
                d.mesh.visible = false;
                this.activeDebris.splice(i, 1);
                if (d.mesh.geometry === this.hullShardGeo) {
                    this.hullShardPool.push(d);
                } else {
                    this.plasmaGlobPool.push(d);
                }
                continue;
            }

            d.mesh.position.x += d.vx * dt;
            d.mesh.position.y += d.vy * dt;
            d.mesh.position.z += d.vz * dt;

            d.mesh.rotation.x += d.rx * dt;
            d.mesh.rotation.y += d.ry * dt;
            d.mesh.rotation.z += d.rz * dt;

            const life = 1 - d.age / d.maxAge;
            d.mat.opacity = life;
        }

        // 6. Simulate Active 3D Shockwave Rings
        for (let i = this.activeRings.length - 1; i >= 0; i--) {
            const r = this.activeRings[i];
            r.age += dt;
            if (r.age >= r.maxAge) {
                this.scene.remove(r.mesh);
                r.mat.dispose();
                this.activeRings.splice(i, 1);
                continue;
            }
            const t = r.age / r.maxAge;
            const easeOut = 1 - Math.pow(1 - t, 3);
            const s = 0.5 + easeOut * r.maxScale;
            r.mesh.scale.setScalar(s);
            r.mat.opacity = (1 - t) * 0.85;
        }

        // 7. Simulate Active 3D Orbital Mothership Laser Strikes
        for (let i = this.activeMothershipStrikes.length - 1; i >= 0; i--) {
            const c = this.activeMothershipStrikes[i];
            c.age += dt;
            if (c.age >= c.maxAge) {
                this.scene.remove(c.group);
                c.group.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry?.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material?.dispose();
                        }
                    }
                });
                this.activeMothershipStrikes.splice(i, 1);
                continue;
            }
            c.coreRing.rotation.z += dt * 18;
            const fade = Math.sin((c.age / c.maxAge) * Math.PI);
            c.beamMat.opacity = fade * 0.82;
        }

        // 8. Simulate & Dissolve Active Cleared-Barrier Hologram Multiplier Tags
        for (let i = this.hologramTags.length - 1; i >= 0; i--) {
            const tag = this.hologramTags[i];
            const age = (tag.userData.age || 0) + dt;
            const maxAge = tag.userData.maxAge || 0.72;
            tag.userData.age = age;
            if (age >= maxAge) {
                this.scene.remove(tag);
                tag.material.map?.dispose();
                tag.material.dispose();
                this.hologramTags.splice(i, 1);
                continue;
            }
            tag.position.y += dt * 1.95;
            const t = age / maxAge;
            tag.material.opacity = t < 0.2 ? (t / 0.2) * 0.96 : (1 - (t - 0.2) / 0.8) * 0.96;
        }
    }
}
