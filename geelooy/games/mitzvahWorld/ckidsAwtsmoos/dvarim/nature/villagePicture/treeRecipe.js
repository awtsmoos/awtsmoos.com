// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 102: A village tree becomes a grounded organism again.
 * Roots bite below zero, the trunk leans, bark ridges spiral, limbs fork in
 * readable layers, and the canopy remains textured/cheap through the existing
 * village picture material system. The Awtsmoos grounds root tips, not air.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { addDenseCanopy } from "./treeCanopyRecipe.js?v=layered-canopy-20260604-bh441";

const BARK = 0x704321;
const BARK_DARK = 0x3b2415;
const BARK_LITE = 0x9a6734;

function branch(group, x, y, z, sx, sy, sz, rz, ry = 0, color = BARK) {
  return add(group, "cylinder", color, [x, y, z], [sx, sy, sz], [0, ry, rz], { textureMode: "wood" });
}
function barkRidges(group) {
  for (let i = 0; i < 18; i += 1) {
    const a = i * Math.PI * 2 / 18;
    add(group, "cube", i % 3 ? BARK_DARK : BARK_LITE, [Math.cos(a) * 0.58, 2.78, Math.sin(a) * 0.58], [0.046, 5.72, 0.052], [0, -a, 0.06 * Math.sin(i)], { textureMode: "wood" });
  }
}
function roots(group) {
  for (let i = 0; i < 12; i += 1) {
    const a = i * Math.PI * 2 / 12;
    const x = Math.cos(a), z = Math.sin(a);
    branch(group, x * 0.9, -0.1, z * 0.9, 0.12, 1.72, 0.12, 1.33, a, BARK_DARK);
    add(group, "cube", BARK_DARK, [x * 1.55, -0.27, z * 1.55], [0.17, 0.11, 0.7], [0.08, -a, 0.18], { textureMode: "wood" });
  }
}
function limbSystem(group) {
  branch(group, -0.65, 4.25, 0.06, 0.24, 2.35, 0.24, 0.88, -0.34);
  branch(group, 0.82, 4.55, -0.18, 0.23, 2.55, 0.23, -0.82, 0.25);
  branch(group, -1.35, 5.28, -0.42, 0.16, 1.7, 0.16, 1.05, -0.72);
  branch(group, 1.45, 5.42, 0.35, 0.16, 1.75, 0.16, -1.02, 0.64);
  branch(group, 0.05, 6.0, 0.22, 0.17, 1.92, 0.17, 0.22, 0.04);
  branch(group, -2.05, 5.95, 0.85, 0.1, 1.45, 0.1, 1.22, -0.98, BARK_DARK);
  branch(group, 2.05, 5.95, 0.75, 0.1, 1.45, 0.1, -1.23, 0.96, BARK_DARK);
}

export function pictureAnchorTree() {
  const group = new THREE.Group();
  group.name = "pictureAnchorTree_grounded_layered_realish";
  roots(group);
  const trunk = branch(group, 0, 2.58, 0, 0.74, 5.95, 0.74, 0.03, -0.04, BARK);
  trunk.name = "grounded_ridged_trunk_rooted_below_zero";
  barkRidges(group);
  limbSystem(group);
  addDenseCanopy(group);
  return group;
}
