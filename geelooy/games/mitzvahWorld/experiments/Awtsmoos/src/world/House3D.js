// B"H
import { createModularHouse, modularHouseAnchors, modularHouseDoorDef, modularHouseRoadStart, DEFAULT_HOUSE_SPEC, createFutureHouseSpecs } from './ModularHouseSystem.js';

/** House3D: stable facade plus hooks for roads, rooms, stairs, and future districts. */
export function createHouseDefs(assets = {}) { return createModularHouse(assets, DEFAULT_HOUSE_SPEC); }
export function houseDoorDef(assets = {}) { return modularHouseDoorDef(assets, DEFAULT_HOUSE_SPEC); }
export function houseRoadStart() { return modularHouseRoadStart(DEFAULT_HOUSE_SPEC); }
export function houseAnchors() { return modularHouseAnchors(DEFAULT_HOUSE_SPEC); }
export function houseDistrictHooks() { return createFutureHouseSpecs(DEFAULT_HOUSE_SPEC); }
export function manualShape(id, material, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
