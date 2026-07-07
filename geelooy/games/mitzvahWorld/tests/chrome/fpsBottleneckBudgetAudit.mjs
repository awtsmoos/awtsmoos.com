// B"H
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
const proof = JSON.parse(readFileSync("ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/twoMinuteNoFreezeAudit.json", "utf8"));
const s = proof.sample, b = scene.performanceBudgets;
const report = {
  ok:true,
  avgBrowserRafFps:s.avgBrowserRafFps,
  engineFps:s.engineFps,
  p99FrameMs:s.p99FrameMs,
  worstFrameMs:s.worstFrameMs,
  longTaskCount:s.longTaskCount,
  bottlenecks:[]
};
if (s.worstFrameMs > 100) report.bottlenecks.push("worst-frame-spike");
if (s.longTaskCount > 0) report.bottlenecks.push("long-task-present");
if (s.avgBrowserRafFps < 60) report.bottlenecks.push("not-locked-60-browser-raf");
assert(s.avgBrowserRafFps >= b.targetAvgRafFps, "average browser rAF under budget");
assert(s.engineFps >= b.engineFpsFloor, "engine FPS under budget");
assert(s.p99FrameMs <= b.maxP99FrameMs, "p99 frame time over budget");
assert(s.worstFrameMs <= b.maxWorstFrameMs, "worst frame over budget");
assert(s.longTasks.every(t => t.duration <= b.maxLongTaskMs), "long task over budget");
writeFileSync("ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/fpsBottleneckBudgetReport.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, test:"fpsBottleneckBudgetAudit", report }, null, 2));
