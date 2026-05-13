
/**
 * B"H
 * @file RoadAssembler.js
 * @description
 * Static compatibility RoadAssembler.
 *
 * This exact file path exists because the browser requested:
 * /games/mitzvahWorld/utils/3d/procedural/infrastructure/RoadAssembler.js
 *
 * On a static server, the fix is not server-side.
 * The fix is to create the exact static file the module graph is requesting.
 */

import { normalizeRoadOptions } from "./RoadDefaults.js";
import { createRoadMaterials } from "./RoadMaterials.js";
import { createRoadSegmentGeometry } from "./RoadSegmentGeometry.js";
import { createCurbs } from "./RoadCurbs.js";
import { createLaneMarks } from "./RoadLaneMarks.js";

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
    if (!THREE) {
      throw new Error("RoadAssembler requires THREE namespace");
    }

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

    const road = new THREE.Mesh(
      createRoadSegmentGeometry(THREE, options),
      this.materials.asphalt
    );

    road.name = `${options.name}-surface`;
    road.position.set(0, options.depth / 2, 0);

    group.add(road);

    for (const curb of createCurbs(THREE, options, this.materials.curb)) {
      group.add(curb);
    }

    for (const mark of createLaneMarks(THREE, options, this.materials.lane)) {
      group.add(mark);
    }

    group.position.set(
      options.position.x,
      options.position.y,
      options.position.z
    );

    group.rotation.set(
      options.rotation.x,
      options.rotation.y,
      options.rotation.z
    );

    return group;
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
