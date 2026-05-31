// B"H
/**
 * @file fieldRecipes.js
 * @description
 * Chapter 104: the empty green carpet receives little witnesses. Grass clumps,
 * flower knots, and low stones are scattered in deliberate clusters, like the
 * picture, but remain only visual breath and never collision weight.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";

const GRASS_A = 0x317f2f;
const GRASS_B = 0x5d9a37;
const FLOWER_Y = 0xffd84d;
const FLOWER_P = 0xcf6dff;

function blade(group, x, z, h, color, lean) {
  add(group, "cube", color, [x, h / 2, z], [0.045, h, 0.035], [lean, 0, lean * 0.4]);
}

function tuft(group, cx, cz, scale = 1) {
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI * 2 / 8;
    blade(group, cx + Math.cos(a) * 0.12 * scale, cz + Math.sin(a) * 0.12 * scale, (0.28 + (i % 3) * 0.07) * scale, i % 2 ? GRASS_A : GRASS_B, (i - 4) * 0.04);
  }
}

export function meadowDetail(options = {}) {
  const group = new THREE.Group();
  const clusters = options.clusters || [[-7, 8], [-3, 6], [5, -1], [8, -6], [-15, 7], [12, 2]];
  clusters.forEach(([x, z], c) => {
    for (let i = 0; i < 7; i += 1) tuft(group, x + Math.sin(i * 1.7 + c) * 1.2, z + Math.cos(i * 1.3 + c) * 0.9, 0.8 + (i % 3) * 0.18);
    for (let j = 0; j < 5; j += 1) add(group, "cube", j % 2 ? FLOWER_Y : FLOWER_P, [x + Math.sin(j * 2.1) * 1.0, 0.2, z + Math.cos(j * 1.8) * 0.8], [0.08, 0.08, 0.08]);
  });
  return group;
}
