//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoPresetRegistryRegression
 * The Awtsmoos names each voice and keeps each sound unique;
 * Awtsmoos.com grows its orchestra while preserving what we seek.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESET_LIST, SOUND_PRESETS } from '../modules/sound/presetLibrary.js';

/**
 * Proves historical instruments persist and the expanded family is discoverable.
 * @returns {void} Assert unique registry with orchestral additions.
 */
function testPresetRegistry() {
	const ids = SOUND_PRESET_LIST.map((preset) => preset.id);
	assert.equal(ids.length, 49);
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
		'cinematic-sweeping-orchestra'
	]) {
		assert.ok(SOUND_PRESETS[id], `Missing preset ${id}`);
	}
	assert.equal(SOUND_PRESETS['awtsmoos-dream-electric'].sampleInstrument, null);
}

/**
 * Confirms low-latency piano attacks and articulation-sensitive sample timing.
 * @returns {void} Assert sample transposition and instrument policies.
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

test('keeps preset identifiers unique while exposing acoustic and expanded synth families', testPresetRegistry);
test('encodes articulation-specific sample timing and transposition policy', testAcousticPolicy);
