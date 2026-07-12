// B"H
import assert from 'node:assert/strict';
import {
	captureShadowUpdateState,
	ShadowUpdateTracker,
	shadowUpdateStateChanged
} from '../../world/ShadowUpdateState.js';

const originalContext = createContext();
const original = captureShadowUpdateState(originalContext);
const repeated = captureShadowUpdateState(originalContext);

assert.equal(shadowUpdateStateChanged(null, original), true, 'first state must update');
assert.equal(shadowUpdateStateChanged(original, repeated), false, 'exact state should skip');

for (const mutation of trackedMutations()) {
	const changedContext = cloneContext(originalContext);
	mutation.apply(changedContext);
	const changed = captureShadowUpdateState(changedContext);
	assert.equal(
		shadowUpdateStateChanged(original, changed),
		true,
		`${mutation.name} should invalidate projected shadows`
	);
}

const yOnly = cloneContext(originalContext);
yOnly.state.y += 40;
assert.equal(
	shadowUpdateStateChanged(original, captureShadowUpdateState(yOnly)),
	false,
	'player y is outside the current grounded-shadow visual contract'
);

const tracker = new ShadowUpdateTracker();
const trackedContext = createContext();
assert.equal(tracker.shouldApply(trackedContext), true, 'first tracked update should apply');
assert.equal(tracker.shouldApply(trackedContext), false, 'identical tracked input should skip');
trackedContext.state.y += 2;
assert.equal(tracker.shouldApply(trackedContext), false, 'y-only movement should still skip');
trackedContext.state.facing += 0.25;
assert.equal(tracker.shouldApply(trackedContext), true, 'facing should invalidate the tracker');
trackedContext.worldMode.mode = 'lava';
assert.equal(tracker.shouldApply(trackedContext), true, 'mode should invalidate the tracker');
trackedContext.ground.octree = {};
assert.equal(tracker.shouldApply(trackedContext), true, 'octree identity should invalidate');
assert.deepEqual(tracker.stats, { applied: 4, skipped: 2 });

console.log(JSON.stringify({
	ok: true,
	tracker: tracker.stats,
	trackedMutationCount: trackedMutations().length
}, null, 2));

function createContext() {
	return {
		state: { x: 2, y: 3, z: 4, facing: 0.5, level: 'eretz' },
		ground: {
			octree: {},
			terrainHeightAt() { return 1; }
		},
		npc: { x: 8, z: 9, group: { visible: true } },
		worldMode: { mode: 'eretz' }
	};
}

function cloneContext(source) {
	return {
		state: { ...source.state },
		ground: { ...source.ground },
		npc: {
			...source.npc,
			group: { ...source.npc.group }
		},
		worldMode: { ...source.worldMode }
	};
}

function trackedMutations() {
	return [
		{ name: 'player x', apply: (value) => { value.state.x += 1; } },
		{ name: 'player z', apply: (value) => { value.state.z += 1; } },
		{ name: 'facing', apply: (value) => { value.state.facing += 1; } },
		{ name: 'level', apply: (value) => { value.state.level = 'lava'; } },
		{ name: 'npc x', apply: (value) => { value.npc.x += 1; } },
		{ name: 'npc z', apply: (value) => { value.npc.z += 1; } },
		{ name: 'npc visibility', apply: (value) => { value.npc.group.visible = false; } },
		{ name: 'world mode', apply: (value) => { value.worldMode.mode = 'lava'; } },
		{ name: 'octree identity', apply: (value) => { value.ground.octree = {}; } },
		{ name: 'terrain identity', apply: (value) => { value.ground.terrainHeightAt = () => 2; } }
	];
}
