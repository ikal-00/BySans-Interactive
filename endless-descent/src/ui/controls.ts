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
    // 1. TOP STAGE HUD (Inside stageContainer)
    const topHeader = document.createElement('div');
    topHeader.className =
        'absolute top-0 left-0 w-full px-3.5 pt-2.5 pb-1.5 z-30 flex justify-between items-start pointer-events-auto bg-gradient-to-b from-[#071118]/90 via-[#071118]/50 to-transparent';

    topHeader.innerHTML = `
        <!-- Left: Studio Brand & Provably Fair Trigger -->
        <div class="flex flex-col items-start select-none gap-1">
            <div class="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#00e701]">
                    <path d="M12 21L3 5L12 9.5L21 5L12 21Z" fill="currentColor" stroke="#b8ffbc" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
                <div class="flex items-baseline gap-1">
                    <span class="font-black text-xs tracking-[0.16em] text-white">ENDLESS</span>
                    <span class="font-bold text-[10px] tracking-[0.12em] text-[#7f96a7]">DESCENT</span>
                </div>
            </div>
            <button id="header-fair-btn" class="flex items-center gap-1.5 text-[10px] font-bold text-[#b1bad3] hover:text-white cursor-pointer bg-[#15242e]/90 hover:bg-[#1e3240] px-2 py-0.5 rounded border border-[#2a4150] transition-colors">
                <span class="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701]"></span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e701" stroke-width="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span class="tracking-wider">PROVABLY FAIR</span>
            </button>
        </div>

        <!-- Right: Precision Wallet Readout & Audio Toggle -->
        <div class="flex items-center gap-1.5 select-none">
            <div class="flex flex-col items-end bg-[#0c1821]/90 border border-[#243847] rounded-md px-2.5 py-1">
                <div class="flex items-center gap-1.5">
                    <span class="text-[9px] text-[#7f96a7] font-bold uppercase tracking-wider">SALDO</span>
                    <span id="balance-usd" class="text-xs font-mono font-bold text-[#00e701] tabular-nums leading-none">${formatCurrency(engine.balance)}</span>
                </div>
                <span id="balance-btc" class="text-[10px] font-mono font-medium text-[#8a9e91] tabular-nums leading-tight mt-0.5">${formatBtc(engine.balance)}</span>
            </div>
            <button id="sound-toggle-btn" class="p-2 rounded-md bg-[#15242e]/90 border border-[#243847] text-[#8ea4b8] hover:text-white hover:border-[#3c5a70] transition-colors cursor-pointer" title="Audio">
                <svg id="sound-icon-on" class="${sounds.isMuted ? 'hidden' : ''}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <svg id="sound-icon-off" class="${sounds.isMuted ? '' : 'hidden'}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            </button>
        </div>
    `;
    stageContainer.appendChild(topHeader);

    // 2. TELEMETRY MULTIPLIER HUD & ACTIVE PERK PILLS (Top-Center of Stage)
    const multHUD = document.createElement('div');
    multHUD.className =
        'absolute top-14 left-0 w-full flex flex-col items-center z-20 pointer-events-none select-none';
    multHUD.innerHTML = `
        <div class="flex items-baseline gap-2 bg-[#0b161f]/80 border border-[#1f3342] px-3.5 py-1 rounded-full backdrop-blur-sm shadow-lg">
            <span class="text-[9px] text-[#7f96a7] font-bold uppercase tracking-widest">MULT</span>
            <span id="multiplier-text" class="text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(0,231,1,0.35)]">1.00x</span>
            <span class="text-[#2b4254]">|</span>
            <span id="next-mult-preview" class="text-[10px] font-mono font-bold text-[#9cb2c5] tabular-nums">SIG: 1.60x</span>
        </div>
        <div id="active-perks-strip" class="flex items-center gap-1.5 mt-1"></div>
    `;
    stageContainer.appendChild(multHUD);

    // 3. DEDICATED BOTTOM CONTROL DOCK
    controlDock.className = 'control-dock px-3 pt-2.5 pb-2.5 flex flex-col gap-2 select-none';
    controlDock.innerHTML = `
        <!-- Top Row: Mode Switcher + RTP Benchmark Trigger -->
        <div class="flex justify-between items-center">
            <div class="flex bg-[#0f212e] p-0.5 rounded-md border border-[#243847] text-[11px] font-bold">
                <button id="tab-manual" class="px-3.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer">MANUAL</button>
                <button id="tab-auto" class="px-3.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer">AUTO</button>
            </div>
            <button id="btn-sim-panel" class="text-[10px] font-bold text-[#b1bad3] hover:text-white px-2.5 py-1 rounded-md bg-[#0f212e] border border-[#243847] hover:border-[#00e701] flex items-center gap-1.5 transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00e701" stroke-width="2.2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span class="tracking-wider">AUDITOR RTP</span>
            </button>
        </div>

        <!-- Power-Up / Tactical Modifiers Row (Zero Emojis - Crisp Vector SVGs) -->
        <div class="grid grid-cols-2 gap-2">
            <button id="toggle-lucky-boost" class="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all text-left cursor-pointer">
                <div class="flex items-center gap-2">
                    <div id="lucky-icon-box" class="w-6 h-6 rounded flex items-center justify-center bg-[#1a2c38] text-[#ffc700]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>
                        </svg>
                    </div>
                    <div class="flex flex-col leading-tight">
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-white">Bonus Suerte</span>
                        <span class="text-[9px] text-[#7f96a7]">Cartas 2x/3x + OVNI</span>
                    </div>
                </div>
                <span id="lucky-badge" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1a2c38] text-[#8ea4b8] tabular-nums">+25%</span>
            </button>

            <button id="toggle-shield-boost" class="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all text-left cursor-pointer">
                <div class="flex items-center gap-2">
                    <div id="shield-icon-box" class="w-6 h-6 rounded flex items-center justify-center bg-[#1a2c38] text-[#00f0ff]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="flex flex-col leading-tight">
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-white">Escudo Deflector</span>
                        <span class="text-[9px] text-[#7f96a7]">Absorbe 1 mina</span>
                    </div>
                </div>
                <span id="shield-badge" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1a2c38] text-[#8ea4b8] tabular-nums">+25%</span>
            </button>
        </div>

        <!-- MANUAL CONTROLS -->
        <div id="controls-manual" class="flex flex-col gap-2">
            <div class="flex gap-2">
                <!-- Bet Input Well -->
                <div class="flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase tracking-wider">APUESTA BASE</label>
                        <span id="effective-bet-label" class="text-[10px] font-mono font-bold text-[#00e701] tabular-nums">Total: $10.00</span>
                    </div>
                    <div class="stake-well flex items-center p-1">
                        <span class="text-[#7f96a7] font-mono font-bold px-1.5 text-xs">$</span>
                        <input type="number" id="bet-amount" value="10.00" min="0.10" max="250000" step="1.00" class="bg-transparent text-white font-mono font-bold text-xs w-full outline-none tabular-nums" />
                        <div class="flex gap-1 ml-1">
                            <button id="btn-half" class="stake-btn-secondary px-2 py-1 text-[10px] font-mono font-bold rounded cursor-pointer">½</button>
                            <button id="btn-double" class="stake-btn-secondary px-2 py-1 text-[10px] font-mono font-bold rounded cursor-pointer">2×</button>
                            <button id="btn-max" class="stake-btn-secondary px-2 py-1 text-[10px] font-mono font-bold rounded cursor-pointer">MAX</button>
                        </div>
                    </div>
                </div>

                <!-- Mines Risk Selector with LED Dots -->
                <div class="w-28 flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase tracking-wider">MINAS</label>
                        <div id="mines-led-strip" class="flex items-center gap-1"></div>
                    </div>
                    <div class="stake-well flex items-center justify-between p-1 h-full">
                        <button id="btn-mines-minus" class="stake-btn-secondary w-7 h-6 flex items-center justify-center font-mono font-bold text-xs rounded cursor-pointer">−</button>
                        <span id="mines-count" class="font-mono font-extrabold text-white text-xs tabular-nums">3</span>
                        <button id="btn-mines-plus" class="stake-btn-secondary w-7 h-6 flex items-center justify-center font-mono font-bold text-xs rounded cursor-pointer">+</button>
                    </div>
                </div>
            </div>

            <!-- Primary CTA & Partial 50% Cashout Row -->
            <div class="flex gap-2">
                <button id="partial-cashout-btn" class="hidden flex-1 bg-[#1e2923] hover:bg-[#27362d] border border-[#ffc700] text-[#ffc700] font-extrabold rounded-lg py-2 px-2 flex-col items-center justify-center transition-all cursor-pointer">
                    <span class="text-[11px] tracking-wider uppercase leading-tight">COBRAR 50%</span>
                    <span id="partial-cashout-subtitle" class="text-[10px] font-mono font-bold text-white tabular-nums leading-tight">$0.00 Y SEGUIR</span>
                </button>

                <button id="action-btn" class="stake-cta-green flex-[1.6] w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer">
                    <span id="action-btn-title" class="text-sm font-black tracking-wider uppercase leading-tight">DESCENDER</span>
                    <span id="action-btn-subtitle" class="text-[11px] font-mono font-bold text-[#051a05] uppercase tabular-nums hidden">COBRAR: $0.00</span>
                </button>
            </div>
        </div>

        <!-- AUTO CONTROLS -->
        <div id="controls-auto" class="hidden flex-col gap-2">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase mb-1 block">NÚMERO DE RONDAS</label>
                    <input type="number" id="auto-bet-count" value="10" min="1" max="1000" class="stake-well w-full p-1.5 text-xs text-white font-mono font-bold outline-none tabular-nums" />
                </div>
                <div>
                    <label class="text-[9px] text-[#7f96a7] font-extrabold uppercase mb-1 block">COBRO EN FILA</label>
                    <input type="number" id="auto-cashout-row" value="3" min="1" max="20" class="stake-well w-full p-1.5 text-xs text-white font-mono font-bold outline-none tabular-nums" />
                </div>
            </div>
            <button id="auto-action-btn" class="stake-cta-green w-full rounded-lg py-2.5 flex flex-col items-center justify-center cursor-pointer">
                <span id="auto-btn-title" class="text-xs font-black tracking-wider uppercase">INICIAR PILOTO AUTOMÁTICO</span>
            </button>
        </div>

        <!-- Recent Multipliers Audit Strip -->
        <div class="flex items-center justify-between pt-1 border-t border-[#213743]">
            <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1 mr-2" id="history-pills">
                <span class="text-[9px] text-[#6d8496] font-bold uppercase tracking-wider">HISTORIAL:</span>
                <span class="text-[10px] text-[#53697a] font-mono">SIN REGISTROS</span>
            </div>
            <span class="text-[9px] font-mono font-bold text-[#6d8496] whitespace-nowrap">96.0% RTP • 4.0% EDGE</span>
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
    const balanceBtc = document.getElementById('balance-btc') as HTMLSpanElement;
    const balanceUsd = document.getElementById('balance-usd') as HTMLSpanElement;
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

    const renderMinesLeds = () => {
        minesLedStrip.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const dot = document.createElement('span');
            const active = i <= engine.minesCount;
            dot.className = `w-1.5 h-1.5 rounded-full transition-colors ${
                active ? 'bg-[#ff1e42] shadow-[0_0_5px_#ff1e42]' : 'bg-[#243847]'
            }`;
            minesLedStrip.appendChild(dot);
        }
    };

    const updateBonusUI = () => {
        const baseBet = parseFloat(betInput.value) || 10;
        const effBet = calculateEffectiveBet(baseBet, engine.luckyBoost, engine.shieldPurchased);
        effectiveBetLabel.innerText = `Total: ${formatCurrency(effBet)}`;

        renderMinesLeds();

        // Update Next Multiplier Preview
        const isFirst = engine.state !== GameState.PLAYING || engine.currentRow === 1;
        const baseMult = engine.state === GameState.PLAYING ? engine.currentMultiplier : 1.0;
        const activeShield = engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased;
        const previewMult = calculateNextStepMultiplier(
            baseMult,
            engine.minesCount,
            isFirst,
            1.0,
            activeShield
        );
        nextMultPreview.innerText = `SIG: ${formatMultiplier(previewMult)}`;

        if (engine.luckyBoost) {
            toggleLucky.className =
                'flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#ffc700] bg-[#ffc700]/10 text-white transition-all text-left cursor-pointer';
            luckyBadge.className =
                'text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-[#ffc700] text-[#0b161f] tabular-nums';
            luckyBadge.innerText = 'ON +25%';
        } else {
            toggleLucky.className =
                'flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all text-left cursor-pointer';
            luckyBadge.className =
                'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1a2c38] text-[#8ea4b8] tabular-nums';
            luckyBadge.innerText = '+25%';
        }

        if (engine.shieldPurchased) {
            toggleShield.className =
                'flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#00f0ff] bg-[#00f0ff]/10 text-white transition-all text-left cursor-pointer';
            shieldBadge.className =
                'text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-[#00f0ff] text-[#0b161f] tabular-nums';
            shieldBadge.innerText = 'ON +25%';
        } else {
            toggleShield.className =
                'flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#243847] bg-[#0f212e] text-[#8ea4b8] hover:border-[#3c5a70] transition-all text-left cursor-pointer';
            shieldBadge.className =
                'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1a2c38] text-[#8ea4b8] tabular-nums';
            shieldBadge.innerText = '+25%';
        }

        // Update Top Stage Perk Badges (SVG-only, zero emojis)
        activePerksStrip.innerHTML = '';
        if (engine.luckyBoost) {
            activePerksStrip.innerHTML += `
                <span class="px-2 py-0.5 rounded bg-[#ffc700]/15 border border-[#ffc700]/50 text-[#ffc700] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#ffc700]"></span>SUERTE +25%
                </span>`;
        }
        if (engine.state === GameState.PLAYING ? engine.hasActiveShield : engine.shieldPurchased) {
            activePerksStrip.innerHTML += `
                <span class="px-2 py-0.5 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#00f0ff] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>ESCUDO ACTIVO
                </span>`;
        } else if (engine.state === GameState.PLAYING && engine.shieldUsedInRound) {
            activePerksStrip.innerHTML += `
                <span class="px-2 py-0.5 rounded bg-[#1e2f3d] border border-[#3c5468] text-[#7f96a7] text-[9px] font-mono font-bold uppercase">
                    ESCUDO DESCARGADO
                </span>`;
        }
        if (engine.state === GameState.PLAYING && engine.partialPayoutBanked > 0) {
            activePerksStrip.innerHTML += `
                <span class="px-2 py-0.5 rounded bg-[#00e701]/15 border border-[#00e701]/50 text-[#00e701] text-[9px] font-mono font-bold uppercase tabular-nums">
                    ASEGURADO ${formatCurrency(engine.partialPayoutBanked)}
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
        tabManual.className = 'px-3.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer';
        tabAuto.className = 'px-3.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer';
        controlsManual.classList.remove('hidden');
        controlsAuto.classList.add('hidden');
    });

    tabAuto.addEventListener('click', () => {
        sounds.playClick();
        tabAuto.className = 'px-3.5 py-1 rounded bg-[#213743] text-white transition-colors cursor-pointer';
        tabManual.className = 'px-3.5 py-1 rounded text-[#8ea4b8] hover:text-white transition-colors cursor-pointer';
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

            autoInterval = window.setInterval(runAutoStep, 340);
        }
    });

    // BALANCE LISTENER
    engine.onBalanceChange((bal) => {
        balanceBtc.innerText = formatBtc(bal);
        balanceUsd.innerText = formatCurrency(bal);
    });

    // HISTORY PILLS UPDATE
    engine.onHistoryUpdate((summaries) => {
        if (summaries.length === 0) {
            historyContainer.innerHTML = `
                <span class="text-[9px] text-[#6d8496] font-bold uppercase tracking-wider">HISTORIAL:</span>
                <span class="text-[10px] text-[#53697a] font-mono">SIN REGISTROS</span>
            `;
            return;
        }

        historyContainer.innerHTML = `<span class="text-[9px] text-[#6d8496] font-bold uppercase tracking-wider mr-1">HISTORIAL:</span>`;
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
                    'stake-cta-green flex-[1.6] w-full rounded-lg py-2 flex flex-col items-center justify-center cursor-pointer';
                actionTitle.innerText = 'CASHOUT';
                actionSubtitle.innerText = `COBRAR: ${formatCurrency(remainingPayout)}`;
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
                    partialSubtitle.innerText = `50% ASEGURADO`;
                }
            } else {
                btnPartial.classList.add('hidden');
                btnPartial.classList.remove('flex');

                btnAction.className =
                    'w-full bg-[#15242e] text-[#8ea4b8] font-bold rounded-lg py-2.5 flex flex-col items-center justify-center border border-[#243847]';
                actionTitle.innerText = 'SELECCIONA UN CARRIL EN FILA 01';
                actionSubtitle.classList.add('hidden');
                btnAction.disabled = true;
            }

            multText.className =
                'text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(0,231,1,0.35)] mult-pop';
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
                    'text-2xl font-mono font-extrabold text-[#ff1e42] tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(255,30,66,0.45)]';
            } else {
                multText.className =
                    'text-2xl font-mono font-extrabold text-[#00e701] tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(0,231,1,0.35)]';
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
