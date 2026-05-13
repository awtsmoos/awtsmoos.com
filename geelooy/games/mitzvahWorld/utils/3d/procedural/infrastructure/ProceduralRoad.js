
// B"H

/**
 * @file ProceduralRoad.js
 * @description
 * Procedural road nivra.
 *
 * Fix:
 * RoadAssembler receives a real THREE namespace internally, not this object.
 */

import RoadAssembler from "./RoadAssembler.js";
import { getRoadOptionsFromNivra } from "./ProceduralRoadInput.js";

/**
 * B"H
 * Procedural road.
 */
export default class ProceduralRoad {
  /**
   * B"H
   * @param {Object} options
   * Road options.
   * @param {Object} olam
   * World.
   */
  constructor(options = {}, olam = null) {
    this.options = options;
    this.olam = olam;
    this.name = options.name || options.id || "procedural-road";
    this.mesh = null;
  }

  /**
   * B"H
   * Builds the road mesh and adds it to the world when possible.
   *
   * @returns {Promise<any>}
   * Road group.
   */
  async heescheel() {
    const group = RoadAssembler.build(null, getRoadOptionsFromNivra(this));
    this.mesh = group;

    if (this.olam?.scene && group.parent !== this.olam.scene) {
      this.olam.scene.add(group);
    }

    return group;
  }
}
