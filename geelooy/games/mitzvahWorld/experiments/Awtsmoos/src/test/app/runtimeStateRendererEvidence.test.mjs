// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeStateRendererEvidence.test.mjs
 * @description Proves document datasets expose, clear, and replace renderer evidence honestly.
 * The Awtsmoos lets the root element speak the vessel's truth without mistaking fallback for loss;
 * Awtsmoos.com clears yesterday's shadow when a new boot or WebGL returns across.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	markRuntimePlayable,
	markRuntimeStarting
} from '../../app/RuntimeStateMarker.js';

test('B"H runtime start clears every stale renderer field', () => {
	const documentValue = fakeDocument();
	Object.assign(documentValue.documentElement.dataset, {
		awtsmoosRenderer: 'canvas-2d-fallback',
		awtsmoosRendererContextAttempts: 'webgl',
		awtsmoosRendererFallback: 'webgl-unavailable',
		awtsmoosRendererFallbackMessage: 'old failure',
		awtsmoosRendererFallbackRecoverable: 'true',
		awtsmoosRendererStage: 'fallback-ready'
	});

	markRuntimeStarting(documentValue);

	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, '');
	assert.equal(dataset.awtsmoosRendererContextAttempts, '');
	assert.equal(dataset.awtsmoosRendererFallback, '');
	assert.equal(dataset.awtsmoosRendererFallbackMessage, '');
	assert.equal(dataset.awtsmoosRendererFallbackRecoverable, '');
	assert.equal(dataset.awtsmoosRendererStage, '');
});

test('B"H playable fallback publishes stable renderer evidence', () => {
	const documentValue = fakeDocument();
	const renderer = fallbackRenderer();

	markRuntimeStarting(documentValue);
	markRuntimePlayable({ runtime: { renderer } }, documentValue);

	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosGameplay, 'true');
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(dataset.awtsmoosRenderer, 'canvas-2d-fallback');
	assert.equal(dataset.awtsmoosRendererHydration, 'fallback-2d');
	assert.equal(dataset.awtsmoosRendererFallback, 'webgl-unavailable');
	assert.equal(dataset.awtsmoosRendererFallbackMessage, 'WebGL is not available.');
	assert.equal(dataset.awtsmoosRendererFallbackRecoverable, 'true');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(documentValue.documentElement.attributes['aria-busy'], 'false');
});

test('B"H rich renderer clears stale fallback evidence', () => {
	const documentValue = fakeDocument();
	markRuntimePlayable({
		runtime: { renderer: fallbackRenderer() }
	}, documentValue);
	markRuntimePlayable({
		runtime: {
			renderer: {
				backend: 'webgl',
				contextName: 'webgl',
				hydrationState: 'ready'
			}
		}
	}, documentValue);

	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererHydration, 'ready');
	assert.equal(dataset.awtsmoosRendererFallback, '');
	assert.equal(dataset.awtsmoosRendererFallbackMessage, '');
	assert.equal(dataset.awtsmoosRendererFallbackRecoverable, '');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
});

function fallbackRenderer() {
	return {
		backend: 'canvas-2d-fallback',
		contextName: '2d',
		fallbackEvidence: Object.freeze({
			code: 'webgl-unavailable',
			contextAttempts: Object.freeze(['webgl']),
			message: 'WebGL is not available.',
			recoverable: true
		}),
		hydrationState: 'fallback-2d'
	};
}

function fakeDocument() {
	const attributes = {};

	return {
		documentElement: {
			attributes,
			dataset: {},
			setAttribute(name, value) {
				attributes[name] = value;
			}
		}
	};
}
