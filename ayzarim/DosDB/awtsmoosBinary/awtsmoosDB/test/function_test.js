
// B"H
/**
 * @file function_test.js
 * @description
 *  Verifies the "Callable Handle" feature.
 *  Functions stored on disk should be executable directly via the handle.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'function_exec.db');

async function runTest() {
    console.log("B\"H - Starting Function Execution Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] Storing Functions...");
        
        // 1. Simple Math
        db.root.add = (a, b) => a + b;
        
        // 2. Logic
        db.root.greet = function(name) { return "Hello " + name; };
        
        await db.waitForIdle();
        console.log("    Functions saved.");

        console.log("\n[2] Executing directly from Disk...");
        
        // Call it like a normal function!
        const sum = await db.root.add(5, 7);
        console.log(`    Result of add(5, 7): ${sum}`);
        
        const greeting = await db.root.greet("World");
        console.log(`    Result of greet("World"): "${greeting}"`);

        if (sum !== 12) throw new Error("Math function failed");
        if (greeting !== "Hello World") throw new Error("Logic function failed");
        
        console.log("    ✅ Function Execution Verified.");

        // --- Persistence Check ---
        console.log("\n[3] Persistence Check (Reboot)...");
        await db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const sum2 = await db2.root.add(10, 10);
        console.log(`    Result of add(10, 10) after reboot: ${sum2}`);
        
        if (sum2 !== 20) throw new Error("Persistence failed");
        
        console.log("    ✅ Functions survived reboot.");
        await db2.close();

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    }
}

runTest();
