// B"H
/**
 * @file suite.js
 * @description
 * THE COSMIC PROVING GROUND.
 * 
 * In the beginning, there was the Code, and the Code was null.
 * Then came the Suite, to separate the Bug from the Feature,
 * the Deterministic from the Race Condition.
 * 
 * We do not merely "assert"; we challenge the very fabric of the database's reality.
 * We pour data like water, fire, and earth into the binary vessels to see if they shatter.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DB_PATH = path.join(__dirname, 'awtsmoos_suite.db');
const WAL_PATH = DB_PATH + ".wal";

// --- The Scribe of Logs ---
const log = (msg) => console.log(`\x1b[36m[SUITE]\x1b[0m ${msg}`);
const success = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const fail = (msg, err) => {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
    if (err) console.error(err);
    process.exit(1);
};

// --- The Cleaner (Tzimtzum) ---
// Retracts previous existence to make space for the new.
function cleanup() {
    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(WAL_PATH)) fs.unlinkSync(WAL_PATH);
        log("The void has been cleared.");
    } catch (e) {
        log("Warning: Cleanup encountered resistance: " + e.message);
    }
}

async function runSuite() {
    log("B\"H - Initiating Test Suite Sequence...");
    cleanup();

    const db = new AwtsmoosDB(DB_PATH, { verbose: false });

    try {
        // ---------------------------------------------------------
        // TRIAL 1: GENESIS (Initialization)
        // ---------------------------------------------------------
        log("--- TRIAL 1: GENESIS ---");
        await db.open();
        success("Database opened successfully from the void.");


        // ---------------------------------------------------------
        // TRIAL 2: THE ALPHABET (Primitives)
        // ---------------------------------------------------------
        log("\n--- TRIAL 2: THE ALPHABET (Primitives) ---");
        
        await db.set("aleph", "A string of simple light");
        await db.set("bet", 42);
        await db.set("gimel", true);
        await db.set("dalet", null);
        
        const resA = await db.get("aleph");
        const resB = await db.get("bet");
        const resC = await db.get("gimel");
        const resD = await db.get("dalet");

        if (resA !== "A string of simple light") throw new Error(`String mismatch: ${resA}`);
        if (resB !== 42) throw new Error(`Number mismatch: ${resB}`);
        if (resC !== true) throw new Error(`Boolean mismatch: ${resC}`);
        if (resD !== null) throw new Error(`Null mismatch: ${resD}`);
        
        success("Primitives stored and retrieved intact.");


        // ---------------------------------------------------------
        // TRIAL 3: THE MERKAVAH (Complex Objects)
        // ---------------------------------------------------------
        log("\n--- TRIAL 3: THE MERKAVAH (Complex Structures) ---");

        const chariot = {
            wheels: 4,
            driver: "Metatron",
            power: { type: "fire", intensity: 9000 },
            angels: ["Gabriel", "Michael", "Raphael"]
        };

        await db.set("chariot", chariot);
        const resChariot = await db.get("chariot");

        // Deep equality check (manual for simplicity)
        assert.deepStrictEqual(resChariot, chariot, "The Chariot was corrupted in transit!");
        success("Complex JSON Objects preserved with structure.");


        // ---------------------------------------------------------
        // TRIAL 4: THE LEVIATHAN (Large Data > 4KB)
        // ---------------------------------------------------------
        log("\n--- TRIAL 4: THE LEVIATHAN (Large Data) ---");
        // Force the Allocator to chain blocks (Block Size is 4096). 
        // We create a ~10KB string.
        const scaleStr = "X".repeat(1024 * 10); 
        await db.set("leviathan", scaleStr);
        
        const resLevi = await db.get("leviathan");
        if (resLevi !== scaleStr) throw new Error(`Large Data Size Mismatch. Got ${resLevi?.length}, expected ${scaleStr.length}`);
        
        success("Large Data (Chain Allocation) successfully handled.");


        // ---------------------------------------------------------
        // TRIAL 5: GILGUL (Updates / Reincarnation)
        // ---------------------------------------------------------
        log("\n--- TRIAL 5: GILGUL (Updates) ---");
        
        await db.set("soul", "Level 1: Nefesh");
        let soul = await db.get("soul");
        if (soul !== "Level 1: Nefesh") throw new Error("Initial set failed");

        await db.set("soul", "Level 2: Ruach");
        soul = await db.get("soul");
        
        // Note: If this fails, the DB isn't reading the latest entry.
        if (soul !== "Level 2: Ruach") throw new Error(`Update Failed. Returned old value: ${soul}`);
        
        success("Key updated and retrieved new value.");


        // ---------------------------------------------------------
        // TRIAL 6: RESURRECTION (Persistence)
        // ---------------------------------------------------------
        log("\n--- TRIAL 6: RESURRECTION (Persistence) ---");
        
        log("Closing the Gates (DB Close)...");
        await db.close();

        log("Reopening the Gates...");
        const db2 = new AwtsmoosDB(DB_PATH, { verbose: false });
        await db2.open();

        const resurrectedChariot = await db2.get("chariot");
        const resurrectedLevi = await db2.get("leviathan");

        assert.deepStrictEqual(resurrectedChariot, chariot, "The Chariot did not survive the restart.");
        if (resurrectedLevi !== scaleStr) throw new Error("The Leviathan shrank in the darkness.");

        success("Data survived the shutdown and restart cycle.");
        
        // ---------------------------------------------------------
        // TRIAL 7: THE HIDDEN LIGHT (Binary Buffers)
        // ---------------------------------------------------------
        log("\n--- TRIAL 7: OR GANUZ (Buffers) ---");
        
        const secretBuf = Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]);
        await db2.set("secret", secretBuf);
        
        const resSecret = await db2.get("secret");
        
        if (!Buffer.isBuffer(resSecret)) throw new Error("Result is not a Buffer");
        if (resSecret.compare(secretBuf) !== 0) throw new Error(`Buffer mismatch. Got ${resSecret.toString('hex')}`);
        
        success("Binary Buffers stored and retrieved correctly.");

        await db2.close();
        log("\n--- ALL TRIALS PASSED ---");
        log("The vessel is complete. The Awtsmoos rests within.");

    } catch (err) {
        fail("The vessel shattered during the trials.", err);
    } finally {
        // Optional: Cleanup
        // cleanup(); 
    }
}

runSuite();