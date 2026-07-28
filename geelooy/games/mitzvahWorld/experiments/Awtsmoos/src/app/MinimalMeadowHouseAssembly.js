// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseAssembly.js
 * @description Assembles visible homes with entry, story-floor, stair, landing, and collider truth.
 * The Awtsmoos gathers meadow, threshold, room, and upper story into one measured dwelling;
 * Awtsmoos.com returns each horizontal support separately so no immense room opens beneath the player.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	installMinimalMeadowHouseDefinitions, installMinimalMeadowHouseDoors,
	installMinimalMeadowHouseMezuzahs
} from './MinimalMeadowHouseAssemblyInstallers.js';
import { houseDimensionEvidence } from './MinimalMeadowHouseDimensionPolicy.js';
import { createMinimalMeadowHouseFloorSupport } from './MinimalMeadowHouseFloorSupport.js';
import { createMinimalMeadowHouseFoundation } from './MinimalMeadowHouseFoundation.js';
import { createMinimalMeadowHouseRooms } from './MinimalMeadowHouseRooms.js';
import { createMinimalMeadowHouseShell } from './MinimalMeadowHouseShell.js';
import { createMinimalMeadowHouseStairs } from './MinimalMeadowHouseStairs.js';

export function createMinimalMeadowHouseAssembly(profile, materials, runtime) {
	const foundation = createMinimalMeadowHouseFoundation(profile, materials, runtime.terrain.heightAt);
	const groundY = foundation.groundY;
	const group = new Group();
	group.name = `Awtsmoos_house_${profile.id}`;
	const rooms = createMinimalMeadowHouseRooms(profile, materials, groundY);
	const stairs = createMinimalMeadowHouseStairs(profile, materials, groundY);
	const floorSupport = createMinimalMeadowHouseFloorSupport(profile, groundY);
	const shell = createMinimalMeadowHouseShell(profile, materials, groundY);
	const doorSpecifications = [exteriorDoor(profile, groundY), ...rooms.doors];
	const definitions = [
		...foundation.definitions, ...shell, ...rooms.definitions, ...stairs.definitions
	];
	const staticColliders = installMinimalMeadowHouseDefinitions(
		group, definitions, runtime.mainOctree
	);
	const doors = installMinimalMeadowHouseDoors(
		group, doorSpecifications, profile, materials, runtime
	);
	const mezuzahs = installMinimalMeadowHouseMezuzahs(
		group, doorSpecifications, profile, materials
	);
	const groundSupports = [foundation.support, floorSupport, stairs.support].filter(Boolean);
	group.userData.AwtsmoosHouseDimensions = houseDimensionEvidence(profile);
	return {
		definitions, dimensions: houseDimensionEvidence(profile), doors, floorSupport,
		foundation: foundation.evidence, groundSupports, groundY, group, mezuzahs, profile,
		roomCount: rooms.roomCount, roomIds: rooms.roomIds, stairSupport: stairs.support,
		stairs: stairs.stats, staticColliders
	};
}

function exteriorDoor(profile, groundY) {
	return {
		id: `${profile.id}-front-door`, level: 0, localX: 0, localZ: profile.depth / 2,
		sourceRoomId: 'outside', targetRoomId: `${profile.id}-story-1-hall`,
		y: groundY + profile.floorThickness, yaw: profile.yaw
	};
}
