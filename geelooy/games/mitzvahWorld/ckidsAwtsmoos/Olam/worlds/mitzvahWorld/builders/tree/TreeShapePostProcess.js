
/**
 * B"H
 * @file TreeShapePostProcess.js
 * @description
 * Tree appearance post-processing for Mitzvah World.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { upgradeTreeFoliage } from "/games/mitzvahWorld/utils/3d/procedural/nature/TreeFoliageUpgrade.js";

/**
 * B"H
 * Applies better foliage to a tree object.
 *
 * @param {any} tree
 * Tree group or mesh.
 *
 * @param {Object} options
 * Foliage options.
 *
 * @returns {any}
 * Same tree.
 */
export function applyTreeShapePostProcess(tree, options = {}) {
  try {
    return upgradeTreeFoliage(THREE, tree, options);
  } catch (error) {
    console.error(
      `B"H | TREE_FOLIAGE_UPGRADE_ERROR | message=${error?.message || String(error)}`
    );
    return tree;
  }
}
