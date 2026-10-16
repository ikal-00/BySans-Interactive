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
  <div class="viewport-shell" id="viewport-shell">
    <!-- Dedicated Upper Stage: 3D Corridor Canvas + Top HUD -->
    <div class="stage-container" id="stage-container">
      <canvas id="game-canvas"></canvas>
    </div>

    <!-- Dedicated Bottom Control Deck: Never obscures the active canvas lane -->
    <div class="control-dock" id="control-dock"></div>
  </div>
`;

const stageContainer = document.getElementById('stage-container') as HTMLElement;
const controlDock = document.getElementById('control-dock') as HTMLElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Initialize Core Provably Fair Engine
const initialServerSeed = generateServerSeed();
const initialClientSeed = 'stake_player_1';
const engine = new GameEngine(initialServerSeed, initialClientSeed);

// Initialize UI Modules first so stageContainer flex height settles before initial DPI measure
createControlsUI(stageContainer, controlDock, engine);
createSeedModal(stageContainer, engine);
createSimPanel(stageContainer);

// Initialize 3D Perspective Renderer & 60 FPS Loop
const renderer = new CanvasRenderer(canvas);
const loop = new RenderLoop(renderer, engine);

// Ensure resize observer keeps canvas sharp if dock height changes (e.g. Manual <-> Auto tab)
const resizeObs = new ResizeObserver(() => {
    renderer.setupDPI();
});
resizeObs.observe(stageContainer);

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
