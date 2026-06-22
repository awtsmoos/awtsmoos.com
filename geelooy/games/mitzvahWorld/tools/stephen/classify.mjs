// B"H
/** Stephen turns numbers into the next honest realism/performance work. */
export function classify(sample = {}) {
  const improvements = [];
  const textureSkipped = sample.textureReport?.skipped;
  if (!sample.sceneStats) {
    improvements.push('Expose or bridge a dev-only scene handle so Stephen can count objects, meshes, materials, textures, and skinned animals.');
  }
  if (!sample.textureReport) {
    improvements.push('Publish __AWTSMOOS_TEXTURE_PINGPONG_REPORT__ during visual bootstrap.');
  } else if (textureSkipped) {
    improvements.push(`Texture report exists but skipped: ${sample.textureReport.reason}. Bridge scene access or run the tuner where the scene lives.`);
  }
  if (!sample.scrollUi) improvements.push('Expose ancient scroll UI state so quest/toast/book behavior is testable.');
  if (sample.fps < 55) improvements.push('FPS below 55: reduce far AI, animation, physics, and nearby checks by interest tier.');
  if (sample.p95FrameMs > 34) improvements.push('p95 frame time above 34ms: inspect long tasks and subsystem counters.');
  if (sample.longTaskCount > 0) improvements.push('Long tasks observed: split startup/runtime work and defer non-visual systems.');
  if ((sample.visiblePanels || 0) > 3) improvements.push('Too many visible panels: keep quest updates as toasts and place details inside Shlichus Book.');
  if (!improvements.length) improvements.push('Stephen sees a stable sample; next work can focus on animal silhouettes, house trim, and tree consolidation.');
  return improvements;
}

export function compactSummary(report = {}) {
  const s = report.sample || {};
  return {
    ok: report.ok,
    resultPath: report.resultPath,
    fps: s.fps,
    p95FrameMs: s.p95FrameMs,
    longTaskCount: s.longTaskCount,
    visiblePanels: s.visiblePanels,
    sceneStats: s.sceneStats,
    textureReport: s.textureReport,
    scrollUi: Boolean(s.scrollUi),
    improvements: report.improvements || []
  };
}
