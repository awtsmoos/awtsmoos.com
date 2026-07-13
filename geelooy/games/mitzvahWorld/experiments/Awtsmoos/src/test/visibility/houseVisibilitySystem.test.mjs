// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file houseVisibilitySystem.test.mjs
 * @description Proves closed houses conceal only tagged interiors while doors,
 * entry, collision vessels, and exterior forms remain before the Awtsmoos.
 */
import assert from 'node:assert/strict';
import { pointInsideHouse } from '../../world/visibility/HouseBounds.js';
import { HouseVisibilitySystem } from '../../world/visibility/HouseVisibilitySystem.js';

const house = {
	id: 'Awtsmoos-test-house',
	x: 10,
	z: -8,
	yaw: Math.PI / 2,
	width: 12,
	depth: 8,
	floorY: 2,
	wallHeight: 10
};
const interiorWall = mesh('wall', house.id, 'room-partitions');
const stair = mesh('stairs', house.id, 'stairs-1-2');
const exterior = { name: 'outer-wall', visible: true, userData: {} };
const root = { children: [interiorWall, { children: [stair, exterior] }] };
const frontDoor = {
	state: 'closed',
	def: {
		id: `${house.id}-front-door`,
		frame: { houseId: house.id }
	}
};
const system = new HouseVisibilitySystem({
	root,
	houses: [house],
	doors: [frontDoor]
});

assert.equal(pointInsideHouse(house, { x: 10, renderY: 3, z: -8 }), true);
assert.equal(pointInsideHouse(house, { x: 40, renderY: 3, z: -8 }), false);

system.update({ x: 40, renderY: 3, z: -8 });
assert.equal(interiorWall.visible, false);
assert.equal(stair.visible, false);
assert.equal(exterior.visible, true);
assert.equal(system.stats().hiddenMeshes, 2);

frontDoor.state = 'opening';
system.update({ x: 40, renderY: 3, z: -8 });
assert.equal(interiorWall.visible, true);
assert.equal(stair.visible, true);

frontDoor.state = 'closed';
system.update({ x: 10, renderY: 3, z: -8 });
assert.equal(interiorWall.visible, true);
assert.equal(system.stats().visibleHouses, 1);

system.update({ x: 40, renderY: 3, z: -8 });
assert.equal(interiorWall.visible, false);
assert.equal(system.stats().hiddenHouses, 1);

console.log(JSON.stringify({
	ok: true,
	stats: system.stats(),
	exteriorVisible: exterior.visible
}, null, 2));

function mesh(name, houseId, source) {
	return {
		name,
		visible: true,
		children: [],
		userData: {
			AwtsmoosVisibility: {
				houseId,
				domain: 'interior',
				source
			}
		}
	};
}
