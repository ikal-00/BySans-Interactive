import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import {
    formatCurrency,
    formatMultiplier,
    formatBtc,
    calculateEffectiveBet,
    calculateNextStepMultiplier
} from '../math/multipliers';
import { sounds } from '../audio/sounds';

export function createControlsUI(
    stageContainer: HTMLElement,
    controlDock: HTMLElement,
    engine: GameEngine
) {
    // 1. ULTRA-CLEAN SINGLE-LINE TOP BAR (Inside stageContainer)
    const topHeader = document.createElement('div');
    topHeader.className =
        'absolute top-0 left-0 w-full px-3.5 pt-2.5 pb-1.5 z-30 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-[#071118]/90 via-[#071118]/40 to-transparent';

    topHeader.innerHTML = `
        <!-- Left: Faceted Brand Emblem -->
        <div class="flex items-center gap-2 select-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs>
                    <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#86efac"/>
                        <stop offset="50%" stop-color="#00e701"/>
                        <stop offset="100%" stop-color="#15803d"/>
                    </linearGradient>
                </defs>
                <path d="M12 22L2.5 4.5L12 9.5L21.5 4.5L12 22Z" fill="url(#brandGrad)"/>
                <path d="M12 22L12 9.5L21.5 4.5L12 22Z" fill="#00b801" fill-opacity="0.45"/>
                <path d="M8.5 8.5L12 15.5L15.5 8.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="flex items-baseline gap-1">
                <span class="font-black text-[11px] tracking-[0.16em] text-white">ENDLESS</span>
                <span class="font-semibold text-[10px] tracking-[0.12em] text-[#7f96a7]">DESCENT</span>
            </div>
        </div>

        <!-- Right: Compact Wallet Pill + Studio Utility Icons -->
        <div class="flex items-center gap-1.5 select-none">
            <div class="relative flex items-center gap-1.5 bg-[#0c1821]/95 border border-[#263d4d] rounded-md px-2.5 py-1 shadow-inner" id="wallet-pill" title="${formatBtc(engine.balance)}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <polygon points="12 2 20 8 20 16 12 22 4 16 4 8" fill="#00e701" fill-opacity="0.25" stroke="#00e701" stroke-width="2"/>
                    <polygon points="12 6 16 9 16 15 12 18 8 15 8 9" fill="#00e701"/>
                </svg>
                <span id="balance-usd" class="text-xs font-mono font-bold text-white tabular-nums leading-none">${formatCurrency(engine.balance)}</span>
                <span id="wallet-delta" class="hidden absolute -bottom-4 right-1 text-[10px] font-mono font-extrabold text-[#00e701] tabular-nums pointer-events-none"></span>
            </div>

            <button id="header-fair-btn" class="p-1.5 rounded-md bg-[#142530]/95 border border-[#263d4d] text-[#9cb3c5] hover:text-[#00e701] hover:border-[#38576e] transition-colors cursor-pointer" title="Provably Fair (HMAC-SHA256)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.5C12 21.5 19 17.8 19 11.5V5.2L12 2.5L5 5.2V11.5C5 17.8 12 21.5 12 21.5Z" fill="#00e701" fill-opacity="0.14" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
                    <path d="M9 12L11 14L15.2 9.8" stroke="#00e701" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <button id="btn-sim-panel" class="p-1.5 rounded-md bg-[#142530]/95 border border-[#263d4d] text-[#9cb3c5] hover:text-[#00e701] hover:border-[#38576e] transition-colors cursor-pointer" title="Simulador Monte Carlo RTP (96%)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="13" width="4" height="7" rx="1" fill="#00e701" fill-opacity="0.3" stroke="currentColor" stroke-width="1.7"/>
                    <rect x="10" y="8" width="4" height="12" rx="1" fill="#00e701" fill-opacity="0.5" stroke="currentColor" stroke-width="1.7"/>
                    <rect x="17" y="4" width="4" height="16" rx="1" fill="#00e701" stroke="currentColor" stroke-width="1.7"/>
                </svg>
            </button>

            <button id="sound-toggle-btn" class="p-1.5 rounded-md bg-[#142530]/95 border border-[#263d4d] text-[#9cb3c5] hover:text-white hover:border-[#38576e] transition-colors cursor-pointer" title="Audio">
                <svg id="sound-icon-on" class="${sounds.isMuted ? 'hidden' : ''}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"></polygon>
                    <path d="M18.5 5.5a9 9 0 0 1 0 13M15 9a4.5 4.5 0 0 1 0 6" stroke="#00e701" stroke-linecap="round"></path>
                </svg>
                <svg id="sound-icon-off" class="${sounds.isMuted ? '' : 'hidden'}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="22" y1="9" x2="16" y2="15" stroke="#ff1e42"></line>
                    <line x1="16" y1="9" x2="22" y2="15" stroke="#ff1e42"></line>
                </svg>
            </button>
        </div>
    `;
    stageContainer.appendChild(topHeader);

    // 2. FRAMELESS FLOATING TELEMETRY READOUT (Clean, airy, never crowds the horizon)
    const multHUD = document.createElement('div');
    multHUD.className =
        'absolute top-10 left-0 w-full flex flex-col items-center z-20 pointer-events-none select-none';
    multHUD.innerHTML = `
        <div class="flex items-baseline gap-2">
            <span id="multiplier-text" class="text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(0,231,1,0.3)]">1.00x</span>
            <span id="next-mult-preview" class="text-[10px] font-mono font-bold text-[#7f96a7] tabular-nums">SIG 1.60x</span>
        </div>
        <div id="active-perks-strip" class="flex items-center gap-1.5 mt-0.5"></div>
    `;
    stageContainer.appendChild(multHUD);

    // 3. STREAMLINED BOTTOM CONTROL DOCK
    controlDock.className = 'control-dock select-none';
    controlDock.innerHTML = `
        <!-- Row 1: Unified Mode Switcher + Compact Tactile Bonus Chips -->
        <div class="flex justify-between items-center gap-1.5">
            <div class="flex bg-[#0f212e] p-0.5 rounded-md border border-[#243847] text-[10px] font-bold">
                <button id="tab-manual" class="px-2.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer">MANUAL</button>
                <button id="tab-auto" class="px-2.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer">AUTO</button>
            </div>

            <div class="flex items-center gap-1.5">
                <button id="toggle-lucky-boost" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all cursor-pointer" title="Activa Cartas Doradas (2x/3x) e Interceptor OVNI (+2 Filas) • +25% Apuesta">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <defs>
                            <linearGradient id="goldStar" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fef08a"/>
                                <stop offset="55%" stop-color="#f59e0b"/>
                                <stop offset="100%" stop-color="#b45309"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 1.5L15.1 8.9L22.5 12L15.1 15.1L12 22.5L8.9 15.1L1.5 12L8.9 8.9L12 1.5Z" fill="url(#goldStar)"/>
                        <circle cx="12" cy="12" r="2.2" fill="#ffffff"/>
                    </svg>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider">Suerte</span>
                    <span id="lucky-badge" class="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#1a2c38] text-[#7f96a7] tabular-nums">+25%</span>
                </button>

                <button id="toggle-shield-boost" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all cursor-pointer" title="Escudo Deflector: Absorbe 1 mina por ronda • +25% Apuesta">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <defs>
                            <linearGradient id="cyanShield" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#a5f3fc"/>
                                <stop offset="55%" stop-color="#06b6d4"/>
                                <stop offset="100%" stop-color="#0e7490"/>
                            </linearGradient>
                        </defs>
                        <polygon points="12 2 20.5 6.5 18.5 16.5 12 22 5.5 16.5 3.5 6.5" fill="url(#cyanShield)" stroke="#cffafe" stroke-width="1.3"/>
                        <polyline points="8.5 11.5 12 15 15.5 11.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider">Escudo</span>
                    <span id="shield-badge" class="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#1a2c38] text-[#7f96a7] tabular-nums">+25%</span>
                </button>
            </div>
        </div>

        <!-- MANUAL CONTROLS -->
        <div id="controls-manual" class="flex flex-col gap-2">
            <div class="flex gap-2">
                <!-- Bet Input Well -->
                <div class="flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-0.5">
                        <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase tracking-wider">APUESTA</label>
                        <span id="effective-bet-label" class="text-[9px] font-mono font-bold text-[#8ea4b8] tabular-nums">Total: $10.00</span>
                    </div>
                    <div class="stake-well flex items-center p-1">
                        <span class="text-[#7f96a7] font-mono font-bold px-1.5 text-xs">$</span>
                        <input type="number" id="bet-amount" value="10.00" min="0.10" max="250000" step="1.00" class="bg-transparent text-white font-mono font-bold text-xs w-full outline-none tabular-nums" />
                        <div class="flex gap-1 ml-1">
                            <button id="btn-half" class="stake-btn-secondary px-1.5 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer">½</button>
                            <button id="btn-double" class="stake-btn-secondary px-1.5 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer">2×</button>
                            <button id="btn-max" class="stake-btn-secondary px-1.5 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer">MAX</button>
                        </div>
                    </div>
                </div>

                <!-- Mines Risk Selector with LED Dots -->
                <div class="w-28 flex flex-col">
                    <div class="flex justify-between items-center mb-0.5">
                        <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase tracking-wider">MINAS</label>
                        <div id="mines-led-strip" class="flex items-center gap-1"></div>
                    </div>
                    <div class="stake-well flex items-center justify-between p-1 h-full">
                        <button id="btn-mines-minus" class="stake-btn-secondary w-6 h-6 flex items-center justify-center font-mono font-bold text-xs rounded cursor-pointer">−</button>
                        <span id="mines-count" class="font-mono font-extrabold text-white text-xs tabular-nums">3</span>
                        <button id="btn-mines-plus" class="stake-btn-secondary w-6 h-6 flex items-center justify-center font-mono font-bold text-xs rounded cursor-pointer">+</button>
                    </div>
                </div>
            </div>

            <!-- Primary CTA & Partial 50% Cashout Row -->
            <div class="flex gap-2">
                <button id="partial-cashout-btn" class="hidden flex-1 bg-[#1e2923] hover:bg-[#27362d] border border-[#ffc700] text-[#ffc700] font-extrabold rounded-lg py-2 px-2 flex-col items-center justify-center transition-all cursor-pointer">
                    <span class="text-[10px] tracking-wider uppercase leading-tight">COBRAR 50%</span>
                    <span id="partial-cashout-subtitle" class="text-[10px] font-mono font-bold text-white tabular-nums leading-tight">$0.00</span>
                </button>

                <button id="action-btn" class="stake-cta-green flex-[1.65] w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer">
                    <span id="action-btn-title" class="text-sm font-black tracking-wider uppercase leading-tight">DESCENDER</span>
                    <span id="action-btn-subtitle" class="text-[11px] font-mono font-bold text-[#051a05] uppercase tabular-nums hidden">COBRAR: $0.00</span>
                </button>
            </div>
        </div>

        <!-- AUTO CONTROLS -->
        <div id="controls-auto" class="hidden flex-col gap-2">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase mb-0.5 block">NÚMERO DE RONDAS</label>
                    <input type="number" id="auto-bet-count" value="10" min="1" max="1000" class="stake-well w-full p-1.5 text-xs text-white font-mono font-bold outline-none tabular-nums" />
                </div>
                <div>
                    <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase mb-0.5 block">COBRO EN FILA</label>
                    <input type="number" id="auto-cashout-row" value="3" min="1" max="20" class="stake-well w-full p-1.5 text-xs text-white font-mono font-bold outline-none tabular-nums" />
                </div>
            </div>
            <button id="auto-action-btn" class="stake-cta-green w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer">
                <span id="auto-btn-title" class="text-xs font-black tracking-wider uppercase">INICIAR PILOTO AUTOMÁTICO</span>
            </button>
        </div>

        <!-- Recent Multipliers Audit Strip -->
        <div class="flex items-center justify-between pt-1 border-t border-[#213743]/80">
            <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1 mr-2" id="history-pills">
                <span class="text-[9px] text-[#5b7487] font-bold uppercase tracking-wider">HISTORIAL</span>
                <span class="text-[9px] text-[#475d6e] font-mono">—</span>
            </div>
            <span class="text-[9px] font-mono font-semibold text-[#5b7487] whitespace-nowrap">1-5 CARRILES • ESPACIO</span>
        </div>
    `;

    // ELEMENT REFERENCES
    const betInput = document.getElementById('bet-amount') as HTMLInputElement;
    const effectiveBetLabel = document.getElementById('effective-bet-label') as HTMLSpanElement;
    const minesCountSpan = document.getElementById('mines-count') as HTMLSpanElement;
    const minesLedStrip = document.getElementById('mines-led-strip') as HTMLDivElement;
    const btnAction = document.getElementById('action-btn') as HTMLButtonElement;
    const actionTitle = document.getElementById('action-btn-title') as HTMLSpanElement;
    const actionSubtitle = document.getElementById('action-btn-subtitle') as HTMLSpanElement;
    const btnPartial = document.getElementById('partial-cashout-btn') as HTMLButtonElement;
    const partialSubtitle = document.getElementById('partial-cashout-subtitle') as HTMLSpanElement;
    const multText = document.getElementById('multiplier-text') as HTMLSpanElement;
    const nextMultPreview = document.getElementById('next-mult-preview') as HTMLSpanElement;
    const activePerksStrip = document.getElementById('active-perks-strip') as HTMLDivElement;
    const balanceUsd = document.getElementById('balance-usd') as HTMLSpanElement;
    const walletPill = document.getElementById('wallet-pill') as HTMLDivElement;
    const walletDelta = document.getElementById('wallet-delta') as HTMLSpanElement;
    const historyContainer = document.getElementById('history-pills') as HTMLDivElement;

    const toggleLucky = document.getElementById('toggle-lucky-boost') as HTMLButtonElement;
    const luckyBadge = document.getElementById('lucky-badge') as HTMLSpanElement;
    const toggleShield = document.getElementById('toggle-shield-boost') as HTMLButtonElement;
    const shieldBadge = document.getElementById('shield-badge') as HTMLSpanElement;

    const tabManual = document.getElementById('tab-manual') as HTMLButtonElement;
    const tabAuto = document.getElementById('tab-auto') as HTMLButtonElement;
    const controlsManual = document.getElementById('controls-manual') as HTMLDivElement;
    const controlsAuto = document.getElementById('controls-auto') as HTMLDivElement;
    const autoActionBtn = document.getElementById('auto-action-btn') as HTMLButtonElement;
    const autoBtnTitle = document.getElementById('auto-btn-title') as HTMLSpanElement;

    let isAutoRunning = false;
    let autoInterval: number | null = null;
    let previousBalance = engine.balance;

    const renderMinesLeds = () => {
        minesLedStrip.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const dot = document.createElement('span');
            const active = i <= engine.minesCount;
            dot.className = `w-1.5 h-1.5 rounded-full transition-colors ${
                active ? 'bg-[#ff1e42] shadow-[0_0_4px_#ff1e42]' : 'bg-[#243847]'
            }`;
            minesLedStrip.appendChild(dot);
        }
    };

    const updateBonusUI = () => {
        const baseBet = parseFloat(betInput.value) || 10;
        const effBet = calculateEffectiveBet(baseBet, engine.luckyBoost, engine.shieldPurchased);
        effectiveBetLabel.innerText = `Total: ${formatCurrency(effBet)}`;

        renderMinesLeds();

        // Update Next Multiplier Preview or Live Profit Preview
        const isFirst = engine.state !== GameState.PLAYING || engine.currentRow === 1;
        const baseMult = engine.state === GameState.PLAYING ? engine.currentMultiplier : 1.0;
        const activeShield =
            engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased;
        const previewMult = calculateNextStepMultiplier(
            baseMult,
            engine.minesCount,
            isFirst,
            1.0,
            activeShield
        );

        if (engine.state === GameState.PLAYING && engine.currentRow > 1) {
            const currentWin = engine.activeBetAmount * engine.currentMultiplier;
            nextMultPreview.className = 'text-xs font-mono font-extrabold text-[#00e701] tabular-nums';
            nextMultPreview.innerText = `+${formatCurrency(currentWin)}`;
        } else {
            nextMultPreview.className = 'text-[10px] font-mono font-bold text-[#7f96a7] tabular-nums';
            nextMultPreview.innerText = `SIG ${formatMultiplier(previewMult)}`;
        }

        if (engine.luckyBoost) {
            toggleLucky.className =
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#ffc700] bg-[#ffc700]/12 text-white transition-all cursor-pointer';
            luckyBadge.className =
                'text-[9px] font-mono font-black px-1 py-0.2 rounded bg-[#ffc700] text-[#071118] tabular-nums';
            luckyBadge.innerText = 'ON';
        } else {
            toggleLucky.className =
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all cursor-pointer';
            luckyBadge.className =
                'text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#1a2c38] text-[#7f96a7] tabular-nums';
            luckyBadge.innerText = '+25%';
        }

        if (engine.shieldPurchased) {
            toggleShield.className =
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#00f0ff] bg-[#00f0ff]/12 text-white transition-all cursor-pointer';
            shieldBadge.className =
                'text-[9px] font-mono font-black px-1 py-0.2 rounded bg-[#00f0ff] text-[#071118] tabular-nums';
            shieldBadge.innerText = 'ON';
        } else {
            toggleShield.className =
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all cursor-pointer';
            shieldBadge.className =
                'text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-[#1a2c38] text-[#7f96a7] tabular-nums';
            shieldBadge.innerText = '+25%';
        }

        // Minimalist active status strip (only shows streak or banked partial cashout during active play)
        activePerksStrip.innerHTML = '';
        const streakCount = engine.currentPicks.filter((p) => p.isSafe || p.shieldSaved).length;
        if (engine.state === GameState.PLAYING && streakCount >= 2) {
            activePerksStrip.innerHTML += `
                <span class="px-1.5 py-0.2 rounded bg-[#00e701]/15 border border-[#00e701]/40 text-[#00e701] text-[9px] font-mono font-bold uppercase tracking-wider">
                    RACHA x${streakCount}
                </span>`;
        }
        if (engine.state === GameState.PLAYING && engine.partialPayoutBanked > 0) {
            activePerksStrip.innerHTML += `
                <span class="px-1.5 py-0.2 rounded bg-[#ffc700]/15 border border-[#ffc700]/40 text-[#ffc700] text-[9px] font-mono font-bold uppercase tabular-nums">
                    50% EN BANCO: ${formatCurrency(engine.partialPayoutBanked)}
                </span>`;
        }
    };

    toggleLucky.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        engine.luckyBoost = !engine.luckyBoost;
        updateBonusUI();
    });

    toggleShield.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        engine.shieldPurchased = !engine.shieldPurchased;
        updateBonusUI();
    });

    betInput.addEventListener('input', () => updateBonusUI());

    // TAB SWITCHING
    tabManual.addEventListener('click', () => {
        sounds.playClick();
        tabManual.className = 'px-2.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer';
        tabAuto.className = 'px-2.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer';
        controlsManual.classList.remove('hidden');
        controlsAuto.classList.add('hidden');
    });

    tabAuto.addEventListener('click', () => {
        sounds.playClick();
        tabAuto.className = 'px-2.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer';
        tabManual.className = 'px-2.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer';
        controlsAuto.classList.remove('hidden');
        controlsManual.classList.add('hidden');
    });

    // SOUND TOGGLE
    const soundToggle = document.getElementById('sound-toggle-btn') as HTMLButtonElement;
    const soundIconOn = document.getElementById('sound-icon-on') as unknown as SVGElement;
    const soundIconOff = document.getElementById('sound-icon-off') as unknown as SVGElement;

    soundToggle.addEventListener('click', () => {
        const muted = sounds.toggleMute();
        if (muted) {
            soundIconOn.classList.add('hidden');
            soundIconOff.classList.remove('hidden');
        } else {
            soundIconOff.classList.add('hidden');
            soundIconOn.classList.remove('hidden');
            sounds.playClick();
        }
    });

    // MINES STEPPER
    document.getElementById('btn-mines-minus')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        if (engine.minesCount > 1) {
            engine.minesCount--;
            minesCountSpan.innerText = engine.minesCount.toString();
            updateBonusUI();
        }
    });

    document.getElementById('btn-mines-plus')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        if (engine.minesCount < 4) {
            engine.minesCount++;
            minesCountSpan.innerText = engine.minesCount.toString();
            updateBonusUI();
        }
    });

    // BET AMOUNT QUICK BUTTONS
    document.getElementById('btn-half')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        const cur = parseFloat(betInput.value) || 10;
        betInput.value = Math.max(0.1, cur / 2).toFixed(2);
        updateBonusUI();
    });

    document.getElementById('btn-double')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        const cur = parseFloat(betInput.value) || 10;
        betInput.value = Math.min(engine.balance, cur * 2).toFixed(2);
        updateBonusUI();
    });

    document.getElementById('btn-max')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        betInput.value = Math.min(250000, engine.balance).toFixed(2);
        updateBonusUI();
    });

    // MAIN ACTION BUTTON
    btnAction.addEventListener('click', () => {
        if (
            engine.state === GameState.IDLE ||
            engine.state === GameState.WON ||
            engine.state === GameState.CRASHED
        ) {
            const bet = parseFloat(betInput.value) || 10;
            engine.startBet(bet, engine.minesCount, engine.luckyBoost, engine.shieldPurchased);
        } else if (engine.state === GameState.PLAYING) {
            if (engine.currentRow > 1) {
                engine.cashout();
            }
        }
    });

    // PARTIAL 50% CASHOUT BUTTON
    btnPartial.addEventListener('click', () => {
        if (engine.canPartialCashout()) {
            engine.partialCashout();
        }
    });

    // KEYBOARD SHORTCUTS (Dopamine Speed Play: 1-5 picks lane, Space starts or cashes out)
    window.addEventListener('keydown', (e) => {
        if (document.activeElement?.tagName === 'INPUT') return;
        const seedModal = document.getElementById('seed-modal');
        const simModal = document.getElementById('sim-modal');
        if (
            (seedModal && !seedModal.classList.contains('hidden')) ||
            (simModal && !simModal.classList.contains('hidden'))
        ) {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            btnAction.click();
        } else if (engine.state === GameState.PLAYING && e.key >= '1' && e.key <= '5') {
            const laneIdx = parseInt(e.key, 10) - 1;
            engine.pickLane(laneIdx);
        }
    });

    // AUTO BET LOGIC
    autoActionBtn.addEventListener('click', () => {
        if (isAutoRunning) {
            isAutoRunning = false;
            if (autoInterval) clearInterval(autoInterval);
            autoActionBtn.className =
                'stake-cta-green w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer';
            autoBtnTitle.innerText = 'INICIAR PILOTO AUTOMÁTICO';
        } else {
            isAutoRunning = true;
            autoActionBtn.className =
                'w-full bg-[#ff1e42] hover:bg-[#e01537] text-white font-black rounded-lg py-2.5 flex flex-col items-center justify-center transition-all shadow-[0_3px_0_#9e0b22] cursor-pointer';
            autoBtnTitle.innerText = 'DETENER PILOTO AUTOMÁTICO';

            const roundsTotal =
                parseInt((document.getElementById('auto-bet-count') as HTMLInputElement).value, 10) || 10;
            const targetRow =
                parseInt((document.getElementById('auto-cashout-row') as HTMLInputElement).value, 10) || 3;
            let roundsCompleted = 0;

            const runAutoStep = () => {
                if (!isAutoRunning || roundsCompleted >= roundsTotal) {
                    isAutoRunning = false;
                    if (autoInterval) clearInterval(autoInterval);
                    autoActionBtn.className =
                        'stake-cta-green w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer';
                    autoBtnTitle.innerText = 'INICIAR PILOTO AUTOMÁTICO';
                    return;
                }

                if (engine.state !== GameState.PLAYING) {
                    const bet = parseFloat(betInput.value) || 10;
                    roundsCompleted++;
                    engine.startBet(bet, engine.minesCount, engine.luckyBoost, engine.shieldPurchased);
                } else {
                    const specials = engine.getSpecialsForRow(engine.currentRow);
                    let chosenLane = Math.floor(Math.random() * 5);
                    if (engine.luckyBoost) {
                        if (specials.alienLane !== null) chosenLane = specials.alienLane;
                        else if (specials.goldenLane !== null) chosenLane = specials.goldenLane;
                    }
                    const res = engine.pickLane(chosenLane);

                    if (res && (res.isSafe || res.shieldSaved)) {
                        if (engine.currentRow > targetRow) {
                            engine.cashout();
                        }
                    }
                }
            };

            autoInterval = window.setInterval(runAutoStep, 320);
        }
    });

    // BALANCE LISTENER WITH DOPAMINE CREDIT FLOAT
    engine.onBalanceChange((bal) => {
        const diff = bal - previousBalance;
        previousBalance = bal;

        balanceUsd.innerText = formatCurrency(bal);
        walletPill.title = formatBtc(bal);

        if (diff > 0.01) {
            walletDelta.innerText = `+${formatCurrency(diff)}`;
            walletDelta.classList.remove('hidden', 'wallet-credit-pop');
            void walletDelta.offsetWidth;
            walletDelta.classList.add('wallet-credit-pop');
        }
    });

    // HISTORY PILLS UPDATE
    engine.onHistoryUpdate((summaries) => {
        if (summaries.length === 0) {
            historyContainer.innerHTML = `
                <span class="text-[9px] text-[#5b7487] font-bold uppercase tracking-wider">HISTORIAL</span>
                <span class="text-[9px] text-[#475d6e] font-mono">—</span>
            `;
            return;
        }

        historyContainer.innerHTML = `<span class="text-[9px] text-[#5b7487] font-bold uppercase tracking-wider mr-1">HISTORIAL</span>`;
        summaries.slice(0, 7).forEach((s) => {
            const pill = document.createElement('button');
            const isWin = s.isWin && s.finalMultiplier > 0;
            pill.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold tabular-nums transition-transform hover:scale-105 cursor-pointer ${
                isWin
                    ? s.finalMultiplier >= 5
                        ? 'bg-[#ffc700]/15 text-[#ffc700] border border-[#ffc700]/40'
                        : 'bg-[#00e701]/15 text-[#00e701] border border-[#00e701]/40'
                    : 'bg-[#213743] text-[#7f96a7] border border-[#2f4553]'
            }`;
            pill.innerText = isWin ? `${formatMultiplier(s.finalMultiplier)}` : '0.00x';
            pill.title = `Ronda #${s.nonce} — Auditar Provably Fair`;
            pill.addEventListener('click', () => {
                const modal = document.getElementById('seed-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                    const auditInput = document.getElementById('audit-server-seed') as HTMLInputElement;
                    const auditNonce = document.getElementById('audit-nonce') as HTMLInputElement;
                    if (auditInput && auditNonce) {
                        auditInput.value = s.serverSeed;
                        auditNonce.value = s.nonce.toString();
                        const verifyBtn = document.getElementById('btn-verify-audit');
                        verifyBtn?.click();
                    }
                }
            });
            historyContainer.appendChild(pill);
        });
    });

    // STATE CHANGE LISTENER
    engine.onStateChange((state, eng) => {
        multText.innerText = formatMultiplier(eng.currentMultiplier);
        multText.classList.remove('mult-pop');
        void multText.offsetWidth;
        multText.classList.add('mult-pop');

        updateBonusUI();

        if (state === GameState.PLAYING) {
            betInput.disabled = true;

            if (eng.currentRow > 1) {
                const remainingPayout = eng.activeBetAmount * eng.currentMultiplier;
                const halfPayout = Math.floor(remainingPayout * 0.5 * 100) / 100;

                btnAction.className =
                    'stake-cta-green cashout-live-pulse flex-[1.65] w-full rounded-lg py-2 flex flex-col items-center justify-center cursor-pointer';
                actionTitle.innerText = 'CASHOUT';
                actionSubtitle.innerText = `COBRAR ${formatCurrency(remainingPayout)}`;
                actionSubtitle.classList.remove('hidden');
                btnAction.disabled = false;
                btnAction.style.opacity = '1';

                btnPartial.classList.remove('hidden');
                btnPartial.classList.add('flex');
                if (eng.canPartialCashout()) {
                    btnPartial.disabled = false;
                    btnPartial.style.opacity = '1';
                    partialSubtitle.innerText = `${formatCurrency(halfPayout)} Y SEGUIR`;
                } else {
                    btnPartial.disabled = true;
                    btnPartial.style.opacity = '0.4';
                    partialSubtitle.innerText = `ASEGURADO`;
                }
            } else {
                btnPartial.classList.add('hidden');
                btnPartial.classList.remove('flex');

                btnAction.className =
                    'w-full bg-[#14232d] text-[#7f96a7] font-bold rounded-lg py-2.5 flex flex-col items-center justify-center border border-[#223645]';
                actionTitle.innerText = 'ELIGE UN CARRIL (1–5)';
                actionSubtitle.classList.add('hidden');
                btnAction.disabled = true;
            }

            multText.className =
                'text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(0,231,1,0.3)] mult-pop';
        } else {
            betInput.disabled = false;
            btnAction.disabled = false;
            btnAction.style.opacity = '1';
            actionSubtitle.classList.add('hidden');
            btnPartial.classList.add('hidden');
            btnPartial.classList.remove('flex');

            btnAction.className =
                'stake-cta-green w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer';
            actionTitle.innerText = 'DESCENDER';

            if (state === GameState.CRASHED) {
                multText.className =
                    'text-2xl font-mono font-extrabold text-[#ff1e42] tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(255,30,66,0.4)]';
            } else {
                multText.className =
                    'text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(0,231,1,0.3)]';
            }
        }
    });

    // Modal Triggers
    document.getElementById('header-fair-btn')?.addEventListener('click', () => {
        sounds.playClick();
        const modal = document.getElementById('seed-modal');
        modal?.classList.remove('hidden');
    });

    document.getElementById('btn-sim-panel')?.addEventListener('click', () => {
        sounds.playClick();
        const modal = document.getElementById('sim-modal');
        modal?.classList.remove('hidden');
    });

    updateBonusUI();
}
