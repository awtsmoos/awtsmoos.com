// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public Domem architecture surface for terrain-aware plans, room topology, circulation, roof intent, support, and focused wall-building evidence.
 * The Awtsmoos is beyond blueprint and stone while Awtsmoos.com gathers small architectural vessels beneath one discoverable gate,
 * so simple callers enter through BuildingAuthority and experts inspect topology, circulation, roof truth, terrain support, rooms, and measured apertures without monolithic fate.
 */
export { BuildingAuthority, createBuildingAuthority } from './BuildingAuthority.js';
export { createBuildingPlan } from './BuildingPlan.js';
export {
	HUMAN_SCALE_BUILDING_DOOR,
	buildingDimensionEvidence,
	createBuildingProfile
} from './BuildingProfile.js';
export { createBuildingLayout } from './BuildingLayout.js';
export {
	buildingRoomUse,
	createBuildingRoomTopology
} from './BuildingRoomTopology.js';
export { createBuildingCirculationGraph } from './BuildingCirculationGraph.js';
export { createBuildingRoofIntent } from './BuildingRoofIntent.js';
export { buildingPoint, buildingLocalPoint, buildingBox } from './BuildingMath.js';
export { createBuildingFloorPlan } from './BuildingFloorPlan.js';
export { surveyBuildingGround } from './BuildingGroundSurvey.js';
export { createBuildingFoundation } from './BuildingFoundation.js';
export { createBuildingEntryTerrainPlan } from './BuildingEntryTerrainPlan.js';
export { createBuildingEntrySupport } from './BuildingEntrySupport.js';
export { createBuildingEntryHeightSupport } from './BuildingEntryHeightSupport.js';
export { createBuildingShell } from './BuildingShell.js';
export { createBuildingRooms } from './BuildingRooms.js';
export {
	appendBuildingLongitudinalSegment,
	createBuildingRoomDoorHeader
} from './BuildingRoomWallParts.js';
export {
	buildingStairAperture,
	buildingStairApertureEvidence
} from './BuildingStairAperture.js';
export { createBuildingFloorSupport } from './BuildingFloorSupport.js';
export { buildingStairHeightAt, createBuildingStairSupport } from './BuildingStairSupport.js';
export { createBuildingStairs } from './BuildingStairs.js';
export { createBuildingExteriorDoor } from './BuildingDoors.js';
