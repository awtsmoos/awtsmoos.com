/**
 * B"H
 * @file WorldHeescheel.js
 * @description
 * Mitzvah World builder.
 */

import { NIVRAYIM_DEFS } from "./NivrayimDefs.js";
import { DESERT_TEST_WORLD_SETTINGS } from "./data/nefashos/DesertTestWorld.js";
import { NivrahFactory } from "./NivrahFactory.js";
import { runMitzvahWorldPostBuild } from "./postbuild/MitzvahWorldPostBuild.js";

/**
 * B"H
 * Builds Mitzvah World.
 */
export class WorldHeescheel {
  /**
   * B"H
   * @param {Object} context
   * Build context.
   */
  constructor(context = {}) {
    this.context = context;
    this.scene = context.scene;
    this.physics = context.physics || null;
    this.postMsg = context.postMsg || null;
    this.olam = context.olam || context;
  }

  /**
   * B"H
   * Executes world building.
   *
   * @returns {Promise<Object[]>}
   * Built objects.
   */
  async execute() {
    if (this.scene?.userData) {
      this.scene.userData.mitzvahWorldSettings = DESERT_TEST_WORLD_SETTINGS;
    }

    if (this.scene?.userData) {
      this.scene.userData.mitzvahWorldSettings = DESERT_TEST_WORLD_SETTINGS;
    }

    const factory = new NivrahFactory(
      this.scene,
      this.physics,
      this.olam
    );

    const nivrayim = await factory.buildAll(NIVRAYIM_DEFS);

    await runMitzvahWorldPostBuild({
      olam: this.olam,
      scene: this.scene,
      nivrayim
    });

    return nivrayim;
  }
}
