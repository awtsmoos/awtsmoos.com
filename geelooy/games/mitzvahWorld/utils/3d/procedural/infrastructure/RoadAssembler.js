
/**
 * B"H
 * @file RoadAssembler.js
 * @description
 * Procedural road assembler.
 *
 * Fix:
 * accepts anything as first arg and resolves real THREE internally.
 */

import { normalizeRoadOptions } from "./RoadDefaults.js";
import { createRoadMaterials } from "./RoadMaterials.js";
import { createCurbs } from "./RoadCurbs.js";
import { createLaneMarks } from "./RoadLaneMarks.js";
import { createRoadSurface } from "./RoadSurface.js";
import { applyRoadGroupTransform } from "./RoadGroupTransform.js";
import { getRoadThree } from "./ThreeNamespaceGuard.js";

/**
 * B"H
 * Assembles procedural road groups.
 */
export default class RoadAssembler {
  /**
   * B"H
   * @param {any} threeOrContext
   * THREE namespace or context object.
   *
   * @param {Object} options
   * Road options.
   */
  constructor(threeOrContext, options = {}) {
    this.THREE = getRoadThree(threeOrContext);
    this.options = normalizeRoadOptions(options);
    this.materials = createRoadMaterials(this.THREE);
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
   * @param {any} threeOrContext
   * THREE namespace or context object.
   *
   * @param {Object} options
   * Road options.
   *
   * @returns {any}
   * THREE.Group.
   */
  static build(threeOrContext, options = {}) {
    return new RoadAssembler(threeOrContext, options).build();
  }
}

/**
 * B"H
 * Named compatibility export.
 *
 * @param {any} threeOrContext
 * THREE namespace or context object.
 *
 * @param {Object} options
 * Road options.
 *
 * @returns {any}
 * THREE.Group.
 */
export function assembleRoad(threeOrContext, options = {}) {
  return RoadAssembler.build(threeOrContext, options);
}
