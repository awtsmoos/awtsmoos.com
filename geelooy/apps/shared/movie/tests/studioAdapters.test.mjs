//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studioAdapters.test.mjs
 * One movie enters five different vessels while the Awtsmoos keeps the canonical source alive;
 * Awtsmoos.com proves Animator, Nesher, Mitzvah, Video Editor, and Slides can differ yet interoperate and thrive.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../examples/ThreeMinuteMovie.js';
import { AnimatorMovieAdapter } from '../../../animator/src/movie/AnimatorMovieAdapter.js';
import { MitzvahMovieAdapter } from '../../../mitzvah-studio/modules/movie/MitzvahMovieAdapter.js';
import { NesherMovieAdapter } from '../../../nesher-studio/modules/movie/NesherMovieAdapter.js';
import { VideoEditorMovieAdapter } from '../../../video-editor/js/movie/VideoEditorMovieAdapter.js';
import { SlidesMovieAdapter } from '../../../slides/src/movie/SlidesMovieAdapter.js';

function projectAll(movie) {
	return [
		['animator', new AnimatorMovieAdapter(null).compile(movie)],
		['mitzvah', MitzvahMovieAdapter.project(movie)],
		['nesher', NesherMovieAdapter.project(movie)],
		['videoEditor', VideoEditorMovieAdapter.project(movie)],
		['slides', new SlidesMovieAdapter().project(movie)]
	];
}

test('five studio personalities project one canonical three-minute movie without erasing it', () => {
	const movie = createThreeMinuteMovie();
	const results = projectAll(movie);
	assert.equal(results.length, 5);
	for (const [name, result] of results) {
		assert.equal(result.canonicalMovie.duration, 180, `${name} lost duration`);
		assert.equal(result.canonicalMovie.scenes.length, 18, `${name} lost scenes`);
		assert.ok(result.capabilities, `${name} missing capabilities`);
		assert.ok(result.report, `${name} missing fidelity report`);
	}
});

test('studio projections remain product-specific instead of becoming identical shells', () => {
	const movie = createThreeMinuteMovie();
	const results = Object.fromEntries(projectAll(movie));
	assert.ok(results.animator.shots.length > 0);
	assert.equal(results.mitzvah.documents.length, 18);
	assert.ok(results.nesher.clips.length > 18);
	assert.ok(results.videoEditor.clips.length > 0);
	assert.equal(results.slides.slides.length, 18);
	assert.ok(results.slides.report.deferred.length > 0);
	assert.equal(results.slides.capabilities.name, 'Awtsmoos Slides');
});
