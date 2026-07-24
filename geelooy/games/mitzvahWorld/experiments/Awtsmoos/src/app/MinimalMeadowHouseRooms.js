// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseRooms.js
	* @description Builds six room bays per story around a broad central hall and real door gaps.
	* The Awtsmoos draws walls without sealing the path; Awtsmoos.com aligns jamb-free openings,
	* headers, transverse divisions, room identities, visible boxes, and collision-ready definitions.
	*/

import { houseBox } from './MinimalMeadowHouseMath.js';
import { createMinimalMeadowHouseFloorPlan } from './MinimalMeadowHouseFloorPlan.js';

export function createMinimalMeadowHouseRooms(profile, materials, groundY) {
	const plan = createMinimalMeadowHouseFloorPlan(profile, groundY);
	const definitions = [];
	for (const partition of plan.longitudinal) {
		definitions.push(...longitudinalWall(profile, materials.brickLight, partition));
	}
	for (const partition of plan.transverse) {
		definitions.push(transverseWall(profile, materials.brickLight, partition));
	}
	return {
		definitions,
		doors: plan.doors,
		roomCount: plan.roomIds.length,
		roomIds: plan.roomIds
	};
}

function longitudinalWall(profile, material, partition) {
	const definitions = [];
	const halfDepth = profile.layout.innerDepth / 2;
	const openingWidth = profile.doorWidth + 0.18;
	let cursor = -halfDepth;
	for (let index = 0; index < partition.bayCenters.length; index += 1) {
		const center = partition.bayCenters[index];
		const openingStart = center - openingWidth / 2;
		pushLongSegment(definitions, profile, material, partition, cursor, openingStart, index);
		definitions.push(header(profile, material, partition, center, index));
		cursor = center + openingWidth / 2;
	}
	pushLongSegment(definitions, profile, material, partition, cursor, halfDepth, 9);
	return definitions;
}

function pushLongSegment(target, profile, material, partition, start, end, index) {
	const length = end - start;
	if (length <= 0.08) return;
	target.push(houseBox(profile, material, `${partition.id}-segment-${index}`, partition.localX, partition.floorY + profile.storyHeight / 2, (start + end) / 2, {
		x: length,
		y: profile.storyHeight,
		z: profile.wallThickness
	}, { role: 'longitudinal-room-wall', yaw: Math.PI / 2 }));
}

function header(profile, material, partition, center, index) {
	const height = profile.storyHeight - profile.doorHeight;
	return houseBox(profile, material, `${partition.id}-header-${index}`, partition.localX, partition.floorY + profile.doorHeight + height / 2, center, {
		x: profile.doorWidth + 0.18,
		y: height,
		z: profile.wallThickness
	}, { role: 'room-door-header', yaw: Math.PI / 2 });
}

function transverseWall(profile, material, partition) {
	return houseBox(profile, material, partition.id, partition.localX, partition.floorY + profile.storyHeight / 2, partition.localZ, {
		x: profile.layout.wingWidth,
		y: profile.storyHeight,
		z: profile.wallThickness
	}, { role: 'transverse-room-wall' });
}
