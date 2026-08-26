// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingPlan.js
 * @description Composes focused architecture planners into one renderer-neutral building plan with geometry and support evidence.
 * The Awtsmoos, Atzmus beyond foundation and roof, renews every specialist vessel while one intention passes through them all;
 * Awtsmoos.com lets Tiferes join survey, enclosure, rooms, stairs, doors, and roof grammar without stealing the craft of each hall.
 */

import { createBuildingExteriorDoor } from './BuildingDoors.js';
import { createBuildingFloorSupport } from './BuildingFloorSupport.js';
import { createBuildingFoundation } from './BuildingFoundation.js';
import { buildingDimensionEvidence } from './BuildingProfile.js';
import { buildingRoofEvidence } from './BuildingRoofPlan.js';
import { createBuildingRooms } from './BuildingRooms.js';
import { createBuildingShell } from './BuildingShell.js';
import { createBuildingStairs } from './BuildingStairs.js';

/**
 * Creates one complete neutral architecture plan from a normalized profile.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Opaque architectural material descriptors.
 * @param {Function} heightAt Terrain height sampler injected by the consuming world.
 * @param {object} [options={}] Foundation and terrain-fitting controls.
 * @returns {Readonly<object>} Building definitions, doors, rooms, supports, dimensions, roof, and evidence.
 */
export function createBuildingPlan(profile, materials, heightAt, options = {}) {
	const foundation = createBuildingFoundation(
		profile,
		materials,
		heightAt,
		options.foundation
	);
	const groundY = foundation.groundY;
	const shell = createBuildingShell(profile, materials, groundY);
	const rooms = createBuildingRooms(profile, materials, groundY);
	const stairs = createBuildingStairs(profile, materials, groundY);
	const floorSupport = createBuildingFloorSupport(profile, groundY);
	const doors = Object.freeze([
		createBuildingExteriorDoor(profile, groundY),
		...rooms.doors
	]);
	const definitions = Object.freeze([
		...foundation.definitions,
		...shell,
		...rooms.definitions,
		...stairs.definitions
	]);
	const groundSupports = Object.freeze([
		foundation.support,
		floorSupport,
		...(stairs.support ? [stairs.support] : [])
	]);
	return Object.freeze({
		definitions,
		dimensions: buildingDimensionEvidence(profile),
		doors,
		floorSupport,
		foundation: foundation.evidence,
		groundSupports,
		groundY,
		profile,
		roof: buildingRoofEvidence(profile),
		roomCount: rooms.roomCount,
		roomIds: Object.freeze([...rooms.roomIds]),
		stairs: stairs.stats,
		stairSupport: stairs.support
	});
}
