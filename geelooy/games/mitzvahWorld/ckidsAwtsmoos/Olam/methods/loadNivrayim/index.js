// B"H
/** @file index.js @description Chapter 954: loader imports offline material ecology postbuild. */
import instantiate from "./instantiateMezuzahDirect.js?v=village-polish-20260612-bh810";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { diagEvent, installDiagnosticsNotice } from "../../../utils/AwtsmoosDiagnostics.js?v=village-diagnostics-20260612-bh1";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=village-grounding-law-20260612-bh1";
import { applyEntryRuntime } from "./entryRuntime/applyEntryRuntime.js";
import { runMitzvahWorldPostBuild } from "../../worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js?v=full-region-postbuild-20260612-bh1";
function isPlayerSoul(nivra) { return nivra?.type === "chossid" || nivra?.constructor?.name === "Chossid"; }
function registerPlayerSouls(olam, list, stage) { let count = 0; for (const nivra of list || []) { if (!isPlayerSoul(nivra)) continue; nivra.olam = olam; nivra.heesHawveh = true; olam.chossid = nivra; olam.player = nivra; if (!olam.nivrayim.includes(nivra)) olam.nivrayim.push(nivra); count += 1; } if (count) diagEvent("player-registered", { stage, count, nivrayim: olam.nivrayim.length }); }
async function safeAssetSize(nivra) { if (typeof nivra?.getSize !== "function") return 0; try { const size = await nivra.getSize(); return Number.isFinite(Number(size)) ? Number(size) : 0; } catch (error) { diagEvent("asset-size-skip", { name: nivra?.name, type: nivra?.type, reason: error?.message || String(error) }, "warn"); return 0; } }
export default class LoadNivrayim {
  async addObject(type, options) { return await instantiate.addObject.call(this, type, options); }
  async loadNivrayim(nivrayim) {
    try {
      installDiagnosticsNotice(); TimeTracker.start("LOAD_NIVRAYIM"); const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim); registerPlayerSouls(this, nivrayimMade, "after-parse"); let totalSize = 0;
      for (const nivra of nivrayimMade) { nivra.olam = this; const assetSize = await safeAssetSize(nivra); totalSize += assetSize; nivra.assetSize = assetSize; nivra.loadingAssetSize = assetSize; }
      this.totalSize = totalSize; await lifecycle.runHeescheel.call(this, nivrayimMade); registerPlayerSouls(this, nivrayimMade, "after-heescheel"); await lifecycle.runMadeAll.call(this, nivrayimMade);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      registerPlayerSouls(this, nivrayimMade, "after-placeholder-logic"); await lifecycle.runReady.call(this, nivrayimMade); registerPlayerSouls(this, nivrayimMade, "after-ready"); await lifecycle.runAfterBriyah.call(this, nivrayimMade); registerPlayerSouls(this, nivrayimMade, "after-afterBriyah");
      scheduleVillageGrounding(this, nivrayimMade); applyEntryRuntime(this, nivrayim || {}); await runMitzvahWorldPostBuild({ olam: this, scene: this.scene, nivrayim: nivrayimMade, worldData: this.baseInfo || {}, source: this.baseInfo?.id || this.baseInfo?.shaym || null });
      this.ayshPeula("updateProgress", { loadedNivrayim: Date.now() }); if (!this.enlightened && typeof this.ohr === "function") try { this.ohr(); } catch (error) { console.error("B\"H - ⚠️ Lighting resistance encountered:", error); }
      diagEvent("load-nivrayim-complete", { count: nivrayimMade.length, totalSize, offlineEcology: true }); TimeTracker.finish("LOAD_NIVRAYIM", "Souls loaded; offline ecology material postbuild scheduled."); return nivrayimMade || [];
    } catch (error) { console.error("B\"H - 🚨 THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error); diagEvent("load-nivrayim-failed", { message: error?.message || String(error) }, "error"); return []; }
  }
}
