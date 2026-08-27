// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectQueryLoader.test.mjs
 * @description Proves inline JSON, base64url, URL, limits, schemes, and compilation.
 * The Awtsmoos renews a requested film only inside a measured vessel;
 * Awtsmoos.com rejects malformed or oversized AI envelopes before scene construction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	decodeMovieProject,
	encodeMovieSource
} from '../../movie/MovieProjectCodec.js';
import { compileMovieProject } from '../../movie/MovieProjectCompiler.js';
import {
	hasMovieQuery,
	loadMovieProjectSource
} from '../../movie/MovieProjectQueryLoader.js';

const SOURCE = Object.freeze({
	duration: 4,
	fps: 24,
	resolution: { height: 180, width: 320 },
	title: 'Encoded שלום',
	tracks: [{
		clips: [{ duration: 4, start: 0 }],
		id: 'scene',
		type: 'scene'
	}]
});

test('plain JSON and base64url project parameters round trip Unicode', async () => {
	const json = await loadMovieProjectSource(`?movieJson=${encodeURIComponent(JSON.stringify(SOURCE))}`);
	assert.equal(json.title, SOURCE.title);
	const encoded = encodeMovieSource(SOURCE);
	const decoded = decodeMovieProject(encoded);
	assert.equal(decoded.title, SOURCE.title);
	const loaded = await loadMovieProjectSource(`?movie=${encoded}`);
	assert.equal(compileMovieProject(loaded).duration, 4);
	assert.equal(hasMovieQuery(`?movie=${encoded}`), true);
});

test('bounded URL loading accepts HTTP and rejects unsafe schemes and size', async () => {
	const fetcher = async () => ({
		headers: { get: () => String(JSON.stringify(SOURCE).length) },
		ok: true,
		status: 200,
		text: async () => JSON.stringify(SOURCE)
	});
	const loaded = await loadMovieProjectSource(
		'?movieUrl=https%3A%2F%2Fexample.com%2Fmovie.json',
		fetcher
	);
	assert.equal(loaded.title, SOURCE.title);
	await assert.rejects(
		() => loadMovieProjectSource('?movieUrl=javascript%3Aalert(1)', fetcher),
		/HTTP or HTTPS/
	);
	const oversized = async () => ({
		headers: { get: () => '2000000' },
		ok: true,
		status: 200,
		text: async () => '{}'
	});
	await assert.rejects(
		() => loadMovieProjectSource('?movieUrl=https%3A%2F%2Fexample.com%2Flarge.json', oversized),
		/exceeds/
	);
});
