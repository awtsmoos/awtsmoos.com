// B"H
/**
 * @file v2_flawless.js
 * @description
 *  The Final Proof of the AwtsmoosDB V2 Engine.
 *  Checks:
 *  1. Cross-Type Nesting (List inside Map inside List)
 *  2. Binary Data Integrity (Buffer preservation)
 *  3. Massive Sequence Operations (Multi-page splicing)
 *  4. Persistence & Rehydration
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'v2_flawless.db');

const log = (msg) => console.log(`\x1b[36m[V2 FLAWLESS]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Initiating Flawless Validation Protocol (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- PHASE 1: The Structure ---
        log("Phase 1: Deep Nested Fractal Construction");
        
        db.root.universe = {}; 
        await db.waitForIdle();
        
        // Root -> Dictionary -> Sequence -> Map -> Dictionary
        // B"H: New marker assignment paradigm
        db.root.universe.galaxies = new db.List();
        
        const galaxyData = { 
            name: "Milky Way", 
            planets: {} 
        };
        
        // Push Object into List
        await db.root.universe.galaxies.push(galaxyData);
        await db.waitForIdle();
        
        // Modify that deeply nested object
        const milkyWayVal = await db.root.universe.galaxies[0];
        assert(milkyWayVal.name === "Milky Way", "Deep read verified");

        // Replacement Strategy for List Items
        galaxyData.name = "Andromeda";
        await db.root.universe.galaxies.splice(0, 1, galaxyData);
        await db.waitForIdle();
        
        const check = await db.root.universe.galaxies[0];
        assert(check.name === "Andromeda", "Deep List Object Replacement works");


        // --- PHASE 2: The Data (Binary) ---
        log("Phase 2: Binary Data Integrity");
        const secret = Buffer.from("Hidden Light Of Creation");
        db.root.secretData = secret;
        await db.waitForIdle();
        
        const readBack = await db.root.secretData;
        assert(Buffer.isBuffer(readBack), "Returned type is Buffer");
        assert(readBack.toString() === "Hidden Light Of Creation", "Buffer content match");


        // --- PHASE 3: The Infinite (Sequence Stress) ---
        log("Phase 3: Infinite Sequence Stress (The Gap)");
        // Force multi-page splits (Page size ~4KB)
        
        db.root.numbers = new db.List();
        const bulk = [];
        for(let i=0; i<2000; i++) bulk.push(i);
        
        await db.root.numbers.push("Start");
        await db.root.numbers.splice(1, 0, ...bulk); // Insert 2000 items at index 1
        await db.root.numbers.push("End");
        
        await db.waitForIdle();
        
        let len = await db.root.numbers.length;
        assert(len === 2002, `Sequence Length Correct (${len})`);
        
        let startVal = await db.root.numbers[0];
        let midVal = await db.root.numbers[1001]; // Should be 1000
        let endVal = await db.root.numbers[2001];
        
        assert(startVal === "Start", "Head Integrity");
        assert(midVal === 1000, `Mid Integrity (Got ${midVal})`);
        assert(endVal === "End", "Tail Integrity");
        
        // Massive Delete (Cross-Page)
        log("    Deleting 1500 items from the middle...");
        // Index 1 is '0'. We want to delete 0..1499.
        await db.root.numbers.splice(1, 1500);
        await db.waitForIdle();
        
        len = await db.root.numbers.length;
        assert(len === 502, `Post-Delete Length Correct (${len})`); 
        
        // Verify Gap Closure
        // Index 1 was '0'. Now it should be '1500'.
        const newIndex1 = await db.root.numbers[1];
        assert(newIndex1 === 1500, `Gap Closed Correctly (Got ${newIndex1})`);


        // --- PHASE 4: Persistence ---
        log("Phase 4: Persistence & Rehydration");
        await db.pager.close(); // Close DB 1
        
        const db2 = new AwtsmoosDB(DB_PATH); // Open DB 2
        await db2.open();
        
        const pLen = await db2.root.numbers.length;
        assert(pLen === 502, "Persistence: Length Verified");
        
        const pVal = await db2.root.numbers[1];
        assert(pVal === 1500, "Persistence: Data Verified");
        
        const pBin = await db2.root.secretData;
        assert(pBin.toString() === "Hidden Light Of Creation", "Persistence: Binary Verified");

        log("--- FLAWLESS VICTORY ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runTest();