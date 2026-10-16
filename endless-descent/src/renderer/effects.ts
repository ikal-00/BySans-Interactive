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
        this.engine.onStep((pick) => {
            this.renderer.notifyStep(pick.row);
            const quad = this.renderer.getCellQuad(pick.row, pick.lane);

            if (pick.isSafe) {
                if (pick.specialType === 'GOLDEN') {
                    sounds.playGoldenHit();
                    this.renderer.triggerGoldenBurst(quad.cx, quad.cy);
                    this.renderer.addFloatingText(
                        quad.cx,
                        quad.cy - 14,
                        `GOLD x${pick.boostApplied} // ${formatMultiplier(this.engine.currentMultiplier)}`,
                        '#ffc700',
                        1.1
                    );
                } else if (pick.specialType === 'ALIEN') {
                    sounds.playAlienLaser();
                    this.renderer.triggerAlienUfoAttack(quad.cx, quad.cy);
                    this.renderer.addFloatingText(
                        this.renderer.width / 2,
                        this.renderer.height * 0.36,
                        `UFO INTERCEPT // +${pick.rowsSkipped} FILAS`,
                        '#00f0ff',
                        1.15
                    );
                } else {
                    sounds.playSafeStep(pick.row);
                    this.renderer.addFloatingText(
                        quad.cx,
                        quad.cy - 10,
                        `+${formatMultiplier(this.engine.currentMultiplier)}`,
                        '#00e701'
                    );
                }
            } else if (pick.shieldSaved) {
                sounds.playShieldBreak();
                this.renderer.triggerShieldBreakEffect(quad.cx, quad.cy);
                this.renderer.addFloatingText(
                    this.renderer.width / 2,
                    quad.cy - 18,
                    `ESCUDO ABSORBIO MINA`,
                    '#00f0ff',
                    1.15
                );
            } else {
                sounds.playCrash();
                this.renderer.triggerCrashEffect(quad.cx, quad.cy);
            }
        });

        // Partial 50% Cashout event
        this.engine.onPartialCashout((bankedAmount) => {
            sounds.playPartialCashout();
            this.renderer.addFloatingText(
                this.renderer.width / 2,
                this.renderer.height * 0.44,
                `50% ASEGURADO // +${formatCurrency(bankedAmount)}`,
                '#ffc700',
                1.08
            );
        });

        // Full Cashout event
        this.engine.onCashout((payout) => {
            sounds.playCashout();
            this.renderer.addFloatingText(
                this.renderer.width / 2,
                this.renderer.height * 0.40,
                `COBRADO ${formatCurrency(payout)}`,
                '#00e701',
                1.2
            );
        });

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
