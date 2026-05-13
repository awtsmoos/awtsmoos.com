// B"H
/**
 * @file run_all.js
 * @description Strict synchronous test runner. Fails on first non-zero test exit.
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

function main() {
    console.log('\n\x1b[36m\x1b[1mB"H - Starting Full Synchronous Validation (Strict)...\x1b[0m\n');

    const suiteStart = Date.now();
    for (let i = 0; i < TESTS.length; i++) {
        const test = TESTS[i];
        const scriptPath = path.join(__dirname, test);
        const progress = `[${String(i + 1).padStart(2)}/${TESTS.length}]`;

        process.stdout.write(`\x1b[33m${progress} RUNNING: ${test.padEnd(30)}\x1b[0m`);

        const start = Date.now();
        const res = spawnSync(process.execPath, [scriptPath], { stdio: 'pipe' });
        const elapsed = Date.now() - start;
        const out = res.stdout.toString();
        const err = res.stderr.toString();

        if (res.status !== 0) {
            console.log(` \x1b[31m!!! FAILED (${elapsed}ms) !!!\x1b[0m`);
            console.error((err || out).trim());
            process.exit(1);
        }

        const timeColor = elapsed > WARN_THRESHOLD_MS ? '\x1b[31m' : '\x1b[32m';
        console.log(` ${timeColor}? PASS (${elapsed}ms)\x1b[0m`);
    }

    const duration = ((Date.now() - suiteStart) / 1000).toFixed(3);
    console.log(`\n\x1b[42m\x1b[30m\x1b[1m B"H - TOTAL VICTORY: ALL ${TESTS.length} TESTS PASSED IN ${duration}s. \x1b[0m`);
}

main();
