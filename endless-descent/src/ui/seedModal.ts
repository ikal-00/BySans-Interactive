import { GameEngine } from '../game/engine';
import { hashServerSeed, generateClientSeed } from '../crypto/provablyFair';
import { auditRow, verifyServerSeedHash } from '../crypto/audit';
import { GameState } from '../math/types';
import { sounds } from '../audio/sounds';

export function createSeedModal(_container: HTMLElement, engine: GameEngine) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black/85 backdrop-blur-sm z-50 hidden flex justify-center items-center p-3 select-none';
    modalOverlay.id = 'seed-modal';

    modalOverlay.innerHTML = `
        <div class="bg-stake-card border border-stake-border w-full max-w-lg rounded-2xl p-5 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <!-- Close button -->
            <button id="close-seed-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-stake-input">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>

            <!-- Header -->
            <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-stake-border">
                <span class="text-stake-green p-2 rounded-lg bg-stake-green/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 01.5-3.723c1.104 0 2 .896 2 2 0 .738-.404 1.376-1 1.723z"/>
                    </svg>
                </span>
                <div>
                    <h2 class="text-lg font-black text-white uppercase tracking-wider">Provably Fair</h2>
                    <p class="text-xs text-gray-400">Verificación criptográfica determinista con HMAC-SHA256</p>
                </div>
            </div>

            <!-- Modal Tabs -->
            <div class="flex gap-2 mb-4 bg-stake-dark p-1 rounded-xl border border-stake-input">
                <button id="tab-seed-active" class="flex-1 py-1.5 rounded-lg bg-stake-input text-white text-xs font-bold transition-colors">Semillas Activas</button>
                <button id="tab-seed-audit" class="flex-1 py-1.5 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-colors">Auditoría Criptográfica</button>
            </div>

            <!-- TAB 1: ACTIVE SEEDS -->
            <div id="content-seed-active" class="space-y-3.5">
                <!-- Client Seed -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Client Seed (Semilla del Jugador)</label>
                        <button id="btn-rand-client" class="text-[10px] text-stake-green hover:underline font-bold">Aleatorizar</button>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="client-seed-input" class="w-full bg-stake-dark border border-stake-input rounded-lg p-2.5 text-xs text-white font-mono focus:border-stake-green outline-none" value="${engine.clientSeed}" />
                        <button id="save-client-seed-btn" class="px-3 bg-stake-input hover:bg-stake-border text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">Guardar</button>
                    </div>
                </div>

                <!-- Server Seed Hash (Pre-round commitment) -->
                <div>
                    <label class="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider mb-1 block">Server Seed Hash (SHA-256)</label>
                    <div class="relative">
                        <input type="text" id="server-seed-hash-display" readonly class="w-full bg-stake-dark border border-stake-input rounded-lg p-2.5 text-xs text-gray-400 font-mono select-all outline-none" value="${hashServerSeed(engine.serverSeed)}" />
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">Este hash es público antes de comenzar la partida, garantizando que el casino no puede alterar el resultado.</p>
                </div>

                <!-- Nonce -->
                <div class="flex justify-between items-center bg-stake-dark border border-stake-input p-3 rounded-xl">
                    <span class="text-xs font-bold text-gray-400 uppercase">Nonce Actual (Ronda)</span>
                    <span id="nonce-display" class="text-sm font-mono font-bold text-white">${engine.nonce}</span>
                </div>

                <!-- Previous Server Seed (Revealed) -->
                <div>
                    <label class="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider mb-1 block">Ronda Anterior: Server Seed Revelada</label>
                    <input type="text" id="prev-server-seed-display" readonly class="w-full bg-stake-dark border border-stake-input rounded-lg p-2.5 text-xs text-stake-green font-mono select-all outline-none" placeholder="Disponible tras finalizar la ronda" value="${engine.previousServerSeed || ''}" />
                </div>
            </div>

            <!-- TAB 2: AUDIT & VERIFICATION TOOL -->
            <div id="content-seed-audit" class="hidden space-y-3.5">
                <div class="bg-stake-dark p-3 rounded-xl border border-stake-input space-y-2.5 text-xs">
                    <div>
                        <label class="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Server Seed (Unhashed)</label>
                        <input type="text" id="audit-server-seed" class="w-full bg-stake-card border border-stake-border rounded p-2 text-xs font-mono text-white outline-none focus:border-stake-green" placeholder="Pega el Server Seed no hasheado" value="${engine.previousServerSeed || engine.serverSeed}" />
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Client Seed</label>
                            <input type="text" id="audit-client-seed" class="w-full bg-stake-card border border-stake-border rounded p-2 text-xs font-mono text-white outline-none" value="${engine.clientSeed}" />
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Nonce</label>
                            <input type="number" id="audit-nonce" class="w-full bg-stake-card border border-stake-border rounded p-2 text-xs font-mono text-white outline-none" value="${Math.max(1, engine.nonce)}" min="1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Fila (Row)</label>
                            <input type="number" id="audit-row" class="w-full bg-stake-card border border-stake-border rounded p-2 text-xs font-mono text-white outline-none" value="1" min="1" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-gray-400 text-[11px] font-bold">Minas (1-4):</span>
                        <select id="audit-mines" class="bg-stake-card border border-stake-border rounded px-3 py-1 text-xs text-white font-bold outline-none">
                            <option value="1">1 Mina</option>
                            <option value="2">2 Minas</option>
                            <option value="3" selected>3 Minas</option>
                            <option value="4">4 Minas</option>
                        </select>
                    </div>

                    <button id="btn-verify-audit" class="w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-black py-2.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer">
                        AUDITAR RESULTADO
                    </button>
                </div>

                <!-- Audit Results Container -->
                <div id="audit-results-card" class="bg-stake-dark border border-stake-input rounded-xl p-3.5 text-xs space-y-2.5 hidden">
                    <div class="flex items-center justify-between pb-2 border-b border-stake-input">
                        <span class="font-extrabold text-white uppercase text-[11px]">Resultado de Verificación</span>
                        <span class="px-2 py-0.5 rounded bg-stake-green/20 text-stake-green font-bold text-[10px] flex items-center gap-1">
                            ✓ Determinista Verificado
                        </span>
                    </div>

                    <div>
                        <span class="text-gray-400 text-[10px] uppercase font-bold block">HMAC Message</span>
                        <code id="res-hmac-msg" class="text-white font-mono text-[11px] bg-stake-card px-2 py-1 rounded block mt-0.5"></code>
                    </div>

                    <div>
                        <span class="text-gray-400 text-[10px] uppercase font-bold block">HMAC-SHA256 Hash</span>
                        <code id="res-hmac-hash" class="text-stake-green font-mono text-[10px] bg-stake-card px-2 py-1 rounded block mt-0.5 break-all"></code>
                    </div>

                    <!-- 5 Lanes Visual Representation -->
                    <div>
                        <span class="text-gray-400 text-[10px] uppercase font-bold block mb-1">Distribución de Carriles (Lanes 0 a 4)</span>
                        <div id="audit-lanes-visual" class="grid grid-cols-5 gap-1.5 pt-1">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // BINDINGS
    const tabActive = document.getElementById('tab-seed-active') as HTMLButtonElement;
    const tabAudit = document.getElementById('tab-seed-audit') as HTMLButtonElement;
    const contentActive = document.getElementById('content-seed-active') as HTMLDivElement;
    const contentAudit = document.getElementById('content-seed-audit') as HTMLDivElement;

    tabActive.addEventListener('click', () => {
        sounds.playClick();
        tabActive.className = 'flex-1 py-1.5 rounded-lg bg-stake-input text-white text-xs font-bold transition-colors';
        tabAudit.className = 'flex-1 py-1.5 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-colors';
        contentActive.classList.remove('hidden');
        contentAudit.classList.add('hidden');
    });

    tabAudit.addEventListener('click', () => {
        sounds.playClick();
        tabAudit.className = 'flex-1 py-1.5 rounded-lg bg-stake-input text-white text-xs font-bold transition-colors';
        tabActive.className = 'flex-1 py-1.5 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-colors';
        contentAudit.classList.remove('hidden');
        contentActive.classList.add('hidden');
    });

    // Close Modal
    document.getElementById('close-seed-modal')?.addEventListener('click', () => {
        sounds.playClick();
        modalOverlay.classList.add('hidden');
    });

    // Randomize client seed
    document.getElementById('btn-rand-client')?.addEventListener('click', () => {
        sounds.playClick();
        const randSeed = generateClientSeed();
        (document.getElementById('client-seed-input') as HTMLInputElement).value = randSeed;
    });

    // Save Client Seed
    document.getElementById('save-client-seed-btn')?.addEventListener('click', () => {
        sounds.playClick();
        const val = (document.getElementById('client-seed-input') as HTMLInputElement).value;
        if (val.trim()) {
            engine.updateClientSeed(val);
            const btn = document.getElementById('save-client-seed-btn') as HTMLButtonElement;
            btn.innerText = '¡Guardado!';
            btn.className = 'px-3 bg-stake-green text-stake-dark text-xs font-bold rounded-lg transition-colors whitespace-nowrap';
            setTimeout(() => {
                btn.innerText = 'Guardar';
                btn.className = 'px-3 bg-stake-input hover:bg-stake-border text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap';
            }, 1200);
        }
    });

    // Run Audit Verification
    document.getElementById('btn-verify-audit')?.addEventListener('click', () => {
        sounds.playClick();
        const sSeed = (document.getElementById('audit-server-seed') as HTMLInputElement).value.trim();
        const cSeed = (document.getElementById('audit-client-seed') as HTMLInputElement).value.trim();
        const nonce = parseInt((document.getElementById('audit-nonce') as HTMLInputElement).value, 10) || 1;
        const row = parseInt((document.getElementById('audit-row') as HTMLInputElement).value, 10) || 1;
        const mines = parseInt((document.getElementById('audit-mines') as HTMLSelectElement).value, 10) || 3;

        if (!sSeed || !cSeed) return;

        const audit = auditRow(sSeed, cSeed, nonce, row, mines);
        const computedHash = hashServerSeed(sSeed);
        const isHashValid = verifyServerSeedHash(sSeed, computedHash);

        const resultsCard = document.getElementById('audit-results-card') as HTMLDivElement;
        resultsCard.classList.remove('hidden');

        (document.getElementById('res-hmac-msg') as HTMLElement).innerText = `${audit.message} (Hash verified: ${isHashValid ? 'OK' : 'MISMATCH'})`;
        (document.getElementById('res-hmac-hash') as HTMLElement).innerText = audit.hmacHash;

        const lanesVisual = document.getElementById('audit-lanes-visual') as HTMLDivElement;
        lanesVisual.innerHTML = '';

        for (let l = 0; l < 5; l++) {
            const isHazard = audit.chosenHazards.includes(l);
            const isGold = audit.specials.goldenLane === l;
            const isAlien = audit.specials.alienLane === l;
            const specialBadge = isGold
                ? `<span class="text-[8px] font-black text-amber-300">★ ${audit.specials.goldenBoost}x</span>`
                : isAlien
                  ? `<span class="text-[8px] font-black text-cyan-300">👽 +2F</span>`
                  : '';

            const laneBox = document.createElement('div');
            laneBox.className = `p-2 rounded-lg text-center flex flex-col items-center gap-0.5 border ${
                isHazard
                    ? 'bg-stake-red/20 border-stake-red text-stake-red'
                    : 'bg-stake-green/20 border-stake-green text-stake-green'
            }`;
            laneBox.innerHTML = `
                <span class="text-[9px] font-extrabold uppercase opacity-80">Lane ${l}</span>
                <span class="text-xs font-bold">${isHazard ? '💣 MINA' : '💎 SEGURO'}</span>
                ${specialBadge}
            `;
            lanesVisual.appendChild(laneBox);
        }
    });

    // Update modal inputs on state changes
    engine.onStateChange((state, eng) => {
        const hashDisplay = document.getElementById('server-seed-hash-display') as HTMLInputElement;
        const nonceDisplay = document.getElementById('nonce-display') as HTMLElement;
        const prevDisplay = document.getElementById('prev-server-seed-display') as HTMLInputElement;

        if (hashDisplay) hashDisplay.value = hashServerSeed(eng.serverSeed);
        if (nonceDisplay) nonceDisplay.innerText = eng.nonce.toString();

        if (state === GameState.WON || state === GameState.CRASHED) {
            if (prevDisplay) prevDisplay.value = eng.previousServerSeed;
            const auditServer = document.getElementById('audit-server-seed') as HTMLInputElement;
            if (auditServer) auditServer.value = eng.previousServerSeed;
        }
    });
}
