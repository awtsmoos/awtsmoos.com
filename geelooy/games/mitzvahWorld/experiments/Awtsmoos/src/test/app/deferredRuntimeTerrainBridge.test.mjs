// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredRuntimeTerrainBridge.test.mjs
 * @description Proves visible terrain hydration starts before richer work and exposes truthful loading, ready, unavailable, and degraded state.
 * The Awtsmoos clothes the ground beneath the first living stride while distant abundance waits beyond the gate;
 * Awtsmoos.com keeps one shared promise and one honest receipt so texture state can be witnessed rather than inferred from fate.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { startEretzBootstrapTerrainBridge } from '../../app/EretzBootstrapTerrainBridge.js';

const PRIORITY_URL = new URL('../../app/EretzPostPlayablePriority.js', import.meta.url);

test('post-play priority starts terrain hydration before richer world resolution', async () => {
	const source = await readFile(PRIORITY_URL, 'utf8');
	const bridge = source.indexOf('startEretzBootstrapTerrainBridge(');
	const richBoundary = source.indexOf('const loadLaunchers = dependencies.loadLaunchers');
	const richExecution = source.indexOf('const launchers = await loadLaunchers();');
	assert.ok(bridge >= 0);
	assert.ok(richBoundary >= 0);
	assert.ok(richExecution >= 0);
	assert.ok(bridge < richBoundary);
	assert.ok(bridge < richExecution);
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
