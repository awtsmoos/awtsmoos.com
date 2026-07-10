// B"H
import { createModularHouse, modularHouseAnchors, modularHouseDoorDef, modularHouseRoadStart, DEFAULT_HOUSE_SPEC, createFutureHouseSpecs } from './ModularHouseSystem.js';
const DISTRICT_SPECS = createFutureHouseSpecs(DEFAULT_HOUSE_SPEC);

/** House3D: every visible house has a matching dynamic solid door definition. */
export function createHouseDefs(assets = {}) { return [ ...createModularHouse(assets, DEFAULT_HOUSE_SPEC), ...DISTRICT_SPECS.flatMap(spec => createModularHouse(assets, spec)) ]; }
export function houseDoorDef(assets = {}) { return modularHouseDoorDef(assets, DEFAULT_HOUSE_SPEC); }
export function allHouseDoorDefs(assets = {}) { return [DEFAULT_HOUSE_SPEC, ...DISTRICT_SPECS].map(spec => modularHouseDoorDef(assets, spec)); }
export function houseRoadStart() { return modularHouseRoadStart(DEFAULT_HOUSE_SPEC); }
export function houseAnchors() { return modularHouseAnchors(DEFAULT_HOUSE_SPEC); }
export function houseDistrictHooks() { return DISTRICT_SPECS.map(spec => ({ spec, anchors: modularHouseAnchors(spec) })); }
export function houseAllAnchors() { return { main: houseAnchors(), district: houseDistrictHooks().map(h => h.anchors) }; }
export function manualShape(id, material, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
