//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicApi.test.mjs
 * @description The Awtsmoos gives external agents a machine doorway while Awtsmoos.com keeps language interpretation outside;
 * protocol, validation, data bridge, patches, capabilities, and rendering are public; prompt authorship is denied throughout.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import * as Movie from '../index.js';

test('canonical public API exposes a data-only external-agent contract', () => {
	assert.equal(Movie.AWTSMOOS_MOVIE_PROTOCOL, 'awtsmoos-movie-v1');
	assert.equal(Movie.AWTSMOOS_MOVIE_VERSION, 1);
	assert.equal(typeof Movie.movieAgentContract, 'function');
	assert.equal(typeof Movie.YesodMovieAgentBridge, 'function');
	assert.equal(typeof Movie.MalchusMovieDataState, 'function');
	assert.equal(typeof Movie.installMovieDataRuntime, 'function');
	const contract = Movie.movieAgentContract();
	assert.equal(contract.authoringAuthority, 'external-agent');
	assert.equal(contract.naturalLanguage, false);
	assert.equal(contract.input.kind, 'canonical-movie-object');
	assert.ok(contract.api.includes('loadMovie'));
	assert.ok(contract.api.includes('applyPatches'));
});

test('prompt, intent, provider, and internal director authorship are absent from public API', () => {
	for (const forbidden of [
		'createMoviePromptIntent',
		'compileMovieIntent',
		'TiferesMovieDirector',
		'TiferesMovieRevisionService',
		'ChochmahMovieAiProvider'
	]) {
		assert.equal(forbidden in Movie, false, `${forbidden} must not be public`);
	}
});
