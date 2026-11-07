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
import { createBonusBuyButton, toggleBonusBuyModal, isBonusBuyModalOpen } from './bonusBuyModal';
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

const VICTORY_HEADLINES_EN = [
    'VICTORY!',
    'BIG WIN!',
    'WARP ESCAPE!',
    'MEGA CASHOUT!',
    'CLEARED!'
];

const VICTORY_HEADLINES_ES = [
    '¡VICTORIA!',
    '¡GRAN ESCAPE!',
    '¡RETIRO ÉPICO!',
    '¡MEGA PREMIO!',
    '¡MISIÓN CUMPLIDA!'
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
    renderer: PixiRenderer
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

    // 1. PRODUCTION TOP UNIFIED CYBER-AVIONICS GANTRY HUD (3x Thicker Armored Canopy)
    topHeader.innerHTML = `
      <div class="top-gantry-hud" id="top-gantry-hud">
        <!-- ZONE 1: LEFT WING + CONDUIT BRIDGE (1fr) -->
        <div class="gantry-zone gantry-zone-left">
          <!-- Left Wing (3x Height) -->
          <div class="gantry-wing gantry-wing-left">
            <!-- Brand Button -->
            <div class="gantry-brand-btn" title="Endless Descent">
              <svg class="gantry-brand-arrow" width="14" height="14" viewBox="0 0 24 24" fill="#93c5fd">
                <polygon points="12 4 22 20 2 20"/>
              </svg>
              <span class="gantry-brand-title">${t.gameTitle}</span>
            </div>

            <!-- Quantum Starfighter Radar Hologram -->
            <div class="gantry-radar-emblem" title="Quantum Radar Telemetry">
              <svg width="46" height="46" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="ship-hull-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#0369a1"/>
                    <stop offset="45%" stop-color="#0284c7"/>
                    <stop offset="85%" stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#a5f3fc"/>
                  </linearGradient>
                </defs>

                <!-- Outer Holographic Tactical Radar Perimeter -->
                <circle cx="32" cy="32" r="28" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="3,3.5" opacity="0.35"/>
                <circle cx="32" cy="32" r="18" stroke="#00f0ff" stroke-width="0.9" opacity="0.22"/>
                <circle cx="32" cy="32" r="8" stroke="#00f0ff" stroke-width="0.7" opacity="0.18"/>

                <!-- Tactical Crosshair Cardinal Ticks -->
                <line x1="32" y1="3" x2="32" y2="8" stroke="#00f0ff" stroke-width="1.2" opacity="0.6"/>
                <line x1="32" y1="56" x2="32" y2="61" stroke="#00f0ff" stroke-width="1.2" opacity="0.6"/>
                <line x1="3" y1="32" x2="8" y2="32" stroke="#00f0ff" stroke-width="1.2" opacity="0.6"/>
                <line x1="56" y1="32" x2="61" y2="32" stroke="#00f0ff" stroke-width="1.2" opacity="0.6"/>

                <!-- Telemetry Blips -->
                <circle cx="15" cy="18" r="1.8" fill="#00f0ff" opacity="0.9"/>
                <circle cx="49" cy="47" r="1.5" fill="#38bdf8" opacity="0.8"/>
                <circle cx="48" cy="17" r="1.2" fill="#00f0ff" opacity="0.65"/>

                <!-- Twin Ion Thruster Plasma Plumes (Shooting Left) -->
                <polygon points="17,26 9,28 17,30" fill="#00f0ff" opacity="0.85"/>
                <polygon points="17,34 9,36 17,38" fill="#00f0ff" opacity="0.85"/>
                <line x1="14" y1="28" x2="5" y2="28" stroke="#e0faff" stroke-width="1.8" stroke-linecap="round"/>
                <line x1="14" y1="36" x2="5" y2="36" stroke="#e0faff" stroke-width="1.8" stroke-linecap="round"/>

                <!-- Main Starfighter Hull (Delta Wing Interceptor) -->
                <path d="M 52,32 
                         L 36,23 
                         L 30,26 
                         L 18,12 
                         L 20,24 
                         L 16,25 
                         L 16,31 
                         L 19,32 
                         L 16,33 
                         L 16,39 
                         L 20,40 
                         L 18,52 
                         L 30,38 
                         L 36,41 Z" 
                      fill="url(#ship-hull-grad)" 
                      stroke="#00f0ff" 
                      stroke-width="1.8" 
                      stroke-linejoin="round"/>

                <!-- Cockpit Canopy (Gleaming Cyan Glass) -->
                <polygon points="46,32 34,29 27,32 34,35" fill="#e0faff" stroke="#00f0ff" stroke-width="1.2" opacity="0.95"/>
                <line x1="42" y1="32" x2="31" y2="32" stroke="#0284c7" stroke-width="1" stroke-linecap="round"/>

                <!-- Wing Inset Armor Panels -->
                <line x1="28" y1="27" x2="21" y2="17" stroke="#38bdf8" stroke-width="1.3" opacity="0.85" stroke-linecap="round"/>
                <line x1="28" y1="37" x2="21" y2="47" stroke="#38bdf8" stroke-width="1.3" opacity="0.85" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Left Angled Transition Bracket with Dual Vent Slits (84px Height) -->
            <div class="gantry-bracket gantry-bracket-left">
              <svg width="52" height="84" viewBox="0 0 52 84" fill="none">
                <polygon points="0,0 18,0 52,22 52,62 18,84 0,84" fill="url(#gantry-steel-grad)" stroke="#080d14" stroke-width="2.6" stroke-linejoin="round"/>
                <line x1="0" y1="2" x2="18" y2="2" stroke="#5d7184" stroke-width="2.2"/>
                <line x1="18" y1="2" x2="52" y2="23.5" stroke="#5d7184" stroke-width="2.2"/>
                <line x1="0" y1="82" x2="18" y2="82" stroke="#0a0f16" stroke-width="2.2"/>
                <line x1="18" y1="82" x2="52" y2="60.5" stroke="#0a0f16" stroke-width="2.2"/>
                <!-- Upper 3 Cyan Slits -->
                <line x1="10" y1="9" x2="20" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <line x1="20" y1="9" x2="30" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <line x1="30" y1="9" x2="40" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <!-- Lower 3 Emerald Slits -->
                <line x1="10" y1="75" x2="20" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                <line x1="20" y1="75" x2="30" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                <line x1="30" y1="75" x2="40" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <!-- Left Bridge Conduit Rail (3x Thicker Rail) -->
          <div class="gantry-bridge gantry-bridge-left">
            <div class="bridge-rail-track">
              <div class="bridge-rail-groove top-groove"></div>
              <div class="bridge-rail-groove bottom-groove"></div>
            </div>
            <div class="bridge-dock-group">
              <div class="bridge-hash-ticks">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="bridge-access-plate">
                <span class="rivet r-tl"></span>
                <span class="rivet r-tr"></span>
                <span class="rivet r-bl"></span>
                <span class="rivet r-br"></span>
              </div>
              <div class="bridge-chevron-interface right-pointing">
                <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                  <path d="M4 3L14 12L4 21" stroke="#10b981" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- ZONE 2: CENTER HERO MULTIPLIER CONSOLE (Dead-Center Column, 3x Scale) -->
        <div class="gantry-center-console" id="mult-hero-wrap">
          <!-- Top Hex/Trapezoid Chip -->
          <div class="gantry-next-chip">
            <span id="mult-next-preview">${lang === 'es' ? 'SIGUIENTE: 1.20x' : 'NEXT 1.20x'}</span>
          </div>

          <!-- Main Console Cockpit Display Frame -->
          <div class="gantry-console-screen">
            <svg class="gantry-screen-svg" viewBox="0 0 400 76" preserveAspectRatio="none">
              <polygon points="16,3 384,3 397,16 397,60 384,73 16,73 3,60 3,16" fill="url(#gantry-screen-grad)" stroke="#00f0ff" stroke-width="2.2" opacity="0.9"/>
            </svg>

            <!-- Screen Content -->
            <div class="gantry-screen-body">
              <!-- Flank Inward Chevrons -->
              <div class="gantry-flank-chevron left">
                <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
                  <path d="M4 3L12 11L4 19" stroke="#10b981" stroke-width="3.2" stroke-linecap="round"/>
                </svg>
              </div>

              <!-- Giant Hero Multiplier Value -->
              <div class="gantry-multiplier-readout" id="mult-hero-value">1.00x</div>

              <div class="gantry-flank-chevron right">
                <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
                  <path d="M12 3L4 11L12 19" stroke="#10b981" stroke-width="3.2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Bottom Symmetrical Tactical Status Capsule -->
          <div class="gantry-status-capsule">
            <span class="gantry-status-dot" id="mult-status-dot"></span>
            <span class="gantry-status-text" id="mult-hero-sub">${t.readyToLaunchSub}</span>
          </div>
        </div>

        <!-- ZONE 3: CONDUIT BRIDGE + RIGHT WING (1fr) -->
        <div class="gantry-zone gantry-zone-right">
          <!-- Right Bridge Conduit Rail (3x Thicker Rail) -->
          <div class="gantry-bridge gantry-bridge-right">
            <div class="bridge-dock-group">
              <div class="bridge-chevron-interface left-pointing">
                <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                  <path d="M14 3L4 12L14 21" stroke="#10b981" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="bridge-access-plate">
                <span class="rivet r-tl"></span>
                <span class="rivet r-tr"></span>
                <span class="rivet r-bl"></span>
                <span class="rivet r-br"></span>
              </div>
              <div class="bridge-hash-ticks">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="bridge-rail-track">
              <div class="bridge-rail-groove top-groove"></div>
              <div class="bridge-rail-groove bottom-groove"></div>
            </div>
          </div>

          <!-- Right Wing (3x Height) -->
          <div class="gantry-wing gantry-wing-right">
            <!-- Right Angled Transition Bracket with Dual Vent Slits (84px Height) -->
            <div class="gantry-bracket gantry-bracket-right">
              <svg width="52" height="84" viewBox="0 0 52 84" fill="none">
                <polygon points="52,0 34,0 0,22 0,62 34,84 52,84" fill="url(#gantry-steel-grad)" stroke="#080d14" stroke-width="2.6" stroke-linejoin="round"/>
                <line x1="52" y1="2" x2="34" y2="2" stroke="#5d7184" stroke-width="2.2"/>
                <line x1="34" y1="2" x2="0" y2="23.5" stroke="#5d7184" stroke-width="2.2"/>
                <line x1="52" y1="82" x2="34" y2="82" stroke="#0a0f16" stroke-width="2.2"/>
                <line x1="34" y1="82" x2="0" y2="60.5" stroke="#0a0f16" stroke-width="2.2"/>
                <!-- Upper 3 Cyan Slits -->
                <line x1="42" y1="9" x2="32" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <line x1="32" y1="9" x2="22" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <line x1="22" y1="9" x2="12" y2="19" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
                <!-- Lower 3 Emerald Slits -->
                <line x1="42" y1="75" x2="32" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                <line x1="32" y1="75" x2="22" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                <line x1="22" y1="75" x2="12" y2="65" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Action Button Cluster (Rules & Audio) -->
            <div class="gantry-btn-cluster">
              <button class="gantry-icon-btn" id="btn-rules" type="button" title="${t.rulesToggleTitle}">
                <span class="btn-glyph">?</span>
                <span id="rules-label" class="sr-only">${lang === 'es' ? 'Reglas' : 'Rules'}</span>
              </button>
              <div class="gantry-divider"></div>
              <button class="gantry-icon-btn active" id="btn-audio" type="button" title="${t.soundToggleTitle}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" id="audio-icon-svg">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span id="audio-label" class="sr-only">${lang === 'es' ? 'Sonido' : 'Sound'}</span>
              </button>
            </div>

            <!-- Recessed Avionics Balance Display Screen (3x Scale) -->
            <div class="gantry-balance-capsule balance-pill" title="${t.balanceLabel}">
              <div class="gantry-balance-label" id="balance-title-label">${isReplay ? t.replayBadge : (lang === 'es' ? 'SALDO' : 'BALANCE')}</div>
              <div class="gantry-balance-value" id="hud-balance">${stakeRGS.formatCurrency(isReplay && stakeRGS.session.replayParams ? stakeRGS.session.replayParams.amount : engine.balance)}</div>
            </div>
          </div>
        </div>

        <!-- Shared SVG Definitions -->
        <svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true">
          <defs>
            <linearGradient id="gantry-steel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3e4d5d"/>
              <stop offset="50%" stop-color="#283543"/>
              <stop offset="100%" stop-color="#18232e"/>
            </linearGradient>
            <linearGradient id="gantry-screen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0e1722"/>
              <stop offset="100%" stop-color="#060a0f"/>
            </linearGradient>
          </defs>
        </svg>

        <!-- Hidden Stake RGS Compatibility Elements -->
        <div class="header-ticker-strip" id="history-ticker" style="display: none !important;"></div>
        <span class="brand-tag ${isReplay ? 'replay' : 'sandbox'}" id="brand-tag-indicator" style="display: none !important;"></span>
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
          <!-- Hand-Drawn Cel-Shaded Comic Steel Cockpit Console (Matches Ship & Crates Art Style) -->
          <svg class="dock-armored-bezel-svg" viewBox="0 0 1280 154" preserveAspectRatio="none" aria-hidden="true">
            <!-- 1. TOP-LEFT PHYSICAL 3D COMIC PUSH-BUTTONS STICKING UP FROM THE RIM (Blue, Orange, Red) -->
            <g stroke="#080b11" stroke-width="3" stroke-linejoin="round">
              <!-- Blue Push-Button -->
              <polygon points="104,19 110,5 142,5 148,19" fill="#2563eb" stroke="none"/>
              <polygon points="110,5 142,5 145,11 107,11" fill="#93c5fd" stroke="none"/>
              <polygon points="104,19 110,5 142,5 148,19" fill="none" stroke="#080b11" stroke-width="3"/>
              <line x1="107" y1="11" x2="145" y2="11" stroke="#080b11" stroke-width="2.2"/>
              <line x1="114" y1="5" x2="112" y2="11" stroke="#080b11" stroke-width="1.8"/>
              <!-- Orange Push-Button -->
              <polygon points="158,19 164,5 196,5 202,19" fill="#d97706" stroke="none"/>
              <polygon points="164,5 196,5 199,11 161,11" fill="#fde68a" stroke="none"/>
              <polygon points="158,19 164,5 196,5 202,19" fill="none" stroke="#080b11" stroke-width="3"/>
              <line x1="161" y1="11" x2="199" y2="11" stroke="#080b11" stroke-width="2.2"/>
              <line x1="168" y1="5" x2="166" y2="11" stroke="#080b11" stroke-width="1.8"/>
              <!-- Red Push-Button -->
              <polygon points="212,19 218,5 250,5 256,19" fill="#dc2626" stroke="none"/>
              <polygon points="218,5 250,5 253,11 215,11" fill="#fca5a5" stroke="none"/>
              <polygon points="212,19 218,5 250,5 256,19" fill="none" stroke="#080b11" stroke-width="3"/>
              <line x1="215" y1="11" x2="253" y2="11" stroke="#080b11" stroke-width="2.2"/>
              <line x1="222" y1="5" x2="220" y2="11" stroke="#080b11" stroke-width="1.8"/>

              <!-- 2. TOP-RIGHT RAISED STEEL BULKHEAD TAB -->
              <polygon points="1012,19 1022,6 1152,6 1164,19" fill="#526273" stroke="none"/>
              <polygon points="1022,6 1152,6 1156,11 1018,11" fill="#7c8ea0" stroke="none"/>
              <!-- Rust Weathering Patch on Top-Right Tab -->
              <polygon points="1122,7.5 1150,7.5 1158,17.5 1114,17.5" fill="#785235" stroke="none" opacity="0.72"/>
              <polygon points="1012,19 1022,6 1152,6 1164,19" fill="none" stroke="#080b11" stroke-width="3.2"/>
              <line x1="1048" y1="6" x2="1044" y2="19" stroke="#080b11" stroke-width="2.4"/>
            </g>

            <!-- 3. LEFT & RIGHT SLOPED STRUCTURAL WING STRUTS (Bottom Flanks) -->
            <g stroke="#080b11" stroke-width="3.2" stroke-linejoin="round">
              <!-- Left Sloped Wing Strut -->
              <polygon points="34,76 6,151 48,151 64,76" fill="#475666"/>
              <polygon points="35,78 13,149 24,149 46,78" fill="#687a8c" stroke="none"/>
              <line x1="25" y1="102" x2="54" y2="112" stroke="#080b11" stroke-width="2.4"/>
              <line x1="18" y1="126" x2="48" y2="134" stroke="#080b11" stroke-width="2.2"/>
              <!-- Right Sloped Wing Strut -->
              <polygon points="1246,76 1274,151 1232,151 1216,76" fill="#475666"/>
              <polygon points="1234,78 1256,149 1267,149 1245,78" fill="#334150" stroke="none"/>
              <line x1="1255" y1="102" x2="1226" y2="112" stroke="#080b11" stroke-width="2.4"/>
              <line x1="1262" y1="126" x2="1232" y2="134" stroke="#080b11" stroke-width="2.2"/>
            </g>

            <!-- 4. MAIN SLOPED CEL-SHADED STEEL COCKPIT HOUSING -->
            <polygon
              points="56,19 1224,19 1242,36 1264,151 16,151 38,36"
              fill="#4c5d6e"
              stroke="#080b11"
              stroke-width="3.5"
              stroke-linejoin="round"
            />

            <!-- Top Light Steel Bevel Strip -->
            <polygon
              points="58,21 1222,21 1237,35 1226,35 1214,27 66,27 54,35 43,35"
              fill="#7b8fa2"
            />

            <!-- Left & Right Inner Sloped Steel Bevels -->
            <polygon points="40,36 54,36 36,149 20,149" fill="#687a8c"/>
            <polygon points="1226,36 1240,36 1260,149 1244,149" fill="#323f4d"/>

            <!-- Weathered Rust & Grime Patches on Outer Bezel (Matches Ship Wing Weathering) -->
            <polygon points="145,20.5 235,20.5 224,31 132,31" fill="#7c5234" opacity="0.68"/>
            <polygon points="1095,20.5 1218,20.5 1232,36 1175,34 1088,28" fill="#7c5234" opacity="0.72"/>
            <polygon points="22,122 44,118 39,148 19,148" fill="#7c5234" opacity="0.58"/>

            <!-- 5. INNER RECESSED DARK SLATE CONTROL DECK -->
            <polygon
              points="64,31 1216,31 1231,45 1248,145 32,145 49,45"
              fill="#2c3947"
              stroke="#080b11"
              stroke-width="3"
              stroke-linejoin="round"
            />

            <!-- Subtle Cel-Shaded Inner Deck Shadow & Rust Scuffs -->
            <polygon points="66,33 1214,33 1226,45 54,45" fill="#232e3a"/>
            <polygon points="245,126 365,128 352,143 228,143" fill="#6b4830" opacity="0.48"/>
            <polygon points="48,118 86,124 78,143 36,143" fill="#1e2732" opacity="0.75"/>

            <!-- 6. HAND-DRAWN COMIC INK SEAMS, RIVETS & CROSS-HATCHING LINES (////) -->
            <g stroke="#080b11" stroke-linecap="round">
              <!-- Outer Bezel Panel Seams -->
              <line x1="92" y1="19" x2="86" y2="31" stroke-width="2.4"/>
              <line x1="342" y1="19" x2="342" y2="31" stroke-width="2.4"/>
              <line x1="686" y1="19" x2="686" y2="31" stroke-width="2.4"/>
              <line x1="956" y1="19" x2="960" y2="31" stroke-width="2.4"/>
              <!-- Top Bezel Ink Hatching Marks //// -->
              <line x1="264" y1="22" x2="258" y2="29" stroke-width="1.6"/>
              <line x1="270" y1="22" x2="264" y2="29" stroke-width="1.6"/>
              <line x1="276" y1="22" x2="270" y2="29" stroke-width="1.6"/>
              <line x1="876" y1="22" x2="870" y2="29" stroke-width="1.6"/>
              <line x1="882" y1="22" x2="876" y2="29" stroke-width="1.6"/>
              <line x1="888" y1="22" x2="882" y2="29" stroke-width="1.6"/>
              <line x1="894" y1="22" x2="888" y2="29" stroke-width="1.6"/>
              <!-- Left & Right Lower Corner Ink Cross-Hatching -->
              <line x1="56" y1="122" x2="66" y2="142" stroke-width="1.8"/>
              <line x1="62" y1="126" x2="71" y2="142" stroke-width="1.6"/>
              <line x1="68" y1="130" x2="76" y2="142" stroke-width="1.5"/>
              <line x1="1224" y1="122" x2="1214" y2="142" stroke-width="1.8"/>
              <line x1="1218" y1="126" x2="1209" y2="142" stroke-width="1.6"/>
            </g>
          </svg>

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

            <!-- Column 2: Chunky 3D Comic Push-Buttons for Mines / Hazards -->
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

            <!-- Column 3: Comic-Inked Quantum Shield Purchase Toggle (+25% Bet · Deflects 1 Mine) -->
            <div class="betting-field-group shield-field-group">
              <div class="betting-field-header">
                <span class="betting-field-label" id="shield-field-label">${lang === 'es' ? 'Escudo' : 'Shield'}</span>
                <span class="betting-field-meta" id="shield-cost-badge">+25%</span>
              </div>
              <button class="comic-shield-toggle-btn" id="btn-shield-toggle" type="button" aria-pressed="false" title="${lang === 'es' ? 'Comprar Escudo Cuántico (+25% apuesta): Absorbe 1 mina y conserva 50% del multiplicador' : 'Buy Quantum Shield (+25% bet): Deflects 1 mine and retains 50% multiplier'}">
                <span class="shield-icon-wrap" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 5.5V11.5C4 16.8 7.4 21.6 12 23C16.6 21.6 20 16.8 20 11.5V5.5L12 2Z" fill="currentColor" fill-opacity="0.22" stroke="#080b11" stroke-width="2.4" stroke-linejoin="round"/>
                    <path d="M12 3.6L5.5 6.5V11.4C5.5 15.8 8.3 19.8 12 21.1C15.7 19.8 18.5 15.8 18.5 11.4V6.5L12 3.6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    <path d="M9.5 12L11.3 13.8L15 9.8" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="shield-btn-copy">
                  <span class="shield-btn-title" id="shield-btn-title">${lang === 'es' ? 'ESCUDO' : 'SHIELD'}</span>
                  <span class="shield-btn-state" id="shield-btn-state">OFF · 50% SAVE</span>
                </span>
              </button>
            </div>

            <!-- Column 4: Comic-Inked Emerald Launch Button with Hand-Drawn Electric Sparks -->
            <div class="betting-field-group fintech-cta-wrap">
              <div class="betting-field-header cta-telemetry-header">
                <span class="betting-field-label" id="focal-cta-header-label">${t.focalActionLabel}</span>
                <span class="betting-field-meta" id="focal-cta-header-shortcut">${t.shortcutSpace}</span>
              </div>
              <div class="focal-cta-actions-cluster">
                <!-- Hand-Drawn Comic Cyan/Emerald Electric Sparks Around Button Corners -->
                <svg class="comic-cta-sparks-svg" viewBox="0 0 380 84" preserveAspectRatio="none" aria-hidden="true">
                  <!-- Top-Left Electric Arcs -->
                  <polyline points="22,6 10,2 16,13 4,15 15,22" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="34,4 28,0 31,9" fill="none" stroke="#6ee7b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Bottom-Left Electric Arcs -->
                  <polyline points="20,78 8,82 15,70 3,66 14,59" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="35,80 28,84 32,75" fill="none" stroke="#6ee7b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Top-Right Electric Arcs -->
                  <polyline points="358,6 370,2 364,13 376,15 365,22" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="346,4 352,0 349,9" fill="none" stroke="#6ee7b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Bottom-Right Electric Arcs -->
                  <polyline points="360,78 372,82 365,70 377,66 366,59" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="345,80 352,84 348,75" fill="none" stroke="#6ee7b7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <button class="btn-primary-focal" id="btn-primary-cta" type="button">
                  <!-- Hand-Drawn Comic Ink Corner Hatching Inside the Green Button -->
                  <svg class="focal-btn-ink-decor" viewBox="0 0 340 60" preserveAspectRatio="none" aria-hidden="true">
                    <line x1="10" y1="42" x2="18" y2="54" stroke="#064e3b" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="16" y1="44" x2="23" y2="54" stroke="#064e3b" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="22" y1="46" x2="28" y2="54" stroke="#064e3b" stroke-width="1.8" stroke-linecap="round"/>
                    <line x1="316" y1="6" x2="324" y2="16" stroke="#064e3b" stroke-width="1.6" stroke-linecap="round"/>
                    <line x1="322" y1="6" x2="330" y2="16" stroke="#064e3b" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                  <span class="focal-btn-copy">
                    <span class="focal-btn-headline" id="focal-cta-title">${t.focalDropCapsule}</span>
                    <span class="focal-btn-sub" id="focal-cta-sub">(${t.shortcutSpace.toUpperCase()}) · ${stakeRGS.formatCurrency(initialEffVal)}</span>
                  </span>
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

    // 3. CENTER STAGE HIT-STOP COMIC CALLOUT STAMP OVERLAY
    const stageOverlay = document.createElement('div');
    stageOverlay.className = 'stage-hud-overlay';
    stageOverlay.innerHTML = `
      <div class="stage-top-hud-stack">
        <div class="hitstop-callout-pill" id="hitstop-comic-stamp">1.20×</div>
      </div>
      <div></div>
    `;
    stageContainer.appendChild(stageOverlay);

    // 3b. FLOATING CIRCULAR BONUS BUY BUTTON (VIP ACCESS TO WHEEL & SLOT)
    createBonusBuyButton(stageContainer, engine, renderer, syncUI);

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
    const multStatusDot = document.getElementById('mult-status-dot');
    const hitStopStamp = document.getElementById('hitstop-comic-stamp')!;

    const betInput = document.getElementById('bet-input') as HTMLInputElement | null;
    const betPctBadge = document.getElementById('bet-pct-badge');
    const survivalOddsBadge = document.getElementById('survival-odds-badge');
    const mineBtns = leftDock.querySelectorAll<HTMLButtonElement>(
        '#mine-selector .fintech-segment-btn'
    );
    const quickBetBtns = leftDock.querySelectorAll<HTMLButtonElement>('.fintech-quick-pill');
    const btnShieldToggle = document.getElementById('btn-shield-toggle') as HTMLButtonElement | null;
    const shieldBtnState = document.getElementById('shield-btn-state');
    const shieldCostBadge = document.getElementById('shield-cost-badge');

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
    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            const isMuted = audioController.toggleMute();
            if (!isMuted) {
                audioController.resumeAudioContext();
            }
            btnAudio.classList.toggle('active', !isMuted);
            const iconSvg = document.getElementById('audio-icon-svg');
            if (iconSvg) {
                iconSvg.innerHTML = isMuted
                    ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'
                    : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
            }
        });
    }

    // Initialize Demo Balance Suite
    if (!stakeRGS.session.isLiveRGS) {
        const savedDemoBal = localStorage.getItem('endless_descent_demo_balance');
        if (savedDemoBal) {
            const parsed = parseFloat(savedDemoBal);
            if (!isNaN(parsed) && parsed > 0) {
                engine.balance = parsed;
            }
        }
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
        if (e.key === 'b' || e.key === 'B') {
            if (isRulesModalOpen()) return;
            toggleBonusBuyModal(engine, renderer, syncUI);
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
        const effVal = calculateEffectiveBet(baseVal, engine.luckyBoost, engine.shieldPurchased);
        const formattedEff = stakeRGS.formatCurrency(effVal);
        const isMobileScreen = window.innerWidth <= 768;
        if (betPctBadge) {
            betPctBadge.textContent = `Total: ${formattedEff}`;
        }
        if (focalCtaSub && engine.state !== GameState.PLAYING) {
            focalCtaSub.textContent = isMobileScreen ? formattedEff : `(${t.shortcutSpace.toUpperCase()}) · ${formattedEff}`;
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

    if (btnShieldToggle) {
        btnShieldToggle.addEventListener('click', () => {
            if (isRulesModalOpen() || engine.state === GameState.PLAYING) return;
            audioController.playClick();
            engine.shieldPurchased = !engine.shieldPurchased;
            renderer.ship.setShieldActive(engine.shieldPurchased, true);
            syncBetMetrics();
            syncUI();
        });
    }

    function triggerMechanicalPress() {
        if (!btnPrimaryCta) return;
        btnPrimaryCta.classList.add('depressed-heavy');
        setTimeout(() => {
            btnPrimaryCta.classList.remove('depressed-heavy');
        }, 180);
    }

    // 9. PRIMARY FOCAL ACTION WITH CLIENT-SIDE BALANCE GUARD [222]
    async function handlePrimaryFocalAction() {
        if (isRulesModalOpen() || isBonusBuyModalOpen() || isReplay) return;

        // Giant Cosmic Prize Wheel (Ruleta) Spin Action
        if (renderer.isRouletteActive || renderer.isWheelSpinning || (engine.isWheelActive && !engine.isSlotActive)) {
            if (renderer.isWheelSpinning || !engine.isWheelActive || engine.wheelSpinsRemaining <= 0) return;

            triggerMechanicalPress();
            audioController.playClick();
            const outcome = engine.spinWheel();
            if (outcome) {
                if (btnPrimaryCta) btnPrimaryCta.disabled = true;
                renderer.spinGiantWheel(outcome as any, () => {
                    syncUI();
                });
            }
            syncUI();
            return;
        }

        // 1x3 Arcade Mini-Slot Bonus Spin Action (Stage 2)
        if (engine.isSlotActive || renderer.isSlotActive) {
            if (renderer.isSlotSpinning) return;
            triggerMechanicalPress();
            audioController.playClick();
            const outcome = engine.executeSlotSpin();
            if (outcome) {
                const totalSpins = engine.slotBundle?.spins.length || 5;
                const spinsLeft = Math.max(0, totalSpins - engine.slotCurrentSpinIndex);
                const isFinished = engine.slotCurrentSpinIndex >= totalSpins;
                renderer.spinSlotReels(outcome, spinsLeft, engine.slotAccumulator, () => {
                    syncUI();
                    if (isFinished) {
                        renderer.finishSlotSequence(engine.slotAccumulator, () => {
                            syncUI();
                        });
                    }
                });
            }
            syncUI();
            return;
        }

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

            const effVal = calculateEffectiveBet(betVal, engine.luckyBoost, engine.shieldPurchased);

            // [222] Client-side check preventing /wallet/play if balance < effVal
            if (engine.balance < effVal) {
                if (!stakeRGS.session.isLiveRGS) {
                    // Auto-recharge in demo/developer mode!
                    engine.balance += Math.max(1000, effVal * 10);
                    localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
                    syncUI();
                    stakeRGS.showToast('💰 Saldo demo recargado automáticamente (+ $1,000.00)', 'success');
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
                    engine.minesCount,
                    engine.luckyBoost,
                    engine.shieldPurchased
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
        if (isRulesModalOpen() || isBonusBuyModalOpen()) return;
        if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;

        if (e.key >= '1' && e.key <= '5') {
            const laneIdx = parseInt(e.key, 10) - 1;
            if (
                engine.state === GameState.PLAYING &&
                !stateCtrl.isHitStopActive &&
                !engine.isWheelActive &&
                !engine.isSlotActive &&
                !renderer.isRouletteActive &&
                !renderer.isSlotActive &&
                !renderer.isWheelSpinning &&
                !renderer.isSlotSpinning &&
                engine.wheelProfile !== 'BONUS_BUY' &&
                engine.slotBundle?.profile !== 'BONUS_BUY'
            ) {
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

    window.addEventListener('roulette-ready', () => {
        syncUI();
    });

    window.addEventListener('slot-ready', () => {
        syncUI();
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
                ? `${safePct}% | ${firstStepMult.toFixed(2)}×`
                : `${safePct}% ${t.minesProbLabel} | ${firstStepMult.toFixed(2)}×`;
        }

        if (balanceEl && !isReplay) {
            balanceEl.textContent = stakeRGS.formatCurrency(engine.balance);
            if (!stakeRGS.session.isLiveRGS) {
                localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
            }
        }

        multHeroVal.textContent = `${currentMult.toFixed(2)}x`;
        multNextPreview.textContent = lang === 'es' ? `SIGUIENTE: ${nextMult.toFixed(2)}x` : `NEXT ${nextMult.toFixed(2)}x`;

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

        if (multStatusDot) {
            if (isPlaying) {
                multStatusDot.style.background = '#00f0ff';
                multStatusDot.style.boxShadow = '0 0 10px #00f0ff, 0 0 18px rgba(0, 240, 255, 0.7)';
            } else if (engine.state === GameState.WON) {
                multStatusDot.style.background = '#00e676';
                multStatusDot.style.boxShadow = '0 0 10px #00e676, 0 0 18px rgba(0, 230, 118, 0.7)';
            } else if (engine.state === GameState.CRASHED) {
                multStatusDot.style.background = '#ef4444';
                multStatusDot.style.boxShadow = '0 0 10px #ef4444, 0 0 18px rgba(239, 68, 68, 0.7)';
            } else {
                multStatusDot.style.background = '#10b981';
                multStatusDot.style.boxShadow = '0 0 8px #10b981';
            }
        }

        if (betInput) {
            betInput.disabled = isPlaying;
        }
        quickBetBtns.forEach((b) => (b.disabled = isPlaying));
        mineBtns.forEach((b) => (b.disabled = isPlaying));

        if (btnShieldToggle) {
            btnShieldToggle.disabled = isPlaying;
            const isShieldOn = isPlaying ? engine.hasActiveShield : engine.shieldPurchased;
            btnShieldToggle.classList.toggle('active', isShieldOn);
            btnShieldToggle.setAttribute('aria-pressed', String(isShieldOn));
            renderer.ship.setShieldActive(isShieldOn, true);
            if (shieldBtnState) {
                if (isPlaying) {
                    if (engine.hasActiveShield) {
                        shieldBtnState.textContent = lang === 'es' ? 'ARMADO · 50%' : 'ARMED · 50%';
                    } else if (engine.shieldUsedInRound) {
                        shieldBtnState.textContent = lang === 'es' ? 'USADO ✓' : 'USED ✓';
                    } else {
                        shieldBtnState.textContent = 'OFF · 50% SAVE';
                    }
                } else {
                    shieldBtnState.textContent = engine.shieldPurchased
                        ? (lang === 'es' ? 'ACTIVO · +25%' : 'ACTIVE · +25%')
                        : 'OFF · 50% SAVE';
                }
            }
            if (shieldCostBadge) {
                shieldCostBadge.textContent = engine.shieldPurchased ? '+25% ON' : '+25%';
                shieldCostBadge.style.color = engine.shieldPurchased ? '#38bdf8' : '';
            }
        }

        if (betInput && betPctBadge && !isReplay) {
            syncBetInputFontSize();
            const baseVal = Math.max(stakeRGS.betConfig.minBet, parseFloat(betInput.value) || currentBetLevels[0]);
            const effVal = calculateEffectiveBet(baseVal, engine.luckyBoost, engine.shieldPurchased);
            const formattedEff = stakeRGS.formatCurrency(effVal);
            betPctBadge.textContent = `Total: ${formattedEff}`;

            const canCashout = isPlaying && engine.currentRow > 1 && !stateCtrl.isHitStopActive;

            if (btnPrimaryCta && focalCtaHeaderLabel && focalCtaTitle && focalCtaSub) {
                if (renderer.isRouletteActive || renderer.isWheelSpinning || (engine.isWheelActive && !engine.isSlotActive)) {
                    const isWheelLocked = renderer.isWheelSpinning || !engine.isWheelActive || engine.wheelSpinsRemaining <= 0;
                    btnPrimaryCta.disabled = isWheelLocked;
                    btnPrimaryCta.classList.remove('mode-cashout', 'mode-slot-spin');
                    btnPrimaryCta.classList.add('mode-wheel-spin');
                    focalCtaHeaderLabel.textContent =
                        lang === 'es' ? 'Ruleta Cósmica' : 'Cosmic Prize Wheel';
                    focalCtaTitle.textContent = renderer.isWheelSpinning
                        ? (lang === 'es' ? 'GIRANDO...' : 'SPINNING...')
                        : (lang === 'es' ? 'GIRAR' : 'SPIN');
                    focalCtaSub.textContent = renderer.isWheelSpinning
                        ? (lang === 'es' ? '¡Buena Suerte!' : 'Good Luck!')
                        : isMobile
                          ? (lang === 'es' ? 'Tirada' : 'Spin')
                          : `(${t.shortcutSpace.toUpperCase()}) · ${lang === 'es' ? 'Tirada' : 'Spin'}`;
                } else if (engine.isSlotActive || renderer.isSlotActive) {
                    const totalSpins = engine.slotBundle?.spins.length || 5;
                    const spinsLeft = Math.max(0, totalSpins - engine.slotCurrentSpinIndex);
                    btnPrimaryCta.disabled = renderer.isSlotSpinning;
                    btnPrimaryCta.classList.remove('mode-cashout', 'mode-wheel-spin');
                    btnPrimaryCta.classList.add('mode-slot-spin');
                    focalCtaHeaderLabel.textContent = lang === 'es' ? '★ MINI-SLOT 1x3 ★' : '★ 1x3 ARCADE SLOT ★';
                    focalCtaTitle.textContent = renderer.isSlotSpinning
                        ? (lang === 'es' ? 'GIRANDO...' : 'SPINNING...')
                        : (lang === 'es'
                            ? `TIRAR SLOT (${spinsLeft})`
                            : `SPIN SLOT (${spinsLeft})`);
                    focalCtaSub.textContent = lang === 'es'
                        ? `Acumulador: +${engine.slotAccumulator}x`
                        : `Accumulator: +${engine.slotAccumulator}x`;
                } else if (!isPlaying) {
                    btnPrimaryCta.disabled = false;
                    btnPrimaryCta.classList.remove('mode-cashout', 'mode-wheel-spin', 'mode-slot-spin');
                    focalCtaHeaderLabel.textContent = t.focalActionLabel;
                    focalCtaTitle.textContent = t.focalDropCapsule;
                    focalCtaSub.textContent = isMobile ? formattedEff : `(${t.shortcutSpace.toUpperCase()}) · ${formattedEff}`;
                } else if (canCashout) {
                    const cashoutVal = calculatePayout(engine.activeBetAmount, currentMult);
                    btnPrimaryCta.disabled = false;
                    btnPrimaryCta.classList.remove('mode-wheel-spin', 'mode-slot-spin');
                    btnPrimaryCta.classList.add('mode-cashout');
                    focalCtaHeaderLabel.textContent = lang === 'es' ? 'Cobro Disponible' : 'Cashout Available';
                    focalCtaTitle.textContent = `${t.focalCashout} ${stakeRGS.formatCurrency(cashoutVal)}`;
                    focalCtaSub.textContent = isMobile ? `${currentMult.toFixed(2)}×` : `${currentMult.toFixed(2)}× · ${t.shortcutSpace}`;
                } else {
                    btnPrimaryCta.disabled = true;
                    btnPrimaryCta.classList.remove('mode-cashout', 'mode-wheel-spin', 'mode-slot-spin');
                    focalCtaHeaderLabel.textContent = lang === 'es' ? 'Ronda en Curso' : 'Round Active';
                    focalCtaTitle.textContent = isMobile ? (lang === 'es' ? 'TOCA UNA CAJA' : 'TAP A CRATE') : `[1–5]`;
                    focalCtaSub.textContent = `Row ${engine.currentRow} · ${nextMult.toFixed(2)}×`;
                }
            }

            const canPartial =
                engine.canPartialCashout() &&
                !stateCtrl.isHitStopActive &&
                !engine.isWheelActive &&
                !engine.isSlotActive;
            if (btnPartialCta && partialCtaSub && focalCtaHeaderShortcut) {
                if (canPartial) {
                    btnPartialCta.style.display = 'flex';
                    btnPartialCta.disabled = false;
                    const halfVal = Math.floor(calculatePayout(engine.activeBetAmount, currentMult) * 0.5 * 100) / 100;
                    partialCtaSub.textContent = `+${stakeRGS.formatCurrency(halfVal)}`;
                    focalCtaHeaderShortcut.textContent = isMobile ? '' : `${t.shortcutSpace} / ${t.shortcutKeyP}`;
                } else {
                    btnPartialCta.style.display = 'none';
                    btnPartialCta.disabled = true;
                    focalCtaHeaderShortcut.textContent = isMobile ? '' : t.shortcutSpace;
                }
            }
        }

        const bonusBuyTrigger = document.getElementById('btn-bonus-buy-trigger') as HTMLButtonElement | null;
        if (bonusBuyTrigger) {
            const isBonusBusy = renderer.isRouletteActive || renderer.isWheelSpinning || renderer.isSlotActive || renderer.isSlotSpinning || engine.isWheelActive || engine.isSlotActive;
            bonusBuyTrigger.disabled = isBonusBusy;
            bonusBuyTrigger.style.pointerEvents = isBonusBusy ? 'none' : 'auto';
            bonusBuyTrigger.style.opacity = isBonusBusy ? '0.45' : '1';
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
        } else if (pick.shieldSaved) {
            gsap.killTweensOf(hitStopStamp);
            hitStopStamp.textContent =
                lang === 'es'
                    ? `🛡️ ESCUDO ABSORBIÓ MINA · ${pick.stepMultiplierAfter.toFixed(2)}× RETENIDO`
                    : `🛡️ SHIELD DEFLECTED MINE · ${pick.stepMultiplierAfter.toFixed(2)}× RETAINED`;
            hitStopStamp.style.borderColor = '#38bdf8';
            hitStopStamp.style.color = '#38bdf8';
            gsap.fromTo(
                hitStopStamp,
                { opacity: 1, scale: 1.06, y: 0 },
                {
                    opacity: 0,
                    scale: 0.96,
                    y: -3,
                    delay: 0.95,
                    duration: 0.25,
                    ease: 'power2.out'
                }
            );
            gsap.fromTo(
                multHeroVal,
                { scale: 1.14, color: '#38bdf8' },
                { scale: 1, color: '#ffffff', duration: 0.5, ease: 'elastic.out(1.4, 0.3)' }
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

        const headlines = lang === 'es' ? VICTORY_HEADLINES_ES : VICTORY_HEADLINES_EN;
        if (victoryCallCount === 0 || victoryCallCount % 4 === 0) {
            headlineIdx = 0;
            emitterIdx = 0;
        } else {
            do {
                headlineIdx = Math.floor(Math.random() * headlines.length);
            } while (headlineIdx === lastHeadlineIdx);

            do {
                emitterIdx = Math.floor(Math.random() * VICTORY_EMITTERS.length);
            } while (emitterIdx === lastEmitterIdx);
        }

        victoryCallCount++;
        lastHeadlineIdx = headlineIdx;
        lastEmitterIdx = emitterIdx;

        const chosenHeadline = headlines[headlineIdx];
        const chosenEmitter = VICTORY_EMITTERS[emitterIdx];

        megaWinTitle.textContent = chosenHeadline;
        megaWinMult.textContent = `${mult.toFixed(2)}×`;

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
        }, 980);
    }

    window.addEventListener('resize', () => {
        syncUI();
    });

    syncBetMetrics();
    syncUI();
}
