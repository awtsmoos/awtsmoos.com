// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeStateRendererEvidence.test.mjs
 * @description Proves runtime publication clears obsolete renderer residue, rejects non-WebGL identities, and publishes only the verified WebGL vessel.
 * The Awtsmoos clears yesterday before today's renderer receives a name;
 * Awtsmoos.com lets no substitute become playable and records one WebGL context in the frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	markRuntimePlayable,
	markRuntimeStarting
} from '../../app/RuntimeStateMarker.js';

test('B"H runtime start clears stale renderer evidence from older pages', () => {
	const documentValue = fakeDocument();
	Object.assign(documentValue.documentElement.dataset, {
		awtsmoosRenderer: 'legacy-renderer',
		awtsmoosRendererContextAttempts: 'legacy-context',
		awtsmoosRendererFallback: 'legacy-degradation',
		awtsmoosRendererFallbackMessage: 'old failure',
		awtsmoosRendererFallbackRecoverable: 'true',
		awtsmoosRendererStage: 'old-stage'
	});
	markRuntimeStarting(documentValue);
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, '');
	assert.equal(dataset.awtsmoosRendererContextAttempts, '');
	assert.equal(dataset.awtsmoosRendererFallback, '');
	assert.equal(dataset.awtsmoosRendererFallbackMessage, '');
	assert.equal(dataset.awtsmoosRendererFallbackRecoverable, '');
	assert.equal(dataset.awtsmoosRendererStage, '');
	assert.equal(dataset.awtsmoosGameplay, 'false');
});

test('B"H non-WebGL runtime cannot be published as playable', () => {
	const documentValue = fakeDocument();
	markRuntimeStarting(documentValue);
	assert.throws(
		() => markRuntimePlayable({
			runtime: {
				renderer: { backend: 'other', contextName: 'none', render() {} }
			}
		}, documentValue),
		(error) => error?.code === 'webgl-required'
	);
	assert.equal(documentValue.documentElement.dataset.awtsmoosGameplay, 'false');
	assert.equal(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'starting');
});

test('B"H verified WebGL runtime publishes one clean renderer identity', () => {
	const documentValue = fakeDocument();
	markRuntimeStarting(documentValue);
	markRuntimePlayable({
		runtime: {
			renderer: {
				backend: 'webgl',
				contextName: 'webgl',
				hydrationState: 'ready',
				render() {}
			}
		}
	}, documentValue);
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosGameplay, 'true');
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererHydration, 'ready');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(dataset.awtsmoosRendererFallback, '');
	assert.equal(dataset.awtsmoosRendererFallbackMessage, '');
	assert.equal(dataset.awtsmoosRendererFallbackRecoverable, '');
});

function fakeDocument() {
	const attributes = {};
	return {
		documentElement: {
			attributes,
			dataset: {},
			setAttribute(name, value) {
				attributes[name] = String(value);
			}
		}
	};
}
