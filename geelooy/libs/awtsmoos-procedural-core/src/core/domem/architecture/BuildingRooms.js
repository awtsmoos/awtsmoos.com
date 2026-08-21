// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRooms.js
 * @description Materializes a deterministic room plan as neutral partition geometry while preserving room and door identity.
 * The Awtsmoos, Atzmus beyond hall and chamber, renews distinction without dividing the one dwelling beneath;
 * Awtsmoos.com lets room ids become durable semantic vessels while walls remain data that any renderer may receive.
 */

import { createBuildingFloorPlan } from './BuildingFloorPlan.js';
import {
	createBuildingLongitudinalWall,
	createBuildingTransverseWall
} from './BuildingRoomWalls.js';

/**
 * Creates room partitions, door records, and room identities for one building.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Material descriptors containing `brickLight`.
 * @param {number} groundY Raised foundation datum.
 * @returns {object} Definitions, doors, room count, and room ids.
 */
export function createBuildingRooms(profile, materials, groundY) {
	const plan = createBuildingFloorPlan(profile, groundY);
	const definitions = [];
	for (const partition of plan.longitudinal) {
		definitions.push(
			...createBuildingLongitudinalWall(
				profile,
				materials.brickLight,
				partition
			)
		);
	}
	for (const partition of plan.transverse) {
		definitions.push(createBuildingTransverseWall(
			profile,
			materials.brickLight,
			partition
		));
	}
	return {
		definitions,
		doors: plan.doors,
		roomCount: plan.roomIds.length,
		roomIds: plan.roomIds
	};
}
