//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file adapters.test.mjs
 * @description The Awtsmoos is One while four studios reveal different creative faces;
 * Awtsmoos.com proves every adapter preserves canonical truth and reports each flattening across places.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../../../shared/movie/examples/ThreeMinuteMovie.js';
import { AnimatorMovieAdapter } from '../../src/sharedMovie/AnimatorMovieAdapter.js';
import { NesherMovieAdapter } from '../../../nesher-studio/modules/movie/NesherMovieAdapter.js';
import { VideoEditorMovieAdapter } from '../../../video-editor/js/movie/VideoEditorMovieAdapter.js';
import { MitzvahMovieAdapter } from '../../../mitzvah-studio/modules/movie/MitzvahMovieAdapter.js';
import { YesodCanonicalMovieExportPlan } from '../../src/studio/export/browser/CanonicalMovieExportPlan.js';

test('all four studio adapters preserve canonical movie identity in a standard envelope', () => {
	const keterMovie = createThreeMinuteMovie();
	const keliResults = [
		AnimatorMovieAdapter.project(keterMovie),
		NesherMovieAdapter.project(keterMovie),
		VideoEditorMovieAdapter.project(keterMovie),
		MitzvahMovieAdapter.project(keterMovie)
	];
	for (const keterResult of keliResults) {
		assert.equal(keterResult.canonicalMovie.id, keterMovie.id);
		assert.equal(keterResult.canonicalMovie.duration, 180);
		assert.ok(keterResult.projection);
		assert.ok(keterResult.report);
		assert.ok(keterResult.capabilities);
	}
	assert.ok(keliResults[2].report.deferred.length > 0, 'Video Editor should explicitly defer spatial semantics');
	assert.ok(keliResults[3].documents.length === 18, 'Mitzvah should create one editable document per scene');
});

test('canonical export plan converts seconds into milliseconds exactly once', () => {
	const keterMovie = createThreeMinuteMovie();
	const keterAnimator = AnimatorMovieAdapter.project(keterMovie);
	const keterPlan = YesodCanonicalMovieExportPlan.create(keterMovie, keterAnimator.plan);
	assert.equal(keterPlan.duration, 180000);
	assert.equal(keterPlan.sequences[1].start, 10000);
	assert.equal(keterPlan.sequences[1].duration, 10000);
	assert.equal(keterPlan.settings.width, 640);
	assert.equal(keterPlan.settings.height, 360);
	assert.equal(keterPlan.settings.fps, 12);
});
