/**
 * ENDLESS DESCENT — BONUS BUY SUITE & VIP ACCESS PORTAL
 * 
 * Provides an intuitive, high-energy circular HUD trigger and interactive modal
 * for purchasing direct entry into:
 * 1. Cosmic Prize Wheel (20x Base Bet) - Perfil B: High Wipeout (38%), heavily penalized math.
 * 2. Arcade Mini-Slot 1x3 (50x Base Bet) - Perfil B: 90% Blanks, extreme All-or-Nothing volatility.
 * 
 * Complies strictly with Stake Engine approval guidelines [239, 240, 242, 222]:
 * - Dynamic English & Spanish internationalization
 * - Currency-aware bet presets derived from stakeRGS.betConfig.betLevels (USD, EUR, JPY, XSC, XGC)
 * - Zero OS emojis — professional vector SVG iconography
 * - State protection: blocks buying while in active base round or spinning
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
    const lang = stakeRGS.session.language;

    // Guard against opening during active base round
    if (engine.state === GameState.PLAYING && !engine.isWheelActive && !engine.isSlotActive) {
        const msg = lang === 'es'
            ? 'Finaliza o cobra tu ronda activa antes de comprar un bono'
            : 'Cash out or finish your active round before buying a bonus';
        stakeRGS.showToast(msg, 'info');
        return;
    }

    if (
        renderer.isRouletteActive ||
        renderer.isWheelSpinning ||
        renderer.isSlotActive ||
        renderer.isSlotSpinning ||
        engine.isWheelActive ||
        engine.isSlotActive
    ) {
        const msg = lang === 'es'
            ? 'Espera a que finalice la ronda actual'
            : 'Wait for the current round to complete';
        stakeRGS.showToast(msg, 'info');
        return;
    }
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    // Initialize selected bet to engine active bet or default level
    if (engine.betAmount > 0) {
        currentSelectedBet = engine.betAmount;
    } else {
        currentSelectedBet = stakeRGS.betConfig.defaultBetLevel;
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

    const lang = stakeRGS.session.language;
    const btn = document.createElement('button');
    btn.id = 'btn-bonus-buy-trigger';
    btn.className = 'bonus-buy-circular-btn';
    btn.type = 'button';
    btn.title = lang === 'es' ? 'Tienda de Bonos VIP (Atajo: B)' : 'VIP Bonus Store (Shortcut: B)';
    btn.setAttribute('aria-label', lang === 'es' ? 'Comprar Bonos VIP' : 'Buy VIP Bonuses');

    btn.innerHTML = `
      <div class="bonus-btn-ring"></div>
      <div class="bonus-btn-halo"></div>
      <div class="bonus-btn-inner">
        <span class="bonus-btn-badge">VIP</span>
        <span class="bonus-btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </span>
        <span class="bonus-btn-label">${lang === 'es' ? 'BONO' : 'BONUS'}</span>
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

    const lang = stakeRGS.session.language;
    const betConfig = stakeRGS.betConfig;
    const betLevels = [...betConfig.betLevels].sort((a, b) => a - b);

    // Pick up to 6 clean chip presets centered around defaultBetLevel
    const defIdx = betLevels.findIndex((l) => l >= betConfig.defaultBetLevel);
    const startIdx = Math.max(0, Math.min(betLevels.length - 6, defIdx > 1 ? defIdx - 2 : 0));
    const chipLevels = betLevels.slice(startIdx, Math.min(betLevels.length, startIdx + 6));

    const wheelTotalCost = Math.round(currentSelectedBet * WHEEL_BUY_COST_MULT * 100) / 100;
    const slotTotalCost = Math.round(currentSelectedBet * SLOT_BUY_COST_MULT * 100) / 100;

    const canAffordWheel = engine.balance >= wheelTotalCost;
    const canAffordSlot = engine.balance >= slotTotalCost;

    overlay.innerHTML = `
      <div class="bonus-modal-backdrop" id="bonus-backdrop"></div>
      <div class="bonus-modal-window minimalist" role="dialog" aria-modal="true" aria-labelledby="bonus-dialog-title">
        
        <!-- Minimalist Header -->
        <div class="bonus-modal-header">
          <div class="bonus-title-cluster">
            <h2 id="bonus-dialog-title">${lang === 'es' ? 'COMPRA DE BONOS VIP' : 'VIP BONUS STORE'}</h2>
            <span class="bonus-tag-clean">${lang === 'es' ? 'ACCESO DIRECTO' : 'DIRECT ACCESS'}</span>
          </div>
          <button class="bonus-close-btn" id="btn-bonus-close" type="button" aria-label="${lang === 'es' ? 'Cerrar' : 'Close'}">✕</button>
        </div>

        <!-- Body: Clean & Compact -->
        <div class="bonus-modal-body">
          
          <!-- Compact Bet Selector -->
          <div class="bonus-bet-bar">
            <div class="bonus-bet-top-row">
              <span class="bonus-bet-label">${lang === 'es' ? 'APUESTA BASE:' : 'BASE BET:'}</span>
              <div class="bonus-bet-stepper">
                <button class="bonus-step-btn" id="btn-bonus-bet-minus" type="button" aria-label="${lang === 'es' ? 'Disminuir apuesta' : 'Decrease bet'}">−</button>
                <span class="bonus-bet-val" id="bonus-bet-val-display">${stakeRGS.formatCurrency(currentSelectedBet)}</span>
                <button class="bonus-step-btn" id="btn-bonus-bet-plus" type="button" aria-label="${lang === 'es' ? 'Aumentar apuesta' : 'Increase bet'}">+</button>
              </div>
              <div class="bonus-chips-row">
                ${chipLevels
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
              <span>${lang === 'es' ? 'Saldo disponible:' : 'Available balance:'} <strong>${stakeRGS.formatCurrency(engine.balance)}</strong></span>
            </div>
          </div>

          <!-- Cards Grid: Minimalist Dual Action Cards -->
          <div class="bonus-cards-grid">
            
            <!-- CARD 1: RULETA CÓSMICA / COSMIC WHEEL -->
            <div class="bonus-card wheel-card">
              <div class="bonus-card-top">
                <div class="bonus-card-icon gold">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="2" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/>
                    <circle cx="12" cy="12" r="3" fill="#ca8a04"/>
                  </svg>
                </div>
                <div class="bonus-card-info">
                  <div class="bonus-card-header-row">
                    <h3 class="bonus-card-title">${lang === 'es' ? 'Ruleta Cósmica' : 'Cosmic Prize Wheel'}</h3>
                    <span class="bonus-mult-pill gold">20×</span>
                  </div>
                  <span class="bonus-card-sub">${lang === 'es' ? '12 sectores operados por Mr. Dollar · Premios hasta 1,000× y pase a Bóveda' : '12-sector wheel hosted by Mr. Dollar · Payouts up to 1,000× and Slot Vault access'}</span>
                </div>
              </div>

              <div class="bonus-card-footer">
                <button 
                  class="bonus-buy-cta-btn gold-btn ${!canAffordWheel ? 'disabled' : ''}" 
                  id="btn-buy-wheel-bonus" 
                  type="button"
                  ${!canAffordWheel ? 'disabled' : ''}
                >
                  ${canAffordWheel ? (lang === 'es' ? `Comprar Ruleta · ${stakeRGS.formatCurrency(wheelTotalCost)}` : `Buy Wheel · ${stakeRGS.formatCurrency(wheelTotalCost)}`) : (lang === 'es' ? 'Saldo Insuficiente' : 'Insufficient Balance')}
                </button>
              </div>
            </div>

            <!-- CARD 2: MINI-SLOT 1x3 -->
            <div class="bonus-card slot-card">
              <div class="bonus-card-top">
                <div class="bonus-card-icon purple">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <line x1="8" y1="4" x2="8" y2="20"/>
                    <line x1="16" y1="4" x2="16" y2="20"/>
                    <circle cx="5" cy="12" r="1.5" fill="#a855f7"/>
                    <circle cx="12" cy="12" r="1.5" fill="#a855f7"/>
                    <circle cx="19" cy="12" r="1.5" fill="#a855f7"/>
                  </svg>
                </div>
                <div class="bonus-card-info">
                  <div class="bonus-card-header-row">
                    <h3 class="bonus-card-title">${lang === 'es' ? 'Bóveda Mini-Slot 1×3' : '1×3 Arcade Slot Vault'}</h3>
                    <span class="bonus-mult-pill purple">50×</span>
                  </div>
                  <span class="bonus-card-sub">${lang === 'es' ? '5 Tiradas VIP en rodillos 3D · Acumulador progresivo con premios hasta 88×' : '5 VIP spins on 3D mechanical reels · Progressive accumulator up to 88×'}</span>
                </div>
              </div>

              <div class="bonus-card-footer">
                <button 
                  class="bonus-buy-cta-btn purple-btn ${!canAffordSlot ? 'disabled' : ''}" 
                  id="btn-buy-slot-bonus" 
                  type="button"
                  ${!canAffordSlot ? 'disabled' : ''}
                >
                  ${canAffordSlot ? (lang === 'es' ? `Comprar Slot · ${stakeRGS.formatCurrency(slotTotalCost)}` : `Buy Slot · ${stakeRGS.formatCurrency(slotTotalCost)}`) : (lang === 'es' ? 'Saldo Insuficiente' : 'Insufficient Balance')}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    // Bind event handlers
    document.getElementById('bonus-backdrop')?.addEventListener('click', hideBonusBuyModal);
    document.getElementById('btn-bonus-close')?.addEventListener('click', hideBonusBuyModal);

    // Bet stepper buttons
    document.getElementById('btn-bonus-bet-minus')?.addEventListener('click', () => {
        audioController.playClick();
        let targetVal = betLevels[0];
        for (let i = betLevels.length - 1; i >= 0; i--) {
            if (betLevels[i] < currentSelectedBet - 0.0001) {
                targetVal = betLevels[i];
                break;
            }
        }
        currentSelectedBet = targetVal;
        renderBonusBuyModal(engine, renderer, onUpdate);
    });

    document.getElementById('btn-bonus-bet-plus')?.addEventListener('click', () => {
        audioController.playClick();
        let targetVal = betLevels[betLevels.length - 1];
        for (let i = 0; i < betLevels.length; i++) {
            if (betLevels[i] > currentSelectedBet + 0.0001) {
                targetVal = betLevels[i];
                break;
            }
        }
        currentSelectedBet = targetVal;
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
            engine.isSlotActive ||
            engine.state === GameState.PLAYING
        ) {
            const busyMsg = lang === 'es'
                ? 'Espera a que finalice la ronda actual'
                : 'Wait for the current round to complete';
            stakeRGS.showToast(busyMsg, 'info');
            return;
        }

        const cost = Math.round(currentSelectedBet * WHEEL_BUY_COST_MULT * 100) / 100;
        if (engine.balance < cost) {
            const noFundsMsg = lang === 'es'
                ? 'Saldo insuficiente para comprar la Ruleta VIP'
                : 'Insufficient balance to buy VIP Cosmic Wheel';
            stakeRGS.showToast(noFundsMsg, 'error');
            audioController.playClick();
            return;
        }

        audioController.playGoldenHit();
        const success = engine.buyWheelBonus(WHEEL_BUY_COST_MULT, currentSelectedBet);
        if (success) {
            hideBonusBuyModal();
            renderer.triggerDirectWheelBonusSequence(() => onUpdate());

            const successMsg = lang === 'es'
                ? `¡Bono Ruleta Cósmica Comprado! Costo: ${stakeRGS.formatCurrency(cost)}. ¡Gira ahora!`
                : `Cosmic Wheel Bonus Purchased! Cost: ${stakeRGS.formatCurrency(cost)}. Spin now!`;
            stakeRGS.showToast(successMsg, 'success');
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
            engine.isSlotActive ||
            engine.state === GameState.PLAYING
        ) {
            const busyMsg = lang === 'es'
                ? 'Espera a que finalice la ronda actual'
                : 'Wait for the current round to complete';
            stakeRGS.showToast(busyMsg, 'info');
            return;
        }

        const cost = Math.round(currentSelectedBet * SLOT_BUY_COST_MULT * 100) / 100;
        if (engine.balance < cost) {
            const noFundsMsg = lang === 'es'
                ? 'Saldo insuficiente para comprar el Bono Mini-Slot'
                : 'Insufficient balance to buy Mini-Slot Bonus';
            stakeRGS.showToast(noFundsMsg, 'error');
            audioController.playClick();
            return;
        }

        audioController.playGoldenHit();
        const bundle = engine.buySlotBonus(SLOT_BUY_COST_MULT, currentSelectedBet);
        if (bundle) {
            hideBonusBuyModal();
            renderer.triggerDirectSlotBonusSequence(bundle.spins.length, () => onUpdate());

            const successMsg = lang === 'es'
                ? `¡Bono Mini-Slot 1x3 Comprado! Costo: ${stakeRGS.formatCurrency(cost)}. ¡Tira los rodillos!`
                : `1x3 Mini-Slot Bonus Purchased! Cost: ${stakeRGS.formatCurrency(cost)}. Spin reels!`;
            stakeRGS.showToast(successMsg, 'success');
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
