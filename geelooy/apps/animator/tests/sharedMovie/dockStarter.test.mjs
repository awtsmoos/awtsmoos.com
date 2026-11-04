// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPhotoStoryTemplate } from '../../../shared/movie/examples/InstantMovieTemplates.js';
import { gevurahValidateMovie } from '../../../shared/movie/schema/MovieValidator.js';
import { AnimatorMovieAdapter } from '../../src/sharedMovie/AnimatorMovieAdapter.js';

/**
 * The Animator dock's first-boot contract: with nothing stored, the dock must
 * open on a real canonical movie, or "Copy current data" copies nothing and
 * "Load canonical data" can only ever fail — the canonical round-trip is then
 * unexercisable from the UI (the acceptance defect this file guards).
 */
test('the dock starter movie is validator-clean and projects through the Animator adapter', () => {
	const starter = createPhotoStoryTemplate();
	const report = gevurahValidateMovie(starter);
	assert.equal(report.valid, true, JSON.stringify(report.errors));
	const projection = AnimatorMovieAdapter.project(starter);
	assert.ok(projection.plan, 'the starter must produce a playable Animator plan');
	assert.equal(projection.report.deferred.length, 0, 'the starter must not defer any scene on the stage bridge');
});

test('the Animator dock installer falls back to the starter only when nothing is stored', async () => {
	const source = await readFile(new URL('../../src/sharedMovie/installMovieAi.js', import.meta.url), 'utf8');
	assert.match(
		source,
		/initialMovie: persistence\.readStoredMovie\(\) \|\| createPhotoStoryTemplate\(\)/,
		'a stored movie always wins; the starter only fills a genuinely empty dock'
	);
});
