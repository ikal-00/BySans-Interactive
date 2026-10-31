import { GameState } from '../math/types';
import {
    calculateMultiplier,
    calculateNextStepMultiplier,
    calculatePayout,
    calculateEffectiveBet
} from '../math/multipliers';
import { GameStateController } from '../engine/GameState';
import { PixiRenderer } from '../engine/Renderer';
import { audioController } from '../engine/AudioController';
import { stakeRGS } from '../engine/StakeRGSBridge';
import { createRulesModal, openRulesModal, isRulesModalOpen } from './rulesModal';
import { toggleDevModal } from './devModal';
import { getTranslations } from '../i18n/translations';
import gsap from 'gsap';

const TOTAL_LANES = 5;

interface TryAgainParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    decay: number;
    color: string;
}

type VictoryEmitterType = 'ION_PLASMA' | 'TITANIUM_SPARKS' | 'QUANTUM_BURST' | 'HYPERDRIVE_STREAKS';

interface VictoryParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rot: number;
    rotSpeed: number;
    spinPhase: number;
    spinSpeed: number;
    alpha: number;
    color: string;
    secondaryColor: string;
    leafCount: number;
}

const VICTORY_HEADLINES = [
    'WARP ESCAPE SECURED',
    'HYPER-JUMP CLEARED',
    'ATMOSPHERIC BREACH COMPLETE',
    'MAXIMUM EXTRACTION',
    'ORBITAL TRAJECTORY ACHIEVED'
];

const VICTORY_EMITTERS: VictoryEmitterType[] = [
    'ION_PLASMA',
    'TITANIUM_SPARKS',
    'QUANTUM_BURST',
    'HYPERDRIVE_STREAKS'
];

export function createControlsUI(
    topHeader: HTMLElement,
    leftDock: HTMLElement,
    stageContainer: HTMLElement,
    stateCtrl: GameStateController,
    _renderer: PixiRenderer
) {
    const engine = stateCtrl.engine;
    const isReplay = stakeRGS.session.isReplay;
    const lang = stakeRGS.session.language;
    const isSocial = stakeRGS.session.isSocial;
    const t = getTranslations(lang, isSocial);

    let currentBetLevels: number[] = [...stakeRGS.betConfig.betLevels].sort((a, b) => a - b);

    function formatBetLevelVal(v: number): string {
        return stakeRGS.session.currency === 'JPY' ? v.toFixed(0) : v.toFixed(2);
    }

    function snapToNearestBetLevel(val: number): number {
        if (!currentBetLevels || currentBetLevels.length === 0) return val;
        let closest = currentBetLevels[0];
        let minDiff = Math.abs(val - closest);
        for (const lvl of currentBetLevels) {
            const diff = Math.abs(val - lvl);
            if (diff < minDiff) {
                minDiff = diff;
                closest = lvl;
            }
        }
        return closest;
    }

    // 1. PRODUCTION TOP SCI-FI COCKPIT HEADER (Open Frameless Layout)
    topHeader.innerHTML = `
      <div class="brand-telemetry-stack">
        <div class="brand-cluster">
          <div class="brand-emblem" title="Endless Descent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L21 20L12 15.5L3 20L12 2Z" fill="#ffffff"/>
            </svg>
          </div>
          <div class="brand-titles">
            <span class="brand-name">${t.gameTitle}</span>
            <span class="brand-tag ${isReplay ? 'replay' : 'sandbox'}" id="brand-tag-indicator">
              <span class="${isReplay ? 'rgs-pulse-dot' : 'sandbox-dot'}"></span>
              ${t.studioName} · ${isReplay ? t.replayBadge : t.sandboxDemo}
            </span>
          </div>
        </div>

        <div class="brand-horizon-track" aria-hidden="true">
          <span class="brand-horizon-node"></span>
          <span class="brand-horizon-line"></span>
        </div>

        <div class="brand-sub-telemetry-row">
          <div class="brand-ruler-scale" id="brand-ruler-scale" aria-hidden="true">
            <svg class="brand-ruler-svg" width="176" height="12" viewBox="0 0 176 12" fill="none">
              <line x1="1" y1="1.5" x2="1" y2="10.5" stroke="rgba(186,230,253,0.72)" stroke-width="1.35"/>
              <line x1="6.5" y1="3.5" x2="6.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="11.5" y1="3.5" x2="11.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="16.5" y1="3.5" x2="16.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="21.5" y1="3.5" x2="21.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="26.5" y1="3.5" x2="26.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="32" y1="1.5" x2="32" y2="10.5" stroke="rgba(186,230,253,0.72)" stroke-width="1.35"/>
              <line x1="37.5" y1="3.5" x2="37.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="42.5" y1="3.5" x2="42.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="47.5" y1="3.5" x2="47.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="52.5" y1="3.5" x2="52.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="57.5" y1="3.5" x2="57.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="63" y1="1.5" x2="63" y2="10.5" stroke="rgba(186,230,253,0.72)" stroke-width="1.35"/>
              <line x1="68.5" y1="3.5" x2="68.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="73.5" y1="3.5" x2="73.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="78.5" y1="3.5" x2="78.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="83.5" y1="3.5" x2="83.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="88.5" y1="3.5" x2="88.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="94" y1="1.5" x2="94" y2="10.5" stroke="rgba(186,230,253,0.72)" stroke-width="1.35"/>
              <line x1="99.5" y1="3.5" x2="99.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="104.5" y1="3.5" x2="104.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="109.5" y1="3.5" x2="109.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="114.5" y1="3.5" x2="114.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="119.5" y1="3.5" x2="119.5" y2="8.5" stroke="rgba(148,163,184,0.44)" stroke-width="1"/>
              <line x1="125" y1="1.5" x2="125" y2="10.5" stroke="rgba(186,230,253,0.72)" stroke-width="1.35"/>
              <line x1="130.5" y1="3.5" x2="130.5" y2="8.5" stroke="rgba(56,189,248,0.58)" stroke-width="1"/>
              <line x1="135.5" y1="3.5" x2="135.5" y2="8.5" stroke="rgba(56,189,248,0.58)" stroke-width="1"/>
              <line x1="140.5" y1="3.5" x2="140.5" y2="8.5" stroke="rgba(56,189,248,0.58)" stroke-width="1"/>
              <line x1="145.5" y1="3.5" x2="145.5" y2="8.5" stroke="rgba(56,189,248,0.58)" stroke-width="1"/>
              <line x1="150.5" y1="3.5" x2="150.5" y2="8.5" stroke="rgba(56,189,248,0.58)" stroke-width="1"/>
              <line x1="156" y1="1.5" x2="156" y2="10.5" stroke="rgba(186,230,253,0.78)" stroke-width="1.35"/>
            </svg>
            <span class="brand-ruler-glyphs">⚡ $</span>
          </div>
          <div class="header-ticker-strip" id="history-ticker"></div>
        </div>
      </div>

      <div class="header-telemetry-cluster">
        <button class="icon-btn" id="btn-rules" type="button" title="${t.rulesToggleTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span id="rules-label">${lang === 'es' ? 'Reglas' : 'Rules'}</span>
        </button>
        <button class="icon-btn active" id="btn-audio" type="button" title="${t.soundToggleTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="audio-icon-svg">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span id="audio-label">${lang === 'es' ? 'Sonido' : 'Sound'}</span>
        </button>
        <button class="dev-quick-btn" id="btn-dev-quick-add" type="button" title="Modo Dev: Recargar +$1,000">
          +$1K
        </button>
        <button class="icon-btn dev-toggle-btn" id="btn-dev-modal-toggle" type="button" title="Panel Developer (Atajo: D)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>DEV</span>
        </button>
        <div class="balance-pill" title="${t.balanceLabel}">
          <div>
            <div class="balance-label" id="balance-title-label">${isReplay ? t.replayBadge : t.balanceLabel}</div>
            <div class="balance-value" id="hud-balance">${stakeRGS.formatCurrency(isReplay && stakeRGS.session.replayParams ? stakeRGS.session.replayParams.amount : engine.balance)}</div>
          </div>
        </div>
      </div>
    `;

    // 2. BOTTOM PANEL: REPLAY HUD OR REGULAR BETTING DOCK
    if (isReplay) {
        const rp = stakeRGS.session.replayParams || {
            game: 'endless-descent',
            version: '1.0',
            mode: 'base',
            event: '',
            amount: 1.0,
            currency: stakeRGS.session.currency,
            language: lang,
            social: isSocial,
            device: 'desktop'
        };

        leftDock.innerHTML = `
          <div class="replay-dock-panel" id="replay-dock-panel">
            <div class="replay-telemetry">
              <span class="replay-tag-pill">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                ${t.replayBadge}
              </span>
              <div class="replay-metrics-row">
                <span class="replay-metric-item">${t.betAmountLabel}: <strong id="replay-base-bet">${stakeRGS.formatCurrency(rp.amount)}</strong></span>
                <span class="replay-metric-item">${t.replayFinalMultiplierLabel}: <strong id="replay-mult-val">0.00×</strong></span>
                <span class="replay-metric-item">${t.replayTotalWinLabel}: <strong id="replay-payout-val" style="color: #00e676;">${stakeRGS.formatCurrency(0)}</strong></span>
              </div>
            </div>
            <button class="replay-btn-action" id="btn-replay-action" type="button">
              ${t.replayPlayBtn}
            </button>
          </div>
        `;
    } else {
        const currSym = stakeRGS.getCurrencySymbol();
        const initialDefLevel = stakeRGS.betConfig.defaultBetLevel;
        const initialEffVal = initialDefLevel;

        leftDock.innerHTML = `
          <div class="betting-panel-main-row">
            <!-- Column 1: Bet Amount Input & Quick Modifiers -->
            <div class="betting-field-group">
              <div class="betting-field-header">
                <span class="betting-field-label" id="bet-field-label">${t.betAmountLabel}</span>
                <span class="betting-field-meta" id="bet-pct-badge">Total: ${stakeRGS.formatCurrency(initialEffVal)}</span>
              </div>
              <div class="fintech-bet-input-box">
                <span class="fintech-currency-sign" id="fintech-curr-sign">${currSym}</span>
                <input type="number" inputmode="decimal" id="bet-input" value="${formatBetLevelVal(initialDefLevel)}" min="${stakeRGS.betConfig.minBet}" max="${stakeRGS.betConfig.maxBet}" step="${stakeRGS.betConfig.stepBet}" aria-label="${t.betAmountLabel}" />
                <div class="fintech-quick-segments">
                  <button class="fintech-quick-pill" id="btn-min" type="button">${t.quickMin}</button>
                  <button class="fintech-quick-pill" id="btn-half" type="button">${t.quickHalf}</button>
                  <button class="fintech-quick-pill" id="btn-double" type="button">${t.quickDouble}</button>
                  <button class="fintech-quick-pill" id="btn-max" type="button">${t.quickMax}</button>
                </div>
              </div>
            </div>

            <!-- Column 2: Segmented Control for Mines / Hazards -->
            <div class="betting-field-group">
              <div class="betting-field-header">
                <span class="betting-field-label" id="mines-field-label">${t.minesCountLabel}</span>
                <span class="betting-field-meta" id="survival-odds-badge">80% ${t.minesProbLabel} · 1.20×</span>
              </div>
              <div class="fintech-segmented-track" id="mine-selector" role="radiogroup" aria-label="${t.minesCountLabel}">
                <button class="fintech-segment-btn active" data-mines="1" type="button">
                  <span class="segment-main-num">1</span>
                  <span class="segment-sub-odds">80%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="2" type="button">
                  <span class="segment-main-num">2</span>
                  <span class="segment-sub-odds">60%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="3" type="button">
                  <span class="segment-main-num">3</span>
                  <span class="segment-sub-odds">40%</span>
                </button>
                <button class="fintech-segment-btn" data-mines="4" type="button">
                  <span class="segment-main-num">4</span>
                  <span class="segment-sub-odds">20%</span>
                </button>
              </div>
            </div>

            <!-- Column 3: Primary Visual Focal Point — Action Button & Partial Cashout -->
            <div class="betting-field-group fintech-cta-wrap">
              <div class="betting-field-header">
                <span class="betting-field-label" id="focal-cta-header-label">${t.focalActionLabel}</span>
                <span class="betting-field-meta" id="focal-cta-header-shortcut">${t.shortcutSpace}</span>
              </div>
              <div class="focal-cta-actions-cluster">
                <button class="btn-primary-focal" id="btn-primary-cta" type="button">
                  <span class="focal-btn-headline" id="focal-cta-title">${t.focalDropCapsule}</span>
                  <span class="focal-btn-sub" id="focal-cta-sub">${stakeRGS.formatCurrency(initialEffVal)} · ${t.focalActionReady}</span>
                </button>
                <button class="btn-partial-focal" id="btn-partial-cta" type="button" style="display: none;">
                  <div class="partial-btn-left">
                    <span class="partial-btn-headline">${t.focalPartialCashoutBtn}</span>
                    <span class="partial-btn-sub" id="partial-cta-sub">+${stakeRGS.formatCurrency(0)}</span>
                  </div>
                  <span class="partial-pill-badge">${t.shortcutKeyP}</span>
                </button>
              </div>
            </div>
          </div>
        `;
    }

    // 3. CENTER FLOATING SCI-FI HOLOGRAPHIC MULTIPLIER HUD & REWARD CALLOUT
    const stageOverlay = document.createElement('div');
    stageOverlay.className = 'stage-hud-overlay';
    stageOverlay.innerHTML = `
      <div class="stage-top-hud-stack">
        <div class="multiplier-hero-banner" id="mult-hero-wrap">
          <svg class="mult-holo-hud-svg" viewBox="0 0 460 112" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="hudChamberBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(18, 32, 54, 0.72)"/>
                <stop offset="52%" stop-color="rgba(8, 16, 30, 0.78)"/>
                <stop offset="100%" stop-color="rgba(6, 12, 24, 0.84)"/>
              </linearGradient>
              <linearGradient id="hudMainStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(56, 189, 248, 0.75)"/>
                <stop offset="25%" stop-color="rgba(168, 85, 247, 0.72)"/>
                <stop offset="50%" stop-color="rgba(148, 163, 184, 0.48)"/>
                <stop offset="75%" stop-color="rgba(236, 72, 153, 0.72)"/>
                <stop offset="100%" stop-color="rgba(56, 189, 248, 0.75)"/>
              </linearGradient>
              <linearGradient id="hudLeftShoulderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="55%" stop-color="#c084fc"/>
                <stop offset="100%" stop-color="#38bdf8"/>
              </linearGradient>
              <linearGradient id="hudRightShoulderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#fb7185"/>
                <stop offset="55%" stop-color="#ec4899"/>
                <stop offset="100%" stop-color="#38bdf8"/>
              </linearGradient>
              <filter id="hudCyanGlow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="2.6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Diagonal Sci-Fi Wing Flare Lines -->
            <line x1="6" y1="6" x2="42" y2="32" stroke="rgba(125, 211, 252, 0.35)" stroke-width="1.1"/>
            <line x1="454" y1="6" x2="418" y2="32" stroke="rgba(125, 211, 252, 0.35)" stroke-width="1.1"/>

            <!-- Left Concentric Curved HUD Energy Brackets (( -->
            <path d="M 33 20 A 68 68 0 0 0 33 92" fill="none" stroke="rgba(56, 189, 248, 0.32)" stroke-width="1.1" stroke-dasharray="14 5"/>
            <path d="M 42 13 A 58 58 0 0 0 42 99" fill="none" stroke="rgba(125, 211, 252, 0.75)" stroke-width="1.6"/>
            <path d="M 52 24 A 46 46 0 0 0 52 88" fill="none" stroke="#00f0ff" stroke-width="3.6" stroke-linecap="round" filter="url(#hudCyanGlow)"/>

            <!-- Right Concentric Curved HUD Energy Brackets )) -->
            <path d="M 427 20 A 68 68 0 0 1 427 92" fill="none" stroke="rgba(56, 189, 248, 0.32)" stroke-width="1.1" stroke-dasharray="14 5"/>
            <path d="M 418 13 A 58 58 0 0 1 418 99" fill="none" stroke="rgba(125, 211, 252, 0.75)" stroke-width="1.6"/>
            <path d="M 408 24 A 46 46 0 0 1 408 88" fill="none" stroke="#00f0ff" stroke-width="3.6" stroke-linecap="round" filter="url(#hudCyanGlow)"/>

            <!-- Stepped Hexagonal Sci-Fi Main Chamber Body -->
            <polygon
              points="66,19 76,11 146,11 155,19 305,19 314,11 384,11 394,19 406,33 406,79 394,93 384,100 276,100 268,95 192,95 184,100 76,100 66,93 54,79 54,33"
              fill="url(#hudChamberBg)"
              stroke="url(#hudMainStroke)"
              stroke-width="1.45"
            />

            <!-- Inner Subtle Hairline Chamber Contour -->
            <polygon
              points="70,23 79,15.5 143,15.5 152,23 308,23 317,15.5 381,15.5 390,23 400,35 400,77 390,89 381,95.5 279,95.5 271,91 189,91 181,95.5 79,95.5 70,89 60,77 60,35"
              fill="none"
              stroke="rgba(186, 230, 253, 0.16)"
              stroke-width="0.9"
            />

            <!-- Glowing Top Stepped Shoulder Accents (Violet-Cyan Left, Pink-Cyan Right) -->
            <polyline
              points="73,13 77,10.5 145,10.5 152,16.5"
              fill="none"
              stroke="url(#hudLeftShoulderGlow)"
              stroke-width="2.4"
              stroke-linecap="round"
              filter="url(#hudCyanGlow)"
            />
            <polyline
              points="308,16.5 315,10.5 383,10.5 387,13"
              fill="none"
              stroke="url(#hudRightShoulderGlow)"
              stroke-width="2.4"
              stroke-linecap="round"
              filter="url(#hudCyanGlow)"
            />
          </svg>

          <div class="multiplier-God-value" id="mult-hero-value">1.00×</div>
          <div class="multiplier-sub-pill">
            <span class="mult-sub-status" id="mult-hero-sub">${t.readyToLaunchSub}</span>
            <span class="mult-sub-divider" aria-hidden="true">|</span>
            <span class="mult-next-tag" id="mult-next-preview">${t.nextMultiplierLabel}: 1.20×</span>
          </div>
        </div>

        <div class="hitstop-callout-pill" id="hitstop-comic-stamp">1.20×</div>
      </div>
      <div></div>
    `;
    stageContainer.appendChild(stageOverlay);

    // 4. LOSS STATE RETENTION OVERLAY
    const tryAgainOverlay = document.createElement('div');
    tryAgainOverlay.className = 'try-again-overlay';
    tryAgainOverlay.id = 'try-again-overlay';
    tryAgainOverlay.innerHTML = `
      <canvas class="try-again-particles-canvas" id="try-again-particles-canvas"></canvas>
      <div class="try-again-content" id="try-again-content">
        <div class="try-again-headline">HULL BREACH DETECTED</div>
        <div class="try-again-sub">${lang === 'es' ? 'PURGA DE SISTEMA · REINICIANDO NAVE...' : 'SYSTEM PURGE · RE-ENGAGING PROPULSION...'}</div>
      </div>
    `;
    stageContainer.appendChild(tryAgainOverlay);

    // 5. DYNAMIC DOPAMINE VICTORY CELEBRATION OVERLAY
    const megaBanner = document.createElement('div');
    megaBanner.className = 'mega-win-overlay';
    megaBanner.id = 'mega-win-banner';
    megaBanner.innerHTML = `
      <canvas class="victory-particles-canvas" id="victory-particles-canvas"></canvas>
      <div class="supernova-god-rays"></div>
      <div class="supernova-anamorphic-flare" id="supernova-flare-bar"></div>
      <div class="mega-win-card" id="mega-win-card-inner">
        <div class="mega-win-headline" id="mega-win-title">IS YOUR LUCKY DAY, TRY AGAIN</div>
        <div class="mega-win-payout" id="mega-win-amount">+${stakeRGS.formatCurrency(0)}</div>
        <div class="mega-win-mult" id="mega-win-mult">1.00× Multiplier</div>
      </div>
    `;
    stageContainer.appendChild(megaBanner);

    engine.minesCount = 1;

    // --- DOM REFERENCES ---
    const balanceEl = document.getElementById('hud-balance')!;
    const historyTicker = document.getElementById('history-ticker')!;
    const multHeroWrap = document.getElementById('mult-hero-wrap')!;
    const multHeroVal = document.getElementById('mult-hero-value')!;
    const multHeroSub = document.getElementById('mult-hero-sub')!;
    const multNextPreview = document.getElementById('mult-next-preview')!;
    const hitStopStamp = document.getElementById('hitstop-comic-stamp')!;

    const betInput = document.getElementById('bet-input') as HTMLInputElement | null;
    const betPctBadge = document.getElementById('bet-pct-badge');
    const survivalOddsBadge = document.getElementById('survival-odds-badge');
    const mineBtns = leftDock.querySelectorAll<HTMLButtonElement>(
        '#mine-selector .fintech-segment-btn'
    );
    const quickBetBtns = leftDock.querySelectorAll<HTMLButtonElement>('.fintech-quick-pill');

    const btnPrimaryCta = document.getElementById('btn-primary-cta') as HTMLButtonElement | null;
    const focalCtaTitle = document.getElementById('focal-cta-title');
    const focalCtaSub = document.getElementById('focal-cta-sub');
    const focalCtaHeaderLabel = document.getElementById('focal-cta-header-label');
    const focalCtaHeaderShortcut = document.getElementById('focal-cta-header-shortcut');

    const btnPartialCta = document.getElementById('btn-partial-cta') as HTMLButtonElement | null;
    const partialCtaSub = document.getElementById('partial-cta-sub');

    const btnAudio = document.getElementById('btn-audio') as HTMLButtonElement;
    const btnRules = document.getElementById('btn-rules') as HTMLButtonElement;

    // Initialize Official Game Rules & Paytable Modal
    createRulesModal();
    if (btnRules) {
        btnRules.addEventListener('click', () => {
            audioController.playClick();
            openRulesModal();
        });
    }
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('rules') === 'true') {
        openRulesModal();
    }

    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            const isMuted = audioController.toggleMute();
            btnAudio.classList.toggle('active', !isMuted);
            const iconSvg = document.getElementById('audio-icon-svg');
            if (iconSvg) {
                iconSvg.innerHTML = isMuted
                    ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'
                    : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
            }
        });
    }

    // Initialize Developer Tools & Instant Balance Suite
    if (!stakeRGS.session.isLiveRGS) {
        const savedDemoBal = localStorage.getItem('endless_descent_demo_balance');
        if (savedDemoBal) {
            const parsed = parseFloat(savedDemoBal);
            if (!isNaN(parsed) && parsed > 0) {
                engine.balance = parsed;
            }
        }
    }

    const btnDevQuickAdd = document.getElementById('btn-dev-quick-add');
    if (btnDevQuickAdd) {
        btnDevQuickAdd.addEventListener('click', () => {
            engine.balance += 1000;
            if (!stakeRGS.session.isLiveRGS) {
                localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
            }
            audioController.playClick();
            syncUI();
            stakeRGS.showToast('💰 + $1,000.00 Saldo Developer añadido', 'success');
        });
    }

    const btnDevModalToggle = document.getElementById('btn-dev-modal-toggle');
    if (btnDevModalToggle) {
        btnDevModalToggle.addEventListener('click', () => {
            audioController.playClick();
            toggleDevModal(engine, syncUI);
        });
    }

    const balancePill = document.querySelector('.balance-pill');
    if (balancePill) {
        (balancePill as HTMLElement).style.cursor = 'pointer';
        balancePill.addEventListener('click', () => {
            if (!stakeRGS.session.isLiveRGS) {
                engine.balance += 1000;
                localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
                audioController.playClick();
                syncUI();
                stakeRGS.showToast('💰 + $1,000.00 añadido al saldo', 'success');
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === 'd' || e.key === 'D') {
            toggleDevModal(engine, syncUI);
        }
    });

    const tryAgainContent = document.getElementById('try-again-content')!;
    const tryAgainCanvas = document.getElementById(
        'try-again-particles-canvas'
    ) as HTMLCanvasElement;

    const megaWinTitle = document.getElementById('mega-win-title')!;
    const megaWinAmount = document.getElementById('mega-win-amount')!;
    const megaWinMult = document.getElementById('mega-win-mult')!;
    const megaWinCardInner = document.getElementById('mega-win-card-inner')!;
    const supernovaFlareBar = document.getElementById('supernova-flare-bar')!;
    const victoryParticlesCanvas = document.getElementById(
        'victory-particles-canvas'
    ) as HTMLCanvasElement;

    let crashResetTimeoutId: number | null = null;
    let tryAgainAnimFrameId: number | null = null;
    let victoryTimeoutId: number | null = null;
    let victoryAnimFrameId: number | null = null;
    let victoryCounterObj = { val: 0 };
    let victoryCallCount = 0;
    let lastHeadlineIdx = -1;
    let lastEmitterIdx = -1;

    // 6. STAKE ENGINE RGS AUTHENTICATION & SESSION LIFECYCLE
    if (!isReplay) {
        stakeRGS.authenticate().then((auth) => {
            // [274] If connection error, render blocking modal (do NOT fall back silently to sandbox)
            if (auth.isConnectionError) {
                const blocker = document.createElement('div');
                blocker.className = 'rgs-connection-blocker';
                blocker.innerHTML = `
                  <div class="rgs-error-card">
                    <div class="rgs-error-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h2 class="rgs-error-title">${t.connectionErrorTitle}</h2>
                    <p class="rgs-error-desc">${auth.errorMessage || t.connectionErrorDesc}</p>
                    <button class="rgs-reload-btn" type="button" id="btn-rgs-reload">${t.reloadButton}</button>
                  </div>
                `;
                document.body.appendChild(blocker);
                document.getElementById('btn-rgs-reload')?.addEventListener('click', () => {
                    window.location.reload();
                });
                return;
            }

            // Sync dynamic betLevels from RGS [242]
            if (auth.config && auth.config.betLevels && auth.config.betLevels.length > 0) {
                currentBetLevels = [...auth.config.betLevels].sort((a, b) => a - b);
            }

            const brandTag = document.getElementById('brand-tag-indicator');
            if (brandTag) {
                if (stakeRGS.session.isLiveRGS && auth.success) {
                    engine.balance = auth.balance;
                    brandTag.className = 'brand-tag live-rgs';
                    brandTag.innerHTML = `<span class="rgs-pulse-dot"></span> ${t.studioName} · ${t.rgsConnected} (${stakeRGS.session.currency})`;
                } else {
                    brandTag.className = 'brand-tag sandbox';
                    brandTag.innerHTML = `<span class="sandbox-dot"></span> ${t.studioName} · ${t.sandboxDemo}`;
                }
            }

            const currencySign = document.getElementById('fintech-curr-sign');
            if (currencySign) {
                currencySign.textContent = stakeRGS.getCurrencySymbol();
            }

            if (betInput) {
                betInput.min = String(auth.config.minBet);
                betInput.max = String(auth.config.maxBet);
                betInput.step = String(auth.config.stepBet);

                // [187] Resume unfinished active round if present
                if (auth.activeRound && auth.activeRound.active) {
                    const roundAmt = auth.activeRound.amount;
                    betInput.value = formatBetLevelVal(roundAmt);
                    engine.betAmount = roundAmt;
                    engine.activeBetAmount = roundAmt;
                    engine.initialEffectiveBet = roundAmt;

                    const mult = typeof auth.activeRound.payoutMultiplier === 'number' && auth.activeRound.payoutMultiplier > 0
                        ? auth.activeRound.payoutMultiplier
                        : 1.0;
                    engine.currentMultiplier = mult;
                    engine.state = GameState.PLAYING;
                    engine.currentRow = mult > 1.0 ? 2 : 1;

                    stakeRGS.showToast(lang === 'es' ? 'Ronda activa reanudada.' : 'Active round resumed.', 'info', 3000);
                } else {
                    betInput.value = formatBetLevelVal(auth.config.defaultBetLevel);
                    engine.betAmount = auth.config.defaultBetLevel;
                }
            }

            syncBetMetrics();
            syncUI();
        });
    }

    // 7. OFFICIAL REPLAY ENGINE WIRE-UP [171-174, 243, 188]
    if (isReplay) {
        const rp = stakeRGS.session.replayParams;
        const btnReplayAction = document.getElementById('btn-replay-action') as HTMLButtonElement | null;
        let isReplayRunning = false;

        stakeRGS.fetchReplayEvent().then((replay) => {
            if (!replay.success) {
                stakeRGS.showToast(replay.errorMessage || t.replayErrorDesc, 'error');
                return;
            }

            const costMult = replay.costMultiplier ?? 1.0;
            const payoutMult = replay.payoutMultiplier ?? 0;
            const baseAmount = rp ? rp.amount : 1.0;
            const realCost = baseAmount * costMult;
            const totalWin = baseAmount * payoutMult;

            const baseEl = document.getElementById('replay-base-bet');
            const costEl = document.getElementById('replay-total-cost');
            const multEl = document.getElementById('replay-mult-val');
            const winEl = document.getElementById('replay-payout-val');

            if (baseEl) baseEl.textContent = stakeRGS.formatCurrency(baseAmount);
            if (costEl) costEl.textContent = stakeRGS.formatCurrency(realCost);
            if (multEl) multEl.textContent = `${payoutMult.toFixed(2)}×`;
            if (winEl) winEl.textContent = stakeRGS.formatCurrency(totalWin);

            if (btnReplayAction) {
                btnReplayAction.addEventListener('click', async () => {
                    if (isReplayRunning) return;
                    isReplayRunning = true;
                    btnReplayAction.disabled = true;
                    btnReplayAction.textContent = '...';

                    engine.resetToIdle();
                    cancelPendingCrashReset();
                    cancelPendingVictoryCelebration();

                    audioController.playClick();
                    audioController.startAmbientDrone();
                    engine.startBet(baseAmount, 1, false, false);
                    syncUI();

                    // Step sequence replay from state or simulated steps to match final multiplier
                    const stepsToPlay = Math.max(1, Math.min(10, Math.round(payoutMult > 0 ? (payoutMult / 1.2) : 2)));
                    for (let step = 1; step <= stepsToPlay; step++) {
                        await new Promise((r) => setTimeout(r, 700));
                        if (step === stepsToPlay && payoutMult === 0) {
                            // Final crash step
                            engine.cashout();
                            engine.state = GameState.CRASHED;
                            triggerTryAgainRetentionLoop();
                            break;
                        } else {
                            // Safe gate advance
                            stateCtrl.selectLaneWithHitStop(Math.floor(Math.random() * TOTAL_LANES));
                        }
                    }

                    if (payoutMult > 0) {
                        await new Promise((r) => setTimeout(r, 400));
                        engine.cashout();
                        if (payoutMult >= 5) {
                            triggerDynamicVictoryCelebration(totalWin, payoutMult);
                        }
                    }

                    isReplayRunning = false;
                    btnReplayAction.disabled = false;
                    btnReplayAction.textContent = t.replayWatchAgainBtn;
                    syncUI();
                });
            }
        });
    }

    function cancelPendingCrashReset() {
        if (crashResetTimeoutId !== null) {
            window.clearTimeout(crashResetTimeoutId);
            crashResetTimeoutId = null;
        }
        if (tryAgainAnimFrameId !== null) {
            cancelAnimationFrame(tryAgainAnimFrameId);
            tryAgainAnimFrameId = null;
        }
        const ctx = tryAgainCanvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, tryAgainCanvas.width, tryAgainCanvas.height);
        }
        gsap.killTweensOf(tryAgainContent);
        tryAgainOverlay.classList.remove('visible');
    }

    function cancelPendingVictoryCelebration() {
        if (victoryTimeoutId !== null) {
            window.clearTimeout(victoryTimeoutId);
            victoryTimeoutId = null;
        }
        if (victoryAnimFrameId !== null) {
            cancelAnimationFrame(victoryAnimFrameId);
            victoryAnimFrameId = null;
        }
        const ctx = victoryParticlesCanvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, victoryParticlesCanvas.width, victoryParticlesCanvas.height);
        }
        gsap.killTweensOf(victoryCounterObj);
        gsap.killTweensOf(megaWinCardInner);
        gsap.killTweensOf(supernovaFlareBar);
        gsap.killTweensOf(megaWinMult);
        megaBanner.classList.remove('visible');
    }

    function triggerTryAgainRetentionLoop() {
        cancelPendingCrashReset();

        const w = Math.min(stageContainer.clientWidth || window.innerWidth, 1600);
        const h = Math.min(stageContainer.clientHeight || window.innerHeight, 1000);
        tryAgainCanvas.width = w;
        tryAgainCanvas.height = h;
        const ctx = tryAgainCanvas.getContext('2d', { alpha: true });
        const cx = w * 0.5;
        const cy = h * 0.46;

        const palette = ['#ff2a54', '#fb7185', '#fbbf24', '#ffffff', '#00e5ff'];
        const particles: TryAgainParticle[] = [];
        for (let i = 0; i < 56; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 160 + Math.random() * 540;
            particles.push({
                x: cx + (Math.random() - 0.5) * 70,
                y: cy + (Math.random() - 0.5) * 30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                size: 3 + Math.random() * 5,
                alpha: 1,
                decay: 0.78 + Math.random() * 0.5,
                color: palette[i % palette.length]
            });
        }

        let shockwaveRadius = 20;
        let lastTs = performance.now();

        tryAgainOverlay.classList.add('visible');
        gsap.fromTo(
            tryAgainContent,
            { scale: 0.35, opacity: 0, y: 18 },
            { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: 'back.out(2.0)' }
        );

        const renderParticles = (now: number) => {
            const dt = Math.min(0.05, (now - lastTs) / 1000);
            lastTs = now;

            if (ctx) {
                ctx.clearRect(0, 0, w, h);
                shockwaveRadius += dt * 620;
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 42, 84, 0.4)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.vy += 420 * dt;
                    p.alpha -= p.decay * dt;

                    if (p.alpha > 0) {
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = p.alpha;
                        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
                    }
                }
                ctx.globalAlpha = 1;
            }

            tryAgainAnimFrameId = requestAnimationFrame(renderParticles);
        };
        tryAgainAnimFrameId = requestAnimationFrame(renderParticles);

        crashResetTimeoutId = window.setTimeout(() => {
            gsap.to(tryAgainContent, {
                opacity: 0,
                scale: 0.85,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    cancelPendingCrashReset();
                    engine.resetToIdle();
                    syncUI();
                }
            });
        }, 1250);
    }

    function syncBetInputFontSize() {
        if (!betInput) return;
        const rawLen = betInput.value.length;
        if (rawLen <= 6) {
            betInput.style.fontSize = '1.15rem';
        } else if (rawLen <= 9) {
            betInput.style.fontSize = '0.98rem';
        } else if (rawLen <= 12) {
            betInput.style.fontSize = '0.84rem';
        } else {
            betInput.style.fontSize = '0.74rem';
        }
    }

    function syncBetMetrics() {
        if (!betInput || isReplay) return;
        syncBetInputFontSize();
        const baseVal = Math.max(stakeRGS.betConfig.minBet, parseFloat(betInput.value) || stakeRGS.betConfig.defaultBetLevel);
        engine.betAmount = baseVal;
        const effVal = calculateEffectiveBet(baseVal);
        const formattedEff = stakeRGS.formatCurrency(effVal);
        if (betPctBadge) {
            betPctBadge.textContent = `Total: ${formattedEff}`;
        }
        if (focalCtaSub && engine.state !== GameState.PLAYING) {
            focalCtaSub.textContent = `${formattedEff} · ${t.focalActionReady}`;
        }
    }

    // 8. DYNAMIC BET LEVEL NAVIGATION (STRICTLY VIA SERVER BET LEVELS [242])
    if (betInput) {
        betInput.addEventListener('input', () => {
            if (isRulesModalOpen()) return;
            syncBetMetrics();
        });

        betInput.addEventListener('blur', () => {
            if (isRulesModalOpen()) return;
            const raw = parseFloat(betInput.value) || currentBetLevels[0];
            const snapped = snapToNearestBetLevel(raw);
            betInput.value = formatBetLevelVal(snapped);
            syncBetMetrics();
        });
    }

    const btnMin = document.getElementById('btn-min');
    if (btnMin) {
        btnMin.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING || !betInput) return;
            audioController.playClick();
            betInput.value = formatBetLevelVal(currentBetLevels[0]);
            syncBetMetrics();
        });
    }

    const btnHalf = document.getElementById('btn-half');
    if (btnHalf) {
        btnHalf.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING || !betInput) return;
            audioController.playClick();
            const currVal = parseFloat(betInput.value) || currentBetLevels[0];
            const currentIdx = currentBetLevels.findIndex((lvl) => lvl >= currVal);
            const targetIdx = currentIdx > 0 ? currentIdx - 1 : 0;
            betInput.value = formatBetLevelVal(currentBetLevels[targetIdx]);
            syncBetMetrics();
        });
    }

    const btnDouble = document.getElementById('btn-double');
    if (btnDouble) {
        btnDouble.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING || !betInput) return;
            audioController.playClick();
            const currVal = parseFloat(betInput.value) || currentBetLevels[0];
            const currentIdx = currentBetLevels.findIndex((lvl) => lvl >= currVal);
            const targetIdx = currentIdx < currentBetLevels.length - 1 ? currentIdx + 1 : currentBetLevels.length - 1;
            betInput.value = formatBetLevelVal(currentBetLevels[targetIdx]);
            syncBetMetrics();
        });
    }

    const btnMax = document.getElementById('btn-max');
    if (btnMax) {
        btnMax.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING || !betInput) return;
            audioController.playClick();
            // Pick highest bet level <= balance or max level
            const affordableLevels = currentBetLevels.filter((lvl) => lvl <= engine.balance);
            const maxChoice = affordableLevels.length > 0
                ? affordableLevels[affordableLevels.length - 1]
                : currentBetLevels[currentBetLevels.length - 1];
            betInput.value = formatBetLevelVal(maxChoice);
            syncBetMetrics();
        });
    }

    mineBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING) return;
            audioController.playClick();
            const mines = parseInt(btn.dataset.mines || '1', 10);
            engine.minesCount = mines;
            mineBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            syncUI();
        });
    });

    function triggerMechanicalPress() {
        if (!btnPrimaryCta) return;
        btnPrimaryCta.classList.add('depressed-heavy');
        setTimeout(() => {
            btnPrimaryCta.classList.remove('depressed-heavy');
        }, 180);
    }

    // 9. PRIMARY FOCAL ACTION WITH CLIENT-SIDE BALANCE GUARD [222]
    async function handlePrimaryFocalAction() {
        if (isRulesModalOpen() || isReplay) return;
        if (engine.state === GameState.PLAYING) {
            if (engine.currentRow > 1 && !stateCtrl.isHitStopActive) {
                triggerMechanicalPress();
                const payout = engine.cashout();
                syncUI();
                if (stakeRGS.session.isLiveRGS && payout !== null && payout > 0) {
                    const endRes = await stakeRGS.endRound();
                    if (endRes.success && endRes.balance !== undefined) {
                        engine.balance = endRes.balance;
                        engine.emitBalanceChange();
                    }
                }
            }
        } else {
            cancelPendingCrashReset();
            cancelPendingVictoryCelebration();
            triggerMechanicalPress();

            const rawVal = betInput ? parseFloat(betInput.value) || currentBetLevels[0] : currentBetLevels[0];
            const betVal = snapToNearestBetLevel(rawVal);
            if (betInput) betInput.value = formatBetLevelVal(betVal);

            const effVal = calculateEffectiveBet(betVal);

            // [222] Client-side check preventing /wallet/play if balance < effVal
            if (engine.balance < effVal) {
                if (!stakeRGS.session.isLiveRGS) {
                    // Auto-recharge in demo/developer mode!
                    engine.balance += Math.max(1000, effVal * 10);
                    localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
                    syncUI();
                    stakeRGS.showToast('💰 Saldo Developer recargado automáticamente (+ $1,000.00)', 'success');
                } else {
                    stakeRGS.showToast(t.focalInsufficientFunds, 'error');
                    return;
                }
            }

            audioController.playClick();
            audioController.startAmbientDrone();

            if (stakeRGS.session.isLiveRGS) {
                if (btnPrimaryCta) btnPrimaryCta.disabled = true;
                if (focalCtaTitle) focalCtaTitle.textContent = t.focalConnecting;
                const playRes = await stakeRGS.playBet(effVal, 'base');
                if (btnPrimaryCta) btnPrimaryCta.disabled = false;
                if (!playRes.success) {
                    syncUI();
                    return;
                }
                if (playRes.balance !== undefined) {
                    engine.balance = playRes.balance + effVal;
                }
            }

            if (
                engine.startBet(
                    betVal,
                    engine.minesCount
                )
            ) {
                gsap.fromTo(
                    multHeroWrap,
                    { scale: 0.92 },
                    { scale: 1, duration: 0.35, ease: 'back.out(1.8)' }
                );
                syncUI();
            }
        }
    }

    async function handlePartialCashoutAction() {
        if (isRulesModalOpen() || isReplay) return;
        if (!engine.canPartialCashout() || stateCtrl.isHitStopActive) return;

        audioController.playClick();
        const halfPayout = engine.partialCashout();
        if (halfPayout !== null && halfPayout > 0) {
            audioController.playPartialCashout();
            gsap.killTweensOf(hitStopStamp);
            hitStopStamp.textContent = `[50% SECURED] ${t.focalSecuredToast.toUpperCase()} · +${stakeRGS.formatCurrency(halfPayout)}`;
            hitStopStamp.style.borderColor = '#38bdf8';
            hitStopStamp.style.color = '#38bdf8';
            gsap.fromTo(
                hitStopStamp,
                { opacity: 0, scale: 0.88, y: -4 },
                { opacity: 1, scale: 1.05, y: 0, duration: 0.16, ease: 'back.out(1.8)' }
            );
            gsap.to(hitStopStamp, {
                opacity: 0,
                scale: 0.94,
                delay: 0.85,
                duration: 0.22,
                ease: 'power2.out'
            });

            if (btnPartialCta) {
                btnPartialCta.classList.add('partial-depressed');
                setTimeout(() => {
                    btnPartialCta.classList.remove('partial-depressed');
                }, 180);
            }

            syncUI();
        }
    }

    if (btnPrimaryCta) btnPrimaryCta.addEventListener('click', handlePrimaryFocalAction);
    if (btnPartialCta) btnPartialCta.addEventListener('click', handlePartialCashoutAction);

    window.addEventListener('keydown', (e) => {
        if (isRulesModalOpen()) return;
        if (betInput && document.activeElement === betInput) return;

        if (e.key >= '1' && e.key <= '5') {
            const laneIdx = parseInt(e.key, 10) - 1;
            if (engine.state === GameState.PLAYING && !stateCtrl.isHitStopActive) {
                e.preventDefault();
                stateCtrl.selectLaneWithHitStop(laneIdx);
            }
        } else if (e.key.toLowerCase() === 'p') {
            e.preventDefault();
            handlePartialCashoutAction();
        } else if (e.code === 'Space') {
            e.preventDefault();
            handlePrimaryFocalAction();
        }
    });

    // 10. MULTI-CURRENCY HISTORY TICKER WITHOUT HARDCODED $ [219]
    function renderHistoryTicker() {
        const items = engine.recentSummaries.slice(0, 8);
        if (items.length === 0) return;

        historyTicker.innerHTML = items
            .map((h) => {
                const cls = h.isWin ? (h.finalMultiplier >= 5 ? 'mega' : 'win') : 'loss';
                const label = h.isWin ? `${h.finalMultiplier.toFixed(2)}×` : '0.00×';
                const betFormatted = stakeRGS.formatCurrency(h.effectiveBet);
                return `<span class="ticker-badge ${cls}" title="${lang === 'es' ? 'Ronda' : 'Round'} #${h.nonce} · ${t.betAmountLabel}: ${betFormatted}">${label}</span>`;
            })
            .join('');
    }

    function syncUI() {
        const isPlaying = engine.state === GameState.PLAYING;
        const currentMult = engine.currentMultiplier;
        const isFirstStep = engine.currentPicks.length === 0;
        const nextMult = isPlaying
            ? calculateNextStepMultiplier(
                  currentMult,
                  engine.minesCount,
                  isFirstStep
              )
            : calculateMultiplier(1, engine.minesCount);

        const isMobile = window.innerWidth <= 768;

        const balanceTitleLabel = document.getElementById('balance-title-label');
        if (balanceTitleLabel) {
            balanceTitleLabel.textContent = isReplay ? t.replayBadge : t.balanceLabel;
        }

        const safePct = Math.round(((TOTAL_LANES - engine.minesCount) / TOTAL_LANES) * 100);
        const firstStepMult = calculateMultiplier(1, engine.minesCount);
        if (survivalOddsBadge) {
            survivalOddsBadge.textContent = isMobile
                ? `${safePct}% · ${firstStepMult.toFixed(2)}×`
                : `${safePct}% ${t.minesProbLabel} · ${firstStepMult.toFixed(2)}×`;
        }

        if (balanceEl && !isReplay) {
            balanceEl.textContent = stakeRGS.formatCurrency(engine.balance);
            if (!stakeRGS.session.isLiveRGS) {
                localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
            }
        }

        multHeroVal.textContent = `${currentMult.toFixed(2)}×`;
        multNextPreview.textContent = `${t.nextMultiplierLabel}: ${nextMult.toFixed(2)}×`;

        if (isPlaying) {
            const potentialWin = calculatePayout(engine.activeBetAmount, currentMult);
            multHeroSub.textContent =
                engine.currentRow > 1
                    ? `${t.roundWonSub}: ${stakeRGS.formatCurrency(potentialWin)}`
                    : isMobile
                      ? t.touchGatePrompt
                      : t.selectGatePrompt;
        } else if (engine.state === GameState.WON) {
            const lastWin = engine.recentSummaries[0]?.payout ?? 0;
            multHeroSub.textContent = `${t.roundWonSub}: +${stakeRGS.formatCurrency(lastWin)}`;
        } else if (engine.state === GameState.CRASHED) {
            multHeroSub.textContent = `${t.roundCrashedSub} ${engine.lastCrashedRow ?? 1}`;
        } else {
            multHeroSub.textContent = t.readyToLaunchSub;
        }

        if (betInput) {
            betInput.disabled = isPlaying;
        }
        quickBetBtns.forEach((b) => (b.disabled = isPlaying));
        mineBtns.forEach((b) => (b.disabled = isPlaying));

        if (betInput && betPctBadge && !isReplay) {
            syncBetInputFontSize();
            const baseVal = Math.max(stakeRGS.betConfig.minBet, parseFloat(betInput.value) || currentBetLevels[0]);
            const effVal = calculateEffectiveBet(baseVal);
            const formattedEff = stakeRGS.formatCurrency(effVal);
            betPctBadge.textContent = `Total: ${formattedEff}`;

            const canCashout = isPlaying && engine.currentRow > 1 && !stateCtrl.isHitStopActive;

            if (btnPrimaryCta && focalCtaHeaderLabel && focalCtaTitle && focalCtaSub) {
                if (!isPlaying) {
                    btnPrimaryCta.disabled = false;
                    btnPrimaryCta.classList.remove('mode-cashout');
                    focalCtaHeaderLabel.textContent = t.focalActionLabel;
                    focalCtaTitle.textContent = t.focalDropCapsule;
                    focalCtaSub.textContent = `${formattedEff} · ${t.focalActionReady}`;
                } else if (canCashout) {
                    const cashoutVal = calculatePayout(engine.activeBetAmount, currentMult);
                    btnPrimaryCta.disabled = false;
                    btnPrimaryCta.classList.add('mode-cashout');
                    focalCtaHeaderLabel.textContent = lang === 'es' ? 'Cobro Disponible' : 'Cashout Available';
                    focalCtaTitle.textContent = `${t.focalCashout} ${stakeRGS.formatCurrency(cashoutVal)}`;
                    focalCtaSub.textContent = `${currentMult.toFixed(2)}× · ${t.shortcutSpace}`;
                } else {
                    btnPrimaryCta.disabled = true;
                    btnPrimaryCta.classList.remove('mode-cashout');
                    focalCtaHeaderLabel.textContent = lang === 'es' ? 'Ronda en Curso' : 'Round Active';
                    focalCtaTitle.textContent = isMobile ? `[1–5]` : `[1–5]`;
                    focalCtaSub.textContent = `Row ${engine.currentRow} · ${nextMult.toFixed(2)}×`;
                }
            }

            const canPartial = engine.canPartialCashout() && !stateCtrl.isHitStopActive;
            if (btnPartialCta && partialCtaSub && focalCtaHeaderShortcut) {
                if (canPartial) {
                    btnPartialCta.style.display = 'flex';
                    btnPartialCta.disabled = false;
                    const halfVal = Math.floor(calculatePayout(engine.activeBetAmount, currentMult) * 0.5 * 100) / 100;
                    partialCtaSub.textContent = `+${stakeRGS.formatCurrency(halfVal)}`;
                    focalCtaHeaderShortcut.textContent = `${t.shortcutSpace} / ${t.shortcutKeyP}`;
                } else {
                    btnPartialCta.style.display = 'none';
                    btnPartialCta.disabled = true;
                    focalCtaHeaderShortcut.textContent = t.shortcutSpace;
                }
            }
        }

        renderHistoryTicker();
    }

    stateCtrl.onHitStopStart((_row, _lane, _dur, callout) => {
        syncUI();
        gsap.killTweensOf(hitStopStamp);
        hitStopStamp.textContent = callout;
        hitStopStamp.style.borderColor = 'rgba(0, 229, 255, 0.45)';
        hitStopStamp.style.color = '#ffffff';
        gsap.fromTo(
            hitStopStamp,
            { opacity: 0, scale: 0.88, y: -4 },
            { opacity: 1, scale: 1.05, y: 0, duration: 0.12, ease: 'back.out(1.8)' }
        );
    });

    stateCtrl.onHitStopResolve((pick) => {
        syncUI();

        if (pick.isSafe) {
            const stepWin = calculatePayout(engine.activeBetAmount, pick.stepMultiplierAfter);

            gsap.killTweensOf(hitStopStamp);
            hitStopStamp.textContent = `ROW ${pick.row} CLEARED · +${stakeRGS.formatCurrency(stepWin)}`;
            hitStopStamp.style.borderColor = '#00e676';
            hitStopStamp.style.color = '#00e676';

            gsap.fromTo(
                hitStopStamp,
                { opacity: 1, scale: 1.04, y: 0 },
                {
                    opacity: 0,
                    scale: 0.96,
                    y: -3,
                    delay: 0.55,
                    duration: 0.22,
                    ease: 'power2.out'
                }
            );

            gsap.killTweensOf(multHeroVal);
            gsap.killTweensOf(multHeroWrap);

            gsap.fromTo(
                multHeroVal,
                {
                    scale: 1.12,
                    color: '#00e676'
                },
                {
                    scale: 1,
                    color: '#ffffff',
                    duration: 0.48,
                    ease: 'elastic.out(1.4, 0.3)'
                }
            );

            gsap.fromTo(
                multHeroWrap,
                { scale: 1.04 },
                { scale: 1, duration: 0.48, ease: 'elastic.out(1.35, 0.32)' }
            );
        } else {
            gsap.killTweensOf(hitStopStamp);
            gsap.to(hitStopStamp, { opacity: 0, scale: 0.92, duration: 0.12 });
            gsap.fromTo(
                multHeroWrap,
                { x: -18 },
                { x: 0, duration: 0.45, ease: 'elastic.out(1.5, 0.25)' }
            );
            triggerTryAgainRetentionLoop();
        }
    });

    engine.onCashout(() => {
        engine.resetToIdle();
        leftDock.classList.remove('betting-dock-ready-pulse');
        void leftDock.offsetWidth;
        leftDock.classList.add('betting-dock-ready-pulse');
        syncUI();
    });

    stateCtrl.onMegaWin((payout, multiplier) => {
        triggerDynamicVictoryCelebration(payout, multiplier);
    });

    engine.onBalanceChange(() => {
        syncUI();
    });

    const victorySpriteCache = new Map<string, HTMLCanvasElement>();

    function getVictoryParticleSprite(
        type: VictoryEmitterType,
        color: string,
        secondaryColor: string,
        leafCount: number
    ): HTMLCanvasElement {
        const key = `${type}|${color}|${secondaryColor}|${leafCount}`;
        const cached = victorySpriteCache.get(key);
        if (cached) return cached;

        const size = 64;
        const half = size * 0.5;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const sctx = c.getContext('2d')!;
        sctx.translate(half, half);

        if (type === 'ION_PLASMA') {
            const r = 16;
            const grad = sctx.createRadialGradient(0, 0, 1, 0, 0, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, color);
            grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            sctx.fillStyle = grad;
            sctx.shadowColor = '#00f0ff';
            sctx.shadowBlur = 8;
            sctx.beginPath();
            sctx.arc(0, 0, r, 0, Math.PI * 2);
            sctx.fill();

            sctx.shadowBlur = 0;
            sctx.strokeStyle = secondaryColor;
            sctx.lineWidth = 1.8;
            sctx.beginPath();
            sctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
            sctx.stroke();
        } else if (type === 'TITANIUM_SPARKS') {
            const r = 16;
            sctx.fillStyle = color;
            sctx.shadowColor = '#f59e0b';
            sctx.shadowBlur = 8;
            sctx.beginPath();
            sctx.moveTo(0, -r);
            sctx.lineTo(r * 0.45, 0);
            sctx.lineTo(0, r);
            sctx.lineTo(-r * 0.45, 0);
            sctx.closePath();
            sctx.fill();

            sctx.shadowBlur = 0;
            sctx.fillStyle = '#ffffff';
            sctx.fillRect(-2, -2, 4, 4);
        } else if (type === 'QUANTUM_BURST') {
            const r = 17;
            sctx.fillStyle = color;
            sctx.shadowColor = '#c084fc';
            sctx.shadowBlur = 8;
            sctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = Math.cos(a) * r;
                const y = Math.sin(a) * r;
                if (i === 0) sctx.moveTo(x, y);
                else sctx.lineTo(x, y);
            }
            sctx.closePath();
            sctx.fill();

            sctx.shadowBlur = 0;
            sctx.strokeStyle = '#ffffff';
            sctx.lineWidth = 1.6;
            sctx.stroke();
        } else {
            // HYPERDRIVE_STREAKS
            const len = 22;
            const w = 4;
            sctx.fillStyle = color;
            sctx.shadowColor = color;
            sctx.shadowBlur = 8;
            sctx.beginPath();
            sctx.ellipse(0, 0, len, w, 0, 0, Math.PI * 2);
            sctx.fill();

            sctx.shadowBlur = 0;
            sctx.fillStyle = '#ffffff';
            sctx.fillRect(-len * 0.5, -1, len, 2);
        }

        victorySpriteCache.set(key, c);
        return c;
    }

    function triggerDynamicVictoryCelebration(payout: number, mult: number) {
        cancelPendingVictoryCelebration();

        let headlineIdx = 0;
        let emitterIdx = 0;

        if (victoryCallCount === 0 || victoryCallCount % 4 === 0) {
            headlineIdx = 0;
            emitterIdx = 0;
        } else {
            do {
                headlineIdx = Math.floor(Math.random() * VICTORY_HEADLINES.length);
            } while (headlineIdx === lastHeadlineIdx);

            do {
                emitterIdx = Math.floor(Math.random() * VICTORY_EMITTERS.length);
            } while (emitterIdx === lastEmitterIdx);
        }

        victoryCallCount++;
        lastHeadlineIdx = headlineIdx;
        lastEmitterIdx = emitterIdx;

        const chosenHeadline = VICTORY_HEADLINES[headlineIdx];
        const chosenEmitter = VICTORY_EMITTERS[emitterIdx];

        megaWinTitle.textContent = chosenHeadline;
        megaWinMult.textContent = `${mult.toFixed(2)}× ${lang === 'es' ? 'MULTIPLICADOR' : 'MULTIPLIER'}`;

        if (chosenEmitter === 'ION_PLASMA') {
            megaWinTitle.style.background =
                'linear-gradient(180deg, #ffffff 0%, #38bdf8 48%, #00f0ff 100%)';
            megaWinTitle.style.webkitBackgroundClip = 'text';
            megaWinTitle.style.webkitTextFillColor = 'transparent';
        } else if (chosenEmitter === 'TITANIUM_SPARKS') {
            megaWinTitle.style.background =
                'linear-gradient(180deg, #ffffff 0%, #fde047 48%, #f59e0b 100%)';
            megaWinTitle.style.webkitBackgroundClip = 'text';
            megaWinTitle.style.webkitTextFillColor = 'transparent';
        } else if (chosenEmitter === 'QUANTUM_BURST') {
            megaWinTitle.style.background =
                'linear-gradient(180deg, #ffffff 0%, #e9d5ff 48%, #a855f7 100%)';
            megaWinTitle.style.webkitBackgroundClip = 'text';
            megaWinTitle.style.webkitTextFillColor = 'transparent';
        } else {
            megaWinTitle.style.background =
                'linear-gradient(180deg, #ffffff 0%, #bae6fd 48%, #818cf8 100%)';
            megaWinTitle.style.webkitBackgroundClip = 'text';
            megaWinTitle.style.webkitTextFillColor = 'transparent';
        }

        const w = Math.min(stageContainer.clientWidth || window.innerWidth, 1600);
        const h = Math.min(stageContainer.clientHeight || window.innerHeight, 1000);
        victoryParticlesCanvas.width = w;
        victoryParticlesCanvas.height = h;
        const ctx = victoryParticlesCanvas.getContext('2d', { alpha: true });

        const palettes: Record<VictoryEmitterType, string[]> = {
            ION_PLASMA: ['#00f0ff', '#38bdf8', '#0284c7', '#ffffff'],
            TITANIUM_SPARKS: ['#fde047', '#f59e0b', '#fb923c', '#ffffff'],
            QUANTUM_BURST: ['#c084fc', '#a855f7', '#7c3aed', '#e9d5ff'],
            HYPERDRIVE_STREAKS: ['#ffffff', '#38bdf8', '#818cf8', '#00f0ff']
        };
        const activePalette = palettes[chosenEmitter];
        const secondaryColor = chosenEmitter === 'TITANIUM_SPARKS' ? '#f59e0b' : '#38bdf8';

        const particleCount = 68;
        const particles: (VictoryParticle & { sprite: HTMLCanvasElement })[] = [];
        for (let i = 0; i < particleCount; i++) {
            const isBurst = chosenEmitter === 'HYPERDRIVE_STREAKS' && i < 34;
            const angle = Math.random() * Math.PI * 2;
            const burstSpeed = 180 + Math.random() * 500;
            const color = activePalette[i % activePalette.length];
            const leafCount = i % 3 === 0 ? 4 : 3;

            particles.push({
                x: isBurst ? w * 0.5 + (Math.random() - 0.5) * 110 : Math.random() * w,
                y: isBurst ? h * 0.42 + (Math.random() - 0.5) * 70 : -20 - Math.random() * h * 0.85,
                vx: isBurst ? Math.cos(angle) * burstSpeed : (Math.random() - 0.5) * 130,
                vy: isBurst ? Math.sin(angle) * burstSpeed - 110 : 250 + Math.random() * 390,
                size: 16 + Math.random() * 16,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 5.0,
                spinPhase: Math.random() * Math.PI * 2,
                spinSpeed: 3.2 + Math.random() * 5.2,
                alpha: 0.88 + Math.random() * 0.12,
                color,
                secondaryColor,
                leafCount,
                sprite: getVictoryParticleSprite(chosenEmitter, color, secondaryColor, leafCount)
            });
        }

        megaBanner.classList.add('visible');

        gsap.fromTo(
            megaWinCardInner,
            { scale: 0.45, opacity: 0, y: 24 },
            { scale: 1, opacity: 1, y: 0, duration: 0.42, ease: 'back.out(1.8)' }
        );

        gsap.fromTo(
            supernovaFlareBar,
            { scaleX: 0.1, opacity: 1 },
            { scaleX: 1.15, opacity: 0.82, duration: 0.48, ease: 'expo.out' }
        );

        gsap.fromTo(
            megaWinMult,
            { scale: 0.45 },
            { scale: 1.0, duration: 0.58, ease: 'back.out(2.0)' }
        );

        victoryCounterObj = { val: 0 };
        gsap.to(victoryCounterObj, {
            val: payout,
            duration: 0.7,
            ease: 'power3.out',
            onUpdate: () => {
                megaWinAmount.textContent = `+${stakeRGS.formatCurrency(victoryCounterObj.val)}`;
            }
        });

        let lastTs = performance.now();
        const animateVictoryParticles = (now: number) => {
            const dt = Math.min(0.05, (now - lastTs) / 1000);
            lastTs = now;

            if (ctx) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, w, h);

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx * dt + Math.sin(now * 0.004 + p.spinPhase) * 32 * dt;
                    p.y += p.vy * dt;
                    p.vy += 180 * dt;
                    p.rot += p.rotSpeed * dt;
                    p.spinPhase += p.spinSpeed * dt;

                    if (p.y > h + 30) {
                        p.y = -25;
                        p.x = Math.random() * w;
                        p.vy = 240 + Math.random() * 360;
                    }

                    const tiltScaleX =
                        chosenEmitter === 'HYPERDRIVE_STREAKS'
                            ? 1
                            : Math.max(0.24, Math.abs(Math.cos(p.spinPhase)));
                    const cos = Math.cos(p.rot);
                    const sin = Math.sin(p.rot);
                    const drawSize = p.size * 1.9;
                    const halfDraw = drawSize * 0.5;

                    ctx.globalAlpha = p.alpha;
                    ctx.setTransform(
                        cos * tiltScaleX,
                        sin * tiltScaleX,
                        -sin,
                        cos,
                        p.x,
                        p.y
                    );
                    ctx.drawImage(p.sprite, -halfDraw, -halfDraw, drawSize, drawSize);
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 1;
            }

            victoryAnimFrameId = requestAnimationFrame(animateVictoryParticles);
        };
        victoryAnimFrameId = requestAnimationFrame(animateVictoryParticles);

        victoryTimeoutId = window.setTimeout(() => {
            gsap.to(megaWinCardInner, {
                scale: 0.9,
                opacity: 0,
                duration: 0.16,
                ease: 'power2.in',
                onComplete: () => {
                    cancelPendingVictoryCelebration();
                    if (engine.state !== GameState.PLAYING) {
                        engine.resetToIdle();
                        leftDock.classList.remove('betting-dock-ready-pulse');
                        void leftDock.offsetWidth;
                        leftDock.classList.add('betting-dock-ready-pulse');
                        syncUI();
                    }
                }
            });
        }, 1320);
    }

    window.addEventListener('resize', () => {
        syncUI();
    });

    syncBetMetrics();
    syncUI();
}
