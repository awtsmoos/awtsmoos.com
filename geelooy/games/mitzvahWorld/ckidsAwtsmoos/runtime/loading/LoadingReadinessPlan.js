// B"H
/** @file LoadingReadinessPlan.js @description Real progress from named subsystems, not blue-screen hope. */
import { loadStepRecords } from "./LoadStepCatalog.js";
export function installLoadingReadinessPlan(runtime) {
  const steps = loadStepRecords();
  for (const step of steps) runtime?.readiness?.register?.(step.id, { progress:step.id === "runtime:playable" ? 1 : 0, status:"pending", weight:step.weight, data:{ label:step.label } });
  runtime?.markReady?.("loading:plan", { steps:steps.length, labels:steps.map(s => s.label) });
  return steps;
}
export function loadingTips() { return ["The loader waits for real subsystem proof.", "Studio, Movie Maker, AI, and Gameplay share one runtime.", "Kosher animals form herds with needs and genetics.", "Purified regions regrow trees and change music."]; }
export default installLoadingReadinessPlan;
