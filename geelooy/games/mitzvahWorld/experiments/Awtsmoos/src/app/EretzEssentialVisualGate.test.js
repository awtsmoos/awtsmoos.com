//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzEssentialVisualGate.test.js
 * @description Proves Blank Meadow defers remote terrain textures while richer worlds still require authored terrain before control.
 * The Awtsmoos gives each world its truthful measure; Awtsmoos.com keeps the reliability gate light without weakening the richer valley's vow,
 * so one baseline runs swiftly while authored texture truth remains mandatory wherever the selected experience requires it now.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareEretzEssentialVisuals } from './EretzEssentialVisualGate.js';

function rendererHarness() {
	const calls = { hydrate: 0 };
	return {
		calls,
		renderer: {
			backend: 'webgl',
			delegate: { backend: 'webgl' },
			hydrationState: 'ready',
			hydrate: async () => {
				calls.hydrate += 1;
				return { backend: 'webgl' };
			}
		}
	};
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

test('Blank Meadow keeps WebGL essential but defers authored terrain textures', async () => {
	const renderer = rendererHarness();
	const terrain = terrainHarness();
	const receipt = await prepareEretzEssentialVisuals({
		renderer: renderer.renderer,
		terrain: terrain.terrain,
		worldExperience: { id: 'blank-meadow' }
	});
	assert.equal(renderer.calls.hydrate, 1);
	assert.equal(terrain.calls.hydrate, 0);
	assert.equal(receipt.renderer, 'webgl');
	assert.equal(receipt.terrainLoaded, 0);
	assert.equal(receipt.terrainPhase, 'deferred-by-world-profile');
});

test('Living Village still blocks on authored terrain texture readiness', async () => {
	const renderer = rendererHarness();
	const terrain = terrainHarness({ loaded: 3, phase: 'ready' });
	const receipt = await prepareEretzEssentialVisuals({
		renderer: renderer.renderer,
		terrain: terrain.terrain,
		worldExperience: { id: 'living-village' }
	});
	assert.equal(renderer.calls.hydrate, 1);
	assert.equal(terrain.calls.hydrate, 1);
	assert.equal(receipt.terrainLoaded, 3);
	assert.equal(receipt.terrainPhase, 'ready');
});
