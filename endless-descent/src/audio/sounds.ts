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
     * Frequency ascends with the row index.
     */
    public playSafeStep(row: number) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        // Base frequency 520Hz, steps up with row
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

        // Sub bass thump
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

        // White noise burst
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
