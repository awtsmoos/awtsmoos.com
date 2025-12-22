
// B"H
/**
 * @file object_order.js
 * @description
 *  Verifies the distinction between:
 *  1. createMap() -> B-Tree (Sorted Keys)
 *  2. createObject() -> Dictionary (Insertion Ordered Keys)
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'order_test.db');

async function runTest() {
    console.log("B\"H - Starting Object Order vs Map Order Test...");

    // Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        const keys = ["zebra", "apple", "mango", "banana"];

        // --- TEST 1: MAP (Sorted) ---
        console.log("\n[1] Testing createMap (Expected: Sorted A-Z)...");
        await db.createMap(db.root, "myMap");
        
        for(const k of keys) {
            await db.root.myMap.set(k, 1);
        }
        await db.waitForIdle();

        // B"H: Updated API
        const mapKeys = await db.keys(db.root.myMap);
        
        console.log("    Input: ", keys.join(", "));
        console.log("    Map Output:", mapKeys.join(", "));
        
        const expectedSorted = [...keys].sort();
        if (JSON.stringify(mapKeys) !== JSON.stringify(expectedSorted)) {
            throw new Error("Map is NOT sorted!");
        }
        console.log("    ✅ Map is Sorted.");


        // --- TEST 2: OBJECT (Insertion Order) ---
        console.log("\n[2] Testing createObject (Expected: Insertion Order)...");
        await db.createObject(db.root, "myObj");
        
        for(const k of keys) {
            await db.root.myObj.set(k, 1);
        }
        await db.waitForIdle();

        // B"H: Updated API
        const objKeys = await db.keys(db.root.myObj);
        
        console.log("    Input: ", keys.join(", "));
        console.log("    Obj Output:", objKeys.join(", "));
        
        if (JSON.stringify(objKeys) !== JSON.stringify(keys)) {
            throw new Error("Object is NOT insertion ordered!");
        }
        console.log("    ✅ Object preserves Insertion Order.");

    } catch (e) {
        console.error("\n❌ ORDER TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
