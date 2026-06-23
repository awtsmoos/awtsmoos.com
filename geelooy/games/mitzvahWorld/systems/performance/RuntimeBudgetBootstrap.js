// B"H
/** @file RuntimeBudgetBootstrap.js @description Starts the global runtime budget director before heavy realism systems awaken. */
import { createWorldQualityDirector } from './WorldQualityDirector.js';

const scope = globalThis;
if (!scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__) {
  const director = createWorldQualityDirector(scope, { publishEveryMs: 1000, maxFrames: 180 });
  scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__ = director;
  director.start();
  scope.dispatchEvent?.(new CustomEvent('mitzvah-world:runtime-budget-started', { detail:{ at:Date.now() } }));
}
export default scope.__MITZVAH_WORLD_QUALITY_DIRECTOR__;
