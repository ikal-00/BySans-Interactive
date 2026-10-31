import * as THREE from 'three';
import { createPBRTexturePack } from './engine/Textures3D';
import { Spaceship3D } from './engine/Spaceship3D';

const canvas = document.getElementById('showcase-canvas') as HTMLCanvasElement;
const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020612);

// Camera placed at front-left 3/4 hero angle matching the reference image with full ship framing
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
camera.position.set(-4.6, 2.6, -4.8);
camera.lookAt(new THREE.Vector3(0, 0.15, -0.4));

// Soft studio lighting ("sin tanto brillo")
const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
scene.add(hemiLight);

const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.2);
mainDirLight.position.set(-5, 7, -4);
scene.add(mainDirLight);

const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
rimLight.position.set(5, 3, 4);
scene.add(rimLight);

const textures = createPBRTexturePack();
const ship = new Spaceship3D(scene, textures);
ship.snapTo(0, 0, 0);

// Subtle sci-fi neon tunnel background rings matching reference image
const tunnelGroup = new THREE.Group();
for (let i = 0; i < 8; i++) {
    const ringGeo = new THREE.TorusGeometry(3.8 + i * 0.4, 0.04, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.25 - i * 0.02
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, -2.0 - i * 3.5);
    tunnelGroup.add(ring);
}
scene.add(tunnelGroup);

let elapsed = 0;
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += dt;

    // Subtle gentle hero breathing
    ship.update(dt, 0x00f0ff, false, null, null, false, false, 1.0, false);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});
