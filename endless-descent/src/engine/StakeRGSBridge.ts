/**
 * STAKE ENGINE RGS (Remote Gaming Server) INTEGRATION BRIDGE
 * 
 * Official Stake Engine RGS client & dual-mode session adapter:
 * - Session Authentication (/wallet/authenticate)
 * - Real-time Balance Sync (/wallet/balance)
 * - Bet Execution (/wallet/play)
 * - Round Settlement & Cashout (/wallet/end-round)
 * - Official Replay Engine (GET /bet/replay/{game}/{version}/{mode}/{event})
 * 
 * Strict Compliance with Stake Engine Approval Guidelines:
 * - [181] Authenticates with RGS on launch via query params
 * - [274] Fails correctly with connection/auth error if rgs_url is invalid
 * - [183] Sends correct micro-unit play requests
 * - [242] Full support for dynamic minBet, maxBet, stepBet, defaultBetLevel & betLevels
 * - [187] Restores bet amount and active state from unfinished rounds
 * - [219] Precise multi-currency formatting (USD, EUR, CAD, MXN, JPY, XSC, XGC)
 * - [273] Sub-cent payout accuracy without premature rounding
 * - [221] Conditional end-round dispatch (only for >0x open rounds)
 * - [77/78] Strict social currency & terminology adaptation
 * - [171-174, 243] Comprehensive Replay Mode implementation
 */

export const API_AMOUNT_MULTIPLIER = 1_000_000;

export interface StakeBetConfig {
    minBet: number;
    maxBet: number;
    stepBet: number;
    defaultBetLevel: number;
    betLevels: number[];
}

export interface StakeActiveRound {
    roundID?: number;
    amount: number;
    payoutMultiplier?: number;
    active: boolean;
    state?: unknown[];
}

export interface StakeSessionConfig {
    sessionID: string | null;
    rgsUrl: string | null;
    currency: string;
    language: string;
    device: string;
    isLiveRGS: boolean;
    isSocial: boolean;
    isReplay: boolean;
    hasRgsParam: boolean;
    replayParams?: {
        game: string;
        version: string;
        mode: string;
        event: string;
        amount: number; // in standard currency units
        currency: string;
        language: string;
        social: boolean;
        device: string;
    };
}

export interface StakeAuthResult {
    success: boolean;
    balance: number;
    currency: string;
    config: StakeBetConfig;
    activeRound?: StakeActiveRound;
    isConnectionError?: boolean;
    statusCode?: string;
    errorMessage?: string;
}

export interface StakePlayResult {
    success: boolean;
    roundID?: number;
    payoutMultiplier?: number;
    balance?: number;
    state?: unknown[];
    statusCode?: string;
    errorMessage?: string;
}

export interface StakeEndRoundResult {
    success: boolean;
    balance?: number;
    statusCode?: string;
    errorMessage?: string;
}

export interface StakeReplayData {
    success: boolean;
    payoutMultiplier?: number;
    costMultiplier?: number;
    state?: unknown[];
    errorMessage?: string;
}

class StakeRGSBridgeManager {
    public session: StakeSessionConfig = {
        sessionID: null,
        rgsUrl: null,
        currency: 'USD',
        language: 'en',
        device: 'desktop',
        isLiveRGS: false,
        isSocial: false,
        isReplay: false,
        hasRgsParam: false
    };

    public activeBalance: number = 250.0;
    public currentRoundID: number | null = null;
    public betConfig: StakeBetConfig = {
        minBet: 0.10,
        maxBet: 100.00,
        stepBet: 0.10,
        defaultBetLevel: 1.00,
        betLevels: [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]
    };
    public activeRoundData: StakeActiveRound | null = null;
    public isInitialized: boolean = false;

    constructor() {
        this.parseUrlParameters();
    }

    /**
     * Parses official Stake Engine URL query parameters:
     * Launch: ?sessionID=...&rgs_url=...&currency=USD&lang=en&device=desktop&social=false
     * Replay: ?replay=true&game=...&version=...&mode=...&event=...&rgs_url=...&amount=...
     */
    public parseUrlParameters(): StakeSessionConfig {
        if (typeof window === 'undefined') return this.session;

        const params = new URLSearchParams(window.location.search);
        const isReplay = params.get('replay') === 'true';

        const sessionID = params.get('sessionID') || params.get('sessionId') || params.get('session_id');
        let rgsUrl = params.get('rgs_url') || params.get('rgsUrl');
        const currency = (params.get('currency') || 'USD').toUpperCase();
        const rawLang = params.get('lang') || params.get('language') || 'en';
        // Unknown codes fall back to 'en' [240]
        const language = (rawLang.toLowerCase().startsWith('es')) ? 'es' : 'en';
        const device = params.get('device') || 'desktop';

        const hasRgsParam = Boolean(rgsUrl);

        if (rgsUrl) {
            // Strip protocol or trailing slash for clean host composition [181]
            rgsUrl = rgsUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        }

        const isSocial = params.get('social') === 'true' || ['XSC', 'SC', 'XGC', 'GC', 'XEC'].includes(currency);
        const isLiveRGS = Boolean(sessionID && rgsUrl && !isReplay);

        let replayParams: StakeSessionConfig['replayParams'] = undefined;
        if (isReplay) {
            const rawAmount = parseFloat(params.get('amount') || '1000000') || 1000000;
            replayParams = {
                game: params.get('game') || 'endless-descent',
                version: params.get('version') || '1.0',
                mode: params.get('mode') || 'base',
                event: params.get('event') || '',
                amount: rawAmount / API_AMOUNT_MULTIPLIER, // convert from micro-units
                currency,
                language,
                social: isSocial,
                device
            };
        }

        this.session = {
            sessionID,
            rgsUrl,
            currency,
            language,
            device,
            isLiveRGS,
            isSocial,
            isReplay,
            hasRgsParam,
            replayParams
        };

        // Initialize currency-sensitive default bet config
        this.betConfig = this.getDefaultBetConfig(currency);

        return this.session;
    }

    /**
     * Fallback standard bet config per currency
     */
    public getDefaultBetConfig(currency: string): StakeBetConfig {
        if (currency === 'JPY') {
            return {
                minBet: 10,
                maxBet: 50000,
                stepBet: 10,
                defaultBetLevel: 100,
                betLevels: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]
            };
        }
        if (currency === 'XGC' || currency === 'GC') {
            return {
                minBet: 1000,
                maxBet: 1000000,
                stepBet: 1000,
                defaultBetLevel: 10000,
                betLevels: [1000, 2000, 5000, 10000, 20000, 50000, 100000, 250000, 500000, 1000000]
            };
        }
        // USD, EUR, CAD, MXN, XSC
        return {
            minBet: 0.10,
            maxBet: 100.00,
            stepBet: 0.10,
            defaultBetLevel: 1.00,
            betLevels: [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]
        };
    }

    /**
     * Low-level type-safe fetch wrapper for Stake RGS POST endpoints
     */
    private async postRGS<T = any>(endpoint: string, payload: Record<string, any>): Promise<{ ok: boolean; status: number; data: T }> {
        if (!this.session.rgsUrl) {
            throw new Error('[Stake RGS] Missing rgs_url parameter');
        }

        const isLocalHost = this.session.rgsUrl.startsWith('127.0.0.1') || this.session.rgsUrl.startsWith('localhost');
        const protocol = isLocalHost ? 'http' : 'https';
        const targetUrl = `${protocol}://${this.session.rgsUrl}${endpoint}`;

        try {
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            return {
                ok: res.ok,
                status: res.status,
                data
            };
        } catch (err) {
            console.error(`[Stake RGS] Network error communicating with ${targetUrl}:`, err);
            return {
                ok: false,
                status: 0,
                data: {
                    status: {
                        statusCode: 'ERR_UE',
                        statusMessage: err instanceof Error ? err.message : 'Network communication failure'
                    }
                } as any
            };
        }
    }

    /**
     * Authenticates active session with Stake RGS on game startup:
     * - Validates session token
     * - Retrieves official player balance
     * - Loads allowed betLevels, minBet, maxBet, defaultBetLevel [242]
     * - Restores active unfinished rounds [187]
     * - Blocks if rgs_url is invalid [274]
     */
    public async authenticate(): Promise<StakeAuthResult> {
        this.parseUrlParameters();

        // 1. Replay mode makes zero wallet calls [171]
        if (this.session.isReplay) {
            this.isInitialized = true;
            return {
                success: true,
                balance: 0,
                currency: this.session.currency,
                config: this.betConfig
            };
        }

        // 2. Local Sandbox Mode (Only when no rgs_url or sessionID parameter was supplied)
        if (!this.session.hasRgsParam) {
            this.isInitialized = true;
            return {
                success: true,
                balance: this.activeBalance,
                currency: this.session.currency,
                config: this.betConfig
            };
        }

        // 3. Live RGS Mode (or when rgs_url was provided)
        try {
            const res = await this.postRGS('/wallet/authenticate', {
                sessionID: this.session.sessionID || 'anonymous_invalid_session',
                language: this.session.language
            });

            const body = res.data;
            const statusCode = body?.status?.statusCode || (res.ok ? 'SUCCESS' : 'ERR_VAL');

            if (statusCode === 'SUCCESS' || res.ok) {
                // Parse balance
                const rawAmount = body?.balance?.amount;
                const balance = typeof rawAmount === 'number'
                    ? rawAmount / API_AMOUNT_MULTIPLIER
                    : (parseFloat(rawAmount) || 0) / API_AMOUNT_MULTIPLIER;

                const currency = (body?.balance?.currency || this.session.currency).toUpperCase();
                this.session.currency = currency;
                this.activeBalance = balance >= 0 ? balance : this.activeBalance;

                // Parse bet parameters from config [242]
                if (body?.config) {
                    const cfg = body.config;
                    const minBet = typeof cfg.minBet === 'number' ? cfg.minBet / API_AMOUNT_MULTIPLIER : this.betConfig.minBet;
                    const maxBet = typeof cfg.maxBet === 'number' ? cfg.maxBet / API_AMOUNT_MULTIPLIER : this.betConfig.maxBet;
                    const stepBet = typeof cfg.stepBet === 'number' ? cfg.stepBet / API_AMOUNT_MULTIPLIER : this.betConfig.stepBet;
                    const defaultBetLevel = typeof cfg.defaultBetLevel === 'number' ? cfg.defaultBetLevel / API_AMOUNT_MULTIPLIER : this.betConfig.defaultBetLevel;
                    
                    let betLevels = this.betConfig.betLevels;
                    if (Array.isArray(cfg.betLevels) && cfg.betLevels.length > 0) {
                        betLevels = cfg.betLevels.map((b: number) => typeof b === 'number' ? b / API_AMOUNT_MULTIPLIER : parseFloat(b) / API_AMOUNT_MULTIPLIER);
                    }

                    if (cfg.jurisdiction?.socialCasino) {
                        this.session.isSocial = true;
                    }

                    this.betConfig = {
                        minBet,
                        maxBet,
                        stepBet,
                        defaultBetLevel,
                        betLevels
                    };
                }

                // Check for active unfinished round [187]
                let activeRound: StakeActiveRound | undefined = undefined;
                if (body?.round && body?.round?.active) {
                    const rawRoundAmt = body.round.amount;
                    const roundAmt = typeof rawRoundAmt === 'number'
                        ? rawRoundAmt / API_AMOUNT_MULTIPLIER
                        : (parseFloat(rawRoundAmt) || 0) / API_AMOUNT_MULTIPLIER;

                    activeRound = {
                        roundID: body.round.roundID,
                        amount: roundAmt,
                        payoutMultiplier: body.round.payoutMultiplier,
                        active: true,
                        state: body.round.state
                    };
                    this.activeRoundData = activeRound;
                    this.currentRoundID = body.round.roundID || null;
                }

                this.isInitialized = true;
                return {
                    success: true,
                    balance: this.activeBalance,
                    currency,
                    config: this.betConfig,
                    activeRound,
                    statusCode
                };
            }

            // Connection or Authentication Failed with invalid rgs_url / invalid session [274]
            const errorMsg = this.translateRgsError(statusCode, body?.status?.statusMessage || body?.message);
            return {
                success: false,
                isConnectionError: true,
                balance: 0,
                currency: this.session.currency,
                config: this.betConfig,
                statusCode,
                errorMessage: errorMsg
            };
        } catch (err) {
            // Network failure reaching rgs_url (e.g. rgs_url=example.com) [274]
            const msg = `Unable to connect to RGS host (${this.session.rgsUrl}).`;
            return {
                success: false,
                isConnectionError: true,
                balance: 0,
                currency: this.session.currency,
                config: this.betConfig,
                statusCode: 'ERR_UE',
                errorMessage: msg
            };
        }
    }

    /**
     * Executes bet round on Stake RGS (/wallet/play)
     * Automatically converts amount to RGS micro-units (1.00 -> 1,000,000)
     */
    public async playBet(amount: number, mode = 'base'): Promise<StakePlayResult> {
        if (!this.session.isLiveRGS) {
            // Local Sandbox handles balance synchronously
            this.activeBalance = Math.max(0, Math.round((this.activeBalance - amount) * 100) / 100);
            return {
                success: true,
                balance: this.activeBalance
            };
        }

        const microAmount = Math.round(amount * API_AMOUNT_MULTIPLIER);

        try {
            const res = await this.postRGS('/wallet/play', {
                sessionID: this.session.sessionID,
                amount: microAmount,
                currency: this.session.currency,
                mode
            });

            const body = res.data;
            const statusCode = body?.status?.statusCode || body?.error || (res.ok ? 'SUCCESS' : 'ERR_UE');
            const statusMsg = String(body?.status?.statusMessage || body?.message || '');
            const isSuccess = (statusCode === 'SUCCESS' || res.ok) && !statusMsg.toLowerCase().includes('active round');

            if (isSuccess) {
                const rawAmount = body?.balance?.amount;
                const updatedBalance = typeof rawAmount === 'number'
                    ? rawAmount / API_AMOUNT_MULTIPLIER
                    : (parseFloat(rawAmount) || 0) / API_AMOUNT_MULTIPLIER;

                this.activeBalance = updatedBalance;
                this.currentRoundID = body?.round?.roundID || null;

                return {
                    success: true,
                    roundID: this.currentRoundID || undefined,
                    payoutMultiplier: body?.round?.payoutMultiplier,
                    balance: updatedBalance,
                    state: body?.round?.state,
                    statusCode
                };
            }

            // Auto-recovery for "player has active round"
            if (statusMsg.toLowerCase().includes('active round')) {
                console.warn('[Stake RGS] Detected active round on server. Clearing dangling round via /wallet/end-round...');
                const endRes = await this.endRound();
                if (endRes.success) {
                    console.log('[Stake RGS] Dangling round successfully cleared. Retrying playBet...');
                    return await this.playBet(amount, mode);
                }
            }

            const errorMsg = this.translateRgsError(statusCode, statusMsg);
            this.showToast(errorMsg, 'error', 4000);

            return {
                success: false,
                statusCode,
                errorMessage: errorMsg
            };
        } catch (err) {
            const msg = 'Failed to register bet on the RGS server.';
            this.showToast(msg, 'error', 4000);
            return {
                success: false,
                statusCode: 'ERR_UE',
                errorMessage: msg
            };
        }
    }

    /**
     * Settles and finalizes active round on Stake RGS (/wallet/end-round)
     * Called on Cashout or Win-Cap extraction to credit winnings [221]
     */
    public async endRound(): Promise<StakeEndRoundResult> {
        if (!this.session.isLiveRGS) {
            return {
                success: true,
                balance: this.activeBalance
            };
        }

        try {
            const res = await this.postRGS('/wallet/end-round', {
                sessionID: this.session.sessionID
            });

            const body = res.data;
            const statusCode = body?.status?.statusCode || (res.ok ? 'SUCCESS' : 'ERR_UE');

            if (statusCode === 'SUCCESS' || res.ok) {
                const rawAmount = body?.balance?.amount;
                if (rawAmount !== undefined) {
                    this.activeBalance = typeof rawAmount === 'number'
                        ? rawAmount / API_AMOUNT_MULTIPLIER
                        : (parseFloat(rawAmount) || 0) / API_AMOUNT_MULTIPLIER;
                }
                this.currentRoundID = null;
                this.activeRoundData = null;

                return {
                    success: true,
                    balance: this.activeBalance,
                    statusCode
                };
            }

            return {
                success: false,
                statusCode,
                errorMessage: body?.status?.statusMessage || body?.message
            };
        } catch (err) {
            return {
                success: false,
                statusCode: 'ERR_UE',
                errorMessage: 'Error finalizing round on RGS'
            };
        }
    }

    /**
     * Refreshes active player balance from RGS (/wallet/balance)
     */
    public async syncBalance(): Promise<number> {
        if (!this.session.isLiveRGS) return this.activeBalance;

        try {
            const res = await this.postRGS('/wallet/balance', {
                sessionID: this.session.sessionID
            });

            const rawAmount = res.data?.balance?.amount;
            if (rawAmount !== undefined) {
                this.activeBalance = typeof rawAmount === 'number'
                    ? rawAmount / API_AMOUNT_MULTIPLIER
                    : (parseFloat(rawAmount) || 0) / API_AMOUNT_MULTIPLIER;
            }
        } catch {
            // Silently retain last known balance
        }

        return this.activeBalance;
    }

    /**
     * Fetches official replay data for event [171]
     * GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}
     */
    public async fetchReplayEvent(): Promise<StakeReplayData> {
        if (!this.session.isReplay || !this.session.replayParams) {
            return { success: false, errorMessage: 'Not in replay mode' };
        }

        const { game, version, mode, event } = this.session.replayParams;
        if (!this.session.rgsUrl) {
            return { success: false, errorMessage: 'Missing rgs_url for replay' };
        }

        const isLocalHost = this.session.rgsUrl.startsWith('127.0.0.1') || this.session.rgsUrl.startsWith('localhost');
        const protocol = isLocalHost ? 'http' : 'https';
        const targetUrl = `${protocol}://${this.session.rgsUrl}/bet/replay/${game}/${version}/${mode}/${event}`;

        try {
            const res = await fetch(targetUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                return {
                    success: false,
                    errorMessage: `Replay fetch failed with status ${res.status}`
                };
            }

            const data = await res.json();
            const payoutMultiplier = data?.payoutMultiplier ?? data?.round?.payoutMultiplier ?? 0;
            const costMultiplier = data?.costMultiplier ?? data?.round?.costMultiplier ?? 1.0;
            const state = data?.state ?? data?.round?.state ?? [];

            return {
                success: true,
                payoutMultiplier,
                costMultiplier,
                state
            };
        } catch (err) {
            return {
                success: false,
                errorMessage: err instanceof Error ? err.message : 'Network error loading replay'
            };
        }
    }

    /**
     * Currency sign / symbol helper
     * In Social Mode (Stake.us), currencies XSC and XGC must NOT use a dollar sign ($) [78]
     */
    public getCurrencySymbol(): string {
        if (this.session.isSocial || ['XSC', 'SC', 'XGC', 'GC', 'XEC'].includes(this.session.currency)) {
            return '';
        }

        switch (this.session.currency) {
            case 'USD':
            case 'USDT':
            case 'USDC':
                return '$';
            case 'CAD':
                return 'CA$';
            case 'MXN':
                return 'MX$';
            case 'EUR':
                return '€';
            case 'JPY':
                return '¥';
            case 'GBP':
                return '£';
            case 'BTC':
                return '₿';
            case 'ETH':
                return 'Ξ';
            default:
                return '$';
        }
    }

    /**
     * Formats currency amounts strictly adhering to Stake Engine rules [219, 273, 78]:
     * - USD: $10.00
     * - EUR: €10.00
     * - CAD: CA$10.00
     * - MXN: MX$10.00
     * - JPY: ¥10 (0 decimals)
     * - XSC: 10.00 SC
     * - XGC: 10.00 GC
     * - Sub-cent (>0 and <0.01): displays exact precision without premature rounding [273]
     */
    public formatCurrency(amount: number): string {
        const curr = this.session.currency;

        // Sub-cent handling: values between 0 and 0.01 must not round to 0.00 or 0.01 [273]
        const isSubCent = amount > 0 && amount < 0.01;

        if (curr === 'XSC' || curr === 'SC' || curr === 'XEC') {
            const dec = isSubCent ? 4 : 2;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: dec
            });
            return `${formatted} SC`;
        }

        if (curr === 'XGC' || curr === 'GC') {
            const dec = isSubCent ? 4 : 2;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: dec
            });
            return `${formatted} GC`;
        }

        if (curr === 'JPY') {
            // JPY has strictly 0 decimals [219]
            const dec = isSubCent ? 2 : 0;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: dec,
                maximumFractionDigits: dec
            });
            return `¥${formatted}`;
        }

        if (curr === 'CAD') {
            const dec = isSubCent ? 4 : 2;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: dec
            });
            return `CA$${formatted}`;
        }

        if (curr === 'MXN') {
            const dec = isSubCent ? 4 : 2;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: dec
            });
            return `MX$${formatted}`;
        }

        if (curr === 'EUR') {
            const dec = isSubCent ? 4 : 2;
            const formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: dec
            });
            return `€${formatted}`;
        }

        // Default (USD, USDT, etc.)
        const symbol = this.getCurrencySymbol();
        const dec = isSubCent ? 4 : 2;
        const formatted = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: dec
        });
        return `${symbol}${formatted}`;
    }

    /**
     * Translates standard Stake RGS status codes into clear player feedback [77]
     */
    public translateRgsError(code: string, fallbackMessage?: string): string {
        const isEn = this.session.language !== 'es';
        const isSocial = this.session.isSocial;

        if (isSocial) {
            if (code === 'ERR_IPB') return isEn ? 'Insufficient coins to place this play.' : 'Monedas insuficientes para realizar esta jugada.';
            if (code === 'ERR_IS' || code === 'ERR_ATE' || code === 'ERR_VAL') return isEn ? 'Play session expired or invalid. Please reload.' : 'Sesión de juego expirada. Por favor recarga.';
        }

        switch (code) {
            case 'ERR_IPB':
                return isEn ? 'Insufficient balance in your account.' : 'Saldo insuficiente en tu cuenta para esta jugada.';
            case 'ERR_IS':
            case 'ERR_ATE':
            case 'ERR_VAL':
                return isEn ? 'Session expired or unauthenticated. Please reload.' : 'Sesión expirada o inválida. Por favor recarga el juego.';
            case 'ERR_GLE':
                return isEn ? 'Gaming limit or self-exclusion reached.' : 'Límite de juego o auto-exclusión alcanzado.';
            case 'ERR_BNF':
                return isEn ? 'Round outcome not found on server.' : 'Ronda no encontrada en el servidor.';
            case 'ERR_ACT':
                return isEn ? 'Server busy. Please try again shortly.' : 'Servidor ocupado. Intenta de nuevo en un momento.';
            case 'ERR_GEN':
            case 'ERR_UE':
            default:
                return fallbackMessage || (isEn ? 'Connection error with the RGS server.' : 'Error de comunicación con el servidor RGS.');
        }
    }

    /**
     * Displays a sleek, native Stake-style toast notification
     */
    public showToast(message: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 3500) {
        if (typeof document === 'undefined') return;

        let toastContainer = document.getElementById('stake-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'stake-toast-container';
            toastContainer.className = 'stake-toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `stake-toast-item stake-toast-${type}`;

        const iconSvg = type === 'success'
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#00e701" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : type === 'error'
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ff4949" stroke-width="2"/><path d="M12 8V12M12 16H12.01" stroke="#ff4949" stroke-width="2.5" stroke-linecap="round"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#00f0ff" stroke-width="2"/><path d="M12 16V12M12 8H12.01" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/></svg>`;

        toast.innerHTML = `
            <div class="stake-toast-icon">${iconSvg}</div>
            <div class="stake-toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        // Animate out & remove
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, durationMs);
    }
}

export const stakeRGS = new StakeRGSBridgeManager();
