// B"H
/**
 * @file pathRecipe.js
 * @description
 * Chapter 105: the path becomes earth first, stone second. The Awtsmoos lays a
 * soft dirt ribbon under scattered cobbles so the road reads like a lived-in
 * village path instead of floating white tiles.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";

const DIRT = 0x9b6b3c;
const DIRT_DARK = 0x6e4a2e;
const STONE_A = 0xb8a783;
const STONE_B = 0xd0c19d;

export function pictureDirtPath() {
  const group = new THREE.Group();
  for (let i = 0; i < 26; i += 1) {
    const t = i / 25;
    const z = -15.5 + t * 30.5;
    const curve = Math.sin(t * Math.PI * 1.1) * 2.55;
    add(group, "cube", i % 2 ? DIRT : DIRT_DARK, [curve, -0.095, z], [3.2 - Math.abs(t - 0.5) * 0.7, 0.035, 1.0], [0, curve * 0.03, 0]);
  }
  for (let i = 0; i < 46; i += 1) {
    const t = i / 45;
    const z = -15 + t * 29;
    const curve = Math.sin(t * Math.PI * 1.15) * 2.4;
    const x = curve + Math.sin(i * 2.1) * 0.68;
    if (i % 3 !== 0) add(group, "cube", i % 2 ? STONE_A : STONE_B, [x, -0.055, z], [0.48 + (i % 4) * 0.09, 0.04, 0.38], [0, curve * 0.04 + i * 0.17, 0]);
  }
  return group;
}
