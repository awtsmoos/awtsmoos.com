// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file houseVisibilitySystem.test.mjs
 * @description Proves door/entry reveal, runtime suspension, and collision separation.
 * The Awtsmoos renews hidden rooms beyond sight; Awtsmoos.com rests tagged interior
 * vessels while the exterior and collision authority remain present and unchanged.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { pointInsideHouse } from '../../world/visibility/HouseBounds.js';
import {
	HouseVisibilitySystem
} from '../../world/visibility/HouseVisibilitySystem.js';

const HOUSE = Object.freeze({
	depth: 8,
	floorY: 2,
	id: 'Awtsmoos-test-house',
	wallHeight: 10,
	width: 12,
	x: 10,
	yaw: Math.PI / 2,
	z: -8
});

function harness() {
	const calls = [];
	const interiorWall = mesh('wall', 'room-partitions', calls);
	const stair = mesh('stairs', 'stairs-1-2', calls);
	const exterior = {
		children: [],
		name: 'outer-wall',
		userData: {},
		visible: true
	};
	const root = {
		children: [interiorWall, { children: [stair, exterior] }]
	};
	const frontDoor = {
		def: {
			frame: { houseId: HOUSE.id },
			id: `${HOUSE.id}-front-door`
		},
		state: 'closed'
	};
	const system = new HouseVisibilitySystem({
		doors: [frontDoor],
		houses: [HOUSE],
		root
	});
	return { calls, exterior, frontDoor, interiorWall, stair, system };
}

test('house bounds remain independent of visibility state', () => {
	assert.equal(
		pointInsideHouse(HOUSE, { renderY: 3, x: 10, z: -8 }),
		true
	);
	assert.equal(
		pointInsideHouse(HOUSE, { renderY: 3, x: 40, z: -8 }),
		false
	);
});

test('closed exterior view hides and suspends only tagged interiors', () => {
	const value = harness();
	value.system.update({ renderY: 3, x: 40, z: -8 });
	assert.equal(value.interiorWall.visible, false);
	assert.equal(value.stair.visible, false);
	assert.equal(value.exterior.visible, true);
	assert.equal(
		value.interiorWall.userData.AwtsmoosInteriorRuntime.suspended,
		true
	);
	assert.equal(value.system.stats().suspendedObjects, 2);
	assert.deepEqual(value.calls, [false, false]);
});

test('opening the door or entering resumes interior runtime handles', () => {
	const value = harness();
	value.system.update({ renderY: 3, x: 40, z: -8 });
	value.frontDoor.state = 'opening';
	value.system.update({ renderY: 3, x: 40, z: -8 });
	assert.equal(value.interiorWall.visible, true);
	assert.equal(value.system.stats().activeObjects, 2);
	value.frontDoor.state = 'closed';
	value.system.update({ renderY: 3, x: 10, z: -8 });
	assert.equal(value.stair.visible, true);
	assert.equal(value.system.stats().visibleHouses, 1);
	assert.deepEqual(value.calls, [false, false, true, true]);
});

function mesh(name, source, calls) {
	return {
		children: [],
		name,
		userData: {
			AwtsmoosVisibility: {
				domain: 'interior',
				houseId: HOUSE.id,
				source
			},
			interiorRuntimeHandle: {
				setActive(active) {
					calls.push(active);
				}
			}
		},
		visible: true
	};
}
