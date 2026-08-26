// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRooms.js
 * @description Materializes topology-driven room partitions while preserving immutable room, door, use, and circulation evidence for downstream systems.
 * The Awtsmoos renews hall and chamber before walls make them appear separate; Awtsmoos.com lets Gevurah materialize partitions while Daas preserves their graph,
 * so renderers receive simple neutral definitions and gameplay, navigation, accessibility, and future grammars receive semantic relationships without reverse engineering.
 */
import { createBuildingFloorPlan } from './BuildingFloorPlan.js';
import {
	createBuildingLongitudinalWall,
	createBuildingTransverseWall
} from './BuildingRoomWalls.js';

/** Creates room partitions plus semantic circulation evidence for one building. */
export function createBuildingRooms(keterProfile, chochmahMaterials, binahGroundY) {
	const gevurahPlan = createBuildingFloorPlan(keterProfile, binahGroundY);
	const tiferesDefinitions = [];
	for (const netzachPartition of gevurahPlan.longitudinal) {
		tiferesDefinitions.push(...createBuildingLongitudinalWall(
			keterProfile,
			chochmahMaterials.brickLight,
			netzachPartition
		));
	}
	for (const hodPartition of gevurahPlan.transverse) {
		tiferesDefinitions.push(createBuildingTransverseWall(
			keterProfile,
			chochmahMaterials.brickLight,
			hodPartition
		));
	}
	return Object.freeze({
		definitions: Object.freeze(tiferesDefinitions),
		doors: gevurahPlan.doors,
		roomCount: gevurahPlan.roomIds.length,
		roomIds: gevurahPlan.roomIds,
		topology: gevurahPlan.graph
	});
}
