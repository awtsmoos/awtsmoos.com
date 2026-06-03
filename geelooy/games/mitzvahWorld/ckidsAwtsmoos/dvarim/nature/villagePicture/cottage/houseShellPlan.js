// B"H
/**
 * @file houseShellPlan.js
 * @description
 * Chapter 217: The map of stones before the stones awaken.
 *
 * These data structures are the blueprint for visible masonry only. The doorway
 * is a carved absence, the holy no-collider air where the player walks. Do not
 * add these spans to the octree; their physics twin lives in VillageHouseCollider.
 */
import { PICTURE_COLORS as C } from "../palette.js";

const DOOR = { xMin: -0.34, xMax: 0.34, yMin: 0.04, yMax: 0.94 };

export const HOUSE_METRICS = Object.freeze({
  frontZ: 2.36,
  backZ: -2.36,
  halfW: 3.38,
  halfD: 2.36,
  doorHalf: 0.34,
  doorTop: 0.94,
  floorTop: 0.04
});

export const HOUSE_BRICK_STRUCTURE = Object.freeze({
  panels: [
    { position: [0, 1.42, -2.34], scale: [6.8, 2.84, 0.18] },
    { position: [-3.34, 1.42, 0], scale: [0.18, 2.84, 4.72] },
    { position: [3.34, 1.42, 0], scale: [0.18, 2.84, 4.72] },
    { position: [-1.88, 1.42, 2.34], scale: [2.92, 2.84, 0.18] },
    { position: [1.88, 1.42, 2.34], scale: [2.92, 2.84, 0.18] },
    { position: [0, 1.91, 2.34], scale: [0.68, 1.86, 0.18] }
  ],
  spans: [
    { xMin: -3.22, xMax: 3.22, yMin: 0.1, yMax: 2.78, z: -2.48, depth: 0.14 },
    { xMin: -3.22, xMax: 3.22, yMin: 0.1, yMax: 2.78, z: 2.5, depth: 0.14, opening: DOOR },
    { xMin: -3.46, xMax: -3.24, yMin: 0.08, yMax: 2.76, z: -1.8, depth: 0.12, brickW: 0.18 },
    { xMin: 3.24, xMax: 3.46, yMin: 0.08, yMax: 2.76, z: -1.8, depth: 0.12, brickW: 0.18 }
  ]
});

export const ENTRANCE_TRIM = Object.freeze([
  { name: "left_stout_jamb", color: C.darkWood, p: [-0.43, 0.5, 2.63], s: [0.16, 0.98, 0.22], mode: "wood" },
  { name: "right_stout_jamb", color: C.darkWood, p: [0.43, 0.5, 2.63], s: [0.16, 0.98, 0.22], mode: "wood" },
  { name: "clean_top_lintel", color: C.darkWood, p: [0, 1.0, 2.63], s: [1.02, 0.16, 0.22], mode: "wood" },
  { name: "inner_shadow_sill", color: 0x4b341c, p: [0, 0.48, 2.525], s: [0.62, 0.84, 0.035], mode: "wood" },
  { name: "flat_entry_stone_no_collider", color: 0xd8c49a, p: [0, 0.06, 2.67], s: [1.14, 0.04, 0.34], mode: "stone" }
]);

export const OUTSIDE_DETAIL_BLOCKS = Object.freeze([
  { color: C.darkWood, p: [1.75, 3.82, -0.65], s: [0.48, 0.78, 0.48], mode: "wood" },
  { color: C.leafVine, p: [-3.18, 1.62, 2.62], s: [0.14, 1.28, 0.08], mode: "cloth" },
  { color: C.leafVine, p: [-2.72, 2.05, 2.64], s: [0.8, 0.13, 0.08], mode: "cloth" },
  { color: 0x8a552b, p: [2.75, 0.28, -2.74], s: [0.42, 0.42, 0.42], mode: "wood" },
  { color: 0xb66a32, p: [3.05, 0.34, -2.78], s: [0.22, 0.46, 0.22], mode: "stone" }
]);
