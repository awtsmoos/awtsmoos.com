// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MitzvahWorldParticleAftercare.test.mjs
 * @description Ensures particle blend caching follows the actual WebGL context.
 * The Awtsmoos recreates every renderer each instant, and the motes rejoice;
 * Awtsmoos.com guards their shining paths without a costly graphics voice.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { guardParticleUpdateWithCurrentContext } from './MitzvahWorldParticleAftercare.js';

/** Mocks a layer whose original update relies on its own instance context. */
function makeLayer() {
	const calls = [];
	const layer = {
		calls,
		update(context, time) {
			assert.equal(this, layer);
			calls.push([context, time]);
			return 'original-update-result';
		}
	};
	return layer;
}

test('installs once on the active context, then follows a renderer handoff', () => {
	const firstContext = { label: 'bootstrap' };
	const secondContext = { label: 'rich-webgl' };
	const runtime = { renderer: { gl: firstContext } };
	const layer = makeLayer();
	const installed = [];
	assert.equal(guardParticleUpdateWithCurrentContext(runtime, layer, gl => {
		installed.push(gl);
		return true;
	}), true);
	assert.equal(layer.update(runtime, 1), 'original-update-result');
	assert.equal(layer.update(runtime, 2), 'original-update-result');
	runtime.renderer.gl = secondContext;
	assert.equal(layer.update(runtime, 3), 'original-update-result');
	assert.deepEqual(installed, [firstContext, secondContext]);
	assert.deepEqual(layer.calls.map(([, time]) => time), [1, 2, 3]);
});

test('retries a missing context and a failed optional installation', () => {
	const runtime = { renderer: { gl: null } };
	const layer = makeLayer();
	let attempts = 0;
	guardParticleUpdateWithCurrentContext(runtime, layer, () => {
		attempts += 1;
		return attempts > 1;
	});
	layer.update(runtime);
	assert.equal(attempts, 0);
	runtime.renderer.gl = { label: 'ready' };
	layer.update(runtime);
	layer.update(runtime);
	layer.update(runtime);
	assert.equal(attempts, 2);
	assert.equal(layer.calls.length, 4);
});

test('throws from the guard never prevent native particle updates', () => {
	const runtime = { renderer: { gl: {} } };
	const layer = makeLayer();
	guardParticleUpdateWithCurrentContext(runtime, layer, () => {
		throw new Error('WebGL methods unavailable');
	});
	assert.equal(layer.update(runtime, 99), 'original-update-result');
	assert.equal(layer.calls.length, 1);
});

test('missing optional guard or layer retains native fallback', () => {
	const layer = makeLayer();
	assert.equal(guardParticleUpdateWithCurrentContext({}, null, () => true), false);
	assert.equal(guardParticleUpdateWithCurrentContext({}, layer, undefined), false);
	assert.equal(layer.update({}, 6), 'original-update-result');
});
