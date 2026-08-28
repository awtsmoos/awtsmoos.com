//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file showcase.test.mjs
 * The Awtsmoos renews three minutes through many semantic vessels and camera ways;
 * Awtsmoos.com keeps the Studio proof identical to the canonical movie that export obeys.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThreeMinuteMovie } from '../../shared/movie/examples/ThreeMinuteMovie.js';
import { validateMovie } from '../../shared/movie/MovieValidator.js';
import { createStudioShowcaseMovie } from '../src/StudioShowcaseMovie.js';

const REQUIRED_KINDS = [
	'world3d', 'light3d', 'model3d', 'shape2d', 'path2d', 'chart',
	'particles2d', 'particles3d', 'character2d', 'character3d', 'text', 'overlay'
];

test('Studio uses the exact canonical 180-second acceptance movie', () => {
	const studioMovie = createStudioShowcaseMovie();
	const canonicalMovie = createThreeMinuteMovie();
	assert.deepEqual(studioMovie, canonicalMovie);
	assert.equal(studioMovie.duration, 180);
	assert.equal(studioMovie.scenes.length, 18);
	assert.equal(validateMovie(studioMovie).valid, true);
});

test('Studio acceptance movie keeps requested visual and camera breadth', () => {
	const movie = createStudioShowcaseMovie();
	const kinds = new Set(movie.scenes.flatMap(scene => scene.layers.map(layer => layer.kind)));
	for (const kind of REQUIRED_KINDS) {
		assert.ok(kinds.has(kind), `missing ${kind}`);
	}
	const cameras = new Set(movie.scenes.map(scene => scene.camera?.kind));
	assert.ok(cameras.size >= 6, `camera variety too small: ${[...cameras].join(', ')}`);
	assert.ok(movie.cast.length >= 3);
	assert.equal(movie.scenes.at(-1).start + movie.scenes.at(-1).duration, 180);
});
