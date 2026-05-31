// B"H
/**
 * @file cottageRecipe.js
 * @description
 * Chapter 107: the house receives a stone rhythm, a deeper wooden doorway,
 * thick roof tiles, chimney, warm windows, sill boxes, and a climbing vine. The
 * Awtsmoos makes the cottage more like the picture without making it heavy.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add, light } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

const STONES = [C.stone, 0xd1c4a5, 0xa99c85, 0xe0d3b1];

function wallStones(group) {
  for (let row = 0; row < 5; row += 1) {
    for (let i = 0; i < 8; i += 1) {
      const x = -2.45 + i * 0.7 + (row % 2 ? 0.18 : 0);
      if (Math.abs(x) < 0.62 && row < 3) continue;
      add(group, "cube", STONES[(i + row) % STONES.length], [x, 0.55 + row * 0.42, 2.16], [0.62, 0.08, 0.08]);
    }
  }
}

function roofHalf(group, side) {
  const angle = side > 0 ? -0.52 : 0.52;
  const cx = side * 0.72;
  add(group, "cube", C.roofDark, [cx, 3.02, 0], [3.45, 0.22, 4.82], [0, 0, angle]);
  for (let i = 0; i < 11; i += 1) {
    const z = -2.25 + i * 0.45;
    add(group, "cube", i % 2 ? C.roof : C.roofDark, [cx, 3.1, z], [3.52, 0.08, 0.14], [0, 0, angle]);
  }
}

function window(group, x, y, z) {
  add(group, "cube", C.wood, [x, y, z + 0.01], [0.92, 0.74, 0.09]);
  add(group, "cube", C.warm, [x, y, z + 0.04], [0.62, 0.48, 0.08], [0, 0, 0], { emissive: C.warm, emissiveIntensity: 0.28 });
  add(group, "cube", C.wood, [x, y - 0.43, z + 0.08], [1.05, 0.12, 0.14]);
  add(group, "cube", C.leafVine, [x, y - 0.54, z + 0.09], [0.82, 0.12, 0.12]);
  light(group, C.warm, [x, y, z + 0.4], 0.28, 4);
}

function door(group) {
  add(group, "cube", C.darkWood, [0, 1.0, 2.17], [1.28, 1.92, 0.16]);
  add(group, "cube", C.wood, [0, 0.95, 2.23], [1.03, 1.62, 0.12]);
  add(group, "cube", 0xd8c49a, [0, 0.05, 2.28], [1.7, 0.18, 0.48]);
}

export function gableHouse() {
  const group = new THREE.Group();
  add(group, "cube", C.stone, [0, 1.34, 0], [5.6, 2.68, 4.15]);
  wallStones(group);
  roofHalf(group, -1);
  roofHalf(group, 1);
  add(group, "cube", C.roofDark, [0, 3.53, 0], [0.25, 0.18, 5.0]);
  add(group, "cube", C.darkWood, [1.55, 4.0, -0.55], [0.45, 1.0, 0.45]);
  door(group);
  window(group, -1.85, 1.55, 2.15);
  window(group, 1.85, 1.55, 2.15);
  add(group, "cube", C.leafVine, [-2.58, 1.72, 2.23], [0.14, 1.45, 0.08]);
  add(group, "cube", C.leafVine, [-2.18, 2.18, 2.24], [0.78, 0.13, 0.08], [0, 0, 0.5]);
  return group;
}
