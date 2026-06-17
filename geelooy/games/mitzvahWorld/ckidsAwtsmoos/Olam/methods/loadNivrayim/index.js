// B"H
/**
 * @file index.js
 * @description Chapter 956: loadNivrayim now emits a truthful worker-world report.
 */
import instantiate from "./instantiateMezuzahDirect.js?v=village-polish-20260612-bh810";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";
import { diagEvent, installDiagnosticsNotice } from "../../../utils/AwtsmoosDiagnostics.js?v=village-diagnostics-20260612-bh2";
import { scheduleVillageGrounding } from "./villageGrounding.js?v=village-grounding-law-20260612-bh1";
import { applyEntryRuntime } from "./entryRuntime/applyEntryRuntime.js";
import { runMitzvahWorldPostBuild } from "../../worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js?v=mobile-postbuild-region-20260615-bh903";
import { postWorkerProgress } from "../../oyved/core/protocol/WorkerProtocol.js";
import { makeWorkerWorldReport } from "../../../../systems/visuals/WorkerWorldReport.js";
function isPlayerSoul(nivra) { return nivra?.type === "chossid" || nivra?.constructor?.name === "Chossid"; }
function registerPlayerSouls(olam, list, stage) { let count = 0; for (const nivra of list || []) { if (!isPlayerSoul(nivra)) continue; nivra.olam = olam; nivra.heesHawveh = true; olam.chossid = nivra; olam.player = nivra; if (!olam.nivrayim.includes(nivra)) olam.nivrayim.push(nivra); count += 1; } if (count) diagEvent("player-registered", { stage, count, nivrayim: olam.nivrayim.length }); }
async function safeAssetSize(nivra) { if (typeof nivra?.getSize !== "function") return 0; try { const size = await nivra.getSize(); return Number.isFinite(Number(size)) ? Number(size) : 0; } catch (error) { diagEvent("asset-size-skip", { name: nivra?.name, type: nivra?.type, reason: error?.message || String(error) }, "warn"); return 0; } }
function mark(stage, fields = {}) { postWorkerProgress(`load-nivrayim:${stage}`, fields); }
function authoredCount(nivrayim) { if (!nivrayim || typeof nivrayim !== "object") return 0; if (Array.isArray(nivrayim)) return nivrayim.length; return Object.values(nivrayim).reduce((sum, value) => sum + (Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : 0), 0); }
function publishWorldReport(olam, scene, nivrayimMade, startedAt) {
  const report = makeWorkerWorldReport({ olam, scene, nivrayim:nivrayimMade, elapsedMs:performance.now() - startedAt, source:olam?.baseInfo?.id || olam?.baseInfo?.shaym || null });
  olam.__awtsmoosWorkerWorldReport = report;
  mark("world-report", { worldReport:report });
  diagEvent("worker-world-report", report);
  return report;
}
export default class LoadNivrayim {
  async addObject(type, options) { return await instantiate.addObject.call(this, type, options); }
  async loadNivrayim(nivrayim) {
    const startedAt = performance.now();
    try {
      installDiagnosticsNotice(); TimeTracker.start("LOAD_NIVRAYIM"); mark("start", { authored:authoredCount(nivrayim) });
      mark("parse:start"); const nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim); mark("parse:done", { count:nivrayimMade.length, elapsedMs:Math.round(performance.now() - startedAt) }); registerPlayerSouls(this, nivrayimMade, "after-parse");
      let totalSize = 0; mark("asset-size:start", { count:nivrayimMade.length });
      for (let index = 0; index < nivrayimMade.length; index += 1) { const nivra = nivrayimMade[index]; nivra.olam = this; const assetSize = await safeAssetSize(nivra); totalSize += assetSize; nivra.assetSize = assetSize; nivra.loadingAssetSize = assetSize; if (index === 0 || index === nivrayimMade.length - 1 || index % 25 === 0) mark("asset-size:progress", { index, name:nivra?.name || null }); }
      this.totalSize = totalSize; mark("asset-size:done", { totalSize, elapsedMs:Math.round(performance.now() - startedAt) });
      mark("heescheel:start", { count:nivrayimMade.length }); await lifecycle.runHeescheel.call(this, nivrayimMade); mark("heescheel:done", { elapsedMs:Math.round(performance.now() - startedAt) }); registerPlayerSouls(this, nivrayimMade, "after-heescheel");
      mark("madeAll:start"); await lifecycle.runMadeAll.call(this, nivrayimMade); mark("madeAll:done");
      mark("placeholder:start", { count:nivrayimMade.length }); for (let index = 0; index < nivrayimMade.length; index += 1) { const nivra = nivrayimMade[index]; await this.doPlaceholderAndEntityLogic(nivra); if (index === 0 || index === nivrayimMade.length - 1 || index % 25 === 0) mark("placeholder:progress", { index, name:nivra?.name || null }); } mark("placeholder:done"); registerPlayerSouls(this, nivrayimMade, "after-placeholder-logic");
      mark("ready:start"); await lifecycle.runReady.call(this, nivrayimMade); mark("ready:done"); registerPlayerSouls(this, nivrayimMade, "after-ready");
      mark("afterBriyah:start"); await lifecycle.runAfterBriyah.call(this, nivrayimMade); mark("afterBriyah:done"); registerPlayerSouls(this, nivrayimMade, "after-afterBriyah");
      mark("village-grounding:schedule:start"); scheduleVillageGrounding(this, nivrayimMade); mark("village-grounding:schedule:done");
      mark("entry-runtime:start"); applyEntryRuntime(this, nivrayim || {}); mark("entry-runtime:done");
      mark("postbuild:start"); await runMitzvahWorldPostBuild({ olam:this, scene:this.scene, nivrayim:nivrayimMade, worldData:this.baseInfo || {}, source:this.baseInfo?.id || this.baseInfo?.shaym || null }); mark("postbuild:done");
      const worldReport = publishWorldReport(this, this.scene, nivrayimMade, startedAt);
      this.ayshPeula("updateProgress", { loadedNivrayim:Date.now(), workerWorldReport:worldReport });
      if (!this.enlightened && typeof this.ohr === "function") { try { this.ohr(); } catch (error) { console.error("B\"H - Lighting resistance encountered:", error); } }
      diagEvent("load-nivrayim-complete", { count:nivrayimMade.length, totalSize, offlineEcology:true, workerWorldReport:worldReport }); TimeTracker.finish("LOAD_NIVRAYIM", "Souls loaded; worker truth report emitted."); mark("done", { count:nivrayimMade.length, elapsedMs:Math.round(performance.now() - startedAt) }); return nivrayimMade || [];
    } catch (error) {
      console.error("B\"H - THE CREATION PROTOCOL HIT A REAL LOAD FAILURE:", error); diagEvent("load-nivrayim-failed", { message:error?.message || String(error) }, "error"); mark("error", { message:error?.message || String(error), stack:String(error?.stack || "").slice(0, 700) }); return [];
    }
  }
}
