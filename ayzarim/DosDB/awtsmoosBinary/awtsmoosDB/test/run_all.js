
// B"H
/**
 * @file run_all.js
 * @description THE OMEGA SCRIPT. Runs every single test in the suite.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TESTS = [
    'comprehensive_v2.js',
    'stress_test.js',
    'nested.js',
    'graph_neo4j_test.js',
    'search_test.js',
    'vector_test.js',
    'persistence_stress.js',
    'splice_test.js',
    'circular_stress.js',
    'class_resurrection.js',
    'simulate_eternity.js',
    'universal_types.js',
    'ultimate_feature_test.js',
    
    // B"H: Added Advanced Simulations
    'blog_engine_simulation.js',
    'graph_algo_test.js',
    'query_test.js',
    'query_complex.js',
    'live_test.js',
    'v2_flawless.js',
    'singularity.js', // The Hishtalshelus
    'ultimate_chaos.js', // The Chaos
    'final_boss.js' // The Final Boss
];

async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        console.log(`\n\x1b[33m>>> RUNNING: ${scriptName} <<<\x1b[0m`);
        
        const proc = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
        
        proc.on('close', (code) => {
            if (code === 0) {
                console.log(`\x1b[32m>>> PASSED: ${scriptName} <<<\x1b[0m`);
                resolve();
            } else {
                console.error(`\x1b[31m>>> FAILED: ${scriptName} (Exit Code: ${code}) <<<\x1b[0m`);
                reject(new Error(`${scriptName} failed`));
            }
        });
    });
}

async function main() {
    console.log("\x1b[36mB\"H - Starting Full System Validation Suite...\x1b[0m");
    const start = Date.now();

    for (const test of TESTS) {
        try {
            await runScript(test);
        } catch (e) {
            console.error("\n\x1b[41m!!! SYSTEM FAILURE DETECTED !!!\x1b[0m");
            process.exit(1);
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n\x1b[42m\x1b[30m B"H - ALL SYSTEMS NOMINAL. TOTAL VICTORY IN ${duration}s. \x1b[0m`);
}

main();
