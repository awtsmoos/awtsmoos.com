// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 106: the anchor tree becomes a living landmark. The Awtsmoos lifts a
 * ribbed trunk, exposed roots, spreading limbs, and a dense rounded canopy made
 * of cheap clustered forms. It reads closer to the picture without asking the
 * octree to swallow a forest.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { addDenseCanopy } from "./treeCanopyRecipe.js";

const BARK = 0x704321;
const BARK_DARK = 0x3b2415;

function branch(group, x, y, z, sx, sy, sz, rz, ry = 0) {
  add(group, "cylinder", BARK, [x, y, z], [sx, sy, sz], [0, ry, rz]);
}

function barkRidges(group) {
  for (let i = 0; i < 14; i += 1) {
    const a = i * Math.PI * 2 / 14;
    add(group, "cube", BARK_DARK, [Math.cos(a) * 0.58, 3.0, Math.sin(a) * 0.58], [0.055, 5.7, 0.055], [0, -a, 0.08 * Math.sin(i)]);
  }
}

function roots(group) {
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI * 2 / 8;
    add(group, "cylinder", BARK_DARK, [Math.cos(a) * 1.05, 0.18, Math.sin(a) * 1.05], [0.16, 1.55, 0.16], [1.2, a, 0.9]);
  }
}

function limbSystem(group) {
  branch(group, -0.7, 4.6, 0.1, 0.24, 2.25, 0.24, 0.9, -0.35);
  branch(group, 0.85, 4.9, -0.15, 0.23, 2.55, 0.23, -0.85, 0.25);
  branch(group, -1.35, 5.75, -0.45, 0.16, 1.65, 0.16, 1.08, -0.7);
  branch(group, 1.5, 5.85, 0.35, 0.16, 1.7, 0.16, -1.0, 0.65);
  branch(group, 0.15, 6.35, 0.25, 0.17, 1.9, 0.17, 0.25, 0.05);
  branch(group, -2.0, 6.2, 0.85, 0.11, 1.35, 0.11, 1.25, -0.95);
  branch(group, 2.0, 6.25, 0.75, 0.11, 1.35, 0.11, -1.25, 0.95);
}

export function pictureAnchorTree() {
  const group = new THREE.Group();
  roots(group);
  add(group, "cylinder", BARK, [0, 2.85, 0], [0.74, 5.7, 0.74]);
  barkRidges(group);
  limbSystem(group);
  addDenseCanopy(group);
  return group;
}
