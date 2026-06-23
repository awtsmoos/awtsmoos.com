// B"H
/** @file FullHyperrealismBootstrap.js @description Boots every hyperrealism foundation after world memory exists. */
import { createFullHyperrealismRuntime } from './FullHyperrealismRuntime.js';

const scope = globalThis;
if (!scope.__MITZVAH_FULL_HYPERREALISM__) {
  const runtime = createFullHyperrealismRuntime(scope);
  scope.__MITZVAH_FULL_HYPERREALISM__ = runtime;
  scope.__MITZVAH_WORLD_STATE__ = runtime.state;
  scope.__MITZVAH_ENVIRONMENT_WEAR__ = runtime.environment;
  scope.__MITZVAH_FULL_HYPERREALISM_REPORT__ = () => runtime.report();
  runtime.seed();
}
export default scope.__MITZVAH_FULL_HYPERREALISM__;
