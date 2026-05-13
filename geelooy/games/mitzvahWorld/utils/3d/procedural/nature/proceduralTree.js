
// B"H

/**
 * @file proceduralTree.js
 * @description
 * Procedural tree with shaped leaves.
 *
 * Replaces ugly square foliage planes with leaf-shaped clusters.
 */

import { resolveThreeNamespace } from "../infrastructure/ThreeNamespaceResolver.js";
import { createTreeTrunk, createTreeFoliage } from "./TreeParts.js";

/**
 * B"H
 * Procedural tree.
 */
export default class ProceduralTree {
  /**
   * B"H
   * @param {Object} options
   * Tree options.
   * @param {Object} olam
   * World.
   */
  constructor(options = {}, olam = null) {
    this.options = options;
    this.olam = olam;
    this.name = options.name || options.id || "procedural-tree";
    this.mesh = null;
  }

  /**
   * B"H
   * Builds the tree.
   *
   * @returns {Promise<any>}
   * Tree group.
   */
  async heescheel() {
    const THREE = resolveThreeNamespace(null);
    const group = new THREE.Group();

    group.name = this.name;

    group.add(createTreeTrunk(THREE, {
      ...this.options,
      name: this.name
    }));

    group.add(createTreeFoliage(THREE, {
      ...this.options,
      name: this.name
    }));

    const position = this.options.position || this.position;

    if (position) {
      group.position.set(position.x || 0, position.y || 0, position.z || 0);
    }

    this.mesh = group;

    if (this.olam?.scene && group.parent !== this.olam.scene) {
      this.olam.scene.add(group);
    }

    return group;
  }
}
