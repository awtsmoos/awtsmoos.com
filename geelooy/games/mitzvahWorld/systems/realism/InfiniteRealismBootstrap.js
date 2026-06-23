// B"H
/** @file InfiniteRealismBootstrap.js @description Starts renderer, texture, and spatial-interest enforcement for infinite realism at sane FPS. */
import { createInfiniteRealismRuntime } from './InfiniteRealismRuntime.js';

const scope = globalThis;
if (!scope.__MITZVAH_INFINITE_REALISM_RUNTIME__) {
  const runtime = createInfiniteRealismRuntime(scope);
  scope.__MITZVAH_INFINITE_REALISM_RUNTIME__ = runtime;
  scope.__MITZVAH_INFINITE_REALISM_CYCLE__ = note => runtime.cycle(note);
  scope.addEventListener?.('mitzvah-world:master-realism-policy', () => runtime.cycle({ source:'policy-refresh' }));
  scope.addEventListener?.('mitzvah-world:performance-budget', () => runtime.cycle({ source:'budget-refresh' }));
  runtime.start();
}
export default scope.__MITZVAH_INFINITE_REALISM_RUNTIME__;
