// B"H
/**
 * @file RuntimeBudget.js
 * @description Runtime bridge: the reported speed budget becomes living law.
 */
import { detectDeviceTier } from "./DeviceTierDetector.js";
import { fastSceneBudget } from "./FastSceneBudget.js";

const DEFAULT_BUDGET = Object.freeze(fastSceneBudget({ tier: "high", mobile: false }));

function fromWindow() {
  const report = globalThis?.__AWTSMOOS_PERFORMANCE_MODE__ || null;
  return report?.budget || null;
}

export function runtimeBudget() {
  const reported = fromWindow();
  if (reported) return reported;
  try { return fastSceneBudget(detectDeviceTier(globalThis, globalThis?.navigator)); }
  catch { return DEFAULT_BUDGET; }
}

export function runtimeBudgetNumber(key, fallback) {
  const value = Number(runtimeBudget()?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

export function runtimeSpeedMode() {
  const budget = runtimeBudget();
  return budget?.shadowMode === "off" || budget?.cssBlur === false || budget?.seal === "speed-scene-budget-bh4";
}

export default runtimeBudget;
