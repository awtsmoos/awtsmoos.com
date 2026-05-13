
/**
 * B"H
 * @file RoadAssembler.js
 * @description
 * Procedural road assembler.
 *
 * Fixed:
 * - no direct MeshStandardMaterial assumption
 * - validates only required THREE constructors
 * - split into smaller builders
 */

import { normalizeRoadOptions } from "./RoadDefaults.js";
import { createRoadMaterials } from "./RoadMaterials.js";
import { createCurbs } from "./RoadCurbs.js";
import { createLaneMarks } from "./RoadLaneMarks.js";
import { createRoadSurface } from "./RoadSurface.js";
import { applyRoadGroupTransform } from "./RoadGroupTransform.js";
import { assertRoadThree } from "./ThreeNamespaceGuard.js";

/**
 * B"H
 * Assembles procedural road groups.
 */
export default class RoadAssembler {
  /**
   * B"H
   * @param {any} THREE
   * THREE namespace.
   *
   * @param {Object} options
   * Road options.
   */
  constructor(THREE, options = {}) {
    assertRoadThree(THREE);

    this.THREE = THREE;
    this.options = normalizeRoadOptions(options);
    this.materials = createRoadMaterials(THREE);
  }

  /**
   * B"H
   * Creates the road group.
   *
   * @returns {any}
   * THREE.Group.
   */
  build() {
    const THREE = this.THREE;
    const options = this.options;

    const group = new THREE.Group();
    group.name = options.name;

    group.add(createRoadSurface(THREE, options, this.materials.asphalt));

    for (const curb of createCurbs(THREE, options, this.materials.curb)) {
      group.add(curb);
    }

    for (const mark of createLaneMarks(THREE, options, this.materials.lane)) {
      group.add(mark);
    }

    return applyRoadGroupTransform(group, options);
  }

  /**
   * B"H
   * Compatibility factory.
   *
   * @param {any} THREE
   * THREE namespace.
   *
   * @param {Object} options
   * Road options.
   *
   * @returns {any}
   * THREE.Group.
   */
  static build(THREE, options = {}) {
    return new RoadAssembler(THREE, options).build();
  }
}

/**
 * B"H
 * Named compatibility export.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object} options
 * Road options.
 *
 * @returns {any}
 * THREE.Group.
 */
export function assembleRoad(THREE, options = {}) {
  return RoadAssembler.build(THREE, options);
}
