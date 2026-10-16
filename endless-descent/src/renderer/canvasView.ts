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

    // Uniform 1:1 coordinate system (width fixed to 410; balanced sleek intermediate proportions)
    public width = 410;
    public height = 410;

    private lastPixelW = 0;
    private lastPixelH = 0;

    // Dynamic Corridor Geometry (recomputed cleanly from true height)
    private horizonY = 56;
    private bottomTrackY = 405;
    private readonly topTrackWidth = 152;
    private readonly bottomTrackWidth = 368;

    // Balanced intermediate row spacing
    private readonly activeRowCenterT = 0.73;
    private readonly rowDepthStep = 0.155;
    private readonly shipRestT = 0.42;

    public hoverLane: number | null = null;
    private laneHoverProgress: number[] = [0, 0, 0, 0, 0];

    // Monotonic Smooth Scroll Camera
    public cameraRow = 1;

    // Arrow Ship ("La Flechita") Physics State
    public shipX = 205;
    public shipY = 175;
    private shipAngle = 0;
    private shipDashImpulse = 0;

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
        targetX: 215,
        targetY: 320
    };

    private readonly colors = {
        bgTop: '#071118',
        bgBottom: '#0f212e',
        cardFace: '#213743',
        cardHover: '#2b4656',
        cardBorder: '#345063',
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
     * Strict 1:1 Uniform Aspect Scaling:
     * ScaleX and ScaleY are ALWAYS identical (`scale = pixelW / this.width`),
     * completely eliminating vertical distortion or stretched icons/cards.
     */
    public setupDPI(force = false) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssW = rect.width > 0 ? rect.width : 410;
        const cssH = rect.height > 0 ? rect.height : 410;
        const pixelW = Math.round(cssW * dpr);
        const pixelH = Math.round(cssH * dpr);

        this.width = 410;
        this.height = Math.max(340, Math.round(410 * (cssH / cssW)));

        // Keep corridor compact and well-proportioned within the stage
        this.horizonY = Math.round(this.height * 0.135);
        this.bottomTrackY = Math.round(this.height * 0.94);

        if (force || pixelW !== this.lastPixelW || pixelH !== this.lastPixelH) {
            this.lastPixelW = pixelW;
            this.lastPixelH = pixelH;
            this.canvas.width = pixelW;
            this.canvas.height = pixelH;
        }

        const uniformScale = pixelW / this.width;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(uniformScale, uniformScale);
    }

    /**
     * Maps normalized depth t in [0, 1] with natural perspective foreshortening.
     */
    private depthToScreenY(t: number): number {
        const clamped = Math.max(-0.25, Math.min(1.3, t));
        if (clamped < 0) {
            return this.horizonY + clamped * 75;
        }
        return this.horizonY + Math.pow(clamped, 1.22) * (this.bottomTrackY - this.horizonY);
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
     * Computes the 2D perspective cell bounds for (row, lane).
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
        const scale = this.width / rect.width;
        const cx = (clientX - rect.left) * scale;
        const cy = (clientY - rect.top) * scale;

        for (let l = 0; l < 5; l++) {
            const quad = this.getCellQuad(activeRow, l);
            const padX = quad.w * 0.12;
            const padY = quad.h * 0.25;
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

        const lastLane = this.hoverLane ?? 2;
        const q = this.getCellQuad(row, lastLane);
        this.shockwaves.push({
            x: q.cx,
            y: q.cy,
            radius: 6,
            maxRadius: 44,
            color: this.colors.green,
            alpha: 0.65
        });
    }

    public triggerWinCelebration() {
        this.greenFlashAlpha = 0.15;
        this.shockwaves.push({
            x: this.shipX,
            y: this.shipY,
            radius: 10,
            maxRadius: 115,
            color: this.colors.green,
            alpha: 0.9
        });

        const winColors = ['#00e701', '#86efac', '#fde047', '#ffffff'];
        for (let i = 0; i < 26; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
            const speed = 2.5 + Math.random() * 6.0;
            this.shards.push({
                x: this.shipX + (Math.random() - 0.5) * 28,
                y: this.shipY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.4,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.25,
                length: 5 + Math.random() * 8,
                alpha: 1.0,
                color: winColors[i % winColors.length]
            });
        }
    }

    public triggerCrashEffect(cx: number, cy: number) {
        this.screenShake = 15;
        this.redFlashAlpha = 0.34;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 105,
            color: this.colors.red,
            alpha: 1.0
        });

        const shardColors = ['#ffffff', '#ff1e42', '#ff6b8b', '#ff1e42'];
        for (let i = 0; i < 32; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.8 + Math.random() * 7.5;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 6 + Math.random() * 10,
                alpha: 1.0,
                color: shardColors[i % shardColors.length]
            });
        }
    }

    public triggerGoldenBurst(cx: number, cy: number) {
        this.screenShake = 6;
        this.goldFlashAlpha = 0.16;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 8,
            maxRadius: 85,
            color: this.colors.goldLight,
            alpha: 1.0
        });

        const goldColors = ['#fde047', '#f59e0b', '#ffffff'];
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 4.8;
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
        this.screenShake = 10;
        this.cyanFlashAlpha = 0.22;
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: 100,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const shieldColors = ['#67e8f9', '#06b6d4', '#ffffff'];
        for (let i = 0; i < 22; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.6 + Math.random() * 5.5;
            this.shards.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                length: 5 + Math.random() * 8,
                alpha: 1.0,
                color: shieldColors[i % shieldColors.length]
            });
        }
    }

    public triggerAlienUfoAttack(cx: number, cy: number) {
        this.screenShake = 11;
        this.cyanFlashAlpha = 0.20;

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
            maxRadius: 125,
            color: this.colors.cyanLight,
            alpha: 1.0
        });

        const colors = ['#67e8f9', '#00e701', '#ffffff'];
        for (let i = 0; i < 28; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.6 + Math.random() * 6.0;
            this.shards.push({
                x: cx + (Math.random() - 0.5) * 90,
                y: cy + (Math.random() - 0.5) * 45,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.35,
                length: 5 + Math.random() * 9,
                alpha: 1.0,
                color: colors[i % colors.length]
            });
        }
    }

    public addFloatingText(x: number, y: number, text: string, color = '#00e701', scale = 1.0) {
        if (this.banners.length >= 2) {
            this.banners.shift();
        }
        this.banners.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -0.9,
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

        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
            this.screenShake *= 0.86;
            if (this.screenShake < 0.2) this.screenShake = 0;
        }

        // 1. Monotonic Critically-Damped Scroll Camera
        const targetRow = engine.state === GameState.IDLE ? 1 : Math.max(1, engine.currentRow);
        if (
            engine.state === GameState.PLAYING &&
            engine.currentRow === 1 &&
            engine.currentPicks.length === 0
        ) {
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

        // 3. Draw Conquered Trajectory Path
        this.drawConqueredPath(engine);

        // 4. Draw Rows with smooth top AND bottom fade envelopes
        const minRow = Math.max(1, Math.floor(this.cameraRow - 4));
        const maxRow = Math.floor(this.cameraRow + 2);
        for (let r = minRow; r <= maxRow; r++) {
            this.drawRow(engine, r, time);
        }

        // 5. Draw Precision Aerospace Arrow Ship ("La Flechita")
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

        const horizonGrad = this.ctx.createRadialGradient(
            this.width / 2,
            this.horizonY + 12,
            6,
            this.width / 2,
            this.horizonY + 12,
            180
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

        for (let i = 0; i <= 5; i++) {
            const topX = topSpan.left + (i * topSpan.width) / 5;
            const bottomX = bottomSpan.left + (i * bottomSpan.width) / 5;

            const isOuter = i === 0 || i === 5;
            this.ctx.strokeStyle = isOuter
                ? engine.luckyBoost
                    ? 'rgba(245, 158, 11, 0.36)'
                    : '#2d4657'
                : 'rgba(47, 69, 83, 0.28)';
            this.ctx.lineWidth = isOuter ? 1.6 : 1.0;

            this.ctx.beginPath();
            this.ctx.moveTo(topX, this.horizonY);
            this.ctx.lineTo(bottomX, this.bottomTrackY);
            this.ctx.stroke();
        }

        // Top horizon fade vignette
        const topFade = this.ctx.createLinearGradient(0, this.horizonY - 4, 0, this.horizonY + 30);
        topFade.addColorStop(0, this.colors.bgTop);
        topFade.addColorStop(1, 'rgba(7, 17, 24, 0)');
        this.ctx.fillStyle = topFade;
        this.ctx.fillRect(0, this.horizonY - 4, this.width, 34);
    }

    private drawConqueredPath(engine: GameEngine) {
        if (engine.currentPicks.length === 0) return;

        const points: { x: number; y: number }[] = [];
        for (const pick of engine.currentPicks) {
            if (!pick.isSafe && !pick.shieldSaved) continue;
            const q = this.getCellQuad(pick.row, pick.lane);
            if (q.cy >= this.horizonY - 10 && q.cy <= this.bottomTrackY) {
                points.push({ x: q.cx, y: q.cy });
            }
        }

        if (engine.state !== GameState.CRASHED) {
            points.push({ x: this.shipX, y: this.shipY });
        }

        if (points.length < 2) return;

        this.ctx.save();
        this.ctx.strokeStyle = engine.luckyBoost
            ? 'rgba(253, 224, 71, 0.4)'
            : 'rgba(0, 231, 1, 0.38)';
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

    private drawRow(engine: GameEngine, row: number, time: number) {
        const sampleQuad = this.getCellQuad(row, 0);
        if (sampleQuad.y2 < this.horizonY || sampleQuad.y1 > this.bottomTrackY + 24) return;

        const topAlpha = Math.max(0, Math.min(1, (sampleQuad.cy - (this.horizonY + 6)) / 40));
        const bottomAlpha = Math.max(0, Math.min(1, (this.bottomTrackY + 12 - sampleQuad.cy) / 50));
        const rowAlpha = topAlpha * bottomAlpha;
        if (rowAlpha <= 0.01) return;

        this.ctx.save();
        this.ctx.globalAlpha = rowAlpha;

        const spanBottom = this.getTrackSpanAtY(sampleQuad.y2);

        this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.32)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(spanBottom.left, sampleQuad.y2);
        this.ctx.lineTo(spanBottom.right, sampleQuad.y2);
        this.ctx.stroke();

        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isAlienCleared = engine.alienDestroyedRows.has(row);
        const labelScale = Math.max(0.68, Math.min(1.0, spanBottom.width / this.bottomTrackWidth));
        const fontSize = Math.round(9.5 * labelScale);

        this.ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
        this.ctx.fillStyle = isActiveRow
            ? this.colors.green
            : isAlienCleared
              ? this.colors.cyanLight
              : this.colors.textMuted;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(row.toString().padStart(2, '0'), spanBottom.left - 7, sampleQuad.cy);

        for (let lane = 0; lane < 5; lane++) {
            this.drawCell(engine, row, lane, time);
        }

        this.ctx.restore();
    }

    private drawCell(engine: GameEngine, row: number, lane: number, time: number) {
        const quad = this.getCellQuad(row, lane);
        const isActiveRow = row === engine.currentRow && engine.state === GameState.PLAYING;
        const isIdleFirstRow =
            row === 1 && engine.state !== GameState.PLAYING && engine.currentRow === 1;
        const isPastRow = row < engine.currentRow;
        const isCrashedRow = row === engine.lastCrashedRow && engine.state === GameState.CRASHED;
        const specials = engine.getSpecialsForRow(row);
        const isGoldenLane = specials.goldenLane === lane;
        const isAlienLane = specials.alienLane === lane;

        if (isActiveRow) {
            const targetHover = this.hoverLane === lane ? 1 : 0;
            this.laneHoverProgress[lane] += (targetHover - this.laneHoverProgress[lane]) * 0.24;
        } else {
            this.laneHoverProgress[lane] *= 0.8;
        }

        const distFromCamera = Math.abs(row - this.cameraRow);
        const activeReadiness = Math.max(0, Math.min(1, 1 - distFromCamera * 0.85));

        // 1. ACTIVE FOREGROUND ROW: Balanced, sleek Stake Originals 3D tiles
        if (isActiveRow || isIdleFirstRow) {
            const hp = isActiveRow ? this.laneHoverProgress[lane] : 0;
            const insetX = quad.w * 0.07;
            const cardW = quad.w - insetX * 2;
            const cardH = Math.min(quad.h * 0.86, cardW * 0.94);
            const liftY = hp * -3.5;
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2 + liftY;
            const radius = 7;

            this.ctx.save();
            this.ctx.globalAlpha *= 0.45 + 0.55 * activeReadiness;

            if (isGoldenLane && isActiveRow) {
                // PREMIUM GOLDEN MULTIPLIER TILE
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
                    this.ctx.shadowBlur = hp * 12;
                }

                // 3D Base Shadow Lip
                this.ctx.fillStyle = '#78350f';
                this.roundRect(cardX, cardY + 3, cardW, cardH, radius, true, false);

                // Brushed Dark-Gold Tile Surface
                const faceGrad = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                faceGrad.addColorStop(0, hp > 0.25 ? '#423013' : '#312310');
                faceGrad.addColorStop(1, '#1f170c');
                this.ctx.fillStyle = faceGrad;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? '#fef08a' : '#f59e0b';
                this.ctx.lineWidth = 1.4 + hp * 0.6;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                // Premium Faceted Gold Starburst Gem
                this.drawPremiumStarGem(quad.cx, cardY + cardH * 0.40, cardH * 0.23);

                // Crisp Pill Badge at bottom
                this.ctx.font = `800 9.5px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = '#fef08a';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${specials.goldenBoost.toFixed(0)}X`, quad.cx, cardY + cardH * 0.78);
            } else if (isAlienLane && isActiveRow) {
                // PREMIUM ALIEN INTERCEPTOR TILE
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(6, 182, 212, 0.45)';
                    this.ctx.shadowBlur = hp * 12;
                }

                this.ctx.fillStyle = '#0e485c';
                this.roundRect(cardX, cardY + 3, cardW, cardH, radius, true, false);

                const faceGrad = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                faceGrad.addColorStop(0, hp > 0.25 ? '#163b4a' : '#122c38');
                faceGrad.addColorStop(1, '#0c1d26');
                this.ctx.fillStyle = faceGrad;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                this.ctx.strokeStyle = hp > 0.25 ? '#ffffff' : this.colors.cyanLight;
                this.ctx.lineWidth = 1.4 + hp * 0.6;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                // Premium Saucer Emblem
                this.drawPremiumUfo(quad.cx, cardY + cardH * 0.42, cardW * 0.26, time);

                this.ctx.font = `800 9px "JetBrains Mono", monospace`;
                this.ctx.fillStyle = this.colors.cyanLight;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`+2F`, quad.cx, cardY + cardH * 0.78);
            } else {
                // PREMIUM STAKE ORIGINALS TACTILE TILE
                if (hp > 0.05) {
                    this.ctx.shadowColor = 'rgba(0, 231, 1, 0.22)';
                    this.ctx.shadowBlur = hp * 10;
                }

                // 3D Bottom Base Lip (Stake Mines signature bevel)
                this.ctx.fillStyle = '#13222b';
                this.roundRect(cardX, cardY + 3.5, cardW, cardH, radius, true, false);

                // Main Tile Face
                const faceGrad = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
                faceGrad.addColorStop(0, hp > 0.25 ? '#2c4859' : '#233947');
                faceGrad.addColorStop(1, hp > 0.25 ? '#233947' : '#1c2f3b');
                this.ctx.fillStyle = faceGrad;
                this.roundRect(cardX, cardY, cardW, cardH, radius, true, false);

                // Crisp Top Bevel Rim
                this.ctx.strokeStyle = hp > 0.25 ? this.colors.green : '#334f63';
                this.ctx.lineWidth = 1.3 + hp * 0.7;
                this.roundRect(cardX, cardY, cardW, cardH, radius, false, true);

                if (hp > 0.35 && isActiveRow) {
                    const nextMult = calculateNextStepMultiplier(
                        engine.currentMultiplier,
                        engine.minesCount,
                        engine.currentRow === 1,
                        1.0,
                        engine.hasActiveShield
                    );
                    this.ctx.font = `800 10.5px "JetBrains Mono", monospace`;
                    this.ctx.fillStyle = this.colors.green;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(formatMultiplier(nextMult), quad.cx, cardY + cardH * 0.5);
                } else {
                    // Recessed Engraved Octagonal Socket in center of unrevealed tile
                    const sockR = Math.min(cardW, cardH) * 0.16;
                    this.ctx.fillStyle = '#162630';
                    this.ctx.strokeStyle = '#2b4354';
                    this.ctx.lineWidth = 1.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(quad.cx, cardY + cardH * 0.5 - sockR);
                    this.ctx.lineTo(quad.cx + sockR, cardY + cardH * 0.5);
                    this.ctx.lineTo(quad.cx, cardY + cardH * 0.5 + sockR);
                    this.ctx.lineTo(quad.cx - sockR, cardY + cardH * 0.5);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }

            this.ctx.restore();
        }
        // 2. CONQUERED PAST ROWS
        else if (isPastRow) {
            const stepTime = this.rowStepTimestamps.get(row);
            const elapsedMs = stepTime ? performance.now() - stepTime : 9999;

            let popScale = 1.0;
            if (elapsedMs < 240) {
                popScale = 1 + Math.sin((elapsedMs / 240) * Math.PI) * 0.25;
            }

            if (engine.alienDestroyedRows.has(row)) {
                this.drawPremiumGem(quad.cx, quad.cy, quad.w * 0.16 * popScale, 'cyan');
                return;
            }

            const pick = engine.currentPicks.find((p) => p.row === row);
            const hazards = pick ? pick.hazards : engine.getHazardsForActionRow(row);
            const isHazard = hazards.includes(lane);
            const isPicked = pick && pick.lane === lane;

            if (isPicked) {
                if (pick.shieldSaved) {
                    this.drawPremiumShield(quad.cx, quad.cy, quad.w * 0.19 * popScale);
                } else if (pick.specialType === 'GOLDEN') {
                    this.drawPremiumGem(quad.cx, quad.cy, quad.w * 0.19 * popScale, 'gold');
                } else if (pick.specialType === 'ALIEN') {
                    this.drawPremiumGem(quad.cx, quad.cy, quad.w * 0.19 * popScale, 'cyan');
                } else {
                    this.drawPremiumGem(quad.cx, quad.cy, quad.w * 0.18 * popScale, 'emerald');
                }
            } else {
                const nearMissPulse = elapsedMs < 650 ? (1 - elapsedMs / 650) * 0.34 : 0;
                if (isHazard) {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.11 + nearMissPulse;
                    this.drawPremiumMine(quad.cx, quad.cy, quad.w * 0.15, false);
                    this.ctx.restore();
                } else {
                    this.ctx.save();
                    this.ctx.globalAlpha *= 0.07;
                    this.ctx.fillStyle = '#476275';
                    this.ctx.beginPath();
                    this.ctx.arc(quad.cx, quad.cy, Math.max(1.5, quad.w * 0.038), 0, Math.PI * 2);
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
                this.drawPremiumMine(quad.cx, quad.cy, quad.w * (wasPicked ? 0.24 : 0.18), wasPicked);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha *= 0.28;
                this.drawPremiumGem(quad.cx, quad.cy, quad.w * 0.16, 'emerald');
                this.ctx.restore();
            }
        }
        // 4. UPCOMING PREVIEW ROW
        else {
            const insetX = quad.w * 0.085;
            const cardW = quad.w - insetX * 2;
            const cardH = Math.min(quad.h * 0.76, cardW * 0.72);
            const cardX = quad.cx - cardW / 2;
            const cardY = quad.cy - cardH / 2;

            this.ctx.fillStyle = 'rgba(24, 41, 52, 0.36)';
            this.roundRect(cardX, cardY, cardW, cardH, 6, true, false);

            this.ctx.strokeStyle = 'rgba(47, 69, 83, 0.32)';
            this.ctx.lineWidth = 1;
            this.roundRect(cardX, cardY, cardW, cardH, 6, false, true);
        }
    }

    /**
     * Renders "La Flechita" — Precision Aerospace Stealth Interceptor
     * Multi-layered metallic hull, recessed glass canopy, dual afterburner core, and compact proportions.
     */
    private drawArrowShip(engine: GameEngine, time: number) {
        if (engine.state === GameState.CRASHED) return;

        const baseY = this.depthToScreenY(this.shipRestT);
        const spanAtShip = this.getTrackSpanAtY(baseY);
        const laneWidthAtShip = spanAtShip.width / 5;
        const targetX = spanAtShip.left + (engine.lastChosenLane + 0.5) * laneWidthAtShip;

        const dashOffsetY = this.shipDashImpulse * 32;
        const targetY = baseY + dashOffsetY;

        this.shipX += (targetX - this.shipX) * 0.22;
        this.shipY += (targetY - this.shipY) * 0.22;
        this.shipDashImpulse *= 0.84;

        let targetAngle = (targetX - this.shipX) * -0.025;
        if (engine.state === GameState.PLAYING && this.hoverLane !== null) {
            const hoverQuad = this.getCellQuad(engine.currentRow, this.hoverLane);
            const dx = hoverQuad.cx - this.shipX;
            const dy = Math.max(24, hoverQuad.cy - this.shipY);
            targetAngle = Math.atan2(dx, dy) * 0.50;

            this.ctx.save();
            const laserGrad = this.ctx.createLinearGradient(
                this.shipX,
                this.shipY + 13,
                hoverQuad.cx,
                hoverQuad.cy - hoverQuad.h * 0.35
            );
            laserGrad.addColorStop(0, 'rgba(0, 231, 1, 0.40)');
            laserGrad.addColorStop(1, 'rgba(0, 231, 1, 0.03)');
            this.ctx.strokeStyle = laserGrad;
            this.ctx.lineWidth = 1.2;
            this.ctx.setLineDash([3, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.shipX, this.shipY + 13);
            this.ctx.lineTo(hoverQuad.cx, hoverQuad.cy - hoverQuad.h * 0.35);
            this.ctx.stroke();
            this.ctx.restore();
        }
        this.shipAngle += (targetAngle - this.shipAngle) * 0.24;

        const bobY = Math.sin(time * 0.0045) * 1.4;

        this.ctx.save();
        this.ctx.translate(this.shipX, this.shipY + bobY);
        this.ctx.rotate(-this.shipAngle);

        // Active Deflector Shield Hexagonal Energy Barrier
        const showShield =
            engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased;
        if (showShield) {
            this.ctx.save();
            this.ctx.rotate(time * 0.002);
            this.ctx.strokeStyle = 'rgba(103, 232, 249, 0.7)';
            this.ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
            this.ctx.lineWidth = 1.3;
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

        // Dual-Layer Plasma Afterburner Plume (Outer Emerald/Gold + White-Hot Inner Core)
        const flameLen = 6 + Math.sin(time * 0.035) * 2 + this.shipDashImpulse * 9;
        const accentColor = engine.luckyBoost ? this.colors.goldLight : this.colors.green;

        this.ctx.save();
        this.ctx.fillStyle = accentColor;
        this.ctx.shadowColor = accentColor;
        this.ctx.shadowBlur = 9;
        this.ctx.beginPath();
        this.ctx.moveTo(-4, -5);
        this.ctx.lineTo(0, -5 - flameLen);
        this.ctx.lineTo(4, -5);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(-1.8, -5);
        this.ctx.lineTo(0, -5 - flameLen * 0.55);
        this.ctx.lineTo(1.8, -5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // Compact, Wide-Winged Stealth Chevron Hull (1:1 aspect ratio, never elongated)
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        this.ctx.shadowBlur = 7;

        // Left Wing Facet (Bright Brushed Titanium)
        const leftGrad = this.ctx.createLinearGradient(-13, -8, 0, 12);
        leftGrad.addColorStop(0, '#e2e8f0');
        leftGrad.addColorStop(1, '#ffffff');
        this.ctx.fillStyle = leftGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 12.5);   // Nose tip pointing down
        this.ctx.lineTo(-13, -7.5); // Wide swept left wing
        this.ctx.lineTo(-4, -3.5);  // Inner engine bay
        this.ctx.lineTo(0, -6);     // Center spine
        this.ctx.closePath();
        this.ctx.fill();

        // Right Wing Facet (Shaded Metallic Alloy)
        const rightGrad = this.ctx.createLinearGradient(0, -8, 13, 12);
        rightGrad.addColorStop(0, '#94a3b8');
        rightGrad.addColorStop(1, '#cbd5e1');
        this.ctx.fillStyle = rightGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 12.5);
        this.ctx.lineTo(13, -7.5);
        this.ctx.lineTo(4, -3.5);
        this.ctx.lineTo(0, -6);
        this.ctx.closePath();
        this.ctx.fill();

        // Recessed Dark Cockpit Canopy in center of Arrow Ship
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 6.5);
        this.ctx.lineTo(-3.2, -1.5);
        this.ctx.lineTo(0, -3.5);
        this.ctx.lineTo(3.2, -1.5);
        this.ctx.closePath();
        this.ctx.fill();

        // Glowing Cockpit Visor Accent
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 1.3;
        this.ctx.beginPath();
        this.ctx.moveTo(-2.5, -1);
        this.ctx.lineTo(0, 5);
        this.ctx.lineTo(2.5, -1);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Multi-Faceted Brilliant-Cut Gem Icon (Stake Originals Premium Style)
     */
    private drawPremiumGem(
        cx: number,
        cy: number,
        size: number,
        palette: 'emerald' | 'gold' | 'cyan'
    ) {
        const colors =
            palette === 'gold'
                ? {
                      glow: 'rgba(245, 158, 11, 0.45)',
                      topFacet: '#fef08a',
                      leftFacet: '#fbbf24',
                      rightFacet: '#d97706',
                      bottomFacet: '#92400e',
                      tableTop: '#fde047',
                      tableBot: '#f59e0b'
                  }
                : palette === 'cyan'
                  ? {
                        glow: 'rgba(6, 182, 212, 0.45)',
                        topFacet: '#cffafe',
                        leftFacet: '#22d3ee',
                        rightFacet: '#0891b2',
                        bottomFacet: '#155e75',
                        tableTop: '#67e8f9',
                        tableBot: '#06b6d4'
                    }
                  : {
                        glow: 'rgba(0, 231, 1, 0.45)',
                        topFacet: '#bbf7d0',
                        leftFacet: '#4ade80',
                        rightFacet: '#16a34a',
                        bottomFacet: '#14532d',
                        tableTop: '#4ade80',
                        tableBot: '#00e701'
                    };

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.shadowColor = colors.glow;
        this.ctx.shadowBlur = size * 0.7;

        // Outer Octagonal Crown
        const s = size;
        const c = size * 0.42;

        // Top-Left & Top Facets (Lit)
        this.ctx.fillStyle = colors.topFacet;
        this.ctx.beginPath();
        this.ctx.moveTo(-c, -s);
        this.ctx.lineTo(c, -s);
        this.ctx.lineTo(s, -c);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(-s, -c);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowBlur = 0;

        // Left Bezel Facet
        this.ctx.fillStyle = colors.leftFacet;
        this.ctx.beginPath();
        this.ctx.moveTo(-s, -c);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(-c, s);
        this.ctx.lineTo(-s, c);
        this.ctx.closePath();
        this.ctx.fill();

        // Right Bezel Facet
        this.ctx.fillStyle = colors.rightFacet;
        this.ctx.beginPath();
        this.ctx.moveTo(s, -c);
        this.ctx.lineTo(s, c);
        this.ctx.lineTo(c, s);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();

        // Bottom Pavilion Facet (Deep Shade)
        this.ctx.fillStyle = colors.bottomFacet;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(c, s);
        this.ctx.lineTo(-c, s);
        this.ctx.closePath();
        this.ctx.fill();

        // Inner Flat Table Octagon
        const ts = size * 0.56;
        const tc = ts * 0.42;
        const tableGrad = this.ctx.createLinearGradient(0, -ts, 0, ts);
        tableGrad.addColorStop(0, colors.tableTop);
        tableGrad.addColorStop(1, colors.tableBot);
        this.ctx.fillStyle = tableGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(-tc, -ts);
        this.ctx.lineTo(tc, -ts);
        this.ctx.lineTo(ts, -tc);
        this.ctx.lineTo(ts, tc);
        this.ctx.lineTo(tc, ts);
        this.ctx.lineTo(-tc, ts);
        this.ctx.lineTo(-ts, tc);
        this.ctx.lineTo(-ts, -tc);
        this.ctx.closePath();
        this.ctx.fill();

        // Specular White Glint on Top-Left Crown
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        this.ctx.beginPath();
        this.ctx.moveTo(-tc * 0.8, -ts * 0.75);
        this.ctx.lineTo(tc * 0.5, -ts * 0.75);
        this.ctx.lineTo(-tc * 0.2, -ts * 0.15);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Multi-Faceted 3D Golden Starburst Emblem for Golden Multiplier Cards
     */
    private drawPremiumStarGem(cx: number, cy: number, r: number) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.shadowColor = 'rgba(253, 224, 71, 0.5)';
        this.ctx.shadowBlur = 6;

        const grad = this.ctx.createLinearGradient(-r, -r, r, r);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#b45309');
        this.ctx.fillStyle = grad;

        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const rad = i % 2 === 0 ? r : r * 0.42;
            const ang = (i * Math.PI) / 4 - Math.PI / 2;
            const px = Math.cos(ang) * rad;
            const py = Math.sin(ang) * rad;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Inner White-Gold Core Diamond
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        const ir = r * 0.28;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -ir);
        this.ctx.lineTo(ir, 0);
        this.ctx.lineTo(0, ir);
        this.ctx.lineTo(-ir, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Tactical 3D Metallic Naval Mine with Crimson Armed Core
     */
    private drawPremiumMine(cx: number, cy: number, radius: number, isDirectTrigger: boolean) {
        this.ctx.save();
        this.ctx.translate(cx, cy);

        if (isDirectTrigger) {
            this.ctx.shadowColor = this.colors.red;
            this.ctx.shadowBlur = radius * 1.4;
        }

        // 8 Tapered Detonator Horns
        for (let i = 0; i < 8; i++) {
            this.ctx.save();
            this.ctx.rotate((i * Math.PI) / 4);
            this.ctx.fillStyle = isDirectTrigger ? '#ff1e42' : '#475569';
            this.ctx.beginPath();
            this.ctx.moveTo(-radius * 0.16, -radius * 0.65);
            this.ctx.lineTo(-radius * 0.09, -radius * 1.22);
            this.ctx.lineTo(radius * 0.09, -radius * 1.22);
            this.ctx.lineTo(radius * 0.16, -radius * 0.65);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }

        // Spherical 3D Metallic Casing
        const hullGrad = this.ctx.createRadialGradient(
            -radius * 0.28,
            -radius * 0.28,
            radius * 0.1,
            0,
            0,
            radius * 0.88
        );
        if (isDirectTrigger) {
            hullGrad.addColorStop(0, '#ff6b8b');
            hullGrad.addColorStop(0.55, '#e11d48');
            hullGrad.addColorStop(1, '#881337');
        } else {
            hullGrad.addColorStop(0, '#475569');
            hullGrad.addColorStop(0.6, '#1e293b');
            hullGrad.addColorStop(1, '#0f172a');
        }
        this.ctx.fillStyle = hullGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
        this.ctx.fill();

        // Outer Metallic Rim Stroke
        this.ctx.strokeStyle = isDirectTrigger ? '#fda4af' : '#64748b';
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();

        // Armed Crimson Sensor Ring & Core
        this.ctx.fillStyle = '#ff1e42';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.40, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-radius * 0.08, -radius * 0.08, radius * 0.14, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Studio-Grade Metallic Saucer with Glass Canopy & Plasma Nodes
     */
    private drawPremiumUfo(cx: number, cy: number, radius: number, time = 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Glass Canopy Dome
        const domeGrad = this.ctx.createRadialGradient(
            -radius * 0.12,
            -radius * 0.22,
            radius * 0.05,
            0,
            -radius * 0.1,
            radius * 0.5
        );
        domeGrad.addColorStop(0, '#ecfeff');
        domeGrad.addColorStop(0.5, '#22d3ee');
        domeGrad.addColorStop(1, '#0e7490');
        this.ctx.fillStyle = domeGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.06, radius * 0.46, Math.PI, 0);
        this.ctx.fill();

        // Metallic Disc Body
        const discGrad = this.ctx.createLinearGradient(-radius, 0, radius, 0);
        discGrad.addColorStop(0, '#334155');
        discGrad.addColorStop(0.5, '#94a3b8');
        discGrad.addColorStop(1, '#1e293b');
        this.ctx.fillStyle = discGrad;
        this.ctx.strokeStyle = '#67e8f9';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius, radius * 0.30, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Glowing Rim Plasma Lights
        for (let i = -1; i <= 1; i++) {
            const pulse = time > 0 ? Math.sin(time * 0.015 + i) * 1.1 : 0;
            this.ctx.fillStyle = i === 0 ? '#00e701' : '#67e8f9';
            this.ctx.beginPath();
            this.ctx.arc(i * radius * 0.52 + pulse, 0, Math.max(1.5, radius * 0.09), 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Layered Hexagonal Aegis Deflector Shield Icon
     */
    private drawPremiumShield(cx: number, cy: number, size: number) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        this.ctx.shadowBlur = 7;

        const grad = this.ctx.createLinearGradient(0, -size, 0, size);
        grad.addColorStop(0, '#67e8f9');
        grad.addColorStop(0.5, '#0891b2');
        grad.addColorStop(1, '#164e63');
        this.ctx.fillStyle = grad;
        this.ctx.strokeStyle = '#cffafe';
        this.ctx.lineWidth = 1.4;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.85, -size * 0.45);
        this.ctx.lineTo(size * 0.68, size * 0.42);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size * 0.68, size * 0.42);
        this.ctx.lineTo(-size * 0.85, -size * 0.45);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Inner White Energy Chevron
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.38, -size * 0.1);
        this.ctx.lineTo(0, size * 0.35);
        this.ctx.lineTo(size * 0.38, -size * 0.1);
        this.ctx.stroke();

        this.ctx.restore();
    }

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
        const ufoY = this.horizonY + 42 + Math.sin(p * Math.PI) * 10;

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

        this.drawPremiumUfo(ufoX, ufoY, 28, time);
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
