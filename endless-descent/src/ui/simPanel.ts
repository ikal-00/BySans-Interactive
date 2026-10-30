import { runSimulation } from '../game/simulation';
import { formatCurrency } from '../math/multipliers';
import type { SimulationStrategy } from '../math/types';
import { sounds } from '../audio/sounds';

export function createSimPanel(_container: HTMLElement) {
    const simModal = document.createElement('div');
    simModal.className =
        'fixed inset-0 bg-black/85 backdrop-blur-sm z-50 hidden flex justify-center items-center p-3 select-none';
    simModal.id = 'sim-modal';

    simModal.innerHTML = `
        <div class="bg-[#1a2c38] border border-[#2f4553] w-full max-w-lg rounded-xl p-5 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <button id="close-sim-modal" class="absolute top-4 right-4 text-[#8ea4b8] hover:text-white transition-colors p-1 rounded-md hover:bg-[#213743] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>

            <div class="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#243847]">
                <span class="text-[#00e701] p-2 rounded-md bg-[#00e701]/10 border border-[#00e701]/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </span>
                <div>
                    <h2 class="text-base font-black text-white uppercase tracking-wider">Monte Carlo RTP Harness</h2>
                    <p class="text-[11px] text-[#8ea4b8]">Auditoría estadística masiva — 96.00% RTP (4.00% House Edge)</p>
                </div>
            </div>

            <!-- Configuration Inputs -->
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase mb-1 block">Rondas a Simular</label>
                    <select id="sim-rounds" class="stake-well w-full p-2 text-xs font-mono font-bold text-white outline-none">
                        <option value="10000">10,000 rondas</option>
                        <option value="100000" selected>100,000 rondas (Benchmark)</option>
                        <option value="500000">500,000 rondas</option>
                        <option value="1000000">1,000,000 rondas</option>
                    </select>
                </div>
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase mb-1 block">Minas (1-4)</label>
                    <select id="sim-mines" class="stake-well w-full p-2 text-xs font-mono font-bold text-white outline-none">
                        <option value="1">1 Mina (p = 80%)</option>
                        <option value="2">2 Minas (p = 60%)</option>
                        <option value="3" selected>3 Minas (p = 40%)</option>
                        <option value="4">4 Minas (p = 20%)</option>
                    </select>
                </div>
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase mb-1 block">Cobro en Fila (Target Row)</label>
                    <input type="number" id="sim-cashout-row" class="stake-well w-full p-2 text-xs font-mono font-bold text-white outline-none tabular-nums" value="2" min="1" max="25" />
                </div>
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase mb-1 block">Monto Apuesta ($)</label>
                    <input type="number" id="sim-bet" class="stake-well w-full p-2 text-xs font-mono font-bold text-white outline-none tabular-nums" value="10.00" min="1" />
                </div>
            </div>

            <div class="mb-4">
                <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase mb-1 block">Mecánica / Estrategia a Auditar</label>
                <select id="sim-strategy" class="stake-well w-full p-2 text-xs font-bold text-white outline-none">
                    <option value="normal">Estándar (Modo Base Puro)</option>
                    <option value="partial_cashout">Estrategia Cobro Parcial 50% + Seguir</option>
                </select>
            </div>

            <button id="run-sim-btn" class="stake-cta-green w-full py-2.5 rounded-lg uppercase tracking-wider text-xs font-black mb-4 flex items-center justify-center gap-2 cursor-pointer">
                <span id="run-btn-text">EJECUTAR SIMULACIÓN</span>
                <span id="sim-spinner" class="hidden animate-spin h-4 w-4 border-2 border-[#051405] border-t-transparent rounded-full"></span>
            </button>

            <div id="sim-results-card" class="bg-[#0f212e] rounded-lg p-4 border border-[#243847] space-y-2">
                <div class="flex items-center justify-between pb-2 border-b border-[#243847]">
                    <span class="text-[11px] font-black text-white uppercase tracking-wider">Reporte Matemático</span>
                    <span id="res-badge" class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#213743] text-[#8ea4b8]">EN ESPERA</span>
                </div>

                <div class="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
                    <div class="text-[#8ea4b8] font-medium">Total Turnover:</div>
                    <div class="font-mono text-right font-bold text-white tabular-nums" id="res-turnover">--</div>

                    <div class="text-[#8ea4b8] font-medium">Total Payout:</div>
                    <div class="font-mono text-right font-bold text-[#00e701] tabular-nums" id="res-payout">--</div>

                    <div class="text-[#8ea4b8] font-medium">RTP Simulado:</div>
                    <div class="font-mono text-right font-black text-sm text-[#00e701] tabular-nums" id="res-rtp">--</div>

                    <div class="text-[#8ea4b8] font-medium">RTP Teórico:</div>
                    <div class="font-mono text-right font-bold text-[#d5dce6] tabular-nums">96.0000% (4.00% Edge)</div>

                    <div class="text-[#8ea4b8] font-medium">House Edge Real:</div>
                    <div class="font-mono text-right font-bold text-[#d5dce6] tabular-nums" id="res-house-edge">--</div>

                    <div class="text-[#8ea4b8] font-medium">Eventos Especiales:</div>
                    <div class="font-mono text-right font-bold text-[#ffc700] tabular-nums" id="res-specials">--</div>

                    <div class="text-[#8ea4b8] font-medium">Tasa de Victorias:</div>
                    <div class="font-mono text-right font-bold text-white tabular-nums" id="res-win-rate">--</div>

                    <div class="text-[#8ea4b8] font-medium">Racha Máx (W / L):</div>
                    <div class="font-mono text-right font-bold text-white tabular-nums" id="res-streaks">--</div>

                    <div class="text-[#8ea4b8] font-medium">Varianza / Desv. Est.:</div>
                    <div class="font-mono text-right font-bold text-[#8ea4b8] tabular-nums" id="res-variance">--</div>

                    <div class="text-[#8ea4b8] font-medium">Tiempo de Cómputo:</div>
                    <div class="font-mono text-right font-bold text-[#00e701] tabular-nums" id="res-duration">--</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(simModal);

    document.getElementById('close-sim-modal')?.addEventListener('click', () => {
        sounds.playClick();
        simModal.classList.add('hidden');
    });

    const runBtn = document.getElementById('run-sim-btn') as HTMLButtonElement;
    const runBtnText = document.getElementById('run-btn-text') as HTMLSpanElement;
    const spinner = document.getElementById('sim-spinner') as HTMLSpanElement;

    runBtn.addEventListener('click', () => {
        sounds.playClick();
        runBtn.disabled = true;
        spinner.classList.remove('hidden');
        runBtnText.innerText = 'PROCESANDO...';

        const rounds = parseInt((document.getElementById('sim-rounds') as HTMLSelectElement).value, 10);
        const minesCount = parseInt((document.getElementById('sim-mines') as HTMLSelectElement).value, 10);
        const targetCashoutRow =
            parseInt((document.getElementById('sim-cashout-row') as HTMLInputElement).value, 10) || 1;
        const betAmount = parseFloat((document.getElementById('sim-bet') as HTMLInputElement).value) || 10;
        const strategy = (document.getElementById('sim-strategy') as HTMLSelectElement)
            .value as SimulationStrategy;

        setTimeout(() => {
            const results = runSimulation({
                rounds,
                minesCount,
                targetCashoutRow,
                betAmount,
                strategy,
                mode: 'fast'
            });

            (document.getElementById('res-turnover') as HTMLElement).innerText = formatCurrency(
                results.totalTurnover
            );
            (document.getElementById('res-payout') as HTMLElement).innerText = formatCurrency(
                results.totalPayout
            );

            const rtpEl = document.getElementById('res-rtp') as HTMLElement;
            const rtpPct = (results.rtp * 100).toFixed(4) + '%';
            rtpEl.innerText = rtpPct;

            const houseEdgeEl = document.getElementById('res-house-edge') as HTMLElement;
            houseEdgeEl.innerText = (results.houseEdge * 100).toFixed(4) + '%';

            const specialsEl = document.getElementById('res-specials') as HTMLElement;
            specialsEl.innerText = `Modo Base 96% | 50% Parcial: ${results.partialCashouts}`;

            const winRateEl = document.getElementById('res-win-rate') as HTMLElement;
            winRateEl.innerText = `${results.winRate.toFixed(2)}% (${results.wins.toLocaleString()}W / ${results.losses.toLocaleString()}L)`;

            const streaksEl = document.getElementById('res-streaks') as HTMLElement;
            streaksEl.innerText = `${results.maxStreakWin}W / ${results.maxStreakLoss}L`;

            const varEl = document.getElementById('res-variance') as HTMLElement;
            varEl.innerText = `${results.variance} / ${results.standardDeviation}`;

            const durEl = document.getElementById('res-duration') as HTMLElement;
            durEl.innerText = `${results.durationMs} ms (${results.roundsPerSecond.toLocaleString()} r/s)`;

            const badge = document.getElementById('res-badge') as HTMLElement;
            if (Math.abs(results.rtp - 0.96) <= 0.008) {
                badge.className =
                    'px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00e701]/15 text-[#00e701]';
                badge.innerText = 'CONVERGENCIA 96.00% VERIFICADA';
            } else {
                badge.className =
                    'px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#ffc700]/15 text-[#ffc700]';
                badge.innerText = `DESVIACIÓN ${rtpPct}`;
            }

            runBtn.disabled = false;
            spinner.classList.add('hidden');
            runBtnText.innerText = 'EJECUTAR SIMULACIÓN';
            sounds.playSafeStep(4);
        }, 30);
    });
}
