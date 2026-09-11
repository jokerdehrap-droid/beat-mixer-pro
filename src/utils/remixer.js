import * as Tone from 'tone';

/**
 * Remixer - Advanced beat and audio remixing engine
 * Allows layering, tempo adjustment, and creative remixing
 */

class Remixer {
  constructor() {
    this.tracks = [];
    this.masterGain = new Tone.Gain(0.8).toDestination();
    this.effects = {};
    this.tempo = 120;
    this.initialized = false;
  }

  async initialize() {
    await Tone.start();
    this.createEffects();
    this.initialized = true;
    console.log('✓ Remixer Initialized');
  }

  createEffects() {
    // Global effects for remixing
    this.effects.reverb = new Tone.Reverb({
      decay: 2
    }).connect(this.masterGain);

    this.effects.delay = new Tone.Delay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.3
    }).connect(this.masterGain);

    this.effects.distortion = new Tone.Distortion({
      distortion: 0.3
    }).connect(this.masterGain);

    this.effects.filter = new Tone.Filter({
      frequency: 3000,
      type: 'lowpass'
    }).connect(this.masterGain);
  }

  /**
   * Add a new track to remix
   * @param {Object} config - Track configuration
   */
  addTrack(config) {
    const {
      name = `Track ${this.tracks.length + 1}`,
      type = 'audio', // audio, synth, drum
      url = null,
      volume = 1,
      muted = false,
      effectsChain = []
    } = config;

    const track = {
      id: `track_${Date.now()}`,
      name,
      type,
      url,
      volume,
      muted,
      effectsChain,
      gain: new Tone.Gain(volume),
      player: null,
      synth: null
    };

    // Create audio player or synth based on type
    if (type === 'audio' && url) {
      track.player = new Tone.Player(url).connect(track.gain);
      track.gain.connect(this.masterGain);
    } else if (type === 'synth') {
      track.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
      }).connect(track.gain);
      track.gain.connect(this.masterGain);
    }

    this.tracks.push(track);
    return track;
  }

  /**
   * Remove track from remix
   */
  removeTrack(trackId) {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index > -1) {
      const track = this.tracks[index];
      if (track.player) track.player.dispose();
      if (track.synth) track.synth.dispose();
      this.tracks.splice(index, 1);
      return { status: 'removed', trackId };
    }
    throw new Error(`Track ${trackId} not found`);
  }

  /**
   * Set track volume
   */
  setTrackVolume(trackId, volume) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);
    
    track.gain.gain.value = Math.max(0, Math.min(1, volume));
    return { status: 'updated', trackId, volume };
  }

  /**
   * Mute/unmute track
   */
  toggleTrackMute(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);
    
    track.muted = !track.muted;
    track.gain.gain.value = track.muted ? 0 : track.volume;
    return { status: 'muted', trackId, muted: track.muted };
  }

  /**
   * Change remix tempo
   */
  setTempo(bpm) {
    this.tempo = bpm;
    Tone.Transport.bpm.value = bpm;
    return { status: 'tempo_changed', bpm };
  }

  /**
   * Apply effect to specific track
   */
  applyTrackEffect(trackId, effectName, intensity = 0.5) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);

    const effects = {
      reverb: () => {
        const reverb = new Tone.Reverb({
          decay: 1 + (intensity * 2)
        }).connect(this.masterGain);
        track.gain.connect(reverb);
        track.effectsChain.push({ name: 'reverb', intensity });
      },
      delay: () => {
        const delay = new Tone.Delay({
          delayTime: '8n',
          feedback: intensity * 0.5,
          wet: intensity
        }).connect(this.masterGain);
        track.gain.connect(delay);
        track.effectsChain.push({ name: 'delay', intensity });
      },
      distortion: () => {
        const distortion = new Tone.Distortion({
          distortion: intensity * 0.5
        }).connect(this.masterGain);
        track.gain.connect(distortion);
        track.effectsChain.push({ name: 'distortion', intensity });
      },
      filter: () => {
        const filter = new Tone.Filter({
          frequency: 1000 + (intensity * 5000),
          type: 'lowpass'
        }).connect(this.masterGain);
        track.gain.connect(filter);
        track.effectsChain.push({ name: 'filter', intensity });
      }
    };

    if (effects[effectName]) {
      effects[effectName]();
      return { status: 'effect_applied', trackId, effect: effectName, intensity };
    }

    throw new Error(`Effect ${effectName} not found`);
  }

  /**
   * Play all tracks
   */
  playRemix() {
    Tone.Transport.start();
    this.tracks.forEach(track => {
      if (track.player && !track.muted) {
        track.player.start();
      }
    });
    return { status: 'playing', trackCount: this.tracks.length };
  }

  /**
   * Stop remix playback
   */
  stopRemix() {
    Tone.Transport.stop();
    this.tracks.forEach(track => {
      if (track.player) {
        track.player.stop();
      }
    });
    return { status: 'stopped' };
  }

  /**
   * Pause remix
   */
  pauseRemix() {
    Tone.Transport.pause();
    return { status: 'paused' };
  }

  /**
   * Create remix from multiple beats
   */
  createRemixFromBeats(beats, duration = 32) {
    const remix = {
      id: `remix_${Date.now()}`,
      beats: beats,
      duration: duration,
      tempo: this.tempo,
      created: new Date()
    };

    beats.forEach((beat, index) => {
      this.addTrack({
        name: `Beat ${index + 1}`,
        type: 'drum',
        url: beat.url || null,
        volume: 0.8
      });
    });

    return remix;
  }

  /**
   * Blend multiple tracks together
   * Creates a crossfade effect
   */
  blendTracks(trackId1, trackId2, duration = 2) {
    const track1 = this.tracks.find(t => t.id === trackId1);
    const track2 = this.tracks.find(t => t.id === trackId2);

    if (!track1 || !track2) throw new Error('One or both tracks not found');

    const now = Tone.now();
    
    // Fade out track 1
    track1.gain.gain.linearRampTo(0, duration, now);
    
    // Fade in track 2
    track2.gain.gain.linearRampTo(1, duration, now);

    return {
      status: 'blending',
      from: trackId1,
      to: trackId2,
      duration: duration
    };
  }

  /**
   * Loop a section of remix
   */
  loopSection(startTime, endTime) {
    Tone.Transport.loopStart = startTime;
    Tone.Transport.loopEnd = endTime;
    Tone.Transport.loop = true;

    return {
      status: 'looping',
      start: startTime,
      end: endTime
    };
  }

  /**
   * Export remix configuration
   */
  exportRemix() {
    const config = {
      id: `remix_export_${Date.now()}`,
      tempo: this.tempo,
      tracks: this.tracks.map(track => ({
        id: track.id,
        name: track.name,
        type: track.type,
        volume: track.volume,
        muted: track.muted,
        effectsChain: track.effectsChain
      })),
      masterGain: this.masterGain.gain.value
    };

    return config;
  }

  /**
   * Get remix statistics
   */
  getRemixStats() {
    return {
      trackCount: this.tracks.length,
      activeTracks: this.tracks.filter(t => !t.muted).length,
      tempo: this.tempo,
      duration: Tone.Transport.position,
      effects: Object.keys(this.effects)
    };
  }
}

export default Remixer;
