// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'v2_fractal.db');

async function runTest() {
    console.log("B\"H - Starting V2 Fractal Engine Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] Testing Root Dictionary...");
        db.root.greeting = "Hello V2";
        await db.waitForIdle();
        
        const val = await db.root.greeting;
        console.log(`    Read: ${val}`);
        if (val !== "Hello V2") throw new Error("Dictionary Set/Get failed");

        console.log("\n[2] Testing Infinite Sequence...");
        // B"H: New assignment paradigm
        db.root.list = new db.List(); 
        await db.waitForIdle();
        
        console.log("    Pushing items...");
        await db.root.list.push("Item A");
        await db.root.list.push("Item B");
        
        const item0 = await db.root.list[0];
        const item1 = await db.root.list[1];
        console.log(`    list[0]: ${item0}, list[1]: ${item1}`);
        
        if (item0 !== "Item A") throw new Error("Sequence Push/Get failed");

        console.log("\n[3] Testing Fractal Nesting...");
        db.root.level1 = {}; 
        // B"H: Assignment of marker class forces the vessel
        db.root.level1.innerList = new db.List();
        const inner = db.root.level1.innerList; 
        await inner.push("Deep Data");
        
        const deepVal = await db.root.level1.innerList[0];
        console.log(`    Deep Value: ${deepVal}`);
        if (deepVal !== "Deep Data") throw new Error("Fractal Nesting failed");

        console.log("\n[4] Testing Cross-Node Delete (The Gap Test)...");
        db.root.bigList = new db.List();
        // Insert enough to fill multiple pages (250 per page, insert 1000)
        for(let i=0; i<1000; i++) await db.root.bigList.push(i);
        
        // Delete 500 items from index 100 (Spans pages)
        await db.root.bigList.splice(100, 500);
        
        const len = await db.root.bigList.length;
        console.log(`    Length after delete: ${len}`); // Expected 500
        if (len !== 500) throw new Error("Cross-Node Delete Failed");
        
        const checkVal = await db.root.bigList[100]; // Should be 600
        console.log(`    New Item 100: ${checkVal}`);
        if (checkVal !== 600) throw new Error("Delete Shift Failed");

        console.log("\nB\"H - V2 Engine Operational.");

    } catch (e) {
        console.error("❌ V2 TEST FAILED:", e);
    }
}

runTest();