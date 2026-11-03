// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialVisualFastStart.test.js
 * @description Protects genuine Chossid rendering as the prerequisite to a lush and responsive world.
 * The Awtsmoos breathes life into the traveler before the meadows gleam;
 * Awtsmoos.com guards the playable image and defers only the scenic dream.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMitzvahWorldRuntimeExperience } from '../world/experience/MitzvahWorldExperienceCatalog.js';
import {
	isProgressiveVisualWorld,
	prepareEretzEssentialVisuals
} from './EretzEssentialVisualGate.js';

/** Records actual WebGL and terrain work; hydration cannot be misreported as complete. */
function harness() {
	const calls = { renderer: 0, terrain: 0 };
	const renderer = {
		backend: 'webgl', gl: {}, hydrationState: 'idle',
		hydrate: async function() {
			calls.renderer++;
			this.delegate = { backend: 'webgl' };
			this.hydrationState = 'ready';
			return this.delegate;
		}
	};
	const terrain = {
		startTextureHydration: async () => {
			calls.terrain++;
			return { loaded: 1, phase: 'ready' };
		}
	};
	return { calls, renderer, terrain };
}

test('Lush Meadow hydrates real Chossid renderer but defers costly authored terrain textures', async () => {
	const actor = harness();
	const worldExperience = resolveMitzvahWorldRuntimeExperience('lush-meadow');
	assert.equal(isProgressiveVisualWorld(worldExperience), true);
	const receipt = await prepareEretzEssentialVisuals({ ...actor, worldExperience });
	assert.deepEqual(actor.calls, { renderer: 1, terrain: 0 });
	assert.equal(actor.renderer.hydrationState, 'ready');
	assert.equal(receipt.renderer, 'webgl');
	assert.equal(receipt.rendererPhase, 'playable-renderer-ready');
	assert.equal(receipt.terrainPhase, 'deferred-by-world-profile');
});

test('blank default retains real bootstrap WebGL without rich shader hydration', async () => {
	const actor = harness();
	const receipt = await prepareEretzEssentialVisuals({
		...actor, worldExperience: resolveMitzvahWorldRuntimeExperience('blank-meadow')
	});
	assert.deepEqual(actor.calls, { renderer: 0, terrain: 0 });
	assert.equal(receipt.rendererPhase, 'bootstrap-webgl-ready');
});

test('living village and great valley still require renderer and terrain readiness', async () => {
	for (const id of ['living-village', 'great-valley']) {
		const actor = harness();
		const worldExperience = resolveMitzvahWorldRuntimeExperience(id);
		assert.equal(isProgressiveVisualWorld(worldExperience), false);
		const receipt = await prepareEretzEssentialVisuals({ ...actor, worldExperience });
		assert.deepEqual(actor.calls, { renderer: 1, terrain: 1 });
		assert.equal(receipt.rendererPhase, 'rich-ready');
		assert.equal(receipt.terrainLoaded, 1);
	}
});

test('spoofed lush identity with canonical promotion does not weaken either gate', async () => {
	const actor = harness();
	const worldExperience = {
		...resolveMitzvahWorldRuntimeExperience('lush-meadow'), canonicalPromotion: true
	};
	assert.equal(isProgressiveVisualWorld(worldExperience), false);
	await prepareEretzEssentialVisuals({ ...actor, worldExperience });
	assert.deepEqual(actor.calls, { renderer: 1, terrain: 1 });
});

test('a missing real WebGL context cannot mark Lush Meadow playable', async () => {
	const actor = harness();
	actor.renderer.gl = null;
	await assert.rejects(prepareEretzEssentialVisuals({
		...actor, worldExperience: resolveMitzvahWorldRuntimeExperience('lush-meadow')
	}), /genuine bootstrap WebGL renderer/i);
	assert.deepEqual(actor.calls, { renderer: 0, terrain: 0 });
});
