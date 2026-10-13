import { GameEngine, GameState } from '../game/engine';

export function createControlsUI(container: HTMLElement, engine: GameEngine) {
    // Top Multiplier Display
    const topBar = document.createElement('div');
    topBar.className = 'absolute top-4 left-0 w-full flex justify-center z-10 pointer-events-none';

    const multDisplay = document.createElement('div');
    multDisplay.className = 'bg-stake-card border-2 border-stake-border rounded-lg px-6 py-2 flex flex-col items-center';
    multDisplay.innerHTML = `
        <span class="text-xs text-gray-400 font-bold mb-1 tracking-wider uppercase">Multiplicador</span>
        <span class="text-3xl font-bold text-stake-green" id="multiplier-text">1.00x</span>
    `;
    topBar.appendChild(multDisplay);
    container.appendChild(topBar);

    // Bottom Controls Panel
    const controlsPanel = document.createElement('div');
    controlsPanel.className = 'absolute bottom-0 left-0 w-full bg-stake-card border-t-2 border-stake-border p-4 rounded-t-2xl z-20 flex flex-col gap-4';

    controlsPanel.innerHTML = `
        <!-- Tabs -->
        <div class="flex gap-2">
            <button class="bg-stake-input text-white px-4 py-2 rounded font-bold text-sm">MANUAL</button>
            <button class="text-gray-400 px-4 py-2 rounded font-bold text-sm">AUTO</button>
        </div>

        <!-- Inputs -->
        <div class="flex gap-4">
            <!-- Bet Amount -->
            <div class="flex-1 flex flex-col">
                <label class="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Apuesta</label>
                <div class="flex bg-stake-dark rounded border border-stake-input p-1">
                    <input type="number" id="bet-amount" value="10.00" class="bg-transparent text-white w-full px-2 outline-none font-mono" />
                    <button id="btn-half" class="px-2 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded mr-1">½</button>
                    <button id="btn-double" class="px-2 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded mr-1">2x</button>
                    <button id="btn-max" class="px-2 text-xs font-bold text-gray-300 hover:text-white bg-stake-card rounded">MAX</button>
                </div>
            </div>

            <!-- Mines Count -->
            <div class="flex-none w-32 flex flex-col">
                <label class="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Minas</label>
                <div class="flex bg-stake-dark rounded border border-stake-input p-1 items-center justify-between">
                    <button id="btn-mines-minus" class="px-3 text-lg font-bold text-gray-300 hover:text-white bg-stake-card rounded">-</button>
                    <span id="mines-count" class="font-bold text-white">3</span>
                    <button id="btn-mines-plus" class="px-3 text-lg font-bold text-gray-300 hover:text-white bg-stake-card rounded">+</button>
                </div>
            </div>
        </div>

        <!-- Action Button -->
        <button id="action-btn" class="w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black text-xl py-4 rounded transition-colors shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center h-20">
            <span>START BET</span>
        </button>
    `;

    container.appendChild(controlsPanel);

    // Logic bindings
    const btnAction = document.getElementById('action-btn') as HTMLButtonElement;
    const betInput = document.getElementById('bet-amount') as HTMLInputElement;
    const minesSpan = document.getElementById('mines-count') as HTMLSpanElement;
    const multText = document.getElementById('multiplier-text') as HTMLSpanElement;

    let currentMines = 3;

    document.getElementById('btn-mines-minus')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        if (currentMines > 1) currentMines--;
        minesSpan.innerText = currentMines.toString();
    });

    document.getElementById('btn-mines-plus')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        if (currentMines < 4) currentMines++;
        minesSpan.innerText = currentMines.toString();
    });

    // Bet quick actions
    document.getElementById('btn-half')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        betInput.value = Math.max(0, parseFloat(betInput.value) / 2).toFixed(2);
    });
    document.getElementById('btn-double')?.addEventListener('click', () => {
        if (engine.state === GameState.PLAYING) return;
        betInput.value = (parseFloat(betInput.value) * 2).toFixed(2);
    });

    // Main action
    btnAction.addEventListener('click', () => {
        if (engine.state === GameState.IDLE || engine.state === GameState.WON || engine.state === GameState.CRASHED) {
            engine.startBet(parseFloat(betInput.value), currentMines);
        } else if (engine.state === GameState.PLAYING) {
            engine.cashout();
        }
    });

    // Update UI on state change
    engine.setCallbacks((state, eng) => {
        multText.innerText = eng.currentMultiplier.toFixed(2) + 'x';

        if (state === GameState.PLAYING) {
            betInput.disabled = true;
            if (eng.currentRow > 1) {
                const payout = (eng.betAmount * eng.currentMultiplier).toFixed(2);
                btnAction.innerHTML = `
                    <span>CASHOUT</span>
                    <span class="text-sm font-bold opacity-80">COBRAR: $${payout}</span>
                `;
            } else {
                btnAction.innerHTML = `<span>START BET</span>`;
                // Cannot cashout yet
                btnAction.disabled = true;
                btnAction.style.opacity = '0.5';
            }
        } else {
            betInput.disabled = false;
            btnAction.disabled = false;
            btnAction.style.opacity = '1';

            if (state === GameState.CRASHED) {
                 btnAction.innerHTML = `<span>START BET</span>`;
                 multText.classList.remove('text-stake-green');
                 multText.classList.add('text-stake-red');
            } else if (state === GameState.WON) {
                 btnAction.innerHTML = `<span>START BET</span>`;
            } else if (state === GameState.IDLE) {
                 btnAction.innerHTML = `<span>START BET</span>`;
            }

            if (state !== GameState.CRASHED) {
                 multText.classList.add('text-stake-green');
                 multText.classList.remove('text-stake-red');
            }
        }
    }, (payout, mult) => {
        // Cashout hook
        alert(`You cashed out $${payout.toFixed(2)} at ${mult.toFixed(2)}x!`);
    });

    // Listen for canvas clicks
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
        canvas.addEventListener('click', ( ) => {
            if (engine.state !== GameState.PLAYING) return;

            // Allow cashout button to be enabled now that a lane has been picked if this makes it safe

            // Use renderer click target if we had it exported, but we need to pass it or just import renderer
            // We will dispatch a custom event or wire it in main.ts
            // For cleaner architecture, we'll let main.ts handle the canvas click mapping.
        });
    }
}
