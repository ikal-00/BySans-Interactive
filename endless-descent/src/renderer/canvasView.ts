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
    scale?: number;
}

interface ShockwaveRing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
}

interface AlienUfoAttack {
    active: boolean;
    progress: number; // 0 to 1
    ufoX: number;
    ufoY: number;
    targetX: number;
    targetYTop: number;
    targetYBottom: number;
}

export class CanvasRenderer {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    // Virtual resolution (9:16 aspect ratio)
    public readonly width = 400;
    public readonly height = 711;

    // 3D Perspective Grid Settings
    private readonly horizonY = 108;
    private readonly bottomTrackY = 640;
    private readonly topTrackWidth = 140;
    private readonly bottomTrackWidth = 360;

    public hoverLane: number | null = null;

    // Smooth Camera / Descent tracking
    public cameraRow = 1;
    public targetCameraRow = 1;

    // Ship position interpolation
    public shipX = 200;
    public targetShipX = 200;
    public shipY = 460;
    public targetShipY = 460;

    // Visual effects
    public screenShake = 0;
    public redFlashAlpha = 0;
    public cyanFlashAlpha = 0;
    public goldFlashAlpha = 0;
    private shards: Shard[] = [];
    private floatingTexts: FloatingText[] = [];
    private shockwaves: ShockwaveRing[] = [];
    private alienAttack: AlienUfoAttack = {
        active: false,
        progress: 0,
        ufoX: 200,
        ufoY: 60,
        targetX: 200,
        targetYTop: 220,
        targetYBottom: 440
    };

    private readonly colors = {
        bg: '#0f212e',
        bgGradientBottom: '#142430',
        trackBg: 'rgba(26, 44, 56, 0.45)',
        gridLine: '#243b4a',
        cardBg: '#1a2c38',
        cardBorder: '#2f4553',
        cardActiveBorder: '#00e701',
        safeGreen: '#00e701',
        gold: '#ffb800',
        goldBright: '#ffe680',
        alienCyan: '#00f0ff',
        alienPurple: '#a855f7',
        dangerRed: '#e9113c',
        shipWireframe: '#ffffff',
        textMuted: '#6e8b9f',
        white: '#ffffff'
    };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not acquire 2D context');
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

    private depthToScreenY(t: number): number {
        return this.horizonY + Math.pow(t, 1.45) * (this.bottomTrackY - this.horizonY);
    }

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

    public getCellQuad(row: number, lane: number): {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        w: number;
        h: number;
        cx: number;
        cy: number;
    } {
        const rowDepthDelta = 0.115;
        const activeDepth = 0.80;
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

    public getClickTarget(clientX: number, clientY: number, activeRow: number): { row: number; lane: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const cx = (clientX - rect.left) * scaleX;
        const cy = (clientY - rect.top) * scaleY;

        for (let l = 0; l < 5; l++) {
            const quad = this.getCellQuad(activeRow, l);
            const padX = quad.w * 0.15;
            const padY = quad.h * 0.25;
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

    public triggerCrashEffect(cx: number, cy: number) {
        this.screenShake = 22;
        this.redFlashAlpha = 0.45;

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

    public triggerGoldenBurst(cx: number, cy: number) {
        this.screenShake = 8;
        this.goldFlashAlpha = 0.22;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 6,
            maxRadius: 85,
            color: '#ffb800',
            alpha: 1.0
        });

        const goldColors = ['#ffb800', '#ffe680', '#ffffff', '#ff9900'];
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            this.shards.push({
                x: cx,
                y: cy,
                z: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                vz: 0,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 6 + Math.random() * 10,
                alpha: 1.0,
                color: goldColors[i % goldColors.length]
            });
        }
    }

    public triggerShieldBreakEffect(cx: number, cy: number) {
        this.screenShake = 14;
        this.cyanFlashAlpha = 0.32;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: 110,
            color: '#00f0ff',
            alpha: 1.0
        });

        const shieldColors = ['#00f0ff', '#ffffff', '#38bdf8'];
        for (let i = 0; i < 28; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3.5 + Math.random() * 7;
            this.shards.push({
                x: cx,
                y: cy,
                z: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: 0,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 7 + Math.random() * 12,
                alpha: 1.0,
                color: shieldColors[i % shieldColors.length]
            });
        }
    }

    /**
     * Launches the 3D Wireframe Alien UFO Spaceship that flies in and vaporizes 2 rows!
     */
    public triggerAlienUfoAttack(cx: number, cy: number) {
        this.screenShake = 15;
        this.cyanFlashAlpha = 0.28;

        this.alienAttack = {
            active: true,
            progress: 0,
            ufoX: 40,
            ufoY: 115,
            targetX: cx,
            targetYTop: 180,
            targetYBottom: cy
        };

        this.shockwaves.push({
            x: cx,
            y: (180 + cy) / 2,
            radius: 12,
            maxRadius: 130,
            color: '#00f0ff',
            alpha: 1.0
        });

        // Spawn alien plasma bursts across the track
        const alienColors = ['#00f0ff', '#00e701', '#a855f7', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.shards.push({
                x: this.width / 2 + (Math.random() - 0.5) * 180,
                y: 220 + Math.random() * 200,
                z: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: 0,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.4,
                length: 8 + Math.random() * 14,
                alpha: 1.0,
                color: alienColors[i % alienColors.length]
            });
        }
    }

    public addFloatingText(x: number, y: number, text: string, color = '#00e701', scale = 1.0) {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -1.25,
            scale
        });
    }

    public render(engine: GameEngine, time: number) {
        this.ctx.save();

        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
            this.screenShake *= 0.88;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        this.drawBackground(engine);

        this.targetCameraRow = engine.state === GameState.IDLE ? 1 : Math.max(1, engine.currentRow);
        this.cameraRow += (this.targetCameraRow - this.cameraRow) * 0.12;

        this.drawPerspectiveTrack(engine, time);
        this.drawShip(engine, time);
        this.drawAlienUfoEvent(time);
        this.drawShockwaves();
        this.drawShards();
        this.drawFloatingTexts();

        // Screen flashes
        if (this.redFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(233, 17, 60, ${this.redFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.redFlashAlpha *= 0.88;
            if (this.redFlashAlpha < 0.01) this.redFlashAlpha = 0;
        }
        if (this.cyanFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(0, 240, 255, ${this.cyanFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.cyanFlashAlpha *= 0.88;
            if (this.cyanFlashAlpha < 0.01) this.cyanFlashAlpha = 0;
        }
        if (this.goldFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(255, 184, 0, ${this.goldFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.goldFlashAlpha *= 0.88;
            if (this.goldFlashAlpha < 0.01) this.goldFlashAlpha = 0;
        }

        this.ctx.restore();
    }

    private drawBackground(engine: GameEngine) {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#0a1620');
        grad.addColorStop(0.3, this.colors.bg);
        grad.addColorStop(1, this.colors.bgGradientBottom);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const horizonGrad = this.ctx.createRadialGradient(
            this.width / 2,
            this.horizonY,
            10,
            this.width / 2,
            this.horizonY,
            230
        );
        if (engine.luckyBoost) {
            horizonGrad.addColorStop(0, 'rgba(255, 184, 0, 0.12)');
            horizonGrad.addColorStop(0.5, 'rgba(0, 231, 1, 0.06)');
        } else {
            horizonGrad.addColorStop(0, 'rgba(0, 231, 1, 0.05)');
            horizonGrad.addColorStop(0.5, 'rgba(33, 55, 67, 0.15)');
        }
        horizonGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = horizonGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private drawPerspectiveTrack(engine: GameEngine, time: number) {
        const topSpan = this.getTrackSpanAtY(this.horizonY);
        const bottomSpan = this.getTrackSpanAtY(this.bottomTrackY);

        this.ctx.fillStyle = this.colors.trackBg;
        this.ctx.beginPath();
        this.ctx.moveTo(topSpan.left, this.horizonY);
        this.ctx.lineTo(topSpan.right, this.horizonY);
        this.ctx.lineTo(bottomSpan.right, this.bottomTrackY);
        this.ctx.lineTo(bottomSpan.left, this.bottomTrackY);
        this.ctx.closePath();
        this.ctx.fill();

        for (let i = 0; i <= 5; i++) {
            const topX = topSpan.left + (i * topSpan.width) / 5;
            const bottomX = bottomSpan.left + (i * bottomSpan.width) / 5;

            const isOuter = i === 0 || i === 5;
            this.ctx.strokeStyle = isOuter ? (engine.luckyBoost ? '#665224' : '#355368') : this.colors.gridLine;
            this.ctx.lineWidth = isOuter ? 2.5 : 1.2;

            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.horizonY);
            this.ctx.lineTo(bottomX, this.bottomTrackY);
            this.ctx.stroke();
        }

        const minRow = Math.max(1, Math.floor(this.cameraRow - 2));
        const maxRow = Math.ceil(this.cameraRow + 6);

        for (let r = maxRow; r >= minRow; r--) {
            this.drawRow(engine, r, time);
        }
    }

    private drawRow(engine: GameEngine, row: number, time: number) {
        const yTop = this.depthToScreenY(Math.max(0.01, 0.80 - (row - this.cameraRow) * 0.115 - 0.115 * 0.92));
        const yBottom = this.depthToScreenY(Math.max(0.01, 0.80 - (row - this.cameraRow) * 0.115));

        if (yTop < this.horizonY - 10 || yBottom > this.bottomTrackY + 40) return;

        const spanBottom = this.getTrackSpanAtY(yBottom);

        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spanBottom.left, yBottom);
        this.ctx.lineTo(spanBottom.right, yBottom);
        this.ctx.stroke();

        const fontSize = Math.max(8, Math.min(11, 10 * (spanBottom.width / this.bottomTrackWidth)));
        this.ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        const isDestroyedByAlien = engine.alienDestroyedRows.has(row);
        this.ctx.fillStyle = isDestroyedByAlien
            ? this.colors.alienCyan
            : row === engine.currentRow && engine.state === GameState.PLAYING
              ? '#00e701'
              : this.colors.textMuted;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`FILA ${row.toString().padStart(2, '0')}`, spanBottom.left - 8, (yTop + yBottom) / 2);

        for (let lane = 0; lane < 5; lane++) {
            this.drawCell(engine, row, lane, time);
        }
    }

    private drawCell(engine: GameEngine, row: number, lane: number, time: number) {
        const quad = this.getCellQuad(row, lane);
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isPastRow = row < engine.currentRow;
        const isCrashedRow = row === engine.lastCrashedRow && engine.state === GameState.CRASHED;
        const specials = engine.getSpecialsForRow(row);
        const isGoldenLane = specials.goldenLane === lane;
        const isAlienLane = specials.alienLane === lane;

        // 1. ACTIVE ROW
        if (isActiveRow) {
            const isHovered = this.hoverLane === lane;
            const insetX = quad.w * 0.08;
            const insetY = quad.h * 0.08;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;
            const radius = Math.min(8, cardW * 0.15);

            if (isGoldenLane) {
                // GOLDEN CARD (★ 2x / 3x)
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.008);
                this.ctx.save();
                this.ctx.shadowColor = this.colors.gold;
                this.ctx.shadowBlur = isHovered ? 14 : 6 + pulse * 5;
                this.ctx.fillStyle = isHovered ? 'rgba(255, 184, 0, 0.30)' : 'rgba(255, 184, 0, 0.16)';
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.strokeStyle = isHovered ? this.colors.goldBright : this.colors.gold;
                this.ctx.lineWidth = isHovered ? 2.6 : 1.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);
                this.ctx.restore();

                // Top Boost Pill
                const badgeFont = Math.max(8, Math.round(cardH * 0.22));
                this.ctx.font = `900 ${badgeFont}px Inter, sans-serif`;
                this.ctx.fillStyle = this.colors.goldBright;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`★ ${specials.goldenBoost}x`, quad.cx, cardY + 3);

                // Center symbol
                const mainFont = Math.max(12, Math.round(cardH * 0.38));
                this.ctx.font = `bold ${mainFont}px Inter, sans-serif`;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', quad.cx, quad.cy + 5);
            } else if (isAlienLane) {
                // ALIEN UFO BEACON CARD (👽 +2 FILAS)
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.009);
                this.ctx.save();
                this.ctx.shadowColor = this.colors.alienCyan;
                this.ctx.shadowBlur = isHovered ? 14 : 6 + pulse * 5;
                this.ctx.fillStyle = isHovered ? 'rgba(0, 240, 255, 0.25)' : 'rgba(168, 85, 247, 0.16)';
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.strokeStyle = isHovered ? '#ffffff' : this.colors.alienCyan;
                this.ctx.lineWidth = isHovered ? 2.6 : 1.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);
                this.ctx.restore();

                const badgeFont = Math.max(7, Math.round(cardH * 0.20));
                this.ctx.font = `900 ${badgeFont}px Inter, sans-serif`;
                this.ctx.fillStyle = this.colors.alienCyan;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`OVNI +2F`, quad.cx, cardY + 3);

                const mainFont = Math.max(12, Math.round(cardH * 0.38));
                this.ctx.font = `bold ${mainFont}px Inter, sans-serif`;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('👽', quad.cx, quad.cy + 5);
            } else {
                // NORMAL MYSTERY CARD
                this.ctx.fillStyle = isHovered ? '#263e4f' : this.colors.cardBg;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.strokeStyle = isHovered ? this.colors.cardActiveBorder : this.colors.cardBorder;
                this.ctx.lineWidth = isHovered ? 2.5 : 1.5;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                const fontSize = Math.max(12, Math.round(cardH * 0.45));
                this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = isHovered ? '#ffffff' : '#6f8d9f';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', quad.cx, quad.cy);
            }
        }
        // 2. PAST CLEARED ROWS
        else if (isPastRow) {
            if (engine.alienDestroyedRows.has(row)) {
                // Vaporized by Alien UFO!
                this.drawDiamond(quad.cx, quad.cy - 4, quad.w * 0.24, this.colors.alienCyan, '#b8fbff');
                if (lane === 2) {
                    const fontSize = Math.max(8, Math.round(quad.h * 0.23));
                    this.ctx.font = `800 ${fontSize}px Inter, sans-serif`;
                    this.ctx.fillStyle = this.colors.alienCyan;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'top';
                    this.ctx.fillText('👽 OVNI LASER', quad.cx, quad.cy + quad.w * 0.14);
                }
                return;
            }

            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const isPicked = pick && pick.lane === lane;

            if (isPicked && pick.shieldSaved) {
                // Shield absorbed a mine on this lane!
                this.drawDiamond(quad.cx, quad.cy - 4, quad.w * 0.26, this.colors.alienCyan, '#ffffff');
                const fontSize = Math.max(8, Math.round(quad.h * 0.22));
                this.ctx.font = `800 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = this.colors.alienCyan;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText('🛡️ SALVADO', quad.cx, quad.cy + quad.w * 0.15);
            } else if (isPicked && pick.specialType === 'GOLDEN') {
                this.drawDiamond(quad.cx, quad.cy - 6, quad.w * 0.30, this.colors.gold, this.colors.goldBright);
                const fontSize = Math.max(8, Math.round(quad.h * 0.25));
                this.ctx.font = `800 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = this.colors.goldBright;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`★ ${pick.boostApplied}x`, quad.cx, quad.cy + quad.w * 0.16);
            } else if (isPicked && pick.specialType === 'ALIEN') {
                this.drawDiamond(quad.cx, quad.cy - 6, quad.w * 0.30, this.colors.alienCyan, '#ffffff');
                const fontSize = Math.max(8, Math.round(quad.h * 0.25));
                this.ctx.font = `800 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = this.colors.alienCyan;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`👽 +2F`, quad.cx, quad.cy + quad.w * 0.16);
            } else if (isPicked || !isHazard) {
                this.drawDiamond(quad.cx, quad.cy - 6, quad.w * 0.26, this.colors.safeGreen, '#9effa2');
                const delta = calculateStepDelta(row, engine.minesCount);
                const fontSize = Math.max(8, Math.round(quad.h * 0.23));
                this.ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = '#00e701';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(`+${delta.toFixed(1)}x`, quad.cx, quad.cy + quad.w * 0.16);
            }
        }
        // 3. CRASHED ROW REVEAL
        else if (isCrashedRow) {
            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const wasPicked = engine.lastCrashedLane === lane;

            if (isHazard) {
                this.drawHazard(quad.cx, quad.cy, quad.w * 0.32, wasPicked);
            } else {
                this.drawDiamond(quad.cx, quad.cy, quad.w * 0.25, this.colors.safeGreen, '#9effa2');
            }
        }
        // 4. FUTURE ROWS (Preview upcoming Golden & Alien cards!)
        else {
            const insetX = quad.w * 0.1;
            const insetY = quad.h * 0.1;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;

            if (isGoldenLane && engine.state === GameState.PLAYING) {
                this.ctx.fillStyle = 'rgba(255, 184, 0, 0.10)';
                this.roundRect(cardX, cardY, cardW, cardH, 4, true, false);
                this.ctx.strokeStyle = 'rgba(255, 184, 0, 0.55)';
                this.ctx.lineWidth = 1.2;
                this.roundRect(cardX, cardY, cardW, cardH, 4, false, true);

                const fontSize = Math.max(8, Math.round(cardH * 0.32));
                this.ctx.font = `700 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.75)';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`★${specials.goldenBoost}x`, quad.cx, quad.cy);
            } else if (isAlienLane && engine.state === GameState.PLAYING) {
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.09)';
                this.roundRect(cardX, cardY, cardW, cardH, 4, true, false);
                this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
                this.ctx.lineWidth = 1.2;
                this.roundRect(cardX, cardY, cardW, cardH, 4, false, true);

                const fontSize = Math.max(8, Math.round(cardH * 0.32));
                this.ctx.font = `700 ${fontSize}px Inter, sans-serif`;
                this.ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('👽', quad.cx, quad.cy);
            } else {
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
    }

    private drawDiamond(cx: number, cy: number, size: number, mainColor: string, facetColor: string) {
        this.ctx.save();
        this.ctx.shadowColor = mainColor;
        this.ctx.shadowBlur = size * 0.7;

        this.ctx.fillStyle = mainColor;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx + size, cy);
        this.ctx.lineTo(cx, cy + size);
        this.ctx.lineTo(cx - size, cy);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = facetColor;
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

        this.ctx.fillStyle = this.colors.dangerRed;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

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

        const currentTargetRow = engine.state === GameState.PLAYING ? engine.currentRow - 1 : 0;
        const targetRow = Math.max(0, currentTargetRow);
        const quad = this.getCellQuad(targetRow, engine.lastChosenLane);

        this.targetShipX = quad.cx;
        this.targetShipY = quad.cy;

        this.shipX += (this.targetShipX - this.shipX) * 0.16;
        this.shipY += (this.targetShipY - this.shipY) * 0.16;

        const hoverOffset = Math.sin(time * 0.004) * 2.5;
        const shipActualY = this.shipY + hoverOffset;

        this.ctx.save();
        this.ctx.translate(this.shipX, shipActualY);

        const scale = 0.8 + 0.35 * ((shipActualY - this.horizonY) / (this.bottomTrackY - this.horizonY));
        this.ctx.scale(scale, scale);

        // If Energy Shield is active, draw rotating 3D hexagonal cyan forcefield!
        if (engine.hasActiveShield || (engine.state !== GameState.PLAYING && engine.shieldPurchased)) {
            this.ctx.save();
            this.ctx.rotate(time * 0.002);
            this.ctx.strokeStyle = this.colors.alienCyan;
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.10)';
            this.ctx.lineWidth = 1.6;
            this.ctx.shadowColor = this.colors.alienCyan;
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            const r = 24;
            for (let i = 0; i < 6; i++) {
                const ang = (i * Math.PI) / 3;
                const px = Math.cos(ang) * r;
                const py = Math.sin(ang) * r;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Engine glow
        this.ctx.shadowColor = engine.luckyBoost ? this.colors.gold : this.colors.safeGreen;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = engine.luckyBoost ? 'rgba(255, 184, 0, 0.55)' : 'rgba(0, 231, 1, 0.45)';
        this.ctx.beginPath();
        this.ctx.arc(0, 16, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // 3D Wireframe Spaceship lines
        this.ctx.strokeStyle = engine.luckyBoost ? this.colors.goldBright : this.colors.shipWireframe;
        this.ctx.lineWidth = 1.6;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -22);
        this.ctx.lineTo(16, 14);
        this.ctx.lineTo(7, 10);
        this.ctx.lineTo(0, 6);
        this.ctx.lineTo(-7, 10);
        this.ctx.lineTo(-16, 14);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        this.ctx.lineWidth = 1.2;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -22);
        this.ctx.lineTo(0, 6);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(10, 8);
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(-10, 8);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, -4);
        this.ctx.lineTo(16, 14);
        this.ctx.moveTo(0, -4);
        this.ctx.lineTo(-16, 14);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Renders the 3D Wireframe Alien UFO Spaceship and its vertical Plasma Beam destroying 2 rows!
     */
    private drawAlienUfoEvent(time: number) {
        if (!this.alienAttack.active) return;

        this.alienAttack.progress += 0.022;
        if (this.alienAttack.progress >= 1.0) {
            this.alienAttack.active = false;
            return;
        }

        const p = this.alienAttack.progress;
        // Smooth arc across the top of the track, hovering over the target lane
        const hoverX =
            p < 0.25
                ? 40 + (this.alienAttack.targetX - 40) * (p / 0.25)
                : p < 0.75
                  ? this.alienAttack.targetX + Math.sin(p * 20) * 14
                  : this.alienAttack.targetX + (380 - this.alienAttack.targetX) * ((p - 0.75) / 0.25);
        const hoverY = 135 + Math.sin(p * Math.PI) * 18;

        this.ctx.save();

        // 1. Draw Plasma Laser Beam during middle phase (0.15 < p < 0.85)
        if (p > 0.15 && p < 0.85) {
            const beamAlpha = Math.sin(((p - 0.15) / 0.7) * Math.PI);
            const beamGrad = this.ctx.createLinearGradient(hoverX, hoverY, hoverX, this.bottomTrackY - 60);
            beamGrad.addColorStop(0, `rgba(0, 240, 255, ${0.85 * beamAlpha})`);
            beamGrad.addColorStop(0.5, `rgba(0, 231, 1, ${0.55 * beamAlpha})`);
            beamGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

            this.ctx.fillStyle = beamGrad;
            this.ctx.beginPath();
            this.ctx.moveTo(hoverX - 8, hoverY + 10);
            this.ctx.lineTo(hoverX + 8, hoverY + 10);
            this.ctx.lineTo(hoverX + 95, this.bottomTrackY - 80);
            this.ctx.lineTo(hoverX - 95, this.bottomTrackY - 80);
            this.ctx.closePath();
            this.ctx.fill();

            // Core laser line
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * beamAlpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(hoverX, hoverY + 10);
            this.ctx.lineTo(hoverX, this.bottomTrackY - 110);
            this.ctx.stroke();
        }

        // 2. Draw 3D Wireframe Alien UFO Saucer
        this.ctx.translate(hoverX, hoverY);
        this.ctx.shadowColor = this.colors.alienCyan;
        this.ctx.shadowBlur = 14;

        // Upper glass dome
        this.ctx.strokeStyle = this.colors.alienCyan;
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
        this.ctx.lineWidth = 1.6;
        this.ctx.beginPath();
        this.ctx.arc(0, -4, 16, Math.PI, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Main wireframe saucer disc
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.fillStyle = '#142430';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 34, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Rotating neon rim lights
        const numLights = 6;
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2 + time * 0.01;
            const lx = Math.cos(angle) * 26;
            const ly = Math.sin(angle) * 6;
            this.ctx.fillStyle = i % 2 === 0 ? '#00e701' : '#00f0ff';
            this.ctx.beginPath();
            this.ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    private drawShockwaves() {
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.16;
            sw.alpha -= 0.04;

            if (sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.strokeStyle = sw.color;
            this.ctx.globalAlpha = Math.max(0, sw.alpha);
            this.ctx.lineWidth = 2.5;
            this.ctx.shadowColor = sw.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    private drawShards() {
        for (let i = this.shards.length - 1; i >= 0; i--) {
            const s = this.shards[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.22;
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
            ft.alpha -= 0.018;

            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            const fontSize = Math.round(15 * (ft.scale || 1));
            this.ctx.font = `900 ${fontSize}px Inter, sans-serif`;
            this.ctx.fillStyle = ft.color;
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = ft.color;
            this.ctx.shadowBlur = 8;
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
