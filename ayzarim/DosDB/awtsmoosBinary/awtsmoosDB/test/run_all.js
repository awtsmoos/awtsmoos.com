// B"H
/**
 * @file run_all.js
 * @description 
 *  Runs the entire validation suite (43 non-AI tests).
 *  Target completion time: < 12 seconds.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// B"H: The 43 Pillars of Verification
const TESTS = [
    'omni_test.js',
    'live_test.js',
    'pashut.js',
    'api_methods_test.js',
    'blog_engine_simulation.js',
    'circular_stress.js',
    'class_resurrection.js',
    'comprehensive_features.js',
    'complex.js',
    'comprehensive_v2.js',
    'function_test.js',
    'consistency.js',
    'final_boss.js',
    'genesis.js',
    'graph_algo_test.js',
    'graph_neo4j_test.js',
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

function main() {
    console.log("\n\x1b[36m\x1b[1mB\"H - Starting Full Synchronous Validation (43 Tests)...\x1b[0m");
    const start = Date.now();

    for (let i = 0; i < TESTS.length; i++) {
        const test = TESTS[i];
        const scriptPath = path.join(__dirname, test);
        const progress = `[${String(i+1).padStart(2)}/43]`;
        
        process.stdout.write(`\x1b[33m${progress} RUNNING: ${test.padEnd(30)}\x1b[0m`);
        
        const testStart = Date.now();
        const res = spawnSync(process.execPath, [scriptPath], { stdio: 'pipe' });
        const elapsed = Date.now() - testStart;
        
        if (res.status !== 0) {
            console.log(` \x1b[31m!!! FAILED (${elapsed}ms) !!!\x1b[0m`);
            console.error(res.stderr.toString());
            process.exit(1);
        } else {
            console.log(` \x1b[32m✅ PASS (${elapsed}ms)\x1b[0m`);
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n\x1b[42m\x1b[30m\x1b[1m B"H - TOTAL VICTORY: 43/43 TESTS PASSED IN ${duration}s. \x1b[0m\n`);
}

main();
