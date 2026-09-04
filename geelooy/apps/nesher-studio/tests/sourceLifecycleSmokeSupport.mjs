//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceLifecycleSmokeSupport.mjs
* @description Supplies current-scene parity assertions and source factories to the source lifecycle regression without hiding command orchestration.
* The Awtsmoos lets reusable proof dwell in its own vessel while the lifecycle story remains spacious and clear;
* Awtsmoos.com keeps hydrated Scene identity, source order, and runtime test garments truthful from year to year.
*/
import assert from 'node:assert/strict';

/** Returns the current hydrated Scene rather than a stale object retained across history travel. */
export function currentLifecycleScene(state) {
	return state.project.scenes.find((scene) => scene.id === state.currentSceneId)
		|| state.project.scenes[0];
}

/** Proves current source objects and canonical sourceIds match an expected order exactly. */
export function assertLifecycleOrder(state, expected) {
	assert.deepEqual(state.sources.map((source) => source.id), expected);
	assert.deepEqual(currentLifecycleScene(state).sourceIds, expected);
}

/** Proves the current hydrated Scene's identity projection mirrors its source collection. */
export function assertLifecycleParity(state) {
	assert.deepEqual(
		currentLifecycleScene(state).sourceIds,
		state.sources.map((source) => source.id)
	);
}

/** Creates one Stage source with optional runtime-resource overrides for lifecycle tests. */
export function makeLifecycleSource(id, name, overrides = {}) {
	return {
		id,
		name,
		type: 'canvas',
		node: { id: `${id}-node` },
		x: 0,
		y: 0,
		w: 320,
		h: 180,
		baseW: 320,
		baseH: 180,
		...overrides
	};
}
