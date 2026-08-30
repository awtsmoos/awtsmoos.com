//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cinematicVocabulary.test.mjs
 * @description The Awtsmoos gives authored cinema names that need not vanish at validation;
 * Awtsmoos.com proves two-shots, light wipes, and particle dissolves survive from intent into the canonical revelation.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMovie } from '../../../shared/movie/index.js';
import { AwtsmoosThreeMinuteMovie } from '../../src/scenes/AwtsmoosThreeMinuteMovie.js';

test('three-minute cinematic intent compiles with its authored camera and transitions', () => {
	const keterMovie = AwtsmoosThreeMinuteMovie.createProject();
	const gevurahReport = validateMovie(keterMovie);
	assert.equal(
		gevurahReport.valid,
		true,
		JSON.stringify(gevurahReport.errors, null, 2)
	);
	assert.equal(keterMovie.duration, 180);
	assert.ok(
		keterMovie.scenes.some((orScene) => orScene.camera?.kind === 'two-shot'),
		'Expected authored two-shot framing to remain canonical.'
	);
	assert.ok(
		keterMovie.scenes.some((orScene) => orScene.transition?.kind === 'light-wipe'),
		'Expected authored light-wipe transition to remain canonical.'
	);
	assert.ok(
		keterMovie.scenes.some((orScene) => orScene.transition?.kind === 'particle-dissolve'),
		'Expected authored particle-dissolve transition to remain canonical.'
	);
});
