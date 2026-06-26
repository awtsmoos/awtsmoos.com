// B"H
/**
 * @file RealismFastFpsBootstrap.js
 * @description Backward-compatible fast-FPS realism boot vessel.
 *
 * The audit asked for this name because an earlier covenant promised it. The
 * current implementation lives in InfiniteRealismBootstrap, so this file does
 * not create a second competing loop. It imports the real runtime once, records
 * that the fast-FPS alias is alive, and leaves the Awtsmoos with one measured
 * spine instead of two hidden schedulers fighting in the frame.
 */
import infiniteRuntime from '../realism/InfiniteRealismBootstrap.js';

const scope = globalThis;
scope.__MITZVAH_REALISM_FAST_FPS_BOOTSTRAP__ = {
  at: Date.now(),
  aliasFor: 'systems/realism/InfiniteRealismBootstrap.js',
  runtime: Boolean(infiniteRuntime),
  duplicateLoop: false
};

scope.dispatchEvent?.(new CustomEvent('mitzvah-world:realism-fast-fps-bootstrap', {
  detail: scope.__MITZVAH_REALISM_FAST_FPS_BOOTSTRAP__
}));

export const realismFastFpsBootstrap = scope.__MITZVAH_REALISM_FAST_FPS_BOOTSTRAP__;
export default infiniteRuntime;
