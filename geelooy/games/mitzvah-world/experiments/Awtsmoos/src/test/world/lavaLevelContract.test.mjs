//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file lavaLevelContract.test.mjs
 * @description Protects deterministic lava geometry, stable collectible vessels, collision handoff, failure reset, and Eretz return semantics.
 * The proof uses only Node built-ins plus the authored MitzvahWorld runtime.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ERETZ_RETURN,
	LAVA_START,
	LavaLevel,
	lavaWorldDefs
} from '../../world/LavaLevel.js';

/** Creates one minimal scene root exposing the exact add contract LavaLevel consumes. */
function createScene() {
	return {
		children: [],
		add(object) {
			this.children.push(object);
		}
	};
}

/** Creates a flat deterministic ground sampler for transition assertions. */
function createGround(height = 2) {
	return {
		heightAt() {
			return height;
		}
	};
}

test('B"H lava world preserves deterministic geometry and Core-owned collectible vessels', () => {
	const scene = createScene();
	const level = new LavaLevel(scene, {});
	assert.equal(lavaWorldDefs({}).length, 33);
	assert.equal(level.defs.length, 33);
	assert.equal(level.coins.length, 15);
	assert.equal(level.colliders.length, 384);
	assert.equal(level.group.children.length, 48);
	assert.equal(scene.children[0], level.group);
	assert.equal(level.group.visible, false);
	assert.ok(level.coins.every(coin => coin.group?.isGroup));
});

test('B"H lava enter, collect, fail, and leave preserve the public lifecycle contract', () => {
	const scene = createScene();
	const ground = createGround();
	const mainOctree = { name: 'main' };
	const mover = { octree: mainOctree };
	const state = {
		x: 0,
		y: 0,
		z: 0,
		level: 'eretz',
		velY: 9,
		grounded: false
	};
	const footOffset = 1;
	const level = new LavaLevel(scene, {});

	level.enter(state, ground, mover, footOffset);
	assert.equal(level.active, true);
	assert.equal(level.group.visible, true);
	assert.equal(state.level, 'lava-coin-course');
	assert.deepEqual({ x: state.x, z: state.z }, LAVA_START);
	assert.equal(state.y, 3);
	assert.equal(mover.octree, level.octree);

	const coin = level.coins[0];
	state.x = coin.x;
	state.z = coin.z;
	state.y = coin.floorY + footOffset;
	level.update(state, ground, footOffset);
	assert.equal(level.collected, 1);
	assert.equal(coin.got, true);
	assert.equal(coin.group.visible, false);

	state.y = level.heightAt() + footOffset;
	level.update(state, ground, footOffset);
	assert.equal(level.failures, 1);
	assert.equal(level.collected, 0);
	assert.ok(level.coins.every(item => !item.got && item.group.visible));
	assert.deepEqual({ x: state.x, z: state.z }, LAVA_START);

	level.leave(state, ground, mover, mainOctree, footOffset);
	assert.equal(level.active, false);
	assert.equal(level.group.visible, false);
	assert.equal(state.level, 'eretz');
	assert.deepEqual({ x: state.x, z: state.z }, ERETZ_RETURN);
	assert.equal(mover.octree, mainOctree);
	assert.equal(state.grounded, true);

	const stats = level.stats();
	assert.equal(stats.failures, 1);
	assert.equal(stats.total, 15);
	assert.equal(stats.loadedWorld, false);
	assert.equal(stats.extendedCourse, true);
});
