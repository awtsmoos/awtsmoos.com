// B"H
import assert from "node:assert/strict";
import { resolvePixelRatio, measureRenderViewport } from "../../ckidsAwtsmoos/divine_systems/render/core/PixelRatioGovernor.js";

const sourceWindow = {
  innerWidth:1366,
  innerHeight:625,
  devicePixelRatio:1,
  navigator:{ deviceMemory:8, userAgent:"Chrome desktop" },
  localStorage:{ getItem:() => JSON.stringify({ quality:"balanced" }) },
  matchMedia:() => ({ matches:false }),
  dispatchEvent:() => true,
  CustomEvent:globalThis.CustomEvent
};

assert.equal(resolvePixelRatio({ raw:1, width:1366, height:625, phase:"resize", memoryGb:8, sourceWindow }) <= 0.82, true, "desktop DPR1 should be allowed to cap below native for FPS");
const report = measureRenderViewport(sourceWindow, "resize");
assert.equal(report.pixelRatio <= 0.82, true, "viewport report should publish capped worker pixel ratio");
assert.equal(report.applied, true, "worker pixel governor should mark cap as applied");
assert.equal(sourceWindow.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__.applied, true, "report should publish to window");

console.log(JSON.stringify({ ok:true, test:"pixelGovernorFpsFirstAudit", pixelRatio:report.pixelRatio, applied:report.applied }, null, 2));
