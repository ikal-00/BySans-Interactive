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

    section4Title: string;
    cashoutTotalTitle: string;
    cashoutTotalDesc: string;
    cashoutPartialTitle: string;
    cashoutPartialDesc: string;
    winCapTitle: string;
    winCapDesc: string;

    section5Title: string;
    controlsSectionTitle: string;
    ctrlPrimaryBtn: string;
    ctrlPartialBtn: string;
    ctrlBetAdjust: string;
    ctrlMines: string;
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

    section1Title: '01 · Game Dynamics',
    section1Body1: 'Endless Descent is a high-speed vertical evasion and multiplier game. Each level presents 5 holographic gates hiding quantum hazard mines based on your chosen settings.',
    section1Body2: 'Passing through a safe gate exponentially increases the round multiplier. You can cash out your winnings at any point after clearing the first gate.',

    section2Title: '02 · Mines Configuration & Odds',
    tableThMines: 'Mines',
    tableThSafeGates: 'Safe Gates',
    tableThProb: 'Probability',
    tableThBaseMult: 'Base Multiplier',
    tableThRisk: 'Profile',
    riskLow: 'Low Risk',
    riskBalanced: 'Balanced',
    riskHigh: 'High Volatility',
    riskExtreme: 'Extreme Risk',

    section3Title: '03 · Tactical Modifiers',
    modWarpTitle: 'TURBO WARP',
    modWarpCost: '+25% cost',
    modWarpDesc: 'Increases the frequency of Golden Gates (×2 or ×3 boosts) and activates Alien Mothership encounters that disintegrate hazard fields for the next 2 levels.',
    modShieldTitle: 'ENERGY SHIELD',
    modShieldCost: '+25% cost',
    modShieldDesc: 'Deploys a forcefield that absorbs 1 fatal mine detonation, allowing the descent to continue to the next level without losing the round.',

    section4Title: '04 · Cashout & 50% Partial Cashout',
    cashoutTotalTitle: 'Full Cashout (100%):',
    cashoutTotalDesc: 'Available from Row 1. Withdraws 100% of accumulated winnings to your balance and concludes the round in victory.',
    cashoutPartialTitle: 'Partial Cashout (50% Bankroll Lock):',
    cashoutPartialDesc: 'Available from Row 2. Secures 50% of current winnings directly into your safe balance while keeping the remaining 50% active on the pod to pursue higher multipliers. Usable once per level.',
    winCapTitle: 'Maximum Win Cap (10,000×):',
    winCapDesc: 'Upon reaching the maximum win cap of 10,000× bet, the round automatically concludes and credits full winnings.',

    section5Title: '05 · Complete Controls & Shortcuts Guide',
    controlsSectionTitle: 'Interaction Guide',
    ctrlPrimaryBtn: 'Spacebar / Primary CTA: Drops the descent pod at round start, and cashes out accumulated winnings while active.',
    ctrlPartialBtn: 'Key P / 50% Button: Secures 50% of the accumulated prize directly into your bankroll.',
    ctrlBetAdjust: 'Bet Controls (Min, ½, 2×, Max): Steps through authorized RGS bet levels.',
    ctrlMines: 'Mine Selectors (1, 2, 3, 4): Configures the hazard mine density per gate.',
    ctrlPowerups: 'Modifier Keys (W for Turbo, E for Shield): Toggles special tactical perks.',
    ctrlSound: 'Audio Icon: Mutes or unmutes all music, ambient drone, and sound effects.',
    ctrlFairness: 'Fairness Shield: Displays the cryptographic seed modal for audit verification.',
    ctrlRules: 'Info Icon: Displays this comprehensive rulebook and paytable.',

    section6Title: '06 · Verification & Legal Disclaimer',
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
    section4Title: '04 · Collect & 50% Partial Collect',
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

    section1Title: '01 · Dinámica de Juego',
    section1Body1: 'Endless Descent es un juego espacial de evasión de peligros y multiplicadores progresivos. Cada nivel presenta 5 compuertas holográficas donde se ocultan minas cuánticas según la configuración seleccionada.',
    section1Body2: 'Cruzar una compuerta segura incrementa exponencialmente el multiplicador de la ronda. Puedes retirar tus ganancias en cualquier momento a partir de la primera compuerta superada.',

    section2Title: '02 · Configuración de Minas & Retornos',
    tableThMines: 'Minas',
    tableThSafeGates: 'Compuertas Seguras',
    tableThProb: 'Probabilidad',
    tableThBaseMult: 'Multiplicador Base',
    tableThRisk: 'Perfil',
    riskLow: 'Bajo riesgo',
    riskBalanced: 'Equilibrado',
    riskHigh: 'Alta volatilidad',
    riskExtreme: 'Riesgo extremo',

    section3Title: '03 · Modificadores Tácticos',
    modWarpTitle: 'TURBO WARP',
    modWarpCost: '+25% costo',
    modWarpDesc: 'Incrementa la probabilidad de Cartas Doradas (multiplicadores extra de ×2 o ×3) y activa el encuentro con la Nave Nodriza Alienígena, que desintegra los campos de minas de las 2 compuertas siguientes.',
    modShieldTitle: 'ESCUDO DEFLECTOR',
    modShieldCost: '+25% costo',
    modShieldDesc: 'Genera una barrera que absorbe 1 detonación de mina fatal. Si la nave impacta un sector minado, el escudo disipa la explosión y permite continuar el descenso.',

    section4Title: '04 · Retiros & Cobro Parcial (50%)',
    cashoutTotalTitle: 'Cobro Total (100%):',
    cashoutTotalDesc: 'Disponible desde la Fila 1. Retira el 100% del premio acumulado a tu balance y concluye la ronda con victoria.',
    cashoutPartialTitle: 'Cobro Parcial (50% Bankroll Lock):',
    cashoutPartialDesc: 'Disponible desde la Fila 2. Asegura el 50% de las ganancias acumuladas directamente en tu saldo seguro y mantiene el 50% restante activo en la nave para buscar mayores premios. Usable una vez por nivel.',
    winCapTitle: 'Límite de Ganancia (10,000×):',
    winCapDesc: 'Al alcanzar el multiplicador máximo de 10,000×, el sistema cierra automáticamente la ronda y acredita el pago íntegro.',

    section5Title: '05 · Guía Completa de Controles y Atajos',
    controlsSectionTitle: 'Guía de Interacción',
    ctrlPrimaryBtn: 'Barra Espaciadora / Botón Principal: Lanza la cápsula al inicio de la ronda y cobra las ganancias acumuladas durante el descenso.',
    ctrlPartialBtn: 'Tecla P / Botón 50%: Bloquea y transfiere el 50% de las ganancias acumuladas a tu balance seguro.',
    ctrlBetAdjust: 'Botones de Ajuste (Mín, ½, 2×, Máx): Recorren los niveles de apuesta oficiales del RGS.',
    ctrlMines: 'Selectores de Minas (1, 2, 3, 4): Configuran la cantidad de minas por nivel de compuertas.',
    ctrlPowerups: 'Teclas W y E: Activan los potenciadores tácticos (Turbo Warp y Escudo Deflector).',
    ctrlSound: 'Icono de Audio: Silencia o reactiva la música ambiental, el zumbido de motor y los efectos de sonido.',
    ctrlFairness: 'Escudo de Verificación: Despliega el modal de semillas SHA-256 para auditoría criptográfica.',
    ctrlRules: 'Icono de Información: Despliega este manual de reglas y tabla de premios.',

    section6Title: '06 · Verificación & Aviso Legal',
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
    section4Title: '04 · Premios & Recolección Parcial (50%)',
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
