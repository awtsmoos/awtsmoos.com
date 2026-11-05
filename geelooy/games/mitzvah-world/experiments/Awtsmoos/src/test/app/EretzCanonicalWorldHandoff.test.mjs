// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldHandoff.test.mjs
 * @description Proves canonical promotion retires fallback terrain/districts before replacing collision and movement authority.
 * The Awtsmoos changes provisional streets into one complete valley without residue; Awtsmoos.com verifies old collision
 * is released first, unrelated player form survives, and mover, jump, ground, scene, assets, and receipt all become canonical.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import { attachBootstrapDistrictLifecycle } from '../../app/BootstrapDistrictLifecycle.js';
import { applyCanonicalWorldPromotion } from '../../app/EretzCanonicalWorldHandoff.js';

test('canonical handoff retires all bootstrap vessels before world authority swap', () => {
	const scene = new Scene();
	const bootstrap = group('bootstrap-terrain');
	const playerRoot = group('player-root');
	const districts = [group('district-a'), group('district-b')];
	for (const node of [bootstrap, playerRoot, ...districts]) scene.add(node);
	const oldCollision = { id: 'old-octree' };
	const newCollision = { id: 'canonical-octree' };
	const runtime = {
		assets: { playerAsset: true },
		collisionQuery: oldCollision,
		footOffset: 0.14,
		ground: ground('old-ground'),
		mainOctree: oldCollision,
		scene,
		terrain: { group: bootstrap }
	};
	runtime.districtStreaming = districtState(runtime, districts, oldCollision);
	const foundation = {
		assets: runtime.assets,
		collisionQuery: oldCollision,
		ground: runtime.ground,
		mainOctree: oldCollision,
		scene,
		sceneLod: { refresh() {} },
		terrain: runtime.terrain
	};
	const promotion = promotionFixture(newCollision);
	const receipt = applyCanonicalWorldPromotion({ foundation, runtime }, promotion);
	assert.equal(runtime.districtStreaming.retired, true);
	assert.equal(runtime.districtStreaming.status, 'disposed');
	assert.equal(runtime.districtStreaming.releaseAuthority, oldCollision);
	assert.equal(receipt.bootstrapDistrictsReleased, 2);
	assert.equal(receipt.bootstrapTrianglesRemoved, 96);
	assert.equal(scene.children.includes(bootstrap), false);
	assert.ok(districts.every(node => !scene.children.includes(node)));
	assert.equal(scene.children.includes(playerRoot), true);
	assert.equal(scene.children.includes(promotion.terrain.group), true);
	assert.equal(scene.children.includes(promotion.sky), true);
	assert.equal(runtime.collisionQuery, newCollision);
	assert.equal(runtime.mover.octree, newCollision);
	assert.equal(runtime.jumpPhysics.ground, promotion.ground);
	assert.equal(runtime.assets.playerAsset, true);
});

function districtState(runtime, districts, authority) {
	const state = attachBootstrapDistrictLifecycle(runtime, {
		active: 2,
		colliders: 96,
		completed: 2,
		districts: {},
		loaded: ['a', 'b'],
		meshes: 8,
		released: 0,
		retired: false,
		status: 'ready',
		triangles: 96
	});
	['a', 'b'].forEach((id, index) => {
		districts[index].userData.meshCount = 4;
		state.districts[id] = {
			collision: { release: () => { state.releaseAuthority = runtime.mainOctree; return 48; } },
			group: districts[index]
		};
	});
	return state;
}

function promotionFixture(collision) {
	const canonical = group('canonical-terrain');
	return {
		assets: { stoneImage: true },
		chunkRegistry: {},
		chunkRuntime: {},
		collisionQuery: collision,
		ground: ground('canonical-ground'),
		groundSampler: {},
		mainOctree: collision,
		obstacles: [],
		sky: group('canonical-sky'),
		terrain: {
			colliders: [{}],
			group: canonical,
			stats: { quality: 'high' },
			village: { definitions: [{}, {}] }
		}
	};
}

function ground(id) {
	return { heightAt: () => 0, id, sample: () => ({ height: 0, normal: { x: 0, y: 1, z: 0 } }) };
}

function group(name) {
	const value = new Group();
	value.name = name;
	return value;
}
