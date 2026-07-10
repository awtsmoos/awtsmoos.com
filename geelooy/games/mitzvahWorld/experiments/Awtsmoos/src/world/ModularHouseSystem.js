// B"H
import { createFenceAlongPath } from './ProceduralFenceSystem.js';
import { createInteriorRoomSet } from './InteriorRoomSystem.js';
import { createStoryFloorPieces } from './StoryFloorSystem.js';
import { createHouseEntry, entryAnchors } from './house/HouseEntrySystem.js';
import { createHouseFenceSegments } from './house/HouseFenceSystem.js';
import { createHouseMaterials } from './house/HouseMaterials.js';
import { createHouseShell } from './house/HouseShellSystem.js';
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
import {
	planHouseStaircase,
	staircaseStats
} from './house/HouseStairSystem.js';
import { createStairDefinitions } from './house/StairMeshBuilder.js';

export { DEFAULT_HOUSE_SPEC, HOUSE_ROOM_KINDS, createFutureHouseSpecs };

/** Orchestrates focused house systems without owning their geometry formulas. */
export function createModularHouse(assets = {}, specification = DEFAULT_HOUSE_SPEC, groundSampler) {
	const spec = resolveHouseSpec(specification, groundSampler);
	const materials = createHouseMaterials(assets);
	const entry = createHouseEntry(spec, materials, groundSampler);
	const rooms = createInteriorRoomSet({ spec, materials });
	const stairLayouts = [];
	const definitions = [
		...createHouseShell(spec, materials),
		entry.wall,
		entry.mezuza,
		...entry.steps,
		...rooms.staticDefs
	];
	for (let level = 1; level < spec.floors; level += 1) {
		const layout = planHouseStaircase(spec, level - 1, level);
		stairLayouts.push(layout);
		definitions.push(...createStoryFloorPieces({ spec, material: materials.stone, level }));
		definitions.push(...createStairDefinitions(layout, spec, materials.stone));
	}
	if (spec.fence && groundSampler) {
		definitions.push(...createFenceAlongPath({
			id: `${spec.id}-measured-fence`,
			segments: createHouseFenceSegments(spec),
			groundSampler,
			material: { ...materials.fence, doubleSided: true }
		}));
	}
	definitions.userData = packageMetadata(spec, entry, rooms, stairLayouts);
	return definitions;
}

export function modularHouseDoorDefs(assets = {}, specification = DEFAULT_HOUSE_SPEC, groundSampler) {
	const spec = resolveHouseSpec(specification, groundSampler);
	const materials = createHouseMaterials(assets);
	const entry = createHouseEntry(spec, materials, groundSampler);
	const rooms = createInteriorRoomSet({ spec, materials });
	return [entry.door, ...rooms.doorDefs];
}

export function modularHouseDoorDef(assets = {}, specification = DEFAULT_HOUSE_SPEC, groundSampler) {
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
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification, floorY: specification.floorY ?? 0 };
	const entry = entryAnchors(spec);
	const stair = spec.floors > 1 ? planHouseStaircase(spec, 0, 1) : null;
	return {
		id: spec.id,
		frontDoor: entry.door,
		frontStairs: entry.landing,
		roadGate: entry.gate,
		insideFoyer: localToWorld(spec, 0, spec.depth / 2 - 5),
		hallCenter: localToWorld(spec, 0, 0),
		backRoom: localToWorld(spec, 0, -spec.depth / 2 + 7),
		upstairsHook: stair ? { ...localToWorld(spec, stair.opening.centerX, stair.opening.centerZ), y: floorTopY(spec, 1) } : null
	};
}

function packageMetadata(spec, entry, rooms, layouts) {
	return {
		doorDefs: [entry.door, ...rooms.doorDefs],
		roomDebug: rooms.debug,
		houseStats: {
			id: spec.id, x: spec.x, z: spec.z, yaw: spec.yaw,
			width: spec.width, depth: spec.depth, floorY: spec.floorY,
			wallThickness: spec.wallT, wallHeight: spec.wallH,
			floors: spec.floors, storyHeight: spec.storyHeight,
			partitionCount: rooms.debug.length,
			partitionFullHeight: rooms.debug.every((item) => item.touchesCeiling),
			stairCount: layouts.length, openingCount: layouts.length
		},
		stairStats: layouts.map(staircaseStats),
		stairLayouts: layouts,
		mezuzaStats: [entry.mezuza.userData.AwtsmoosMezuza],
		anchors: modularHouseAnchors(spec)
	};
}
