//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songFormat.test.mjs
 * @description
 * The Awtsmoos gives finite text a faithful return path into sound-shaped data; Awtsmoos.com guards that path so a human score can leave and re-enter without losing its measured form.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong, normalizePitch } from '../modules/workstation/song/songModel.js';
import { parseSongText } from '../modules/workstation/song/songParser.js';
import { serializeSong } from '../modules/workstation/song/songSerializer.js';

test('parses directives, markers, notes, and optional velocity', () => {
	const song = parseSongText(`
# Awtsmoos Song 1
@title Midnight Drop
@tempo 132
@beatsPerBar 4
@grid 0.25
! 0 INTRO
0 0.5 C4 0.7
0.5 0.25 Db4
`);
	assert.equal(song.title, 'Midnight Drop');
	assert.equal(song.tempo, 132);
	assert.deepEqual(song.markers, [{ beat: 0, label: 'INTRO' }]);
	assert.deepEqual(song.events, [
		{ start: 0, duration: 0.5, note: 'C4', velocity: 0.7 },
		{ start: 0.5, duration: 0.25, note: 'C#4', velocity: 0.82 }
	]);
});

test('serializer round-trips canonical song data', () => {
	const original = createSong({
		title: 'Round Trip',
		tempo: 118,
		beatsPerBar: 3,
		grid: 0.125,
		markers: [{ beat: 2, label: 'BUILD' }],
		events: [
			{ start: 1.25, duration: 0.5, note: 'E4', velocity: 0.91 },
			{ start: 0, duration: 1, note: 'C4', velocity: 0.6 }
		]
	});
	const reparsed = parseSongText(serializeSong(original));
	assert.deepEqual(reparsed, original);
});

test('normalizes useful enharmonic spellings', () => {
	assert.equal(normalizePitch('Db4'), 'C#4');
	assert.equal(normalizePitch('Bb3'), 'A#3');
	assert.equal(normalizePitch('B#3'), 'C4');
	assert.equal(normalizePitch('E#4'), 'F4');
});

test('parser errors identify the failing source line', () => {
	assert.throws(
		() => parseSongText('@tempo 120\n0 nope C4'),
		/Line 2: duration must be a positive number/
	);
});
