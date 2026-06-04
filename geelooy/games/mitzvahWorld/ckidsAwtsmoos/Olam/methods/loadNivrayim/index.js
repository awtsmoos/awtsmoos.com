// B"H
/**
 * @file index.js
 * @description
 * Chapter 111: Loading imports the fresh direct interaction gate.
 * The village guide must not disappear because Android holds an older loader
 * module. The Awtsmoos seals both NPC construction and grounding with new URLs.
 */
import instantiate from "./instantiateMezuzahDirect.js?v=visible-guide-direct-20260604-bh442";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=road-house-guide-colliders-20260604-bh442";

async function safeAssetSize(nivra) {
  if (typeof nivra?.getSize !== "function") return 0;
  try {
    const size = await nivra.getSize();
    return Number.isFinite(Number(size)) ? Number(size) : 0;
  } catch (error) {
    console.warn("B\"H | NIVRA_SIZE_PROBE_SKIPPED", { name: nivra?.name, type: nivra?.type, reason: error?.message || String(error) });
    return 0;
  }
}

export default class LoadNivrayim {
  async addObject(type, options) { return await instantiate.addObject.call(this, type, options); }

  async loadNivrayim(nivrayim) {
    try {
      TimeTracker.start("LOAD_NIVRAYIM");
      const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);
      let totalSize = 0;
      for (const nivra of nivrayimMade) {
        nivra.olam = this;
        const assetSize = await safeAssetSize(nivra);
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
      TimeTracker.finish("LOAD_NIVRAYIM", "All souls solidified; visible guide and colliders fresh.");
      return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - 🚨 THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error);
      return [];
    }
  }
}
