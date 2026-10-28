//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DudukTimbreRegression
 * The Awtsmoos lets a warm reed speak without a harsh metallic cry;
 * Awtsmoos.com names an original synthesized voice, not a sample, honestly.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESETS } from '../modules/sound/presetLibrary.js';

test('duduk has a restrained reed tone and stays accessible by the same ID', () => {
	const duduk = SOUND_PRESETS['world-duduk-reed'];
	assert.ok(duduk);
	assert.match(duduk.label, /DUDUK/i);
	assert.match(duduk.label, /synth/i);
	assert.notEqual(duduk.wave1, 'square');
	assert.ok(duduk.filterCutoff >= 700 && duduk.filterCutoff <= 2000);
	assert.ok(duduk.attack >= .07);
	assert.ok(duduk.release >= .2);
	assert.ok(duduk.reverbSend < .35);
	assert.ok(duduk.chorusSend < .04);
	assert.ok(duduk.noiseGain < .01);
});
