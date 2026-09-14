//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file deferredRuntimeTerrainBridge.test.mjs
 * @description Proves visible terrain hydration starts before richer work and exposes truthful loading, ready, unavailable, and degraded state.
 * The Awtsmoos clothes the ground beneath the first living stride while distant abundance waits beyond the gate;
 * Awtsmoos.com keeps one shared promise and one honest receipt so texture state can be witnessed rather than inferred from fate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzBootstrapTerrainBridge } from '../../app/EretzBootstrapTerrainBridge.js';
import { startEretzPostPlayablePriority } from '../../app/EretzPostPlayablePriority.js';

test('post-play priority starts terrain hydration before richer world resolution', async () => {
	const order = [];
	const context = {
		boot: {},
		core: { diagnostics: {}, foundation: {}, runtime: { destroyed: false } },
		environment: globalThis,
		options: {
			worldExperience: Object.freeze({
				canonicalPromotion: true,
				cinematicEnvironment: false,
				cinematicHero: false,
				cinematicLandscape: false,
				districtStreaming: false,
				performanceMonitor: false,
				postPlayTerrainHydration: true
			})
		}
	};
	await startEretzPostPlayablePriority(context, {
		loadLaunchers: async () => {
			order.push('launchers');
			return { startDeferred: () => null, startDistrict: () => null };
		},
		startTerrainHydration: () => { order.push('terrain'); return Promise.resolve(null); },
		waitForPlayer: async () => { order.push('player'); return { waitedMs: 0 }; }
	});
	assert.ok(order.indexOf('terrain') < order.indexOf('player'));
	assert.ok(order.indexOf('terrain') < order.indexOf('launchers'));
});

test('terrain bridge publishes loading then ready on one durable promise', async () => {
	const deferred = deferredValue();
	const diagnostics = {};
	const foundation = {
		terrain: { startTextureHydration: () => deferred.promise }
	};
	const first = startEretzBootstrapTerrainBridge(foundation, diagnostics);
	const second = startEretzBootstrapTerrainBridge(foundation, diagnostics);
	assert.equal(first, second);
	assert.equal(diagnostics.bootstrapTerrainHydrationState.status, 'loading');
	deferred.resolve({ failed: 1, loaded: 12, phase: 'hydrated' });
	await first;
	assert.deepEqual(diagnostics.bootstrapTerrainHydrationState, {
		failed: 1,
		loaded: 12,
		phase: 'hydrated',
		status: 'ready'
	});
});

test('terrain bridge exposes unavailable and degraded states without crashing gameplay', async () => {
	const unavailable = {};
	await startEretzBootstrapTerrainBridge({}, unavailable);
	assert.equal(unavailable.bootstrapTerrainHydrationState.status, 'unavailable');
	const degraded = {};
	await startEretzBootstrapTerrainBridge({
		terrain: {
			startTextureHydration() {
				throw new Error('texture transport failed');
			}
		}
	}, degraded);
	assert.equal(degraded.bootstrapTerrainHydrationState.status, 'degraded');
	assert.match(degraded.bootstrapTerrainHydrationState.error, /texture transport failed/);
});

function deferredValue() {
	let resolve;
	const promise = new Promise(value => resolve = value);
	return { promise, resolve };
}
