// B"H
/**
 * @file circular_stress.js
 * @description
 *  Tests the database's ability to handle the Impossible:
 *  Objects that contain themselves.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'v2_ouroboros.db');

async function runTest() {
    console.log("B\"H - Starting Ouroboros (Circular) Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] creating circular structures in memory...");
        const alpha = { name: "Alpha" };
        const omega = { name: "Omega" };
        
        alpha.link = omega;
        omega.link = alpha; // Loop!

        console.log("[2] Saving to Disk...");
        // This would crash JSON.stringify
        await db.root.set("cycle", alpha);
        await db.waitForIdle();
        console.log("    Save successful (No Stack Overflow).");

        console.log("[3] Reading Back...");
        const res = await db.root.cycle;
        console.log(`    Root: ${res.name}`);
        
        const link1 = await db.root.cycle.link;
        console.log(`    Link 1: ${link1.name} (Expected Omega)`);
        
        const link2 = await db.root.cycle.link.link;
        console.log(`    Link 2: ${link2.name} (Expected Alpha)`);
        
        const link3 = await db.root.cycle.link.link.link;
        console.log(`    Link 3: ${link3.name} (Expected Omega)`);

        if (link2.name !== "Alpha") throw new Error("Circular link broken");
        
        console.log("    ✅ Infinite Graph Traversal Verified.");

    } catch (e) {
        console.error("❌ CIRCULAR TEST FAILED:", e);
        process.exit(1);
    }
}

runTest();