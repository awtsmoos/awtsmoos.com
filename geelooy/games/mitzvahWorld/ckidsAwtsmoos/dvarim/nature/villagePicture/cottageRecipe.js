// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 215: The mouth of the house closes everywhere except the door.
 *
 * The Awtsmoos makes the cottage from measured spans: side front walls overlap
 * the stone jambs, the upper wall touches the wood lintel, and the only open
 * space is the actual human doorway. The floor is lowered to match the current
 * octree floor so the chossid does not walk on a secret shelf above the boards.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add, light } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

const STONE = [C.stone, 0xd9c9a6, 0xb4a486, 0xe9d9b8, 0xa8926f];
const FRONT_Z = 2.32;
const DOOR_HALF = 0.22;
const DOOR_TOP = 0.82;
const tex = textureMode => ({ textureMode });
const cube = (g, color, p, s, r = [0, 0, 0], mode = "stone", extra = {}) => add(g, "cube", color, p, s, r, { ...tex(mode), ...extra });

function stoneCourse(g, x1, x2, z, front = false) {
  for (let row = 0; row < 15; row += 1) for (let x = x1; x <= x2; x += 0.42) {
    const y = 0.14 + row * 0.17;
    const xx = x + (row % 2 ? 0.13 : 0);
    if (front && Math.abs(xx) < DOOR_HALF + 0.06 && y < DOOR_TOP) continue;
    cube(g, STONE[(row + Math.floor((xx + 5) * 7)) % STONE.length], [xx, y, z], [0.36, 0.04, 0.075]);
  }
}

function wallShell(g) {
  cube(g, C.stone, [0, 1.42, -2.24], [6.8, 2.84, 0.18]);
  cube(g, C.stone, [-3.32, 1.42, 0], [0.18, 2.84, 4.62]);
  cube(g, C.stone, [3.32, 1.42, 0], [0.18, 2.84, 4.62]);
  cube(g, C.stone, [-1.94, 1.42, FRONT_Z], [2.76, 2.84, 0.18]);
  cube(g, C.stone, [1.94, 1.42, FRONT_Z], [2.76, 2.84, 0.18]);
  cube(g, C.stone, [0, 1.88, FRONT_Z], [0.92, 1.92, 0.18]);
  stoneCourse(g, -3.1, 3.1, 2.45, true);
  stoneCourse(g, -3.1, 3.1, -2.45, false);
}

function entranceStonework(g) {
  for (const x of [-0.46, 0.46]) for (let i = 0; i < 5; i += 1) cube(g, STONE[(i + (x > 0 ? 2 : 0)) % STONE.length], [x, 0.17 + i * 0.17, 2.58], [0.22, 0.11, 0.18]);
  cube(g, 0x9f835d, [0, 0.025, 2.78], [0.96, 0.05, 0.54], [0, 0, 0], "floor");
  cube(g, 0xd8c49a, [0, 0.07, 2.52], [1.04, 0.04, 0.22], [0, 0, 0], "stone");
  cube(g, C.wood, [-0.31, 0.43, 2.65], [0.08, 0.82, 0.18], [0, 0, 0], "wood");
  cube(g, C.wood, [0.31, 0.43, 2.65], [0.08, 0.82, 0.18], [0, 0, 0], "wood");
  cube(g, C.wood, [0, 0.87, 2.65], [0.72, 0.1, 0.18], [0, 0, 0], "wood");
}

function roofSide(g, side) {
  const angle = side > 0 ? -0.36 : 0.36;
  const cx = side * 0.86;
  cube(g, C.roofDark, [cx, 3.02, 0], [4.82, 0.28, 5.88], [0, 0, angle], "roof");
  for (let i = 0; i < 15; i += 1) cube(g, i % 2 ? C.roof : C.roofDark, [cx, 3.19, -3.03 + i * 0.43], [4.9, 0.07, 0.14], [0, 0, angle], "roof");
  cube(g, C.roofDark, [side * 2.58, 2.73, 0], [0.18, 0.22, 6.05], [0, 0, angle], "roof");
}

function framedWindow(g, x, z = 2.52) {
  cube(g, C.wood, [x, 1.42, z], [0.86, 0.6, 0.12], [0, 0, 0], "wood");
  cube(g, C.warm, [x, 1.42, z + 0.065], [0.54, 0.36, 0.075], [0, 0, 0], "cloth", { emissive: C.warm, emissiveIntensity: 0.42 });
  cube(g, C.wood, [x, 1.42, z + 0.12], [0.08, 0.5, 0.08], [0, 0, 0], "wood");
  cube(g, C.wood, [x, 1.42, z + 0.13], [0.54, 0.08, 0.08], [0, 0, 0], "wood");
  cube(g, C.wood, [x, 1.08, z + 0.1], [0.98, 0.1, 0.16], [0, 0, 0], "wood");
  light(g, C.warm, [x, 1.42, z + 0.46], 0.42, 4.8);
}

function tableAndLight(g) {
  cube(g, 0x80502a, [0.35, 0.34, -0.55], [0.72, 0.09, 0.48], [0, 0.05, 0], "wood");
  for (const x of [0.08, 0.62]) for (const z of [-0.78, -0.32]) cube(g, 0x5b351d, [x, 0.16, z], [0.06, 0.3, 0.06], [0, 0, 0], "wood");
  cube(g, 0xffdd88, [0.51, 0.53, -0.61], [0.045, 0.12, 0.045], [0, 0, 0], "cloth", { emissive: 0xffc45c, emissiveIntensity: 0.55 });
  light(g, 0xffd98a, [0.51, 0.72, -0.61], 0.55, 4.8);
}

function storageAndPlant(g) {
  cube(g, 0x4b2b17, [-2.55, 0.66, 0.2], [0.28, 1.08, 0.62], [0, 0, 0], "wood");
  for (let i = 0; i < 4; i += 1) cube(g, [0x6d3b2a, 0x2c67aa, 0xaa362c, 0xd6a536][i], [-2.38, 0.35 + i * 0.18, 0.2], [0.055, 0.13, 0.44], [0, 0, 0], "cloth");
  cube(g, 0x70451f, [-1.25, 0.42, -1.35], [0.55, 0.6, 0.34], [0, 0.1, 0], "wood");
  cube(g, 0xaa6a32, [-1.25, 0.78, -1.35], [0.18, 0.16, 0.18]);
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
  cube(g, 0xffd98a, [0.85, 1.43, -1.9], [0.13, 0.18, 0.13], [0, 0, 0], "cloth", { emissive: 0xffd98a, emissiveIntensity: 0.65 });
  light(g, 0xffd98a, [0.85, 1.5, -1.9], 0.72, 6.2);
}

function interior(g) {
  cube(g, 0xb89b64, [0, 0.02, -0.1], [6.25, 0.04, 4.15], [0, 0, 0], "floor");
  rugAndLantern(g); tableAndLight(g); storageAndPlant(g); bedChestStool(g);
}

function outsideDetails(g) {
  cube(g, C.darkWood, [1.75, 3.82, -0.65], [0.48, 0.78, 0.48], [0, 0, 0], "wood");
  cube(g, C.leafVine, [-3.18, 1.62, 2.62], [0.14, 1.28, 0.08], [0, 0, 0], "cloth");
  cube(g, C.leafVine, [-2.72, 2.05, 2.64], [0.8, 0.13, 0.08], [0, 0, 0.5], "cloth");
  cube(g, 0x8a552b, [2.75, 0.28, -2.74], [0.42, 0.42, 0.42], [0, 0.3, 0], "wood");
  cube(g, 0xb66a32, [3.05, 0.34, -2.78], [0.22, 0.46, 0.22]);
}

export function gableHouse() {
  const group = new THREE.Group();
  interior(group); wallShell(group); entranceStonework(group); framedWindow(group, -2.25); framedWindow(group, 2.25);
  roofSide(group, -1); roofSide(group, 1);
  cube(group, C.roofDark, [0, 3.42, 0], [0.28, 0.2, 5.95], [0, 0, 0], "roof");
  outsideDetails(group);
  return group;
}
