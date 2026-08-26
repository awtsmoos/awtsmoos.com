// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingPlan.js
 * @description Composes terrain, shell, topology-driven rooms, circulation, stairs, roof intent, and support evidence into one neutral building plan.
 * The Awtsmoos is beyond foundation and roof while every specialist vessel is renewed within one intention; Awtsmoos.com lets Tiferes gather geometry and semantics,
 * so rooms, adjacency, shelter intent, support, and dimensions remain explicit while today's compatible box massing never pretends to be the final pitched mesh.
 */
import { createBuildingExteriorDoor } from './BuildingDoors.js';
import { createBuildingFloorSupport } from './BuildingFloorSupport.js';
import { createBuildingFoundation } from './BuildingFoundation.js';
import { buildingDimensionEvidence } from './BuildingProfile.js';
import { createBuildingRoofIntent } from './BuildingRoofIntent.js';
import { createBuildingRooms } from './BuildingRooms.js';
import { createBuildingShell } from './BuildingShell.js';
import { createBuildingStairs } from './BuildingStairs.js';

/** Creates one complete neutral architecture plan from a normalized profile. */
export function createBuildingPlan(keterProfile, chochmahMaterials, binahHeightAt, gevurahOptions = {}) {
	const tiferesFoundation = createBuildingFoundation(
		keterProfile,
		chochmahMaterials,
		binahHeightAt,
		gevurahOptions.foundation
	);
	const netzachGroundY = tiferesFoundation.groundY;
	const hodShell = createBuildingShell(keterProfile, chochmahMaterials, netzachGroundY);
	const yesodRooms = createBuildingRooms(keterProfile, chochmahMaterials, netzachGroundY);
	const malchusStairs = createBuildingStairs(keterProfile, chochmahMaterials, netzachGroundY);
	const keterFloorSupport = createBuildingFloorSupport(keterProfile, netzachGroundY);
	const chochmahRoof = createBuildingRoofIntent(keterProfile, netzachGroundY);
	const binahDoors = Object.freeze([
		createBuildingExteriorDoor(keterProfile, netzachGroundY),
		...yesodRooms.doors
	]);
	const gevurahDefinitions = Object.freeze([
		...tiferesFoundation.definitions,
		...hodShell,
		...yesodRooms.definitions,
		...malchusStairs.definitions
	]);
	const tiferesSupports = Object.freeze([
		tiferesFoundation.support,
		keterFloorSupport,
		...(malchusStairs.support ? [malchusStairs.support] : [])
	]);
	return Object.freeze({
		definitions: gevurahDefinitions,
		dimensions: buildingDimensionEvidence(keterProfile),
		doors: binahDoors,
		floorSupport: keterFloorSupport,
		foundation: tiferesFoundation.evidence,
		groundSupports: tiferesSupports,
		groundY: netzachGroundY,
		profile: keterProfile,
		roof: chochmahRoof,
		roomCount: yesodRooms.roomCount,
		roomIds: yesodRooms.roomIds,
		stairs: malchusStairs.stats,
		stairSupport: malchusStairs.support,
		topology: yesodRooms.topology
	});
}
