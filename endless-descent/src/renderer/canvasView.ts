import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { calculateStepDelta } from '../math/multipliers';

interface Shard {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    rot: number;
    vRot: number;
    length: number;
    alpha: number;
    color: string;
}

interface FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    alpha: number;
    vy: number;
}

export class CanvasRenderer {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    // Virtual resolution (9:16 aspect ratio)
    public readonly width = 400;
    public readonly height = 711;

    // 3D Perspective Grid Settings
    private readonly horizonY = 110;     // Horizon vanishing point Y
    private readonly bottomTrackY = 660; // Track bottom Y on screen
    private readonly topTrackWidth = 140; // Track width near horizon
    private readonly bottomTrackWidth = 360; // Track width at bottom

    public hoverLane: number | null = null;

    // Smooth Camera / Descent tracking
    public cameraRow = 1;
    public targetCameraRow = 1;

    // Ship position interpolation
    public shipX = 200;
    public targetShipX = 200;
    public shipY = 460;
    public targetShipY = 460;
    public shipHoverAngle = 0;

    // Visual effects
    public screenShake = 0;
    public redFlashAlpha = 0;
    private shards: Shard[] = [];
    private floatingTexts: FloatingText[] = [];

    // Colors matching Stake Originals
    private readonly colors = {
        bg: '#0f212e',
        bgGradientBottom: '#142430',
        trackBg: 'rgba(26, 44, 56, 0.45)',
        gridLine: '#243b4a',
        gridLineSubtle: '#1b2f3d',
        cardBg: '#1a2c38',
        cardBorder: '#2f4553',
        cardActiveBorder: '#00e701',
        safeGreen: '#00e701',
        safeGreenGlow: 'rgba(0, 231, 1, 0.35)',
        dangerRed: '#e9113c',
        dangerRedGlow: 'rgba(233, 17, 60, 0.4)',
        shipWireframe: '#ffffff',
        shipGlow: 'rgba(0, 231, 1, 0.5)',
        textMuted: '#6e8b9f',
        white: '#ffffff'
    };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not acquire 2D context");
        this.ctx = ctx;

        this.setupDPI();
        window.addEventListener('resize', () => this.setupDPI());
    }

    public setupDPI() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Map normalized depth t in [0, 1] (0 = horizon, 1 = bottom screen) to screen Y
     */
    private depthToScreenY(t: number): number {
        // Perspective non-linear depth curve
        return this.horizonY + Math.pow(t, 1.45) * (this.bottomTrackY - this.horizonY);
    }

    /**
     * Get track horizontal span [leftX, rightX] at screen Y
     */
    private getTrackSpanAtY(y: number): { left: number; right: number; width: number } {
        const t = Math.max(0, Math.min(1, (y - this.horizonY) / (this.bottomTrackY - this.horizonY)));
        const trackWidth = this.topTrackWidth + t * (this.bottomTrackWidth - this.topTrackWidth);
        const centerX = this.width / 2;
        return {
            left: centerX - trackWidth / 2,
            right: centerX + trackWidth / 2,
            width: trackWidth
        };
    }

    /**
     * Get 2D quad boundaries for row r and lane (0..4)
     */
    public getCellQuad(row: number, lane: number): { x1: number; y1: number; x2: number; y2: number; w: number; h: number; cx: number; cy: number } {
        // Row placement relative to cameraRow:
        // Current active row (row = cameraRow) sits near bottom ~0.78 depth
        const rowDepthDelta = 0.115;
        const activeDepth = 0.82;
        const relativeRow = row - this.cameraRow;

        const bottomT = Math.max(0.01, Math.min(1.0, activeDepth - relativeRow * rowDepthDelta));
        const topT = Math.max(0.005, Math.min(1.0, bottomT - rowDepthDelta * 0.92));

        const yBottom = this.depthToScreenY(bottomT);
        const yTop = this.depthToScreenY(topT);

        const spanBottom = this.getTrackSpanAtY(yBottom);
        const spanTop = this.getTrackSpanAtY(yTop);

        const laneWBottom = spanBottom.width / 5;
        const laneWTop = spanTop.width / 5;

        const xLeftBottom = spanBottom.left + lane * laneWBottom;
        const xLeftTop = spanTop.left + lane * laneWTop;

        const cx = (xLeftBottom + laneWBottom / 2 + xLeftTop + laneWTop / 2) / 2;
        const cy = (yTop + yBottom) / 2;

        return {
            x1: xLeftTop,
            y1: yTop,
            x2: xLeftBottom + laneWBottom,
            y2: yBottom,
            w: (laneWBottom + laneWTop) / 2,
            h: yBottom - yTop,
            cx,
            cy
        };
    }

    /**
     * Detect click target on active row
     */
    public getClickTarget(clientX: number, clientY: number, activeRow: number): { row: number; lane: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const cx = (clientX - rect.left) * scaleX;
        const cy = (clientY - rect.top) * scaleY;

        for (let l = 0; l < 5; l++) {
            const quad = this.getCellQuad(activeRow, l);
            // Generous hit box around the quad for easy tapping on mobile
            const padX = quad.w * 0.15;
            const padY = quad.h * 0.2;
            if (cx >= quad.x1 - padX && cx <= quad.x2 + padX && cy >= quad.y1 - padY && cy <= quad.y2 + padY) {
                return { row: activeRow, lane: l };
            }
        }
        return null;
    }

    public updateHover(clientX: number, clientY: number, activeRow: number) {
        const target = this.getClickTarget(clientX, clientY, activeRow);
        this.hoverLane = target ? target.lane : null;
    }

    public clearHover() {
        this.hoverLane = null;
    }

    public triggerScreenShake(intensity = 16) {
        this.screenShake = intensity;
    }

    public triggerCrashEffect(cx: number, cy: number) {
        this.screenShake = 22;
        this.redFlashAlpha = 0.45;

        // Spawn 3D wireframe shards
        const shardColors = ['#ffffff', '#e9113c', '#ff4d6d', '#ffffff', '#e9113c'];
        for (let i = 0; i < 36; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 9;
            this.shards.push({
                x: cx,
                y: cy,
                z: Math.random() * 10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                vz: (Math.random() - 0.5) * 5,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.4,
                length: 8 + Math.random() * 14,
                alpha: 1.0,
                color: shardColors[i % shardColors.length]
            });
        }
    }

    public addFloatingText(x: number, y: number, text: string, color = '#00e701') {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -1.2
        });
    }

    /**
     * Master render frame called at 60 FPS
     */
    public render(engine: GameEngine, time: number) {
        this.ctx.save();

        // Screen Shake offset
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
            this.screenShake *= 0.88;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // Draw background
        this.drawBackground();

        // Smooth camera scroll towards target
        this.targetCameraRow = engine.state === GameState.IDLE ? 1 : Math.max(1, engine.currentRow);
        this.cameraRow += (this.targetCameraRow - this.cameraRow) * 0.12;

        // Draw 3D Perspective Track
        this.drawPerspectiveTrack(engine);

        // Draw Player Wireframe Ship
        this.drawShip(engine, time);

        // Draw Particles & Shards
        this.drawShards();

        // Draw Floating texts
        this.drawFloatingTexts();

        // Red Crash Flash
        if (this.redFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(233, 17, 60, ${this.redFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.redFlashAlpha *= 0.88;
            if (this.redFlashAlpha < 0.01) this.redFlashAlpha = 0;
        }

        this.ctx.restore();
    }

    private drawBackground() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#0a1620');
        grad.addColorStop(0.3, this.colors.bg);
        grad.addColorStop(1, this.colors.bgGradientBottom);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Subtle horizon aura glow
        const horizonGrad = this.ctx.createRadialGradient(
            this.width / 2, this.horizonY, 10,
            this.width / 2, this.horizonY, 220
        );
        horizonGrad.addColorStop(0, 'rgba(0, 231, 1, 0.04)');
        horizonGrad.addColorStop(0.5, 'rgba(33, 55, 67, 0.15)');
        horizonGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = horizonGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private drawPerspectiveTrack(engine: GameEngine) {
        const topSpan = this.getTrackSpanAtY(this.horizonY);
        const bottomSpan = this.getTrackSpanAtY(this.bottomTrackY);

        // Track bed fill
        this.ctx.fillStyle = this.colors.trackBg;
        this.ctx.beginPath();
        this.ctx.moveTo(topSpan.left, this.horizonY);
        this.ctx.lineTo(topSpan.right, this.horizonY);
        this.ctx.lineTo(bottomSpan.right, this.bottomTrackY);
        this.ctx.lineTo(bottomSpan.left, this.bottomTrackY);
        this.ctx.closePath();
        this.ctx.fill();

        // 6 Longitudinal perspective dividing lines
        for (let i = 0; i <= 5; i++) {
            const topX = topSpan.left + (i * topSpan.width) / 5;
            const bottomX = bottomSpan.left + (i * bottomSpan.width) / 5;

            const isOuter = i === 0 || i === 5;
            this.ctx.strokeStyle = isOuter ? '#355368' : this.colors.gridLine;
            this.ctx.lineWidth = isOuter ? 2.5 : 1.2;

            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.horizonY);
            this.ctx.lineTo(bottomX, this.bottomTrackY);
            this.ctx.stroke();
        }

        // Draw visible rows (from cameraRow - 3 up to cameraRow + 7)
        const minRow = Math.max(1, Math.floor(this.cameraRow - 2));
        const maxRow = Math.ceil(this.cameraRow + 6);

        for (let r = maxRow; r >= minRow; r--) {
            this.drawRow(engine, r);
        }
    }

    private drawRow(engine: GameEngine, row: number) {
        const yTop = this.depthToScreenY(Math.max(0.01, 0.82 - (row - this.cameraRow) * 0.115 - 0.115 * 0.92));
        const yBottom = this.depthToScreenY(Math.max(0.01, 0.82 - (row - this.cameraRow) * 0.115));

        if (yTop < this.horizonY - 10 || yBottom > this.bottomTrackY + 40) return;

        const spanBottom = this.getTrackSpanAtY(yBottom);

        // Row dividing horizontal line
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spanBottom.left, yBottom);
        this.ctx.lineTo(spanBottom.right, yBottom);
        this.ctx.stroke();

        // Row text label on left side ("FILA 07", "FILA 08", etc.)
        const fontSize = Math.max(8, Math.min(11, 10 * (spanBottom.width / this.bottomTrackWidth)));
        this.ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        this.ctx.fillStyle = row === engine.currentRow && engine.state === GameState.PLAYING ? '#00e701' : this.colors.textMuted;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`FILA ${row.toString().padStart(2, '0')}`, spanBottom.left - 8, (yTop + yBottom) / 2);

        // Draw cells for lanes 0..4
        for (let lane = 0; lane < 5; lane++) {
            this.drawCell(engine, row, lane);
        }
    }

    private drawCell(engine: GameEngine, row: number, lane: number) {
        const quad = this.getCellQuad(row, lane);
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isPastRow = row < engine.currentRow;
        const isCrashedRow = row === engine.lastCrashedRow && engine.state === GameState.CRASHED;

        // 1. ACTIVE ROW: 5 minimalist mystery cards with "?"
        if (isActiveRow) {
            const isHovered = this.hoverLane === lane;
            const insetX = quad.w * 0.08;
            const insetY = quad.h * 0.08;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;
            const radius = Math.min(8, cardW * 0.15);

            // Card background
            this.ctx.fillStyle = isHovered ? '#263e4f' : this.colors.cardBg;
            this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

            // Card border (glowing if hovered)
            this.ctx.strokeStyle = isHovered ? this.colors.cardActiveBorder : this.colors.cardBorder;
            this.ctx.lineWidth = isHovered ? 2.5 : 1.5;
            this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

            // Question mark "?"
            const fontSize = Math.max(12, Math.round(cardH * 0.45));
            this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            this.ctx.fillStyle = isHovered ? '#ffffff' : '#6f8d9f';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', quad.cx, quad.cy);
        }
        // 2. PAST CLEARED ROWS
        else if (isPastRow) {
            const hazards = engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const pick = engine.currentPicks.find((p) => p.row === row);
            const isPicked = pick && pick.lane === lane;

            if (isPicked || !isHazard) {
                // Flat green geometric diamond marker with step delta
                this.drawDiamond(quad.cx, quad.cy - 6, quad.w * 0.28);
                const delta = calculateStepDelta(row, engine.minesCount);
                const fontSize = Math.max(8, Math.round(quad.h * 0.24));
                this.ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = '#00e701';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`+${delta.toFixed(1)}x`, quad.cx, quad.cy + quad.w * 0.16);
            }
        }
        // 3. CRASHED ROW REVEAL
        else if (isCrashedRow) {
            const hazards = engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const wasPicked = engine.lastCrashedLane === lane;

            if (isHazard) {
                this.drawHazard(quad.cx, quad.cy, quad.w * 0.32, wasPicked);
            } else {
                this.drawDiamond(quad.cx, quad.cy, quad.w * 0.26);
            }
        }
        // 4. FUTURE ROWS (Ahead of player)
        else {
            // Subtle card silhouette outline
            const insetX = quad.w * 0.1;
            const insetY = quad.h * 0.1;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;

            this.ctx.fillStyle = 'rgba(26, 44, 56, 0.4)';
            this.roundRect(cardX, cardY, cardW, cardH, 4, true, false);

            this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.5)';
            this.ctx.lineWidth = 1;
            this.roundRect(cardX, cardY, cardW, cardH, 4, false, true);

            const fontSize = Math.max(9, Math.round(cardH * 0.35));
            this.ctx.font = `500 ${fontSize}px Inter, sans-serif`;
            this.ctx.fillStyle = 'rgba(110, 139, 159, 0.35)';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', quad.cx, quad.cy);
        }
    }

    private drawDiamond(cx: number, cy: number, size: number) {
        this.ctx.save();

        // Outer glow
        this.ctx.shadowColor = this.colors.safeGreen;
        this.ctx.shadowBlur = size * 0.7;

        // Faceted diamond shape
        this.ctx.fillStyle = this.colors.safeGreen;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx + size, cy);
        this.ctx.lineTo(cx, cy + size);
        this.ctx.lineTo(cx - size, cy);
        this.ctx.closePath();
        this.ctx.fill();

        // Inner bright facet reflection
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#9effa2';
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size * 0.6);
        this.ctx.lineTo(cx + size * 0.4, cy);
        this.ctx.lineTo(cx, cy + size * 0.2);
        this.ctx.lineTo(cx - size * 0.4, cy);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    private drawHazard(cx: number, cy: number, radius: number, isDirectTrigger: boolean) {
        this.ctx.save();

        if (isDirectTrigger) {
            this.ctx.shadowColor = this.colors.dangerRed;
            this.ctx.shadowBlur = radius * 1.2;
        }

        // Red circular core
        this.ctx.fillStyle = this.colors.dangerRed;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner skull or hazard cross
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = Math.max(2, radius * 0.22);
        const crossSize = radius * 0.55;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - crossSize, cy - crossSize);
        this.ctx.lineTo(cx + crossSize, cy + crossSize);
        this.ctx.moveTo(cx + crossSize, cy - crossSize);
        this.ctx.lineTo(cx - crossSize, cy + crossSize);
        this.ctx.stroke();

        this.ctx.restore();
    }

    private drawShip(engine: GameEngine, time: number) {
        if (engine.state === GameState.CRASHED) return;

        // Target lane: last chosen lane or center lane (2)
        const currentTargetRow = engine.state === GameState.PLAYING ? engine.currentRow - 1 : 0;
        const targetRow = Math.max(0, currentTargetRow);
        const quad = this.getCellQuad(targetRow, engine.lastChosenLane);

        this.targetShipX = quad.cx;
        this.targetShipY = quad.cy;

        // Smooth 60 FPS interpolation
        this.shipX += (this.targetShipX - this.shipX) * 0.16;
        this.shipY += (this.targetShipY - this.shipY) * 0.16;

        // Subtle floating / bobbing
        const hoverOffset = Math.sin(time * 0.004) * 2.5;
        const shipActualY = this.shipY + hoverOffset;

        this.ctx.save();
        this.ctx.translate(this.shipX, shipActualY);

        // Scale ship according to perspective depth at current Y
        const scale = 0.8 + 0.35 * ((shipActualY - this.horizonY) / (this.bottomTrackY - this.horizonY));
        this.ctx.scale(scale, scale);

        // Subtle engine glow
        this.ctx.shadowColor = this.colors.safeGreen;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'rgba(0, 231, 1, 0.45)';
        this.ctx.beginPath();
        this.ctx.arc(0, 16, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // 3D Wireframe Spaceship lines (matching Stake wireframe 3D aesthetic)
        this.ctx.strokeStyle = this.colors.shipWireframe;
        this.ctx.lineWidth = 1.6;

        // Main hull wireframe
        this.ctx.beginPath();
        this.ctx.moveTo(0, -22);    // Nose
        this.ctx.lineTo(16, 14);    // Right wingtip
        this.ctx.lineTo(7, 10);     // Right engine joint
        this.ctx.lineTo(0, 6);      // Center fuselage
        this.ctx.lineTo(-7, 10);    // Left engine joint
        this.ctx.lineTo(-16, 14);   // Left wingtip
        this.ctx.closePath();
        this.ctx.stroke();

        // Internal facets / canopy ridge
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        this.ctx.lineWidth = 1.2;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -22); // Nose to cockpit ridge
        this.ctx.lineTo(0, 6);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, -10); // Cockpit horizontal facet
        this.ctx.lineTo(10, 8);
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(-10, 8);
        this.ctx.stroke();

        // Wing ridge ribs
        this.ctx.beginPath();
        this.ctx.moveTo(0, -4);
        this.ctx.lineTo(16, 14);
        this.ctx.moveTo(0, -4);
        this.ctx.lineTo(-16, 14);
        this.ctx.stroke();

        this.ctx.restore();
    }

    private drawShards() {
        for (let i = this.shards.length - 1; i >= 0; i--) {
            const s = this.shards[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.22; // Gravity
            s.rot += s.vRot;
            s.alpha -= 0.022;

            if (s.alpha <= 0) {
                this.shards.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.rot);
            this.ctx.strokeStyle = s.color;
            this.ctx.globalAlpha = Math.max(0, s.alpha);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(-s.length / 2, 0);
            this.ctx.lineTo(s.length / 2, 0);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    private drawFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.02;

            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.font = 'bold 15px Inter, sans-serif';
            this.ctx.fillStyle = ft.color;
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = ft.color;
            this.ctx.shadowBlur = 6;
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        }
    }

    private roundRect(x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
        if (fill) this.ctx.fill();
        if (stroke) this.ctx.stroke();
    }
}
