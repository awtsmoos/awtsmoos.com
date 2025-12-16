
// B"H
/**
 * @file range_test.js
 * @description
 *  Demonstrates the power of the .range(start, end) method.
 *  Unlike a standard loop with `if(k < start) continue`, this method
 *  uses the B-Tree index to "teleport" (Seek) directly to the start key
 *  and stop reading disk immediately after the end key.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'range_seek.db');

async function runTest() {
    console.log("B\"H - Starting Range Seek Test...");

    // 1. Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        console.log("\n[1] Populating Lexicon (A-Z)...");
        await db.root.createMap("lexicon");

        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        
        // Insert in random order to prove B-Tree sorting works
        const shuffled = [...alphabet].sort(() => Math.random() - 0.5);

        for (const char of shuffled) {
            const key = `word_${char}`;
            await db.root.lexicon.set(key, `Definition of ${char.toUpperCase()}`);
        }
        
        await db.waitForIdle();
        console.log("    Inserted 26 keys (randomly).");

        // --- THE RANGE QUERY ---
        const START = "word_m"; // Start at M
        const END = "word_o";   // End at O
        
        console.log(`\n[2] Executing Range Query: ["${START}" ... "${END}"]`);
        console.log("    (The engine should skip A-L entirely and stop after O)");

        let count = 0;
        const results = [];

        // .range() yields { key, value } objects
        for await (const entry of db.root.lexicon.range(START, END)) {
            console.log(`    FOUND: ${entry.key} -> "${entry.value}"`);
            results.push(entry.key);
            count++;
        }

        // --- VERIFICATION ---
        const expected = ["word_m", "word_n", "word_o"];
        
        if (results.length !== expected.length) {
            throw new Error(`Expected ${expected.length} items, got ${results.length}`);
        }

        for (let i = 0; i < expected.length; i++) {
            if (results[i] !== expected[i]) {
                throw new Error(`Mismatch at index ${i}: Expected ${expected[i]}, Got ${results[i]}`);
            }
        }

        console.log(`\n    ✅ Success! Found exactly: ${results.join(", ")}`);
        console.log("    Seek efficiency confirmed.");

    } catch (e) {
        console.error("\n❌ RANGE TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
