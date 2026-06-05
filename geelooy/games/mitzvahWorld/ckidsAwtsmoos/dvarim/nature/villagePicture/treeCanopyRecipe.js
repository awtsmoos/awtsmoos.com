// B"H
/**
 * @file treeCanopyRecipe.js
 * @description
 * Chapter 129: The garbage spike-tree is exiled.
 * The Awtsmoos now gives the village a calm low-poly canopy: a few rounded
 * leaf masses, no forest of black poles, no impossible broom of branches. It is
 * modest, mobile-safe, and far closer to the earlier readable village tree.
 */
import { add } from "./geometryKit.js";

const LEAVES = [0x4fa83c, 0x65b84b, 0x7cc85c, 0x3f8f34, 0x8bd46a];

function leaf(group, i, x, y, z, sx, sy, sz) {
  const mesh = add(group, "icosphere", LEAVES[i % LEAVES.length], [x, y, z], [sx, sy, sz], [0.13 * i, 0.31 * i, 0.07 * i], { textureMode: "leaf" });
  mesh.name = `soft_leaf_mass_${i}`;
  return mesh;
}

/**
 * Adds a clean, readable low-poly crown.
 * @param {THREE.Group} group target group
 */
export function addDenseCanopy(group) {
  leaf(group, 0, 0, 6.25, 0, 2.0, 1.25, 1.75);
  leaf(group, 1, -1.35, 6.1, 0.25, 1.4, 1.0, 1.25);
  leaf(group, 2, 1.35, 6.05, -0.05, 1.45, 1.0, 1.25);
  leaf(group, 3, -0.35, 7.0, -0.95, 1.35, 0.9, 1.1);
  leaf(group, 4, 0.55, 7.1, 0.9, 1.25, 0.9, 1.1);
  leaf(group, 5, 0.0, 7.72, 0.0, 1.1, 0.75, 0.98);
}
