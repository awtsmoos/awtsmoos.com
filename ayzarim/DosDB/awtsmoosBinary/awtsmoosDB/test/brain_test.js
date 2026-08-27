// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/brain_test.js

const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'brain_memory.db');

async function runTest() {
    console.log("B\"H - Starting Artificial Brain Test...");

    const args = process.argv.slice(2);
    const ggufPath = args.find(a => a.endsWith('.gguf'));
    
    if (!ggufPath) {
        console.error("Please provide path to .gguf file as argument.");
        process.exit(1);
    }

    // Cleanup
    try { fs.unlinkSync(DB_PATH); fs.unlinkSync(DB_PATH + '.wal'); } catch(e){}

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] Awakening the Brain...");
        const brain = await db.ai.loadBrain(ggufPath);

        // Turn 1: Teach it something
        console.log("\n[2] Interaction 1: Teaching...");
        process.stdout.write("AI: ");
        await brain.chat("My name is Yackov and I like coding.", (t) => process.stdout.write(t));
        console.log("\n(Memory saved to Disk)");

        await db.waitForIdle(); // Ensure vector is indexed

        // Turn 2: Ask about it (Relies on Retrieval)
        console.log("\n[3] Interaction 2: Recall...");
        process.stdout.write("AI: ");
        // The prompt does NOT contain "Yackov". The AI must pull it from DB vector search.
        await brain.chat("What is my name and what do I like?", (t) => process.stdout.write(t));
        console.log("\n");

        console.log("✅ Brain Test Complete. If AI answered 'Yackov', RAG is working.");

    } catch (e) {
        console.error("❌ BRAIN FAILURE:", e);
    } finally {
        await db.close();
    }
}

runTest();