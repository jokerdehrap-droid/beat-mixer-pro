import AudioEngine from './audioEngine.js';

/**
 * Beat Generator - Create beats like FL Studio
 * Supports AI-powered beat creation or manual patterns
 */

class BeatGenerator {
  constructor() {
    this.audioEngine = new AudioEngine();
    this.currentBeat = null;
    this.patterns = this.loadPatterns();
  }

  async initialize() {
    await this.audioEngine.initialize();
  }

  loadPatterns() {
    return {
      trap: {
        name: 'Trap',
        bpm: 140,
        pattern: 'trap',
        description: 'Hard hitting trap beats with hi-hats'
      },
      hiphop: {
        name: 'Hip-Hop',
        bpm: 90,
        pattern: 'hiphop',
        description: 'Classic hip-hop groove'
      },
      edm: {
        name: 'EDM',
        bpm: 128,
        pattern: '4/4',
        description: 'Electronic dance music pattern'
      },
      dnb: {
        name: 'Drum & Bass',
        bpm: 170,
        pattern: 'dnb',
        description: 'Fast-paced drum and bass'
      },
      reggae: {
        name: 'Reggae',
        bpm: 76,
        pattern: 'reggae',
        description: 'Laid-back reggae rhythm'
      }
    };
  }

  /**
   * Generate beat from description using AI
   * @param {String} description - Natural language description (e.g., "fast trap beat with heavy 808s")
   * @returns {Object} Generated beat configuration
   */
  async generateFromDescription(description) {
    console.log('🎵 Generating beat from description:', description);

    // AI-powered beat generation logic
    const beatConfig = this.analyzeDescription(description);
    
    return {
      ...beatConfig,
      timestamp: new Date(),
      description: description,
      status: 'generated'
    };
  }

  analyzeDescription(description) {
    const desc = description.toLowerCase();
    
    // Analyze tempo keywords
    let tempo = 120;
    if (desc.includes('slow')) tempo = 85;
    if (desc.includes('fast') || desc.includes('quick')) tempo = 140;
    if (desc.includes('trap')) tempo = 140;
    if (desc.includes('hip-hop')) tempo = 90;
    if (desc.includes('edm') || desc.includes('house')) tempo = 128;
    if (desc.includes('dnb') || desc.includes('drum and bass')) tempo = 170;

    // Analyze pattern keywords
    let pattern = '4/4';
    if (desc.includes('trap')) pattern = 'trap';
    if (desc.includes('hip-hop') || desc.includes('hiphop')) pattern = 'hiphop';
    if (desc.includes('reggae')) pattern = 'reggae';

    // Analyze instrumentation
    const instruments = [];
    if (desc.includes('808') || desc.includes('kick') || desc.includes('bass')) instruments.push('kick');
    if (desc.includes('snare') || desc.includes('clap')) instruments.push('snare');
    if (desc.includes('hihat') || desc.includes('hi-hat') || desc.includes('cymbal')) instruments.push('hihat');
    if (desc.includes('piano') || desc.includes('keys')) instruments.push('piano');
    if (desc.includes('bass')) instruments.push('bass');

    return {
      tempo,
      pattern,
      instruments: instruments.length > 0 ? instruments : ['kick', 'snare', 'hihat'],
      description: desc,
      duration: 8
    };
  }

  /**
   * Create beat from preset
   * @param {String} presetName - Preset name (trap, hiphop, edm, etc.)
   * @returns {Object} Beat configuration
   */
  createFromPreset(presetName) {
    const preset = this.patterns[presetName];
    if (!preset) {
      throw new Error(`Preset '${presetName}' not found`);
    }

    return this.audioEngine.generateBeat({
      tempo: preset.bpm,
      pattern: preset.pattern,
      duration: 8
    });
  }

  /**
   * Create custom beat
   * @param {Object} config - Custom beat configuration
   */
  createCustomBeat(config) {
    const {
      tempo = 120,
      timeSignature = '4/4',
      duration = 8,
      instruments = ['kick', 'snare', 'hihat']
    } = config;

    const beatMap = this.generateBeatMap(tempo, timeSignature, instruments, duration);

    return {
      tempo,
      timeSignature,
      duration,
      instruments,
      beatMap,
      custom: true
    };
  }

  /**
   * Generate beat map based on instruments and time signature
   */
  generateBeatMap(tempo, timeSignature, instruments, duration) {
    const beatMap = [];
    const sixteenthsPerMeasure = 16;
    const totalSixteenths = sixteenthsPerMeasure * duration;

    for (let i = 0; i < totalSixteenths; i++) {
      const position = i % sixteenthsPerMeasure;
      
      // Kick on beats 1 and 3
      if (instruments.includes('kick') && (position === 0 || position === 8)) {
        beatMap.push({ time: i, drum: 'kick', velocity: 1 });
      }
      
      // Snare on beats 2 and 4
      if (instruments.includes('snare') && (position === 4 || position === 12)) {
        beatMap.push({ time: i, drum: 'snare', velocity: 1 });
      }
      
      // Hi-hat on eighth notes
      if (instruments.includes('hihat') && position % 4 === 0) {
        beatMap.push({ time: i, drum: 'hihat', velocity: 0.7 });
      }
    }

    return beatMap;
  }

  /**
   * Play the current beat
   */
  playBeat(beat) {
    this.currentBeat = beat;
    this.audioEngine.setMasterVolume(0.8);

    const sixteenthDuration = (60 / beat.tempo) * 0.25; // Duration of sixteenth note
    
    beat.beatMap.forEach(({ time, drum, velocity }) => {
      const playTime = sixteenthDuration * time;
      setTimeout(() => {
        this.audioEngine.playDrum(drum, undefined, velocity);
      }, playTime * 1000);
    });

    return {
      status: 'playing',
      beat: beat.tempo,
      duration: beat.duration
    };
  }

  /**
   * Stop beat playback
   */
  stopBeat() {
    this.audioEngine.stopPlayback();
    this.currentBeat = null;
    return { status: 'stopped' };
  }

  /**
   * Export beat as configuration
   */
  exportBeat(format = 'json') {
    if (!this.currentBeat) {
      throw new Error('No beat to export');
    }

    if (format === 'json') {
      return JSON.stringify(this.currentBeat, null, 2);
    }
    
    return this.currentBeat;
  }
}

export default BeatGenerator;
