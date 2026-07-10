// B"H
import { createModularHouse, modularHouseDoorDef, modularHouseRoadStart, DEFAULT_HOUSE_SPEC } from './ModularHouseSystem.js';

/** House3D: facade kept stable while the generator now guarantees all measured walls. */
export function createHouseDefs(assets = {}) { return createModularHouse(assets, DEFAULT_HOUSE_SPEC); }
export function houseDoorDef(assets = {}) { return modularHouseDoorDef(assets, DEFAULT_HOUSE_SPEC); }
export function houseRoadStart() { return modularHouseRoadStart(DEFAULT_HOUSE_SPEC); }
export function manualShape(id, material, position, vertices, faces, { yaw = 0, walkable = false, solid = true } = {}) { return { id, shape: 'manual', solid, walkable, ...material, position, vertices, faces, rotation: { y: yaw }, yaw }; }
