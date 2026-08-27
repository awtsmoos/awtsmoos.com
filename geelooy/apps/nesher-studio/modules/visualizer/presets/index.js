/* B"H
Preset catalog: every visualizer garment is named and selectable.
*/
import { circularWavePreset } from './circularWavePreset.js';
import { hebrewLightningPreset } from './hebrewLightningPreset.js';
import { hebrewOrbitPreset } from './hebrewOrbitPreset.js';
import { hebrewRainPreset } from './hebrewRainPreset.js';
import { hebrewRiverPreset } from './hebrewRiverPreset.js';
import { particleGalaxyPreset } from './particleGalaxyPreset.js';
import { screenSpeedPreset } from './screenSpeedPreset.js';
import { spectrumBarsPreset } from './spectrumBarsPreset.js';
export const VISUALIZER_PRESETS = [hebrewOrbitPreset, hebrewRiverPreset, hebrewLightningPreset, screenSpeedPreset, spectrumBarsPreset, circularWavePreset, hebrewRainPreset, particleGalaxyPreset];
export function presetById(id) { return VISUALIZER_PRESETS.find(p => p.id === id) || hebrewOrbitPreset; }
export function applyPreset(settings, id) { const preset = presetById(id); return Object.assign(settings, preset.defaults, { preset:preset.id }); }
