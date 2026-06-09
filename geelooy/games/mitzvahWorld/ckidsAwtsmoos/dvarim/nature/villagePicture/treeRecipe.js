// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 170: Roots grip the entry village like fingers around a covenant.
 * The trunk now has flare, bark bands, readable branches, fruit, shade, and a
 * crown deep enough to anchor the first village without spiky nonsense.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { addDenseCanopy } from "./treeCanopyRecipe.js?v=orchard-canopy-20260607-bh169";
const BARK = 0x74502d, DARK = 0x432817, ROOT = 0x5e381f, MOSS = 0x356d30;
function cylinder(group, name, color, p, s, r = [0, 0, 0]) { const mesh = add(group, "cylinder", color, p, s, r, { textureMode: "wood" }); mesh.name = name; return mesh; }
function cube(group, name, color, p, s, r = [0, 0, 0], mode = "wood") { const mesh = add(group, "cube", color, p, s, r, { textureMode: mode }); mesh.name = name; return mesh; }
function roots(group) {
  for (let i = 0; i < 10; i += 1) {
    const a = i * Math.PI * 2 / 10;
    cube(group, `root_knuckle_${i}`, i % 2 ? ROOT : DARK, [Math.cos(a) * 0.72, -0.06, Math.sin(a) * 0.72], [0.18, 0.17, 1.02], [0.05, -a, 0.04]);
  }
}
function barkBands(group) {
  for (let i = 0; i < 11; i += 1) cube(group, `bark_living_band_${i}`, i % 2 ? DARK : 0x8a6135, [0, 0.72 + i * 0.43, 0.48], [0.74, 0.04, 0.055], [0, i * 0.57, 0]);
  for (let i = 0; i < 5; i += 1) cube(group, `moss_green_patch_${i}`, MOSS, [Math.sin(i) * 0.35, 0.42 + i * 0.72, 0.51], [0.24, 0.09, 0.035], [0, i * 0.8, 0], "leaf");
}
function branches(group) {
  [[-0.78, 4.0, 0.05, 0.18, 1.85, 0.18, 0, -0.47, 0.92], [0.88, 4.22, -0.03, 0.17, 1.9, 0.17, 0, 0.41, -0.86], [0.05, 4.75, -0.82, 0.14, 1.62, 0.14, 0.86, 0, 0.1], [-0.05, 4.88, 0.86, 0.14, 1.55, 0.14, -0.86, 0, -0.08], [0.48, 5.18, 0.38, 0.11, 1.2, 0.11, -0.35, 0.3, -0.68]].forEach((b, i) => cylinder(group, `readable_branch_${i}`, DARK, b.slice(0, 3), b.slice(3, 6), b.slice(6, 9)));
}
export function pictureAnchorTree() {
  const group = new THREE.Group();
  group.name = "pictureAnchorTree_orchard_grounded_entry_village";
  roots(group);
  cylinder(group, "flared_grounded_trunk", BARK, [0, 2.42, 0], [0.62, 5.18, 0.62], [0.02, 0, 0.02]);
  cylinder(group, "inner_dark_trunk_shadow", DARK, [0.08, 2.8, -0.06], [0.34, 4.5, 0.34], [0.03, 0.1, 0]);
  barkBands(group);
  branches(group);
  addDenseCanopy(group);
  return group;
}
