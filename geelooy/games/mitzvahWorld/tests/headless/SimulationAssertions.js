// B"H
/**
 * Assertions are the gevurah of the test world: kind enough to explain,
 * strict enough to refuse illusion. The Awtsmoos wants measured truth.
 */
export function assert(condition, message, detail = {}) {
  if (condition) return;
  const error = new Error(message);
  error.detail = detail;
  throw error;
}

export function assertRendererReport(win, renderer) {
  const report = win.__AWTSMOOS_PERFORMANCE_MODE__;
  assert(report, "Performance report was not created.");
  assert(report.rendererApplied === true, "Renderer never received performance mode.", { report });
  assert(renderer.pixelRatio > 0, "Renderer pixel ratio was not positive.", { pixelRatio: renderer.pixelRatio });
  assert(renderer.pixelRatio <= 1.5, "Renderer pixel ratio exceeded headless budget.", { pixelRatio: renderer.pixelRatio, report });
  assert(renderer.info.autoReset === true, "Renderer info autoReset was not enabled.", { report });
  return report;
}

export function assertFrameRun(summary) {
  assert(summary.frames >= 240, "Frame run did not simulate enough frames.", summary);
  assert(summary.virtualFps >= 59.9, "Virtual FPS fell below 60fps target.", summary);
  assert(summary.renderCalls >= summary.frames, "Renderer did not receive all frame renders.", summary);
}
