// B"H
/**
 * @file landscapeRecipes.js
 * @description
 * Chapter 225: The village edges awaken.
 * Fences gain rails and posts, flowers become fast instanced vegetation, and
 * stones scatter as instanced rocks. These recipes are decorative only; real
 * fence collision is a separate simple collider after grounding.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";
import { instancedFlowerField } from "./vegetation/flowerField.js";
import { instancedRockField } from "./vegetation/rockField.js";

const cube = (g, c, p, s, r = [0, 0, 0], mode = "wood") => add(g, "cube", c, p, s, r, { textureMode: mode });

export function cobbleRoad() {
  const group = new THREE.Group();
  for (let i = 0; i < 34; i += 1) {
    const t = i / 33, z = -15 + t * 29, curve = Math.sin(t * Math.PI * 1.15) * 2.4;
    cube(group, i % 2 ? 0xb8a783 : 0xd0c19d, [curve + Math.sin(i * 2.1) * 0.24, -0.07, z], [0.7 + (i % 3) * 0.14, 0.045, 0.52], [0, curve * 0.04 + i * 0.17, 0], "stone");
  }
  return group;
}

export function terrace() {
  const group = new THREE.Group();
  cube(group, C.stone, [0, 0.2, 0], [18, 0.4, 7.5], [0, 0, 0], "stone");
  cube(group, C.stoneDark, [0, -0.08, 4.05], [18.5, 0.45, 0.55], [0, 0, 0], "stone");
  return group;
}

export function steps() {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i += 1) cube(group, C.stone, [0, i * 0.13, i * 0.48], [4.4 - i * 0.28, 0.16, 0.46], [0, 0, 0], "stone");
  return group;
}

export function bench() {
  const group = new THREE.Group();
  cube(group, C.wood, [0, 0.55, 0], [2.55, 0.16, 0.48]);
  cube(group, C.wood, [0, 0.98, -0.32], [2.55, 0.16, 0.16], [0.35, 0, 0]);
  [-1, 1].forEach(x => { cube(group, C.darkWood, [x, 0.25, 0.2], [0.16, 0.5, 0.16]); cube(group, C.darkWood, [x, 0.25, -0.2], [0.16, 0.5, 0.16]); });
  return group;
}

export function fence(options = {}) {
  const group = new THREE.Group();
  const count = Math.max(2, Math.floor(Number(options.count || 10)));
  for (let i = 0; i < count; i += 1) {
    const x = i * 0.92, tall = i % 4 === 0 ? 1.28 : 1.08;
    cube(group, C.darkWood, [x, tall / 2, 0], [0.16, tall, 0.18]);
    cube(group, C.wood, [x, tall + 0.08, 0], [0.22, 0.16, 0.22], [0, 0, Math.PI / 4]);
  }
  const mid = (count - 1) * 0.46, len = count * 0.92;
  cube(group, C.wood, [mid, 0.78, 0], [len, 0.13, 0.13]);
  cube(group, C.wood, [mid, 0.45, 0], [len, 0.11, 0.12]);
  Object.assign(group.userData ||= {}, { fenceVisualOnly: true, suggestedCollider: { length: len, height: 1.1, depth: 0.45 } });
  return group;
}

export function well() {
  const group = new THREE.Group();
  add(group, "cylinder", C.stone, [0, 0.55, 0], [1.22, 0.62, 1.22], [0, 0, 0], { textureMode: "stone" });
  add(group, "cylinder", C.darkWood, [0, 1.22, 0], [1.42, 0.1, 1.42], [0, 0, 0], { textureMode: "wood" });
  return group;
}

export function flowerPatch(options = {}) { return instancedFlowerField(options); }
export function rock(options = {}) { return instancedRockField({ count: options.count || 10, radius: options.radius || 1.2, seed: options.seed || 3 }); }
export function rockField(options = {}) { return instancedRockField(options); }
