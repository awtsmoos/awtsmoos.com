
// B"H
/**
 * @file run_all.js
 * @description THE mega SCRIPT. Runs every single test in the suite.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TESTS = [
    'type_confirmation.js', 
    'nested_literal_proof.js', 
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
    'object_order.js',      
    'range_test.js',        
    'consistency.js',       
    'api_methods_test.js',  
    'function_test.js',     
    'blog_engine_simulation.js',
    'graph_algo_test.js',
    'query_test.js',
    'query_complex.js',
    'live_test.js',
    'v2_flawless.js',
    'singularity.js', 
    'ultimate_chaos.js', 
    'final_boss.js', 
    'genesis.js', 
    'mega_simulation.js' 
];

function cleanupFiles() {
    console.log("\x1b[36mB\"H - Cleaning up test artifacts (.db and .wal files)...\x1b[0m");
    const dir = __dirname;
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
        if (file.endsWith('.db') || file.endsWith('.wal')) {
            try {
                fs.unlinkSync(path.join(dir, file));
                count++;
            } catch (e) {
                // Ignore busy files if any
            }
        }
    }
    console.log(`\x1b[36m    Deleted ${count} files.\x1b[0m`);
}

async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        console.log(`\n\x1b[33m>>> RUNNING: ${scriptName} <<<\x1b[0m`);
        
        const start = Date.now();
        const proc = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
        
        proc.on('close', (code) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            if (code === 0) {
                console.log(`\x1b[32m>>> PASSED: ${scriptName} (${duration}s) <<<\x1b[0m`);
                resolve();
            } else {
                console.error(`\x1b[31m>>> FAILED: ${scriptName} (${duration}s) (Exit Code: ${code}) <<<\x1b[0m`);
                reject(new Error(`${scriptName} failed`));
            }
        });
    });
}

async function main() {
    // Initial cleanup
    cleanupFiles();
    
    console.log("\n\x1b[36mB\"H - Starting Full System Validation Suite...\x1b[0m");
    const start = Date.now();

    for (const test of TESTS) {
        try {
            await runScript(test);
        } catch (e) {
            console.error("\n\x1b[41m!!! SYSTEM FAILURE DETECTED !!!\x1b[0m");
            cleanupFiles(); // Attempt cleanup even on failure
            process.exit(1);
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n\x1b[42m\x1b[30m B"H - ALL SYSTEMS NOMINAL. TOTAL VICTORY IN ${duration}s. \x1b[0m`);
    
    // Final cleanup
    cleanupFiles();
}

main();
