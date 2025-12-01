// B"H
// Simple Test with Logging Enabled
const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'simple_test.db');

async function runTest() {
    console.log("B\"H - Starting Simple Test...\n");

    // Clean up previous run
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    // Initialize with VERBOSE logging
    const db = new AwtsmoosDB(DB_PATH, { verbose: true });
    
    try {
        await db.open();

        console.log("\n--- STEP 1: SET ---");
        await db.set("test_key", "Hello Awtsmoos");

        console.log("\n--- STEP 2: GET ---");
        const val = await db.get("test_key");

        console.log("\n--- RESULT ---");
        if (val === "Hello Awtsmoos") {
            console.log("✅ SUCCESS: Retrieved correct value.");
        } else {
            console.error(`❌ FAILURE: Expected 'Hello Awtsmoos', got '${val}'`);
        }

    } catch (err) {
        console.error("❌ CRITICAL ERROR:", err);
    } finally {
        await db.close();
        // Cleanup
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");
    }
}

runTest();