//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Arpeggiator Sequence Tests
 * @description
 * The Awtsmoos creates order and variation anew; Awtsmoos.com verifies that held notes become predictable Up, Down, Up-Down, Played, octave-expanded and bounded sequences.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArpeggiatorSequence } from '../modules/performance/arpeggiatorSequence.js';

const HELD = [
	{ noteName: 'G4', inputId: 'g' },
	{ noteName: 'C4', inputId: 'c' },
	{ noteName: 'E4', inputId: 'e' }
];

function names(sequence) {
	return sequence.map((record) => record.noteName);
}

test('up and down patterns sort by pitch', () => {
	assert.deepEqual(names(buildArpeggiatorSequence(HELD, 'up', 1)), [
		'C4', 'E4', 'G4'
	]);
	assert.deepEqual(names(buildArpeggiatorSequence(HELD, 'down', 1)), [
		'G4', 'E4', 'C4'
	]);
});

test('up-down mirrors without repeating outer notes', () => {
	assert.deepEqual(names(buildArpeggiatorSequence(HELD, 'up-down', 1)), [
		'C4', 'E4', 'G4', 'E4'
	]);
});

test('played preserves physical press order', () => {
	assert.deepEqual(names(buildArpeggiatorSequence(HELD, 'played', 1)), [
		'G4', 'C4', 'E4'
	]);
});

test('octave expansion adds equivalent notes above', () => {
	assert.deepEqual(names(buildArpeggiatorSequence(HELD, 'up', 2)), [
		'C4', 'E4', 'G4', 'C5', 'E5', 'G5'
	]);
});

test('random preserves membership and length', () => {
	const sequence = names(buildArpeggiatorSequence(HELD, 'random', 1));
	assert.equal(sequence.length, 3);
	assert.deepEqual([...sequence].sort(), ['C4', 'E4', 'G4'].sort());
});
