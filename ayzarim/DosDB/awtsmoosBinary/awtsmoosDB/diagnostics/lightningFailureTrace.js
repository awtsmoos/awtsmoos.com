
// B"H

/**
 * @file diagnostics/lightningFailureTrace.js
 * @chapter The Depth Name That Was Never Born
 * @description
 * Trace for the current run_all failure.
 *
 * Exact stack:
 * test/run_all.js
 * -> test/lightning/runOne.js
 * -> test/lightning/moduleRunner.js
 * -> test/lightning/sourceScaler/index.js
 * -> test/lightning/sourceScaler/rules/omega.js
 * -> transformed test/omega_simulation.js
 * -> runTest()
 * -> Phase 1 still prints "200 Levels Deep"
 * -> Phase 2 has a rewritten loop using DEPTH
 * -> omega_simulation.js original file does not define DEPTH in that scope
 * -> ReferenceError: DEPTH is not defined
 *
 * Permanent fix:
 * Do not rewrite brittle stress-test internals anymore.
 * For run_all lightning mode, replace known brutal simulations with focused
 * mini validation suites that test the same DB features without huge loops.
 */

module.exports = {
  failure: 'ReferenceError: DEPTH is not defined',
  badSystem: 'sourceScaler mutated original stress-test code too aggressively',
  permanentFix: 'fastSuites registry runs compact feature probes instead of rewriting brutal source'
};
