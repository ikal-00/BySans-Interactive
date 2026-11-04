import { GameEngine } from '../game/engine';
import { hashServerSeed, generateClientSeed } from '../crypto/provablyFair';
import { auditRow, verifyServerSeedHash } from '../crypto/audit';
import { GameState } from '../math/types';
import { sounds } from '../audio/sounds';

export function createSeedModal(_container: HTMLElement, engine: GameEngine) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className =
        'fixed inset-0 bg-black/85 backdrop-blur-sm z-50 hidden flex justify-center items-center p-3 select-none';
    modalOverlay.id = 'seed-modal';

    modalOverlay.innerHTML = `
        <div class="bg-[#1a2c38] border border-[#2f4553] w-full max-w-lg rounded-xl p-5 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <!-- Close button -->
            <button id="close-seed-modal" class="absolute top-4 right-4 text-[#8ea4b8] hover:text-white transition-colors p-1 rounded-md hover:bg-[#213743] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>

            <!-- Header -->
            <div class="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#243847]">
                <span class="text-[#00e701] p-2 rounded-md bg-[#00e701]/10 border border-[#00e701]/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </span>
                <div>
                    <h2 class="text-base font-black text-white uppercase tracking-wider">Provably Fair</h2>
                    <p class="text-[11px] text-[#8ea4b8]">Verificación criptográfica determinista con HMAC-SHA256</p>
                </div>
            </div>

            <!-- Modal Tabs -->
            <div class="flex gap-1.5 mb-4 bg-[#0f212e] p-1 rounded-lg border border-[#243847]">
                <button id="tab-seed-active" class="flex-1 py-1.5 rounded bg-[#213743] text-white text-xs font-bold transition-colors cursor-pointer">Semillas Activas</button>
                <button id="tab-seed-audit" class="flex-1 py-1.5 rounded text-[#8ea4b8] hover:text-white text-xs font-bold transition-colors cursor-pointer">Auditoría Criptográfica</button>
            </div>

            <!-- TAB 1: ACTIVE SEEDS -->
            <div id="content-seed-active" class="space-y-3.5">
                <!-- Client Seed -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase tracking-wider">Client Seed (Semilla del Jugador)</label>
                        <button id="btn-rand-client" class="text-[10px] text-[#00e701] hover:underline font-bold cursor-pointer">Generar Nueva</button>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="client-seed-input" class="stake-well w-full p-2.5 text-xs text-white font-mono outline-none" value="${engine.clientSeed}" />
                        <button id="save-client-seed-btn" class="stake-btn-secondary px-3.5 text-xs font-bold rounded-md whitespace-nowrap cursor-pointer">Guardar</button>
                    </div>
                </div>

                <!-- Server Seed Hash (Pre-round commitment) -->
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase tracking-wider mb-1 block">Server Seed Hash (SHA-256)</label>
                    <input type="text" id="server-seed-hash-display" readonly class="stake-well w-full p-2.5 text-xs text-[#8ea4b8] font-mono select-all outline-none" value="${hashServerSeed(engine.serverSeed)}" />
                    <p class="text-[10px] text-[#6d8496] mt-1">Compromiso criptográfico público previo a la ronda. Garantiza integridad inmutable.</p>
                </div>

                <!-- Nonce -->
                <div class="flex justify-between items-center bg-[#0f212e] border border-[#243847] p-3 rounded-lg">
                    <span class="text-[11px] font-bold text-[#8ea4b8] uppercase tracking-wider">Nonce Actual (Ronda)</span>
                    <span id="nonce-display" class="text-sm font-mono font-bold text-white tabular-nums">${engine.nonce}</span>
                </div>

                <!-- Previous Server Seed (Revealed) -->
                <div>
                    <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase tracking-wider mb-1 block">Ronda Anterior: Server Seed Revelada</label>
                    <input type="text" id="prev-server-seed-display" readonly class="stake-well w-full p-2.5 text-xs text-[#00e701] font-mono select-all outline-none" placeholder="Se revela al concluir la ronda activa" value="${engine.previousServerSeed || ''}" />
                </div>
            </div>

            <!-- TAB 2: AUDIT & VERIFICATION TOOL -->
            <div id="content-seed-audit" class="hidden space-y-3.5">
                <div class="bg-[#0f212e] p-3.5 rounded-lg border border-[#243847] space-y-2.5 text-xs">
                    <div>
                        <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase block mb-1">Server Seed (Unhashed)</label>
                        <input type="text" id="audit-server-seed" class="w-full bg-[#1a2c38] border border-[#2f4553] rounded p-2 text-xs font-mono text-white outline-none focus:border-[#00e701]" placeholder="Server Seed sin hashear" value="${engine.previousServerSeed || engine.serverSeed}" />
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase block mb-1">Client Seed</label>
                            <input type="text" id="audit-client-seed" class="w-full bg-[#1a2c38] border border-[#2f4553] rounded p-2 text-xs font-mono text-white outline-none" value="${engine.clientSeed}" />
                        </div>
                        <div>
                            <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase block mb-1">Nonce</label>
                            <input type="number" id="audit-nonce" class="w-full bg-[#1a2c38] border border-[#2f4553] rounded p-2 text-xs font-mono text-white outline-none tabular-nums" value="${engine.recentSummaries[0]?.nonce ?? Math.max(1, engine.nonce)}" min="1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-[#8ea4b8] font-extrabold uppercase block mb-1">Fila (Row)</label>
                            <input type="number" id="audit-row" class="w-full bg-[#1a2c38] border border-[#2f4553] rounded p-2 text-xs font-mono text-white outline-none tabular-nums" value="1" min="1" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-[#8ea4b8] text-[11px] font-bold">Minas (1-4):</span>
                        <select id="audit-mines" class="bg-[#1a2c38] border border-[#2f4553] rounded px-3 py-1 text-xs text-white font-bold outline-none">
                            <option value="1">1 Mina</option>
                            <option value="2">2 Minas</option>
                            <option value="3" selected>3 Minas</option>
                            <option value="4">4 Minas</option>
                        </select>
                    </div>

                    <button id="btn-verify-audit" class="stake-cta-green w-full py-2.5 rounded-lg uppercase tracking-wider text-xs font-black cursor-pointer">
                        VERIFICAR FILA
                    </button>
                </div>

                <!-- Audit Results Container -->
                <div id="audit-results-card" class="bg-[#0f212e] border border-[#243847] rounded-lg p-3.5 text-xs space-y-2.5 hidden">
                    <div class="flex items-center justify-between pb-2 border-b border-[#243847]">
                        <span class="font-extrabold text-white uppercase text-[10px] tracking-wider">Resultado Criptográfico</span>
                        <span class="px-2 py-0.5 rounded bg-[#00e701]/15 text-[#00e701] font-mono font-bold text-[10px]">
                            HMAC-SHA256 VERIFICADO
                        </span>
                    </div>

                    <div>
                        <span class="text-[#8ea4b8] text-[10px] uppercase font-bold block">HMAC Message</span>
                        <code id="res-hmac-msg" class="text-white font-mono text-[11px] bg-[#1a2c38] px-2 py-1 rounded block mt-0.5"></code>
                    </div>

                    <div>
                        <span class="text-[#8ea4b8] text-[10px] uppercase font-bold block">HMAC-SHA256 Digest</span>
                        <code id="res-hmac-hash" class="text-[#00e701] font-mono text-[10px] bg-[#1a2c38] px-2 py-1 rounded block mt-0.5 break-all"></code>
                    </div>

                    <!-- 5 Lanes Visual Representation -->
                    <div>
                        <span class="text-[#8ea4b8] text-[10px] uppercase font-bold block mb-1">Distribución Determinista (Carriles 0 a 4)</span>
                        <div id="audit-lanes-visual" class="grid grid-cols-5 gap-1.5 pt-1"></div>
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
        tabActive.className = 'flex-1 py-1.5 rounded bg-[#213743] text-white text-xs font-bold transition-colors cursor-pointer';
        tabAudit.className = 'flex-1 py-1.5 rounded text-[#8ea4b8] hover:text-white text-xs font-bold transition-colors cursor-pointer';
        contentActive.classList.remove('hidden');
        contentAudit.classList.add('hidden');
    });

    tabAudit.addEventListener('click', () => {
        sounds.playClick();
        tabAudit.className = 'flex-1 py-1.5 rounded bg-[#213743] text-white text-xs font-bold transition-colors cursor-pointer';
        tabActive.className = 'flex-1 py-1.5 rounded text-[#8ea4b8] hover:text-white text-xs font-bold transition-colors cursor-pointer';
        contentAudit.classList.remove('hidden');
        contentActive.classList.add('hidden');
    });

    document.getElementById('close-seed-modal')?.addEventListener('click', () => {
        sounds.playClick();
        modalOverlay.classList.add('hidden');
    });

    document.getElementById('btn-rand-client')?.addEventListener('click', () => {
        sounds.playClick();
        const randSeed = generateClientSeed();
        (document.getElementById('client-seed-input') as HTMLInputElement).value = randSeed;
    });

    document.getElementById('save-client-seed-btn')?.addEventListener('click', () => {
        sounds.playClick();
        const val = (document.getElementById('client-seed-input') as HTMLInputElement).value;
        if (val.trim()) {
            engine.updateClientSeed(val);
            const btn = document.getElementById('save-client-seed-btn') as HTMLButtonElement;
            btn.innerText = 'GUARDADO';
            setTimeout(() => {
                btn.innerText = 'Guardar';
            }, 1200);
        }
    });

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

        (document.getElementById('res-hmac-msg') as HTMLElement).innerText = `${audit.message} [SHA256: ${isHashValid ? 'OK' : 'MISMATCH'}]`;
        (document.getElementById('res-hmac-hash') as HTMLElement).innerText = audit.hmacHash;

        const lanesVisual = document.getElementById('audit-lanes-visual') as HTMLDivElement;
        lanesVisual.innerHTML = '';

        for (let l = 0; l < 5; l++) {
            const isHazard = audit.chosenHazards.includes(l);

            const laneBox = document.createElement('div');
            laneBox.className = `p-2 rounded text-center flex flex-col items-center gap-0.5 border font-mono ${
                isHazard
                    ? 'bg-[#ff1e42]/15 border-[#ff1e42] text-[#ff1e42]'
                    : 'bg-[#00e701]/15 border-[#00e701] text-[#00e701]'
            }`;
            laneBox.innerHTML = `
                <span class="text-[9px] font-bold uppercase opacity-75">C${l + 1}</span>
                <span class="text-[10px] font-extrabold">${isHazard ? 'MINA' : 'SEGURO'}</span>
            `;
            lanesVisual.appendChild(laneBox);
        }
    });

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
