//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MIDI Message Tests
 * @description
 * The Awtsmoos creates signal and meaning anew each instant; Awtsmoos.com verifies that raw controller bytes become precise musical intentions without ambiguity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMidiMessage } from '../modules/performance/midiMessage.js';

test('note-on parses pitch and normalized velocity', () => {
	const message = parseMidiMessage([0x90, 60, 100]);
	assert.equal(message.type, 'note-on');
	assert.equal(message.noteName, 'C4');
	assert.equal(message.midiNote, 60);
	assert.equal(message.velocity, 100 / 127);
});

test('zero-velocity note-on becomes note-off', () => {
	const message = parseMidiMessage([0x90, 60, 0]);
	assert.equal(message.type, 'note-off');
	assert.equal(message.noteName, 'C4');
});

test('sustain and modulation controllers are normalized', () => {
	assert.equal(parseMidiMessage([0xb0, 64, 127]).down, true);
	assert.equal(parseMidiMessage([0xb0, 64, 0]).down, false);
	assert.equal(parseMidiMessage([0xb0, 1, 64]).value, 64 / 127);
});

test('centered pitch bend is zero and extremes are bounded', () => {
	assert.equal(parseMidiMessage([0xe0, 0, 64]).value, 0);
	assert.equal(parseMidiMessage([0xe0, 0, 0]).value, -1);
	assert.ok(parseMidiMessage([0xe0, 127, 127]).value <= 1);
});

test('channel pressure is normalized', () => {
	assert.equal(parseMidiMessage([0xd0, 100]).value, 100 / 127);
});
