// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 146: A large house with human-sized contents.
 *
 * The house shell remains grand, but the doorway, bed, table, shelves, and NPC
 * room furniture are authored small in local units before the house scale is
 * applied. Every piece asks `geometryKit` for textured material; no dead solid
 * colors return to this cottage. The doorway is intentionally narrow enough to
 * feel like a door while still letting the player walk in.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add, light } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

const STONES = [C.stone, 0xd1c4a5, 0xa99c85, 0xe0d3b1];
const DOOR_HALF = 0.32;
const DOOR_TOP = 1.24;
const tex = textureMode => ({ textureMode });

function stoneFace(group, x1, x2, z, skipDoor = false) {
  for (let row = 0; row < 9; row += 1) {
    const y = 0.23 + row * 0.25;
    for (let x = x1; x <= x2; x += 0.52) {
      const xx = x + (row % 2 ? 0.13 : 0);
      if (skipDoor && Math.abs(xx) < DOOR_HALF + 0.08 && y < DOOR_TOP) continue;
      add(group, "cube", STONES[(Math.floor(x * 5) + row) & 3], [xx, y, z], [0.47, 0.05, 0.08], [0, 0, 0], tex("stone"));
    }
  }
}

function shell(group) {
  add(group, "cube", C.stone, [0, 1.32, -2.24], [6.8, 2.64, 0.18], [0, 0, 0], tex("stone"));
  add(group, "cube", C.stone, [-3.32, 1.32, 0], [0.18, 2.64, 4.62], [0, 0, 0], tex("stone"));
  add(group, "cube", C.stone, [3.32, 1.32, 0], [0.18, 2.64, 4.62], [0, 0, 0], tex("stone"));
  add(group, "cube", C.stone, [-1.84, 1.32, 2.32], [2.94, 2.64, 0.18], [0, 0, 0], tex("stone"));
  add(group, "cube", C.stone, [1.84, 1.32, 2.32], [2.94, 2.64, 0.18], [0, 0, 0], tex("stone"));
  add(group, "cube", C.stone, [0, 1.9, 2.32], [0.95, 1.48, 0.18], [0, 0, 0], tex("stone"));
  stoneFace(group, -3.0, 3.0, 2.45, true);
}

function smallTable(group) {
  add(group, "cube", 0x7b4a23, [0, 0.34, -0.45], [0.52, 0.08, 0.38], [0, 0, 0], tex("wood"));
  for (const x of [-0.2, 0.2]) for (const z of [-0.58, -0.32]) add(group, "cube", 0x5b351d, [x, 0.17, z], [0.055, 0.3, 0.055], [0, 0, 0], tex("wood"));
  add(group, "cube", 0xf4e6b5, [0.02, 0.42, -0.43], [0.18, 0.04, 0.12], [0, 0.2, 0], tex("cloth"));
}

function smallShelf(group) {
  add(group, "cube", 0x4b2b17, [-2.55, 0.62, 0.2], [0.28, 1.0, 0.58], [0, 0, 0], tex("wood"));
  for (let i = 0; i < 4; i += 1) add(group, "cube", [0x6d3b2a, 0x2c67aa, 0xaa362c, 0xd6a536][i], [-2.38, 0.35 + i * 0.17, 0.2], [0.055, 0.13, 0.42], [0, 0, 0], tex("cloth"));
}

function smallBed(group) {
  add(group, "cube", 0x70451f, [2.15, 0.25, 0.65], [0.62, 0.2, 0.42], [0, 0, 0], tex("wood"));
  add(group, "cube", 0xf0e3b0, [2.15, 0.43, 0.65], [0.52, 0.1, 0.34], [0, 0, 0], tex("cloth"));
  add(group, "cube", 0xffffff, [2.35, 0.52, 0.55], [0.18, 0.06, 0.24], [0, 0, 0], tex("cloth"));
}

function interior(group) {
  add(group, "cube", 0xb89b64, [0, 0.04, -0.1], [6.2, 0.08, 4.12], [0, 0, 0], tex("floor"));
  add(group, "cube", 0x9c7d52, [0, 1.12, -2.15], [6.1, 2.24, 0.1], [0, 0, 0], tex("stone"));
  add(group, "cube", 0xbe9b5a, [0, 2.42, -0.2], [5.8, 0.11, 3.7], [0, 0, 0], tex("wood"));
  smallTable(group);
  smallShelf(group);
  smallBed(group);
  light(group, 0xffd98a, [0, 1.9, -1.05], 1.15, 8.5);
}

function roofHalf(group, side) {
  const angle = side > 0 ? -0.34 : 0.34;
  const cx = side * 0.8;
  add(group, "cube", C.roofDark, [cx, 2.92, 0], [4.48, 0.28, 5.62], [0, 0, angle], tex("roof"));
  for (let i = 0; i < 13; i += 1) add(group, "cube", i % 2 ? C.roof : C.roofDark, [cx, 3.05, -2.85 + i * 0.47], [4.52, 0.08, 0.16], [0, 0, angle], tex("roof"));
}

function window(group, x, y, z) {
  add(group, "cube", C.wood, [x, y, z + 0.01], [0.9, 0.66, 0.09], [0, 0, 0], tex("wood"));
  add(group, "cube", C.warm, [x, y, z + 0.04], [0.58, 0.42, 0.08], [0, 0, 0], { ...tex("cloth"), emissive: C.warm, emissiveIntensity: 1.0 });
  add(group, "cube", C.wood, [x, y - 0.39, z + 0.08], [1.0, 0.12, 0.14], [0, 0, 0], tex("wood"));
  light(group, C.warm, [x, y, z + 0.45], 1.25, 8.5);
}

function doorway(group) {
  add(group, "cube", C.wood, [-0.42, 0.64, 2.62], [0.13, 1.28, 0.2], [0, 0, 0], tex("wood"));
  add(group, "cube", C.wood, [0.42, 0.64, 2.62], [0.13, 1.28, 0.2], [0, 0, 0], tex("wood"));
  add(group, "cube", C.wood, [0, 1.26, 2.62], [0.96, 0.14, 0.2], [0, 0, 0], tex("wood"));
  add(group, "cube", 0xd8c49a, [0, 0.05, 2.76], [1.18, 0.1, 0.48], [0, 0, 0], tex("stone"));
}

export function gableHouse() {
  const group = new THREE.Group();
  interior(group);
  shell(group);
  doorway(group);
  window(group, -2.25, 1.45, 2.52);
  window(group, 2.25, 1.45, 2.52);
  roofHalf(group, -1);
  roofHalf(group, 1);
  add(group, "cube", C.roofDark, [0, 3.34, 0], [0.28, 0.2, 5.9], [0, 0, 0], tex("roof"));
  add(group, "cube", C.darkWood, [1.75, 3.75, -0.65], [0.48, 0.78, 0.48], [0, 0, 0], tex("wood"));
  add(group, "cube", C.leafVine, [-3.18, 1.62, 2.62], [0.14, 1.28, 0.08], [0, 0, 0], tex("cloth"));
  add(group, "cube", C.leafVine, [-2.72, 2.05, 2.64], [0.8, 0.13, 0.08], [0, 0, 0.5], tex("cloth"));
  return group;
}
