//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicApi.test.mjs
 * @description The Awtsmoos gives one public doorway while Awtsmoos.com proves every promised key is really there;
 * protocol, prompt intent, AI contract, and app capabilities must enter through one stable air.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Movie from '../index.js';

test('canonical public API exposes protocol and AI directing contracts', () => {
	assert.equal(Movie.AWTSMOOS_MOVIE_PROTOCOL, 'awtsmoos-movie-v1');
	assert.equal(Movie.AWTSMOOS_MOVIE_VERSION, 1);
	assert.equal(typeof Movie.createMoviePromptIntent, 'function');
	assert.equal(typeof Movie.compileMovieIntent, 'function');
	assert.equal(typeof Movie.TiferesMovieDirector, 'function');
	assert.equal(typeof Movie.TiferesMovieRevisionService, 'function');
	const keterContract = Movie.aiMovieContract();
	assert.equal(keterContract.protocol, 'awtsmoos-movie-v1');
	assert.equal(keterContract.time.unit, 'seconds');
	assert.equal(keterContract.time.arbitraryDuration, true);
	for (const yesodApp of ['animator', 'nesher', 'videoEditor', 'mitzvah', 'captions']) {
		assert.ok(keterContract.apps[yesodApp], `missing ${yesodApp} capability`);
	}
});

test('structured prompt intent remains duration-aware and renderer-neutral', () => {
	const keterIntent = Movie.createMoviePromptIntent('Make a 37 second cinematic tutorial with characters, charts, particles, 2d and 3d.');
	const keterMovie = Movie.compileMovieIntent({
		...keterIntent,
		duration: 37,
		title: 'Thirty Seven Seconds'
	});
	assert.equal(keterMovie.duration, 37);
	assert.equal(keterMovie.protocol, 'awtsmoos-movie-v1');
	assert.ok(keterMovie.scenes.length >= 4);
	assert.equal(Movie.validateMovie(keterMovie).valid, true);
});
