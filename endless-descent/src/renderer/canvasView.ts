import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { formatMultiplier } from '../math/multipliers';

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
    subtext?: string;
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

interface TrailNode {
    x: number;
    y: number;
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

    // Virtual coordinate system
    public readonly width = 420;
    public readonly height = 540;

    // 3D Corridor Perspective Geometry
    // Top horizon (vanishing trail of past rows) -> Bottom foreground (active row)
    private readonly horizonY = 68;
    private readonly bottomTrackY = 515;
    private readonly topTrackWidth = 148;
    private readonly bottomTrackWidth = 384;

    public hoverLane: number | null = null;
    private laneHoverProgress: number[] = [0, 0, 0, 0, 0];

    // Spring-Physics Scroll Camera
    public cameraRow = 1;
    private cameraVelocity = 0;
    private scrollGridPhase = 0;

    // Arrow Ship ("La Flechita") Physics State
    public shipX = 210;
    public shipY = 260;
    private shipVx = 0;
    private shipVy = 0;
    private shipAngle = 0; // Dynamic banking / aiming angle in radians
    private shipThrust = 0; // Forward dash impulse
    private ribbonTrail: TrailNode[] = [];

    // Effects state
    public screenShake = 0;
    public redFlashAlpha = 0;
    public cyanFlashAlpha = 0;
    public goldFlashAlpha = 0;
    private shards: Shard[] = [];
    private banners: FloatingBanner[] = [];
    private shockwaves: ShockwaveRing[] = [];
    private rowPopTimestamps: Map<number, number> = new Map();

    private alienEvent: AlienInterceptorEvent = {
        active: false,
        progress: 0,
        targetX: 210,
        targetY: 360
    };

    private readonly colors = {
        bgTop: '#08131b',
        bgBottom: '#0f212e',
        trackFill: 'rgba(18, 34, 46, 0.75)',
        railOuter: '#2f4553',
        railInner: '#1e3240',
        cardFace: '#1a2c38',
        cardHover: '#223847',
        cardBorder: '#2f4553',
        green: '#00e701',
        gold: '#f59e0b',
        goldLight: '#fde047',
        cyan: '#06b6d4',
        cyanLight: '#67e8f9',
        red: '#e9113c',
        textMuted: '#647f94',
        white: '#f8fafc'
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
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const w = rect.width > 0 ? rect.width : this.width;
        const h = rect.height > 0 ? rect.height : this.height;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale((w * dpr) / this.width, (h * dpr) / this.height);
    }

    /**
     * Maps normalized depth t in [0, 1] (0 = upper horizon, 1 = bottom foreground)
     * using perspective foreshortening so rows grow larger as you descend toward them.
     */
    private depthToScreenY(t: number): number {
        const clamped = Math.max(-0.2, Math.min(1.25, t));
        if (clamped < 0) {
            return this.horizonY + clamped * 90;
        }
        return this.horizonY + Math.pow(clamped, 1.32) * (this.bottomTrackY - this.horizonY);
    }

    /**
     * Returns horizontal span [left, right, width] of the 5-lane corridor at screen Y.
     */
    private getTrackSpanAtY(y: number): { left: number; right: number; width: number } {
        const t = Math.max(0, Math.min(1.15, (y - this.horizonY) / (this.bottomTrackY - this.horizonY)));
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
     * Note the true descent orientation:
     * - Active row (`row === cameraRow`) sits in the foreground at depth t ≈ 0.76.
     * - Past cleared rows (`row < cameraRow`) trail behind/above the ship (t < 0.60) toward the horizon!
     * - Upcoming rows (`row > cameraRow`) emerge at the bottom (t > 0.88).
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
        const rowDepthStep = 0.145;
        const activeRowCenterT = 0.75;
        const relRow = row - this.cameraRow; // 0 for active row, negative for past rows above, +1 for next row below

        const centerT = activeRowCenterT + relRow * rowDepthStep;
        const topT = centerT - rowDepthStep * 0.44;
        const bottomT = centerT + rowDepthStep * 0.44;

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

    public getClickTarget(clientX: number, clientY: number, activeRow: number): { row: number; lane: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        const cx = (clientX - rect.left) * scaleX;
        const cy = (clientY - rect.top) * scaleY;

        for (let l = 0; l < 5; l++) {
            const quad = this.getCellQuad(activeRow, l);
            const padX = quad.w * 0.12;
            const padY = quad.h * 0.22;
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

    public notifyStep(row: number) {
        this.rowPopTimestamps.set(row, performance.now());
        this.shipThrust = 1.0;
    }

    public triggerCrashEffect(cx: number, cy: number) {
        this.screenShake = 20;
        this.redFlashAlpha = 0.42;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 115,
            color: this.colors.red,
            alpha: 1.0
        });

        const shardColors = ['#ffffff', '#e9113c', '#ff6b8b', '#e9113c'];
        for (let i = 0; i < 38; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3.5 + Math.random() * 8.5;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 6 + Math.random() * 12,
                alpha: 1.0,
                color: shardColors[i % shardColors.length]
            });
        }
    }

    public triggerGoldenBurst(cx: number, cy: number) {
        this.screenShake = 7;
        this.goldFlashAlpha = 0.20;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 95,
            color: this.colors.goldLight,
            alpha: 1.0
        });

        const goldColors = ['#fde047', '#f59e0b', '#ffffff'];
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 5.5;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 5 + Math.random() * 9,
                alpha: 1.0,
                color: goldColors[i % goldColors.length]
            });
        }
    }

    public triggerShieldBreakEffect(cx: number, cy: number) {
        this.screenShake = 13;
        this.cyanFlashAlpha = 0.28;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: 110,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const shieldColors = ['#67e8f9', '#06b6d4', '#ffffff'];
        for (let i = 0; i < 26; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6.5;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 6 + Math.random() * 10,
                alpha: 1.0,
                color: shieldColors[i % shieldColors.length]
            });
        }
    }

    public triggerAlienUfoAttack(cx: number, cy: number) {
        this.screenShake = 14;
        this.cyanFlashAlpha = 0.25;

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
            maxRadius: 140,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const colors = ['#67e8f9', '#00e701', '#ffffff'];
        for (let i = 0; i < 36; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 7;
            this.shards.push({
                x: cx + (Math.random() - 0.5) * 120,
                y: cy + (Math.random() - 0.5) * 60,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 7 + Math.random() * 12,
                alpha: 1.0,
                color: colors[i % colors.length]
            });
        }
    }

    public addFloatingText(x: number, y: number, text: string, color = '#00e701', scale = 1.0, subtext?: string) {
        this.banners.push({
            x,
            y,
            text,
            subtext,
            color,
            alpha: 1.0,
            vy: -1.1,
            scale
        });
    }

    /**
     * Master 60 FPS Render Loop
     */
    public render(engine: GameEngine, time: number) {
        this.setupDPI();
        this.ctx.save();

        // Screen shake
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
            this.screenShake *= 0.87;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // 1. Update Spring-Physics Scroll Camera
        const targetRow = engine.state === GameState.IDLE ? 1 : Math.max(1, engine.currentRow);
        if (engine.state === GameState.PLAYING && engine.currentRow === 1 && engine.currentPicks.length === 0) {
            // Reset ribbon when starting a brand new round
            if (this.cameraRow > 1.8) {
                this.cameraRow = 1;
                this.cameraVelocity = 0;
                this.ribbonTrail = [];
            }
        }

        const springForce = (targetRow - this.cameraRow) * 0.14;
        this.cameraVelocity = (this.cameraVelocity + springForce) * 0.72;
        this.cameraRow += this.cameraVelocity;

        // Scroll phase for side rail motion ticks
        this.scrollGridPhase = (this.scrollGridPhase + this.cameraVelocity * 42) % 24;

        // 2. Render Background & Corridor
        this.drawBackground(engine);
        this.drawCorridorRails(engine);

        // 3. Draw Conquered Trajectory Path (connecting cleared rows into the Arrow Ship)
        this.drawConqueredPath(engine);

        // 4. Draw Rows (from oldest visible at horizon down to upcoming at bottom)
        const minRow = Math.max(1, Math.floor(this.cameraRow - 4));
        const maxRow = Math.ceil(this.cameraRow + 1);
        for (let r = minRow; r <= maxRow; r++) {
            this.drawRow(engine, r, time);
        }

        // 5. Draw Aiming Reticle & Arrow Ship ("La Flechita")
        this.drawArrowShip(engine, time);

        // 6. Draw Alien Interceptor Saucer & Laser Matrix
        this.drawAlienInterceptor(time);

        // 7. Draw Shockwaves, Shards & Floating Banners
        this.drawShockwaves();
        this.drawShards();
        this.drawBanners();

        // 8. Screen Flashes
        if (this.redFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(233, 17, 60, ${this.redFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.redFlashAlpha *= 0.87;
        }
        if (this.cyanFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(6, 182, 212, ${this.cyanFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.cyanFlashAlpha *= 0.87;
        }
        if (this.goldFlashAlpha > 0) {
            this.ctx.fillStyle = `rgba(245, 158, 11, ${this.goldFlashAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.goldFlashAlpha *= 0.87;
        }

        this.ctx.restore();
    }

    private drawBackground(engine: GameEngine) {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, this.colors.bgTop);
        grad.addColorStop(0.55, '#0c1b26');
        grad.addColorStop(1, this.colors.bgBottom);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Horizon focal glow
        const horizonGrad = this.ctx.createRadialGradient(
            this.width / 2,
            this.horizonY + 10,
            8,
            this.width / 2,
            this.horizonY + 10,
            210
        );
        if (engine.luckyBoost) {
            horizonGrad.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
            horizonGrad.addColorStop(0.5, 'rgba(0, 231, 1, 0.04)');
        } else {
            horizonGrad.addColorStop(0, 'rgba(0, 231, 1, 0.07)');
            horizonGrad.addColorStop(0.5, 'rgba(26, 44, 56, 0.15)');
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
        trackGrad.addColorStop(0, 'rgba(15, 33, 46, 0.25)');
        trackGrad.addColorStop(0.3, 'rgba(22, 41, 54, 0.65)');
        trackGrad.addColorStop(1, 'rgba(15, 33, 46, 0.90)');

        this.ctx.fillStyle = trackGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(topSpan.left, this.horizonY);
        this.ctx.lineTo(topSpan.right, this.horizonY);
        this.ctx.lineTo(bottomSpan.right, this.bottomTrackY);
        this.ctx.lineTo(bottomSpan.left, this.bottomTrackY);
        this.ctx.closePath();
        this.ctx.fill();

        // 6 Longitudinal perspective lane rails
        for (let i = 0; i <= 5; i++) {
            const topX = topSpan.left + (i * topSpan.width) / 5;
            const bottomX = bottomSpan.left + (i * bottomSpan.width) / 5;

            const isOuter = i === 0 || i === 5;
            this.ctx.strokeStyle = isOuter
                ? engine.luckyBoost
                    ? 'rgba(245, 158, 11, 0.45)'
                    : '#334d5e'
                : 'rgba(47, 69, 83, 0.45)';
            this.ctx.lineWidth = isOuter ? 2.0 : 1.0;

            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.horizonY);
            this.ctx.lineTo(bottomX, this.bottomTrackY);
            this.ctx.stroke();
        }

        // Animated scrolling depth chevrons along outer rails to accentuate scroll velocity
        const numTicks = 12;
        this.ctx.strokeStyle = 'rgba(100, 127, 148, 0.25)';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < numTicks; i++) {
            const rawT = ((i / numTicks) - (this.cameraRow * 0.145) % 1 + 10) % 1;
            const y = this.depthToScreenY(rawT);
            if (y < this.horizonY + 8 || y > this.bottomTrackY - 8) continue;
            const span = this.getTrackSpanAtY(y);
            // Left tick
            this.ctx.beginPath();
            this.ctx.moveTo(span.left - 6, y);
            this.ctx.lineTo(span.left - 2, y);
            // Right tick
            this.ctx.moveTo(span.right + 2, y);
            this.ctx.lineTo(span.right + 6, y);
            this.ctx.stroke();
        }

        // Top horizon fade vignette
        const topFade = this.ctx.createLinearGradient(0, this.horizonY - 5, 0, this.horizonY + 38);
        topFade.addColorStop(0, this.colors.bgTop);
        topFade.addColorStop(1, 'rgba(8, 19, 27, 0)');
        this.ctx.fillStyle = topFade;
        this.ctx.fillRect(0, this.horizonY - 5, this.width, 44);
    }

    /**
     * Draws a glowing vector flight trajectory connecting all cleared lanes into the Arrow Ship!
     */
    private drawConqueredPath(engine: GameEngine) {
        if (engine.currentPicks.length === 0) return;

        const points: { x: number; y: number }[] = [];
        for (const pick of engine.currentPicks) {
            if (!pick.isSafe && !pick.shieldSaved) continue;
            const q = this.getCellQuad(pick.row, pick.lane);
            if (q.cy >= this.horizonY - 20 && q.cy <= this.bottomTrackY + 20) {
                points.push({ x: q.cx, y: q.cy });
            }
        }

        if (points.length === 0) return;

        // Connect last point to the Arrow Ship's current position
        if (engine.state !== GameState.CRASHED) {
            points.push({ x: this.shipX, y: this.shipY });
        }

        if (points.length < 2) return;

        this.ctx.save();
        // Outer glow line
        this.ctx.strokeStyle = engine.luckyBoost ? 'rgba(245, 158, 11, 0.28)' : 'rgba(0, 231, 1, 0.25)';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        points.forEach((pt, idx) => {
            if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
            else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();

        // Inner crisp vector core
        this.ctx.strokeStyle = engine.luckyBoost ? this.colors.goldLight : this.colors.green;
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        points.forEach((pt, idx) => {
            if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
            else this.ctx.lineTo(pt.x, pt.y);
        });
        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawRow(engine: GameEngine, row: number, time: number) {
        const sampleQuad = this.getCellQuad(row, 0);
        if (sampleQuad.y2 < this.horizonY + 2 || sampleQuad.y1 > this.bottomTrackY + 15) return;

        // Fade out rows near the very top horizon
        const horizonAlpha = Math.max(0, Math.min(1, (sampleQuad.cy - this.horizonY) / 48));
        this.ctx.save();
        this.ctx.globalAlpha = horizonAlpha;

        const spanBottom = this.getTrackSpanAtY(sampleQuad.y2);

        // Horizontal row divider
        this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.55)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spanBottom.left, sampleQuad.y2);
        this.ctx.lineTo(spanBottom.right, sampleQuad.y2);
        this.ctx.stroke();

        // Row label on left rail ("01", "02", "FILA 03")
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isAlienCleared = engine.alienDestroyedRows.has(row);
        const labelScale = Math.max(0.65, Math.min(1.0, spanBottom.width / this.bottomTrackWidth));
        const fontSize = Math.round(10 * labelScale);

        this.ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
        this.ctx.fillStyle = isActiveRow
            ? this.colors.green
            : isAlienCleared
              ? this.colors.cyanLight
              : this.colors.textMuted;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`F${row.toString().padStart(2, '0')}`, spanBottom.left - 8, sampleQuad.cy);

        for (let lane = 0; lane < 5; lane++) {
            this.drawCell(engine, row, lane, time);
        }

        this.ctx.restore();
    }

    private drawCell(engine: GameEngine, row: number, lane: number, time: number) {
        const quad = this.getCellQuad(row, lane);
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isPastRow = row < engine.currentRow;
        const isCrashedRow = row === engine.lastCrashedRow && engine.state === GameState.CRASHED;
        const specials = engine.getSpecialsForRow(row);
        const isGoldenLane = specials.goldenLane === lane;
        const isAlienLane = specials.alienLane === lane;

        // Smooth hover interpolation per lane
        if (isActiveRow) {
            const targetHover = this.hoverLane === lane ? 1 : 0;
            this.laneHoverProgress[lane] += (targetHover - this.laneHoverProgress[lane]) * 0.22;
        }

        // 1. ACTIVE FOREGROUND ROW: 5 Tactile Perspective Cards
        if (isActiveRow) {
            const hp = this.laneHoverProgress[lane];
            const insetX = quad.w * 0.07;
            const insetY = quad.h * 0.08;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const liftY = hp * -3.5;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2 + liftY;
            const radius = Math.min(8, cardW * 0.14);

            this.ctx.save();

            if (isGoldenLane) {
                // GOLDEN MULTIPLIER CARD (Bespoke Vector Star, Zero Emoji)
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.006);
                this.ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
                this.ctx.shadowBlur = 8 + hp * 10;

                const grad = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                grad.addColorStop(0, hp > 0.3 ? '#3b2b10' : '#2a2012');
                grad.addColorStop(1, '#1a1610');
                this.ctx.fillStyle = grad;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                // Bottom 3D lip
                this.ctx.fillStyle = '#92400e';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.3 ? this.colors.goldLight : this.colors.gold;
                this.ctx.lineWidth = 1.6 + hp * 0.8 + pulse * 0.3;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                // Vector 4-point star emblem in center
                this.drawVectorStar(quad.cx, cardY + cardH * 0.44, cardH * 0.20, this.colors.goldLight);

                // Multiplier Tag at bottom of card
                this.ctx.font = `800 ${Math.max(9, Math.round(cardH * 0.21))}px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = this.colors.goldLight;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${specials.goldenBoost.toFixed(1)}x`, quad.cx, cardY + cardH * 0.78);
            } else if (isAlienLane) {
                // ALIEN INTERCEPTOR CARD (Bespoke Vector Saucer, Zero Emoji)
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.007);
                this.ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
                this.ctx.shadowBlur = 8 + hp * 10;

                const grad = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                grad.addColorStop(0, hp > 0.3 ? '#11323d' : '#102631');
                grad.addColorStop(1, '#0d1b24');
                this.ctx.fillStyle = grad;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.fillStyle = '#155e75';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.3 ? '#ffffff' : this.colors.cyanLight;
                this.ctx.lineWidth = 1.6 + hp * 0.8 + pulse * 0.3;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                // Vector Saucer Icon in center
                this.drawVectorSaucerIcon(quad.cx, cardY + cardH * 0.42, cardW * 0.28, this.colors.cyanLight);

                // WARP +2 Tag
                this.ctx.font = `800 ${Math.max(8, Math.round(cardH * 0.19))}px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = this.colors.cyanLight;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`WARP +2`, quad.cx, cardY + cardH * 0.78);
            } else {
                // STANDARD TACTILE CARD
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(0, 231, 1, 0.25)';
                    this.ctx.shadowBlur = hp * 12;
                }

                this.ctx.fillStyle = hp > 0.3 ? this.colors.cardHover : this.colors.cardFace;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                // Bottom tactile bevel lip
                this.ctx.fillStyle = '#132029';
                this.roundRect(cardX, cardY + cardH - 3, cardW, 3, 2, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? this.colors.green : this.colors.cardBorder;
                this.ctx.lineWidth = 1.4 + hp * 0.8;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                // Subtle geometric diamond silhouette or question glyph
                const fontSize = Math.max(13, Math.round(cardH * 0.38));
                this.ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = hp > 0.25 ? '#ffffff' : '#557086';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', quad.cx, cardY + cardH * 0.5);
            }

            this.ctx.restore();
        }
        // 2. CONQUERED PAST ROWS (Trailing above the ship)
        else if (isPastRow) {
            // Pop scale animation when newly revealed
            const popTime = this.rowPopTimestamps.get(row);
            let popScale = 1.0;
            if (popTime) {
                const elapsed = ( performance.now() - popTime ) / 260;
                if (elapsed < 1) {
                    popScale = 1 + Math.sin(elapsed * Math.PI) * 0.28;
                }
            }

            if (engine.alienDestroyedRows.has(row)) {
                this.drawFacetedDiamond(quad.cx, quad.cy, quad.w * 0.20 * popScale, this.colors.cyan, this.colors.cyanLight);
                if (lane === 2) {
                    this.ctx.font = `800 ${Math.max(8, Math.round(quad.h * 0.22))}px "JetBrains Mono", monospace`;
                    this.ctx.fillStyle = this.colors.cyanLight;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('WARP CLEAR', quad.cx, quad.cy + quad.h * 0.36);
                }
                return;
            }

            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const isPicked = pick && pick.lane === lane;

            if (isPicked) {
                if (pick.shieldSaved) {
                    this.drawVectorShieldCrest(quad.cx, quad.cy, quad.w * 0.24 * popScale, this.colors.cyanLight);
                } else if (pick.specialType === 'GOLDEN') {
                    this.drawFacetedDiamond(quad.cx, quad.cy - 2, quad.w * 0.26 * popScale, this.colors.gold, this.colors.goldLight);
                    this.ctx.font = `800 ${Math.max(8, Math.round(quad.h * 0.22))}px "JetBrains Mono", monospace`;
                    this.ctx.fillStyle = this.colors.goldLight;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`${pick.boostApplied.toFixed(0)}x`, quad.cx, quad.cy + quad.h * 0.34);
                } else if (pick.specialType === 'ALIEN') {
                    this.drawFacetedDiamond(quad.cx, quad.cy - 2, quad.w * 0.26 * popScale, this.colors.cyan, this.colors.cyanLight);
                } else {
                    this.drawFacetedDiamond(quad.cx, quad.cy - 2, quad.w * 0.24 * popScale, this.colors.green, '#86efac');
                    this.ctx.font = `700 ${Math.max(8, Math.round(quad.h * 0.21))}px "JetBrains Mono", monospace`;
                    this.ctx.fillStyle = this.colors.green;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(formatMultiplier(pick.stepMultiplierAfter), quad.cx, quad.cy + quad.h * 0.34);
                }
            } else {
                // Near-miss ghost reveal on cleared rows!
                if (isHazard) {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.26;
                    this.drawVectorMine(quad.cx, quad.cy, quad.w * 0.18, false);
                    this.ctx.restore();
                } else {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.16;
                    this.drawFacetedDiamond(quad.cx, quad.cy, quad.w * 0.13, this.colors.green, '#86efac');
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
                this.drawVectorMine(quad.cx, quad.cy, quad.w * (wasPicked ? 0.28 : 0.21), wasPicked);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha *= 0.35;
                this.drawFacetedDiamond(quad.cx, quad.cy, quad.w * 0.18, this.colors.green, '#86efac');
                this.ctx.restore();
            }
        }
        // 4. UPCOMING PREVIEW ROW (At bottom edge of corridor)
        else {
            const insetX = quad.w * 0.08;
            const insetY = quad.h * 0.12;
            const cardW = quad.w - insetX * 2;
            const cardH = quad.h - insetY * 2;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;

            this.ctx.fillStyle = isGoldenLane
                ? 'rgba(245, 158, 11, 0.08)'
                : isAlienLane
                  ? 'rgba(6, 182, 212, 0.08)'
                  : 'rgba(26, 44, 56, 0.38)';
            this.roundRect(cardX, cardY, cardW, cardH, 5, true, false);

            this.ctx.strokeStyle = isGoldenLane
                ? 'rgba(245, 158, 11, 0.35)'
                : isAlienLane
                  ? 'rgba(6, 182, 212, 0.35)'
                  : 'rgba(47, 69, 83, 0.38)';
            this.ctx.lineWidth = 1;
            this.roundRect(cardX, cardY, cardW, cardH, 5, false, true);
        }
    }

    /**
     * Renders "La Flechita" — the sleek geometric vector Arrow Ship that advances down the corridor,
     * banks dynamically into chosen lanes, and projects a targeting vector toward the hovered card!
     */
    private drawArrowShip(engine: GameEngine, time: number) {
        if (engine.state === GameState.CRASHED) return;

        // Position the Arrow Ship on the row just above the active row (`currentRow - 1`),
        // or poised above Row 1 when idle / at start of round.
        const anchorRow = engine.state === GameState.PLAYING ? engine.currentRow - 0.82 : 0.18;
        const anchorLane = engine.lastChosenLane;
        const anchorQuad = this.getCellQuad(anchorRow, anchorLane);

        const targetX = anchorQuad.cx;
        const targetY = anchorQuad.cy;

        // Spring physics for Arrow Ship position
        const ax = (targetX - this.shipX) * 0.20;
        const ay = (targetY - this.shipY) * 0.20;
        this.shipVx = (this.shipVx + ax) * 0.68;
        this.shipVy = (this.shipVy + ay) * 0.68;
        this.shipX += this.shipVx;
        this.shipY += this.shipVy;

        this.shipThrust *= 0.86;

        // Calculate banking / aiming rotation angle:
        // Points downwards (0 rad = straight down) + tilts toward hovered lane or velocity!
        let targetAngle = -this.shipVx * 0.045;
        if (engine.state === GameState.PLAYING && this.hoverLane !== null) {
            const hoverQuad = this.getCellQuad(engine.currentRow, this.hoverLane);
            const dx = hoverQuad.cx - this.shipX;
            const dy = Math.max(20, hoverQuad.cy - this.shipY);
            targetAngle = Math.atan2(dx, dy) * 0.55;

            // Draw subtle dashed targeting guide line from Arrow Ship tip to hovered card!
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(0, 231, 1, 0.32)';
            this.ctx.lineWidth = 1.5;
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.shipX, this.shipY + 14);
            this.ctx.lineTo(hoverQuad.cx, hoverQuad.cy - hoverQuad.h * 0.25);
            this.ctx.stroke();
            this.ctx.restore();
        }
        this.shipAngle += (targetAngle - this.shipAngle) * 0.22;

        // Record ribbon trail node
        this.ribbonTrail.unshift({ x: this.shipX, y: this.shipY - 8, alpha: 0.75 });
        if (this.ribbonTrail.length > 14) this.ribbonTrail.pop();
        for (let i = 0; i < this.ribbonTrail.length; i++) {
            this.ribbonTrail[i].y -= this.cameraVelocity * 3.5;
            this.ribbonTrail[i].alpha *= 0.86;
        }

        // Draw thruster ribbon trail behind the arrow
        if (this.ribbonTrail.length > 2) {
            this.ctx.save();
            for (let i = 0; i < this.ribbonTrail.length - 1; i++) {
                const p1 = this.ribbonTrail[i];
                const p2 = this.ribbonTrail[i + 1];
                const w = Math.max(1, (1 - i / this.ribbonTrail.length) * 6);
                this.ctx.strokeStyle = engine.luckyBoost
                    ? `rgba(253, 224, 71, ${p1.alpha * 0.45})`
                    : `rgba(0, 231, 1, ${p1.alpha * 0.45})`;
                this.ctx.lineWidth = w;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }

        const bobY = Math.sin(time * 0.005) * 2.0;

        this.ctx.save();
        this.ctx.translate(this.shipX, this.shipY + bobY);
        this.ctx.rotate(-this.shipAngle);

        // Stretch slightly on forward thrust impulse
        const stretchY = 1.0 + this.shipThrust * 0.18;
        const stretchX = 1.0 - this.shipThrust * 0.08;
        this.ctx.scale(stretchX, stretchY);

        // If Deflector Shield is active, draw crisp rotating hexagonal energy barrier
        const showShield = engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased;
        if (showShield) {
            this.ctx.save();
            this.ctx.rotate(time * 0.0025);
            this.ctx.strokeStyle = this.colors.cyanLight;
            this.ctx.fillStyle = 'rgba(6, 182, 212, 0.10)';
            this.ctx.lineWidth = 1.5;
            this.ctx.shadowColor = this.colors.cyan;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            const r = 23;
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

        // Rear Thruster Flame (pointing UP at y < 0 since the arrow points DOWN at y > 0)
        const flameLen = 10 + Math.sin(time * 0.04) * 3 + this.shipThrust * 12;
        const flameColor = engine.luckyBoost ? this.colors.goldLight : this.colors.green;
        this.ctx.fillStyle = flameColor;
        this.ctx.shadowColor = flameColor;
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.moveTo(-4.5, -6);
        this.ctx.lineTo(0, -6 - flameLen);
        this.ctx.lineTo(4.5, -6);
        this.ctx.closePath();
        this.ctx.fill();

        // THE ARROW SHIP ("LA FLECHITA") — Precision Geometric Stealth Chevron pointing DOWNWARDS
        // Left & Right Faceted Halves for 3D Metallic Depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        this.ctx.shadowBlur = 8;

        // Left Wing Facet (Bright Lit)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 17);     // Leading sharp tip (pointing down into the descent)
        this.ctx.lineTo(-15, -11);  // Left swept wingtip
        this.ctx.lineTo(-4, -5);    // Left inner notch
        this.ctx.lineTo(0, -8);     // Center tail spine
        this.ctx.closePath();
        this.ctx.fill();

        // Right Wing Facet (Shaded Metallic Slate)
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 17);     // Leading sharp tip
        this.ctx.lineTo(15, -11);   // Right swept wingtip
        this.ctx.lineTo(4, -5);     // Right inner notch
        this.ctx.lineTo(0, -8);     // Center tail spine
        this.ctx.closePath();
        this.ctx.fill();

        // Crisp Outer Wireframe Edge & Center Spine
        this.ctx.strokeStyle = engine.luckyBoost ? this.colors.goldLight : '#ffffff';
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 17);
        this.ctx.lineTo(15, -11);
        this.ctx.lineTo(4, -5);
        this.ctx.lineTo(0, -8);
        this.ctx.lineTo(-4, -5);
        this.ctx.lineTo(-15, -11);
        this.ctx.closePath();
        this.ctx.stroke();

        // Glowing Core Chevron Inset
        this.ctx.strokeStyle = flameColor;
        this.ctx.lineWidth = 1.6;
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -2);
        this.ctx.lineTo(0, 9);
        this.ctx.lineTo(6, -2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Pure Vector Alien Interceptor Saucer & Volumetric Laser Matrix (Zero Emojis)
     */
    private drawAlienInterceptor(time: number) {
        if (!this.alienEvent.active) return;

        this.alienEvent.progress += 0.024;
        if (this.alienEvent.progress >= 1.0) {
            this.alienEvent.active = false;
            return;
        }

        const p = this.alienEvent.progress;
        const ufoX =
            p < 0.25
                ? 30 + (this.alienEvent.targetX - 30) * (p / 0.25)
                : p < 0.78
                  ? this.alienEvent.targetX + Math.sin(p * 22) * 16
                  : this.alienEvent.targetX + (this.width - 30 - this.alienEvent.targetX) * ((p - 0.78) / 0.22);
        const ufoY = 120 + Math.sin(p * Math.PI) * 14;

        this.ctx.save();

        // Volumetric Laser Scan Beam
        if (p > 0.14 && p < 0.86) {
            const beamAlpha = Math.sin(((p - 0.14) / 0.72) * Math.PI);
            const grad = this.ctx.createLinearGradient(ufoX, ufoY, ufoX, this.bottomTrackY - 20);
            grad.addColorStop(0, `rgba(103, 232, 249, ${0.85 * beamAlpha})`);
            grad.addColorStop(0.5, `rgba(0, 231, 1, ${0.45 * beamAlpha})`);
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.moveTo(ufoX - 6, ufoY + 8);
            this.ctx.lineTo(ufoX + 6, ufoY + 8);
            this.ctx.lineTo(ufoX + 85, this.bottomTrackY - 30);
            this.ctx.lineTo(ufoX - 85, this.bottomTrackY - 30);
            this.ctx.closePath();
            this.ctx.fill();

            // Laser spine
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * beamAlpha})`;
            this.ctx.lineWidth = 2.2;
            this.ctx.beginPath();
            this.ctx.moveTo(ufoX, ufoY + 8);
            this.ctx.lineTo(ufoX, this.bottomTrackY - 50);
            this.ctx.stroke();
        }

        // Vector Saucer Craft
        this.drawVectorSaucerIcon(ufoX, ufoY, 34, this.colors.cyanLight, time);
        this.ctx.restore();
    }

    private drawFacetedDiamond(cx: number, cy: number, size: number, primary: string, highlight: string) {
        this.ctx.save();
        this.ctx.shadowColor = primary;
        this.ctx.shadowBlur = size * 0.65;

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
        this.ctx.moveTo(cx, cy - size * 0.58);
        this.ctx.lineTo(cx + size * 0.38, cy);
        this.ctx.lineTo(cx, cy + size * 0.18);
        this.ctx.lineTo(cx - size * 0.38, cy);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    private drawVectorStar(cx: number, cy: number, r: number, color: string) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 6;
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
        this.ctx.lineWidth = 1.6;

        // Upper canopy dome
        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.08, radius * 0.45, Math.PI, 0);
        this.ctx.fill();
        this.ctx.stroke();

        // Saucer disc
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius, radius * 0.28, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // 3 Vector energy nodes
        for (let i = -1; i <= 1; i++) {
            const pulse = time > 0 ? Math.sin(time * 0.015 + i) * 1.5 : 0;
            this.ctx.fillStyle = i === 0 ? '#00e701' : color;
            this.ctx.beginPath();
            this.ctx.arc(i * radius * 0.52 + pulse, 0, Math.max(1.8, radius * 0.09), 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    private drawVectorShieldCrest(cx: number, cy: number, size: number, color: string) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
        this.ctx.lineWidth = 1.8;
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
            this.ctx.shadowBlur = radius * 1.3;
        }

        // 8 radial spikes
        this.ctx.strokeStyle = this.colors.red;
        this.ctx.lineWidth = Math.max(1.5, radius * 0.22);
        for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI) / 4;
            this.ctx.beginPath();
            this.ctx.moveTo(cx + Math.cos(ang) * radius * 0.5, cy + Math.sin(ang) * radius * 0.5);
            this.ctx.lineTo(cx + Math.cos(ang) * radius * 1.28, cy + Math.sin(ang) * radius * 1.28);
            this.ctx.stroke();
        }

        // Mine core
        this.ctx.fillStyle = this.colors.red;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner white core ring
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    private drawShockwaves() {
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.16;
            sw.alpha -= 0.042;

            if (sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.strokeStyle = sw.color;
            this.ctx.globalAlpha = Math.max(0, sw.alpha);
            this.ctx.lineWidth = 2.2;
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
            s.vy += 0.20;
            s.rot += s.vRot;
            s.alpha -= 0.024;

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

    private drawBanners() {
        for (let i = this.banners.length - 1; i >= 0; i--) {
            const b = this.banners[i];
            b.y += b.vy;
            b.alpha -= 0.018;

            if (b.alpha <= 0) {
                this.banners.splice(i, 1);
                continue;
            }

            this.ctx.save();
            const fontSize = Math.round(13 * b.scale);
            this.ctx.font = `800 ${fontSize}px "JetBrains Mono", monospace`;
            this.ctx.fillStyle = b.color;
            this.ctx.globalAlpha = Math.max(0, b.alpha);
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            this.ctx.shadowBlur = 6;
            this.ctx.fillText(b.text, b.x, b.y);
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
