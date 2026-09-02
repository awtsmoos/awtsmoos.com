//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file songSections.test.mjs
 * @description
 * The Awtsmoos is indivisible while Awtsmoos.com proves that finite bar-sections can be measured, compared, and rearranged without losing their source timing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSong } from '../modules/workstation/song/songModel.js';
import {
	buildSongSections,
	densestSection,
	songLengthBeats
} from '../modules/workstation/song/songSections.js';

function sampleSong() {
	return createSong({
		beatsPerBar: 4,
		events: [
			{ start: 0, duration: 1, note: 'C4', velocity: 0.6 },
			{ start: 1, duration: 0.5, note: 'E4', velocity: 0.7 },
			{ start: 3.5, duration: 0.5, note: 'G4', velocity: 0.8 },
			{ start: 4, duration: 1, note: 'C5', velocity: 0.9 },
			{ start: 5.5, duration: 0.5, note: 'E5', velocity: 0.8 },
			{ start: 8, duration: 0.25, note: 'G5', velocity: 0.7 }
		]
	});
}

test('splits song into bar-aligned sections with local event starts', () => {
	const sections = buildSongSections(sampleSong(), 1);
	assert.equal(sections.length, 3);
	assert.deepEqual(
		sections.map((section) => section.events.map((event) => event.start)),
		[[0, 1, 3.5], [0, 1.5], [0]]
	);
	assert.deepEqual(sections.map((section) => section.length), [4, 4, 4]);
});

test('densestSection returns the section with the most note events', () => {
	const sections = buildSongSections(sampleSong(), 1);
	assert.equal(densestSection(sections)?.index, 0);
});

test('songLengthBeats includes the final note duration', () => {
	assert.equal(songLengthBeats(sampleSong()), 8.25);
});

test('empty song still produces one usable section', () => {
	const sections = buildSongSections(createSong({ events: [] }), 2);
	assert.equal(sections.length, 1);
	assert.equal(sections[0].length, 8);
	assert.deepEqual(sections[0].events, []);
});
