// B"H
/** @file WorldHeescheel.js @description Builds Mitzvah World and pulls the hosted terrain factory. */
import { NIVRAYIM_DEFS } from "./NivrayimDefs.js?compact=true&v=budgeted-village-20260707-bh1";
import { DESERT_TEST_WORLD_SETTINGS } from "./data/nefashos/DesertTestWorld.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { NivrahFactory } from "./NivrahFactory.js?compact=true&v=hosted-ground-textures-20260708-bh1";
import { runMitzvahWorldPostBuild } from "./postbuild/MitzvahWorldPostBuild.js?compact=true&v=vehicles-u-mount-20260706-bh1";

/** B"H world builder facade used by the Olam loading lifecycle. */
export class WorldHeescheel {
  constructor(context = {}) {
    this.context = context;
    this.scene = context.scene;
    this.physics = context.physics || null;
    this.postMsg = context.postMsg || null;
    this.olam = context.olam || context;
  }

  /** @returns {Promise<Array>} Built nivrayim. */
  async execute() {
    if (this.scene?.userData) this.scene.userData.mitzvahWorldSettings = DESERT_TEST_WORLD_SETTINGS;
    const factory = new NivrahFactory(this.scene, this.physics, this.olam);
    const nivrayim = await factory.buildAll(NIVRAYIM_DEFS);
    await runMitzvahWorldPostBuild({ olam:this.olam, scene:this.scene, nivrayim });
    return nivrayim;
  }
}
