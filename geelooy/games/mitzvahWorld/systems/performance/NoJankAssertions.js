// B"H
/**
 * @file NoJankAssertions.js
 * @description
 * Honest jank assertions. It cannot promise that every machine is always 60fps,
 * but it can loudly reveal when the post-load sample breaks the target and what
 * counters were present at that instant.
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
    spatial:report.spatial || null
  };
  if (ok) console.info("B'H NoJankAssertions: 60fps target held in post-load sample", payload);
  else console.warn("B'H NoJankAssertions: FPS target missed; optimize the listed counters", payload);
  globalThis.__AWTSMOOS_NO_JANK_ASSERTION__ = payload;
  return payload;
}

export function frameBudgetSummary() {
  const counters = globalThis.__AWTSMOOS_FRAME_COUNTERS__?.report?.() || null;
  const report = globalThis.__AWTSMOOS_POST_LOAD_FPS_REPORT__ || null;
  return { counters, report, assertion:globalThis.__AWTSMOOS_NO_JANK_ASSERTION__ || null };
}

export default { assertPostLoadFps, frameBudgetSummary };
