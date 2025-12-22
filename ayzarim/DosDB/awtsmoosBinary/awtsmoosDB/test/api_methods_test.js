
// B"H
/**
 * @file api_methods_test.js
 * @description
 *  Verifies the standard iteration methods:
 *  - db.keys(handle)
 *  - db.values(handle)
 *  - db.entries(handle)
 *  - db.streamKeys(handle)
 *  - db.streamValues(handle)
 *  - db.streamEntries(handle)
 * 
 *  Tests across:
 *  1. Objects (Dictionary)
 *  2. Maps (B-Tree)
 *  3. Lists (Sequence)
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'api_methods.db');

async function runTest() {
    console.log("B\"H - Starting API Methods Test (keys/values/entries)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- 1. Dictionary (Object) ---
        console.log("\n[1] Testing Dictionary (Object)...");
        db.root.myObj = { a: 1, b: 2, c: 3 };
        await db.waitForIdle();

        const objKeys = await db.keys(db.root.myObj);
        console.log("    Keys:", JSON.stringify(objKeys));
        if (JSON.stringify(objKeys) !== '["a","b","c"]') throw new Error("Dictionary Keys Failed");

        const objValues = await db.values(db.root.myObj);
        console.log("    Values:", JSON.stringify(objValues));
        if (JSON.stringify(objValues) !== '[1,2,3]') throw new Error("Dictionary Values Failed");

        const objEntries = await db.entries(db.root.myObj);
        console.log("    Entries:", JSON.stringify(objEntries));
        if (objEntries[0][0] !== 'a' || objEntries[0][1] !== 1) throw new Error("Dictionary Entries Failed");
        
        console.log("    ✅ Dictionary Methods Passed");


        // --- 2. Map (B-Tree) ---
        console.log("\n[2] Testing Map (B-Tree)...");
        await db.createMap(db.root, "myMap");
        await db.root.myMap.set("z", 26);
        await db.root.myMap.set("a", 1);
        await db.root.myMap.set("m", 13);
        await db.waitForIdle();

        const mapKeys = await db.keys(db.root.myMap);
        console.log("    Keys (Sorted):", JSON.stringify(mapKeys));
        if (JSON.stringify(mapKeys) !== '["a","m","z"]') throw new Error("Map Keys Sort Failed");

        const mapValues = await db.values(db.root.myMap);
        console.log("    Values:", JSON.stringify(mapValues));
        if (JSON.stringify(mapValues) !== '[1,13,26]') throw new Error("Map Values Sort Failed");

        const mapEntries = await db.entries(db.root.myMap);
        if (mapEntries[1][0] !== 'm' || mapEntries[1][1] !== 13) throw new Error("Map Entries Failed");
        console.log("    ✅ Map Methods Passed");


        // --- 3. Sequence (List) ---
        console.log("\n[3] Testing Sequence (List)...");
        await db.createList(db.root, "myList");
        await db.root.myList.push("First");
        await db.root.myList.push("Second");
        await db.waitForIdle();

        const listKeys = await db.keys(db.root.myList);
        console.log("    Keys (Indices):", JSON.stringify(listKeys));
        if (JSON.stringify(listKeys) !== '[0,1]') throw new Error("List Keys Failed");

        const listValues = await db.values(db.root.myList);
        console.log("    Values:", JSON.stringify(listValues));
        if (JSON.stringify(listValues) !== '["First","Second"]') throw new Error("List Values Failed");

        const listEntries = await db.entries(db.root.myList);
        console.log("    Entries:", JSON.stringify(listEntries));
        
        // B"H: Verification of [Index, Value] format
        if (listEntries[1][0] !== 1 || listEntries[1][1] !== "Second") {
             console.error("Got:", listEntries[1]);
             throw new Error("List Entries Failed - Expected [1, 'Second']");
        }
        console.log("    ✅ Sequence Methods Passed");


        // --- 4. Stream Methods (Lazy) ---
        console.log("\n[4] Testing Stream (Lazy) Methods...");
        
        console.log("    Streaming Keys...");
        const streamedKeys = [];
        for await (const k of db.streamKeys(db.root.myObj)) {
            streamedKeys.push(k);
        }
        if (JSON.stringify(streamedKeys) !== '["a","b","c"]') throw new Error("streamKeys Failed");

        console.log("    Streaming Entries...");
        const streamedEntries = [];
        for await (const e of db.streamEntries(db.root.myList)) {
            streamedEntries.push(e);
        }
        if (streamedEntries.length !== 2 || streamedEntries[0][1] !== "First") throw new Error("streamEntries Failed");

        console.log("    ✅ Stream Methods Passed");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
