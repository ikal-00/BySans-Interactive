/**
 * Studio-Grade Web Audio API Synthesizer for "Endless Descent"
 * Engineered for low-latency tactile feedback and progressive musical dopamine escalation.
 * Zero external audio assets required.
 */
class SoundManager {
    private ctx: AudioContext | null = null;
    public isMuted: boolean = false;
    private lastHoverTime: number = 0;

    // Musical Pentatonic + Lydian frequencies (Hz) for euphoric streak escalation
    private readonly scaleNotes = [
        523.25,  // C5  (Row 1)
        587.33,  // D5  (Row 2)
        659.25,  // E5  (Row 3)
        739.99,  // F#5 (Row 4)
        783.99,  // G5  (Row 5)
        880.00,  // A5  (Row 6)
        987.77,  // B5  (Row 7)
        1046.50, // C6  (Row 8)
        1174.66, // D6  (Row 9)
        1318.51, // E6  (Row 10)
        1479.98, // F#6 (Row 11)
        1567.98, // G6  (Row 12)
        1760.00, // A6  (Row 13)
        1975.53, // B6  (Row 14)
        2093.00  // C7  (Row 15+)
    ];

    constructor() {
        try {
            const savedMute = localStorage.getItem('endless_descent_mute');
            if (savedMute !== null) {
                this.isMuted = savedMute === 'true';
            }
        } catch {
            // Ignore storage access errors
        }
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('endless_descent_mute', this.isMuted ? 'true' : 'false');
        } catch {
            // Ignore
        }
        return this.isMuted;
    }

    /**
     * Ultra-subtle mechanical hover tick when sliding across the 5 lane cards.
     * Slight pitch variation per lane (0..4) creates tactile spatial awareness.
     */
    public playHoverTick(lane = 2) {
        if (this.isMuted) return;
        const nowPerf = performance.now();
        if (nowPerf - this.lastHoverTime < 35) return;
        this.lastHoverTime = nowPerf;

        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startFreq = 1050 + lane * 55;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.014);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.014);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.015);
    }

    /**
     * Crisp UI button click
     */
    public playClick() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);

        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.026);
    }

    /**
     * Pneumatic lock-in sound when starting a new round ("DESCENDER")
     */
    public playStartRound() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Low punch
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(130, now);
        sub.frequency.exponentialRampToValueAtTime(55, now + 0.07);
        subGain.gain.setValueAtTime(0.18, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.08);

        // Rising ready chime
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(440, now + 0.02);
        chime.frequency.exponentialRampToValueAtTime(659.25, now + 0.11);
        chimeGain.gain.setValueAtTime(0.10, now + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chime.start(now + 0.02);
        chime.stop(now + 0.125);
    }

    /**
     * Progressive Dopamine Chime when clearing a row:
     * Combines a tactile sub-bass thump + Lydian crystal pluck + harmonic fifth shimmer.
     */
    public playSafeStep(row: number) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const noteIdx = Math.max(0, Math.min(this.scaleNotes.length - 1, row - 1));
        const baseFreq = this.scaleNotes[noteIdx];

        // 1. Tactile Sub-Thump (gives physical weight to every step)
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(125, now);
        sub.frequency.exponentialRampToValueAtTime(46, now + 0.055);
        subGain.gain.setValueAtTime(0.20, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.065);

        // 2. Primary Crystal Pluck
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.19, now + 0.006);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        // 3. Harmonic Fifth / Octave Sparkle (intensifies as streak grows)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.5, now + 0.015);
        const shimmerVol = Math.min(0.14, 0.05 + row * 0.012);
        gain2.gain.setValueAtTime(shimmerVol, now + 0.015);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.015);
        osc2.stop(now + 0.29);
    }

    /**
     * Euphoric Golden Multiplier Card Arpeggio (2x / 3x boost)
     */
    public playGoldenHit() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53]; // E Major 9th sparkle
        freqs.forEach((f, idx) => {
            if (!this.ctx) return;
            const t = now + idx * 0.038;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(f, t);

            gain.gain.setValueAtTime(0.20, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    /**
     * Sci-fi Alien UFO Interceptor Warp + Dual-Row Plasma Sweeper
     */
    public playAlienLaser() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 1. Harmonic Warp Riser
        const ufoOsc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const ufoGain = this.ctx.createGain();

        ufoOsc.type = 'sine';
        ufoOsc.frequency.setValueAtTime(520, now);
        ufoOsc.frequency.exponentialRampToValueAtTime(1180, now + 0.38);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(20, now);
        lfoGain.gain.setValueAtTime(95, now);

        lfo.connect(lfoGain);
        lfoGain.connect(ufoOsc.frequency);

        ufoGain.gain.setValueAtTime(0.18, now);
        ufoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        ufoOsc.connect(ufoGain);
        ufoGain.connect(this.ctx.destination);

        ufoOsc.start(now);
        lfo.start(now);
        ufoOsc.stop(now + 0.5);
        lfo.stop(now + 0.5);

        // 2. Twin Row-Clearing Plasma Pulses
        [0.10, 0.22].forEach((offset, idx) => {
            if (!this.ctx) return;
            const t = now + offset;
            const zap = this.ctx.createOscillator();
            const zapGain = this.ctx.createGain();

            zap.type = 'triangle';
            zap.frequency.setValueAtTime(idx === 0 ? 1320 : 1760, t);
            zap.frequency.exponentialRampToValueAtTime(180, t + 0.18);

            zapGain.gain.setValueAtTime(0.24, t);
            zapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

            zap.connect(zapGain);
            zapGain.connect(this.ctx.destination);

            zap.start(t);
            zap.stop(t + 0.2);
        });
    }

    /**
     * Energy Shield EMP Deflection when absorbing a mine
     */
    public playShieldBreak() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(240, now);
        osc1.frequency.exponentialRampToValueAtTime(680, now + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(190, now + 0.36);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(960, now);
        osc2.frequency.exponentialRampToValueAtTime(480, now + 0.36);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.39);
        osc2.stop(now + 0.39);
    }

    /**
     * Partial 50% Cashout crisp lock-in chime
     */
    public playPartialCashout() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [880, 1174.66, 1318.51].forEach((freq, idx) => {
            if (!this.ctx) return;
            const t = now + idx * 0.055;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.21);
        });
    }

    /**
     * Celebratory Cashout Fanfare + Rapid Payout Counter Ticks
     */
    public playCashout() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // 1. Harmonic Victory Chord Arpeggio (C5 -> E5 -> G5 -> B5 -> C6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
        notes.forEach((freq, idx) => {
            if (!this.ctx) return;
            const startTime = now + idx * 0.048;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.22, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.42);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.43);
        });

        // 2. Rapid Casino Counter Rollup Shimmer Ticks
        for (let i = 0; i < 6; i++) {
            const t = now + 0.08 + i * 0.042;
            const tick = this.ctx.createOscillator();
            const tickGain = this.ctx.createGain();
            tick.type = 'sine';
            tick.frequency.setValueAtTime(2093 + i * 180, t);
            tickGain.gain.setValueAtTime(0.06, t);
            tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
            tick.connect(tickGain);
            tickGain.connect(this.ctx.destination);
            tick.start(t);
            tick.stop(t + 0.04);
        }
    }

    /**
     * Deep Sub-Bass Detonation & Low-Pass Impact on Mine Crash
     */
    public playCrash() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.32);

        oscGain.gain.setValueAtTime(0.32, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.33);

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.24);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(920, now);
        filter.frequency.exponentialRampToValueAtTime(75, now + 0.24);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.25);
    }
}

export const sounds = new SoundManager();
