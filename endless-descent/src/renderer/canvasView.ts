import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { formatMultiplier, calculateNextStepMultiplier } from '../math/multipliers';
import { sounds } from '../audio/sounds';

interface Shard {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vRot: number;
    length: number;
    alpha: number;
    color: string;
}

interface FloatingBanner {
    x: number;
    y: number;
    text: string;
    color: string;
    alpha: number;
    vy: number;
    scale: number;
}

interface ShockwaveRing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
}

interface AlienInterceptorEvent {
    active: boolean;
    progress: number;
    targetX: number;
    targetY: number;
}

export class CanvasRenderer {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    // Virtual coordinate space
    public readonly width = 420;
    public readonly height = 520;

    private lastPixelW = 0;
    private lastPixelH = 0;

    // 3D Corridor Perspective Geometry
    private readonly horizonY = 52;
    private readonly bottomTrackY = 502;
    private readonly topTrackWidth = 136;
    private readonly bottomTrackWidth = 386;

    // Perspective Row Spacing:
    // Active row sits comfortably at t = 0.74 in the foreground.
    // The Arrow Ship rests further back ("hacia atrás") at t = 0.44 with clean open space ahead.
    private readonly activeRowCenterT = 0.74;
    private readonly rowDepthStep = 0.165;
    private readonly shipRestT = 0.44;

    public hoverLane: number | null = null;
    private laneHoverProgress: number[] = [0, 0, 0, 0, 0];

    // Monotonic Smooth Scroll Camera (Zero integer-boundary oscillation -> Zero row flicker)
    public cameraRow = 1;

    // Arrow Ship ("La Flechita") Physics State
    public shipX = 210;
    public shipY = 215;
    private shipAngle = 0;
    private shipDashImpulse = 0; // Forward lunge when conquering a card

    // Effects state
    public screenShake = 0;
    public redFlashAlpha = 0;
    public cyanFlashAlpha = 0;
    public goldFlashAlpha = 0;
    public greenFlashAlpha = 0;
    private shards: Shard[] = [];
    private banners: FloatingBanner[] = [];
    private shockwaves: ShockwaveRing[] = [];
    private rowStepTimestamps: Map<number, number> = new Map();

    private alienEvent: AlienInterceptorEvent = {
        active: false,
        progress: 0,
        targetX: 210,
        targetY: 360
    };

    private readonly colors = {
        bgTop: '#071118',
        bgBottom: '#0f212e',
        cardFace: '#1a2c38',
        cardHover: '#233b4b',
        cardBorder: '#2f4553',
        green: '#00e701',
        gold: '#f59e0b',
        goldLight: '#fde047',
        cyan: '#06b6d4',
        cyanLight: '#67e8f9',
        red: '#ff1e42',
        textMuted: '#5b7487',
        white: '#f8fafc'
    };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not acquire 2D context');
        this.ctx = ctx;

        this.setupDPI(true);
        window.addEventListener('resize', () => this.setupDPI(true));
    }

    /**
     * Updates canvas backing store ONLY when dimensions actually change,
     * preventing 60fps buffer reallocation flicker.
     */
    public setupDPI(force = false) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const w = rect.width > 0 ? rect.width : this.width;
        const h = rect.height > 0 ? rect.height : this.height;
        const pixelW = Math.round(w * dpr);
        const pixelH = Math.round(h * dpr);

        if (force || pixelW !== this.lastPixelW || pixelH !== this.lastPixelH) {
            this.lastPixelW = pixelW;
            this.lastPixelH = pixelH;
            this.canvas.width = pixelW;
            this.canvas.height = pixelH;
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(pixelW / this.width, pixelH / this.height);
    }

    /**
     * Maps normalized depth t in [0, 1] (0 = upper horizon, 1 = bottom foreground)
     * with smooth perspective foreshortening.
     */
    private depthToScreenY(t: number): number {
        const clamped = Math.max(-0.25, Math.min(1.3, t));
        if (clamped < 0) {
            return this.horizonY + clamped * 85;
        }
        return this.horizonY + Math.pow(clamped, 1.28) * (this.bottomTrackY - this.horizonY);
    }

    /**
     * Returns horizontal span [left, right, width] of the 5-lane corridor at screen Y.
     */
    private getTrackSpanAtY(y: number): { left: number; right: number; width: number } {
        const t = Math.max(0, Math.min(1.2, (y - this.horizonY) / (this.bottomTrackY - this.horizonY)));
        const trackWidth = this.topTrackWidth + t * (this.bottomTrackWidth - this.topTrackWidth);
        const centerX = this.width / 2;
        return {
            left: centerX - trackWidth / 2,
            right: centerX + trackWidth / 2,
            width: trackWidth
        };
    }

    /**
     * Computes the 2D perspective trapezoid/quad for a given (row, lane).
     */
    public getCellQuad(row: number, lane: number): {
        xTL: number;
        xTR: number;
        xBL: number;
        xBR: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        w: number;
        h: number;
        cx: number;
        cy: number;
        depthT: number;
    } {
        const relRow = row - this.cameraRow;
        const centerT = this.activeRowCenterT + relRow * this.rowDepthStep;
        const topT = centerT - this.rowDepthStep * 0.42;
        const bottomT = centerT + this.rowDepthStep * 0.42;

        const yTop = this.depthToScreenY(topT);
        const yBottom = this.depthToScreenY(bottomT);

        const spanTop = this.getTrackSpanAtY(yTop);
        const spanBottom = this.getTrackSpanAtY(yBottom);

        const laneWTop = spanTop.width / 5;
        const laneWBottom = spanBottom.width / 5;

        const xTL = spanTop.left + lane * laneWTop;
        const xTR = xTL + laneWTop;
        const xBL = spanBottom.left + lane * laneWBottom;
        const xBR = xBL + laneWBottom;

        const cx = (xTL + xTR + xBL + xBR) / 4;
        const cy = (yTop + yBottom) / 2;

        return {
            xTL,
            xTR,
            xBL,
            xBR,
            x1: Math.min(xTL, xBL),
            y1: yTop,
            x2: Math.max(xTR, xBR),
            y2: yBottom,
            w: (laneWTop + laneWBottom) / 2,
            h: Math.max(4, yBottom - yTop),
            cx,
            cy,
            depthT: centerT
        };
    }

    public getClickTarget(
        clientX: number,
        clientY: number,
        activeRow: number
    ): { row: number; lane: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const cx = (clientX - rect.left) * scaleX;
        const cy = (clientY - rect.top) * scaleY;

        for (let l = 0; l < 5; l++) {
            const quad = this.getCellQuad(activeRow, l);
            const padX = quad.w * 0.12;
            const padY = quad.h * 0.24;
            if (
                cx >= quad.x1 - padX &&
                cx <= quad.x2 + padX &&
                cy >= quad.y1 - padY &&
                cy <= quad.y2 + padY
            ) {
                return { row: activeRow, lane: l };
            }
        }
        return null;
    }

    public updateHover(clientX: number, clientY: number, activeRow: number) {
        const target = this.getClickTarget(clientX, clientY, activeRow);
        const newLane = target ? target.lane : null;
        if (newLane !== null && newLane !== this.hoverLane) {
            sounds.playHoverTick(newLane);
        }
        this.hoverLane = newLane;
    }

    public clearHover() {
        this.hoverLane = null;
    }

    public notifyStep(row: number) {
        this.rowStepTimestamps.set(row, performance.now());
        this.shipDashImpulse = 1.0;

        // Subtle dopamine shockwave on every conquered step
        const lastLane = this.hoverLane ?? 2;
        const q = this.getCellQuad(row, lastLane);
        this.shockwaves.push({
            x: q.cx,
            y: q.cy,
            radius: 6,
            maxRadius: 48,
            color: this.colors.green,
            alpha: 0.65
        });
    }

    public triggerWinCelebration() {
        this.greenFlashAlpha = 0.16;
        this.shockwaves.push({
            x: this.shipX,
            y: this.shipY,
            radius: 10,
            maxRadius: 120,
            color: this.colors.green,
            alpha: 0.9
        });

        const winColors = ['#00e701', '#86efac', '#fde047', '#ffffff'];
        for (let i = 0; i < 28; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
            const speed = 2.5 + Math.random() * 6.5;
            this.shards.push({
                x: this.shipX + (Math.random() - 0.5) * 30,
                y: this.shipY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.25,
                length: 5 + Math.random() * 8,
                alpha: 1.0,
                color: winColors[i % winColors.length]
            });
        }
    }

    public triggerCrashEffect(cx: number, cy: number) {
        this.screenShake = 16;
        this.redFlashAlpha = 0.36;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 110,
            color: this.colors.red,
            alpha: 1.0
        });

        const shardColors = ['#ffffff', '#ff1e42', '#ff6b8b', '#ff1e42'];
        for (let i = 0; i < 34; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3.0 + Math.random() * 8.0;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 6 + Math.random() * 11,
                alpha: 1.0,
                color: shardColors[i % shardColors.length]
            });
        }
    }

    public triggerGoldenBurst(cx: number, cy: number) {
        this.screenShake = 6;
        this.goldFlashAlpha = 0.18;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 90,
            color: this.colors.goldLight,
            alpha: 1.0
        });

        const goldColors = ['#fde047', '#f59e0b', '#ffffff'];
        for (let i = 0; i < 22; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.2 + Math.random() * 5.0;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 5 + Math.random() * 8,
                alpha: 1.0,
                color: goldColors[i % goldColors.length]
            });
        }
    }

    public triggerShieldBreakEffect(cx: number, cy: number) {
        this.screenShake = 11;
        this.cyanFlashAlpha = 0.24;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: 105,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const shieldColors = ['#67e8f9', '#06b6d4', '#ffffff'];
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.8 + Math.random() * 6.0;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 6 + Math.random() * 9,
                alpha: 1.0,
                color: shieldColors[i % shieldColors.length]
            });
        }
    }

    public triggerAlienUfoAttack(cx: number, cy: number) {
        this.screenShake = 12;
        this.cyanFlashAlpha = 0.22;

        this.alienEvent = {
            active: true,
            progress: 0,
            targetX: cx,
            targetY: cy
        };

        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 12,
            maxRadius: 130,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const colors = ['#67e8f9', '#00e701', '#ffffff'];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.8 + Math.random() * 6.5;
            this.shards.push({
                x: cx + (Math.random() - 0.5) * 100,
                y: cy + (Math.random() - 0.5) * 50,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 6 + Math.random() * 10,
                alpha: 1.0,
                color: colors[i % colors.length]
            });
        }
    }

    public addFloatingText(x: number, y: number, text: string, color = '#00e701', scale = 1.0) {
        // Keep at most 2 floating banners at once to prevent visual clutter
        if (this.banners.length >= 2) {
            this.banners.shift();
        }
        this.banners.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -0.95,
            scale
        });
    }

    /**
     * Master 60 FPS Render Loop
     */
    public render(engine: GameEngine, time: number) {
        this.setupDPI(false);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();

        // Screen shake
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
            this.screenShake *= 0.86;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // 1. Update Monotonic Critically-Damped Scroll Camera (Never oscillates across integers)
        const targetRow = engine.state === GameState.IDLE ? 1 : Math.max(1, engine.currentRow);
        if (engine.state === GameState.PLAYING && engine.currentRow === 1 && engine.currentPicks.length === 0) {
            if (this.cameraRow > 1.5) {
                this.cameraRow = 1;
            }
        }

        const diff = targetRow - this.cameraRow;
        if (Math.abs(diff) < 0.0008) {
            this.cameraRow = targetRow;
        } else {
            this.cameraRow += diff * 0.15;
        }

        // 2. Render Background & Corridor
        this.drawBackground(engine);
        this.drawCorridorRails(engine);

        // 3. Draw Conquered Trajectory Path (connecting cleared rows into the Arrow Ship)
        this.drawConqueredPath(engine);

        // 4. Draw Rows with smooth top AND bottom fade envelopes (Zero flickering)
        const minRow = Math.max(1, Math.floor(this.cameraRow - 4));
        const maxRow = Math.floor(this.cameraRow + 2);
        for (let r = minRow; r <= maxRow; r++) {
            this.drawRow(engine, r);
        }

        // 5. Draw Arrow Ship ("La Flechita") poised further back with targeting guide
        this.drawArrowShip(engine, time);

        // 6. Draw Alien Interceptor Saucer & Laser Matrix
        this.drawAlienInterceptor(time);

        // 7. Draw Shockwaves, Shards & Floating Banners
        this.drawShockwaves();
        this.drawShards();
        this.drawBanners();

        // 8. Screen Flashes
        if (this.redFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(255, 30, 66, ${this.redFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.redFlashAlpha *= 0.86;
        }
        if (this.cyanFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(6, 182, 212, ${this.cyanFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.cyanFlashAlpha *= 0.86;
        }
        if (this.goldFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(245, 158, 11, ${this.goldFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.goldFlashAlpha *= 0.86;
        }
        if (this.greenFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(0, 231, 1, ${this.greenFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.greenFlashAlpha *= 0.88;
        }

        this.ctx.restore();
    }

    private drawBackground(engine: GameEngine) {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, this.colors.bgTop);
        grad.addColorStop(0.5, '#0b1924');
        grad.addColorStop(1, this.colors.bgBottom);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Subtle horizon focal glow
        const horizonGrad = this.ctx.createRadialGradient(
            this.width / 2,
            this.horizonY + 12,
            6,
            this.width / 2,
            this.horizonY + 12,
            195
        );
        if (engine.luckyBoost) {
            horizonGrad.addColorStop(0, 'rgba(245, 158, 11, 0.11)');
            horizonGrad.addColorStop(0.5, 'rgba(0, 231, 1, 0.03)');
        } else {
            horizonGrad.addColorStop(0, 'rgba(0, 231, 1, 0.06)');
            horizonGrad.addColorStop(0.5, 'rgba(26, 44, 56, 0.12)');
        }
        horizonGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = horizonGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    private drawCorridorRails(engine: GameEngine) {
        const topSpan = this.getTrackSpanAtY(this.horizonY);
        const bottomSpan = this.getTrackSpanAtY(this.bottomTrackY);

        // Corridor floor surface
        const trackGrad = this.ctx.createLinearGradient(0, this.horizonY, 0, this.bottomTrackY);
        trackGrad.addColorStop(0, 'rgba(13, 28, 39, 0.2)');
        trackGrad.addColorStop(0.35, 'rgba(19, 36, 48, 0.65)');
        trackGrad.addColorStop(1, 'rgba(15, 33, 46, 0.92)');

        this.ctx.fillStyle = trackGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(topSpan.left, this.horizonY);
        this.ctx.lineTo(topSpan.right, this.horizonY);
        this.ctx.lineTo(bottomSpan.right, this.bottomTrackY);
        this.ctx.lineTo(bottomSpan.left, this.bottomTrackY);
        this.ctx.closePath();
        this.ctx.fill();

        // 6 Longitudinal perspective lane rails (subtle, crisp)
        for (let i = 0; i <= 5; i++) {
            const topX = topSpan.left + (i * topSpan.width) / 5;
            const bottomX = bottomSpan.left + (i * bottomSpan.width) / 5;

            const isOuter = i === 0 || i === 5;
            this.ctx.strokeStyle = isOuter
                ? engine.luckyBoost
                    ? 'rgba(245, 158, 11, 0.38)'
                    : '#2d4657'
                : 'rgba(47, 69, 83, 0.32)';
            this.ctx.lineWidth = isOuter ? 1.8 : 1.0;

            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.horizonY);
            this.ctx.lineTo(bottomX, this.bottomTrackY);
            this.ctx.stroke();
        }

        // Scrolling depth ticks along outer rails
        const numTicks = 10;
        this.ctx.strokeStyle = 'rgba(100, 127, 148, 0.22)';
        this.ctx.lineWidth = 1.2;
        for (let i = 0; i < numTicks; i++) {
            const rawT = ((i / numTicks) - (this.cameraRow * this.rowDepthStep) % 1 + 10) % 1;
            const y = this.depthToScreenY(rawT);
            if (y < this.horizonY + 12 || y > this.bottomTrackY - 12) continue;
            const span = this.getTrackSpanAtY(y);
            this.ctx.beginPath();
            this.ctx.moveTo(span.left - 5, y);
            this.ctx.lineTo(span.left - 2, y);
            this.ctx.moveTo(span.right + 2, y);
            this.ctx.lineTo(span.right + 5, y);
            this.ctx.stroke();
        }

        // Top horizon fade vignette
        const topFade = this.ctx.createLinearGradient(0, this.horizonY - 4, 0, this.horizonY + 34);
        topFade.addColorStop(0, this.colors.bgTop);
        topFade.addColorStop(1, 'rgba(7, 17, 24, 0)');
        this.ctx.fillStyle = topFade;
        this.ctx.fillRect(0, this.horizonY - 4, this.width, 38);
    }

    /**
     * Draws a clean, minimalist trajectory line connecting conquered nodes into the Arrow Ship.
     */
    private drawConqueredPath(engine: GameEngine) {
        if (engine.currentPicks.length === 0) return;

        const points: { x: number; y: number }[] = [];
        for (const pick of engine.currentPicks) {
            if (!pick.isSafe && !pick.shieldSaved) continue;
            const q = this.getCellQuad(pick.row, pick.lane);
            if (q.cy >= this.horizonY - 15 && q.cy <= this.bottomTrackY) {
                points.push({ x: q.cx, y: q.cy });
            }
        }

        if (engine.state !== GameState.CRASHED) {
            points.push({ x: this.shipX, y: this.shipY });
        }

        if (points.length < 2) return;

        this.ctx.save();
        this.ctx.strokeStyle = engine.luckyBoost
            ? 'rgba(253, 224, 71, 0.45)'
            : 'rgba(0, 231, 1, 0.42)';
        this.ctx.lineWidth = 1.8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        points.forEach((pt, idx) => {
            if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
            else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawRow(engine: GameEngine, row: number) {
        const sampleQuad = this.getCellQuad(row, 0);
        if (sampleQuad.y2 < this.horizonY || sampleQuad.y1 > this.bottomTrackY + 28) return;

        // Smooth alpha envelope at BOTH top horizon and bottom emergence edge!
        // This guarantees upcoming rows never flicker or pop abruptly.
        const topAlpha = Math.max(0, Math.min(1, (sampleQuad.cy - (this.horizonY + 6)) / 44));
        const bottomAlpha = Math.max(0, Math.min(1, (this.bottomTrackY + 14 - sampleQuad.cy) / 56));
        const rowAlpha = topAlpha * bottomAlpha;
        if (rowAlpha <= 0.01) return;

        this.ctx.save();
        this.ctx.globalAlpha = rowAlpha;

        const spanBottom = this.getTrackSpanAtY(sampleQuad.y2);

        // Subtle horizontal row line
        this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.38)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spanBottom.left, sampleQuad.y2);
        this.ctx.lineTo(spanBottom.right, sampleQuad.y2);
        this.ctx.stroke();

        // Row depth label on left rail ("01", "02", "03")
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isAlienCleared = engine.alienDestroyedRows.has(row);
        const labelScale = Math.max(0.65, Math.min(1.0, spanBottom.width / this.bottomTrackWidth));
        const fontSize = Math.round(9.5 * labelScale);

        this.ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
        this.ctx.fillStyle = isActiveRow
            ? this.colors.green
            : isAlienCleared
              ? this.colors.cyanLight
              : this.colors.textMuted;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(row.toString().padStart(2, '0'), spanBottom.left - 8, sampleQuad.cy);

        for (let lane = 0; lane < 5; lane++) {
            this.drawCell(engine, row, lane);
        }

        this.ctx.restore();
    }

    private drawCell(engine: GameEngine, row: number, lane: number) {
        const quad = this.getCellQuad(row, lane);
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isIdleFirstRow = row === 1 && engine.state !== GameState.PLAYING && engine.currentRow === 1;
        const isPastRow = row < engine.currentRow;
        const isCrashedRow = row === engine.lastCrashedRow && engine.state === GameState.CRASHED;
        const specials = engine.getSpecialsForRow(row);
        const isGoldenLane = specials.goldenLane === lane;
        const isAlienLane = specials.alienLane === lane;

        // Smooth hover interpolation per lane
        if (isActiveRow) {
            const targetHover = this.hoverLane === lane ? 1 : 0;
            this.laneHoverProgress[lane] += (targetHover - this.laneHoverProgress[lane]) * 0.24;
        } else {
            this.laneHoverProgress[lane] *= 0.8;
        }

        // Smooth readiness factor as the active row glides from upcoming position (cameraRow + 1) to active position (cameraRow)
        const distFromCamera = Math.abs(row - this.cameraRow);
        const activeReadiness = Math.max(0, Math.min(1, 1 - distFromCamera * 0.85));

        // 1. ACTIVE FOREGROUND ROW (or Row 1 in Idle ready state)
        if (isActiveRow || isIdleFirstRow) {
            const hp = isActiveRow ? this.laneHoverProgress[lane] : 0;
            const insetX = quad.w * 0.075;
            const insetY = quad.h * 0.085;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const liftY = hp * -4.0;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2 + liftY;
            const radius = Math.min(7, cardW * 0.13);

            this.ctx.save();
            // Smoothly blend opacity during camera scroll so newly promoted active row never snaps
            this.ctx.globalAlpha *= 0.45 + 0.55 * activeReadiness;

            if (isGoldenLane && isActiveRow) {
                // GOLDEN MULTIPLIER CARD
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
                    this.ctx.shadowBlur = hp * 12;
                }

                this.ctx.fillStyle = hp > 0.25 ? '#2d2212' : '#211b12';
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.fillStyle = '#78350f';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? this.colors.goldLight : this.colors.gold;
                this.ctx.lineWidth = 1.4 + hp * 0.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                this.drawVectorStar(quad.cx, cardY + cardH * 0.42, cardH * 0.18, this.colors.goldLight);

                this.ctx.font = `800 ${Math.max(9, Math.round(cardH * 0.20))}px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = this.colors.goldLight;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${specials.goldenBoost.toFixed(0)}x`, quad.cx, cardY + cardH * 0.77);
            } else if (isAlienLane && isActiveRow) {
                // ALIEN INTERCEPTOR CARD
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
                    this.ctx.shadowBlur = hp * 12;
                }

                this.ctx.fillStyle = hp > 0.25 ? '#122f3b' : '#10232d';
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.fillStyle = '#155e75';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? '#ffffff' : this.colors.cyanLight;
                this.ctx.lineWidth = 1.4 + hp * 0.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                this.drawVectorSaucerIcon(quad.cx, cardY + cardH * 0.42, cardW * 0.25, this.colors.cyanLight);

                this.ctx.font = `800 ${Math.max(8, Math.round(cardH * 0.18))}px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = this.colors.cyanLight;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`+2F`, quad.cx, cardY + cardH * 0.77);
            } else {
                // STANDARD TACTILE CARD
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(0, 231, 1, 0.22)';
                    this.ctx.shadowBlur = hp * 10;
                }

                this.ctx.fillStyle = hp > 0.25 ? this.colors.cardHover : this.colors.cardFace;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.fillStyle = '#111e27';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? this.colors.green : this.colors.cardBorder;
                this.ctx.lineWidth = 1.2 + hp * 0.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                if (hp > 0.35 && isActiveRow) {
                    // Dopamine Hover Preview: show exact target multiplier right on the hovered card
                    const nextMult = calculateNextStepMultiplier(
                        engine.currentMultiplier,
                        engine.minesCount,
                        engine.currentRow === 1,
                        1.0,
                        engine.hasActiveShield
                    );
                    this.ctx.font = `700 ${Math.max(9, Math.round(cardH * 0.21))}px "JetBrains Mono", monospace`;
                    this.ctx.fillStyle = this.colors.green;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(formatMultiplier(nextMult), quad.cx, cardY + cardH * 0.5);
                } else {
                    // Minimalist center dot / diamond pip instead of noisy question marks
                    this.ctx.fillStyle = '#3b5568';
                    this.ctx.beginPath();
                    this.ctx.arc(quad.cx, cardY + cardH * 0.48, Math.max(2, cardW * 0.045), 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        }
        // 2. CONQUERED PAST ROWS (Clean, desaturated trail above the ship)
        else if (isPastRow) {
            const stepTime = this.rowStepTimestamps.get(row);
            const elapsedMs = stepTime ? performance.now() - stepTime : 9999;

            let popScale = 1.0;
            if (elapsedMs < 240) {
                popScale = 1 + Math.sin((elapsedMs / 240) * Math.PI) * 0.25;
            }

            if (engine.alienDestroyedRows.has(row)) {
                this.drawFacetedDiamond(
                    quad.cx,
                    quad.cy,
                    quad.w * 0.14 * popScale,
                    this.colors.cyan,
                    this.colors.cyanLight
                );
                return;
            }

            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const isPicked = pick && pick.lane === lane;

            if (isPicked) {
                if (pick.shieldSaved) {
                    this.drawVectorShieldCrest(quad.cx, quad.cy, quad.w * 0.18 * popScale, this.colors.cyanLight);
                } else if (pick.specialType === 'GOLDEN') {
                    this.drawFacetedDiamond(
                        quad.cx,
                        quad.cy,
                        quad.w * 0.18 * popScale,
                        this.colors.gold,
                        this.colors.goldLight
                    );
                } else if (pick.specialType === 'ALIEN') {
                    this.drawFacetedDiamond(
                        quad.cx,
                        quad.cy,
                        quad.w * 0.18 * popScale,
                        this.colors.cyan,
                        this.colors.cyanLight
                    );
                } else {
                    this.drawFacetedDiamond(
                        quad.cx,
                        quad.cy,
                        quad.w * 0.16 * popScale,
                        this.colors.green,
                        '#86efac'
                    );
                }
            } else {
                // Near-Miss X-Ray Pulse:
                // Briefly shows dodged mines at 38% opacity for 650ms right after clearing the row (dopamine rush),
                // then fades down to a whisper-quiet architectural marker so the screen never looks cluttered!
                const nearMissPulse = elapsedMs < 650 ? (1 - elapsedMs / 650) * 0.32 : 0;
                if (isHazard) {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.09 + nearMissPulse;
                    this.drawVectorMine(quad.cx, quad.cy, quad.w * 0.13, false);
                    this.ctx.restore();
                } else {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.06;
                    this.ctx.fillStyle = '#476275';
                    this.ctx.beginPath();
                    this.ctx.arc(quad.cx, quad.cy, Math.max(1.5, quad.w * 0.04), 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }
        // 3. CRASHED ROW REVEAL
        else if (isCrashedRow) {
            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const wasPicked = engine.lastCrashedLane === lane;

            if (isHazard) {
                this.drawVectorMine(quad.cx, quad.cy, quad.w * (wasPicked ? 0.25 : 0.18), wasPicked);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha *= 0.25;
                this.drawFacetedDiamond(quad.cx, quad.cy, quad.w * 0.15, this.colors.green, '#86efac');
                this.ctx.restore();
            }
        }
        // 4. UPCOMING PREVIEW ROW (At bottom edge of corridor — sleek subtle slots)
        else {
            const insetX = quad.w * 0.085;
            const insetY = quad.h * 0.14;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;

            this.ctx.fillStyle = 'rgba(22, 38, 49, 0.32)';
            this.roundRect(cardX, cardY, cardW, cardH, 5, true, false);

            this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.30)';
            this.ctx.lineWidth = 1;
            this.roundRect(cardX, cardY, cardW, cardH, 5, false, true);
        }
    }

    /**
     * Renders "La Flechita" — pulled back ("hacia atrás") at `shipRestT = 0.44` so it has
     * generous breathing room above the active row (`activeRowCenterT = 0.74`),
     * with a forward lunge impulse when conquering a lane and precision aiming rotation.
     */
    private drawArrowShip(engine: GameEngine, time: number) {
        if (engine.state === GameState.CRASHED) return;

        const baseY = this.depthToScreenY(this.shipRestT);
        const spanAtShip = this.getTrackSpanAtY(baseY);
        const laneWidthAtShip = spanAtShip.width / 5;
        const targetX = spanAtShip.left + (engine.lastChosenLane + 0.5) * laneWidthAtShip;

        // Forward dash lunge toward the active row when a card is picked
        const dashOffsetY = this.shipDashImpulse * 36;
        const targetY = baseY + dashOffsetY;

        this.shipX += (targetX - this.shipX) * 0.22;
        this.shipY += (targetY - this.shipY) * 0.22;
        this.shipDashImpulse *= 0.84;

        // Calculate banking / aiming rotation angle:
        let targetAngle = (targetX - this.shipX) * -0.025;
        if (engine.state === GameState.PLAYING && this.hoverLane !== null) {
            const hoverQuad = this.getCellQuad(engine.currentRow, this.hoverLane);
            const dx = hoverQuad.cx - this.shipX;
            const dy = Math.max(24, hoverQuad.cy - this.shipY);
            targetAngle = Math.atan2(dx, dy) * 0.52;

            // Ultra-fine laser sight from Arrow Ship tip toward the hovered card
            this.ctx.save();
            const laserGrad = this.ctx.createLinearGradient(
                this.shipX,
                this.shipY + 14,
                hoverQuad.cx,
                hoverQuad.cy - hoverQuad.h * 0.35
            );
            laserGrad.addColorStop(0, 'rgba(0, 231, 1, 0.42)');
            laserGrad.addColorStop(1, 'rgba(0, 231, 1, 0.04)');
            this.ctx.strokeStyle = laserGrad;
            this.ctx.lineWidth = 1.2;
            this.ctx.setLineDash([3, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.shipX, this.shipY + 14);
            this.ctx.lineTo(hoverQuad.cx, hoverQuad.cy - hoverQuad.h * 0.35);
            this.ctx.stroke();
            this.ctx.restore();
        }
        this.shipAngle += (targetAngle - this.shipAngle) * 0.24;

        const bobY = Math.sin(time * 0.0045) * 1.6;

        this.ctx.save();
        this.ctx.translate(this.shipX, this.shipY + bobY);
        this.ctx.rotate(-this.shipAngle);

        // Slight aerodynamic stretch on dash
        const stretchY = 1.0 + this.shipDashImpulse * 0.14;
        const stretchX = 1.0 - this.shipDashImpulse * 0.06;
        this.ctx.scale(stretchX, stretchY);

        // If Deflector Shield is active, draw a subtle, fine hexagonal aura
        const showShield =
            engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased;
        if (showShield) {
            this.ctx.save();
            this.ctx.rotate(time * 0.002);
            this.ctx.strokeStyle = 'rgba(103, 232, 249, 0.65)';
            this.ctx.fillStyle = 'rgba(6, 182, 212, 0.07)';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            const r = 19;
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

        // Crisp Rear Ion Plume
        const flameLen = 7 + Math.sin(time * 0.035) * 2 + this.shipDashImpulse * 10;
        const accentColor = engine.luckyBoost ? this.colors.goldLight : this.colors.green;
        this.ctx.fillStyle = accentColor;
        this.ctx.shadowColor = accentColor;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(-3.2, -5);
        this.ctx.lineTo(0, -5 - flameLen);
        this.ctx.lineTo(3.2, -5);
        this.ctx.closePath();
        this.ctx.fill();

        // THE ARROW SHIP ("LA FLECHITA") — Refined, razor-sharp geometric stealth arrow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 6;

        // Left Facet (Lit)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 14);     // Sharp nose tip pointing down
        this.ctx.lineTo(-11.5, -9); // Left swept wingtip
        this.ctx.lineTo(-3, -4);    // Left inner notch
        this.ctx.lineTo(0, -6.5);   // Center tail spine
        this.ctx.closePath();
        this.ctx.fill();

        // Right Facet (Shaded Metallic Slate)
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 14);
        this.ctx.lineTo(11.5, -9);
        this.ctx.lineTo(3, -4);
        this.ctx.lineTo(0, -6.5);
        this.ctx.closePath();
        this.ctx.fill();

        // Subtle emerald/gold core chevron line inside the arrow
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(-4.5, -1.5);
        this.ctx.lineTo(0, 7);
        this.ctx.lineTo(4.5, -1.5);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Pure Vector Alien Interceptor Saucer & Laser Matrix
     */
    private drawAlienInterceptor(time: number) {
        if (!this.alienEvent.active) return;

        this.alienEvent.progress += 0.025;
        if (this.alienEvent.progress >= 1.0) {
            this.alienEvent.active = false;
            return;
        }

        const p = this.alienEvent.progress;
        const ufoX =
            p < 0.25
                ? 30 + (this.alienEvent.targetX - 30) * (p / 0.25)
                : p < 0.78
                  ? this.alienEvent.targetX + Math.sin(p * 22) * 14
                  : this.alienEvent.targetX +
                    (this.width - 30 - this.alienEvent.targetX) * ((p - 0.78) / 0.22);
        const ufoY = 105 + Math.sin(p * Math.PI) * 12;

        this.ctx.save();

        if (p > 0.14 && p < 0.86) {
            const beamAlpha = Math.sin(((p - 0.14) / 0.72) * Math.PI);
            const grad = this.ctx.createLinearGradient(ufoX, ufoY, ufoX, this.bottomTrackY - 20);
            grad.addColorStop(0, `rgba(103, 232, 249, ${0.75 * beamAlpha})`);
            grad.addColorStop(0.5, `rgba(0, 231, 1, ${0.35 * beamAlpha})`);
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.moveTo(ufoX - 5, ufoY + 8);
            this.ctx.lineTo(ufoX + 5, ufoY + 8);
            this.ctx.lineTo(ufoX + 75, this.bottomTrackY - 30);
            this.ctx.lineTo(ufoX - 75, this.bottomTrackY - 30);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * beamAlpha})`;
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.moveTo(ufoX, ufoY + 8);
            this.ctx.lineTo(ufoX, this.bottomTrackY - 50);
            this.ctx.stroke();
        }

        this.drawVectorSaucerIcon(ufoX, ufoY, 30, this.colors.cyanLight, time);
        this.ctx.restore();
    }

    private drawFacetedDiamond(cx: number, cy: number, size: number, primary: string, highlight: string) {
        this.ctx.save();
        this.ctx.shadowColor = primary;
        this.ctx.shadowBlur = size * 0.55;

        this.ctx.fillStyle = primary;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx + size, cy);
        this.ctx.lineTo(cx, cy + size);
        this.ctx.lineTo(cx - size, cy);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = highlight;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size * 0.55);
        this.ctx.lineTo(cx + size * 0.35, cy);
        this.ctx.lineTo(cx, cy + size * 0.16);
        this.ctx.lineTo(cx - size * 0.35, cy);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    private drawVectorStar(cx: number, cy: number, r: number, color: string) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const rad = i % 2 === 0 ? r : r * 0.38;
            const ang = (i * Math.PI) / 4 - Math.PI / 2;
            const px = cx + Math.cos(ang) * rad;
            const py = cy + Math.sin(ang) * rad;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    private drawVectorSaucerIcon(cx: number, cy: number, radius: number, color: string, time = 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = '#0f212e';
        this.ctx.lineWidth = 1.5;

        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.08, radius * 0.44, Math.PI, 0);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius, radius * 0.27, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        for (let i = -1; i <= 1; i++) {
            const pulse = time > 0 ? Math.sin(time * 0.015 + i) * 1.2 : 0;
            this.ctx.fillStyle = i === 0 ? '#00e701' : color;
            this.ctx.beginPath();
            this.ctx.arc(i * radius * 0.5 + pulse, 0, Math.max(1.5, radius * 0.08), 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    private drawVectorShieldCrest(cx: number, cy: number, size: number, color: string) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        this.ctx.lineWidth = 1.6;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.85, -size * 0.45);
        this.ctx.lineTo(size * 0.65, size * 0.45);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size * 0.65, size * 0.45);
        this.ctx.lineTo(-size * 0.85, -size * 0.45);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawVectorMine(cx: number, cy: number, radius: number, isDirectTrigger: boolean) {
        this.ctx.save();
        if (isDirectTrigger) {
            this.ctx.shadowColor = this.colors.red;
            this.ctx.shadowBlur = radius * 1.2;
        }

        this.ctx.strokeStyle = this.colors.red;
        this.ctx.lineWidth = Math.max(1.4, radius * 0.2);
        for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI) / 4;
            this.ctx.beginPath();
            this.ctx.moveTo(cx + Math.cos(ang) * radius * 0.5, cy + Math.sin(ang) * radius * 0.5);
            this.ctx.lineTo(cx + Math.cos(ang) * radius * 1.25, cy + Math.sin(ang) * radius * 1.25);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = this.colors.red;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 0.26, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    private drawShockwaves() {
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.16;
            sw.alpha -= 0.045;

            if (sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.strokeStyle = sw.color;
            this.ctx.globalAlpha = Math.max(0, sw.alpha);
            this.ctx.lineWidth = 1.8;
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
            s.vy += 0.18;
            s.rot += s.vRot;
            s.alpha -= 0.026;

            if (s.alpha <= 0) {
                this.shards.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.rot);
            this.ctx.strokeStyle = s.color;
            this.ctx.globalAlpha = Math.max(0, s.alpha);
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.moveTo(-s.length / 2, 0);
            this.ctx.lineTo(s.length / 2, 0);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    private drawBanners() {
        for (let i = this.banners.length - 1; i >= 0; i--) {
            const b = this.banners[i];
            b.y += b.vy;
            b.alpha -= 0.022;

            if (b.alpha <= 0) {
                this.banners.splice(i, 1);
                continue;
            }

            this.ctx.save();
            const fontSize = Math.round(12 * b.scale);
            this.ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
            this.ctx.fillStyle = b.color;
            this.ctx.globalAlpha = Math.max(0, b.alpha);
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            this.ctx.shadowBlur = 5;
            this.ctx.fillText(b.text, b.x, b.y);
            this.ctx.restore();
        }
    }

    private roundRect(
        x: number,
        y: number,
        w: number,
        h: number,
        r: number,
        fill: boolean,
        stroke: boolean
    ) {
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
