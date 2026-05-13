
// B"H

/**
 * @file test/run_all.js
 * @chapter The Lightning Court Of Forty Three Gates
 * @description
 * Strict synchronous test runner. Fails on first non-zero test exit.
 *
 * Each test still runs in its own clean Node process, but the children receive
 * AWTSMOOSDB_FAST_TEST=1 so repeated waitForIdle() calls do not force a full
 * whole-file fsync every few assertions. The final close still seals the DB.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const TESTS = [
  'omni_test.js',
  'live_test.js',
  'pashut.js',
  'api_methods_test.js',
  'blog_engine_simulation.js',
  'circular_stress.js',
  'class_resurrection.js',
  'comprehensive_features.js',
  'compression_extreme_test.js',
  'complex.js',
  'comprehensive_v2.js',
  'function_test.js',
  'consistency.js',
  'final_boss.js',
  'genesis.js',
  'graph_algo_test.js',
  'interactive.js',
  'mega_simulation.js',
  'nested.js',
  'nested_literal_proof.js',
  'object_order.js',
  'omega_simulation.js',
  'persistence_stress.js',
  'production_ready.js',
  'query_complex.js',
  'query_test.js',
  'range_test.js',
  'search_test.js',
  'simulation_omniverse.js',
  'simulate_eternity.js',
  'singularity.js',
  'splice_test.js',
  'stress_test.js',
  'suite.js',
  'type_confirmation.js',
  'ultimate.js',
  'ultimate_chaos.js',
  'ultimate_feature_test.js',
  'universal_types.js',
  'usage.js',
  'v2_flawless.js',
  'v2_test.js',
  'vector_test.js'
];

const WARN_THRESHOLD_MS = 500;

/**
 * @function childEnv
 * @description
 * Creates the environment passed into each test child.
 *
 * @returns {object} Environment object.
 */
function childEnv() {
  return {
    ...process.env,
    AWTSMOOSDB_FAST_TEST: '1'
  };
}

/**
 * @function runOne
 * @description
 * Runs one test file and returns result metadata.
 *
 * @param {string} test - Test filename.
 * @returns {object} Spawn result and elapsed milliseconds.
 */
function runOne(test) {
  const scriptPath = path.join(__dirname, test);
  const start = Date.now();

  const res = spawnSync(process.execPath, [scriptPath], {
    stdio: 'pipe',
    env: childEnv()
  });

  return {
    res,
    elapsed: Date.now() - start,
    out: res.stdout.toString(),
    err: res.stderr.toString()
  };
}

/**
 * @function printFailure
 * @description
 * Prints the first useful failure body.
 *
 * @param {object} result - runOne result.
 * @returns {void}
 */
function printFailure(result) {
  console.error((result.err || result.out).trim());
}

/**
 * @function main
 * @description
 * Executes the strict suite.
 *
 * @returns {void}
 */
function main() {
  console.log('\n\x1b[36m\x1b[1mB"H - Starting Full Synchronous Validation (Strict + Lightning)...\x1b[0m\n');

  const suiteStart = Date.now();

  for (let i = 0; i < TESTS.length; i++) {
    const test = TESTS[i];
    const progress = `[${String(i + 1).padStart(2)}/${TESTS.length}]`;

    process.stdout.write(`\x1b[33m${progress} RUNNING: ${test.padEnd(30)}\x1b[0m`);

    const result = runOne(test);

    if (result.res.status !== 0) {
      console.log(` \x1b[31m!!! FAILED (${result.elapsed}ms) !!!\x1b[0m`);
      printFailure(result);
      process.exit(1);
    }

    const timeColor = result.elapsed > WARN_THRESHOLD_MS ? '\x1b[31m' : '\x1b[32m';
    console.log(` ${timeColor}? PASS (${result.elapsed}ms)\x1b[0m`);
  }

  const duration = ((Date.now() - suiteStart) / 1000).toFixed(3);
  console.log(`\n\x1b[42m\x1b[30m\x1b[1m B"H - TOTAL VICTORY: ALL ${TESTS.length} TESTS PASSED IN ${duration}s. \x1b[0m`);
}

main();
