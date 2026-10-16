/**
 * Web Audio API synthesizer for crisp, low-latency arcade sound effects.
 * Requires 0 external audio assets and keeps the bundle lightweight.
 */
class SoundManager {
    private ctx: AudioContext | null = null;
    public isMuted: boolean = false;

    constructor() {
        try {
            const savedMute = localStorage.getItem('endless_descent_mute');
            if (savedMute !== null) {
                this.isMuted = savedMute === 'true';
            }
        } catch {
            // Ignore
        }
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
     * Subtle mechanical button click
     */
    public playClick() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    /**
     * Clean ascending chime when a safe lane is cleared.
     */
    public playSafeStep(row: number) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const baseFreq = 520 * Math.pow(1.06, Math.min(row, 24));

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.18);
        osc2.stop(this.ctx.currentTime + 0.18);
    }

    /**
     * Shimmering Golden Card hit chime (high-energy sparkle arpeggio)
     */
    public playGoldenHit() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22]; // E5, G#5, B5, E6, G#6
        freqs.forEach((f, idx) => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime + idx * 0.045;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t);

            gain.gain.setValueAtTime(0.24, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.32);
        });
    }

    /**
     * Sci-fi Alien UFO arrival + plasma laser blast destroying 2 rows
     */
    public playAlienLaser() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 1. UFO warble oscillator
        const ufoOsc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const ufoGain = this.ctx.createGain();

        ufoOsc.type = 'sine';
        ufoOsc.frequency.setValueAtTime(680, now);
        ufoOsc.frequency.linearRampToValueAtTime(980, now + 0.35);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(18, now);
        lfoGain.gain.setValueAtTime(120, now);

        lfo.connect(lfoGain);
        lfoGain.connect(ufoOsc.frequency);

        ufoGain.gain.setValueAtTime(0.22, now);
        ufoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        ufoOsc.connect(ufoGain);
        ufoGain.connect(this.ctx.destination);

        ufoOsc.start(now);
        lfo.start(now);
        ufoOsc.stop(now + 0.55);
        lfo.stop(now + 0.55);

        // 2. Twin Laser Zaps
        [0.12, 0.26].forEach((offset) => {
            if (!this.ctx) return;
            const t = now + offset;
            const zap = this.ctx.createOscillator();
            const zapGain = this.ctx.createGain();

            zap.type = 'sawtooth';
            zap.frequency.setValueAtTime(1400, t);
            zap.frequency.exponentialRampToValueAtTime(110, t + 0.22);

            zapGain.gain.setValueAtTime(0.28, t);
            zapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            zap.connect(zapGain);
            zapGain.connect(this.ctx.destination);

            zap.start(t);
            zap.stop(t + 0.22);
        });
    }

    /**
     * Energy Shield deflection sound when absorbing a mine explosion
     */
    public playShieldBreak() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(620, now + 0.15);
        osc1.frequency.exponentialRampToValueAtTime(180, now + 0.4);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.4);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.42);
        osc2.stop(now + 0.42);
    }

    /**
     * Partial 50% Cashout double coin chime
     */
    public playPartialCashout() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        [880, 1174.66].forEach((freq, idx) => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
        });
    }

    /**
     * Triumphant harmonic arpeggio on Cashout
     */
    public playCashout() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            if (!this.ctx) return;
            const startTime = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }

    /**
     * Deep explosion noise with sub-bass punch on Crash
     */
    public playCrash() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);

        oscGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);

        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.25);
    }
}

export const sounds = new SoundManager();
