// B"H
/**
 * @file index.js
 * @description Chapter 12: LoadNivrayim pulls bh17 constructors through instantiate.
 */
import instantiate from "./instantiate.js?v=lean-l1-20260528-bh18";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";

export default class LoadNivrayim {
  /** Adds one object after world birth. */
  async addObject(type, options) {
    return await instantiate.addObject.call(this, type, options);
  }

  /** Loads all initial nivrayim from pure level data. */
  async loadNivrayim(nivrayim) {
    try {
      TimeTracker.start("LOAD_NIVRAYIM");
      const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);
      let totalSize = 0;
      for (const nivra of nivrayimMade) {
        nivra.olam = this;
        const s = typeof nivra.getSize === 'function' ? await nivra.getSize() : 0;
        totalSize += s;
        nivra.size = s;
      }
      this.totalSize = totalSize;
      await lifecycle.runHeescheel.call(this, nivrayimMade);
      await lifecycle.runMadeAll.call(this, nivrayimMade);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      await lifecycle.runReady.call(this, nivrayimMade);
      await lifecycle.runAfterBriyah.call(this, nivrayimMade);
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() });
      if (!this.enlightened && typeof this.ohr === 'function') {
        try { this.ohr(); }
        catch (e) { console.error("B\"H - ⚠️ Lighting resistance encountered:", e); }
      }
      TimeTracker.finish("LOAD_NIVRAYIM", "All souls solidified and linked.");
      return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - 🚨 THE ENTIRE CREATION PROTOCOL FAILED:", error);
      return [];
    }
  }
}
