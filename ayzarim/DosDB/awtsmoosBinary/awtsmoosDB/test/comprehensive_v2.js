
// B"H
/**
 * @file comprehensive_v2.js
 * @description
 *  The Universal Test Suite for AwtsmoosDB.
 *  CONFIRMS: No dependencies on 'v2' folder exist.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'v2_universal.db');

const log = (msg) => console.log(`\x1b[36m[V2 UNIFIED TEST]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Initializing Universal V2 Test on Unified Kernel...");

    // 1. Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    // B"H: Enabled Debug to see the light move
    const db = new AwtsmoosDB(DB_PATH, { debug: true}); // Disabled debug for cleaner output unless failing
    await db.open();

    try {
        // --- TEST 1: Primitives & Types ---
        log("--- TEST 1: The Building Blocks (Primitives) ---");
        db.root.primitives = {
            num: 42.5,
            str: "Infinite Light",
            bool: true,
            buff: Buffer.from("Mystic"),
            nil: null,
            undef: undefined
        };
        await db.waitForIdle();

        const prim = await db.root.primitives;
        assert(prim.num === 42.5, "Number stored correctly");
        assert(prim.str === "Infinite Light", "String stored correctly");
        assert(prim.bool === true, "Boolean stored correctly");
        assert(Buffer.isBuffer(prim.buff) && prim.buff.toString() === "Mystic", "Buffer stored correctly");
        
        // --- TEST 2: Fractal Nesting ---
        log("--- TEST 2: Fractal Nesting ---");
        await db.createMap(db.root, "fractal");
        await db.root.fractal.set("node_1", []); // List inside Map
        
        const listHandle = db.root.fractal.node_1;
        await listHandle.push({ id: 1, meta: {} }); // Object inside List
        
        // Access via index
        const item0 = db.root.fractal.node_1[0];
        item0.meta.active = true;
        await db.waitForIdle();
        
        const deepCheck = await db.root.fractal.node_1[0];
        if (deepCheck.meta.active !== true) {
             console.error("Deep Check State:", JSON.stringify(deepCheck, null, 2));
        }
        assert(deepCheck.meta.active === true, "Deep nested modification persisted");

        // --- TEST 3: Infinite Sequence Stress (Cross-Page) ---
        log("--- TEST 3: Infinite Sequence Stress ---");
        db.root.seq = [];
        const FILL_SIZE = 1000;
        const bulk = [];
        for(let i=0; i<FILL_SIZE; i++) bulk.push(i);
        
        await db.root.seq.splice(0, 0, ...bulk);
        await db.waitForIdle();
        
        let len = await db.root.seq.length;
        assert(len === FILL_SIZE, `Length is ${len} (Expected ${FILL_SIZE})`);

        log("    Deleting 500 items at index 200...");
        await db.root.seq.splice(200, 500);
        await db.waitForIdle();
        
        len = await db.root.seq.length;
        assert(len === 500, `Length after delete is ${len} (Expected 500)`);
        
        const item200 = await db.root.seq[200];
        assert(item200 === 700, `Item at 200 is ${item200} (Expected 700)`);

        // --- TEST 4: Dictionary Mechanics ---
        log("--- TEST 4: Dictionary Mechanics ---");
        await db.createMap(db.root, "dict_test"); 
        db.root.myDict = {};
        
        for(let i=0; i<50; i++) {
            await db.root.myDict.set(`key_${i}`, i);
        }
        await db.waitForIdle();
        
        // B"H: New API usage db.keys() returns Array
        const keys = await db.keys(db.root.myDict);
        const keyCount = keys.length;
        
        assert(keyCount === 50, `Dictionary Key Count ${keyCount}`);
        
        await db.root.myDict.delete("key_0");
        const checkDel = await db.root.myDict.key_0;
        assert(checkDel === undefined, "Key deletion confirmed");

        // --- TEST 5: Persistence ---
        log("--- TEST 5: Persistence & Recovery ---");
        await db.pager.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const recPrim = await db2.root.primitives.str;
        assert(recPrim === "Infinite Light", "Primitives recovered");
        
        const recSeqVal = await db2.root.seq[200];
        assert(recSeqVal === 700, "Sequence content recovered");

        log("--- UNIFIED ENGINE: ALL SYSTEMS FUNCTIONAL ---");

    } catch (e) {
        console.error("CRITICAL TEST FAILURE:", e);
        process.exit(1);
    }
}

runTest();
