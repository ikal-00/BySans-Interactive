/**
 * ENDLESS DESCENT — DEVELOPER TOOLS & INSTANT TESTING SUITE
 * 
 * Provides instantaneous balance reloads, God Mode (invulnerability),
 * and special box forcing for developer testing and QA.
 */

import { GameEngine } from '../game/engine';
import { GameState, type RoundPick } from '../math/types';
import { stakeRGS } from '../engine/StakeRGSBridge';
import { generateSlotBonusSpins } from '../crypto/provablyFair';

export function isDevModalOpen(): boolean {
    const el = document.getElementById('dev-modal-overlay');
    return !!(el && el.classList.contains('active'));
}

export function hideDevModal() {
    const el = document.getElementById('dev-modal-overlay');
    if (el) {
        el.classList.remove('active');
        document.body.classList.remove('dev-modal-open');
    }
}

export function openDevModal(engine: GameEngine, onUpdate: () => void) {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    renderDevModal(engine, onUpdate);
    const el = document.getElementById('dev-modal-overlay');
    if (el) {
        el.classList.add('active');
        document.body.classList.add('dev-modal-open');
    }
}

export function toggleDevModal(engine: GameEngine, onUpdate: () => void) {
    if (isDevModalOpen()) {
        hideDevModal();
    } else {
        openDevModal(engine, onUpdate);
    }
}

export function renderDevModal(engine: GameEngine, onUpdate: () => void) {
    let overlay = document.getElementById('dev-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'dev-modal-overlay';
        overlay.className = 'dev-modal-overlay';
        document.body.appendChild(overlay);
    }

    const godMode = !!(window as any).__devGodMode;
    const forceSolar = !!(window as any).__devForceSolar;
    const forceAlien = !!(window as any).__devForceAlien;
    const forceWheel = !!(window as any).__devForceWheel;
    const forceWheelSlot = !!(window as any).__devForceWheelSlot;

    overlay.innerHTML = `
      <div class="dev-modal-backdrop" id="dev-backdrop"></div>
      <div class="dev-modal-window" role="dialog" aria-modal="true" aria-labelledby="dev-dialog-title">
        
        <!-- Header -->
        <div class="dev-modal-header">
          <div class="dev-title-cluster">
            <div class="dev-badge-pulse"></div>
            <h2 id="dev-dialog-title">MODO DEVELOPER / HERRAMIENTAS QA</h2>
          </div>
          <button class="dev-close-btn" id="btn-dev-close" type="button" aria-label="Cerrar">✕</button>
        </div>

        <!-- Body -->
        <div class="dev-modal-body">
          
          <!-- Seccion 1: Recarga Inmediata de Saldo -->
          <div class="dev-card-section">
            <div class="dev-section-title">
              <span class="dev-icon">💰</span>
              <span>RECARGA INMEDIATA DE SALDO</span>
            </div>
            <p class="dev-desc">Añade fondos al instante para continuar probando sin restricciones:</p>
            <div class="dev-btn-grid">
              <button class="dev-action-pill" data-amount="500" type="button">+ $500.00</button>
              <button class="dev-action-pill highlight" data-amount="1000" type="button">+ $1,000.00</button>
              <button class="dev-action-pill highlight" data-amount="5000" type="button">+ $5,000.00</button>
              <button class="dev-action-pill" data-amount="10000" type="button">+ $10,000.00</button>
              <button class="dev-action-pill reset" data-reset="250" type="button">Reset $250.00</button>
            </div>
          </div>

          <!-- Seccion 2: Modo Dios / Invulnerable -->
          <div class="dev-card-section">
            <div class="dev-section-title">
              <span class="dev-icon">🛡️</span>
              <span>MODO DIOS (INVULNERABLE)</span>
            </div>
            <p class="dev-desc">Desactiva las bombas para que cualquier casilla sea segura y puedas explorar infinitas filas:</p>
            <div class="dev-toggle-row">
              <span class="dev-toggle-label">Inmunidad Total a Minas:</span>
              <button class="dev-switch ${godMode ? 'active' : ''}" id="toggle-god-mode" type="button">
                ${godMode ? 'ACTIVADO (INMORTAL)' : 'DESACTIVADO'}
              </button>
            </div>
          </div>

          <!-- Seccion 3: Forzador de Cajas Especiales -->
          <div class="dev-card-section">
            <div class="dev-section-title">
              <span class="dev-icon">📦</span>
              <span>FORZAR CAJAS DE BONO EN PRÓXIMA FILA</span>
            </div>
            <p class="dev-desc">Genera cajas especiales en la siguiente jugada para validar animaciones y VFX:</p>
            <div class="dev-toggle-grid">
              <button class="dev-switch ${forceSolar ? 'active' : ''}" id="toggle-force-solar" type="button">
                ☀️ Forzar Solar (Naranja) [${forceSolar ? 'ON' : 'OFF'}]
              </button>
              <button class="dev-switch ${forceAlien ? 'active' : ''}" id="toggle-force-alien" type="button">
                🛸 Forzar Alien (Abducción) [${forceAlien ? 'ON' : 'OFF'}]
              </button>
              <button class="dev-switch ${forceWheel ? 'active' : ''}" id="toggle-force-wheel" type="button">
                🎡 Forzar Ruleta (Caja) [${forceWheel ? 'ON' : 'OFF'}]
              </button>
            </div>
          </div>

          <!-- Seccion 4: Ruleta y Tragamonedas (Slot) QA -->
          <div class="dev-card-section" style="border: 1px solid rgba(168, 85, 247, 0.45); background: rgba(168, 85, 247, 0.05);">
            <div class="dev-section-title" style="color: #c084fc;">
              <span class="dev-icon">🎰</span>
              <span>RULETA Y BONO MINI-SLOT ARCADE</span>
            </div>
            <p class="dev-desc">Controla y fuerza el resultado de la Ruleta para probar el bono de Slot garantizado:</p>
            
            <div class="dev-toggle-grid" style="margin-bottom: 12px;">
              <button class="dev-switch ${forceWheelSlot ? 'active' : ''}" id="toggle-force-wheel-slot" type="button" style="grid-column: span 2; ${forceWheelSlot ? 'background: linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(168, 85, 247, 0.6)); border-color: #a855f7; color: #ffffff;' : ''}">
                🎰 Forzar Acceso a SLOT en la Ruleta [${forceWheelSlot ? 'ACTIVADO (FORZAR ACCESO)' : 'DESACTIVADO'}]
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="dev-cta-btn" id="btn-instant-wheel-slot" type="button" title="Inicia la ruleta inmediatamente en pantalla y cae directo en SLOT">
                ⚡ Iniciar Ruleta Inmediata (Forzando SLOT)
              </button>
              <button class="dev-action-pill" id="btn-instant-slot-direct" type="button" style="background: rgba(124, 58, 237, 0.18); border-color: rgba(168, 85, 247, 0.35); color: #d8b4fe;" title="Prueba los rodillos del Mini-Slot directamente sin pasar por la ruleta">
                🎰 Probar Mini-Slot Directo (Saltar Ruleta)
              </button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="dev-modal-footer">
          <span class="dev-tip">Tip: Puedes presionar la tecla <strong>D</strong> en cualquier momento para abrir/cerrar este panel.</span>
        </div>

      </div>
    `;

    // Bind event handlers
    document.getElementById('dev-backdrop')?.addEventListener('click', hideDevModal);
    document.getElementById('btn-dev-close')?.addEventListener('click', hideDevModal);

    // Balance reload pills
    overlay.querySelectorAll<HTMLButtonElement>('.dev-action-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.dataset.reset) {
                engine.balance = parseFloat(btn.dataset.reset);
                stakeRGS.showToast(`Saldo restablecido a $${engine.balance.toFixed(2)}`, 'success');
            } else if (btn.dataset.amount) {
                const add = parseFloat(btn.dataset.amount);
                engine.balance += add;
                stakeRGS.showToast(`+ $${add.toFixed(2)} añadido al saldo`, 'success');
            }
            localStorage.setItem('endless_descent_demo_balance', engine.balance.toString());
            onUpdate();
        });
    });

    // Toggle God Mode
    document.getElementById('toggle-god-mode')?.addEventListener('click', () => {
        (window as any).__devGodMode = !(window as any).__devGodMode;
        renderDevModal(engine, onUpdate);
        stakeRGS.showToast(
            (window as any).__devGodMode ? '🛡️ Modo Dios ACTIVADO (Inmortal)' : 'Modo Dios DESACTIVADO',
            (window as any).__devGodMode ? 'success' : 'info'
        );
    });

    // Toggle Solar
    document.getElementById('toggle-force-solar')?.addEventListener('click', () => {
        (window as any).__devForceSolar = !(window as any).__devForceSolar;
        renderDevModal(engine, onUpdate);
        stakeRGS.showToast(
            (window as any).__devForceSolar ? '☀️ Caja Solar FORZADA en carril 1' : 'Forzado Solar DESACTIVADO',
            'info'
        );
    });

    // Toggle Alien
    document.getElementById('toggle-force-alien')?.addEventListener('click', () => {
        (window as any).__devForceAlien = !(window as any).__devForceAlien;
        renderDevModal(engine, onUpdate);
        stakeRGS.showToast(
            (window as any).__devForceAlien ? '🛸 Caja Alien FORZADA en carril 3' : 'Forzado Alien DESACTIVADO',
            'info'
        );
    });

    // Toggle Wheel Box
    document.getElementById('toggle-force-wheel')?.addEventListener('click', () => {
        (window as any).__devForceWheel = !(window as any).__devForceWheel;
        renderDevModal(engine, onUpdate);
        stakeRGS.showToast(
            (window as any).__devForceWheel ? '🎡 Caja de Ruleta FORZADA en carril 2' : 'Forzado Ruleta DESACTIVADO',
            'info'
        );
    });

    // Toggle Wheel Landing on SLOT
    document.getElementById('toggle-force-wheel-slot')?.addEventListener('click', () => {
        (window as any).__devForceWheelSlot = !(window as any).__devForceWheelSlot;
        if ((window as any).__devForceWheelSlot) {
            (window as any).__devForceWheel = true;
        }
        renderDevModal(engine, onUpdate);
        stakeRGS.showToast(
            (window as any).__devForceWheelSlot
                ? '🎰 Ruleta FORZADA a SLOT: La próxima jugada abrirá la Ruleta y caerá en SLOT'
                : 'Forzado de SLOT DESACTIVADO',
            (window as any).__devForceWheelSlot ? 'success' : 'info'
        );
        onUpdate();
    });

    // Instant Ruleta with SLOT Guaranteed
    document.getElementById('btn-instant-wheel-slot')?.addEventListener('click', () => {
        (window as any).__devForceWheelSlot = true;
        (window as any).__devForceWheel = true;
        hideDevModal();

        if (engine.state !== GameState.PLAYING) {
            engine.startBet(engine.betAmount || 10, engine.minesCount || 3);
        }

        engine.isWheelActive = true;
        engine.wheelSpinsRemaining = 1;
        engine.wheelRow = engine.currentRow;
        engine.wheelSpinIndex = 0;
        engine.isSlotActive = false;
        engine.slotBundle = null;

        const currentPick: RoundPick = {
            row: engine.currentRow,
            lane: 1,
            isSafe: true,
            shieldSaved: false,
            specialType: 'WHEEL',
            boostApplied: 1.0,
            rowsSkipped: 0,
            hazards: [],
            stepMultiplierAfter: engine.currentMultiplier
        };
        engine.wheelPendingPick = currentPick;
        engine.currentPicks.push(currentPick);

        const renderer = (window as any).__gameRenderer || (window as any).__renderer;
        if (renderer) {
            renderer.triggerDirectWheelBonusSequence(() => onUpdate());
        }

        stakeRGS.showToast('🎰 Ruleta Iniciada: Forzada a SLOT. Presiona GIRAR.', 'success');
        onUpdate();
    });

    // Instant Direct Mini-Slot Testing (Bypass wheel)
    document.getElementById('btn-instant-slot-direct')?.addEventListener('click', () => {
        hideDevModal();
        if (engine.state !== GameState.PLAYING) {
            engine.startBet(engine.betAmount || 10, engine.minesCount || 3);
        }
        engine.isWheelActive = false;
        engine.slotPreMultiplier = engine.currentMultiplier > 1 ? engine.currentMultiplier : 1.0;
        engine.slotCurrentSpinIndex = 0;
        engine.slotAccumulator = 0;
        engine.slotBundle = generateSlotBonusSpins(
            engine.serverSeed,
            engine.clientSeed,
            engine.nonce,
            'BONUS_BUY',
            engine.slotPreMultiplier,
            5
        );
        engine.isSlotActive = true;
        const renderer = (window as any).__gameRenderer || (window as any).__renderer;
        if (renderer) {
            renderer.triggerDirectSlotBonusSequence(engine.slotBundle.spins.length, () => onUpdate());
        }
        stakeRGS.showToast('🎰 Mini-Slot Arcade VIP Iniciado Directamente', 'success');
        onUpdate();
    });
}
