// B"H
import { detectDeviceTier } from "./DeviceTierDetector.js";
import { adaptiveRenderScale, applyRenderScale } from "./AdaptiveRenderScale.js";
import { fastSceneBudget } from "./FastSceneBudget.js";
import { performanceReport } from "./PerformanceReport.js";
function findRenderer(win) { return win?.renderer || win?.ikar?.renderer || win?.olam?.renderer || win?.__AWTSMOOS_RENDERER__ || null; }
export function bootPerformanceMode(win = globalThis.window, doc = globalThis.document) { const tier = detectDeviceTier(win, win?.navigator); const scale = adaptiveRenderScale(tier); const budget = fastSceneBudget(tier); doc?.documentElement?.classList?.toggle("awtsmoos-low-tier", tier.tier === "low"); doc?.documentElement?.classList?.toggle("awtsmoos-mobile-perf", tier.mobile); const rendererApplied = applyRenderScale(findRenderer(win), scale, win); const report = performanceReport(tier, budget, scale); report.rendererApplied = rendererApplied; win.__AWTSMOOS_PERFORMANCE_MODE__ = report; win.__AWTSMOOS_PERFORMANCE_MODE_REPORT__ = () => report; return report; }
bootPerformanceMode();
globalThis.window?.addEventListener?.("resize", () => bootPerformanceMode(), { passive:true });
export default bootPerformanceMode;
