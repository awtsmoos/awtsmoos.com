//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WorldInstrumentsRegression
 * The Awtsmoos sends breath and bow through each measure we play;
 * Awtsmoos.com tests the tones so that no voice goes astray.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESETS, getLibraryPreset } from '../modules/sound/presetLibrary.js';
import { WORLD_WIND_PRESETS } from '../modules/sound/presetWorldWinds.js';
import { WORLD_STRING_PRESETS } from '../modules/sound/presetWorldStrings.js';
import { WORLD_RHYTHM_PRESETS } from '../modules/sound/presetWorldRhythm.js';
import { WORLD_ENSEMBLE_PRESETS } from '../modules/sound/presetWorldEnsemble.js';

const family = [
	...WORLD_WIND_PRESETS,
	...WORLD_STRING_PRESETS,
	...WORLD_RHYTHM_PRESETS,
	...WORLD_ENSEMBLE_PRESETS
];

/** @returns {void} World sounds must remain locally selectable. */
test('world voices are registered with independent identities', () => {
	assert.equal(family.length, 4);
	for (const preset of family) {
		assert.equal(getLibraryPreset(preset.id), preset);
		assert.equal(SOUND_PRESETS[preset.id], preset);
		assert.ok(preset.label.startsWith('World • '));
		assert.equal(preset.sampleInstrument, null);
		assert.ok(preset.attack >= 0);
		assert.ok(preset.release > 0);
		assert.ok(preset.outputTrim > 0 && preset.outputTrim <= .8);
		assert.ok(preset.reverbSend >= 0 && preset.reverbSend <= .6);
	}
});

/** @returns {void} Distinguishes the softened reed from strings and drum attacks. */
test('duduk, erhu and frame drum preserve distinct articulations', () => {
	const duduk = WORLD_WIND_PRESETS[0];
	const erhu = WORLD_STRING_PRESETS[0];
	const drum = WORLD_RHYTHM_PRESETS[0];
	assert.equal(duduk.wave1, 'triangle');
	assert.match(duduk.label, /DUDUK.*synth/);
	assert.ok(duduk.noiseGain >= 0 && duduk.noiseGain < .01);
	assert.ok(duduk.filterCutoff < 2000);
	assert.ok(duduk.attack > .08);
	assert.equal(erhu.wave1, 'sawtooth');
	assert.ok(erhu.vibratoCents > duduk.vibratoCents);
	assert.ok(erhu.sustain > .8);
	assert.ok(drum.attack < .01);
	assert.equal(drum.sustain, 0);
	assert.equal(drum.vibratoCents, 0);
	assert.ok(drum.decay < .2);
});

/** @returns {void} Ensemble retains its distinct composite timbre. */
test('reed and silk ensemble remains a light, playable synth patch', () => {
	const preset = WORLD_ENSEMBLE_PRESETS[0];
	assert.equal(preset.wave1, 'square');
	assert.equal(preset.wave2, 'sawtooth');
	assert.ok(preset.bodyFilters.length >= 2);
	assert.ok(preset.unisonVoices <= 2);
	assert.ok(preset.release < 2);
});
