
// B"H
/**
 * @file consistency.js
 * @description
 *  Verifies that AwtsmoosDB provides strong Read-After-Write consistency
 *  WITHOUT needing to call waitForIdle().
 *  
 *  The Locking mechanism should queue the Read operation until the asynchronous
 *  Write operation completes, ensuring the user never sees stale data.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'consistency_check.db');

async function runTest() {
    console.log("B\"H - Starting Consistency Check...");

    // Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        console.log("\n[1] Basic Read-After-Write...");
        // 1. Fire Write (Async, fire-and-forget from JS perspective)
        db.root.status = "Written";
        
        // 2. Immediate Read (Should block internally until Write is done)
        const val = await db.root.status;
        
        console.log(`    Wrote 'Written', Read '${val}'`);
        
        if (val !== "Written") {
            throw new Error(`Consistency Fail! Expected 'Written', got '${val}'`);
        }
        console.log("    ✅ Instant consistency verified.");


        console.log("\n[2] High-Speed Toggle (Race Condition Check)...");
        // We will flip a boolean rapidly and ensure the read always matches the LAST write.
        
        db.root.flag = false;
        
        // Fire 5 writes in sequence (queued)
        db.root.flag = true;
        db.root.flag = false;
        db.root.flag = true;
        db.root.flag = false;
        db.root.flag = true; // Last one is TRUE
        
        // Immediate Read
        const finalFlag = await db.root.flag;
        console.log(`    Final Flag Value: ${finalFlag}`);
        
        if (finalFlag !== true) {
            throw new Error(`Queue Order Fail! Expected true, got ${finalFlag}`);
        }
        console.log("    ✅ Write Queue ordering verified.");


        console.log("\n[3] Deep Nested Consistency...");
        await db.root.createMap("config");
        
        // Nested write
        db.root.config.level = 1;
        // Overwrite
        db.root.config.level = 9000;
        
        const level = await db.root.config.level;
        console.log(`    Deep Level: ${level}`);
        
        if (level !== 9000) throw new Error("Nested consistency failed");
        console.log("    ✅ Nested consistency verified.");

        console.log("\nB\"H - The System is Consistent. No waitForIdle() required for logic.");

    } catch (e) {
        console.error("\n❌ CONSISTENCY FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
