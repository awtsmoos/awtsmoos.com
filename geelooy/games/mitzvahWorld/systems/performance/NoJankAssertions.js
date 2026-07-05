// B"H
/**
 * @file NoJankAssertions.js
 * @description
 * Honest jank assertions. It cannot promise that every machine is always 60fps,
 * but it records when the post-load sample breaks the target and what counters
 * were present at that instant. Later proof owns pass/fail status.
 */
const TARGET = 60;
const FRAME_MS = 1000 / TARGET;

export function assertPostLoadFps(report) {
  if (!report || !report.sampleFrames) return { ok:false, reason:"missing-report" };
  const ok = report.minFps >= TARGET && report.p95FrameMs <= FRAME_MS;
  const payload = {
    ok,
    targetFps:TARGET,
    minFps:report.minFps,
    avgFps:report.avgFps,
    p95FrameMs:report.p95FrameMs,
    maxFrameMs:report.maxFrameMs,
    counters:globalThis.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null,
    npc:report.npc || null,
    spatial:report.spatial || null,
    fpsGuardian:report.fpsGuardian || globalThis.__AWTSMOOS_FPS_GUARDIAN__ || null
  };
  if (ok) console.info("B'H NoJankAssertions: 60fps target held in post-load sample", payload);
  else console.info("B'H NoJankAssertions: FPS target missed in early sample; adaptive proof will judge final frame budget", payload);
  globalThis.__AWTSMOOS_NO_JANK_ASSERTION__ = payload;
  return payload;
}

export function frameBudgetSummary() {
  const counters = globalThis.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null;
  const report = globalThis.__AWTSMOOS_POST_LOAD_FPS_REPORT__ || null;
  return { counters, report, assertion:globalThis.__AWTSMOOS_NO_JANK_ASSERTION__ || null };
}

export default { assertPostLoadFps, frameBudgetSummary };
