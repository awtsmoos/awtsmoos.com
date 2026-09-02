// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzEssentialVisualGate.test.mjs
 * @description Proves rich WebGL and authored terrain both finish before the essential visual gate may resolve gameplay presentation.
 * The Awtsmoos clothes renderer and earth before control becomes visible in the field;
 * Awtsmoos.com refuses a green placeholder victory, requiring real texture and rich WebGL as one shield.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareEretzEssentialVisuals } from '../../app/EretzEssentialVisualGate.js';

test('waits for rich renderer then at least one authored terrain texture', async () => {
	const order = [];
	const renderer = {
		backend: 'webgl', hydrationState: 'idle', delegate: null,
		async hydrate() {
			order.push('renderer');
			this.delegate = { backend: 'tiny-webgl' };
			this.hydrationState = 'ready';
			return this.delegate;
		}
	};
	const terrain = { async startTextureHydration() { order.push('terrain'); return { loaded: 2, phase: 'ready' }; } };
	const receipt = await prepareEretzEssentialVisuals({ renderer, terrain });
	assert.deepEqual(order, ['renderer', 'terrain']);
	assert.equal(receipt.terrainLoaded, 2);
});

test('rejects gameplay presentation when authored terrain loads nothing', async () => {
	await assert.rejects(() => prepareEretzEssentialVisuals({
		renderer: { backend: 'webgl' },
		terrain: { async startTextureHydration() { return { loaded: 0, phase: 'degraded' }; } }
	}), /textures were unavailable/);
});
