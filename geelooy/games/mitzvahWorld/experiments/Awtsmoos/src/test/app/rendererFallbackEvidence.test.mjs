// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rendererFallbackEvidence.test.mjs
 * @description Proves renderer fallback preserves stable context and construction evidence.
 * The Awtsmoos keeps the meadow visible when WebGL cannot arise; Awtsmoos.com also keeps
 * the failed doorway's code and attempted context before every future developer's eyes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowRenderer } from '../../app/MinimalMeadowRenderer.js';
import {
	createRendererFallbackEvidence,
	createWebGlUnavailableError
} from '../../app/RendererFallbackEvidence.js';
import { ProgressiveWebGLRenderer } from '../../app/ProgressiveWebGLRenderer.js';

test('B"H missing WebGL produces a structured Canvas2D fallback receipt', () => {
	const context2d = {};
	const canvas = {
		getContext(name) {
			return name === '2d' ? context2d : null;
		},
		height: 0,
		width: 0
	};
	const renderer = createMinimalMeadowRenderer(canvas);

	assert.equal(renderer.backend, 'canvas-2d-fallback');
	assert.equal(renderer.contextName, '2d');
	assert.equal(renderer.hydrationState, 'fallback-2d');
	assert.equal(renderer.fallbackReason, 'webgl-unavailable');
	assert.deepEqual(renderer.contextAttempts, ['webgl']);
	assert.equal(renderer.fallbackEvidence.recoverable, true);
	assert.equal(renderer.errors[0], 'WebGL is not available.');
	assert.equal(renderer.stats.fallbackReason, 'webgl-unavailable');
	assert.equal(Object.isFrozen(renderer.fallbackEvidence), true);
	assert.equal(Object.isFrozen(renderer.contextAttempts), true);
});

test('B"H direct progressive construction exposes a coded context error', () => {
	assert.throws(
		() => new ProgressiveWebGLRenderer({
			canvas: { getContext: () => null }
		}),
		(error) => {
			assert.equal(error.name, 'RendererContextError');
			assert.equal(error.code, 'webgl-unavailable');
			assert.deepEqual(error.contextAttempts, ['webgl']);
			return true;
		}
	);
});

test('B"H unrelated renderer failures receive a construction code', () => {
	const evidence = createRendererFallbackEvidence(
		new TypeError('shader bootstrap ruptured'),
		['webgl']
	);

	assert.equal(evidence.code, 'renderer-construction-failed');
	assert.equal(evidence.errorName, 'TypeError');
	assert.equal(evidence.recoverable, false);
	assert.deepEqual(evidence.contextAttempts, ['webgl']);
});

test('B"H explicit context errors preserve normalized unique attempts', () => {
	const error = createWebGlUnavailableError(['webgl', 'webgl', '']);
	const evidence = createRendererFallbackEvidence(error);

	assert.deepEqual(evidence.contextAttempts, ['webgl']);
	assert.equal(evidence.code, 'webgl-unavailable');
});
