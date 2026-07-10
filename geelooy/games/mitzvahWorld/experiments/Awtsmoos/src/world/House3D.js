// B"H
import {
	DEFAULT_HOUSE_SPEC,
	createFutureHouseSpecs,
	createModularHouse,
	modularHouseAnchors,
	modularHouseDoorDef,
	modularHouseDoorDefs,
	modularHouseRoadStart
} from './ModularHouseSystem.js';

const DISTRICT_SPECS = createFutureHouseSpecs(DEFAULT_HOUSE_SPEC);
const ALL_SPECS = [DEFAULT_HOUSE_SPEC, ...DISTRICT_SPECS];

/** Builds the district and preserves every measured diagnostic package. */
export function createHouseDefs(assets = {}, groundSampler) {
	const packages = ALL_SPECS.map((spec) => createModularHouse(assets, spec, groundSampler));
	const definitions = packages.flatMap((packageDefinitions) => [...packageDefinitions]);
	definitions.userData = {
		houses: packages.map((item) => item.userData.houseStats),
		stairs: packages.flatMap((item) => item.userData.stairStats),
		stairLayouts: packages.flatMap((item) => item.userData.stairLayouts),
		mezuzahs: packages.flatMap((item) => item.userData.mezuzaStats),
		anchors: packages.map((item) => item.userData.anchors),
		rooms: packages.flatMap((item) => item.userData.roomDebug)
	};
	return definitions;
}

export function houseDoorDef(assets = {}, groundSampler) {
	return modularHouseDoorDef(assets, DEFAULT_HOUSE_SPEC, groundSampler);
}

export function allHouseDoorDefs(assets = {}, groundSampler) {
	return ALL_SPECS.flatMap((spec) => modularHouseDoorDefs(assets, spec, groundSampler));
}

export function houseRoadStart() {
	return modularHouseRoadStart(DEFAULT_HOUSE_SPEC);
}

export function houseAnchors() {
	return modularHouseAnchors(DEFAULT_HOUSE_SPEC);
}

export function houseDistrictHooks() {
	return DISTRICT_SPECS.map((spec) => ({ spec, anchors: modularHouseAnchors(spec) }));
}

export function houseAllAnchors() {
	return { main: houseAnchors(), district: houseDistrictHooks().map((hook) => hook.anchors) };
}

export function houseAllSpecs() {
	return ALL_SPECS.map((spec) => ({ ...spec }));
}

export function manualShape(id, material, position, vertices, faces, options = {}) {
	const { yaw = 0, walkable = false, solid = true } = options;
	return {
		id, shape: 'manual', solid, walkable, ...material,
		position, vertices, faces, rotation: { y: yaw }, yaw
	};
}
