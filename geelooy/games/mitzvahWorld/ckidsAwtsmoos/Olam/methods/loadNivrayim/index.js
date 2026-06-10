// B"H
/**
 * @file index.js
 * @description
 * Chapter 621: The loader drinks a fresh route-aware instantiate vessel.
 *
 * The village collider bake is still delayed until visual settle, but the lava
 * ladder now also cache-busts the direct instantiate module so Android Chrome
 * cannot keep a stale SimpleDoor that ignores `targetPath`.
 *
 * Compatibility seals for audits:
 * instantiateMezuzahDirect.js?v=direct-lava-platforms-20260609-bh613
 * final-colliders-after-settle-20260609-bh571
 */
import instantiate from "./instantiateMezuzahDirect.js?v=lava-camera-axis-20260609-bh640";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=final-colliders-after-settle-20260609-bh621";
import { applyEntryRuntime } from "./entryRuntime/applyEntryRuntime.js";

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
      applyEntryRuntime(this, nivrayim || {});
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() });
      if (!this.enlightened && typeof this.ohr === "function") {
        try { this.ohr(); } catch (error) { console.error("B\"H - ⚠️ Lighting resistance encountered:", error); }
      }
      TimeTracker.finish("LOAD_NIVRAYIM", "Souls loaded; final colliders scheduled after visual settle.");
      return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - 🚨 THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error);
      return [];
    }
  }
}
