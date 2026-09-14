//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzEssentialVisualGate.test.js
 * @description Proves Blank Meadow requires genuine bootstrap WebGL but defers rich renderer and terrain hydration, while richer worlds still block on both.
 * The Awtsmoos gives each world its truthful measure; Awtsmoos.com lets the reliability meadow move through real WebGL before later richness descends,
 * while Living Village keeps the stricter authored visual covenant and no false readiness hides a missing context beneath the heavens.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareEretzEssentialVisuals } from './EretzEssentialVisualGate.js';

function rendererHarness(options = {}) {
	const calls = { hydrate: 0 };
	const renderer = {
		backend: 'webgl',
		delegate: options.delegate ?? null,
		gl: options.gl === false ? null : {},
		hydrationState: options.hydrationState || 'idle',
		hydrate: async () => {
			calls.hydrate += 1;
			renderer.delegate = { backend: 'webgl' };
			renderer.hydrationState = 'ready';
			return renderer.delegate;
		}
	};
	return { calls, renderer };
}

function terrainHarness(receipt = { loaded: 1, phase: 'ready' }) {
	const calls = { hydrate: 0 };
	return {
		calls,
		terrain: {
			startTextureHydration: async () => {
				calls.hydrate += 1;
				return receipt;
			}
		}
	};
}

test('Blank Meadow keeps genuine bootstrap WebGL but defers rich renderer and textures', async () => {
	const renderer = rendererHarness();
	const terrain = terrainHarness();
	const receipt = await prepareEretzEssentialVisuals({
		renderer: renderer.renderer,
		terrain: terrain.terrain,
		worldExperience: { id: 'blank-meadow' }
	});
	assert.equal(renderer.calls.hydrate, 0);
	assert.equal(terrain.calls.hydrate, 0);
	assert.equal(receipt.renderer, 'webgl');
	assert.equal(receipt.rendererPhase, 'bootstrap-webgl-ready');
	assert.equal(receipt.terrainPhase, 'deferred-by-world-profile');
});

test('Blank Meadow rejects a missing genuine WebGL context', async () => {
	const renderer = rendererHarness({ gl: false });
	await assert.rejects(
		prepareEretzEssentialVisuals({
			renderer: renderer.renderer,
			terrain: terrainHarness().terrain,
			worldExperience: { id: 'blank-meadow' }
		}),
		/bootstrap WebGL renderer/i
	);
	assert.equal(renderer.calls.hydrate, 0);
});

test('Living Village still blocks on rich renderer and authored terrain readiness', async () => {
	const renderer = rendererHarness();
	const terrain = terrainHarness({ loaded: 3, phase: 'ready' });
	const receipt = await prepareEretzEssentialVisuals({
		renderer: renderer.renderer,
		terrain: terrain.terrain,
		worldExperience: { id: 'living-village' }
	});
	assert.equal(renderer.calls.hydrate, 1);
	assert.equal(terrain.calls.hydrate, 1);
	assert.equal(receipt.rendererPhase, 'rich-ready');
	assert.equal(receipt.terrainLoaded, 3);
	assert.equal(receipt.terrainPhase, 'ready');
});
