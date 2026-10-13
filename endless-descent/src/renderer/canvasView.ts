import { GameEngine, GameState } from '../game/engine';

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    // Virtual resolution (9:16)
    public width = 400;
    public height = 711;

    // Grid settings
    private lanes = 5;
    private rowHeight = 80;
    private visibleRows = 9;

    // Scrolling logic
    public scrollOffset = 0;
    public targetScrollOffset = 0;

    // Colors based on Stake palette
    private colors = {
        bg: '#1a2c38',
        gridLine: '#2f4553',
        safe: '#00e701',
        hazard: '#e9113c',
        ship: '#ffffff',
        card: '#213743'
    };

    // Effects triggers
    public explosionParticles: any[] = [];
    public screenShake = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context");
        this.ctx = ctx;

        // Setup internal resolution for sharp rendering on high DPI
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);

        // CSS dimensions
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    public getClickTarget(x: number, y: number): { row: number, lane: number } | null {
        // Map CSS coordinates to canvas virtual coordinates
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const cx = (x - rect.left) * scaleX;
        const cy = (y - rect.top) * scaleY;

        const laneWidth = this.width / this.lanes;
        const lane = Math.floor(cx / laneWidth);

        // Reverse calculate row based on scroll offset and cy
        // Drawing logic:
        // Active row is typically placed near the bottom-center
        const activeY = this.height - 120;
        const rowFromBottom = Math.floor((activeY - (cy - this.scrollOffset)) / this.rowHeight);

        // This is a rough estimation. For exact clicking, we'll map absolute coordinates.
        return { row: rowFromBottom, lane };
    }

    // Main render loop function
    public render(engine: GameEngine, _time: number) {
        // Clear background
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply Screen Shake
        this.ctx.save();
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }

        // Calculate scroll smoothing
        this.scrollOffset += (this.targetScrollOffset - this.scrollOffset) * 0.1;

        // Draw Grid Perspective
        this.drawGrid(engine);

        // Draw Particles
        this.drawParticles();

        this.ctx.restore();
    }

    private drawGrid(engine: GameEngine) {
        const laneWidth = this.width / this.lanes;

        // Draw vertical lines
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 2;
        for (let i = 1; i < this.lanes; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * laneWidth, 0);
            this.ctx.lineTo(i * laneWidth, this.height);
            this.ctx.stroke();
        }

        // Base rendering Y position for row 0 (start row)
        // We want the current action row to be at a fixed Y position (e.g. height - 200)
        // Row N is drawn at base Y - (N * rowHeight)
        // targetScrollOffset is updated externally based on engine.currentRow

        const baseY = this.height - 120 + this.scrollOffset;

        // Draw visible rows
        // We draw rows from max(0, currentRow - something) to currentRow + something
        const startRow = Math.max(0, engine.currentRow - 2);
        const endRow = engine.currentRow + this.visibleRows;

        for (let r = startRow; r <= endRow; r++) {
            const rowY = baseY - (r * this.rowHeight);

            // Draw horizontal line
            this.ctx.beginPath();
            this.ctx.moveTo(0, rowY);
            this.ctx.lineTo(this.width, rowY);
            this.ctx.strokeStyle = this.colors.gridLine;
            this.ctx.stroke();

            // Draw row contents
            for (let lane = 0; lane < this.lanes; lane++) {
                const laneX = lane * laneWidth;
                this.drawLaneItem(engine, r, lane, laneX, rowY, laneWidth);
            }
        }

        // Draw Ship at the current row position if not crashed
        if (engine.state !== GameState.CRASHED) {
            const shipY = baseY - ((engine.currentRow - 1) * this.rowHeight) - 40;
            const shipX = this.width / 2; // Fixed at center or moves to lane?
            // Usually, ship moves to selected lane. Let's trace it to the last selected lane if available.
            // But we don't store last lane in engine yet. For a simplified mockup, we center it.
            this.drawShip(shipX, shipY);
        }
    }

    private drawLaneItem(engine: GameEngine, row: number, lane: number, x: number, y: number, w: number) {
        const h = this.rowHeight;

        // For rows past the current action row (unrevealed)
        if (row >= engine.currentRow) {
             if (row === engine.currentRow && engine.state === GameState.PLAYING) {
                 // Draw mystery cards
                 this.ctx.fillStyle = this.colors.card;
                 this.ctx.fillRect(x + 10, y - h + 10, w - 20, h - 20);

                 this.ctx.strokeStyle = this.colors.gridLine;
                 this.ctx.strokeRect(x + 10, y - h + 10, w - 20, h - 20);

                 this.ctx.fillStyle = '#ffffff';
                 this.ctx.font = '24px Inter';
                 this.ctx.textAlign = 'center';
                 this.ctx.textBaseline = 'middle';
                 this.ctx.fillText('?', x + w/2, y - h/2);
             }
        } else if (row > 0 && row < engine.currentRow) {
             // Past rows (revealed)
             const hazards = engine.getHazardsForActionRow(row);
             const isHazard = hazards.includes(lane);

             if (isHazard) {
                 // In active game, unclicked hazards might not be shown unless crashed?
                 // Standard Mines shows safe picks only, until crash/cashout.
                 if (engine.state === GameState.CRASHED || engine.state === GameState.WON) {
                    this.drawHazard(x + w/2, y - h/2);
                 }
             } else {
                 // Only draw safe diamond if it was actually picked?
                 // For now, if we survived the row, we show all safes or just one.
                 // We don't track exact path in the engine, so let's draw safe diamonds everywhere it was safe
                 // OR we can just draw one if we tracked it.
                 // For visual flair let's draw diamonds on all safe lanes.
                 this.drawDiamond(x + w/2, y - h/2);
             }
        }
    }

    private drawDiamond(cx: number, cy: number) {
        this.ctx.fillStyle = this.colors.safe;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - 15);
        this.ctx.lineTo(cx + 15, cy);
        this.ctx.lineTo(cx, cy + 15);
        this.ctx.lineTo(cx - 15, cy);
        this.ctx.fill();
    }

    private drawHazard(cx: number, cy: number) {
        this.ctx.fillStyle = this.colors.hazard;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawShip(cx: number, cy: number) {
        // Wireframe ship
        this.ctx.strokeStyle = this.colors.ship;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - 20); // nose
        this.ctx.lineTo(cx + 15, cy + 15); // right wing
        this.ctx.lineTo(cx, cy + 5); // bottom center
        this.ctx.lineTo(cx - 15, cy + 15); // left wing
        this.ctx.closePath();
        this.ctx.stroke();
    }

    public triggerExplosion(x: number, y: number) {
        this.screenShake = 20;
        for (let i = 0; i < 30; i++) {
            this.explosionParticles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0
            });
        }
    }

    private drawParticles() {
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const p = this.explosionParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;

            if (p.life <= 0) {
                this.explosionParticles.splice(i, 1);
                continue;
            }

            this.ctx.strokeStyle = `rgba(233, 17, 60, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.vx, p.y + p.vy);
            this.ctx.stroke();
        }
    }
}
