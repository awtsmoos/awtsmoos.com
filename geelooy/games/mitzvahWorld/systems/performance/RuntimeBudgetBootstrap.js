// B"H
/**
 * RuntimeBudgetBootstrap
 * The Awtsmoos starts three quiet guardians: quality director, realism budget,
 * and living-world coordinator. The coordinator lives under ckidsAwtsmoos, so
 * this public bootstrap imports the real vessel explicitly instead of a missing
 * root `/systems/livingWorld` mirage.
 */
import { createWorldQualityDirector } from './WorldQualityDirector.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createRealismPerformanceGovernor } from './RealismPerformanceGovernor.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
const scope = globalThis;
function startQualityDirector() {
  if (scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__) return scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__;
  const director = createWorldQualityDirector(scope, { publishEveryMs:2500, maxFrames:150 });
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
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:runtime-budget-started', { detail:{ at:Date.now(), cheap:true, realism:true, livingWorld:true } }));
  return { quality, realism, living };
}
const idle = scope.requestIdleCallback ? cb => scope.requestIdleCallback(cb, { timeout:1800 }) : cb => scope.setTimeout?.(cb, 900);
idle?.(startRuntimeBudgetSystems);
export default scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ || null;
