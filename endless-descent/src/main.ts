import './style.css';
import { GameEngine } from './game/engine';
import { GameState } from './math/types';
import { generateServerSeed } from './crypto/provablyFair';
import { GameStateController } from './engine/GameState';
import { PixiRenderer } from './engine/Renderer';
import { createControlsUI } from './ui/controls';
import { isRulesModalOpen } from './ui/rulesModal';
import { isBonusBuyModalOpen } from './ui/bonusBuyModal';
import { audioController } from './engine/AudioController';

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
(window as any).__gameRenderer = renderer;
(window as any).__gameEngine = engine;

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
    if (isRulesModalOpen() || isBonusBuyModalOpen()) return;
    if (
        engine.state !== GameState.PLAYING ||
        gameState.isHitStopActive ||
        engine.isWheelActive ||
        engine.isSlotActive ||
        renderer.isRouletteActive ||
        renderer.isSlotActive ||
        renderer.isWheelSpinning ||
        renderer.isSlotSpinning ||
        engine.wheelProfile === 'BONUS_BUY' ||
        engine.slotBundle?.profile === 'BONUS_BUY'
    ) return;

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
    if (isRulesModalOpen() || isBonusBuyModalOpen()) return;
    if (e.pointerType === 'touch') return;
    if (
        engine.state === GameState.PLAYING &&
        !gameState.isHitStopActive &&
        !engine.isWheelActive &&
        !engine.isSlotActive &&
        !renderer.isRouletteActive &&
        !renderer.isSlotActive &&
        !renderer.isWheelSpinning &&
        !renderer.isSlotSpinning &&
        engine.wheelProfile !== 'BONUS_BUY' &&
        engine.slotBundle?.profile !== 'BONUS_BUY'
    ) {
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

// 6. Start Cyberpunk Synthwave Music immediately at startup & unlock WebAudio on first gesture
const GESTURE_EVENTS = ['pointerdown', 'mousedown', 'keydown', 'touchstart'];
const unlockAudioOnGesture = () => {
    audioController.resumeAudioContext();
    GESTURE_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, unlockAudioOnGesture);
    });
};
GESTURE_EVENTS.forEach((evt) => {
    window.addEventListener(evt, unlockAudioOnGesture, { passive: true });
});
// Immediate direct playback attempt (for browsers permitting autoplay)
audioController.startAmbientDrone();

// Testing / Debug hooks
(window as any).__engine = engine;
(window as any).__gameState = gameState;
(window as any).__renderer = renderer;

if (new URLSearchParams(window.location.search).has('shield')) {
    engine.shieldPurchased = true;
    renderer.ship.setShieldActive(true, false);
}
