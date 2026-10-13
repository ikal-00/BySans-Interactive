import './style.css';
import { GameEngine } from './game/engine';
import { GameState } from './math/types';
import { generateServerSeed } from './crypto/provablyFair';
import { CanvasRenderer } from './renderer/canvasView';
import { RenderLoop } from './renderer/effects';
import { createControlsUI } from './ui/controls';
import { createSeedModal } from './ui/seedModal';
import { createSimPanel } from './ui/simPanel';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="phone-mockup-wrapper" id="phone-wrapper">
    <div class="phone-bezel">
      <!-- Dynamic Island Notch -->
      <div class="dynamic-island">
        <div class="camera-lens"></div>
      </div>

      <!-- Main Game Screen Area -->
      <div class="game-container" id="game-container">
        <canvas id="game-canvas"></canvas>
      </div>
    </div>
  </div>
`;

const container = document.getElementById('game-container') as HTMLElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Initialize Core Provably Fair Engine
const initialServerSeed = generateServerSeed();
const initialClientSeed = 'stake_player_1';
const engine = new GameEngine(initialServerSeed, initialClientSeed);

// Initialize 3D Perspective Renderer & 60 FPS Loop
const renderer = new CanvasRenderer(canvas);
const loop = new RenderLoop(renderer, engine);

// Assemble UI Modules
createControlsUI(container, engine);
createSeedModal(container, engine);
createSimPanel(container);

// Wire Canvas Interactions with accurate 3D perspective hit testing
canvas.addEventListener('pointerdown', (e) => {
    if (engine.state !== GameState.PLAYING) return;

    const target = renderer.getClickTarget(e.clientX, e.clientY, engine.currentRow);
    if (!target) return;

    if (target.row === engine.currentRow) {
        engine.pickLane(target.lane);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (engine.state === GameState.PLAYING) {
        renderer.updateHover(e.clientX, e.clientY, engine.currentRow);
    } else {
        renderer.clearHover();
    }
});

canvas.addEventListener('pointerleave', () => {
    renderer.clearHover();
});

// Start Animation Loop
loop.start();
