// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortCompositionProfiles.test.mjs
 * @description Guards portrait composition so speaker and captions cannot crowd the broad river or midground Chossid.
 * The Awtsmoos contains voice, witness, water, and world without one finite vessel swallowing another;
 * Awtsmoos.com tests relationships and bounded zones instead of fossilizing yesterday's oversized overlay coordinates.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieShortProject } from '../movie/shorts/MovieShortCompiler.js';
import {
	listMovieShortCompositionProfiles,
	resolveMovieShortCompositionProfile
} from '../movie/shorts/MovieShortCompositionProfiles.js';

function source(layout) {
	return {
		beats: [
			{ duration: 10, text: 'River one', visual: 'river-garden' },
			{ duration: 10, text: 'River two', visual: 'infinite-light' },
			{ duration: 10, text: 'River three', visual: 'world-renewed' }
		],
		layout,
		speaker: { height: 720, url: '/speaker.mp4', width: 1280 },
		title: 'Shared World'
	};
}

test('world-first keeps speaker small while broad water and midground character own the portrait', () => {
	const project = compileMovieShortProject(source());
	const speaker = project.metadata.shortSpeakerLayout;
	const zones = project.metadata.shortLayoutZones;
	assert.equal(project.metadata.shortLayout, 'world-first');
	assert.ok(speaker.width <= 340 && speaker.height <= 190);
	assert.ok(speaker.x >= 680 && speaker.y <= 340);
	assert.equal(zones.heroWorld.width, 1080);
	assert.ok(zones.character.width >= 300 && zones.character.height >= 500);
	assert.ok(zones.heroWater.width >= 620 && zones.heroWater.height >= 700);
	assert.ok(zones.captions.height <= 200);
});

test('speaker-forward remains bounded and leaves most portrait width to the world', () => {
	const project = compileMovieShortProject(source('speaker-forward'));
	const speaker = project.metadata.shortSpeakerLayout;
	assert.ok(speaker.width <= 520);
	assert.ok(speaker.width < 1080 * 0.5);
	assert.ok(speaker.x >= 500);
	assert.equal(project.metadata.shortLayout, 'speaker-forward');
});

test('layout registry exposes five reusable composition profiles', () => {
	assert.equal(resolveMovieShortCompositionProfile().id, 'world-first');
	assert.deepEqual(
		listMovieShortCompositionProfiles().map(value => value.id),
		['world-first', 'speaker-forward', 'character-first', 'water-feature', 'landscape']
	);
	for (const profile of listMovieShortCompositionProfiles()) {
		assert.ok(profile.zones.character);
		assert.ok(profile.zones.heroWater);
		assert.ok(profile.zones.heroWorld);
		assert.ok(profile.zones.captions.height <= 200);
	}
});
