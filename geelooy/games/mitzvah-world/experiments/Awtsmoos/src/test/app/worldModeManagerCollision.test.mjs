// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldModeManagerCollision.test.mjs
 * @description Proves lava isolation and exact Eretz collision-facade restoration.
 * The Awtsmoos conceals one world and reveals another without losing its source;
 * Awtsmoos.com therefore restores the same accepted query vessel, not a stale octree.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldModeManager } from '../../world/WorldModeManager.js';

test('lava entry isolates collision and Eretz return restores the facade', () => {
	const fixture = createFixture();
	const manager = new WorldModeManager(fixture.options)
		.rememberMainHeight(fixture.mainHeightAt);
	assert.equal(manager.enterLava(), true);
	assert.equal(manager.enterLava(), false);
	assert.equal(manager.mode, 'lava');
	assert.equal(fixture.ground.octree, fixture.lava.octree);
	assert.equal(fixture.mover.octree, fixture.lava.octree);
	assert.equal(fixture.mainGroup.visible, false);
	assert.equal(fixture.mainObjects[0].visible, false);
	assert.equal(manager.returnEretz(), true);
	assert.equal(manager.returnEretz(), false);
	assert.equal(manager.mode, 'eretz');
	assert.equal(fixture.ground.octree, fixture.eretzCollision);
	assert.equal(fixture.mover.octree, fixture.eretzCollision);
	assert.equal(fixture.ground.terrainHeightAt, fixture.mainHeightAt);
	assert.equal(fixture.mainGroup.visible, true);
	assert.equal(fixture.mainObjects[0].visible, true);
	assert.equal(fixture.lava.leaveCollision, fixture.eretzCollision);
	assert.equal(manager.stats().eretzCollisionRestored, true);
});

test('return requires remembered Eretz terrain height', () => {
	const fixture = createFixture();
	const manager = new WorldModeManager(fixture.options);
	manager.enterLava();
	assert.throws(
		() => manager.returnEretz(),
		/Eretz height function was not remembered/
	);
});

function createFixture() {
	const eretzCollision = { revision: 'eretz-active' };
	const lavaOctree = { id: 'lava-octree' };
	const state = {
		x: 0,
		y: 1,
		renderY: 1,
		z: 4,
		velY: 0,
		grounded: true,
		level: 'eretz'
	};
	const mainHeightAt = () => 2;
	const ground = {
		octree: eretzCollision,
		terrainHeightAt: mainHeightAt,
		heightAt: () => 2
	};
	const mover = { octree: eretzCollision };
	const mainGroup = { visible: true };
	const mainObjects = [{ visible: true }];
	const lava = {
		octree: lavaOctree,
		group: { visible: false },
		heightAt: () => -1,
		enter(currentState, currentGround, currentMover) {
			this.group.visible = true;
			currentState.level = 'lava-coin-course';
			currentMover.octree = this.octree;
			this.enterGround = currentGround;
		},
		leave(currentState, currentGround, currentMover, collision) {
			this.group.visible = false;
			currentState.level = 'eretz';
			currentMover.octree = collision;
			this.leaveGround = currentGround;
			this.leaveCollision = collision;
		}
	};
	return {
		eretzCollision,
		lava,
		ground,
		mover,
		mainGroup,
		mainObjects,
		mainHeightAt,
		options: {
			state,
			ground,
			mover,
			eretzCollision,
			mainGroup,
			lava,
			mainObjects,
			footOffset: 0.2
		}
	};
}
