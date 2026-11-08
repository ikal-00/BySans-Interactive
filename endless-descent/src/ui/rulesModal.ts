/**
 * ENDLESS DESCENT — OFFICIAL GAME RULES & PAYTABLE MODAL
 * 
 * Strict Compliance with Stake Engine Approval Guidelines:
 * - [239] Full English language support with dynamic fallback [240]
 * - [77] Strict social casino terminology (Stake.us mode)
 * - [25] Transparent 96.00% Theoretical RTP & 10,000x Max Win Cap
 * - [24] Payout odds table across all 4 mine configurations
 * - [26] Clear 5-lane gate traversal dynamics
 * - [27] Base game mode cost transparency
 * - [235] Comprehensive Controls & Interaction Guide
 * - [185] Complete Malfunction Void Disclaimer & Disconnection Rules
 */

import { stakeRGS } from '../engine/StakeRGSBridge';
import { getTranslations } from '../i18n/translations';

export function isRulesModalOpen(): boolean {
    const modalRoot = document.getElementById('rules-modal-overlay');
    return !!(modalRoot && modalRoot.classList.contains('active'));
}

export function hideRulesModal() {
    const modalRoot = document.getElementById('rules-modal-overlay');
    if (modalRoot) {
        modalRoot.classList.remove('active');
        document.body.classList.remove('rules-modal-open');
    }
}

export function openRulesModal() {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    // Re-render modal to reflect active language or social mode dynamically
    renderRulesModalContent();
    const modalRoot = document.getElementById('rules-modal-overlay');
    if (modalRoot) {
        modalRoot.classList.add('active');
        document.body.classList.add('rules-modal-open');
        const modalBody = modalRoot.querySelector('.rules-modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }
}

export function renderRulesModalContent() {
    const modalRoot = document.getElementById('rules-modal-overlay');
    if (!modalRoot) return;

    const t = getTranslations(stakeRGS.session.language, stakeRGS.session.isSocial);

    modalRoot.innerHTML = `
      <div class="rules-modal-backdrop" id="rules-backdrop"></div>
      <div class="rules-modal-window" id="rules-modal-window" role="dialog" aria-modal="true" aria-labelledby="rules-dialog-title">
        
        <!-- Header -->
        <div class="rules-modal-header">
          <div class="rules-modal-title-cluster">
            <h2 class="rules-modal-title" id="rules-dialog-title">${t.rulesDialogTitle}</h2>
            <span class="rules-modal-tag">${t.gameTitle} · ${t.studioName}</span>
          </div>
          <button class="rules-modal-close-btn" id="rules-close-btn" type="button" aria-label="Close Rules">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Metric Strip -->
        <div class="rules-metrics-strip">
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.rtpLabel}</span>
            <span class="rules-metric-value rtp">96.00%</span>
          </div>
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.maxWinLabel}</span>
            <span class="rules-metric-value maxwin">10,000×</span>
          </div>
          <div class="rules-metric-card">
            <span class="rules-metric-label">${t.volatilityLabel}</span>
            <span class="rules-metric-value volatility">${t.volatilityValue}</span>
          </div>
        </div>

        <!-- Scrollable Content Body -->
        <div class="rules-modal-body">
          
          <!-- Section 1: Dynamics -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section1Title}</h3>
            <p class="rules-text">${t.section1Body1}</p>
            <p class="rules-text">${t.section1Body2}</p>
          </div>

          <!-- Section 2: Odds & Multipliers Table -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section2Title}</h3>
            
            <!-- Desktop Table -->
            <div class="rules-table-container desktop-table-wrap">
              <table class="rules-table">
                <thead>
                  <tr>
                    <th>${t.tableThMines}</th>
                    <th>${t.tableThSafeGates}</th>
                    <th>${t.tableThProb}</th>
                    <th>${t.tableThBaseMult}</th>
                    <th>${t.tableThRisk}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="mine-pill">1 ${t.tableThMines.slice(0, -1) || 'Mine'}</span></td>
                    <td>4 / 5</td>
                    <td class="num high">80.00%</td>
                    <td class="num gold">1.20×</td>
                    <td class="muted">${t.riskLow}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">2 ${t.tableThMines}</span></td>
                    <td>3 / 5</td>
                    <td class="num med">60.00%</td>
                    <td class="num gold">1.60×</td>
                    <td class="muted">${t.riskBalanced}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">3 ${t.tableThMines}</span></td>
                    <td>2 / 5</td>
                    <td class="num low">40.00%</td>
                    <td class="num gold">2.40×</td>
                    <td class="muted">${t.riskHigh}</td>
                  </tr>
                  <tr>
                    <td><span class="mine-pill">4 ${t.tableThMines}</span></td>
                    <td>1 / 5</td>
                    <td class="num ext">20.00%</td>
                    <td class="num gold">4.80×</td>
                    <td class="muted">${t.riskExtreme}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="rules-mobile-cards-wrap">
              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">1 ${t.tableThMines.slice(0, -1) || 'Mine'}</span>
                  <span class="rules-mc-risk muted">${t.riskLow}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">4 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num high">80.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">1.20×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">2 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskBalanced}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">3 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num med">60.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">1.60×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">3 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskHigh}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">2 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num low">40.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">2.40×</span>
                </div>
              </div>

              <div class="rules-mini-card">
                <div class="rules-mc-head">
                  <span class="mine-pill">4 ${t.tableThMines}</span>
                  <span class="rules-mc-risk muted">${t.riskExtreme}</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThSafeGates}</span>
                  <span class="rules-mc-v">1 / 5</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThProb}</span>
                  <span class="rules-mc-v num ext">20.00%</span>
                </div>
                <div class="rules-mc-row">
                  <span class="rules-mc-k">${t.tableThBaseMult}</span>
                  <span class="rules-mc-v num gold">4.80×</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Section 3: Tactical Modifiers -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section3Title}</h3>
            <div class="rules-modifiers-grid">
              <div class="rules-mod-card">
                <div class="rules-mod-header">
                  <span class="rules-mod-tag shield">${t.modShieldTitle}</span>
                  <span class="rules-mod-cost">${t.modShieldCost}</span>
                </div>
                <p class="rules-mod-desc">${t.modShieldDesc}</p>
              </div>
              <div class="rules-mod-card">
                <div class="rules-mod-header">
                  <span class="rules-mod-tag gold">${t.modCratesTitle}</span>
                </div>
                <p class="rules-mod-desc">${t.modCratesDesc}</p>
              </div>
              <div class="rules-mod-card full-width">
                <div class="rules-mod-header">
                  <span class="rules-mod-tag ufo">${t.modUfoTitle}</span>
                </div>
                <p class="rules-mod-desc">${t.modUfoDesc}</p>
              </div>
            </div>
          </div>

          <!-- Section 4: VIP Bonuses & Minigames -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.sectionBonusesTitle}</h3>
            <div class="rules-modifiers-grid">
              <div class="rules-mod-card">
                <div class="rules-mod-header">
                  <span class="rules-mod-tag gold">${t.bonusWheelTitle}</span>
                  <span class="rules-mod-cost">${t.bonusWheelCost}</span>
                </div>
                <p class="rules-mod-desc">${t.bonusWheelDesc}</p>
              </div>
              <div class="rules-mod-card">
                <div class="rules-mod-header">
                  <span class="rules-mod-tag purple">${t.bonusSlotTitle}</span>
                  <span class="rules-mod-cost">${t.bonusSlotCost}</span>
                </div>
                <p class="rules-mod-desc">${t.bonusSlotDesc}</p>
              </div>
            </div>
          </div>

          <!-- Section 5: Cashout & Partial Cashout -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section4Title}</h3>
            <div class="rules-cashout-clean-box">
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge space">${t.shortcutSpace}</span>
                <div class="rules-ccb-info">
                  <strong>${t.cashoutTotalTitle}</strong> ${t.cashoutTotalDesc}
                </div>
              </div>
              <div class="rules-ccb-item highlight">
                <span class="rules-ccb-badge key-p">${t.shortcutKeyP}</span>
                <div class="rules-ccb-info">
                  <strong>${t.cashoutPartialTitle}</strong> ${t.cashoutPartialDesc}
                </div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge cap">10,000×</span>
                <div class="rules-ccb-info">
                  <strong>${t.winCapTitle}</strong> ${t.winCapDesc}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 6: Cryptographic Integrity & Provably Fair -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.sectionFairnessTitle}</h3>
            <p class="rules-text">${t.fairnessDesc1}</p>
            <p class="rules-text">${t.fairnessDesc2}</p>
          </div>

          <!-- Section 7: Complete Controls Guide -->
          <div class="rules-section">
            <h3 class="rules-section-title">${t.section5Title}</h3>
            <div class="rules-cashout-clean-box">
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge space">${t.shortcutSpace}</span>
                <div class="rules-ccb-info">${t.ctrlPrimaryBtn}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge key-p">${t.shortcutKeyP}</span>
                <div class="rules-ccb-info">${t.ctrlPartialBtn}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">B</span>
                <div class="rules-ccb-info">${t.ctrlBonusKey}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">½ / 2×</span>
                <div class="rules-ccb-info">${t.ctrlBetAdjust}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">1 – 4</span>
                <div class="rules-ccb-info">${t.ctrlMines}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlPowerups}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlSound}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlFairness}</div>
              </div>
              <div class="rules-ccb-item">
                <span class="rules-ccb-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
                <div class="rules-ccb-info">${t.ctrlRules}</div>
              </div>
            </div>
          </div>

          <!-- Section 8: Official Legal Disclaimer -->
          <div class="rules-section legal">
            <p class="rules-legal-text">${t.disclaimerText}</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="rules-modal-footer">
          <button class="rules-modal-confirm-btn" id="rules-confirm-btn" type="button">
            ${t.rulesUnderstandBtn}
          </button>
        </div>

      </div>
    `;

    // Re-bind listeners
    const closeBtn = document.getElementById('rules-close-btn');
    const confirmBtn = document.getElementById('rules-confirm-btn');
    const backdrop = document.getElementById('rules-backdrop');
    const modalWindow = document.getElementById('rules-modal-window');

    closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        hideRulesModal();
    });

    confirmBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        hideRulesModal();
    });

    backdrop?.addEventListener('click', (e) => {
        e.stopPropagation();
        hideRulesModal();
    });

    modalWindow?.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

export function createRulesModal(_container?: HTMLElement) {
    let modalRoot = document.getElementById('rules-modal-overlay');
    if (modalRoot) return;

    modalRoot = document.createElement('div');
    modalRoot.id = 'rules-modal-overlay';
    modalRoot.className = 'rules-modal-overlay';
    document.body.appendChild(modalRoot);

    renderRulesModalContent();

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isRulesModalOpen()) {
            e.preventDefault();
            hideRulesModal();
        }
    });
}
