// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModularHouseSystem.js
 * @description Orchestrates measured dwellings while exterior and interior
 * definitions remain distinct vessels within the undivided light of Awtsmoos.
 */
import { createInteriorRoomSet } from './InteriorRoomSystem.js';
import { createHouseEntry, entryAnchors } from './house/HouseEntrySystem.js';
import { assembleHouseDefinitions } from './house/HouseDefinitionAssembly.js';
import { createHouseMaterials } from './house/HouseMaterials.js';
import { createHousePackageMetadata } from './house/HousePackageMetadata.js';
import {
	DEFAULT_HOUSE_SPEC,
	floorTopY,
	localToWorld,
	resolveHouseSpec
} from './house/HouseSpec.js';
import {
	HOUSE_ROOM_KINDS,
	createFutureHouseSpecs
} from './house/HouseDistrictSpecs.js';
import { planHouseStaircase } from './house/HouseStairSystem.js';

export {
	DEFAULT_HOUSE_SPEC,
	HOUSE_ROOM_KINDS,
	createFutureHouseSpecs
};

/** Creates one measured house package with explicit visibility classification. */
export function createModularHouse(
	assets = {},
	specification = DEFAULT_HOUSE_SPEC,
	groundSampler
) {
	const spec = resolveHouseSpec(specification, groundSampler);
	const materials = createHouseMaterials(assets);
	const entry = createHouseEntry(spec, materials, groundSampler);
	const rooms = createInteriorRoomSet({ spec, materials });
	const assembly = assembleHouseDefinitions({
		spec,
		materials,
		entry,
		rooms,
		groundSampler
	});
	assembly.definitions.userData = createHousePackageMetadata({
		spec,
		entry,
		rooms,
		stairLayouts: assembly.stairLayouts,
		yardGrass: assembly.yardGrass,
		yardPatches: assembly.yardPatches,
		anchors: modularHouseAnchors(spec)
	});
	return assembly.definitions;
}

/** Creates entry and interior dynamic doors without rebuilding static meshes. */
export function modularHouseDoorDefs(
	assets = {},
	specification = DEFAULT_HOUSE_SPEC,
	groundSampler
) {
	const spec = resolveHouseSpec(specification, groundSampler);
	const materials = createHouseMaterials(assets);
	const entry = createHouseEntry(spec, materials, groundSampler);
	const rooms = createInteriorRoomSet({ spec, materials });
	return [entry.door, ...rooms.doorDefs];
}

export function modularHouseDoorDef(assets = {}, specification, groundSampler) {
	return modularHouseDoorDefs(assets, specification, groundSampler)[0];
}

export function modularHouseDoorWorld(specification = DEFAULT_HOUSE_SPEC) {
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification };
	return localToWorld(spec, 0, spec.depth / 2 - spec.wallT / 2);
}

export function modularHouseRoadStart(specification = DEFAULT_HOUSE_SPEC) {
	return entryAnchors({ ...DEFAULT_HOUSE_SPEC, ...specification }).gate;
}

export function modularHouseAnchors(specification = DEFAULT_HOUSE_SPEC) {
	const spec = {
		...DEFAULT_HOUSE_SPEC,
		...specification,
		floorY: specification.floorY ?? 0
	};
	const entry = entryAnchors(spec);
	const stair = spec.floors > 1
		? planHouseStaircase(spec, 0, 1)
		: null;
	return {
		id: spec.id,
		frontDoor: entry.door,
		frontStairs: entry.landing,
		roadGate: entry.gate,
		insideFoyer: localToWorld(spec, 0, spec.depth / 2 - 5),
		hallCenter: localToWorld(spec, 0, 0),
		backRoom: localToWorld(spec, 0, -spec.depth / 2 + 7),
		upstairsHook: stair
			? {
				...localToWorld(spec, stair.opening.centerX, stair.opening.centerZ),
				y: floorTopY(spec, 1)
			}
			: null
	};
}
