// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 198: The inside becomes furnished, textured, and named.
 *
 * The Awtsmoos does not accept vague furniture. This cottage declares the rug,
 * table candle, wall lantern, potted plant, bookshelf, bed, chest, stool, and
 * side cabinet as real visible vessels. Every visible cube passes through the
 * texture helper so no plain solid-colored surface sneaks back into the house.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add, light } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

const STONE = [C.stone, 0xd9c9a6, 0xb4a486, 0xe9d9b8];
const DOOR_HALF = 0.19;
const DOOR_TOP = 0.77;
const FRONT_Z = 2.32;
const tex = textureMode => ({ textureMode });
const cube = (g, color, p, s, r = [0, 0, 0], mode = "stone", extra = {}) => add(g, "cube", color, p, s, r, { ...tex(mode), ...extra });

function course(g, x1, x2, z, front = false) {
  for (let row = 0; row < 13; row += 1) for (let x = x1; x <= x2; x += 0.45) {
    const y = 0.17 + row * 0.18;
    const xx = x + (row % 2 ? 0.14 : 0);
    if (front && Math.abs(xx) < DOOR_HALF + 0.08 && y < DOOR_TOP) continue;
    cube(g, STONE[(row + Math.floor((xx + 4) * 5)) & 3], [xx, y, z], [0.39, 0.035, 0.07]);
  }
}

function walls(g) {
  cube(g, C.stone, [0, 1.42, -2.24], [6.8, 2.84, 0.18]);
  cube(g, C.stone, [-3.32, 1.42, 0], [0.18, 2.84, 4.62]);
  cube(g, C.stone, [3.32, 1.42, 0], [0.18, 2.84, 4.62]);
  cube(g, C.stone, [-1.93, 1.42, FRONT_Z], [2.78, 2.84, 0.18]);
  cube(g, C.stone, [1.93, 1.42, FRONT_Z], [2.78, 2.84, 0.18]);
  cube(g, C.stone, [0, 1.82, FRONT_Z], [0.84, 2.04, 0.18]);
  course(g, -3.05, 3.05, 2.45, true);
  course(g, -3.05, 3.05, -2.45, false);
}

function roofSide(g, side) {
  const angle = side > 0 ? -0.36 : 0.36;
  const cx = side * 0.86;
  cube(g, C.roofDark, [cx, 3.02, 0], [4.82, 0.28, 5.88], [0, 0, angle], "roof");
  for (let i = 0; i < 15; i += 1) cube(g, i % 2 ? C.roof : C.roofDark, [cx, 3.18, -3.03 + i * 0.43], [4.88, 0.065, 0.13], [0, 0, angle], "roof");
  cube(g, C.roofDark, [side * 2.58, 2.73, 0], [0.18, 0.22, 6.05], [0, 0, angle], "roof");
}

function framedWindow(g, x, z = 2.52) {
  cube(g, C.wood, [x, 1.42, z], [0.82, 0.58, 0.1], [0, 0, 0], "wood");
  cube(g, C.warm, [x, 1.42, z + 0.055], [0.52, 0.34, 0.07], [0, 0, 0], "cloth", { emissive: C.warm, emissiveIntensity: 0.5 });
  cube(g, C.wood, [x, 1.42, z + 0.1], [0.08, 0.48, 0.075], [0, 0, 0], "wood");
  cube(g, C.wood, [x, 1.42, z + 0.11], [0.52, 0.08, 0.075], [0, 0, 0], "wood");
  cube(g, C.wood, [x, 1.08, z + 0.08], [0.95, 0.1, 0.14], [0, 0, 0], "wood");
  light(g, C.warm, [x, 1.42, z + 0.46], 0.52, 5.4);
}

function doorway(g) {
  cube(g, C.wood, [-0.27, 0.38, 2.64], [0.08, 0.76, 0.16], [0, 0, 0], "wood");
  cube(g, C.wood, [0.27, 0.38, 2.64], [0.08, 0.76, 0.16], [0, 0, 0], "wood");
  cube(g, C.wood, [0, 0.8, 2.64], [0.62, 0.1, 0.16], [0, 0, 0], "wood");
  cube(g, 0xd8c49a, [0, 0.05, 2.78], [0.82, 0.1, 0.42], [0, 0, 0], "stone");
}

function tableAndLight(g) {
  cube(g, 0x80502a, [0.35, 0.34, -0.55], [0.72, 0.09, 0.48], [0, 0.05, 0], "wood");
  for (const x of [0.08, 0.62]) for (const z of [-0.78, -0.32]) cube(g, 0x5b351d, [x, 0.16, z], [0.06, 0.3, 0.06], [0, 0, 0], "wood");
  cube(g, 0xf0c96a, [0.18, 0.42, -0.43], [0.18, 0.04, 0.12], [0, 0.2, 0], "cloth");
  cube(g, 0x6b3b1b, [0.51, 0.455, -0.61], [0.07, 0.07, 0.07], [0, 0, 0], "wood");
  cube(g, 0xffdd88, [0.51, 0.53, -0.61], [0.045, 0.12, 0.045], [0, 0, 0], "cloth", { emissive: 0xffc45c, emissiveIntensity: 0.65 });
  light(g, 0xffd98a, [0.51, 0.72, -0.61], 0.72, 5.4);
}

function storageAndPlant(g) {
  cube(g, 0x4b2b17, [-2.55, 0.66, 0.2], [0.28, 1.08, 0.62], [0, 0, 0], "wood");
  for (let i = 0; i < 4; i += 1) cube(g, [0x6d3b2a, 0x2c67aa, 0xaa362c, 0xd6a536][i], [-2.38, 0.35 + i * 0.18, 0.2], [0.055, 0.13, 0.44], [0, 0, 0], "cloth");
  cube(g, 0x70451f, [-1.25, 0.42, -1.35], [0.55, 0.6, 0.34], [0, 0.1, 0], "wood");
  cube(g, 0xaa6a32, [-1.25, 0.78, -1.35], [0.18, 0.16, 0.18], [0, 0, 0], "stone");
  cube(g, 0x2d8a48, [-1.25, 0.94, -1.35], [0.06, 0.32, 0.06], [0, 0, 0], "cloth");
  for (const r of [-0.6, 0, 0.6]) cube(g, 0x2f9b4f, [-1.25, 1.08, -1.35], [0.07, 0.28, 0.04], [0, r, 0.7], "cloth");
}

function bedChestStool(g) {
  cube(g, 0x70451f, [2.15, 0.24, 0.7], [0.72, 0.2, 0.5], [0, 0, 0], "wood");
  cube(g, 0xf0e3b0, [2.15, 0.41, 0.7], [0.6, 0.1, 0.4], [0, 0, 0], "cloth");
  cube(g, 0xffffff, [2.38, 0.51, 0.58], [0.2, 0.06, 0.26], [0, 0, 0], "cloth");
  cube(g, 0x6b3b1b, [1.25, 0.25, 1.1], [0.45, 0.32, 0.28], [0, 0.2, 0], "wood");
  cube(g, 0x6a3c1c, [-0.55, 0.16, -0.46], [0.22, 0.22, 0.22], [0, 0.15, 0], "wood");
}

function rugAndLantern(g) {
  cube(g, 0x8c2c24, [-0.55, 0.095, 0.48], [1.65, 0.025, 1.02], [0, 0.08, 0], "cloth");
  cube(g, 0xd8a33e, [-0.55, 0.112, 0.48], [1.3, 0.015, 0.72], [0, 0.08, 0], "cloth");
  cube(g, 0x4a2a16, [0.85, 1.65, -1.9], [0.08, 0.22, 0.08], [0, 0, 0], "wood");
  cube(g, 0xffd98a, [0.85, 1.43, -1.9], [0.13, 0.18, 0.13], [0, 0, 0], "cloth", { emissive: 0xffd98a, emissiveIntensity: 0.8 });
  light(g, 0xffd98a, [0.85, 1.5, -1.9], 0.9, 7.2);
}

function interior(g) {
  cube(g, 0xb89b64, [0, 0.04, -0.1], [6.2, 0.08, 4.12], [0, 0, 0], "floor");
  rugAndLantern(g); tableAndLight(g); storageAndPlant(g); bedChestStool(g);
}

function outsideDetails(g) {
  cube(g, C.darkWood, [1.75, 3.82, -0.65], [0.48, 0.78, 0.48], [0, 0, 0], "wood");
  cube(g, C.leafVine, [-3.18, 1.62, 2.62], [0.14, 1.28, 0.08], [0, 0, 0], "cloth");
  cube(g, C.leafVine, [-2.72, 2.05, 2.64], [0.8, 0.13, 0.08], [0, 0, 0.5], "cloth");
  cube(g, 0x8a552b, [2.75, 0.28, -2.74], [0.42, 0.42, 0.42], [0, 0.3, 0], "wood");
  cube(g, 0xb66a32, [3.05, 0.34, -2.78], [0.22, 0.46, 0.22], [0, 0, 0], "stone");
}

export function gableHouse() {
  const group = new THREE.Group();
  interior(group); walls(group); doorway(group); framedWindow(group, -2.25); framedWindow(group, 2.25);
  roofSide(group, -1); roofSide(group, 1);
  cube(group, C.roofDark, [0, 3.42, 0], [0.28, 0.2, 5.95], [0, 0, 0], "roof");
  outsideDetails(group);
  return group;
}
