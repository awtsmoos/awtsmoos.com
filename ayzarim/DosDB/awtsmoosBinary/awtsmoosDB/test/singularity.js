// B"H
/**
 * @file singularity.js
 * @description COSMIC DATA EVOLUTION using assignment syntax.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'hishtalshelus.db');

async function runSimulation() {
    console.log("B\"H - Initiating Singularity Simulation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] The Light Flows...");
        // B"H: Idiomatic assignment
        db.root.souls = new db.Map();
        
        for (let i = 0; i < 50; i++) {
            await db.root.souls.set(`soul_${i}`, {
                id: i,
                bio: i%2===0 ? "wisdom spark" : "hidden light",
                vector: [Math.random(), Math.random(), Math.random(), Math.random()]
            });
        }
        
        await db.search.enable(db.root.souls);
        await db.vector.enable(db.root.souls, { dimensions: 4 });
        await db.waitForIdle();

        console.log("[2] Seeking Harmony...");
        const hidden = await db.search.run(db.root.souls, "hidden");
        if (hidden.length !== 25) throw new Error("Search failed");

        console.log("[3] The Breaking...");
        await db.root.souls.delete("soul_0");
        await db.waitForIdle();
        if (await db.root.souls.soul_0 !== undefined) throw new Error("Delete failed");

        console.log("✅ SINGULARITY TEST PASSED.");
        await db.close();

    } catch (e) {
        console.error("❌ SINGULARITY FAILURE:", e);
        process.exit(1);
    }
}
runSimulation();