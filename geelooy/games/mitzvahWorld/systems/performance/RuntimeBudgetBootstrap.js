// B"H
/**
 * RuntimeBudgetBootstrap
 * The Awtsmoos starts three quiet guardians: quality director, realism budget,
 * and living-world coordinator. Each awakens on idle time and keeps the main
 * loop sacred by stepping only budgeted slices.
 */
import { createWorldQualityDirector } from './WorldQualityDirector.js';
import { createRealismPerformanceGovernor } from './RealismPerformanceGovernor.js';
import { createLivingWorldRuntime } from '../livingWorld/LivingWorldRuntime.js';
const scope = globalThis;
function startQualityDirector() {
  if (scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__) return scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__;
  const director = createWorldQualityDirector(scope, { publishEveryMs: 2500, maxFrames: 150 });
  scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ = director;
  director.start();
  return director;
}
function startRealismGovernor() {
  if (scope.__MITZVAH_WORLD_REALISM_GOVERNOR__) return scope.__MITZVAH_WORLD_REALISM_GOVERNOR__;
  const realism = createRealismPerformanceGovernor(scope);
  scope.__MITZVAH_WORLD_REALISM_GOVERNOR__ = realism;
  realism.start();
  return realism;
}
function startLivingWorld() {
  if (scope.__MITZVAH_WORLD_LIVING_WORLD__) return scope.__MITZVAH_WORLD_LIVING_WORLD__;
  const living = createLivingWorldRuntime(scope);
  living.start('runtime-budget-bootstrap');
  scope.__MITZVAH_WORLD_LIVING_WORLD__ = living;
  return living;
}
export function startRuntimeBudgetSystems() {
  const quality = startQualityDirector();
  const realism = startRealismGovernor();
  const living = startLivingWorld();
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:runtime-budget-started', {
    detail: { at: Date.now(), cheap: true, realism: true, livingWorld: true }
  }));
  return { quality, realism, living };
}
const idle = scope.requestIdleCallback ? cb => scope.requestIdleCallback(cb, { timeout: 1800 }) : cb => scope.setTimeout(cb, 900);
idle(startRuntimeBudgetSystems);
export default scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ || null;
