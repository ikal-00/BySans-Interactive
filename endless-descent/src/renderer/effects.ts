import { CanvasRenderer } from './canvasView';
import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { sounds } from '../audio/sounds';
import { formatMultiplier, formatCurrency } from '../math/multipliers';

export class RenderLoop {
    private renderer: CanvasRenderer;
    private engine: GameEngine;
    private rafId: number = 0;
    private isRunning: boolean = false;

    constructor(renderer: CanvasRenderer, engine: GameEngine) {
        this.renderer = renderer;
        this.engine = engine;
        this.bindEngineEvents();
    }

    private bindEngineEvents() {
        // Safe step event
        this.engine.onStep((pick) => {
            if (pick.isSafe) {
                sounds.playSafeStep(pick.row);
                const quad = this.renderer.getCellQuad(pick.row, pick.lane);
                this.renderer.addFloatingText(
                    quad.cx,
                    quad.cy - 10,
                    `+${formatMultiplier(this.engine.currentMultiplier)}`,
                    '#00e701'
                );
            } else {
                sounds.playCrash();
                const quad = this.renderer.getCellQuad(pick.row, pick.lane);
                this.renderer.triggerCrashEffect(quad.cx, quad.cy);
            }
        });

        // Cashout event
        this.engine.onCashout((payout) => {
            sounds.playCashout();
            this.renderer.addFloatingText(
                this.renderer.width / 2,
                this.renderer.height * 0.42,
                `WIN ${formatCurrency(payout)}`,
                '#00e701'
            );
        });

        // State changes
        this.engine.onStateChange((state) => {
            if (state === GameState.PLAYING) {
                sounds.playClick();
            }
        });
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const loop = (time: number) => {
            this.renderer.render(this.engine, time);
            if (this.isRunning) {
                this.rafId = requestAnimationFrame(loop);
            }
        };

        this.rafId = requestAnimationFrame(loop);
    }

    public stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
    }
}
