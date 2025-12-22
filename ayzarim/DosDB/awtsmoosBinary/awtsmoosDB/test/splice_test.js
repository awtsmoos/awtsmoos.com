
// B"H
/**
 * @file splice_test.js
 * @description
 *  Verifies the "Array-Like" capabilities of Collections:
 *  1. .splice() -> Insert, Delete, Replace in the middle of the list.
 *  2. Index Access -> db.list[5] resolving directly to the item.
 *  3. Page Splitting -> Forcing "Mitosis" by splicing large chunks.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'splice_test.db');

async function runTest() {
    console.log("B\"H - Starting Splice & Array Access Test...");

    // Clean Slate
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- SETUP ---
        console.log("\n[1] Setup: Creating List...");
        await db.createList(db.root, "items");
        
        // Initial State: [0, 1, 2, 3, 4]
        for(let i=0; i<5; i++) {
            await db.root.items.push(i);
        }
        await db.waitForIdle();
        
        let len = await db.root.items.length;
        console.log(`    Initial Length: ${len}`);
        if (len !== 5) throw new Error("Setup failed");

        
        // --- TEST 1: INSERT (Splice) ---
        console.log("\n[2] Testing Splice INSERT...");
        // Insert 99 at index 2
        // State before: [0, 1, 2, 3, 4]
        // Op: splice(2, 0, 99)
        // Expected: [0, 1, 99, 2, 3, 4]
        
        await db.root.items.splice(2, 0, 99);
        await db.waitForIdle();

        const item2 = await db.root.items[2];
        const item3 = await db.root.items[3];
        
        console.log(`    Index 2: ${item2} (Expected 99)`);
        console.log(`    Index 3: ${item3} (Expected 2)`);

        if (item2 !== 99 || item3 !== 2) throw new Error("Splice Insert Failed");
        
        len = await db.root.items.length;
        if (len !== 6) throw new Error(`Length mismatch. Expected 6, got ${len}`);
        console.log("    ✅ Splice Insert Passed");


        // --- TEST 2: DELETE (Splice) ---
        console.log("\n[3] Testing Splice DELETE...");
        // Remove 99 and 2 at index 2
        // State before: [0, 1, 99, 2, 3, 4]
        // Op: splice(2, 2)
        // Expected: [0, 1, 3, 4]

        await db.root.items.splice(2, 2);
        await db.waitForIdle();

        const check2 = await db.root.items[2];
        console.log(`    Index 2: ${check2} (Expected 3)`);
        
        if (check2 !== 3) throw new Error("Splice Delete Failed");
        
        len = await db.root.items.length;
        if (len !== 4) throw new Error(`Length mismatch. Expected 4, got ${len}`);
        console.log("    ✅ Splice Delete Passed");


        // --- TEST 3: REPLACE (Splice) ---
        console.log("\n[4] Testing Splice REPLACE...");
        // Replace 3 with "Three" at index 2
        // State before: [0, 1, 3, 4]
        // Op: splice(2, 1, "Three")
        // Expected: [0, 1, "Three", 4]

        await db.root.items.splice(2, 1, "Three");
        await db.waitForIdle();

        const val = await db.root.items[2];
        console.log(`    Index 2: ${val} (Expected "Three")`);

        if (val !== "Three") throw new Error("Splice Replace Failed");
        console.log("    ✅ Splice Replace Passed");


        // --- TEST 4: PAGE SPLITTING (Mitosis) ---
        console.log("\n[5] Testing Page Splitting (Mitosis)...");
        // Insert a huge chunk of data in the middle to force the page to split.
        // Current: [0, 1, "Three", 4]
        // Insert 200 items at index 1.
        
        const massiveArray = [];
        for(let i=0; i<200; i++) massiveArray.push(`bulk_${i}`);
        
        await db.root.items.splice(1, 0, ...massiveArray);
        await db.waitForIdle();

        // Check total length
        len = await db.root.items.length;
        console.log(`    New Length: ${len} (Expected 204)`);
        if (len !== 204) throw new Error("Bulk Splice Length Incorrect");

        // Check integrity of surrounding items
        const first = await db.root.items[0];     // 0
        const second = await db.root.items[1];    // bulk_0
        const mid = await db.root.items[100];     // bulk_99
        const lastBulk = await db.root.items[200]; // bulk_199
        const original = await db.root.items[201]; // 1 (Pushed after bulk)

        // Wait... [0, 1, "Three", 4]
        // Splice at 1 insert 200...
        // [0, bulk_0 ... bulk_199, 1, "Three", 4]
        // Index 0: 0
        // Index 1: bulk_0
        // Index 200: bulk_199
        // Index 201: 1
        
        console.log(`    Index 0: ${first}`);
        console.log(`    Index 1: ${second}`);
        console.log(`    Index 201: ${original}`);

        if (first !== 0) throw new Error("Head corrupted");
        if (second !== "bulk_0") throw new Error("Inserted start corrupted");
        if (lastBulk !== "bulk_199") throw new Error("Inserted end corrupted");
        if (original !== 1) throw new Error("Tail shifted incorrectly");

        console.log("    ✅ Page Splitting Logic Passed");


        // --- TEST 5: Array Access Syntax ---
        console.log("\n[6] Testing Direct Array Access Syntax...");
        // Verify we can access arbitrary indices
        const randomAccess = await db.root.items[150];
        console.log(`    db.root.items[150]: ${randomAccess}`);
        if (randomAccess !== "bulk_149") throw new Error("Random Access Failed");
        
        console.log("    ✅ Array Access Syntax Passed");

    } catch (e) {
        console.error("\n❌ SPLICE TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
        console.log("\nB\"H - Splice Tests Completed Successfully.");
    }
}

runTest();
