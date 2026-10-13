import { GameEngine } from '../game/engine';
import { hashServerSeed } from '../crypto/provablyFair';

export function createSeedModal(container: HTMLElement, engine: GameEngine) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 hidden flex justify-center items-center p-4';
    modalOverlay.id = 'seed-modal';

    modalOverlay.innerHTML = `
        <div class="bg-stake-card border border-stake-border w-full max-w-md rounded-xl p-6 relative">
            <button id="close-seed-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <span class="text-stake-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 01.5-3.723c1.104 0 2 .896 2 2 0 .738-.404 1.376-1 1.723z"/></svg>
                </span>
                Provably Fair
            </h2>

            <div class="space-y-4">
                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider block">Active Client Seed</label>
                    <input type="text" id="client-seed-input" class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white focus:border-stake-green outline-none" value="${engine.clientSeed}" />
                </div>

                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider block">Active Server Seed (Hashed)</label>
                    <input type="text" id="server-seed-hash" readonly class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-gray-500 font-mono" value="${hashServerSeed(engine.serverSeed)}" />
                </div>

                <div>
                    <label class="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider block">Previous Server Seed (Unhashed)</label>
                    <input type="text" id="prev-server-seed" readonly class="w-full bg-stake-dark border border-stake-input rounded p-2 text-sm text-white font-mono opacity-50" placeholder="Revealed after round" />
                </div>

                <button id="save-seed-btn" class="w-full bg-stake-green hover:bg-[#00d601] text-stake-dark font-bold py-3 rounded mt-2">
                    UPDATE CLIENT SEED
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    document.getElementById('close-seed-modal')?.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    const clientInput = document.getElementById('client-seed-input') as HTMLInputElement;
    document.getElementById('save-seed-btn')?.addEventListener('click', () => {
        if (clientInput.value.trim() !== '') {
            engine.clientSeed = clientInput.value.trim();
            alert('Client seed updated.');
            modalOverlay.classList.add('hidden');
        }
    });

    // Add trigger button to top left of container
    const trigger = document.createElement('button');
    trigger.className = 'absolute top-4 left-4 z-20 text-stake-green flex flex-col items-center hover:opacity-80 transition-opacity';
    trigger.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 01.5-3.723c1.104 0 2 .896 2 2 0 .738-.404 1.376-1 1.723z"/></svg>
        <span class="text-[10px] font-bold mt-1">PROVABLY FAIR</span>
    `;
    trigger.addEventListener('click', () => {
        // Update hash in case server seed changed
        (document.getElementById('server-seed-hash') as HTMLInputElement).value = hashServerSeed(engine.serverSeed);
        modalOverlay.classList.remove('hidden');
    });

    engine.setCallbacks((state) => {
        if (state === "WON" || state === "CRASHED") {
            const prevInput = document.getElementById("prev-server-seed") as HTMLInputElement;
            if (prevInput) {
                prevInput.value = engine.previousServerSeed;
            }
        }
    }, () => {});
    container.appendChild(trigger);

}
