import './style.css';
import { GameEngine, GameState } from './game/engine';
import { generateServerSeed } from './crypto/provablyFair';
import { CanvasRenderer } from './renderer/canvasView';
import { RenderLoop } from './renderer/effects';
import { createControlsUI } from './ui/controls';
import { createSeedModal } from './ui/seedModal';
import { createSimPanel } from './ui/simPanel';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="game-container" id="game-container">
    <canvas id="game-canvas"></canvas>
  </div>
`;

const container = document.getElementById('game-container') as HTMLElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Initialize Core Systems
const serverSeed = generateServerSeed();
const clientSeed = 'stake_player_1';
const engine = new GameEngine(serverSeed, clientSeed);

const renderer = new CanvasRenderer(canvas);
const loop = new RenderLoop(renderer, engine);

// Assemble UI
createControlsUI(container, engine);
createSeedModal(container, engine);
createSimPanel(container);

// Wire Canvas Interactions
canvas.addEventListener('click', (e) => {
    if (engine.state !== GameState.PLAYING) return;

    const target = renderer.getClickTarget(e.clientX, e.clientY);
    if (!target) return;

    // We only allow clicking on the current active row
    if (target.row === engine.currentRow) {
        engine.pickLane(target.lane);
    }
});

// Start loop
loop.start();
