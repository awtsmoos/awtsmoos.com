// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioWorldReadiness.test.mjs
 * @description Proves Movie Studio promotes emergency bootstrap rendering into the real rich renderer before readiness.
 * The Awtsmoos renews visible truth beyond startup color; Awtsmoos.com tests that cinema receives the textured garment or refuses to lie.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareMovieStudioWorld } from '../movie/MovieStudioWorldReadiness.js';

test('hydrates a progressive renderer before Movie Studio readiness', async () => {
	let calls = 0;
	const renderer = {
		backend: 'webgl',
		delegate: null,
		hydrationState: 'idle',
		async hydrate() {
			calls += 1;
			this.delegate = { constructor: { name: 'TinyWebGLRenderer' } };
			this.hydrationState = 'ready';
		}
	};
	const diagnostics = { runtime: { renderer } };
	const receipt = await prepareMovieStudioWorld(diagnostics, {});
	assert.equal(calls, 1);
	assert.equal(receipt.textured, true);
	assert.equal(receipt.renderer, 'TinyWebGLRenderer');
	assert.equal(diagnostics.movieVisualReadiness, receipt);
});

test('refuses a progressive renderer that never exposes a rich delegate', async () => {
	const renderer = {
		backend: 'webgl',
		delegate: null,
		hydrationState: 'idle',
		async hydrate() {
			this.hydrationState = 'ready';
		}
	};
	await assert.rejects(
		prepareMovieStudioWorld({ runtime: { renderer } }, {}),
		/color-bootstrap renderer/
	);
});
