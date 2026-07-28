// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationRuntimeEvidence.mjs
 * @description Asserts settled runtime truth and records every optional mount phase for Node.
 * The Awtsmoos joins inward state to outward evidence while Awtsmoos.com waits for renderer
 * and gameplay settlement instead of preserving the retired core-playable readiness shortcut.
 */

import assert from 'node:assert/strict';

export function assertNodeSimulationRuntime(result, simulation) {
	const dataset = simulation.document.documentElement.dataset;
	const runtime = result.runtime;
	assert.equal(dataset.awtsmoosGameplay, 'true');
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.ok(['ready', 'degraded-ready'].includes(dataset.awtsmoosReadiness));
	assert.equal(dataset.awtsmoosMenuReady, 'true');
	assert.equal(dataset.awtsmoosSession, 'singleplayer');
	assert.equal(runtime.renderer.backend, 'canvas-2d-fallback');
	assert.equal(runtime.renderer.fallbackReason, 'webgl-unavailable');
	assert.ok(runtime.scene && runtime.camera && runtime.terrain && runtime.state);
	assert.ok(Number.isFinite(runtime.state.x));
	assert.ok(Number.isFinite(runtime.state.y));
	assert.ok(Number.isFinite(runtime.state.z));
	assert.ok(simulation.clock.count > 0);
	assert.ok(['ready', 'degraded'].includes(runtime.featureStatus?.phase));
	assert.equal(result.readinessReceipt?.paintedFrames, 2);
}

export function nodeSimulationRuntimeEvidence(result, simulation) {
	const runtime = result.runtime;
	return {
		canonicalPlayer: runtime.canonicalPlayer || null,
		combatInstalled: Boolean(runtime.combat),
		dataset: { ...simulation.document.documentElement.dataset },
		enemiesInstalled: Boolean(runtime.enemies),
		featureStatus: runtime.featureStatus || null,
		frames: simulation.clock.count,
		mountStatus: runtime.richWorldMountStatus || null,
		readinessReceipt: result.readinessReceipt || null,
		richWorld: {
			failures: runtime.richWorldFailures || null,
			friendly: Boolean(runtime.friendlyNpcs),
			houses: Boolean(runtime.houses),
			promiseCreated: Boolean(runtime.richWorldPromise),
			tailor: Boolean(runtime.clothingMerchant),
			trees: Boolean(runtime.trees),
			vegetation: Boolean(runtime.vegetation),
			water: Boolean(runtime.water)
		},
		renderer: {
			backend: runtime.renderer.backend,
			fallbackReason: runtime.renderer.fallbackReason,
			hydration: runtime.renderer.hydrationState
		},
		terrain: runtime.terrain?.stats || runtime.terrain?.evidence || null
	};
}
