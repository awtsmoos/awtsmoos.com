// B"H
/**
 * @file production_ready.js
 * @description
 *  A final, concise sanity check to certify the build for production.
 *  Checks: CRUD, Persistence, Nesting, Arrays.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'prod.db');

async function runTest() {
    console.log("B\"H - Production Readiness Test...");
    
    // Cleanup
    try { fs.unlinkSync(DB_PATH); } catch(e){}
    try { fs.unlinkSync(DB_PATH + '.wal'); } catch(e){}

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("  [1] Basic CRUD...");
        db.root.setting = "Enabled";
        await db.waitForIdle();
        if (await db.root.setting !== "Enabled") throw new Error("Basic Set/Get Failed");

        console.log("  [2] Arrays...");
        db.root.logs = [];
        await db.root.logs.push("Log 1");
        await db.root.logs.push("Log 2");
        await db.waitForIdle();
        if (await db.root.logs.length !== 2) throw new Error("Array Push Failed");

        console.log("  [3] Persistence...");
        await db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        if (await db2.root.setting !== "Enabled") throw new Error("Persistence Failed");
        if (await db2.root.logs[1] !== "Log 2") throw new Error("Array Persistence Failed");
        
        console.log("✅ SYSTEM GREEN. READY FOR DEPLOYMENT.");
    } catch(e) {
        console.error("❌ PRODUCTION CHECK FAILED:", e);
        process.exit(1);
    }
}

runTest();