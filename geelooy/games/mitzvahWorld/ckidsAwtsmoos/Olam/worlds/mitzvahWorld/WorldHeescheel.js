// B"H
/** @file WorldHeescheel.js @description Direct builder imports the fresh full postbuild runtime. */
import { NIVRAYIM_DEFS } from "./NivrayimDefs.js";
import { DESERT_TEST_WORLD_SETTINGS } from "./data/nefashos/DesertTestWorld.js";
import { NivrahFactory } from "./NivrahFactory.js";
import { runMitzvahWorldPostBuild } from "./postbuild/MitzvahWorldPostBuild.js?v=instanced-roads-20260621-bh1";
export class WorldHeescheel {
  constructor(context = {}) { this.context = context; this.scene = context.scene; this.physics = context.physics || null; this.postMsg = context.postMsg || null; this.olam = context.olam || context; }
  async execute() { if (this.scene && this.scene.userData) this.scene.userData.mitzvahWorldSettings = DESERT_TEST_WORLD_SETTINGS; const factory = new NivrahFactory(this.scene, this.physics, this.olam); const nivrayim = await factory.buildAll(NIVRAYIM_DEFS); await runMitzvahWorldPostBuild({ olam:this.olam, scene:this.scene, nivrayim }); return nivrayim; }
}
