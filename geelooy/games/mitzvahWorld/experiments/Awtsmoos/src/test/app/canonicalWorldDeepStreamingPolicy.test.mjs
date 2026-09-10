//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file canonicalWorldDeepStreamingPolicy.test.mjs
 * @description Proves focused villages stop at canonical civilization while Great Valley alone opens seamless regional streaming.
 * The test substitutes the streaming vessel so policy is measured without network, asset, or timing noise.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { applyCanonicalWorldPromotion } from '../../app/EretzCanonicalWorldHandoff.js';

function run(deepWorldStreaming) {
	const calls = { constructed: 0, updated: 0 };
	class StreamingRuntime {
		constructor() {
			calls.constructed += 1;
			this.worldId = 'great-valley-regional-stream';
		}
		update() { calls.updated += 1; }
		diagnostics() { return { status: 'ready' }; }
		destroy() {}
	}
	const scene = new Scene();
	const bootstrap = group('bootstrap');
	scene.add(bootstrap);
	const collision = { id: 'canonical-octree' };
	const runtime = {
		assets: {},
		collisionQuery: { id: 'bootstrap-octree' },
		footOffset: 0.14,
		ground: ground('bootstrap-ground'),
		mainOctree: { id: 'bootstrap-octree' },
		scene,
		terrain: { group: bootstrap },
		worldExperience: Object.freeze({ deepWorldStreaming })
	};
	const foundation = {
		assets: {},
		collisionQuery: runtime.collisionQuery,
		ground: runtime.ground,
		mainOctree: runtime.mainOctree,
		scene,
		sceneLod: { refresh() {} },
		terrain: runtime.terrain
	};
	const diagnostics = {};
	const receipt = applyCanonicalWorldPromotion(
		{ diagnostics, foundation, runtime },
		promotion(collision),
		{ StreamingRuntime }
	);
	return { calls, diagnostics, receipt, runtime };
}

test('B"H Living Village does not construct deep regional streaming', () => {
	const result = run(false);
	assert.deepEqual(result.calls, { constructed: 0, updated: 0 });
	assert.equal(result.runtime.openWorldStreaming, null);
	assert.equal(result.receipt.openWorldId, null);
	assert.equal(result.diagnostics.openWorldStreaming.status, 'disabled-by-world-profile');
});

test('B"H Great Valley constructs and updates deep regional streaming exactly once', () => {
	const result = run(true);
	assert.deepEqual(result.calls, { constructed: 1, updated: 1 });
	assert.equal(result.runtime.openWorldStreaming.worldId, 'great-valley-regional-stream');
	assert.equal(result.receipt.openWorldId, 'great-valley-regional-stream');
	assert.equal(result.diagnostics.openWorldStreaming.status, 'ready');
});

function promotion(collision) {
	return {
		assets: {},
		chunkRegistry: {},
		chunkRuntime: {},
		collisionQuery: collision,
		ground: ground('canonical-ground'),
		groundSampler: {},
		mainOctree: collision,
		npcProfiles: [],
		obstacles: [],
		sky: group('canonical-sky'),
		terrain: {
			colliders: [{}],
			group: group('canonical-terrain'),
			stats: { quality: 'high' },
			village: { definitions: [] }
		}
	};
}

function ground(id) {
	return {
		heightAt: () => 0,
		id,
		sample: () => ({ height: 0, normal: { x: 0, y: 1, z: 0 } })
	};
}

function group(name) {
	const value = new Group();
	value.name = name;
	return value;
}
