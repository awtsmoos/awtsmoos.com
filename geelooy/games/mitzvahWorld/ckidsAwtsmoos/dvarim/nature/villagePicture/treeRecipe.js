// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 130: The village tree becomes sane again.
 * A rooted trunk, a few readable branches, and a soft crown. No spiky explosion,
 * no black broom, no levitating timber. The Awtsmoos returns the tree to a
 * child-readable shape that can still be improved later with real assets.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { addDenseCanopy } from "./treeCanopyRecipe.js?v=soft-readable-canopy-20260604-bh445";

const BARK = 0x76512d;
const DARK = 0x4b2f1c;
const ROOT = 0x5f3b22;

function cylinder(group, name, color, p, s, r = [0, 0, 0]) {
  const mesh = add(group, "cylinder", color, p, s, r, { textureMode: "wood" });
  mesh.name = name;
  return mesh;
}
function cube(group, name, color, p, s, r = [0, 0, 0]) {
  const mesh = add(group, "cube", color, p, s, r, { textureMode: "wood" });
  mesh.name = name;
  return mesh;
}
function roots(group) {
  for (let i = 0; i < 6; i += 1) {
    const a = i * Math.PI * 2 / 6;
    cube(group, `root_foot_${i}`, ROOT, [Math.cos(a) * 0.78, -0.08, Math.sin(a) * 0.78], [0.18, 0.16, 0.9], [0.08, -a, 0.08]);
  }
}
function branches(group) {
  cylinder(group, "left_low_branch", DARK, [-0.72, 4.05, 0.06], [0.18, 1.7, 0.18], [0, -0.42, 0.9]);
  cylinder(group, "right_low_branch", DARK, [0.8, 4.25, -0.02], [0.17, 1.75, 0.17], [0, 0.36, -0.84]);
  cylinder(group, "back_mid_branch", DARK, [0.08, 4.72, -0.72], [0.14, 1.55, 0.14], [0.82, 0.0, 0.12]);
  cylinder(group, "front_mid_branch", DARK, [-0.08, 4.82, 0.78], [0.14, 1.45, 0.14], [-0.82, 0.0, -0.08]);
}
function barkBands(group) {
  for (let i = 0; i < 8; i += 1) {
    cube(group, `bark_soft_band_${i}`, i % 2 ? DARK : 0x8b6235, [0, 0.9 + i * 0.54, 0.47], [0.72, 0.045, 0.06], [0, i * 0.5, 0]);
  }
}

export function pictureAnchorTree() {
  const group = new THREE.Group();
  group.name = "pictureAnchorTree_soft_grounded_readable";
  roots(group);
  cylinder(group, "single_grounded_trunk", BARK, [0, 2.45, 0], [0.55, 5.15, 0.55], [0.02, 0, 0.02]);
  barkBands(group);
  branches(group);
  addDenseCanopy(group);
  return group;
}
