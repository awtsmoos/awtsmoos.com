// B"H
/**
 * @file landscapeRecipes.js
 * @description
 * Chapter 102: the path, terrace, stones, flowers, well, steps, and fence are
 * small worldly syllables. The Awtsmoos keeps them modular and finite so no
 * parent matrix ever turns to poison again.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

export function cobbleRoad() {
  const group = new THREE.Group();
  for (let i = 0; i < 34; i += 1) {
    const t = i / 33;
    const z = -15 + t * 29;
    const curve = Math.sin(t * Math.PI * 1.15) * 2.4;
    const x = curve + Math.sin(i * 2.1) * 0.24;
    add(group, "cube", i % 2 ? 0xb8a783 : 0xd0c19d, [x, -0.07, z], [0.7 + (i % 3) * 0.14, 0.045, 0.52], [0, curve * 0.04 + i * 0.17, 0]);
  }
  return group;
}

export function terrace() {
  const group = new THREE.Group();
  add(group, "cube", C.stone, [0, 0.2, 0], [18, 0.4, 7.5]);
  add(group, "cube", C.stoneDark, [0, -0.08, 4.05], [18.5, 0.45, 0.55]);
  return group;
}

export function steps() {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i += 1) add(group, "cube", C.stone, [0, i * 0.13, i * 0.48], [4.4 - i * 0.28, 0.16, 0.46]);
  return group;
}

export function bench() {
  const group = new THREE.Group();
  add(group, "cube", C.wood, [0, 0.55, 0], [2.55, 0.16, 0.48]);
  add(group, "cube", C.wood, [0, 0.98, -0.32], [2.55, 0.16, 0.16], [0.35, 0, 0]);
  [-1, 1].forEach(x => { add(group, "cube", C.darkWood, [x, 0.25, 0.2], [0.16, 0.5, 0.16]); add(group, "cube", C.darkWood, [x, 0.25, -0.2], [0.16, 0.5, 0.16]); });
  return group;
}

export function fence(options = {}) {
  const group = new THREE.Group();
  const count = Math.max(1, Math.floor(Number(options.count || 8)));
  for (let i = 0; i < count; i += 1) add(group, "cube", C.wood, [i * 1.05, 0.51, 0], [0.15, 1.02, 0.15]);
  add(group, "cube", C.wood, [(count - 1) * 0.525, 0.72, 0], [count * 1.05, 0.13, 0.13]);
  return group;
}

export function well() {
  const group = new THREE.Group();
  add(group, "cylinder", C.stone, [0, 0.55, 0], [1.22, 0.62, 1.22]);
  add(group, "cylinder", C.darkWood, [0, 1.22, 0], [1.42, 0.1, 1.42]);
  return group;
}

export function flowerPatch() {
  const group = new THREE.Group();
  for (let i = 0; i < 18; i += 1) add(group, "cube", i % 2 ? C.yellowFlower : C.pinkFlower, [Math.sin(i) * 1.25, 0.03, Math.cos(i * 1.7) * 0.86], [0.07, 0.07, 0.07]);
  return group;
}

export function rock(options = {}) {
  const group = new THREE.Group();
  add(group, "icosphere", C.rock, [0, 0.14, 0], [options.sx || 0.6, options.sy || 0.25, options.sz || 0.45]);
  return group;
}
