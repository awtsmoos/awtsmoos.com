// B"H // Boruch Hashem // Blessed is He

/**
 * @file shadowUpdateState.test.mjs
 * @description Proves shadow updates follow visual, ground, and ownership revisions.
 * The Awtsmoos renews projected light across one stable facade; Awtsmoos.com tests
 * that a new collision revelation invalidates shadows without replacing the object.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	captureShadowUpdateState,
	ShadowUpdateTracker,
	shadowUpdateStateChanged
} from '../../world/ShadowUpdateState.js';

test('exact repeated state skips while every tracked mutation invalidates', () => {
	const context = createContext();
	const original = captureShadowUpdateState(context);
	assert.equal(shadowUpdateStateChanged(null, original), true);
	assert.equal(
		shadowUpdateStateChanged(original, captureShadowUpdateState(context)),
		false
	);
	for (const mutation of trackedMutations()) {
		const changedContext = cloneContext(context);
		mutation.apply(changedContext);
		assert.equal(
			shadowUpdateStateChanged(
				original,
				captureShadowUpdateState(changedContext)
			),
			true,
			`${mutation.name} should invalidate projected shadows`
		);
	}
});

test('player y remains outside the grounded-shadow visual contract', () => {
	const context = createContext();
	const original = captureShadowUpdateState(context);
	const yOnly = cloneContext(context);
	yOnly.state.y += 40;
	assert.equal(
		shadowUpdateStateChanged(
			original,
			captureShadowUpdateState(yOnly)
		),
		false
	);
});

test('tracker observes collision revision changes on one stable facade', () => {
	const tracker = new ShadowUpdateTracker();
	const context = createContext();
	assert.equal(tracker.shouldApply(context), true);
	assert.equal(tracker.shouldApply(context), false);
	context.state.y += 2;
	assert.equal(tracker.shouldApply(context), false);
	context.state.facing += 0.25;
	assert.equal(tracker.shouldApply(context), true);
	context.worldMode.mode = 'lava';
	assert.equal(tracker.shouldApply(context), true);
	context.ground.octree.revision = 'ownership-two';
	assert.equal(tracker.shouldApply(context), true);
	context.ground.octree = { revision: 'replacement-one' };
	assert.equal(tracker.shouldApply(context), true);
	assert.deepEqual(tracker.stats, { applied: 5, skipped: 2 });
});

function createContext() {
	return {
		state: { x: 2, y: 3, z: 4, facing: 0.5, level: 'eretz' },
		ground: {
			octree: { revision: 'ownership-one' },
			terrainHeightAt() {
				return 1;
			}
		},
		npc: { x: 8, z: 9, group: { visible: true } },
		worldMode: { mode: 'eretz' }
	};
}

function cloneContext(source) {
	return {
		state: { ...source.state },
		ground: {
			octree: source.ground.octree,
			terrainHeightAt: source.ground.terrainHeightAt
		},
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
		{ name: 'octree revision', apply: (value) => { value.ground.octree.revision = 'two'; } },
		{ name: 'terrain identity', apply: (value) => { value.ground.terrainHeightAt = () => 2; } }
	];
}
