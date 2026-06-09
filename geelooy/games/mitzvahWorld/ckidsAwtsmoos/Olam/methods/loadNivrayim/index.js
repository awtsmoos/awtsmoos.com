// B"H
/**
 * @file index.js
 * @description
 * Chapter 502: Loading no longer stops at entities. If the Emerald entry scene
 * is present, its HUD, quest, portrait, camera cue, and ambience are awakened
 * after the nivrayim settle into the world.
 */
import instantiate from "./instantiateMezuzahDirect.js?v=mobile-raycast-accepted-click-20260604-bh446";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=no-skipraycast-wall-octree-20260604-bh446";
import { applyEntryRuntime } from "./entryRuntime/applyEntryRuntime.js";
async function safeAssetSize(nivra) {
  if (typeof nivra?.getSize !== "function") return 0;
  try { const size = await nivra.getSize(); return Number.isFinite(Number(size)) ? Number(size) : 0; }
  catch (error) { console.warn("B\"H | NIVRA_SIZE_PROBE_SKIPPED", { name: nivra?.name, type: nivra?.type, reason: error?.message || String(error) }); return 0; }
}
export default class LoadNivrayim {
  async addObject(type, options) { return await instantiate.addObject.call(this, type, options); }
  async loadNivrayim(nivrayim) {
    try {
      TimeTracker.start("LOAD_NIVRAYIM");
      const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);
      let totalSize = 0;
      for (const nivra of nivrayimMade) { nivra.olam = this; const assetSize = await safeAssetSize(nivra); totalSize += assetSize; nivra.assetSize = assetSize; nivra.loadingAssetSize = assetSize; }
      this.totalSize = totalSize;
      await lifecycle.runHeescheel.call(this, nivrayimMade);
      await lifecycle.runMadeAll.call(this, nivrayimMade);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      await lifecycle.runReady.call(this, nivrayimMade);
      await lifecycle.runAfterBriyah.call(this, nivrayimMade);
      scheduleVillageGrounding(this, nivrayimMade);
      applyEntryRuntime(this, nivrayim || {});
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() });
      if (!this.enlightened && typeof this.ohr === "function") { try { this.ohr(); } catch (error) { console.error("B\"H - ⚠️ Lighting resistance encountered:", error); } }
      TimeTracker.finish("LOAD_NIVRAYIM", "Souls loaded; Emerald entry runtime awakened when present.");
      return nivrayimMade || [];
    } catch (error) { console.error("B\"H - 🚨 THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error); return []; }
  }
}
