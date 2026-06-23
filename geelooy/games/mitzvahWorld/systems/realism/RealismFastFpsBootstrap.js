// B"H
/** @file RealismFastFpsBootstrap.js @description Boots the all-at-once realism/FPS director and refreshes it whenever budgets change. */
import { createRealismFastFpsDirector } from './RealismFastFpsDirector.js';

const scope = globalThis;
if (!scope.__MITZVAH_REALISM_FAST_FPS_DIRECTOR__) {
  const director = createRealismFastFpsDirector(scope);
  scope.__MITZVAH_REALISM_FAST_FPS_DIRECTOR__ = director;
  director.rebuild();
  scope.addEventListener?.('mitzvah-world:performance-budget', () => director.rebuild());
  scope.__MITZVAH_REALISM_FAST_FPS_REPORT__ = () => director.report({ source:'manual-report' });
}
export default scope.__MITZVAH_REALISM_FAST_FPS_DIRECTOR__;
