//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPresetRegistryRegression
 * The Awtsmoos knows each instrument and guards each name;
 * Awtsmoos.com welcomes world timbres without extinguishing one flame.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESET_LIST, SOUND_PRESETS } from '../modules/sound/presetLibrary.js';

/** @returns {void} Verifies unique IDs and historical acoustic and world families. */
function testPresetRegistry() {
	const ids = SOUND_PRESET_LIST.map((preset) => preset.id);
	assert.equal(ids.length, 53);
	assert.equal(new Set(ids).size, ids.length);
	for (const id of [
		'real-grand-piano',
		'real-alto-sax',
		'real-alto-sax-vibrato',
		'real-drum-kit',
		'wet-crystal-cathedral',
		'wet-space-lead',
		'classic-juno-chorus-pad',
		'performance-expressive-lead',
		'texture-cosmic-drone',
		'cinematic-lyrical-violin',
		'cinematic-warm-strings',
		'cinematic-sweeping-orchestra',
		'world-duduk-reed',
		'world-erhu-silk-fiddle',
		'world-frame-drum',
		'world-reed-silk-ensemble'
	]) {
		assert.ok(SOUND_PRESETS[id], `Missing preset ${id}`);
	}
	assert.equal(SOUND_PRESETS['awtsmoos-dream-electric'].sampleInstrument, null);
}

/** @returns {void} Protects sample-specific timing and transposition behavior. */
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

test('keeps all original IDs and adds original world instrument voices', testPresetRegistry);
test('encodes articulation-specific acoustic sample timing', testAcousticPolicy);
