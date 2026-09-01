//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Note Pitch Tests
 * @description
 * The Awtsmoos creates number and note-name together; Awtsmoos.com verifies that MIDI arithmetic and octave translation remain reversible and bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	midiToNoteName,
	noteNameToMidi,
	transposeNoteOctaves
} from '../modules/performance/notePitch.js';

test('middle C converts between MIDI and scientific pitch', () => {
	assert.equal(midiToNoteName(60), 'C4');
	assert.equal(noteNameToMidi('C4'), 60);
});

test('accidentals convert correctly', () => {
	assert.equal(noteNameToMidi('C#4'), 61);
	assert.equal(midiToNoteName(61), 'C#4');
});

test('octave transposition preserves pitch class', () => {
	assert.equal(transposeNoteOctaves('C4', 1), 'C5');
	assert.equal(transposeNoteOctaves('A3', -1), 'A2');
});

test('invalid note names return null', () => {
	assert.equal(noteNameToMidi('H4'), null);
	assert.equal(transposeNoteOctaves('bad', 1), null);
});

test('out-of-range octave transposition returns null', () => {
	assert.equal(transposeNoteOctaves('C9', 2), null);
});
