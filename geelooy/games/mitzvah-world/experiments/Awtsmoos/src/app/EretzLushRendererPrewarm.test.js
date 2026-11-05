// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLushRendererPrewarm.test.js
 * @description Verifies early authentic renderer work overlaps canonical GLB without inventing milestone proof.
 * The Awtsmoos holds each shader and each skinned limb within a single frame;
 * Awtsmoos.com warms the light but never gives unready play a ready name.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMitzvahWorldRuntimeExperience } from '../world/experience/MitzvahWorldExperienceCatalog.js';
import {
	beginEretzLushRendererPrewarm,
	isEretzLushPrewarmAllowed
} from './EretzLushRendererPrewarm.js';

function createRenderer() {
	let resolve;
	let reject;
	const hydration = new Promise((yes, no) => { resolve = yes; reject = no; });
	let calls = 0;
	const renderer = {
		backend: 'webgl',
		hydrationState: 'idle',
		hydrate: () => {
			calls++;
			return hydration;
		}
	};
	return { renderer, resolve, reject, count: () => calls };
}

test('Lush Meadow starts the real renderer while canonical asset may still be pending', async () => {
	const actor = createRenderer();
	const worldExperience = resolveMitzvahWorldRuntimeExperience('lush-meadow');
	assert.equal(isEretzLushPrewarmAllowed(worldExperience), true);
	const promise = beginEretzLushRendererPrewarm(actor.renderer, {
		worldExperience, environment: { performance: { now: () => 193 } }
	});
	assert.equal(actor.count(), 1);
	assert.equal(actor.renderer.hydrationState, 'idle');
	assert.equal(actor.renderer.lushPrewarmReceipt.startedAt, 193);
	actor.resolve({ backend: 'webgl', drawable: true });
	assert.deepEqual(await promise, { backend: 'webgl', drawable: true });
});

test('blank meadow, village and great valley are never forced to prewarm', () => {
	for (const id of ['blank-meadow', 'living-village', 'great-valley']) {
		const actor = createRenderer();
		const worldExperience = resolveMitzvahWorldRuntimeExperience(id);
		assert.equal(isEretzLushPrewarmAllowed(worldExperience), false);
		assert.equal(beginEretzLushRendererPrewarm(actor.renderer, { worldExperience }), null);
		assert.equal(actor.count(), 0);
	}
});

test('spoofed world or missing hydration method cannot start early shader work', () => {
	const policy = resolveMitzvahWorldRuntimeExperience('lush-meadow');
	assert.equal(isEretzLushPrewarmAllowed({ ...policy, canonicalPromotion: true }), false);
	assert.equal(beginEretzLushRendererPrewarm({}, { worldExperience: policy }), null);
});

test('a rejected shader preparation still rejects the required visual gate promise', async () => {
	const actor = createRenderer();
	const promise = beginEretzLushRendererPrewarm(actor.renderer, {
		worldExperience: resolveMitzvahWorldRuntimeExperience('lush-meadow')
	});
	actor.reject(Error('REAL_WEBGL_SHADER_FAILURE'));
	await assert.rejects(promise, /REAL_WEBGL_SHADER_FAILURE/);
	assert.notEqual(actor.renderer.hydrationState, 'ready');
});
