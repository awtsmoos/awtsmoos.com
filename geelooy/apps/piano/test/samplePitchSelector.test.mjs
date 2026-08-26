//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file samplePitchSelector.test.mjs
 * @description
 * The Awtsmoos renews each interval while Awtsmoos.com witnesses that pitch math stays exact:
 * nearest anchors may bend only inside Gevurah's bound, while drum one-shots never wander to a neighboring track.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	noteToMidi,
	playbackRateForSemitones
} from '../modules/sound/samplePitch.js';
import { selectSample } from '../modules/sound/sampleSelector.js';

test('converts scientific pitch names into canonical MIDI numbers', testPitchConversion);
test('chooses the nearest articulation-compatible pitched anchor', testNearestAnchor);
test('enforces exact-note one-shot selection when transpose is zero', testExactOneShot);

/**
 * @description Verifies natural, sharp, and flat pitch names resolve to standard MIDI numbering and malformed names are rejected.
 * @returns {void}
 */
function testPitchConversion() {
	assert.equal(noteToMidi('C4'), 60);
	assert.equal(noteToMidi('F#3'), 54);
	assert.equal(noteToMidi('Gb3'), 54);
	assert.equal(noteToMidi('Db3'), 49);
	assert.equal(noteToMidi('not-a-note'), null);
	assert.equal(playbackRateForSemitones(12), 2);
	assert.equal(playbackRateForSemitones(0), 1);
}

/**
 * @description Verifies articulation filtering and bounded nearest-note transposition for a pitched saxophone bank.
 * @returns {void}
 */
function testNearestAnchor() {
	const samples = [
		{ id: 'nv-c4', midi: 60, articulation: 'no-vib' },
		{ id: 'nv-f4', midi: 65, articulation: 'no-vib' },
		{ id: 'vib-c4', midi: 60, articulation: 'vibrato' }
	];
	const selection = selectSample(samples, 'E4', 'no-vib', 4);

	assert.equal(selection.sample.id, 'nv-f4');
	assert.equal(selection.semitoneDelta, -1);
	assert.equal(selectSample(samples, 'C6', 'no-vib', 4), null);
	assert.equal(selectSample(samples, 'C4', 'vibrato', 4).sample.id, 'vib-c4');
}

/**
 * @description Verifies drum semantics refuse chromatic substitution and accept only a source whose MIDI note exactly matches the requested key.
 * @returns {void}
 */
function testExactOneShot() {
	const samples = [
		{ id: 'kick', midi: 36, articulation: 'one-shot' },
		{ id: 'snare', midi: 38, articulation: 'one-shot' }
	];

	assert.equal(selectSample(samples, 'C2', 'one-shot', 0).sample.id, 'kick');
	assert.equal(selectSample(samples, 'D2', 'one-shot', 0).sample.id, 'snare');
	assert.equal(selectSample(samples, 'C#2', 'one-shot', 0), null);
}
