import './style.css';
import { GameEngine } from './game/engine';
import { GameState } from './math/types';
import { generateServerSeed } from './crypto/provablyFair';
import { GameStateController } from './engine/GameState';
import { PixiRenderer } from './engine/Renderer';
import { createControlsUI } from './ui/controls';
import { isRulesModalOpen } from './ui/rulesModal';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="pc-command-shell" id="pc-command-shell">
    <header class="pc-top-header" id="pc-top-header"></header>

    <main class="pc-cockpit-grid">
      <aside class="pc-left-dock" id="left-command-dock"></aside>

      <section class="pc-center-stage" id="stage-container">
        <canvas id="game-canvas"></canvas>
      </section>
    </main>
  </div>
`;

const topHeader = document.getElementById('pc-top-header') as HTMLElement;
const leftDock = document.getElementById('left-command-dock') as HTMLElement;
const stageContainer = document.getElementById('stage-container') as HTMLElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// 1. Initialize Core Provably Fair Engine & GameState Controller
const initialServerSeed = generateServerSeed();
const initialClientSeed = 'stake_production_player_1';
const engine = new GameEngine(initialServerSeed, initialClientSeed);
const gameState = new GameStateController(engine);

// 2. Initialize Three.js 3D Space Renderer
const renderer = new PixiRenderer(canvas, gameState);

// 3. Initialize Production Stake-Ready HUD & Betting Panel
createControlsUI(topHeader, leftDock, stageContainer, gameState, renderer);

// 4. Ensure initial layout settles and ResizeObserver keeps 3D WebGL stage crisp across monitors
requestAnimationFrame(() => {
    renderer.setupDPI(true);
});

const resizeObs = new ResizeObserver(() => {
    renderer.setupDPI(true);
});
resizeObs.observe(stageContainer);

// 5. Wire 3D Floating Card Pointer & Mobile Touch Interactions
canvas.addEventListener('pointerdown', (e) => {
    if (isRulesModalOpen()) return;
    if (engine.state !== GameState.PLAYING || gameState.isHitStopActive) return;

    const target = renderer.getClickTarget(e.clientX, e.clientY, engine.currentRow);
    if (!target) return;

    if (target.row === engine.currentRow) {
        gameState.selectLaneWithHitStop(target.lane);
        if (e.pointerType === 'touch') {
            renderer.clearHover();
        }
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (isRulesModalOpen()) return;
    if (e.pointerType === 'touch') return;
    if (engine.state === GameState.PLAYING && !gameState.isHitStopActive) {
        renderer.updateHover(e.clientX, e.clientY, engine.currentRow);
    } else if (renderer.hoveredLane !== null) {
        renderer.clearHover();
    }
});

canvas.addEventListener('pointerleave', () => {
    renderer.clearHover();
});

canvas.addEventListener('pointercancel', () => {
    renderer.clearHover();
});

// Testing / Debug hooks
(window as any).__engine = engine;
(window as any).__gameState = gameState;
(window as any).__renderer = renderer;

if (new URLSearchParams(window.location.search).has('shield')) {
    engine.shieldPurchased = true;
    renderer.ship.setShieldActive(true, false);
}

if (new URLSearchParams(window.location.search).has('test_impact')) {
    engine.shieldPurchased = true;
    renderer.ship.setShieldActive(true, false);
    setTimeout(() => {
        renderer.ship.triggerShieldImpact(0, 0.9, 0);
        (renderer as any).vfx.spawnShieldDeflect3D(0, 0.9, 0);
    }, 150);
}
