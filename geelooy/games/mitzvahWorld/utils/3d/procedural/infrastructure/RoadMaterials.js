
/**
 * B"H
 * @file RoadMaterials.js
 * @description
 * Data-driven road material helpers with constructor-safe fallback.
 */

import {
  getUsableMeshMaterial,
  makeSafeMaterialOptions
} from "./ThreeMaterialAdapter.js";

/**
 * B"H
 * Default material data.
 */
export const ROAD_MATERIAL_DATA = Object.freeze({
  asphalt: Object.freeze({
    color: 0x303136,
    roughness: 0.95,
    metalness: 0.02
  }),

  curb: Object.freeze({
    color: 0xb9b9b9,
    roughness: 0.82,
    metalness: 0.01
  }),

  lane: Object.freeze({
    color: 0xf8f2bd,
    roughness: 0.7,
    metalness: 0
  })
});

/**
 * B"H
 * Builds a material from data.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} data
 * Material data.
 *
 * @returns {any}
 * THREE material.
 */
export function makeRoadMaterial(THREE, data) {
  const MaterialCtor = getUsableMeshMaterial(THREE);
  return new MaterialCtor(makeSafeMaterialOptions(MaterialCtor, data));
}

/**
 * B"H
 * Builds all road materials.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @returns {{asphalt:any,curb:any,lane:any}}
 * Road materials.
 */
export function createRoadMaterials(THREE) {
  return {
    asphalt: makeRoadMaterial(THREE, ROAD_MATERIAL_DATA.asphalt),
    curb: makeRoadMaterial(THREE, ROAD_MATERIAL_DATA.curb),
    lane: makeRoadMaterial(THREE, ROAD_MATERIAL_DATA.lane)
  };
}
