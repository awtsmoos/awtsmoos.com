// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseAssembly.js
 * @description Assembles shell, rooms, stairs, doors, mezuzahs, meshes, and static colliders.
 * The Awtsmoos gathers dwelling and passage without concealing their measures; Awtsmoos.com
 * keeps visible bricks, walkable stairs, room IDs, threshold evidence, and collision synchronized.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from '../world/Box3D.js';
import { MinimalMeadowHouseDoor } from './MinimalMeadowHouseDoor.js?v=20260724-meadow-17';
import { createMinimalMeadowMezuzah } from './MinimalMeadowHouseMezuzah.js?v=20260724-meadow-17';
import { createMinimalMeadowHouseRooms } from './MinimalMeadowHouseRooms.js?v=20260724-meadow-17';
import { createMinimalMeadowHouseShell } from './MinimalMeadowHouseShell.js?v=20260724-meadow-17';
import { createMinimalMeadowHouseStairs } from './MinimalMeadowHouseStairs.js?v=20260724-meadow-17';

export function createMinimalMeadowHouseAssembly(profile, materials, runtime) {
	const groundY = runtime.terrain.heightAt(profile.x, profile.z);
	const group = new Group();
	group.name = `Awtsmoos_house_${profile.id}`;
	const rooms = createMinimalMeadowHouseRooms(profile, materials, groundY);
	const stairs = createMinimalMeadowHouseStairs(profile, materials, groundY);
	const shell = createMinimalMeadowHouseShell(profile, materials, groundY);
	const frontDoor = exteriorDoor(profile, groundY);
	const doorSpecs = [frontDoor, ...rooms.doors];
	const definitions = [...shell, ...rooms.definitions, ...stairs.definitions];
	const staticColliders = [];
	for (const definition of definitions) {
		group.add(createPrimitiveMesh(definition));
		for (const collider of primitiveColliders(definition)) {
			runtime.mainOctree.insert(collider);
			staticColliders.push(collider);
		}
	}
	const doors = doorSpecs.map(specification => {
		const door = new MinimalMeadowHouseDoor(profile, materials.wood, specification, runtime.mainOctree, runtime.bus);
		group.add(door.group);
		return door;
	});
	const mezuzahs = doorSpecs.map(specification => {
		const mezuzah = createMinimalMeadowMezuzah(profile, materials, specification);
		group.add(mezuzah.mesh);
		return mezuzah;
	});
	return {
		definitions,
		doors,
		groundY,
		group,
		mezuzahs,
		profile,
		roomCount: rooms.roomCount,
		stairs: stairs.stats,
		staticColliders
	};
}

function exteriorDoor(profile, groundY) {
	return {
		id: `${profile.id}-front-door`,
		level: 0,
		localX: 0,
		localZ: profile.depth / 2,
		sourceRoomId: 'outside',
		targetRoomId: `${profile.id}-foyer`,
		y: groundY + profile.floorThickness,
		yaw: profile.yaw
	};
}
