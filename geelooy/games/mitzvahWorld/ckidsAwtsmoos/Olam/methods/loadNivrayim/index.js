// B"H
/**
 * @file index.js
 * @description
 * Chapter 626: The player is registered in the living ledger before the frame.
 *
 * The Awtsmoos revealed that constructing Chossid is not enough. The world loop
 * only updates souls that enter `olam.nivrayim`, and the camera/input systems
 * need `olam.chossid` and `olam.player`. This loader now registers player souls
 * at every lifecycle gate and imports the current physics-witness constructor.
 */
import instantiate from "./instantiateMezuzahDirect.js?v=physics-motion-trace-20260610-bh708";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=final-colliders-after-settle-20260609-bh621";
import { applyEntryRuntime } from "./entryRuntime/applyEntryRuntime.js";

/** @param {object} nivra Candidate entity. @returns {boolean} True for player. */
function isPlayerSoul(nivra) {
  return nivra?.type === "chossid" || nivra?.constructor?.name === "Chossid";
}

/** @param {object} olam World. @param {object[]} list Entities. @param {string} stage Stage. */
function registerPlayerSouls(olam, list, stage) {
  for (const nivra of list || []) {
    if (!isPlayerSoul(nivra)) continue;
    nivra.olam = olam;
    nivra.heesHawveh = true;
    olam.chossid = nivra;
    olam.player = nivra;
    if (!olam.nivrayim.includes(nivra)) olam.nivrayim.push(nivra);
    console.info('B"H | CHOSSID_REGISTERED_IN_WORLD', {
      stage,
      name: nivra.name,
      isReady: nivra.isReady,
      heesHawveh: nivra.heesHawveh,
      hasMesh: Boolean(nivra.mesh),
      hasModel: Boolean(nivra.modelMesh),
      nivrayim: olam.nivrayim.length
    });
  }
}

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
      registerPlayerSouls(this, nivrayimMade, "after-parse");
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
      registerPlayerSouls(this, nivrayimMade, "after-heescheel");
      await lifecycle.runMadeAll.call(this, nivrayimMade);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      registerPlayerSouls(this, nivrayimMade, "after-placeholder-logic");
      await lifecycle.runReady.call(this, nivrayimMade);
      registerPlayerSouls(this, nivrayimMade, "after-ready");
      await lifecycle.runAfterBriyah.call(this, nivrayimMade);
      registerPlayerSouls(this, nivrayimMade, "after-afterBriyah");
      scheduleVillageGrounding(this, nivrayimMade);
      applyEntryRuntime(this, nivrayim || {});
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() });
      if (!this.enlightened && typeof this.ohr === "function") {
        try { this.ohr(); } catch (error) { console.error("B\"H - ⚠️ Lighting resistance encountered:", error); }
      }
      TimeTracker.finish("LOAD_NIVRAYIM", "Souls loaded; player registered; final colliders scheduled after visual settle.");
      return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - 🚨 THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error);
      return [];
    }
  }
}
