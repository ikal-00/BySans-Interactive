// Most of the effect logic is integrated into CanvasRenderer directly for simplicity.
// This module provides the central animation loop utility to drive the canvas.

import { CanvasRenderer } from './canvasView';
import { GameEngine, GameState } from '../game/engine';

export class RenderLoop {
    private renderer: CanvasRenderer;
    private engine: GameEngine;
    private rafId: number = 0;
    private isRunning: boolean = false;

    constructor(renderer: CanvasRenderer, engine: GameEngine) {
        this.renderer = renderer;
        this.engine = engine;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const loop = (time: number) => {
            this.update(time);
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

    private update(_time: number) {
        // Sync scroll target to engine state
        // When currentRow increments, scroll offset goes up by row height
        const rowHeight = 80; // Should match renderer config
        this.renderer.targetScrollOffset = (this.engine.currentRow - 1) * rowHeight;

        // Handle crash explosion
        if (this.engine.state === GameState.CRASHED && this.renderer.explosionParticles.length === 0 && this.renderer.screenShake === 0) {
            // Trigger explosion once per crash.
            // In a fuller implementation, we'd trigger exactly at the clicked lane.
            // For now, center trigger
            this.renderer.triggerExplosion(this.renderer.width / 2, this.renderer.height - 180 + this.renderer.scrollOffset - ((this.engine.currentRow - 1) * rowHeight));
        }
    }
}
