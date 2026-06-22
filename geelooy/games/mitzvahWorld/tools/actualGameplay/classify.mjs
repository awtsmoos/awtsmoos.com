// B"H
/** Actual gameplay profiler diagnosis: only after full gameplay-ready gate. */
export function classify(sample = {}, readiness = {}) {
  const improvements = [];
  if (!readiness.ok) improvements.push(`Gameplay readiness was not proven: ${readiness.reason || 'unknown'}. Do not trust FPS as gameplay FPS.`);
  if (!sample.sampleStartedAfterFullGameplayLoad) improvements.push('Sample did not mark actual gameplay start; gate must be fixed before FPS claims.');
  if (!sample.textureReport) improvements.push('Texture report missing: visual bootstrap must publish texture status.');
  else if (sample.textureReport.skipped) improvements.push(`Texture report skipped: ${sample.textureReport.reason}. Run tuning where the scene lives or expose dev scene stats.`);
  if (sample.fps < 55) improvements.push('Actual gameplay FPS below 55: reduce far AI, animation, physics, and nearby checks by interest tier.');
  if (sample.p95FrameMs > 34) improvements.push('Actual gameplay p95 above 34ms: inspect long tasks and subsystem counters.');
  if (sample.longTaskCount > 0) improvements.push('Long tasks during gameplay sample: defer non-visual systems and reduce synchronous UI/runtime work.');
  if ((sample.visiblePanels || 0) > 3) improvements.push('Too many visible panels during gameplay: collapse quest clutter into Shlichus Book/toasts.');
  if (!improvements.length) improvements.push('Actual gameplay sample is stable; next visual work can deepen terrain/animal/house texture variety.');
  return improvements;
}

export function compactSummary(report = {}) {
  const s = report.sample || {};
  return {
    ok: report.ok,
    resultPath: report.resultPath,
    readiness: report.readiness,
    fps: s.fps,
    p95FrameMs: s.p95FrameMs,
    longTaskCount: s.longTaskCount,
    visiblePanels: s.visiblePanels,
    textureReport: s.textureReport,
    sampleStartedAfterFullGameplayLoad: s.sampleStartedAfterFullGameplayLoad,
    improvements: report.improvements || []
  };
}
