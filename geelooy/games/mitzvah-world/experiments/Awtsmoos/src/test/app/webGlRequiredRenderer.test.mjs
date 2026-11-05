// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file webGlRequiredRenderer.test.mjs
 * @description Proves Mitzvah World either constructs real WebGL or fails with structured truth before gameplay; no alternate renderer may appear.
 * The Awtsmoos gives one graphics covenant whose missing doorway is named rather than disguised;
 * Awtsmoos.com keeps error, evidence, and runtime requirement aligned until genuine WebGL has risen before the eyes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowRenderer } from '../../app/MinimalMeadowRenderer.js';
import { ProgressiveWebGLRenderer } from '../../app/ProgressiveWebGLRenderer.js';
import {
	createWebGlRequiredError,
	webGlRequiredEvidence
} from '../../app/WebGlRequiredError.js';
import {
	requireWebGlRuntime,
	webGlRuntimeReady
} from '../../app/WebGlRuntimeRequirement.js';

test('B"H renderer factory rejects when WebGL cannot be created', () => {
	assert.throws(
		() => createMinimalMeadowRenderer({ getContext: () => null }),
		verifyWebGlRequiredError
	);
});

test('B"H progressive renderer itself exposes the same nonrecoverable requirement', () => {
	assert.throws(
		() => new ProgressiveWebGLRenderer({
			canvas: { getContext: () => null }
		}),
		verifyWebGlRequiredError
	);
});

test('B"H WebGL-required evidence normalizes context attempts without suggesting recovery', () => {
	const error = createWebGlRequiredError(['webgl', 'webgl', '']);
	const evidence = webGlRequiredEvidence(error);
	assert.equal(evidence.code, 'webgl-required');
	assert.equal(evidence.errorName, 'RendererContextError');
	assert.equal(evidence.recoverable, false);
	assert.deepEqual(evidence.contextAttempts, ['webgl']);
	assert.equal(Object.isFrozen(evidence), true);
	assert.equal(Object.isFrozen(evidence.contextAttempts), true);
});

test('B"H runtime requirement accepts only a renderer with real WebGL identity', () => {
	const renderer = {
		backend: 'webgl',
		contextName: 'webgl',
		render() {}
	};
	assert.equal(webGlRuntimeReady(renderer), true);
	assert.equal(requireWebGlRuntime(renderer), renderer);
	assert.equal(webGlRuntimeReady({ backend: 'other', render() {} }), false);
	assert.throws(
		() => requireWebGlRuntime({ backend: 'other', render() {} }),
		(error) => error?.code === 'webgl-required'
	);
});

function verifyWebGlRequiredError(error) {
	assert.equal(error.name, 'RendererContextError');
	assert.equal(error.code, 'webgl-required');
	assert.equal(error.recoverable, false);
	assert.deepEqual(error.contextAttempts, ['webgl']);
	assert.match(error.message, /requires WebGL/i);
	return true;
}
