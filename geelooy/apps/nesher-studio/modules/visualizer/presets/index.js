/* B"H
Preset catalog: every visualizer garment is named and selectable.
*/
import { circularWavePreset } from './circularWavePreset.js';
import { hebrewOrbitPreset } from './hebrewOrbitPreset.js';
import { hebrewRainPreset } from './hebrewRainPreset.js';
import { particleGalaxyPreset } from './particleGalaxyPreset.js';
import { spectrumBarsPreset } from './spectrumBarsPreset.js';
export const VISUALIZER_PRESETS = [hebrewOrbitPreset, spectrumBarsPreset, circularWavePreset, hebrewRainPreset, particleGalaxyPreset];
export function presetById(id) { return VISUALIZER_PRESETS.find(p => p.id === id) || hebrewOrbitPreset; }
export function applyPreset(settings, id) { const preset = presetById(id); return Object.assign(settings, preset.defaults, { preset:preset.id }); }
