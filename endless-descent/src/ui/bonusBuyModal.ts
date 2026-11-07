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
      <div class="bonus-modal-window minimalist" role="dialog" aria-modal="true" aria-labelledby="bonus-dialog-title">
        
        <!-- Minimalist Header -->
        <div class="bonus-modal-header">
          <div class="bonus-title-cluster">
            <h2 id="bonus-dialog-title">COMPRA DE BONOS</h2>
            <span class="bonus-tag-clean">VIP</span>
          </div>
          <button class="bonus-close-btn" id="btn-bonus-close" type="button" aria-label="Cerrar">✕</button>
        </div>

        <!-- Body: Clean & Compact -->
        <div class="bonus-modal-body">
          
          <!-- Compact Bet Selector -->
          <div class="bonus-bet-bar">
            <div class="bonus-bet-top-row">
              <span class="bonus-bet-label">APUESTA BASE:</span>
              <div class="bonus-bet-stepper">
                <button class="bonus-step-btn" id="btn-bonus-bet-minus" type="button" aria-label="Disminuir apuesta">−</button>
                <span class="bonus-bet-val" id="bonus-bet-val-display">${stakeRGS.formatCurrency(currentSelectedBet)}</span>
                <button class="bonus-step-btn" id="btn-bonus-bet-plus" type="button" aria-label="Aumentar apuesta">+</button>
              </div>
              <div class="bonus-chips-row">
                ${[0.5, 1.0, 2.0, 5.0, 10.0, 25.0]
                  .map(
                    (amt) => `
                      <button class="bonus-chip-pill ${Math.abs(currentSelectedBet - amt) < 0.001 ? 'active' : ''}" data-bet="${amt}" type="button">
                        ${stakeRGS.formatCurrency(amt)}
                      </button>
                    `
                  )
                  .join('')}
              </div>
            </div>
            <div class="bonus-balance-note">
              <span>Saldo: <strong>${stakeRGS.formatCurrency(engine.balance)}</strong></span>
            </div>
          </div>

          <!-- Cards Grid: Minimalist Dual Action Cards -->
          <div class="bonus-cards-grid">
            
            <!-- CARD 1: RULETA CÓSMICA -->
            <div class="bonus-card wheel-card">
              <div class="bonus-card-top">
                <div class="bonus-card-icon gold">🎡</div>
                <div class="bonus-card-info">
                  <div class="bonus-card-header-row">
                    <h3 class="bonus-card-title">Ruleta Cósmica</h3>
                    <span class="bonus-mult-pill gold">20×</span>
                  </div>
                  <span class="bonus-card-sub">12 sectores · Jackpots hasta x1,000</span>
                </div>
              </div>

              <div class="bonus-card-footer">
                <button 
                  class="bonus-buy-cta-btn gold-btn ${!canAffordWheel ? 'disabled' : ''}" 
                  id="btn-buy-wheel-bonus" 
                  type="button"
                  ${!canAffordWheel ? 'disabled' : ''}
                >
                  ${canAffordWheel ? `Comprar · ${stakeRGS.formatCurrency(wheelTotalCost)}` : 'Saldo Insuficiente'}
                </button>
              </div>
            </div>

            <!-- CARD 2: MINI-SLOT 1x3 -->
            <div class="bonus-card slot-card">
              <div class="bonus-card-top">
                <div class="bonus-card-icon purple">🎰</div>
                <div class="bonus-card-info">
                  <div class="bonus-card-header-row">
                    <h3 class="bonus-card-title">Mini-Slot 1×3</h3>
                    <span class="bonus-mult-pill purple">50×</span>
                  </div>
                  <span class="bonus-card-sub">5 Tiradas VIP · Multiplicadores x4..x88</span>
                </div>
              </div>

              <div class="bonus-card-footer">
                <button 
                  class="bonus-buy-cta-btn purple-btn ${!canAffordSlot ? 'disabled' : ''}" 
                  id="btn-buy-slot-bonus" 
                  type="button"
                  ${!canAffordSlot ? 'disabled' : ''}
                >
                  ${canAffordSlot ? `Comprar · ${stakeRGS.formatCurrency(slotTotalCost)}` : 'Saldo Insuficiente'}
                </button>
              </div>
            </div>

          </div>

          ${isMidGame ? `
            <div class="bonus-midgame-warning">
              ⚠️ Al comprar se liquidará la tirada previa para iniciar la ronda VIP.
            </div>
          ` : ''}

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
