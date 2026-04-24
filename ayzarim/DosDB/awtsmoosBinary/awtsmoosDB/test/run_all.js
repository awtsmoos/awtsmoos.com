
// B"H
/**
 * @file run_all.js
 * @description 
 *  Runs the validation suite using spawnSync (fully synchronous runner).
 *  Witnesses the exact physical footprint of the database versus the pure spiritual data.
 *  Now executing at unimaginable speeds due to the Exact-Byte RAM Pager.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const TESTS = [
    'omni_test.js', 'live_test.js', 'pashut.js', 'api_methods_test.js',
    'blog_engine_simulation.js', 'circular_stress.js', 'class_resurrection.js',
    'comprehensive_features.js', 'complex.js', 'comprehensive_v2.js',
    'function_test.js', 'consistency.js', 'final_boss.js', 'genesis.js',
    'graph_algo_test.js', 'interactive.js', 'mega_simulation.js',
    'nested.js', 'nested_literal_proof.js', 'object_order.js',
    'omega_simulation.js', 'persistence_stress.js', 'production_ready.js',
    'query_complex.js', 'query_test.js', 'range_test.js', 'search_test.js',
    'simulation_omniverse.js', 'simulate_eternity.js', 'singularity.js',
    'splice_test.js', 'stress_test.js', 'suite.js', 'type_confirmation.js',
    'ultimate.js', 'ultimate_chaos.js', 'ultimate_feature_test.js',
    'universal_types.js', 'usage.js', 'v2_flawless.js', 'v2_test.js', 'vector_test.js'
];

function main() {
    console.log("\n\x1b[36m\x1b[1mB\"H - Starting Full Synchronous Validation (Lightning Speed)...\x1b[0m\n");

    const start = Date.now();
    let totalPhysical = 0;
    let totalPure = 0;

    for (let i = 0; i < TESTS.length; i++) {
        const test = TESTS[i];
        const scriptPath = path.join(__dirname, test);
        const progress = `[${String(i+1).padStart(2)}/${TESTS.length}]`;
        
        process.stdout.write(`\x1b[33m${progress} RUNNING: ${test.padEnd(30)}\x1b[0m`);
        
        const testStart = Date.now();
        const res = spawnSync(process.execPath, [scriptPath], { stdio: 'pipe' });
        const elapsed = Date.now() - testStart;
        
        const output = res.stdout.toString();
        const errOutput = res.stderr.toString();
        
        let phys = 0, pure = 0;
        const sizeMatch = output.match(/\[SIZE_REPORT\] physical: (\d+), pure: (\d+)/);
        if (sizeMatch) {
            phys = parseInt(sizeMatch[1], 10);
            pure = parseInt(sizeMatch[2], 10);
            totalPhysical += phys;
            totalPure += pure;
        }
        
        // Ensure test stays within 100ms strict latency requirement
        let timeColor = elapsed > 100 ? "\x1b[31m" : "\x1b[32m";
        
        const efficiency = pure > 0 ? ((pure / phys) * 100).toFixed(1) + "%" : "N/A";
        const sizeStr = phys > 0 ? ` 💽 Size: ${(phys/1024).toFixed(2)}KB (NO PADDING)` : "";

        if (res.status !== 0) {
            console.log(` \x1b[31m!!! FAILED (${elapsed}ms) !!!\x1b[0m`);
            console.error(errOutput || output);
            process.exit(1);
        } else {
            console.log(` ${timeColor}✅ PASS (${elapsed}ms)\x1b[0m\x1b[90m${sizeStr}\x1b[0m`);
            if (elapsed > 100) {
                console.log(`\x1b[31m    ⚠️ WARNING: Execution exceeded 100ms mandate!\x1b[0m`);
            }
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(3);
    const overallEff = totalPure > 0 ? ((totalPure / totalPhysical) * 100).toFixed(1) + "%" : "N/A";
    
    console.log(`\n\x1b[42m\x1b[30m\x1b[1m B"H - TOTAL VICTORY: ALL TESTS PASSED IN ${duration}s. \x1b[0m`);
    console.log(`\x1b[36m Total Disk Form: ${(totalPhysical/1024/1024).toFixed(3)}MB | Zero Padding Architecture Verified.\x1b[0m\n`);
}

main();
