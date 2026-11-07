/**
 * ENDLESS DESCENT — BONUS BUY SUITE & VIP ACCESS PORTAL
 * 
 * Provides an intuitive, high-energy circular HUD trigger and interactive modal
 * for purchasing direct entry into:
 * 1. Cosmic Prize Wheel (20x Base Bet) - Perfil B: High Wipeout (38%), heavily penalized math.
 * 2. Arcade Mini-Slot 1x3 (50x Base Bet) - Perfil B: 90% Blanks, extreme All-or-Nothing volatility.
 */

import { GameEngine } from '../game/engine';
import { GameState } from '../math/types';
import { PixiRenderer } from '../engine/Renderer';
import { stakeRGS } from '../engine/StakeRGSBridge';
import { audioController } from '../engine/AudioController';

const WHEEL_BUY_COST_MULT = 20.0;
const SLOT_BUY_COST_MULT = 50.0;

let currentSelectedBet = 1.0;

export function isBonusBuyModalOpen(): boolean {
    const el = document.getElementById('bonus-buy-modal-overlay');
    return !!(el && el.classList.contains('active'));
}

export function hideBonusBuyModal() {
    const el = document.getElementById('bonus-buy-modal-overlay');
    if (el) {
        el.classList.remove('active');
        document.body.classList.remove('bonus-modal-open');
    }
}

export function openBonusBuyModal(engine: GameEngine, renderer: PixiRenderer, onUpdate: () => void) {
    if (
        renderer.isRouletteActive ||
        renderer.isWheelSpinning ||
        renderer.isSlotActive ||
        renderer.isSlotSpinning ||
        engine.isWheelActive ||
        engine.isSlotActive
    ) {
        stakeRGS.showToast('Espera a que finalice la ronda actual', 'info');
        return;
    }
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    // Initialize selected bet to engine active bet
    if (engine.betAmount > 0) {
        currentSelectedBet = engine.betAmount;
    }
    renderBonusBuyModal(engine, renderer, onUpdate);
    const el = document.getElementById('bonus-buy-modal-overlay');
    if (el) {
        el.classList.add('active');
        document.body.classList.add('bonus-modal-open');
    }
}

export function toggleBonusBuyModal(engine: GameEngine, renderer: PixiRenderer, onUpdate: () => void) {
    if (isBonusBuyModalOpen()) {
        hideBonusBuyModal();
    } else {
        openBonusBuyModal(engine, renderer, onUpdate);
    }
}

/**
 * Creates the glowing circular Bonus Buy trigger button floating on the main interface.
 */
export function createBonusBuyButton(
    container: HTMLElement,
    engine: GameEngine,
    renderer: PixiRenderer,
    onUpdate: () => void
): HTMLButtonElement {
    const existing = document.getElementById('btn-bonus-buy-trigger');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'btn-bonus-buy-trigger';
    btn.className = 'bonus-buy-circular-btn';
    btn.type = 'button';
    btn.title = 'Tienda de Bonos VIP (Atajo: B)';
    btn.setAttribute('aria-label', 'Comprar Bonos VIP');

    btn.innerHTML = `
      <div class="bonus-btn-ring"></div>
      <div class="bonus-btn-halo"></div>
      <div class="bonus-btn-inner">
        <span class="bonus-btn-badge">VIP</span>
        <span class="bonus-btn-icon">⭐</span>
        <span class="bonus-btn-label">BONO</span>
      </div>
    `;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioController.playClick();
        toggleBonusBuyModal(engine, renderer, onUpdate);
    });

    container.appendChild(btn);
    return btn;
}

/**
 * Renders the interactive Bonus Buy modal drawer.
 */
export function renderBonusBuyModal(engine: GameEngine, renderer: PixiRenderer, onUpdate: () => void) {
    let overlay = document.getElementById('bonus-buy-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bonus-buy-modal-overlay';
        overlay.className = 'bonus-buy-modal-overlay';
        document.body.appendChild(overlay);
    }

    const wheelTotalCost = Math.round(currentSelectedBet * WHEEL_BUY_COST_MULT * 100) / 100;
    const slotTotalCost = Math.round(currentSelectedBet * SLOT_BUY_COST_MULT * 100) / 100;

    const canAffordWheel = engine.balance >= wheelTotalCost;
    const canAffordSlot = engine.balance >= slotTotalCost;

    const isMidGame = engine.state === GameState.PLAYING && !engine.isWheelActive && !engine.isSlotActive && engine.currentRow > 1;

    overlay.innerHTML = `
      <div class="bonus-modal-backdrop" id="bonus-backdrop"></div>
      <div class="bonus-modal-window" role="dialog" aria-modal="true" aria-labelledby="bonus-dialog-title">
        
        <!-- Header -->
        <div class="bonus-modal-header">
          <div class="bonus-title-cluster">
            <div class="bonus-badge-pulse">VIP</div>
            <div>
              <h2 id="bonus-dialog-title">TIENDA DE BONOS / ACCESO DIRECTO</h2>
              <p class="bonus-subtitle">¡Salta el descenso de minas y activa la adrenalina instantánea!</p>
            </div>
          </div>
          <button class="bonus-close-btn" id="btn-bonus-close" type="button" aria-label="Cerrar">✕</button>
        </div>

        <!-- Body -->
        <div class="bonus-modal-body">
          
          <!-- Bet Selector Control Bar -->
          <div class="bonus-bet-bar">
            <div class="bonus-bet-info">
              <span class="bonus-bet-label">APUESTA BASE PARA CALCULAR:</span>
              <div class="bonus-bet-stepper">
                <button class="bonus-step-btn" id="btn-bonus-bet-minus" type="button" aria-label="Disminuir apuesta">−</button>
                <span class="bonus-bet-val" id="bonus-bet-val-display">${stakeRGS.formatCurrency(currentSelectedBet)}</span>
                <button class="bonus-step-btn" id="btn-bonus-bet-plus" type="button" aria-label="Aumentar apuesta">+</button>
              </div>
            </div>

            <!-- Bet Quick Chips -->
            <div class="bonus-chips-row">
              ${[0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 25.0]
                .map(
                  (amt) => `
                    <button class="bonus-chip-pill ${Math.abs(currentSelectedBet - amt) < 0.001 ? 'active' : ''}" data-bet="${amt}" type="button">
                      ${stakeRGS.formatCurrency(amt)}
                    </button>
                  `
                )
                .join('')}
            </div>

            <div class="bonus-balance-note">
              <span>Saldo disponible: <strong>${stakeRGS.formatCurrency(engine.balance)}</strong></span>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="bonus-cards-grid">
            
            <!-- CARD 1: RULETA CÓSMICA -->
            <div class="bonus-card wheel-card">
              <div class="bonus-card-ribbon gold">ENTRADA DIRECTA · 20×</div>
              
              <div class="bonus-card-art">
                <div class="bonus-wheel-graphic">
                  <div class="wheel-glow-disc"></div>
                  <span class="wheel-center-icon">🎡</span>
                </div>
              </div>

              <div class="bonus-card-details">
                <h3 class="bonus-card-title">RULETA CÓSMICA VIP</h3>
                <p class="bonus-card-desc">
                  Entra al vacío cósmico frente a la Ruleta Gigante de 12 sectores. Gira de inmediato por premios de hasta <strong>x1,000 JACKPOT</strong>, tiradas extra o la llave dorada al Mini-Slot.
                </p>

                <div class="bonus-stats-pills">
                  <span class="bonus-stat-tag green">🏆 Jackpots hasta x1000</span>
                  <span class="bonus-stat-tag purple">🎰 Acceso a Giros de Slot</span>
                  <span class="bonus-stat-tag red">⚠️ Tasa Wipeout Castigada: 38%</span>
                </div>

                <div class="bonus-card-footer">
                  <div class="bonus-cost-cluster">
                    <span class="bonus-cost-label">PRECIO:</span>
                    <span class="bonus-cost-amount gold">${stakeRGS.formatCurrency(wheelTotalCost)}</span>
                  </div>
                  <button 
                    class="bonus-buy-cta-btn gold-btn ${!canAffordWheel ? 'disabled' : ''}" 
                    id="btn-buy-wheel-bonus" 
                    type="button"
                    ${!canAffordWheel ? 'disabled' : ''}
                  >
                    ${canAffordWheel ? `🎡 COMPRAR RULETA (${stakeRGS.formatCurrency(wheelTotalCost)})` : 'SALDO INSUFICIENTE'}
                  </button>
                </div>
              </div>
            </div>

            <!-- CARD 2: ARCADE MINI-SLOT 1x3 -->
            <div class="bonus-card slot-card">
              <div class="bonus-card-ribbon purple">VOLATILIDAD EXTREMA · 50×</div>
              
              <div class="bonus-card-art">
                <div class="bonus-slot-graphic">
                  <div class="slot-glow-neon"></div>
                  <div class="slot-mini-cabinet">
                    <span class="slot-digit">🎰</span>
                    <span class="slot-digit glow">x88</span>
                    <span class="slot-digit">⭐</span>
                  </div>
                </div>
              </div>

              <div class="bonus-card-details">
                <h3 class="bonus-card-title">BONO MINI-SLOT 1x3</h3>
                <p class="bonus-card-desc">
                  ¡El bono supremo de Endless Descent! <strong>5 Giros VIP</strong> en la máquina cibernética de 1x3 rodillos con acumulación de multiplicadores en pantalla LED.
                </p>

                <div class="bonus-stats-pills">
                  <span class="bonus-stat-tag cyan">🎰 5 Tiradas de Rodillos 1x3</span>
                  <span class="bonus-stat-tag yellow">⚡ Símbolos x4, x8, x10, x28, x88</span>
                  <span class="bonus-stat-tag red">⚠️ 90% Blanks (All-or-Nothing)</span>
                </div>

                <div class="bonus-card-footer">
                  <div class="bonus-cost-cluster">
                    <span class="bonus-cost-label">PRECIO:</span>
                    <span class="bonus-cost-amount purple">${stakeRGS.formatCurrency(slotTotalCost)}</span>
                  </div>
                  <button 
                    class="bonus-buy-cta-btn purple-btn ${!canAffordSlot ? 'disabled' : ''}" 
                    id="btn-buy-slot-bonus" 
                    type="button"
                    ${!canAffordSlot ? 'disabled' : ''}
                  >
                    ${canAffordSlot ? `🎰 COMPRAR SLOT (${stakeRGS.formatCurrency(slotTotalCost)})` : 'SALDO INSUFICIENTE'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          ${isMidGame ? `
            <div class="bonus-midgame-warning">
              ⚠️ Nota: Tienes una nave en vuelo activo. Al comprar un bono se liquidará la tirada previa para iniciar la ronda VIP seleccionada.
            </div>
          ` : ''}

          <!-- Responsible Gaming Notice -->
          <div class="bonus-responsible-notice">
            <span class="notice-icon">⚖️</span>
            <span><strong>Regulación de Volatilidad:</strong> La compra de bonos posee una matemática castigada con mayor probabilidad de pérdida frente al acceso natural. Juega de manera responsable.</span>
          </div>

        </div>

        <!-- Footer -->
        <div class="bonus-modal-footer">
          <span class="bonus-tip">Atajo: Pulsa la tecla <strong>B</strong> en el teclado para abrir/cerrar esta tienda de bonos.</span>
        </div>

      </div>
    `;

    // Bind event handlers
    document.getElementById('bonus-backdrop')?.addEventListener('click', hideBonusBuyModal);
    document.getElementById('btn-bonus-close')?.addEventListener('click', hideBonusBuyModal);

    // Bet stepper buttons
    const betConfig = stakeRGS.betConfig;
    const betLevels = [...betConfig.betLevels].sort((a, b) => a - b);

    document.getElementById('btn-bonus-bet-minus')?.addEventListener('click', () => {
        audioController.playClick();
        const currentIndex = betLevels.findIndex((b) => Math.abs(b - currentSelectedBet) < 0.001);
        if (currentIndex > 0) {
            currentSelectedBet = betLevels[currentIndex - 1];
        } else if (currentSelectedBet > 0.2) {
            currentSelectedBet = Math.max(0.2, Math.round((currentSelectedBet - 0.5) * 100) / 100);
        }
        renderBonusBuyModal(engine, renderer, onUpdate);
    });

    document.getElementById('btn-bonus-bet-plus')?.addEventListener('click', () => {
        audioController.playClick();
        const currentIndex = betLevels.findIndex((b) => Math.abs(b - currentSelectedBet) < 0.001);
        if (currentIndex >= 0 && currentIndex < betLevels.length - 1) {
            currentSelectedBet = betLevels[currentIndex + 1];
        } else {
            currentSelectedBet = Math.min(100.0, Math.round((currentSelectedBet + 1.0) * 100) / 100);
        }
        renderBonusBuyModal(engine, renderer, onUpdate);
    });

    // Bet quick chips
    overlay.querySelectorAll<HTMLButtonElement>('.bonus-chip-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
            const amt = parseFloat(btn.dataset.bet || '1.0');
            audioController.playClick();
            currentSelectedBet = amt;
            renderBonusBuyModal(engine, renderer, onUpdate);
        });
    });

    // 1. BUY WHEEL BONUS (20x)
    document.getElementById('btn-buy-wheel-bonus')?.addEventListener('click', () => {
        if (
            renderer.isRouletteActive ||
            renderer.isWheelSpinning ||
            renderer.isSlotActive ||
            renderer.isSlotSpinning ||
            engine.isWheelActive ||
            engine.isSlotActive
        ) {
            stakeRGS.showToast('Espera a que finalice la ronda actual', 'info');
            return;
        }

        const cost = Math.round(currentSelectedBet * WHEEL_BUY_COST_MULT * 100) / 100;
        if (engine.balance < cost) {
            stakeRGS.showToast('Saldo insuficiente para comprar la Ruleta VIP', 'error');
            audioController.playClick();
            return;
        }

        audioController.playGoldenHit();
        const success = engine.buyWheelBonus(WHEEL_BUY_COST_MULT, currentSelectedBet);
        if (success) {
            hideBonusBuyModal();
            renderer.triggerDirectWheelBonusSequence(() => onUpdate());

            stakeRGS.showToast(
                `🎡 ¡Bono Ruleta Cósmica Comprado! Costo: ${stakeRGS.formatCurrency(cost)}. ¡Gira ahora!`,
                'success'
            );
            onUpdate();
        }
    });

    // 2. BUY SLOT BONUS (50x)
    document.getElementById('btn-buy-slot-bonus')?.addEventListener('click', () => {
        if (
            renderer.isRouletteActive ||
            renderer.isWheelSpinning ||
            renderer.isSlotActive ||
            renderer.isSlotSpinning ||
            engine.isWheelActive ||
            engine.isSlotActive
        ) {
            stakeRGS.showToast('Espera a que finalice la ronda actual', 'info');
            return;
        }

        const cost = Math.round(currentSelectedBet * SLOT_BUY_COST_MULT * 100) / 100;
        if (engine.balance < cost) {
            stakeRGS.showToast('Saldo insuficiente para comprar el Bono Mini-Slot', 'error');
            audioController.playClick();
            return;
        }

        audioController.playGoldenHit();
        const bundle = engine.buySlotBonus(SLOT_BUY_COST_MULT, currentSelectedBet);
        if (bundle) {
            hideBonusBuyModal();
            renderer.triggerDirectSlotBonusSequence(bundle.spins.length, () => onUpdate());

            stakeRGS.showToast(
                `🎰 ¡Bono Mini-Slot 1x3 Comprado! Costo: ${stakeRGS.formatCurrency(cost)}. ¡Tira los rodillos!`,
                'success'
            );
            onUpdate();
        }
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isBonusBuyModalOpen()) {
            hideBonusBuyModal();
        }
    });
}
