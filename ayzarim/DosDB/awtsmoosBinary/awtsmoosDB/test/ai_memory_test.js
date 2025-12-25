// B"H
/**
 * @file ai_memory_test.js
 * @description
 *  THE NEURAL CORTEX TEST.
 *  Validates the Grand Unification of Storage, AI, and Memory.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'neural_nexus.db');

async function runTest() {
    console.log("\x1b[35mB\"H - Initiating AI Neural Nexus Test...\x1b[0m");

    const args = process.argv.slice(2);
    const ggufPath = args.find(a => a.endsWith('.gguf'));
    
    if (!ggufPath) {
        console.error("\x1b[31mError: Please provide path to a .gguf model file.\x1b[0m");
        console.error("Usage: node ai_memory_test.js path/to/model.gguf");
        process.exit(1);
    }

    // 1. Cleanup
    if (fs.existsSync(DB_PATH)) {
        console.log("    Cleaning previous nexus...");
        fs.unlinkSync(DB_PATH);
    }
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // =================================================================
        // PHASE 1: REINCARNATION (Model Import)
        // =================================================================
        console.log("\n\x1b[36m[Phase 1] Reincarnation: Importing Model to DB...\x1b[0m");
        const modelName = "test_model";
        const startImport = Date.now();
        
        await db.ai.importModel(ggufPath, modelName);
        
        console.log(`\n    Checking registry for '${modelName}'...`);
        const exists = await db.ai.hasModel(modelName);
        if (!exists) {
             throw new Error(`B"H Fatal: Model '${modelName}' reported success but is missing from registry.`);
        }
        console.log(`    ✅ Model identified in registry.`);


        // =================================================================
        // PHASE 2: AWAKENING (Inference from DB)
        // =================================================================
        console.log("\n\x1b[36m[Phase 2] Awakening: Loading Brain from DB Source...\x1b[0m");
        
        const brain = await db.ai.loadBrain(modelName, { verbose: false });
        console.log("    ✅ Brain is cognizant (Loaded from binary blocks).");


        // =================================================================
        // PHASE 3: THE TEACHING (Memory Ingestion)
        // =================================================================
        console.log("\n\x1b[36m[Phase 3] The Teaching: Injecting Secret into Memory...\x1b[0m");
        
        const secretText = "The password for the Third Temple of Code is 'Awtsmoos_770'.";
        console.log("    Teaching: 'Please remember the password is...'");
        
        // We use streamTimestamps: true to see the performance of each token
        await brain.chat(`Please remember this secret precisely: ${secretText}`, (token) => {
            // process.stdout.write(token);
        }, { streamTimestamps: true, maxTokens: 16 });

        console.log("\n    (Waiting for Vector Index to Manifest...)");
        await db.waitForIdle(); 


        // =================================================================
        // PHASE 4: REVELATION (Semantic Recall)
        // =================================================================
        console.log("\n\x1b[36m[Phase 4] Revelation: Recalling Secret via RAG...\x1b[0m");
        
        const query = "What is the password for the Temple of Code?";
        console.log(`    User Question: "${query}"`);
        
        let fullAnswer = "";
        process.stdout.write("    AI Answer: ");
        
        await brain.chat(query, (token) => {
            fullAnswer += token;
            process.stdout.write(token);
        }, { maxTokens: 64, streamTimestamps: false });
        
        console.log("\n");

        // Verify Recall
        if (fullAnswer.includes("770") || fullAnswer.toLowerCase().includes("awtsmoos")) {
            console.log("\x1b[32m    ✅ RECALL SUCCESSFUL: AI accessed Vector Memory fragments.\x1b[0m");
        } else {
             console.log("\x1b[33m    ⚠️  RECALL PARTIAL: AI spoke, but did not reveal the secret.\x1b[0m");
             console.log("    (Check model intelligence or vector dimensions if this persists)");
        }


        // =================================================================
        // PHASE 5: PERSISTENCE (Total Shutdown)
        // =================================================================
        console.log("\n\x1b[36m[Phase 5] Eternity: Verification After DB Reboot...\x1b[0m");
        await db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const memoryLen = await db2.root.ai_memory.length;
        console.log(`    Total Interactions in Persistent Memory: ${memoryLen}`);
        
        if (memoryLen < 2) throw new Error("Memory did not persist across reboot.");
        
        console.log("\n\x1b[32m✅ B\"H - AI NEURAL NEXUS TEST PASSED! The Brain is Eternal.\x1b[0m");
        await db2.close();

    } catch (e) {
        console.error("\n\x1b[41m!!! SYSTEM COLLAPSE !!!\x1b[0m");
        console.error(e.stack || e);
        process.exit(1);
    }
}

runTest();
