import express from 'express';
import BeatGenerator from '../utils/beatGenerator.js';

const router = express.Router();
const beatGen = new BeatGenerator();

/**
 * POST /api/beat/generate-from-description
 * Generate beat from natural language description
 */
router.post('/generate-from-description', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    await beatGen.initialize();
    const beat = await beatGen.generateFromDescription(description);
    
    res.json({
      status: 'success',
      beat: beat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/beat/preset
 * Create beat from preset
 */
router.post('/preset', async (req, res) => {
  try {
    const { presetName } = req.body;
    
    if (!presetName) {
      return res.status(400).json({ error: 'Preset name is required' });
    }

    await beatGen.initialize();
    const beat = beatGen.createFromPreset(presetName);
    
    res.json({
      status: 'success',
      beat: beat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/beat/custom
 * Create custom beat
 */
router.post('/custom', async (req, res) => {
  try {
    const { tempo = 120, timeSignature = '4/4', duration = 8, instruments = ['kick', 'snare', 'hihat'] } = req.body;

    await beatGen.initialize();
    const beat = beatGen.createCustomBeat({
      tempo,
      timeSignature,
      duration,
      instruments
    });
    
    res.json({
      status: 'success',
      beat: beat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/beat/presets
 * Get available presets
 */
router.get('/presets', (req, res) => {
  try {
    const presets = beatGen.patterns;
    res.json({
      status: 'success',
      presets: presets,
      count: Object.keys(presets).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/beat/play
 * Play a beat
 */
router.post('/play', async (req, res) => {
  try {
    const { beat } = req.body;
    
    if (!beat) {
      return res.status(400).json({ error: 'Beat configuration is required' });
    }

    await beatGen.initialize();
    const result = beatGen.playBeat(beat);
    
    res.json({
      status: 'success',
      playback: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/beat/stop
 * Stop beat playback
 */
router.post('/stop', (req, res) => {
  try {
    const result = beatGen.stopBeat();
    res.json({
      status: 'success',
      result: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
