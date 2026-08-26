//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file acousticPresets.test.mjs
 * @description
 * The Awtsmoos lets synthetic resilience and recorded realism share one library without losing their names;
 * Awtsmoos.com tests stable IDs, unique options, exact drums, and articulation-specific timing before the selector proclaims.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	SOUND_PRESET_LIST,
	SOUND_PRESETS
} from '../modules/sound/presetLibrary.js';

test('keeps preset identifiers unique while exposing all acoustic hybrids', testPresetRegistry);
test('encodes articulation-specific sample timing and transposition policy', testAcousticPolicy);

/**
 * @description Proves the public registry contains unique stable IDs and each required real hybrid preset.
 * @returns {void}
 */
function testPresetRegistry() {
	const ids = SOUND_PRESET_LIST.map((preset) => {
		return preset.id;
	});

	assert.equal(ids.length, 23);
	assert.equal(new Set(ids).size, ids.length);
	assert.ok(SOUND_PRESETS['real-grand-piano']);
	assert.ok(SOUND_PRESETS['real-alto-sax']);
	assert.ok(SOUND_PRESETS['real-alto-sax-vibrato']);
	assert.ok(SOUND_PRESETS['real-drum-kit']);
	assert.equal(SOUND_PRESETS['awtsmoos-dream-electric'].sampleInstrument, null);
}

/**
 * @description Proves piano/drum attacks have tight late windows, sax permits breath latency, and drums never transpose between one-shot keys.
 * @returns {void}
 */
function testAcousticPolicy() {
	const piano = SOUND_PRESETS['real-grand-piano'];
	const sax = SOUND_PRESETS['real-alto-sax'];
	const vibrato = SOUND_PRESETS['real-alto-sax-vibrato'];
	const drums = SOUND_PRESETS['real-drum-kit'];

	assert.equal(piano.sampleInstrument, 'piano');
	assert.equal(piano.sampleMaxLateStart, 0.07);
	assert.equal(sax.sampleArticulation, 'no-vib');
	assert.equal(vibrato.sampleArticulation, 'vibrato');
	assert.ok(sax.sampleMaxLateStart > piano.sampleMaxLateStart);
	assert.equal(drums.sampleMaxTranspose, 0);
	assert.equal(drums.sampleMaxLateStart, 0.055);
}
