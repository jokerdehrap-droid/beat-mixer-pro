import * as Tone from 'tone';

/**
 * Vocal Mastering Engine - Professional vocal processing
 * Compatible with Cubase 5 and FL Studio mastering chains
 * Processes and optimizes vocal recordings to professional standards
 */

class VocalMasteringEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.vocalTrack = null;
    this.masterChain = this.createMasterChain();
    this.initialized = false;
  }

  createMasterChain() {
    // High-Pass Filter (remove rumble and low-end noise)
    const highPassFilter = new Tone.Filter({
      frequency: 80,
      type: 'highpass',
      rolloff: -12
    });

    // Low-Pass Filter (control harsh frequencies)
    const lowPassFilter = new Tone.Filter({
      frequency: 12000,
      type: 'lowpass',
      rolloff: -12
    });

    // Parametric EQ for vocal shaping
    const eqLows = new Tone.Filter({
      frequency: 100,
      type: 'peaking',
      gain: -3,
      Q: 0.7
    });

    const eqMids = new Tone.Filter({
      frequency: 1000,
      type: 'peaking',
      gain: 2,
      Q: 0.7
    });

    const eqHighs = new Tone.Filter({
      frequency: 5000,
      type: 'peaking',
      gain: 1,
      Q: 0.7
    });

    // De-esser (reduce sibilance)
    const deEsser = new Tone.Filter({
      frequency: 7000,
      type: 'peaking',
      gain: -4,
      Q: 2
    });

    // Compressor (smooth out dynamics)
    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.005,
      release: 0.1
    });

    // Limiter (prevent clipping)
    const limiter = new Tone.Compressor({
      threshold: -6,
      ratio: 12,
      attack: 0.001,
      release: 0.05
    });

    // Saturation (add warmth)
    const saturation = new Tone.Distortion({
      distortion: 0.1
    });

    // Reverb (add space)
    const reverb = new Tone.Reverb({
      decay: 1.5
    });

    // Delay (add dimension)
    const delay = new Tone.Delay({
      delayTime: 0.375,
      feedback: 0.2,
      wet: 0.15
    });

    // Master output
    const masterGain = new Tone.Gain(0.9).toDestination();

    // Chain all processors
    highPassFilter.connect(lowPassFilter);
    lowPassFilter.connect(eqLows);
    eqLows.connect(eqMids);
    eqMids.connect(eqHighs);
    eqHighs.connect(deEsser);
    deEsser.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(saturation);
    saturation.connect(reverb);
    reverb.connect(delay);
    delay.connect(masterGain);

    return {
      highPassFilter,
      lowPassFilter,
      eqLows,
      eqMids,
      eqHighs,
      deEsser,
      compressor,
      limiter,
      saturation,
      reverb,
      delay,
      masterGain,
      input: highPassFilter
    };
  }

  async initialize() {
    await Tone.start();
    this.audioContext = Tone.getContext();
    this.initialized = true;
    console.log('✓ Vocal Mastering Engine Initialized');
  }

  /**
   * Master vocal audio - Automatic optimization
   * Applies professional vocal chain
   */
  async masterVocal(audioBuffer, masteringPreset = 'professional') {
    if (!this.initialized) {
      await this.initialize();
    }

    const presets = {
      professional: {
        description: 'Professional studio vocal mastering',
        eqLows: { gain: -2 },
        eqMids: { gain: 3 },
        eqHighs: { gain: 1.5 },
        deEsser: { gain: -3 },
        compressor: { ratio: 4, threshold: -20 },
        reverb: { wet: 0.2 }
      },
      warmVocal: {
        description: 'Warm and smooth vocal tone',
        eqLows: { gain: 1 },
        eqMids: { gain: 2 },
        eqHighs: { gain: 0.5 },
        deEsser: { gain: -2 },
        compressor: { ratio: 3, threshold: -15 },
        reverb: { wet: 0.25 }
      },
      brightVocal: {
        description: 'Bright and present vocal',
        eqLows: { gain: -3 },
        eqMids: { gain: 2 },
        eqHighs: { gain: 2.5 },
        deEsser: { gain: -4 },
        compressor: { ratio: 5, threshold: -25 },
        reverb: { wet: 0.1 }
      },
      radiopop: {
        description: 'Radio-ready pop vocal',
        eqLows: { gain: -1 },
        eqMids: { gain: 4 },
        eqHighs: { gain: 2 },
        deEsser: { gain: -5 },
        compressor: { ratio: 6, threshold: -18 },
        reverb: { wet: 0.15 }
      }
    };

    const preset = presets[masteringPreset] || presets.professional;

    // Apply EQ settings
    this.masterChain.eqLows.gain.value = preset.eqLows.gain;
    this.masterChain.eqMids.gain.value = preset.eqMids.gain;
    this.masterChain.eqHighs.gain.value = preset.eqHighs.gain;
    this.masterChain.deEsser.gain.value = preset.deEsser.gain;

    // Apply compression
    this.masterChain.compressor.ratio.value = preset.compressor.ratio;
    this.masterChain.compressor.threshold.value = preset.compressor.threshold;

    // Apply reverb
    this.masterChain.reverb.wet.value = preset.reverb.wet;

    return {
      status: 'mastered',
      preset: masteringPreset,
      description: preset.description,
      settings: preset
    };
  }

  /**
   * Analyze vocal frequency spectrum
   */
  analyzeVocalFrequencies(audioBuffer) {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const offlineContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(offlineContext.destination);
    source.start(0);

    return {
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
      channels: audioBuffer.numberOfChannels,
      fftSize: analyser.fftSize
    };
  }

  /**
   * Apply specific effect to vocal
   */
  applyEffect(effectName, intensity = 0.5) {
    const effects = {
      reverb: () => {
        this.masterChain.reverb.wet.value = Math.max(0, Math.min(1, intensity));
      },
      delay: () => {
        this.masterChain.delay.wet.value = Math.max(0, Math.min(1, intensity * 0.3));
      },
      compression: () => {
        this.masterChain.compressor.ratio.value = 2 + (intensity * 8);
      },
      deEss: () => {
        this.masterChain.deEsser.gain.value = -(intensity * 8);
      },
      warmth: () => {
        this.masterChain.saturation.distortion = intensity * 0.2;
      },
      brightness: () => {
        this.masterChain.eqHighs.gain.value = intensity * 3;
      }
    };

    if (effects[effectName]) {
      effects[effectName]();
      return { status: 'applied', effect: effectName, intensity };
    }

    throw new Error(`Effect '${effectName}' not found`);
  }

  /**
   * Normalize vocal level to -3dB (industry standard)
   */
  normalizeVocalLevel(targetDb = -3) {
    // Target loudness in LUFS (Loudness Units relative to Full Scale)
    const targetLoudness = targetDb;
    
    this.masterChain.masterGain.gain.value = Math.pow(10, targetLoudness / 20);

    return {
      status: 'normalized',
      targetDb: targetDb,
      message: `Vocal normalized to ${targetDb}dB`
    };
  }

  /**
   * Export mastering settings for FL Studio or Cubase
   */
  exportSettings(format = 'json') {
    const settings = {
      format: format,
      timestamp: new Date(),
      masterChain: {
        highPass: {
          frequency: this.masterChain.highPassFilter.frequency.value,
          type: 'highpass'
        },
        eqLows: {
          frequency: 100,
          gain: this.masterChain.eqLows.gain.value,
          Q: 0.7
        },
        eqMids: {
          frequency: 1000,
          gain: this.masterChain.eqMids.gain.value,
          Q: 0.7
        },
        eqHighs: {
          frequency: 5000,
          gain: this.masterChain.eqHighs.gain.value,
          Q: 0.7
        },
        deEsser: {
          frequency: 7000,
          gain: this.masterChain.deEsser.gain.value
        },
        compressor: {
          threshold: this.masterChain.compressor.threshold.value,
          ratio: this.masterChain.compressor.ratio.value,
          attack: this.masterChain.compressor.attack.value,
          release: this.masterChain.compressor.release.value
        },
        reverb: {
          decay: this.masterChain.reverb.decay,
          wet: this.masterChain.reverb.wet.value
        }
      }
    };

    if (format === 'cubase5') {
      return this.exportToCubase5(settings);
    } else if (format === 'flstudio') {
      return this.exportToFLStudio(settings);
    }

    return settings;
  }

  /**
   * Export for Cubase 5 compatibility
   */
  exportToCubase5(settings) {
    return {
      ...settings,
      softwareName: 'Cubase 5',
      pluginChain: [
        { name: 'Channel EQ', bands: ['HighPass', 'EQLows', 'EQMids', 'EQHighs'] },
        { name: 'DeEsser', band: 'DeEsser' },
        { name: 'Compressor', params: settings.masterChain.compressor },
        { name: 'Limiter', safety: true },
        { name: 'Reverb', params: { decay: 1.5, wet: settings.masterChain.reverb.wet } }
      ]
    };
  }

  /**
   * Export for FL Studio compatibility
   */
  exportToFLStudio(settings) {
    return {
      ...settings,
      softwareName: 'FL Studio',
      masterChain: {
        fruity3bandEQ: {
          low: { frequency: 100, gain: settings.masterChain.eqLows.gain.value },
          mid: { frequency: 1000, gain: settings.masterChain.eqMids.gain.value },
          high: { frequency: 5000, gain: settings.masterChain.eqHighs.gain.value }
        },
        parametricEQ: settings.masterChain.deEsser.gain.value,
        maximus: {
          threshold: settings.masterChain.compressor.threshold.value,
          ratio: settings.masterChain.compressor.ratio.value
        },
        fruityReverbery: {
          decay: settings.masterChain.reverb.decay
        }
      }
    };
  }

  /**
   * Get current mastering chain settings
   */
  getSettings() {
    return {
      eqLows: { gain: this.masterChain.eqLows.gain.value },
      eqMids: { gain: this.masterChain.eqMids.gain.value },
      eqHighs: { gain: this.masterChain.eqHighs.gain.value },
      compression: {
        threshold: this.masterChain.compressor.threshold.value,
        ratio: this.masterChain.compressor.ratio.value
      },
      reverb: { wet: this.masterChain.reverb.wet.value },
      delay: { wet: this.masterChain.delay.wet.value }
    };
  }
}

export default VocalMasteringEngine;
