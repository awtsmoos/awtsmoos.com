// B"H
// Usage & Verification Script for AwtsmoosDB
// Demonstrates: Initialization, Massive Write, Pagination, and Random Access.

const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

async function runTest() {
    const dbPath = path.join(__dirname, 'test.awtsmoosDB');
    
    // Clean up previous test
    try { fs.unlinkSync(dbPath); } catch(e) {}

    console.log("B\"H - Starting AwtsmoosDB Test");
    console.log("--------------------------------");

    const db = new AwtsmoosDB(dbPath);
    await db.open();

    // 1. Massive Insert (Sequential Speed Test)
    console.log("\n[1] Inserting 1,000 items...");
    console.time("Insert Time");
    
    for (let i = 0; i < 1000; i++) {
        // Create a mix of small and large data
        const val = i % 10 === 0 
            ? { id: i, type: "complex", data: "A".repeat(5000) } // 5KB (Overflow Chain)
            : { id: i, type: "simple", msg: "Hello World" };     // Small (Inline/Mini)
            
        await db.set(`key_${i}`, val);
        
        if (i % 200 === 0) process.stdout.write(".");
    }
    console.log("");
    console.timeEnd("Insert Time");

    // 2. Pagination Test (The "Console View")
    // We want to read items 500-505.
    // In a bad DB, this would read 0-500 first. 
    // In AwtsmoosDB, it should jump straight to the relevant Page bucket.
    
    console.log("\n[2] Pagination Test (Items 500-505)...");
    console.time("Pagination Time");
    
    // 500 is in the 6th page (Indices 500-599)
    // Note: Our current API `getConsoleView` takes a Page Index.
    // Page 0 = 0-99, Page 5 = 500-599.
    const page5 = await db.getConsoleView(5); 
    
    console.timeEnd("Pagination Time");
    console.log(`Loaded Page 5. Count: ${page5.length}`);
    console.log("First 3 items in Page 5 (Metadata Only):");
    console.table(page5.slice(0, 3));

    // 3. Deep Retrieval Test (Resolving Pointers)
    console.log("\n[3] Deep Retrieval (Reading 'key_500')...");
    // key_500 was a large object (5KB string), so this tests Sequential Chain reading.
    
    console.time("Read Large Object");
    const val = await db.get("key_500");
    console.timeEnd("Read Large Object");

    if (val && val.data && val.data.length === 5000) {
        console.log("SUCCESS: Retrieved 5KB object correctly.");
    } else {
        console.error("FAILURE: Object corrupted or incorrect length.", val);
    }

    // 4. Persistence Test
    console.log("\n[4] Persistence Test (Re-opening DB)...");
    const db2 = new AwtsmoosDB(dbPath);
    await db2.open();
    const check = await db2.get("key_999");
    
    if (check && check.id === 999) {
        console.log("SUCCESS: Data persisted correctly.");
    } else {
        console.error("FAILURE: Could not read key_999 after restart.");
    }
}

runTest().catch(console.error);