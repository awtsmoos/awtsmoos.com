// B"H
/**
 * @file roofAndExterior.js
 * @description
 * Chapter 219: The roof leans over the brick letters like a dark crown.
 * The Awtsmoos crowns the cottage with roof, window glow, vines, and pots. All
 * of it is decorative sight. The invisible touch remains in simple colliders.
 */
import { add, light } from "../geometryKit.js";
import { PICTURE_COLORS as C } from "../palette.js";
import { ENTRANCE_TRIM, OUTSIDE_DETAIL_BLOCKS } from "./houseShellPlan.js";

const cube = (g, color, p, s, r = [0, 0, 0], mode = "stone", extra = {}) => add(g, "cube", color, p, s, r, { textureMode: mode, ...extra });

function roofSide(group, side) {
  const angle = side > 0 ? -0.36 : 0.36;
  const cx = side * 0.86;
  cube(group, C.roofDark, [cx, 3.02, 0], [4.82, 0.28, 5.88], [0, 0, angle], "roof");
  for (let i = 0; i < 15; i += 1) cube(group, i % 2 ? C.roof : C.roofDark, [cx, 3.19, -3.03 + i * 0.43], [4.9, 0.07, 0.14], [0, 0, angle], "roof");
  cube(group, C.roofDark, [side * 2.58, 2.73, 0], [0.18, 0.22, 6.05], [0, 0, angle], "roof");
}

function framedWindow(group, x, z = 2.55) {
  cube(group, C.wood, [x, 1.42, z], [0.86, 0.6, 0.12], [0, 0, 0], "wood");
  cube(group, C.warm, [x, 1.42, z + 0.065], [0.54, 0.36, 0.075], [0, 0, 0], "cloth", { emissive: C.warm, emissiveIntensity: 0.42 });
  cube(group, C.wood, [x, 1.42, z + 0.12], [0.08, 0.5, 0.08], [0, 0, 0], "wood");
  cube(group, C.wood, [x, 1.42, z + 0.13], [0.54, 0.08, 0.08], [0, 0, 0], "wood");
  cube(group, C.wood, [x, 1.08, z + 0.1], [0.98, 0.1, 0.16], [0, 0, 0], "wood");
  light(group, C.warm, [x, 1.42, z + 0.46], 0.42, 4.8);
}

/** @param {THREE.Group} group cottage group. */
export function buildDoorTrim(group) {
  for (const block of ENTRANCE_TRIM) {
    const mesh = cube(group, block.color, block.p, block.s, [0, 0, 0], block.mode);
    mesh.name = block.name;
  }
}

/** @param {THREE.Group} group cottage group. */
export function buildWindowsRoofAndExterior(group) {
  framedWindow(group, -2.25);
  framedWindow(group, 2.25);
  roofSide(group, -1);
  roofSide(group, 1);
  cube(group, C.roofDark, [0, 3.42, 0], [0.28, 0.2, 5.95], [0, 0, 0], "roof");
  for (const block of OUTSIDE_DETAIL_BLOCKS) cube(group, block.color, block.p, block.s, [0, 0, 0], block.mode);
}
