// B"H
/**
 * @file InfiniteRealismBootstrap.js
 * @description Starts renderer, texture, and spatial-interest enforcement for infinite realism at sane FPS.
 *
 * Chapter of the silent timer:
 * The Awtsmoos taught this vessel that browser life and Node proof are two
 * garments of one light. In the browser, the loop breathes every second. In
 * Node import audits, the runtime must reveal its exports without trapping the
 * process in an immortal timeout. Thus the loop starts only where a document or
 * window exists, while tests may still create and inspect the runtime directly.
 */
import { createInfiniteRealismRuntime } from './InfiniteRealismRuntime.js';

const scope = globalThis;
const hasBrowserVessel = Boolean(scope.window?.document || scope.document);

if (!scope.__MITZVAH_INFINITE_REALISM_RUNTIME__) {
  const runtime = createInfiniteRealismRuntime(scope);
  scope.__MITZVAH_INFINITE_REALISM_RUNTIME__ = runtime;
  scope.__MITZVAH_INFINITE_REALISM_CYCLE__ = note => runtime.cycle(note);
  scope.addEventListener?.('mitzvah-world:master-realism-policy', () => runtime.cycle({ source:'policy-refresh' }));
  scope.addEventListener?.('mitzvah-world:performance-budget', () => runtime.cycle({ source:'budget-refresh' }));
  if (hasBrowserVessel) runtime.start();
  else scope.__MITZVAH_INFINITE_REALISM_NODE_IMPORT_ONLY__ = true;
}

export const infiniteRealismRuntime = scope.__MITZVAH_INFINITE_REALISM_RUNTIME__;
export const infiniteRealismAutoStarted = hasBrowserVessel;
export default scope.__MITZVAH_INFINITE_REALISM_RUNTIME__;
