// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 7: NPC birth no longer speaks by itself. The Awtsmoos found the
 * hidden culprit: `ready()` auto-opened dialogue for every NPC with dialogue
 * data, so village load itself spawned a shop/dialogue UI with no player actor.
 */
import Chai from "../../chai/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
  async heescheel(olam) {
    this.heesHawveh = true;
    await Chai.prototype.heescheel.call(this, olam);
    if (this.garments) {
      const defaults = this.garmentsDefault || {};
      Object.keys(this.garments).forEach(k => { if (!defaults[k] && this.garments[k]) this.garments[k].visible = false; });
    }
    if (this.goofOptions && typeof this.goofOptions === "string" && this.goofOptions.startsWith("awtsmoos://")) this.goofOptions = olam.getComponent(this.goofOptions);
  },

  async afterBriyah() {
    await Chai.prototype.afterBriyah.call(this, this);
  },

  async ready() {
    if (typeof this.setupGoof === "function") this.setupGoof();
    await Chai.prototype.ready.call(this);
    if (this.animationMixer && this.animations?.length > 0) {
      const idle = this.animations.find(a => a.name.toLowerCase().includes("idle"));
      const first = idle ? idle.name : this.animations[0].name;
      if (this.playChaweeyoos) this.playChaweeyoos(first);
    }
  },

  heesHawvoos(deltaTime) {
    Chai.prototype.heesHawvoos.call(this, deltaTime);
  }
};
