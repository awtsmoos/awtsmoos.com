// B"H
/**
 * @file index.js
 * @description
 * Chapter 154: The loader carries the indoor-floor village grounding seal.
 * The Awtsmoos waits for the first rendered breath, then grounds village props
 * and lifted indoor NPCs by the fresh ray/lift covenant.
 */
import instantiate from "./instantiateMezuzahDirect.js";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=indoor-floor-lift-20260602-bh154";

export default class LoadNivrayim {
  /** @param {string} type Nivra type. @param {object} options Config. @returns {Promise<object|null>} Created object. */
  async addObject(type, options) { return await instantiate.addObject.call(this, type, options); }

  /** @param {object} nivrayim Pure level data. @returns {Promise<object[]>} Loaded nivrayim. */
  async loadNivrayim(nivrayim) {
    try {
      TimeTracker.start("LOAD_NIVRAYIM");
      const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);
      let totalSize = 0;
      for (const nivra of nivrayimMade) {
        nivra.olam = this;
        const assetSize = typeof nivra.getSize === "function" ? await nivra.getSize() : 0;
        totalSize += assetSize;
        nivra.assetSize = assetSize;
        nivra.loadingAssetSize = assetSize;
      }
      this.totalSize = totalSize;
      await lifecycle.runHeescheel.call(this, nivrayimMade);
      await lifecycle.runMadeAll.call(this, nivrayimMade);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      await lifecycle.runReady.call(this, nivrayimMade);
      await lifecycle.runAfterBriyah.call(this, nivrayimMade);
      scheduleVillageGrounding(this, nivrayimMade);
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() });
      if (!this.enlightened && typeof this.ohr === "function") {
        try { this.ohr(); }
        catch (error) { console.error("B\"H - ⚠️ Lighting resistance encountered:", error); }
      }
      TimeTracker.finish("LOAD_NIVRAYIM", "All souls solidified, linked, and indoor village grounding scheduled.");
      return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - 🚨 THE ENTIRE CREATION PROTOCOL FAILED:", error);
      return [];
    }
  }
}
