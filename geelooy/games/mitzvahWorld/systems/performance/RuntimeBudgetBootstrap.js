// B"H
/**
 * Starts the global runtime budget director and the selective realism governor.
 * One watches frame breath; the other turns that breath into concrete gameplay
 * budgets so realism stays close, alive, and cheap at distance.
 */
import { createWorldQualityDirector } from './WorldQualityDirector.js';
import { createRealismPerformanceGovernor } from './RealismPerformanceGovernor.js';
const scope = globalThis;
function startDirector() {
  if (!scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__) {
    const director = createWorldQualityDirector(scope, { publishEveryMs: 2500, maxFrames: 150 });
    scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ = director;
    director.start();
  }
  if (!scope.__MITZVAH_WORLD_REALISM_GOVERNOR__) {
    const realism = createRealismPerformanceGovernor(scope);
    scope.__MITZVAH_WORLD_REALISM_GOVERNOR__ = realism;
    realism.start();
  }
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:runtime-budget-started', {
    detail: { at: Date.now(), cheap: true, realism: true }
  }));
  return scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__;
}
const idle = scope.requestIdleCallback ? cb => scope.requestIdleCallback(cb, { timeout: 1800 }) : cb => scope.setTimeout(cb, 900);
idle(startDirector);
export default scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ || null;
