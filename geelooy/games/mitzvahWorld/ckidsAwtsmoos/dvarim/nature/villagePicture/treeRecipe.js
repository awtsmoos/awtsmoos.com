// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 257: The roots remembered the soil.
 *
 * The Awtsmoos lowers the tree's visible body below local zero so the existing
 * grounding pass pins root tips to earth, not empty air. Bark ridges, roots,
 * limbs, and veined canopy are decorative only, but they now read grounded.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { addDenseCanopy } from "./treeCanopyRecipe.js";

const BARK = 0x704321;
const BARK_DARK = 0x3b2415;

function branch(group, x, y, z, sx, sy, sz, rz, ry = 0) {
  add(group, "cylinder", BARK, [x, y, z], [sx, sy, sz], [0, ry, rz], { textureMode: "wood" });
}

function barkRidges(group) {
  for (let i = 0; i < 14; i += 1) {
    const a = i * Math.PI * 2 / 14;
    add(group, "cube", BARK_DARK, [Math.cos(a) * 0.58, 2.72, Math.sin(a) * 0.58], [0.055, 5.85, 0.055], [0, -a, 0.08 * Math.sin(i)], { textureMode: "wood" });
  }
}

function roots(group) {
  for (let i = 0; i < 10; i += 1) {
    const a = i * Math.PI * 2 / 10;
    const x = Math.cos(a) * 0.94, z = Math.sin(a) * 0.94;
    add(group, "cylinder", BARK_DARK, [x, -0.08, z], [0.14, 1.62, 0.14], [1.34, a, 0.86], { textureMode: "wood" });
    add(group, "cube", BARK_DARK, [x * 1.48, -0.24, z * 1.48], [0.18, 0.12, 0.62], [0.1, -a, 0.22], { textureMode: "wood" });
  }
}

function limbSystem(group) {
  branch(group, -0.7, 4.35, 0.1, 0.24, 2.25, 0.24, 0.9, -0.35);
  branch(group, 0.85, 4.65, -0.15, 0.23, 2.55, 0.23, -0.85, 0.25);
  branch(group, -1.35, 5.5, -0.45, 0.16, 1.65, 0.16, 1.08, -0.7);
  branch(group, 1.5, 5.6, 0.35, 0.16, 1.7, 0.16, -1.0, 0.65);
  branch(group, 0.15, 6.1, 0.25, 0.17, 1.9, 0.17, 0.25, 0.05);
  branch(group, -2.0, 5.95, 0.85, 0.11, 1.35, 0.11, 1.25, -0.95);
  branch(group, 2.0, 6.0, 0.75, 0.11, 1.35, 0.11, -1.25, 0.95);
}

export function pictureAnchorTree() {
  const group = new THREE.Group();
  group.name = "pictureAnchorTree_grounded_veined";
  roots(group);
  add(group, "cylinder", BARK, [0, 2.58, 0], [0.72, 5.95, 0.72], [0, 0, 0], { textureMode: "wood" }).name = "trunk_rooted_below_zero";
  barkRidges(group);
  limbSystem(group);
  addDenseCanopy(group);
  return group;
}
