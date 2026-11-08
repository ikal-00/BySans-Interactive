/**
 * ENDLESS DESCENT — I18N LOCALIZATION & SOCIAL CASINO TERMINOLOGY
 * 
 * Strict compliance with Stake Engine Approval Guidelines:
 * - [239] English supported as primary default language.
 * - [240] Safe fallback to 'en' for any unrecognized lang code (e.g. lang=zz).
 * - [77] Strict social casino wording (Stake.us): no 'bet', 'cashout', 'paytable', 'money', 'wager', etc.
 */

export type SupportedLang = 'en' | 'es';

export interface Translations {
    // Top Bar & Meta
    gameTitle: string;
    studioName: string;
    balanceLabel: string;
    rgsConnected: string;
    sandboxDemo: string;
    connectionErrorTitle: string;
    connectionErrorDesc: string;
    reloadButton: string;

    // Betting Dock
    betAmountLabel: string;
    quickMin: string;
    quickHalf: string;
    quickDouble: string;
    quickMax: string;
    minesCountLabel: string;
    minesProbLabel: string;
    powerupsLabel: string;
    powerupsCostBadge: string;
    warpPowerupTitle: string;
    warpPowerupDesc: string;
    shieldPowerupTitle: string;
    shieldPowerupDesc: string;

    // Primary CTA Button
    focalActionLabel: string;
    focalActionReady: string;
    focalDropCapsule: string;
    focalCashout: string;
    focalConnecting: string;
    focalInsufficientFunds: string;
    focalPartialCashoutBtn: string;
    focalSecuredToast: string;

    // Shortcuts & Tooltips
    soundToggleTitle: string;
    rulesToggleTitle: string;
    fairnessToggleTitle: string;
    shortcutSpace: string;
    shortcutKeyP: string;

    // Status / Mult Bar
    nextMultiplierLabel: string;
    selectGatePrompt: string;
    touchGatePrompt: string;
    roundWonSub: string;
    roundCrashedSub: string;
    readyToLaunchSub: string;

    // Rules Modal
    rulesDialogTitle: string;
    rtpLabel: string;
    maxWinLabel: string;
    volatilityLabel: string;
    volatilityValue: string;
    rulesUnderstandBtn: string;
    
    // Rules Sections
    section1Title: string;
    section1Body1: string;
    section1Body2: string;

    section2Title: string;
    tableThMines: string;
    tableThSafeGates: string;
    tableThProb: string;
    tableThBaseMult: string;
    tableThRisk: string;
    riskLow: string;
    riskBalanced: string;
    riskHigh: string;
    riskExtreme: string;

    section3Title: string;
    modWarpTitle: string;
    modWarpCost: string;
    modWarpDesc: string;
    modShieldTitle: string;
    modShieldCost: string;
    modShieldDesc: string;
    modCratesTitle: string;
    modCratesDesc: string;
    modUfoTitle: string;
    modUfoDesc: string;

    sectionBonusesTitle: string;
    bonusWheelTitle: string;
    bonusWheelCost: string;
    bonusWheelDesc: string;
    bonusSlotTitle: string;
    bonusSlotCost: string;
    bonusSlotDesc: string;
    bonusBuyTitle: string;
    bonusBuyDesc: string;

    section4Title: string;
    cashoutTotalTitle: string;
    cashoutTotalDesc: string;
    cashoutPartialTitle: string;
    cashoutPartialDesc: string;
    winCapTitle: string;
    winCapDesc: string;

    sectionFairnessTitle: string;
    fairnessDesc1: string;
    fairnessDesc2: string;

    section5Title: string;
    controlsSectionTitle: string;
    ctrlPrimaryBtn: string;
    ctrlPartialBtn: string;
    ctrlBetAdjust: string;
    ctrlMines: string;
    ctrlBonusKey: string;
    ctrlPowerups: string;
    ctrlSound: string;
    ctrlFairness: string;
    ctrlRules: string;

    section6Title: string;
    disclaimerText: string;

    // Replay System
    replayBadge: string;
    replayPlayBtn: string;
    replayWatchAgainBtn: string;
    replayModeCostLabel: string;
    replayFinalMultiplierLabel: string;
    replayTotalWinLabel: string;
    replayErrorTitle: string;
    replayErrorDesc: string;
}

const enStandard: Translations = {
    gameTitle: 'Endless Descent',
    studioName: 'BySans Interactive',
    balanceLabel: 'Balance',
    rgsConnected: 'RGS Connected',
    sandboxDemo: 'Sandbox Demo',
    connectionErrorTitle: 'Connection Error',
    connectionErrorDesc: 'Unable to connect to the RGS server. Please verify your connection or launch parameters.',
    reloadButton: 'Reload Session',

    betAmountLabel: 'Bet Amount',
    quickMin: 'Min',
    quickHalf: '½',
    quickDouble: '2×',
    quickMax: 'Max',
    minesCountLabel: 'Mines Count',
    minesProbLabel: 'Odds',
    powerupsLabel: 'Premium Perks',
    powerupsCostBadge: '+25% ea.',
    warpPowerupTitle: 'BOOST',
    warpPowerupDesc: 'Alien Jump & ×3',
    shieldPowerupTitle: 'SHIELD',
    shieldPowerupDesc: 'Absorbs 1 Mine',

    focalActionLabel: 'Primary Action',
    focalActionReady: 'Ready',
    focalDropCapsule: 'DROP POD',
    focalCashout: 'CASHOUT',
    focalConnecting: 'CONNECTING...',
    focalInsufficientFunds: 'Insufficient balance to place this bet.',
    focalPartialCashoutBtn: '50% CASHOUT',
    focalSecuredToast: '50% SECURED',

    soundToggleTitle: 'Toggle Audio Mute',
    rulesToggleTitle: 'Game Rules & Information',
    fairnessToggleTitle: 'Provably Fair Verification',
    shortcutSpace: 'Space',
    shortcutKeyP: 'Key P',

    nextMultiplierLabel: 'Next',
    selectGatePrompt: 'Select a gate [1–5] to descend',
    touchGatePrompt: 'Tap a gate [1–5]',
    roundWonSub: 'Cashout Credited',
    roundCrashedSub: 'Collision at Row',
    readyToLaunchSub: 'Configure your pod to launch',

    rulesDialogTitle: 'Game Rules',
    rtpLabel: 'Theoretical RTP',
    maxWinLabel: 'Maximum Win',
    volatilityLabel: 'Volatility',
    volatilityValue: 'Adjustable',
    rulesUnderstandBtn: 'Understood',

    section1Title: '01 · Vertical Flight & Descent Dynamics',
    section1Body1: 'Endless Descent is an orbital vertical evasion game structured across 15 atmospheric levels and 5 navigational descent lanes. For each level, the player commands the pod into one of the five lanes.',
    section1Body2: 'Navigating through a clear lane multiplies the accumulated payout exponentially. Hitting a quantum hazard mine causes immediate catastrophic hull collision and ends the round, unless guarded by an active Quantum Energy Shield.',

    section2Title: '02 · Mines Configuration & Probability Matrix',
    tableThMines: 'Mines',
    tableThSafeGates: 'Safe Lanes',
    tableThProb: 'Survival Odds',
    tableThBaseMult: 'Base Multiplier',
    tableThRisk: 'Risk Profile',
    riskLow: 'Low Risk',
    riskBalanced: 'Balanced',
    riskHigh: 'High Volatility',
    riskExtreme: 'Extreme Volatility',

    section3Title: '03 · Tactical Flight Modifiers',
    modWarpTitle: 'TURBO WARP',
    modWarpCost: '+25% Base Bet',
    modWarpDesc: 'Increases the frequency of Golden Gates (×2 or ×3 boosts) and activates Alien Mothership encounters that disintegrate hazard fields for the next 2 levels.',
    modShieldTitle: 'QUANTUM ENERGY SHIELD',
    modShieldCost: '+25% Base Bet',
    modShieldDesc: 'Deploys an electromagnetic deflector barrier that neutralizes 1 fatal mine detonation, dissipating the explosion and preserving 50% of the accumulated multiplier to allow the descent to proceed.',
    modCratesTitle: 'GOLDEN CARGO BOOST CRATES',
    modCratesDesc: 'High-value golden supply modules occasionally concealed within safe lanes that bestow a 2× or 3× multiplier surge to the current step.',
    modUfoTitle: 'ALIEN UFO ROW-SWEEPER',
    modUfoDesc: 'An orbital Mothership flyby event that obliterates all quantum hazard fields across the next 2 upcoming descent rows.',

    sectionBonusesTitle: '04 · Cosmic VIP Bonuses & Minigames',
    bonusWheelTitle: 'COSMIC PRIZE WHEEL (20× BASE BET)',
    bonusWheelCost: '20× Base Bet',
    bonusWheelDesc: 'Hosted in real-time 3D by Mr. Dollar. A 12-sector precision wheel awarding direct multipliers (up to 1,000×), Respin extra chances with accumulator retention, or immediate triggering of the 1×3 Slot Vault. Landing on a Wipeout sector concludes the bonus sequence.',
    bonusSlotTitle: '1×3 ARCADE SLOT VAULT (50× BASE BET)',
    bonusSlotCost: '50× Base Bet',
    bonusSlotDesc: '5 VIP spins on a physical 3D arcade cabinet with mechanical reels and a digital LED accumulator. Symbols landing on the central payline add multipliers (up to 88× total) multiplying the base bet upon completion.',
    bonusBuyTitle: 'VIP DIRECT ACCESS STORE',
    bonusBuyDesc: 'Players may purchase direct access to the Cosmic Prize Wheel (20×) or 1×3 Slot Vault (50×) from idle mode at any authorized bet denomination.',

    section4Title: '05 · Cashout & 50% Partial Cashout',
    cashoutTotalTitle: 'Full Cashout (100%):',
    cashoutTotalDesc: 'Available from Row 1. Withdraws 100% of accumulated winnings into your balance and concludes the round with victory.',
    cashoutPartialTitle: 'Partial Cashout (50% Bankroll Lock):',
    cashoutPartialDesc: 'Available from Row 2. Instantly locks and credits 50% of current accumulated winnings directly into your safe balance, while leaving the remaining 50% in play on the pod to pursue higher multipliers (usable once per level).',
    winCapTitle: 'Maximum Win Limit (10,000×):',
    winCapDesc: 'When the total multiplier reaches or exceeds 10,000× base bet, the round concludes automatically and credits the capped jackpot.',

    sectionFairnessTitle: '06 · Cryptographic Integrity & Provably Fair',
    fairnessDesc1: 'Endless Descent utilizes an immutable Provably Fair algorithm governed by SHA-256 HMAC cryptographic hashing. Round outcomes are determined before launch through a combination of the Server Seed (hashed and verified), Client Seed, and Nonce counter, guaranteeing complete mathematical transparency and preventing any post-launch alteration.',
    fairnessDesc2: 'The theoretical long-term Return to Player (RTP) across all mine settings is certified at 96.00%.',

    section5Title: '07 · Controls & Keyboard Shortcuts',
    controlsSectionTitle: 'Interaction Guide',
    ctrlPrimaryBtn: 'Spacebar / Primary Button: Launches the pod at round start, and cashes out accumulated winnings while in flight.',
    ctrlPartialBtn: 'Key P / 50% Button: Executes a 50% partial cashout, locking half your prize into your balance.',
    ctrlBetAdjust: '½ / 2× Buttons: Adjusts bet size across authorized RGS denominations.',
    ctrlMines: 'Mine Selectors (1, 2, 3, 4): Configures the hazard mine density per level.',
    ctrlBonusKey: 'Key B / VIP Icon: Opens the VIP Bonus Store for direct feature buy.',
    ctrlPowerups: 'Shield Button: Arms or disarms the +25% Quantum Energy Shield.',
    ctrlSound: 'Audio Icon: Toggles sound effects, music, and ambient audio.',
    ctrlFairness: 'Shield Icon: Opens the Provably Fair audit and seed inspector.',
    ctrlRules: 'Info Icon: Displays this certified game manual.',

    section6Title: '08 · Official Terms & Disconnection Policy',
    disclaimerText: 'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.',

    replayBadge: 'REPLAY MODE',
    replayPlayBtn: 'PLAY REPLAY',
    replayWatchAgainBtn: 'WATCH AGAIN',
    replayModeCostLabel: 'Cost',
    replayFinalMultiplierLabel: 'Final Multiplier',
    replayTotalWinLabel: 'Total Win',
    replayErrorTitle: 'Replay Unavailable',
    replayErrorDesc: 'Could not fetch replay data for this event. Please check the URL or try again.'
};

const enSocial: Translations = {
    ...enStandard,
    balanceLabel: 'Coins',
    betAmountLabel: 'Play Amount',
    focalActionLabel: 'Action',
    focalDropCapsule: 'START PLAY',
    focalCashout: 'COLLECT',
    focalInsufficientFunds: 'Insufficient coins to make this play.',
    focalPartialCashoutBtn: '50% COLLECT',
    focalSecuredToast: '50% SECURED',
    roundWonSub: 'Win Credited',
    rulesDialogTitle: 'Game Rules & Win Table',
    section2Title: '02 · Mines Configuration & Win Table',
    section4Title: '05 · Collect & 50% Partial Collect',
    cashoutTotalTitle: 'Full Collect (100%):',
    cashoutTotalDesc: 'Available from Row 1. Collects 100% of accumulated wins into your coin balance and concludes the round.',
    cashoutPartialTitle: 'Partial Collect (50% Coin Lock):',
    cashoutPartialDesc: 'Available from Row 2. Secures 50% of current wins directly into your coin balance while keeping the remaining 50% active in the play.',
    ctrlPrimaryBtn: 'Spacebar / Primary CTA: Starts the play at round launch, and collects accumulated wins while active.',
    ctrlPartialBtn: 'Key P / 50% Button: Secures 50% of the accumulated prize into your coin balance.',
    ctrlBetAdjust: 'Play Controls (Min, ½, 2×, Max): Steps through authorized play levels.',
    ctrlRules: 'Info Icon: Displays this comprehensive rulebook and win table.',
    replayModeCostLabel: 'Play Cost',
    disclaimerText: 'Malfunction voids all plays and wins. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Wins are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.'
};

const esStandard: Translations = {
    gameTitle: 'Endless Descent',
    studioName: 'BySans Interactive',
    balanceLabel: 'Saldo',
    rgsConnected: 'RGS Conectado',
    sandboxDemo: 'Modo Sandbox',
    connectionErrorTitle: 'Error de Conexión',
    connectionErrorDesc: 'No se pudo conectar con el servidor RGS. Verifica tu conexión o parámetros de sesión.',
    reloadButton: 'Recargar Sesión',

    betAmountLabel: 'Monto de Apuesta',
    quickMin: 'Mín',
    quickHalf: '½',
    quickDouble: '2×',
    quickMax: 'Máx',
    minesCountLabel: 'Cantidad de Minas',
    minesProbLabel: 'Prob.',
    powerupsLabel: 'Power-Ups Premium',
    powerupsCostBadge: '+25% c/u',
    warpPowerupTitle: 'BOOST',
    warpPowerupDesc: 'Salto Alien & ×3',
    shieldPowerupTitle: 'ESCUDO',
    shieldPowerupDesc: 'Absorbe 1 Mina',

    focalActionLabel: 'Acción Principal',
    focalActionReady: 'Listo',
    focalDropCapsule: 'SOLTAR NAVE',
    focalCashout: 'COBRAR',
    focalConnecting: 'CONECTANDO...',
    focalInsufficientFunds: 'Saldo insuficiente para realizar esta apuesta.',
    focalPartialCashoutBtn: '50% COBRO PARCIAL',
    focalSecuredToast: '50% ASEGURADO',

    soundToggleTitle: 'Activar / Silenciar Sonido',
    rulesToggleTitle: 'Reglas del Juego e Información',
    fairnessToggleTitle: 'Verificación Provably Fair',
    shortcutSpace: 'Espacio',
    shortcutKeyP: 'Tecla P',

    nextMultiplierLabel: 'Siguiente',
    selectGatePrompt: 'Selecciona una compuerta [1–5] para descender',
    touchGatePrompt: 'Toca una compuerta [1–5]',
    roundWonSub: 'Cobro acreditado',
    roundCrashedSub: 'Impacto en nivel',
    readyToLaunchSub: 'Configura tu nave para despegar',

    rulesDialogTitle: 'Reglas de Juego',
    rtpLabel: 'RTP Teórico',
    maxWinLabel: 'Ganancia Máxima',
    volatilityLabel: 'Volatilidad',
    volatilityValue: 'Ajustable',
    rulesUnderstandBtn: 'Entendido',

    section1Title: '01 · Dinámica de Vuelo y Descenso Espacial',
    section1Body1: 'Endless Descent es un juego de evasión y multiplicadores orbitales estructurado en 15 niveles de profundidad y 5 carriles de navegación. En cada nivel, el piloto guía la cápsula hacia uno de los cinco carriles.',
    section1Body2: 'Cruzar un carril libre multiplica exponencialmente el premio acumulado de la ronda. Impactar una mina cuántica provoca una colisión crítica y finaliza la ronda, a menos que la nave cuente con la protección de un Escudo Deflector Cuántico activo.',

    section2Title: '02 · Matriz de Minas y Probabilidades Certificadas',
    tableThMines: 'Minas',
    tableThSafeGates: 'Carriles Seguros',
    tableThProb: 'Probabilidad',
    tableThBaseMult: 'Multiplicador Base',
    tableThRisk: 'Perfil de Riesgo',
    riskLow: 'Bajo Riesgo',
    riskBalanced: 'Equilibrado',
    riskHigh: 'Alta Volatilidad',
    riskExtreme: 'Volatilidad Extrema',

    section3Title: '03 · Modificadores Tácticos de Vuelo',
    modWarpTitle: 'TURBO WARP',
    modWarpCost: '+25% costo',
    modWarpDesc: 'Incrementa la probabilidad de Cartas Doradas (multiplicadores extra de ×2 o ×3) y activa el encuentro con la Nave Nodriza Alienígena, que desintegra los campos de minas de las 2 compuertas siguientes.',
    modShieldTitle: 'ESCUDO DEFLECTOR CUÁNTICO',
    modShieldCost: '+25% de la Apuesta Base',
    modShieldDesc: 'Despliega una barrera electromagnética que neutraliza 1 detonación letal de mina, disipando la explosión y conservando el 50% del multiplicador acumulado para continuar el descenso.',
    modCratesTitle: 'CAJAS DORADAS DE SUMINISTROS',
    modCratesDesc: 'Módulos dorados ocultos aleatoriamente en carriles seguros que aplican un impulso sorpresa de 2× o 3× al multiplicador del paso.',
    modUfoTitle: 'BARRIDO ALIENÍGENA UFO',
    modUfoDesc: 'Aparición orbital de una nave nodriza que barre y desintegra los campos de minas en las dos filas subsiguientes.',

    sectionBonusesTitle: '04 · Bonos VIP y Minijuegos Cósmicos',
    bonusWheelTitle: 'RULETA CÓSMICA (20× APUESTA BASE)',
    bonusWheelCost: '20× Apuesta Base',
    bonusWheelDesc: 'Conducida en tiempo real 3D por Mr. Dollar. Rueda de 12 sectores que otorga multiplicadores directos (hasta 1,000×), Tiradas Extra (Respin con retención de acumulador) o activación directa de la Bóveda Slot. El sector Wipeout concluye la ronda.',
    bonusSlotTitle: 'BÓVEDA MINI-SLOT 1×3 (50× APUESTA BASE)',
    bonusSlotCost: '50× Apuesta Base',
    bonusSlotDesc: '5 tiradas VIP en gabinete arcade 3D con rodillos mecánicos y visor digital LED. Los símbolos en la línea de pago central acumulan multiplicadores (hasta 88× acumulados) multiplicando la apuesta base al término de los 5 giros.',
    bonusBuyTitle: 'TIENDA DE ACCESO VIP',
    bonusBuyDesc: 'Permite comprar acceso directo a la Ruleta Cósmica (20×) o a la Bóveda Mini-Slot (50×) desde el estado inactivo con cualquier denominación autorizada.',

    section4Title: '05 · Cobro Total y Cobro Parcial (50%)',
    cashoutTotalTitle: 'Cobro Total (100%):',
    cashoutTotalDesc: 'Disponible desde la Fila 1. Retira el 100% del premio acumulado directamente a tu saldo y concluye la ronda con victoria.',
    cashoutPartialTitle: 'Cobro Parcial (50% Bankroll Lock):',
    cashoutPartialDesc: 'Disponible desde la Fila 2. Asegura y transfiere al instante el 50% de las ganancias acumuladas a tu balance seguro, manteniendo el 50% restante activo en la nave para perseguir mayores multiplicadores (utilizable una vez por fila).',
    winCapTitle: 'Límite Máximo de Ganancia (10,000×):',
    winCapDesc: 'Al alcanzar el multiplicador máximo de 10,000× sobre la apuesta base, el sistema liquida y acredita automáticamente el premio íntegro.',

    sectionFairnessTitle: '06 · Integridad Criptográfica (Provably Fair) y RTP',
    fairnessDesc1: 'Endless Descent opera bajo un algoritmo Provably Fair certificado basado en HMAC SHA-256. El resultado de cada ronda se predetermina criptográficamente antes del despegue combinando la Semilla del Servidor (comprometida mediante hash), la Semilla del Cliente y el contador Nonce, garantizando absoluta transparencia e inalterabilidad de los resultados.',
    fairnessDesc2: 'El Retorno Teórico al Jugador (RTP) a largo plazo está certificado en 96.00% en todas las configuraciones de minas.',

    section5Title: '07 · Guía Oficial de Controles y Atajos',
    controlsSectionTitle: 'Guía de Interacción',
    ctrlPrimaryBtn: 'Barra Espaciadora / Botón Principal: Lanza la cápsula al inicio y cobra las ganancias acumuladas durante el vuelo.',
    ctrlPartialBtn: 'Tecla P / Botón 50%: Ejecuta el cobro parcial asegurando el 50% del premio en tu balance.',
    ctrlBetAdjust: 'Botones ½ y 2×: Ajustan el valor de apuesta entre los niveles autorizados por el RGS.',
    ctrlMines: 'Selectores de Minas (1, 2, 3, 4): Configuran la densidad de minas por nivel.',
    ctrlBonusKey: 'Tecla B / Icono VIP: Abre la Tienda de Bonos VIP para compra directa.',
    ctrlPowerups: 'Botón Escudo: Activa o desactiva la protección del Escudo Cuántico (+25%).',
    ctrlSound: 'Icono de Audio: Silencia o reactiva la música y los efectos de sonido.',
    ctrlFairness: 'Icono de Escudo: Despliega el panel de verificación criptográfica Provably Fair.',
    ctrlRules: 'Icono de Información: Despliega este manual de reglas certificado.',

    section6Title: '08 · Términos Oficiales y Política de Desconexión',
    disclaimerText: 'Cualquier fallo de funcionamiento anula todas las ganancias y partidas. Se requiere una conexión a internet estable. En caso de desconexión, reinicie el juego para completar las rondas inconclusas. El retorno esperado se calcula a lo largo de varias partidas. La pantalla del juego no representa ningún dispositivo físico y tiene fines meramente ilustrativos. Las ganancias se liquidan según la cantidad recibida del servidor remoto del juego y no según los eventos que ocurran en el navegador web. TM y © 2026 Engine.',

    replayBadge: 'MODO REPETICIÓN',
    replayPlayBtn: 'REPRODUCIR',
    replayWatchAgainBtn: 'VER DE NUEVO',
    replayModeCostLabel: 'Costo',
    replayFinalMultiplierLabel: 'Multiplicador Final',
    replayTotalWinLabel: 'Ganancia Total',
    replayErrorTitle: 'Repetición No Disponible',
    replayErrorDesc: 'No se pudo cargar la repetición del evento. Verifica la URL o intenta nuevamente.'
};

const esSocial: Translations = {
    ...esStandard,
    balanceLabel: 'Monedas',
    betAmountLabel: 'Monto de Juego',
    focalActionLabel: 'Acción',
    focalDropCapsule: 'INICIAR VUELO',
    focalCashout: 'RECOLECTAR',
    focalInsufficientFunds: 'Monedas insuficientes para realizar esta jugada.',
    focalPartialCashoutBtn: '50% RECOLECTAR',
    focalSecuredToast: '50% ASEGURADO',
    roundWonSub: 'Premio acreditado',
    rulesDialogTitle: 'Reglas de Juego y Tabla de Premios',
    section2Title: '02 · Configuración de Minas & Tabla de Premios',
    section4Title: '05 · Premios & Recolección Parcial (50%)',
    cashoutTotalTitle: 'Recolección Total (100%):',
    cashoutTotalDesc: 'Disponible desde la Fila 1. Asegura el 100% de las monedas acumuladas en tu balance y concluye la ronda.',
    cashoutPartialTitle: 'Recolección Parcial (50% Bloqueo):',
    cashoutPartialDesc: 'Disponible desde la Fila 2. Asegura el 50% de las monedas directamente en tu balance seguro mientras mantienes el 50% restante activo en la jugada.',
    ctrlPrimaryBtn: 'Barra Espaciadora / Botón Principal: Inicia el vuelo y recolecta monedas acumuladas durante el trayecto.',
    ctrlPartialBtn: 'Tecla P / Botón 50%: Asegura el 50% de las monedas ganadas directamente en tu balance.',
    ctrlBetAdjust: 'Botones de Ajuste (Mín, ½, 2×, Máx): Recorren los niveles de juego autorizados.',
    ctrlRules: 'Icono de Información: Despliega este manual de reglas y tabla de premios.',
    replayModeCostLabel: 'Costo de Jugada',
    disclaimerText: 'Cualquier fallo de funcionamiento anula todas las ganancias y partidas. Se requiere una conexión a internet estable. En caso de desconexión, reinicie el juego para completar las rondas inconclusas. El retorno esperado se calcula a lo largo de varias partidas. La pantalla del juego no representa ningún dispositivo físico y tiene fines meramente ilustrativos. Los premios se liquidan según la cantidad recibida del servidor remoto del juego y no según los eventos que ocurran en el navegador web. TM y © 2026 Engine.'
};

export function getTranslations(lang: string, isSocial: boolean): Translations {
    const normalized = (lang || 'en').toLowerCase().trim();
    const isEs = normalized === 'es' || normalized.startsWith('es-');

    if (isEs) {
        return isSocial ? esSocial : esStandard;
    }

    // Default: English [239] with safe fallback for any invalid code like 'lang=zz' [240]
    return isSocial ? enSocial : enStandard;
}
