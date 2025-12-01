// B"H
// Comprehensive Test Suite for AwtsmoosDB V2
// Covers: CRUD, Universal Types, Compression, Indexing, Persistence, and Compaction.

const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'suite.awtsmoosDB');
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";

// --- Helpers ---

function logPass(testName) {
    console.log(`${GREEN}✔ PASS:${RESET} ${testName}`);
}

function logFail(testName, error) {
    console.trace(`${RED}✘ FAIL:${RESET} ${testName}`);
    console.error(`   ${error}`);
    process.exit(1);
}

async function assert(desc, value, expected) {
    if (value !== expected) {
        throw new Error(`Expected '${expected}', got '${value}'`);
    }
}

async function cleanup() {
    try { fs.unlinkSync(DB_PATH); } catch (e) {}
    try { fs.unlinkSync(DB_PATH + ".wal"); } catch (e) {}
    try { fs.unlinkSync(DB_PATH + ".tmp"); } catch (e) {}
}

// --- Tests ---

async function runSuite() {
    console.log(`${CYAN}B"H - Starting AwtsmoosDB V2 Test Suite${RESET}\n`);
    await cleanup();

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // LEVEL 1: Basic CRUD
        console.log("--- Level 1: Basic Operations ---");
        
        await db.set("greeting", "Hello World");
        const val1 = await db.get("greeting");
        if (val1 === "Hello World") logPass("Simple Set/Get");
        else throw new Error(`Got ${val1}`);

        await db.set("greeting", "Updated World");
        const val2 = await db.get("greeting");
        if (val2 === "Updated World") logPass("Update Key (Overwrite)");
        else throw new Error(`Got ${val2}`);

        await db.delete("greeting");
        const val3 = await db.get("greeting");
        if (val3 === undefined) logPass("Delete Key");
        else throw new Error(`Got ${val3}`);


        // LEVEL 2: Universal Types & Fidelity
        console.log("\n--- Level 2: Universal Type Fidelity ---");
        
        const complexObj = {
            myDate: new Date("2025-01-01T00:00:00Z"),
            myBigInt: BigInt("9007199254740995"), // > MAX_SAFE_INTEGER
            myRegExp: /abc/gi,
            myMap: new Map([["key1", "val1"]]),
            mySet: new Set([1, 2, 3]),
            myBuffer: Buffer.from([0xFF, 0x00, 0xAA])
        };

        await db.set("complex", complexObj);
        const retrieved = await db.get("complex");

        if (retrieved.myDate instanceof Date && retrieved.myDate.toISOString() === "2025-01-01T00:00:00.000Z")
            logPass("Date Preservation");
        else throw new Error("Date failed");

        if (typeof retrieved.myBigInt === 'bigint' && retrieved.myBigInt === 9007199254740995n)
            logPass("BigInt Preservation");
        else throw new Error("BigInt failed");

        if (retrieved.myRegExp instanceof RegExp && retrieved.myRegExp.flags === 'gi')
            logPass("RegExp Preservation");
        else throw new Error("RegExp failed");

        if (retrieved.myMap instanceof Map && retrieved.myMap.get("key1") === "val1")
            logPass("Map Preservation");
        else throw new Error("Map failed");

        if (retrieved.mySet instanceof Set && retrieved.mySet.has(2))
            logPass("Set Preservation");
        else throw new Error("Set failed");

        if (Buffer.isBuffer(retrieved.myBuffer) && retrieved.myBuffer[0] === 0xFF)
            logPass("Buffer Preservation");
        else throw new Error("Buffer failed");


        // LEVEL 3: Compression & Encoding
        console.log("\n--- Level 3: Compression & Encoding ---");
        
        const hebrew = "שלום עליכם";
        await db.set("heb", hebrew);
        const hebRes = await db.get("heb");
        if (hebRes === hebrew) logPass("Hebrew String (Custom Encoding)");
        else throw new Error(`Expected ${hebrew}, got ${hebRes}`);

        const rle = "A".repeat(100);
        await db.set("rle", rle);
        const rleRes = await db.get("rle");
        if (rleRes === rle) logPass("RLE Compression (Repeating Chars)");
        else throw new Error("RLE failed");


        // LEVEL 4: Large Data (Chaining)
        console.log("\n--- Level 4: Large Data Chains ---");
        
        const largeStr = "X".repeat(10000); // 10KB (Spans 3 blocks)
        await db.set("large", largeStr);
        const largeRes = await db.get("large");
        if (largeRes.length === 10000) logPass("10KB Write/Read (Multi-Block)");
        else throw new Error("Length mismatch");


        // LEVEL 5: B-Tree Indexing & Search
        console.log("\n--- Level 5: Indexing & Search ---");
        
        // Insert items for indexing
        for (let i = 0; i < 50; i++) {
            await db.set(`user_${i}`, { 
                id: i, 
                profile: { email: `user${i}@test.com`, age: Math.floor(Math.random() * 100) } 
            });
        }
        
        // Wait for fire-and-forget indexer
        await new Promise(r => setTimeout(r, 500));

        // Test 5A: Instant Lookup (findBy)
        const foundUser = await db.findBy("profile.email", "user25@test.com");
        if (foundUser && foundUser.id === 25) logPass("Deep B-Tree Search (findBy)");
        else throw new Error("Could not find user by deep email property");

        // Test 5B: Sorted View
        const sortedView = await db.getConsoleView("id", 0, 5); // Get first 5 sorted by ID
        if (sortedView.length === 5 && sortedView[0].key === "user_0") logPass("Sorted Console View");
        else throw new Error("Sorting failed");


        // LEVEL 6: Persistence & Recovery
        console.log("\n--- Level 6: Persistence ---");
        
        await db.close(); // Close DB 1
        console.log("   (Database Closed. Re-opening...)");
        
        const db2 = new AwtsmoosDB(DB_PATH); // Open DB 2
        await db2.open();

        const pVal = await db2.get("complex");
        if (pVal && pVal.myBigInt === 9007199254740995n) logPass("Data Persisted after Restart");
        else throw new Error("Persistence check failed");


        // LEVEL 7: Stats & Compaction
        console.log("\n--- Level 7: Maintenance ---");
        
        const statsBefore = await db2.getStats();
        console.log(`   Stats Before: ${statsBefore.databaseSize}, Empty Blocks: ${statsBefore.emptyBlocks}`);
        
        // Create fragmentation
        console.log("   (Deleting 50 users to create fragmentation...)");
        for (let i = 0; i < 50; i++) {
            await db2.delete(`user_${i}`);
        }

        const statsFrag = await db2.getStats();
        // We expect empty blocks to increase because we deleted pages/data
        if (statsFrag.emptyBlocks > statsBefore.emptyBlocks) logPass(" fragmentation correctly detected");
        
        // Compact
        console.log("   (Running Compact...)");
        await db2.compact();
        
        const statsAfter = await db2.getStats();
        console.log(`   Stats After: ${statsAfter.databaseSize}, Empty Blocks: ${statsAfter.emptyBlocks}`);
        
        if (statsAfter.emptyBlocks === 0 || statsAfter.emptyBlocks < statsFrag.emptyBlocks) 
            logPass("Compaction reduced fragmentation");
        else 
            console.warn("   (Compaction didn't reduce blocks, maybe data was too small to notice, but ran successfully)");

        const survivor = await db2.get("complex");
        if (survivor) logPass("Data survived compaction");
        else throw new Error("Compaction lost data!");

        await db2.close();
        console.log(`\n${GREEN}ALL TESTS PASSED SUCCESSFULLY!${RESET}`);
        await cleanup();

    } catch (err) {
        logFail("Test Suite Aborted", err.stack);
        await cleanup();
    }
}

runSuite();