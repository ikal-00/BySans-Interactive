import { runSimulation } from '../game/simulation';

export function createSimPanel(container: HTMLElement) {
    const simModal = document.createElement('div');
    simModal.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 hidden flex justify-center items-center p-4';
    simModal.id = 'sim-modal';

    simModal.innerHTML = `
        <div class="bg-stake-card border border-stake-border w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button id="close-sim-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <span class="text-stake-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                </span>
                Monte Carlo Simulation
            </h2>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase block">Rounds</label>
                    <select id="sim-rounds" class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white">
                        <option value="10000">10,000</option>
                        <option value="100000" selected>100,000</option>
                        <option value="1000000">1,000,000</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase block">Mines (1-4)</label>
                    <input type="number" id="sim-mines" class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white" value="3" min="1" max="4" />
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase block">Cashout Row</label>
                    <input type="number" id="sim-cashout-row" class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white" value="3" min="1" />
                </div>
                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase block">Bet Amount</label>
                    <input type="number" id="sim-bet" class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white" value="10" min="1" />
                </div>
            </div>

            <button id="run-sim-btn" class="w-full bg-stake-input hover:bg-stake-border text-white font-bold py-3 rounded mb-6 flex justify-center items-center gap-2">
                RUN SIMULATION
                <span id="sim-spinner" class="hidden animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            </button>

            <div class="bg-stake-dark rounded-lg p-4 border border-stake-input">
                <h3 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Results</h3>
                <div class="grid grid-cols-2 gap-y-4 text-sm">
                    <div class="text-gray-400">Total Turnover:</div>
                    <div class="font-mono text-right" id="res-turnover">--</div>

                    <div class="text-gray-400">Total Payout:</div>
                    <div class="font-mono text-right text-stake-green" id="res-payout">--</div>

                    <div class="text-gray-400">Actual RTP:</div>
                    <div class="font-mono text-right font-bold text-lg" id="res-rtp">--</div>

                    <div class="text-gray-400">Max Win Streak:</div>
                    <div class="font-mono text-right text-stake-green" id="res-win-streak">--</div>

                    <div class="text-gray-400">Max Loss Streak:</div>
                    <div class="font-mono text-right text-stake-red" id="res-loss-streak">--</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(simModal);

    document.getElementById('close-sim-modal')?.addEventListener('click', () => {
        simModal.classList.add('hidden');
    });

    const trigger = document.createElement('button');
    trigger.className = 'absolute top-4 right-4 z-20 text-gray-400 hover:text-white flex flex-col items-center transition-colors';
    trigger.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <span class="text-[10px] font-bold mt-1">SIMULATE</span>
    `;
    trigger.addEventListener('click', () => {
        simModal.classList.remove('hidden');
    });
    container.appendChild(trigger);

    document.getElementById('run-sim-btn')?.addEventListener('click', () => {
        const rounds = parseInt((document.getElementById('sim-rounds') as HTMLSelectElement).value);
        const minesCount = parseInt((document.getElementById('sim-mines') as HTMLInputElement).value);
        const targetCashoutRow = parseInt((document.getElementById('sim-cashout-row') as HTMLInputElement).value);
        const betAmount = parseFloat((document.getElementById('sim-bet') as HTMLInputElement).value);

        const spinner = document.getElementById('sim-spinner');
        spinner?.classList.remove('hidden');

        // Use setTimeout to allow UI to render spinner before heavy blocking task
        setTimeout(() => {
            const t0 = performance.now();
            const results = runSimulation({ rounds, minesCount, targetCashoutRow, betAmount });
            const t1 = performance.now();

            console.log(`Simulation took ${(t1 - t0).toFixed(2)}ms`);

            (document.getElementById('res-turnover') as HTMLElement).innerText = `$${results.totalTurnover.toFixed(2)}`;
            (document.getElementById('res-payout') as HTMLElement).innerText = `$${results.totalPayout.toFixed(2)}`;

            const rtpEl = document.getElementById('res-rtp') as HTMLElement;
            const rtpVal = (results.rtp * 100).toFixed(4) + '%';
            rtpEl.innerText = rtpVal;
            if (results.rtp >= 0.985 && results.rtp <= 0.995) {
                 rtpEl.className = "font-mono text-right font-bold text-lg text-stake-green";
            } else {
                 rtpEl.className = "font-mono text-right font-bold text-lg text-stake-red";
            }

            (document.getElementById('res-win-streak') as HTMLElement).innerText = results.maxStreakWin.toString();
            (document.getElementById('res-loss-streak') as HTMLElement).innerText = results.maxStreakLoss.toString();

            spinner?.classList.add('hidden');
        }, 50);
    });
}
