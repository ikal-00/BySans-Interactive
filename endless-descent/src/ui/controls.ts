import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { formatCurrency, formatMultiplier, formatBtc } from '../math/multipliers';
import { sounds } from '../audio/sounds';

export function createControlsUI(container: HTMLElement, engine: GameEngine) {
    // 1. TOP HEADER HUD
    const topHeader = document.createElement('div');
    topHeader.className = 'absolute top-0 left-0 w-full px-4 pt-3 pb-2 z-30 flex justify-between items-start pointer-events-auto';

    topHeader.innerHTML = `
        <!-- Left: BySans Branding & Provably Fair Shield -->
        <div class="flex flex-col items-start select-none">
            <div class="flex items-center gap-1.5 font-black text-sm tracking-widest text-white">
                <span class="text-stake-green text-base">▼</span>
                <span>BYSANS</span>
                <span class="text-gray-400 font-semibold text-xs tracking-normal">INTERACTIVE</span>
            </div>
            <button id="header-fair-btn" class="mt-1 flex items-center gap-1 text-[10px] font-bold text-stake-green hover:underline cursor-pointer bg-stake-card/80 px-2 py-0.5 rounded border border-stake-border transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 01.5-3.723c1.104 0 2 .896 2 2 0 .738-.404 1.376-1 1.723z"/>
                </svg>
                <span>PROVABLY FAIR</span>
            </button>
        </div>

        <!-- Right: Real-time Balance Display & Tools -->
        <div class="flex items-center gap-2 select-none">
            <div class="flex flex-col items-end">
                <span class="text-[10px] text-gray-400 font-bold tracking-wider">SALDO:</span>
                <span id="balance-btc" class="text-xs font-mono font-bold text-white leading-tight">${formatBtc(engine.balance)}</span>
                <span id="balance-usd" class="text-[11px] font-mono font-bold text-stake-green leading-tight">${formatCurrency(engine.balance)}</span>
            </div>
            <!-- Sound toggle button -->
            <button id="sound-toggle-btn" class="p-1.5 rounded bg-stake-card border border-stake-border text-gray-400 hover:text-white transition-colors" title="Toggle Sound">
                <svg id="sound-icon-on" class="${sounds.isMuted ? 'hidden' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <svg id="sound-icon-off" class="${sounds.isMuted ? '' : 'hidden'}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            </button>
        </div>
    `;
    container.appendChild(topHeader);

    // 2. CENTER MULTIPLIER BANNER
    const multHUD = document.createElement('div');
    multHUD.className = 'absolute top-14 left-0 w-full flex justify-center z-20 pointer-events-none select-none';
    multHUD.innerHTML = `
        <div class="flex flex-col items-center">
            <span class="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest mb-0.5">MULTIPLICADOR:</span>
            <span id="multiplier-text" class="text-4xl font-black text-stake-green tracking-tight drop-shadow-[0_0_12px_rgba(0,231,1,0.4)]">1.00x</span>
        </div>
    `;
    container.appendChild(multHUD);

    // 3. BOTTOM CONTROLS PANEL
    const controlsPanel = document.createElement('div');
    controlsPanel.className = 'absolute bottom-0 left-0 w-full bg-stake-card/95 backdrop-blur-md border-t border-stake-border rounded-t-2xl p-3 z-30 flex flex-col gap-2.5 shadow-2xl';

    controlsPanel.innerHTML = `
        <!-- Tabs & Settings -->
        <div class="flex justify-between items-center select-none">
            <div class="flex bg-stake-dark p-0.5 rounded-lg border border-stake-input text-xs font-bold">
                <button id="tab-manual" class="px-5 py-1.5 rounded-md bg-stake-input text-white transition-colors">MANUAL</button>
                <button id="tab-auto" class="px-5 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors">AUTO</button>
            </div>
            <div class="flex items-center gap-1.5">
                <button id="btn-sim-panel" class="text-xs font-bold text-gray-300 hover:text-white px-2.5 py-1.5 rounded bg-stake-dark border border-stake-input flex items-center gap-1 hover:border-stake-green transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                    <span>SIMULAR</span>
                </button>
            </div>
        </div>

        <!-- MANUAL CONTROLS CONTAINER -->
        <div id="controls-manual" class="flex flex-col gap-2.5">
            <!-- Row 1: Bet Amount & Mines Stepper -->
            <div class="flex gap-2.5">
                <!-- Bet Amount -->
                <div class="flex-1 flex flex-col">
                    <label class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">APUESTA</label>
                    <div class="flex items-center bg-stake-dark rounded-lg border border-stake-input p-1 focus-within:border-stake-green transition-colors">
                        <span class="text-gray-400 font-bold px-1.5 text-sm">$</span>
                        <input type="number" id="bet-amount" value="10.00" min="0.10" max="250000" step="1.00" class="bg-transparent text-white font-mono font-bold text-sm w-full outline-none" />
                        <div class="flex gap-1 ml-1">
                            <button id="btn-half" class="px-2 py-1 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded border border-stake-border hover:bg-stake-input transition-colors">½</button>
                            <button id="btn-double" class="px-2 py-1 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded border border-stake-border hover:bg-stake-input transition-colors">2x</button>
                            <button id="btn-max" class="px-2 py-1 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded border border-stake-border hover:bg-stake-input transition-colors">MAX</button>
                        </div>
                    </div>
                </div>

                <!-- Mines Stepper -->
                <div class="w-28 flex flex-col">
                    <label class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">MINAS</label>
                    <div class="flex items-center justify-between bg-stake-dark rounded-lg border border-stake-input p-1">
                        <button id="btn-mines-minus" class="w-7 h-7 flex items-center justify-center font-bold text-gray-300 hover:text-white bg-stake-card rounded border border-stake-border hover:bg-stake-input transition-colors">-</button>
                        <span id="mines-count" class="font-bold text-white text-base select-none">3</span>
                        <button id="btn-mines-plus" class="w-7 h-7 flex items-center justify-center font-bold text-gray-300 hover:text-white bg-stake-card rounded border border-stake-border hover:bg-stake-input transition-colors">+</button>
                    </div>
                </div>
            </div>

            <!-- Big Action Button (Start Bet / Cashout) -->
            <button id="action-btn" class="w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all duration-150 shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer">
                <span id="action-btn-title" class="text-xl tracking-wide uppercase leading-tight">COMENZAR APUESTA</span>
                <span id="action-btn-subtitle" class="text-xs font-bold text-stake-dark/80 uppercase hidden">COBRAR: $0.00</span>
            </button>
        </div>

        <!-- AUTO CONTROLS CONTAINER (Hidden by default) -->
        <div id="controls-auto" class="hidden flex-col gap-2.5">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Número de Apuestas</label>
                    <input type="number" id="auto-bet-count" value="10" min="1" max="1000" class="w-full bg-stake-dark border border-stake-input rounded-lg p-1.5 text-xs text-white font-mono font-bold outline-none focus:border-stake-green" />
                </div>
                <div>
                    <label class="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Cobro en Fila</label>
                    <input type="number" id="auto-cashout-row" value="3" min="1" max="20" class="w-full bg-stake-dark border border-stake-input rounded-lg p-1.5 text-xs text-white font-mono font-bold outline-none focus:border-stake-green" />
                </div>
            </div>
            <button id="auto-action-btn" class="w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer">
                <span id="auto-btn-title" class="text-base tracking-wide uppercase">INICIAR AUTO APUESTA</span>
            </button>
        </div>

        <!-- Recent Multipliers History Strip -->
        <div class="flex items-center justify-between pt-1 border-t border-stake-border/40 select-none">
            <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1 mr-2" id="history-pills">
                <span class="text-[10px] text-gray-400 font-bold uppercase">HISTORIAL:</span>
                <span class="text-[10px] text-gray-500 italic">Sin rondas previas</span>
            </div>
            <span class="text-[9px] font-bold text-gray-500 whitespace-nowrap">Stake Originals</span>
        </div>
    `;

    container.appendChild(controlsPanel);

    // ELEMENT REFERENCES
    const betInput = document.getElementById('bet-amount') as HTMLInputElement;
    const minesCountSpan = document.getElementById('mines-count') as HTMLSpanElement;
    const btnAction = document.getElementById('action-btn') as HTMLButtonElement;
    const actionTitle = document.getElementById('action-btn-title') as HTMLSpanElement;
    const actionSubtitle = document.getElementById('action-btn-subtitle') as HTMLSpanElement;
    const multText = document.getElementById('multiplier-text') as HTMLSpanElement;
    const balanceBtc = document.getElementById('balance-btc') as HTMLSpanElement;
    const balanceUsd = document.getElementById('balance-usd') as HTMLSpanElement;
    const historyContainer = document.getElementById('history-pills') as HTMLDivElement;

    const tabManual = document.getElementById('tab-manual') as HTMLButtonElement;
    const tabAuto = document.getElementById('tab-auto') as HTMLButtonElement;
    const controlsManual = document.getElementById('controls-manual') as HTMLDivElement;
    const controlsAuto = document.getElementById('controls-auto') as HTMLDivElement;
    const autoActionBtn = document.getElementById('auto-action-btn') as HTMLButtonElement;
    const autoBtnTitle = document.getElementById('auto-btn-title') as HTMLSpanElement;

    let isAutoRunning = false;
    let autoInterval: number | null = null;

    // TAB SWITCHING
    tabManual.addEventListener('click', () => {
        sounds.playClick();
        tabManual.className = 'px-5 py-1.5 rounded-md bg-stake-input text-white transition-colors';
        tabAuto.className = 'px-5 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors';
        controlsManual.classList.remove('hidden');
        controlsAuto.classList.add('hidden');
    });

    tabAuto.addEventListener('click', () => {
        sounds.playClick();
        tabAuto.className = 'px-5 py-1.5 rounded-md bg-stake-input text-white transition-colors';
        tabManual.className = 'px-5 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors';
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
        }
    });

    document.getElementById('btn-mines-plus')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        if (engine.minesCount < 4) {
            engine.minesCount++;
            minesCountSpan.innerText = engine.minesCount.toString();
        }
    });

    // BET AMOUNT BUTTONS
    document.getElementById('btn-half')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        const cur = parseFloat(betInput.value) || 10;
        betInput.value = Math.max(0.1, cur / 2).toFixed(2);
    });

    document.getElementById('btn-double')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        const cur = parseFloat(betInput.value) || 10;
        betInput.value = Math.min(engine.balance, cur * 2).toFixed(2);
    });

    document.getElementById('btn-max')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        sounds.playClick();
        betInput.value = Math.min(250000, engine.balance).toFixed(2);
    });

    // MAIN ACTION BUTTON
    btnAction.addEventListener('click', () => {
        if (engine.state === GameState.IDLE || engine.state === GameState.WON || engine.state === GameState.CRASHED) {
            const bet = parseFloat(betInput.value) || 10;
            engine.startBet(bet, engine.minesCount);
        } else if (engine.state === GameState.PLAYING) {
            if (engine.currentRow > 1) {
                engine.cashout();
            }
        }
    });

    // AUTO BET LOGIC
    autoActionBtn.addEventListener('click', () => {
        if (isAutoRunning) {
            // Stop autobet
            isAutoRunning = false;
            if (autoInterval) clearInterval(autoInterval);
            autoActionBtn.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
            autoBtnTitle.innerText = 'INICIAR AUTO APUESTA';
        } else {
            // Start autobet
            isAutoRunning = true;
            autoActionBtn.className = 'w-full bg-stake-red hover:bg-[#d00e35] text-white font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#b00c2d] active:translate-y-1 active:shadow-none cursor-pointer';
            autoBtnTitle.innerText = 'DETENER AUTO APUESTA';

            const roundsTotal = parseInt((document.getElementById('auto-bet-count') as HTMLInputElement).value, 10) || 10;
            const targetRow = parseInt((document.getElementById('auto-cashout-row') as HTMLInputElement).value, 10) || 3;
            let roundsCompleted = 0;

            const runAutoStep = () => {
                if (!isAutoRunning || roundsCompleted >= roundsTotal) {
                    isAutoRunning = false;
                    if (autoInterval) clearInterval(autoInterval);
                    autoActionBtn.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
                    autoBtnTitle.innerText = 'INICIAR AUTO APUESTA';
                    return;
                }

                if (engine.state !== GameState.PLAYING) {
                    const bet = parseFloat(betInput.value) || 10;
                    roundsCompleted++;
                    engine.startBet(bet, engine.minesCount);
                } else {
                    // Pick a random lane
                    const randomLane = Math.floor(Math.random() * 5);
                    const res = engine.pickLane(randomLane);

                    if (res && res.isSafe) {
                        if (engine.currentRow > targetRow) {
                            engine.cashout();
                        }
                    }
                }
            };

            autoInterval = window.setInterval(runAutoStep, 350);
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
                <span class="text-[10px] text-gray-400 font-bold uppercase">HISTORIAL:</span>
                <span class="text-[10px] text-gray-500 italic">Sin rondas previas</span>
            `;
            return;
        }

        historyContainer.innerHTML = `<span class="text-[10px] text-gray-400 font-bold uppercase mr-1">HISTORIAL:</span>`;
        summaries.slice(0, 7).forEach((s) => {
            const pill = document.createElement('button');
            const isWin = s.isWin && s.finalMultiplier > 1;
            pill.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-transform hover:scale-105 cursor-pointer ${
                isWin
                    ? s.finalMultiplier >= 10
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-stake-green/20 text-stake-green border border-stake-green/40'
                    : 'bg-stake-red/20 text-stake-red border border-stake-red/40'
            }`;
            pill.innerText = isWin ? `+${formatMultiplier(s.finalMultiplier)}` : '0.00x';
            pill.title = `Ronda #${s.nonce} - Haz clic para auditar provably fair`;
            pill.addEventListener('click', () => {
                // Open Seed Modal directly populated with this round
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

        if (state === GameState.PLAYING) {
            betInput.disabled = true;

            if (eng.currentRow > 1) {
                // CASHOUT STATE
                const payout = eng.betAmount * eng.currentMultiplier;
                btnAction.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
                actionTitle.innerText = 'CASHOUT';
                actionSubtitle.innerText = `COBRAR: ${formatCurrency(payout)} (CASHOUT)`;
                actionSubtitle.classList.remove('hidden');
                btnAction.disabled = false;
                btnAction.style.opacity = '1';
            } else {
                // FIRST STEP: Waiting for lane selection on row 1
                btnAction.className = 'w-full bg-stake-card text-gray-400 font-bold rounded-xl py-3 flex flex-col items-center justify-center border border-stake-border';
                actionTitle.innerText = 'ELIGE UN CARRIL EN FILA 01';
                actionSubtitle.classList.add('hidden');
                btnAction.disabled = true;
                btnAction.style.opacity = '0.7';
            }

            multText.className = 'text-4xl font-black text-stake-green tracking-tight drop-shadow-[0_0_12px_rgba(0,231,1,0.4)]';
        } else {
            betInput.disabled = false;
            btnAction.disabled = false;
            btnAction.style.opacity = '1';
            actionSubtitle.classList.add('hidden');

            if (state === GameState.CRASHED) {
                btnAction.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
                actionTitle.innerText = 'COMENZAR APUESTA';
                multText.className = 'text-4xl font-black text-stake-red tracking-tight drop-shadow-[0_0_12px_rgba(233,17,60,0.5)]';
            } else if (state === GameState.WON) {
                btnAction.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
                actionTitle.innerText = 'COMENZAR APUESTA';
                multText.className = 'text-4xl font-black text-stake-green tracking-tight drop-shadow-[0_0_16px_rgba(0,231,1,0.6)]';
            } else {
                btnAction.className = 'w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black rounded-xl py-3 flex flex-col items-center justify-center transition-all shadow-[0_4px_0_#00b001] active:translate-y-1 active:shadow-none cursor-pointer';
                actionTitle.innerText = 'COMENZAR APUESTA';
                multText.className = 'text-4xl font-black text-stake-green tracking-tight drop-shadow-[0_0_12px_rgba(0,231,1,0.4)]';
            }
        }
    });

    // Wire up triggers for Modals
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
}
