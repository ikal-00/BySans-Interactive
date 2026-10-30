import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import type { RoundPick } from '../math/types';
import { audioController } from './AudioController';

export interface AtmosphereTheme {
    tier: number;
    name: string;
    primaryHex: number;
    secondaryHex: number;
    accentCss: string;
    glowCss: string;
    bgTopHex: number;
    bgBottomHex: number;
}

export type HitStopStartCallback = (
    row: number,
    lane: number,
    durationMs: number,
    comicWord: string,
    sprayColorCss: string
) => void;
export type HitStopResolveCallback = (pick: RoundPick) => void;
export type MegaWinCallback = (payout: number, multiplier: number, tierTitle: string) => void;

const SCI_FI_IMPACT_CALLOUTS = [
    'WARP LOCK!',
    'QUANTUM SURGE!',
    'HYPER-THRUST!',
    'CORE OVERDRIVE!',
    'PLASMA BREACH!',
    'SUPERNOVA LOCK!'
];
const PLASMA_GLOW_COLORS = ['#00f0ff', '#38bdf8', '#fde047', '#f59e0b', '#10b981'];

export class GameStateController {
    public readonly engine: GameEngine;
    public isHitStopActive: boolean = false;
    public hitStopRow: number | null = null;
    public hitStopLane: number | null = null;
    public hitStopProgress: number = 0; // 0..1
    public activeComicWord: string = 'WARP LOCK!';
    public activeSprayColor: string = '#00f0ff';
    public isMegaWinActive: boolean = false;
    public turboMode: boolean = false;

    private hitStopStartListeners: Set<HitStopStartCallback> = new Set();
    private hitStopResolveListeners: Set<HitStopResolveCallback> = new Set();
    private megaWinListeners: Set<MegaWinCallback> = new Set();

    constructor(engine: GameEngine) {
        this.engine = engine;

        this.engine.onCashout((payout, multiplier) => {
            const isMega = multiplier >= 2.0 || payout >= 25;
            audioController.playCashout(isMega);
            // Trigger dynamic victory celebration on 100% of successful cashouts regardless of amount
            this.triggerMegaWin(payout, multiplier, 'IS YOUR LUCKY DAY, TRY AGAIN');
        });

        this.engine.onPartialCashout(() => {
            audioController.playPartialCashout();
        });
    }

    public onHitStopStart(cb: HitStopStartCallback): () => void {
        this.hitStopStartListeners.add(cb);
        return () => this.hitStopStartListeners.delete(cb);
    }

    public onHitStopResolve(cb: HitStopResolveCallback): () => void {
        this.hitStopResolveListeners.add(cb);
        return () => this.hitStopResolveListeners.delete(cb);
    }

    public onMegaWin(cb: MegaWinCallback): () => void {
        this.megaWinListeners.add(cb);
        return () => this.megaWinListeners.delete(cb);
    }

    public triggerMegaWin(payout: number, multiplier: number, tierTitle = 'SUPERNOVA MEGA EXTRACTION!') {
        this.isMegaWinActive = true;
        this.megaWinListeners.forEach((cb) => cb(payout, multiplier, tierTitle));
    }

    /**
     * Executes the VIOLENT 300ms HIT-STOP (Anticipation & Time-Freeze Clamp)
     * when the Starfighter locks onto a Sector Gate, followed by a sudden burst of speed!
     */
    public selectLaneWithHitStop(laneIndex: number, isAutoPlay = false): Promise<RoundPick | null> {
        if (this.engine.state !== GameState.PLAYING) return Promise.resolve(null);
        if (this.isHitStopActive) return Promise.resolve(null);
        if (laneIndex < 0 || laneIndex > 4) return Promise.resolve(null);

        const targetRow = this.engine.currentRow;
        const durationMs = this.turboMode ? 65 : isAutoPlay ? 85 : 95;

        this.isHitStopActive = true;
        this.hitStopRow = targetRow;
        this.hitStopLane = laneIndex;
        this.hitStopProgress = 0;
        this.activeComicWord = SCI_FI_IMPACT_CALLOUTS[(targetRow + laneIndex) % SCI_FI_IMPACT_CALLOUTS.length];
        this.activeSprayColor = PLASMA_GLOW_COLORS[(targetRow * 2 + laneIndex) % PLASMA_GLOW_COLORS.length];

        audioController.startAmbientDrone();
        audioController.playHitStopTension(durationMs, targetRow);
        this.hitStopStartListeners.forEach((cb) =>
            cb(targetRow, laneIndex, durationMs, this.activeComicWord, this.activeSprayColor)
        );

        return new Promise((resolve) => {
            const startTime = performance.now();

            const tick = (now: number) => {
                const elapsed = now - startTime;
                this.hitStopProgress = Math.min(1, elapsed / durationMs);

                if (elapsed < durationMs) {
                    requestAnimationFrame(tick);
                } else {
                    this.isHitStopActive = false;
                    this.hitStopRow = null;
                    this.hitStopLane = null;
                    this.hitStopProgress = 0;

                    const pick = this.engine.pickLane(laneIndex);
                    if (pick) {
                        audioController.updateDroneIntensity(this.engine.currentMultiplier);
                        if (pick.isSafe) {
                            if (pick.specialType === 'ALIEN') {
                                audioController.playAlienLaser();
                            } else if (pick.specialType === 'GOLDEN') {
                                audioController.playGoldenHit();
                            } else {
                                audioController.playSafeStep(pick.row);
                            }
                        } else if (pick.shieldSaved) {
                            audioController.playShieldBreak();
                        } else {
                            audioController.playCrash();
                        }
                        this.hitStopResolveListeners.forEach((cb) => cb(pick));
                    }
                    resolve(pick);
                }
            };

            requestAnimationFrame(tick);
        });
    }

    /**
     * Deep-Space [SPACE-OVERDRIVE] Cosmic Tunnel Themes (Volumetric lighting & nebula shifts as multiplier climbs)
     */
    public getAtmosphereTheme(): AtmosphereTheme {
        const mult = this.engine.currentMultiplier;
        const row = this.engine.currentRow;

        if (this.engine.state === GameState.CRASHED) {
            return {
                tier: -1,
                name: 'CRITICAL HULL BREACH',
                primaryHex: 0xff1e42,
                secondaryHex: 0xf59e0b,
                accentCss: '#ff1e42',
                glowCss: 'rgba(255, 30, 66, 0.78)',
                bgTopHex: 0x1a0308,
                bgBottomHex: 0x3b0712
            };
        }

        // Phase 4: Rows 12+ or 15x+ Multiplier -> Event Horizon Escape
        if (row >= 12 || mult >= 15.0) {
            return {
                tier: 3,
                name: 'EVENT HORIZON ESCAPE',
                primaryHex: 0xfde047,
                secondaryHex: 0xf59e0b,
                accentCss: '#fde047',
                glowCss: 'rgba(253, 224, 71, 0.75)',
                bgTopHex: 0x140726,
                bgBottomHex: 0x3b1154
            };
        }

        // Phase 3: Rows 8-11 or 5x+ Multiplier -> Quantum Void Sector
        if (row >= 8 || mult >= 5.0) {
            return {
                tier: 2,
                name: 'QUANTUM VOID SECTOR',
                primaryHex: 0xc084fc,
                secondaryHex: 0xa855f7,
                accentCss: '#c084fc',
                glowCss: 'rgba(192, 132, 252, 0.70)',
                bgTopHex: 0x0c041c,
                bgBottomHex: 0x220c40
            };
        }

        // Phase 2: Rows 4-7 or 2x+ Multiplier -> Plasma Reactor Core
        if (row >= 4 || mult >= 2.0) {
            return {
                tier: 1,
                name: 'PLASMA REACTOR CORE',
                primaryHex: 0x00f0ff,
                secondaryHex: 0x38bdf8,
                accentCss: '#00f0ff',
                glowCss: 'rgba(0, 240, 255, 0.65)',
                bgTopHex: 0x031428,
                bgBottomHex: 0x052a50
            };
        }

        // Phase 1: Rows 1-3 -> Titanium Industrial Shaft
        return {
            tier: 0,
            name: 'TITANIUM INDUSTRIAL SHAFT',
            primaryHex: 0x38bdf8,
            secondaryHex: 0xf59e0b,
            accentCss: '#38bdf8',
            glowCss: 'rgba(56, 189, 248, 0.55)',
            bgTopHex: 0x050811,
            bgBottomHex: 0x0b1326
        };
    }
}
