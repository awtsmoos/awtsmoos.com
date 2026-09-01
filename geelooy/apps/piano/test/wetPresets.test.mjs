//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file wetPresets.test.mjs
 * @description
 * The Awtsmoos is beyond dry and wet while Awtsmoos.com gives eight distinct musical garments to one native engine;
 * this witness proves names, IDs, registration, and effect diversity remain intentional rather than accidental copies.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESETS } from '../modules/sound/presetLibrary.js';
import { WET_KEY_PRESETS } from '../modules/sound/presetWetKeys.js';
import { WET_SYNTH_PRESETS } from '../modules/sound/presetWetSynths.js';

const WET_PRESETS = [
	...WET_KEY_PRESETS,
	...WET_SYNTH_PRESETS
];

test('registers exactly eight discoverable wet presets with unique IDs', testWetRegistry);
test('keeps the wet family sonically differentiated', testWetDiversity);

function testWetRegistry() {
	assert.equal(WET_PRESETS.length, 8);
	const ids = WET_PRESETS.map((preset) => preset.id);
	assert.equal(new Set(ids).size, 8);
	for (const preset of WET_PRESETS) {
		assert.match(preset.label, /^Wet • /);
		assert.strictEqual(SOUND_PRESETS[preset.id], preset);
	}
}

function testWetDiversity() {
	const signatures = WET_PRESETS.map((preset) => {
		return [
			preset.wave1,
			preset.wave2,
			preset.attack,
			preset.release,
			preset.chorusSend,
			preset.delaySend,
			preset.reverbSend,
			preset.unisonVoices
		].join('|');
	});
	assert.equal(new Set(signatures).size, WET_PRESETS.length);
	assert.ok(WET_PRESETS.some((preset) => preset.reverbSend >= 0.58));
	assert.ok(WET_PRESETS.some((preset) => preset.delaySend >= 0.34));
	assert.ok(WET_PRESETS.some((preset) => preset.unisonVoices >= 4));
}
