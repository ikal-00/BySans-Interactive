/**
 * AAA Procedural WebAudio Synthesizer & Synthwave BGM Engine — [SPACE-OVERDRIVE V3] Edition
 * Generates:
 * 1. Ultra-Subtle Low-Frequency Engine Sub-Hum (Volume reduced by >80%, 95Hz lowpass EQ)
 * 2. Seamless Rhythmic Synthwave / Cyberpunk-Thriller Background Music (118 BPM 4-Bar Loop:
 *    Rolling Analog Bassline + Hypnotic Minor Arpeggiator + Lush Dark Pad + Soft Pulse Drums)
 * 3. Violent 300ms Hit-Stop Capacitor Charge & Time-Freeze Tension Sweep
 * 4. 3D Volumetric Glass-Shatter Acoustic Transients + Post-Hit-Stop Sonic Boom
 * 5. Brutal Thermonuclear Plasma Mine Detonation & Bass-Heavy Reactor Core Cashout Shockwave
 */
export class AudioController {
    private ctx: AudioContext | null = null;
    private muted: boolean = false;

    // 1. Subtle Deep-Background Engine Sub-Hum (Reduced by 80%+, 95Hz Lowpass EQ)
    private droneOsc1: OscillatorNode | null = null;
    private droneOsc2: OscillatorNode | null = null;
    private droneFilter: BiquadFilterNode | null = null;
    private droneGain: GainNode | null = null;
    private isDronePlaying: boolean = false;

    // 2. Seamless Synthwave / Cyberpunk-Thriller Background Music (BGM) Sequencer
    private isBgmPlaying: boolean = false;
    private nextStepTime: number = 0;
    private current16thStep: number = 0;
    private bgmIntensityFactor: number = 0; // Scales filter cutoff gently with multiplier
    private bgmMasterGain: GainNode | null = null;

    // Pre-baked Noise AudioBuffers (eliminates per-hit CPU buffer allocation & GC jitter)
    private snareNoiseBuffer: AudioBuffer | null = null;
    private hatNoiseBuffer: AudioBuffer | null = null;
    private cardboardNoiseBuffer: AudioBuffer | null = null;
    private crashNoiseBuffer: AudioBuffer | null = null;

    constructor() {
        // Lazy-initialized on first user interaction to satisfy browser autoplay policy
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
            this.prebakeNoiseBuffers();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private prebakeNoiseBuffers() {
        if (!this.ctx) return;
        const sr = this.ctx.sampleRate;

        const createExpNoise = (durSec: number, decayRatio: number) => {
            const len = Math.floor(sr * durSec);
            const buf = this.ctx!.createBuffer(1, len, sr);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * decayRatio));
            }
            return buf;
        };

        this.snareNoiseBuffer = createExpNoise(0.11, 0.35);
        this.hatNoiseBuffer = createExpNoise(0.04, 0.3);
        this.cardboardNoiseBuffer = createExpNoise(0.16, 0.38);

        const crashLen = Math.floor(sr * 0.55);
        this.crashNoiseBuffer = this.ctx.createBuffer(1, crashLen, sr);
        const crashData = this.crashNoiseBuffer.getChannelData(0);
        for (let i = 0; i < crashLen; i++) {
            crashData[i] = Math.random() * 2 - 1;
        }
    }

    public setMuted(mute: boolean) {
        this.muted = mute;
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (this.droneGain) {
            this.droneGain.gain.setTargetAtTime(this.muted ? 0 : 0.009, now, 0.08);
        }
        if (this.bgmMasterGain) {
            this.bgmMasterGain.gain.setTargetAtTime(this.muted ? 0 : 0.14, now, 0.1);
        }
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public toggleMute(): boolean {
        this.setMuted(!this.muted);
        return !this.muted;
    }

    /**
     * Starts both the ultra-subtle low-frequency engine sub-hum (-80% volume, 95Hz lowpass)
     * and the seamless rhythmic Synthwave / Cyberpunk-Thriller BGM track!
     */
    public startAmbientDrone() {
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // A. Subtle Low-Frequency Engine Sub-Hum (80%+ quieter, warm 42Hz/63Hz sub-bass)
        if (!this.isDronePlaying) {
            this.droneOsc1 = this.ctx.createOscillator();
            this.droneOsc2 = this.ctx.createOscillator();
            this.droneFilter = this.ctx.createBiquadFilter();
            this.droneGain = this.ctx.createGain();

            this.droneOsc1.type = 'sine';
            this.droneOsc1.frequency.setValueAtTime(42, now); // Deep sub-fundamental

            this.droneOsc2.type = 'triangle';
            this.droneOsc2.frequency.setValueAtTime(63, now); // Warm low fifth

            this.droneFilter.type = 'lowpass';
            this.droneFilter.frequency.setValueAtTime(92, now); // Steep low-frequency hum EQ
            this.droneFilter.Q.setValueAtTime(0.7, now); // No harsh resonance peak

            this.droneGain.gain.setValueAtTime(0.0001, now);
            this.droneGain.gain.linearRampToValueAtTime(this.muted ? 0.0001 : 0.009, now + 1.0);

            this.droneOsc1.connect(this.droneFilter);
            this.droneOsc2.connect(this.droneFilter);
            this.droneFilter.connect(this.droneGain);
            this.droneGain.connect(this.ctx.destination);

            this.droneOsc1.start(now);
            this.droneOsc2.start(now);
            this.isDronePlaying = true;
        }

        // B. Start Rhythmic Synthwave / Cyberpunk-Thriller BGM Sequencer
        if (!this.isBgmPlaying) {
            this.startSynthwaveBGM();
        }
    }

    /**
     * Seamless 118 BPM Synthwave / Cyberpunk-Thriller Background Music Sequencer
     * 4-Bar Progression in D Minor: Dm9 -> BbMaj7 -> Gm7 -> A7sus4
     */
    private startSynthwaveBGM() {
        if (!this.ctx || this.isBgmPlaying) return;

        this.bgmMasterGain = this.ctx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(this.muted ? 0 : 0.14, this.ctx.currentTime);
        this.bgmMasterGain.connect(this.ctx.destination);

        this.isBgmPlaying = true;
        this.current16thStep = 0;
        this.nextStepTime = this.ctx.currentTime + 0.06;

        const lookaheadMs = 25;
        const scheduleAheadSec = 0.12;
        const bpm = 118;
        const secondsPer16th = 60 / bpm / 4;

        const scheduler = () => {
            if (!this.ctx || !this.isBgmPlaying) return;
            if (this.ctx.currentTime - this.nextStepTime > 0.25) {
                this.nextStepTime = this.ctx.currentTime + 0.04;
            }
            while (this.nextStepTime < this.ctx.currentTime + scheduleAheadSec) {
                this.scheduleBgmStep(this.current16thStep, this.nextStepTime, secondsPer16th);
                this.nextStepTime += secondsPer16th;
                this.current16thStep = (this.current16thStep + 1) % 64; // 4-bar 64-step loop
            }
        };

        window.setInterval(scheduler, lookaheadMs);
    }

    private scheduleBgmStep(step: number, time: number, stepDur: number) {
        if (!this.ctx || !this.bgmMasterGain || this.muted) return;

        const bar = Math.floor(step / 16); // 0: Dm, 1: Bb, 2: Gm, 3: A
        const stepInBar = step % 16;

        // 1. Driving Synthwave Rolling 16th-Note Bassline
        const bassRoots = [73.42, 58.27, 49.0, 55.0]; // D2, Bb1, G1, A1
        const rootHz = bassRoots[bar];
        // Octave bounce on off-beats for classic cyberpunk synthwave drive
        const isOctaveUp = stepInBar % 4 === 2;
        const bassFreq = isOctaveUp ? rootHz * 2 : rootHz;

        // Rest briefly on step 0 of every bar to let the kick breathe (sidechain feel)
        const bassVel = stepInBar % 4 === 0 ? 0.55 : stepInBar % 2 === 0 ? 0.85 : 0.7;
        this.triggerSynthBassNote(bassFreq, time, stepDur * 0.82, bassVel);

        // 2. Hypnotic Cyberpunk Thriller Arpeggiator (Soft Pluck with Stereo Feel)
        const arpPatterns: number[][] = [
            // Bar 0 (Dm9): D4, F4, A4, C5, E5, C5, A4, F4
            [293.66, 349.23, 440.0, 523.25, 659.25, 523.25, 440.0, 349.23],
            // Bar 1 (BbMaj7): Bb3, D4, F4, A4, D5, A4, F4, D4
            [233.08, 293.66, 349.23, 440.0, 587.33, 440.0, 349.23, 293.66],
            // Bar 2 (Gm7): G3, Bb3, D4, F4, A4, F4, D4, Bb3
            [196.0, 233.08, 293.66, 349.23, 440.0, 349.23, 293.66, 233.08],
            // Bar 3 (A7sus4 -> A7): A3, D4, E4, G4, A4, G4, E4, C#4
            [220.0, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 277.18]
        ];
        // Play arpeggio on 8th-note grid plus syncopated 16th accents
        if (stepInBar % 2 === 0 || stepInBar === 7 || stepInBar === 15) {
            const noteIdx = Math.floor(stepInBar / 2) % 8;
            const arpFreq = arpPatterns[bar][noteIdx];
            this.triggerArpPluck(arpFreq, time, stepDur * 1.4);
        }

        // 3. Warm Atmospheric Dark Synth Pad on Bar Downbeats
        if (stepInBar === 0) {
            const padChords: number[][] = [
                [146.83, 220.0, 261.63, 349.23], // Dm7
                [116.54, 174.61, 220.0, 293.66], // BbMaj7
                [98.0, 146.83, 174.61, 233.08],  // Gm7
                [110.0, 164.81, 196.0, 277.18]   // A7
            ];
            this.triggerSynthPadChord(padChords[bar], time, stepDur * 15.8);
        }

        // 4. Tight Electronic Synthwave Kick (Beats 1 & 3) & Soft Snare/Hat Pulse (Beats 2 & 4)
        if (stepInBar === 0 || stepInBar === 8) {
            this.triggerSoftKick(time);
        } else if (stepInBar === 4 || stepInBar === 12) {
            this.triggerSoftSnare(time);
        } else if (stepInBar % 2 === 1) {
            this.triggerSoftHat(time);
        }
    }

    private triggerSynthBassNote(freq: number, time: number, dur: number, vel: number) {
        if (!this.ctx || !this.bgmMasterGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const cutoffBase = 240 + this.bgmIntensityFactor * 110;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoffBase * 2.2, time);
        filter.frequency.exponentialRampToValueAtTime(cutoffBase, time + dur * 0.85);
        filter.Q.setValueAtTime(2.2, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.22 * vel, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(time);
        osc.stop(time + dur + 0.01);
    }

    private triggerArpPluck(freq: number, time: number, dur: number) {
        if (!this.ctx || !this.bgmMasterGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600 + this.bgmIntensityFactor * 450, time);
        filter.frequency.exponentialRampToValueAtTime(480, time + dur);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.095, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(time);
        osc.stop(time + dur + 0.01);
    }

    private triggerSynthPadChord(freqs: number[], time: number, dur: number) {
        if (!this.ctx || !this.bgmMasterGain) return;
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(620 + this.bgmIntensityFactor * 180, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.045, time + 0.35);
        gain.gain.setValueAtTime(0.045, time + dur - 0.35);
        gain.gain.linearRampToValueAtTime(0.001, time + dur);

        filter.connect(gain);
        gain.connect(this.bgmMasterGain);

        freqs.forEach((f, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f, time);
            osc.detune.setValueAtTime((idx - 1.5) * 6, time);
            osc.connect(filter);
            osc.start(time);
            osc.stop(time + dur + 0.02);
        });
    }

    private triggerSoftKick(time: number) {
        if (!this.ctx || !this.bgmMasterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(115, time);
        osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

        gain.gain.setValueAtTime(0.28, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

        osc.connect(gain);
        gain.connect(this.bgmMasterGain);
        osc.start(time);
        osc.stop(time + 0.17);
    }

    private triggerSoftSnare(time: number) {
        if (!this.ctx || !this.bgmMasterGain || !this.snareNoiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.snareNoiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1450, time);
        filter.Q.setValueAtTime(1.2, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.11, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);
        noise.start(time);
    }

    private triggerSoftHat(time: number) {
        if (!this.ctx || !this.bgmMasterGain || !this.hatNoiseBuffer) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.hatNoiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6500, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.035, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);
        noise.start(time);
    }

    public updateDroneIntensity(multiplier: number) {
        this.bgmIntensityFactor = Math.min(2.5, Math.log2(Math.max(1, multiplier) + 1));
        if (!this.ctx || !this.isDronePlaying || !this.droneOsc1 || !this.droneOsc2 || !this.droneFilter) return;
        const now = this.ctx.currentTime;
        // Keep engine sub-hum deep and unobtrusive (<115Hz) even at high multipliers
        this.droneOsc1.frequency.setTargetAtTime(42 + this.bgmIntensityFactor * 4, now, 0.25);
        this.droneOsc2.frequency.setTargetAtTime(63 + this.bgmIntensityFactor * 6, now, 0.25);
        this.droneFilter.frequency.setTargetAtTime(92 + this.bgmIntensityFactor * 12, now, 0.25);
    }

    public playHoverTick(laneIndex = 2) {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const laneFreqs = [640, 760, 890, 1040, 1200];
        const baseFreq = laneFreqs[laneIndex % laneFreqs.length] || 890;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.03);

        gain.gain.setValueAtTime(0.032, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.034);
    }

    public playClick() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.055);

        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.065);
    }

    /**
     * 300ms VIOLENT HIT-STOP TENSION:
     * Dual-oscillator time-freeze capacitor charge + sub-bass pressure clamp
     */
    public playHitStopTension(durationMs = 300, row = 1) {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const dur = durationMs / 1000;
        const baseFreq = 190 + Math.min(row * 30, 440);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 3.1, now + dur);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq * 1.5, now);
        filter.frequency.exponentialRampToValueAtTime(baseFreq * 4.5, now + dur);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.linearRampToValueAtTime(0.16, now + dur * 0.88);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur + 0.02);

        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(110, now);
        sub.frequency.exponentialRampToValueAtTime(38, now + dur * 0.7);
        subGain.gain.setValueAtTime(0.22, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + dur * 0.85);
    }

    /**
     * 3D VOLUMETRIC CARDBOARD MYSTERY BOX SHATTER + POST-HIT-STOP SPEED BURST:
     * Crisp cardboard box smash transients + Sonic boom punch + Harmonic win chord
     */
    public playSafeStep(row: number) {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const pentatonic = [293.66, 349.23, 440.0, 523.25, 587.33, 659.25, 880.0, 1046.5];
        const rootFreq =
            pentatonic[(row - 1) % pentatonic.length] *
            (1 + Math.floor((row - 1) / pentatonic.length) * 0.25);

        // 1. Heavy Cardboard Box Hollow Thud
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'triangle';
        punchOsc.frequency.setValueAtTime(140, now);
        punchOsc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
        punchGain.gain.setValueAtTime(0.38, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        punchOsc.connect(punchGain);
        punchGain.connect(this.ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.21);

        // 2. Corrugated Cardboard Rip, Crush & Crunch Noise
        if (this.cardboardNoiseBuffer) {
            // Low-mid box body crunch
            const boxNoise = this.ctx.createBufferSource();
            boxNoise.buffer = this.cardboardNoiseBuffer;
            const lpFilter = this.ctx.createBiquadFilter();
            lpFilter.type = 'bandpass';
            lpFilter.frequency.setValueAtTime(750, now);
            lpFilter.Q.setValueAtTime(1.8, now);

            const boxGain = this.ctx.createGain();
            boxGain.gain.setValueAtTime(0.42, now);
            boxGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            boxNoise.connect(lpFilter);
            lpFilter.connect(boxGain);
            boxGain.connect(this.ctx.destination);
            boxNoise.start(now);

            // Paper tear & fiber rip friction
            const tearNoise = this.ctx.createBufferSource();
            tearNoise.buffer = this.cardboardNoiseBuffer;
            const bpTear = this.ctx.createBiquadFilter();
            bpTear.type = 'bandpass';
            bpTear.frequency.setValueAtTime(1600, now);
            bpTear.Q.setValueAtTime(2.4, now);

            const tearGain = this.ctx.createGain();
            tearGain.gain.setValueAtTime(0.24, now);
            tearGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            tearNoise.connect(bpTear);
            bpTear.connect(tearGain);
            tearGain.connect(this.ctx.destination);
            tearNoise.start(now);
        }

        // 3. Harmonic Progression Reward Tone (Arcade Win Note)
        [1, 1.5].forEach((ratio, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const f = rootFreq * ratio;
            osc.frequency.setValueAtTime(f, now + idx * 0.02);
            osc.frequency.exponentialRampToValueAtTime(f * 1.02, now + idx * 0.02 + 0.22);

            gain.gain.setValueAtTime(0.08 / (idx * 0.4 + 1), now + idx * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.02 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.02);
            osc.stop(now + idx * 0.02 + 0.26);
        });
    }

    public playGoldenHit() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        this.playSafeStep(6);
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
        notes.forEach((freq, i) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.036);
            gain.gain.setValueAtTime(0.14, now + i * 0.036);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.036 + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.036);
            osc.stop(now + i * 0.036 + 0.42);
        });
    }

    public playAlienLaser() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        this.playSafeStep(8);
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1680, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.34);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.56);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.62);
    }

    public playShieldBreak() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(92, now + 0.4);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.44);
    }

    /**
     * BRUTAL THERMONUCLEAR PLASMA MINE CRASH DETONATION
     */
    public playCrash() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(155, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.72);

        subGain.gain.setValueAtTime(0.38, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.78);

        if (this.crashNoiseBuffer) {
            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = this.crashNoiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1250, now);
            filter.frequency.exponentialRampToValueAtTime(85, now + 0.52);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.32, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

            whiteNoise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            whiteNoise.start(now);
        }
    }

    public playPartialCashout() {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [440, 659.25, 880].forEach((f, i) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.05);
            gain.gain.setValueAtTime(0.12, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.28);
        });
    }

    /**
     * BASS-HEAVY REACTOR CORE CASHOUT ACOUSTIC SHOCKWAVE + SUPERNOVA FANFARE
     */
    public playCashout(isMega = false) {
        if (this.muted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(125, now);
        bassOsc.frequency.exponentialRampToValueAtTime(28, now + 0.55);

        bassGain.gain.setValueAtTime(0.38, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.6);

        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(320, now);
        clickOsc.frequency.exponentialRampToValueAtTime(75, now + 0.065);
        clickGain.gain.setValueAtTime(0.16, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.075);

        const notes = isMega
            ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0]
            : [440, 554.37, 659.25, 880, 1108.73];

        notes.forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = isMega ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.052);
            gain.gain.setValueAtTime(0.17, now + idx * 0.052);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.052 + 0.52);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.052);
            osc.stop(now + idx * 0.052 + 0.55);
        });
    }

    public playStartRound() {
        this.playClick();
    }
}

export const audioController = new AudioController();
