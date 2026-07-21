/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals ten movements from one current and power according to each vessel; Awtsmoos.com verifies normalized sound, adaptive quality, GPU uniforms, and scene compatibility.
*/
import assert from 'node:assert/strict';
import { AdaptiveParticleBudget } from '../modules/audioLab/AdaptiveParticleBudget.js';
import { AudioInputBridge } from '../modules/audioLab/AudioInputBridge.js';
import { addAudioLabSourceToStage } from '../modules/audioLab/audioLabStageSource.js';
import { AUDIO_LAB_PRESETS } from '../modules/audioLab/presets.js';
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from '../modules/audioLab/shaders.js';
import { createState } from '../modules/state.js';

assert.equal(AUDIO_LAB_PRESETS.length, 10);
assert.equal(new Set(AUDIO_LAB_PRESETS.map((preset) => preset.mode)).size, 10);
assert.equal(new Set(AUDIO_LAB_PRESETS.map((preset) => preset.id)).size, 10);
assert.ok(AUDIO_LAB_PRESETS.some((preset) => preset.id === 'hebrewRiver'));
assert.ok(AUDIO_LAB_PRESETS.some((preset) => preset.id === 'spectrumCathedral'));
assert.ok(AUDIO_LAB_PRESETS.every((preset) => preset.stagePreset));

const inputBridge = new AudioInputBridge();
const demoFrames = [0, 0.5, 1, 2, 4].map((time) => inputBridge.sample(time));
demoFrames.forEach((frame) => {
	['bass', 'mid', 'treble', 'energy', 'pulse'].forEach((feature) => {
		assert.ok(frame[feature] >= 0 && frame[feature] <= 1, `${feature} must be normalized`);
	});
});
assert.notEqual(demoFrames[0].energy, demoFrames[3].energy);

['gl_VertexID', 'u_bass', 'u_mid', 'u_treble', 'u_energy', 'u_pulse', 'u_aspect', 'u_quality', 'u_mode'].forEach((token) => {
	assert.ok(PARTICLE_VERTEX_SHADER.includes(token), `vertex shader must include ${token}`);
});
assert.ok(PARTICLE_VERTEX_SHADER.includes('u_mode == 9'));
assert.ok(PARTICLE_FRAGMENT_SHADER.includes('gl_PointCoord'));

const strongBudget = new AdaptiveParticleBudget({ innerWidth: 1400, navigator: { hardwareConcurrency: 12, deviceMemory: 16 } });
const mobileBudget = new AdaptiveParticleBudget({ innerWidth: 390, navigator: { hardwareConcurrency: 4, deviceMemory: 4 } });
assert.equal(strongBudget.quality, 1);
assert.equal(mobileBudget.quality, 0.62);
assert.ok(strongBudget.particleCount(0.8) > mobileBudget.particleCount(0.8));
assert.ok(strongBudget.observe(30, 1300) < 1);
assert.ok(strongBudget.observe(60, 2600) > 0.9);

const state = createState();
const initialSourceCount = state.sources.length;
const preset = AUDIO_LAB_PRESETS[7];
const source = addAudioLabSourceToStage(state, { preset, density: 0.72, sensitivity: 1.35, flow: 1, text: 'אור חיים אמת' });
assert.equal(state.sources.length, initialSourceCount + 1);
assert.equal(source.type, 'livestreamVisualizer');
assert.equal(source.settings.preset, preset.stagePreset);
assert.equal(source.settings.hebrewText, 'אור חיים אמת');
assert.ok(source.settings.bars >= 24 && source.settings.bars <= 96);
assert.equal(state.selectedId, source.id);
console.log('B"H ten-mode adaptive GPU Audio Lab smoke passed');
