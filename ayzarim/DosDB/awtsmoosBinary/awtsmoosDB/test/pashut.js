
// B"H
/**
 * @file pashut.js
 * @description The simplest proof of existence, now operating at the speed of Light (Sync).
 */
const AwtsmoosDB = require('../index.js');
const Pager = require('../core/pager/firmament.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'simple_test.db');

function runTest() {
    console.log("B\"H - Starting Simple Test...\n");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    console.log("[Test] Running Disk I/O Sanity Check...");
    const pager = new Pager(DB_PATH);
    pager.init();
    
    const testBuf = Buffer.alloc(4096);
    testBuf.write("SANITY_CHECK_DATA", 0);
    
    pager.writeExact(5 * 4096, testBuf); 
    pager.fsync(true); 
    
    const stats = fs.statSync(DB_PATH);
    console.log(`[Test] File Size after Write: ${stats.size} bytes`);
    
    const readBuf = pager.readExact(5 * 4096, 4096);
    
    if (!readBuf) {
        console.error("❌ SANITY CHECK FAILED: readExact returned null.");
        pager.close();
        process.exit(1);
    }

    const readStr = readBuf.subarray(0, 17).toString();
    if (readStr !== "SANITY_CHECK_DATA") {
        console.error(`❌ SANITY CHECK FAILED: Data mismatch. Got '${readStr}'`);
        pager.close();
        process.exit(1);
    }
    console.log("✅ Sanity Check Passed. Disk I/O working.\n");
    pager.close();

    const db = new AwtsmoosDB(DB_PATH, { verbose: true });
    
    try {
        db.open();
        console.log("\n--- STEP 1: SET ---");
        db.root.test_key = "Hello Awtsmoos";

        console.log("\n--- STEP 2: GET ---");
        // Direct assignment reading calls the Navigator traps
        const valHandle = db.root.test_key;

        // Tikkun: We execute the resolve sequence explicitly to fetch value
        const val = valHandle && valHandle.__resolve__ ? valHandle.__resolve__() : valHandle;

        console.log("\n--- RESULT ---");
        if (val === "Hello Awtsmoos") {
            console.log("✅ SUCCESS: Retrieved correct value.");
        } else {
            console.error(`❌ FAILURE: Expected 'Hello Awtsmoos', got '${val}'`);
            process.exit(1);
        }

    } catch (err) {
        console.error("❌ CRITICAL ERROR:", err);
        process.exit(1);
    } finally {
        db.close();
    }
}

runTest();
