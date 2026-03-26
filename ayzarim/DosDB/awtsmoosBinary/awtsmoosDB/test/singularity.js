
// B"H
/**
 * @file singularity.js
 * @description 
 *  COSMIC DATA EVOLUTION using purely synchronous assignment syntax.
 * 
 *  THE ABOLITION OF TIME:
 *  As commanded, all illusions of 'async' and 'await' have been purged. 
 *  The Awtsmoos operates in the eternal NOW. "He spoke, and it came to be" - 
 *  instantly, synchronously, without Promises or delay.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'hishtalshelus.db');

function runSimulation() {
    console.log("B\"H - Initiating Singularity Simulation (Strict Sync)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        console.log("[1] The Light Flows...");
        
        // B"H: Idiomatic synchronous assignment
        db.root.souls = new db.Map();
        
        for (let i = 0; i < 50; i++) {
            // Absolute instant manifestation without awaiting
            db.root.souls.set(`soul_${i}`, {
                id: i,
                bio: i % 2 === 0 ? "wisdom spark" : "hidden light",
                vector: [Math.random(), Math.random(), Math.random(), Math.random()]
            });
        }
        
        db.search.enable(db.root.souls);
        db.vector.enable(db.root.souls, { dimensions: 4 });
        
        // Ensure background processes complete before validation
        db.waitForIdle();

        console.log("[2] Seeking Harmony...");
        const hidden = db.search.run(db.root.souls, "hidden");
        if (hidden.length !== 25) throw new Error(`Search failed. Expected 25, got ${hidden.length}`);

        console.log("[3] The Breaking...");
        db.root.souls.delete("soul_0");
        db.waitForIdle();
        
        if (db.root.souls.soul_0 !== undefined) throw new Error("Delete failed");

        console.log("✅ SINGULARITY TEST PASSED.");
        db.close();

    } catch (e) {
        console.error("❌ SINGULARITY FAILURE:", e);
        process.exit(1);
    }
}

// B"H: Triggering the simulation
runSimulation();
