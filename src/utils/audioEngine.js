import * as Tone from 'tone';

/**
 * Audio Engine - Core audio synthesis and processing
 * Handles all audio generation, mixing, and effects
 */

class AudioEngine {
  constructor() {
    this.synth = null;
    this.drums = {};
    this.effects = {};
    this.masterGain = new Tone.Gain(0.8).toDestination();
    this.initialized = false;
  }

  async initialize() {
    await Tone.start();
    this.createSynthesizers();
    this.createEffects();
    this.initialized = true;
    console.log('✓ Audio Engine Initialized');
  }

  createSynthesizers() {
    // Main Synthesizer for melodies
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).connect(this.masterGain);

    // Drum Synthesizers
    this.drums.kick = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0,
        release: 0.1
      }
    }).connect(this.masterGain);

    this.drums.snare = new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01
      },
      harmonics: 12
    }).connect(this.masterGain);

    this.drums.hihat = new Tone.MetalSynth({
      frequency: 300,
      envelope: {
        attack: 0.001,
        decay: 0.05,
        release: 0.01
      },
      harmonics: 8
    }).connect(this.masterGain);
  }

  createEffects() {
    // Reverb
    this.effects.reverb = new Tone.Reverb({
      decay: 2.5
    }).connect(this.masterGain);

    // Delay
    this.effects.delay = new Tone.Delay({
      delayTime: 0.5,
      feedback: 0.3,
      wet: 0.3
    }).connect(this.masterGain);

    // Compressor for mastering
    this.effects.compressor = new Tone.Compressor({
      threshold: -30,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    });

    // EQ for vocal mastering
    this.effects.eq = new Tone.Filter({
      frequency: 1000,
      type: 'peaking',
      gain: 0
    });

    // Distortion
    this.effects.distortion = new Tone.Distortion({
      distortion: 0.3
    });
  }

  /**
   * Generate a beat pattern
   * @param {Object} config - Beat configuration
   * @param {String} config.tempo - BPM (e.g., 120)
   * @param {String} config.pattern - Beat pattern (e.g., "kick-snare-kick-hihat")
   * @param {String} config.duration - Duration in measures
   */
  generateBeat(config) {
    const { tempo = 120, pattern = '4/4', duration = 8 } = config;
    Tone.Transport.bpm.value = tempo;

    const now = Tone.now();
    const sixteenth = Tone.Time('16n').toSeconds();

    // Default 4/4 beat pattern
    const beatPatterns = {
      '4/4': [
        { time: 0, drum: 'kick', vel: 1 },
        { time: 2, drum: 'hihat', vel: 0.8 },
        { time: 4, drum: 'snare', vel: 1 },
        { time: 6, drum: 'hihat', vel: 0.8 },
        { time: 8, drum: 'kick', vel: 1 },
        { time: 10, drum: 'hihat', vel: 0.8 },
        { time: 12, drum: 'snare', vel: 1 },
        { time: 14, drum: 'hihat', vel: 0.8 }
      ],
      'trap': [
        { time: 0, drum: 'kick', vel: 1 },
        { time: 1, drum: 'hihat', vel: 0.6 },
        { time: 2, drum: 'hihat', vel: 0.6 },
        { time: 4, drum: 'kick', vel: 1 },
        { time: 5, drum: 'hihat', vel: 0.6 },
        { time: 6, drum: 'snare', vel: 1 },
        { time: 7, drum: 'hihat', vel: 0.6 }
      ],
      'hiphop': [
        { time: 0, drum: 'kick', vel: 1 },
        { time: 2, drum: 'kick', vel: 0.7 },
        { time: 4, drum: 'snare', vel: 1 },
        { time: 6, drum: 'kick', vel: 0.7 },
        { time: 8, drum: 'kick', vel: 1 },
        { time: 10, drum: 'hihat', vel: 0.8 },
        { time: 12, drum: 'snare', vel: 1 },
        { time: 14, drum: 'hihat', vel: 0.8 }
      ]
    };

    const selectedPattern = beatPatterns[pattern] || beatPatterns['4/4'];
    
    return {
      tempo,
      pattern,
      duration,
      beatMap: selectedPattern,
      startTime: now
    };
  }

  /**
   * Play drum sound
   */
  playDrum(drumType, time = Tone.now(), velocity = 1) {
    if (drumType === 'kick') {
      this.drums.kick.triggerAttackRelease('C1', '8n', time, velocity);
    } else if (drumType === 'snare') {
      this.drums.snare.triggerAttack(time, velocity);
      this.drums.snare.triggerRelease(time + 0.1);
    } else if (drumType === 'hihat') {
      this.drums.hihat.triggerAttack(time, velocity * 0.6);
      this.drums.hihat.triggerRelease(time + 0.05);
    }
  }

  /**
   * Apply reverb effect
   */
  applyReverb(amount = 0.5) {
    this.effects.reverb.wet.value = amount;
    return this.effects.reverb;
  }

  /**
   * Apply delay effect
   */
  applyDelay(time = 0.5, feedback = 0.3, wet = 0.3) {
    this.effects.delay.delayTime.value = time;
    this.effects.delay.feedback.value = feedback;
    this.effects.delay.wet.value = wet;
    return this.effects.delay;
  }

  /**
   * Set master volume
   */
  setMasterVolume(value) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  /**
   * Start transport
   */
  startPlayback() {
    Tone.Transport.start();
  }

  /**
   * Stop transport
   */
  stopPlayback() {
    Tone.Transport.stop();
  }

  /**
   * Get current playback position
   */
  getPlaybackPosition() {
    return Tone.Transport.position;
  }
}

export default AudioEngine;
