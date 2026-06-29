// B"H
/** Main-thread performance proof, now honest about OffscreenCanvas workers. */
import { detectDeviceTier } from "./DeviceTierDetector.js";
import { adaptiveRenderScale, applyRenderScale } from "./AdaptiveRenderScale.js";
import { fastSceneBudget } from "./FastSceneBudget.js";
import { performanceReport } from "./PerformanceReport.js";
import { discoverRenderer } from "./RendererDiscovery.js";

const REPORT_KEY = "__AWTSMOOS_PERFORMANCE_MODE__";
const ATTEMPT_KEY = "__AWTSMOOS_PERFORMANCE_ATTEMPTS__";
const RETRY_KEY = "__AWTSMOOS_PERFORMANCE_RETRY_TIMER__";
const STYLE_ID = "awtsmoos-performance-cuts";

function installCss(doc) {
  if (!doc || doc.getElementById?.(STYLE_ID)) return;
  const style = doc.createElement?.("style");
  if (!style) return;
  style.id = STYLE_ID;
  style.textContent = `
html.awtsmoos-no-expensive-css *{backdrop-filter:none!important;filter:none!important}
html.awtsmoos-low-tier *{text-shadow:none!important;box-shadow:none!important}
html.awtsmoos-worker-pixel-governed canvas{image-rendering:auto}
html.awtsmoos-renderer-missing:not(.awtsmoos-worker-pixel-governed) canvas{outline:1px solid rgba(255,180,0,.35)}
`;
  doc.head?.appendChild(style);
}

function workerPixelState(win) {
  const state = win?.__AWTSMOOS_PIXEL_RATIO_GOVERNOR__ || null;
  const applied = Boolean(state && Number.isFinite(Number(state.pixelRatio)));
  return { state, applied };
}

function tuneRenderer(renderer, tier, scale, budget, win) {
  const state = applyRenderScale(renderer, scale, win, tier);
  if (!state.applied) return state;
  if (renderer.shadowMap) renderer.shadowMap.enabled = budget.shadowMode !== "off";
  renderer.info && (renderer.info.autoReset = true);
  win.__AWTSMOOS_RENDERER__ = renderer;
  return { ...state, shadows: Boolean(renderer.shadowMap?.enabled), shadowMode: budget.shadowMode };
}

function applyCssClasses(doc, tier, budget, optimized, workerApplied) {
  installCss(doc);
  const root = doc?.documentElement;
  if (!root?.classList) return;
  root.classList.toggle("awtsmoos-perf-active", true);
  root.classList.toggle("awtsmoos-low-tier", tier.tier === "low");
  root.classList.toggle("awtsmoos-mobile-perf", tier.mobile);
  root.classList.toggle("awtsmoos-no-expensive-css", !budget.cssBlur);
  root.classList.toggle("awtsmoos-worker-pixel-governed", workerApplied);
  root.classList.toggle("awtsmoos-renderer-missing", !optimized);
}

function shouldDiscover(attempt, workerApplied) {
  return !workerApplied && (attempt <= 8 || attempt % 5 === 0);
}

export function bootPerformanceMode(win = globalThis.window, doc = globalThis.document) {
  if (!win) return null;
  const attempt = Number(win[ATTEMPT_KEY] || 0) + 1;
  win[ATTEMPT_KEY] = attempt;
  const tier = detectDeviceTier(win, win.navigator);
  const scale = adaptiveRenderScale(tier);
  const budget = fastSceneBudget(tier);
  const worker = workerPixelState(win);
  const discovery = shouldDiscover(attempt, worker.applied)
    ? discoverRenderer(win, { maxNodes: 220, maxDepth: 5 })
    : { renderer: win.__AWTSMOOS_RENDERER__ || null, report: win.__AWTSMOOS_RENDERER_DISCOVERY__ || { found: false, skipped: true } };
  const rendererState = tuneRenderer(discovery.renderer, tier, scale, budget, win);
  const mainApplied = Boolean(rendererState.applied);
  const optimized = Boolean(mainApplied || worker.applied);
  applyCssClasses(doc, tier, budget, optimized, worker.applied);

  const report = performanceReport(tier, budget, scale);
  report.mainRendererFound = Boolean(discovery.renderer);
  report.mainRendererApplied = mainApplied;
  report.rendererFound = Boolean(discovery.renderer || worker.state);
  report.rendererApplied = optimized;
  report.workerPixelRatioApplied = worker.applied;
  report.workerPixelRatioState = worker.state;
  report.rendererState = rendererState;
  report.discovery = discovery.report;
  report.attempts = attempt;
  report.seal = "frame-rescue-worker-pixel-governor-20260618-bh3";
  win[REPORT_KEY] = report;
  win.__AWTSMOOS_PERFORMANCE_MODE_REPORT__ = () => win[REPORT_KEY];
  return report;
}

function scheduleRetry(win = globalThis.window, doc = globalThis.document) {
  if (!win || win[RETRY_KEY]) return;
  let attempts = 0;
  const tick = () => {
    attempts += 1;
    const report = bootPerformanceMode(win, doc);
    if (report?.rendererApplied || attempts >= 42) { win[RETRY_KEY] = null; return; }
    win[RETRY_KEY] = win.setTimeout(tick, 350);
  };
  win[RETRY_KEY] = win.setTimeout(tick, 100);
}

function bootNow() {
  const report = bootPerformanceMode();
  if (!report?.rendererApplied) scheduleRetry();
  return report;
}

bootNow();
for (const name of ["resize", "awtsmoos:renderer-ready", "awtsmoos-game-ready", "awtsmoos:performance-probe", "awtsmoos:pixel-ratio-governed"]) {
  globalThis.window?.addEventListener?.(name, bootNow, { passive: true });
}
export default bootPerformanceMode;
