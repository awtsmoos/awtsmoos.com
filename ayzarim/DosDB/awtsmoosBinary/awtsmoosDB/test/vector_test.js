
// B"H
/**
 * @file vector_test.js
 * @description Verifies HNSW Vector Search.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'vector_test.db');

const log = (msg) => console.log(`\x1b[36m[VECTOR TEST]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Starting Vector Engine Test (Unified)...");

    // B"H: CRITICAL FIX - Must delete .wal file too, otherwise stale logs corrupt the new DB
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        log("[1] Creating Memories Collection...");
        await db.root.createList("memories");
        
        log("[2] Enabling Vector Index (Dim 4, Cosine)...");
        await db.root.memories.enableVectorIndex({ dimensions: 4, metric: 'cosine' });
        await db.waitForIdle();

        const data = [
            { id: "A", vec: [1, 0, 0, 0], txt: "Alpha" },
            { id: "B", vec: [0, 1, 0, 0], txt: "Beta" },
            { id: "C", vec: [0.9, 0.1, 0, 0], txt: "Gamma" }
        ];

        log("[3] Inserting Data...");
        for(const d of data) {
            await db.root.memories.push(d);
        }
        await db.waitForIdle();

        log("[4] Searching Nearest to [1, 0, 0, 0]...");
        const results = await db.root.memories.nearest([1, 0, 0, 0], 2);
        
        console.log("    Results:", JSON.stringify(results.map(r => ({ id: r.item.id, score: r.score })), null, 2));
        
        assert(results.length === 2, "Found 2 nearest");
        assert(results[0].item.id === "A", "First is A");
        assert(results[1].item.id === "C", "Second is C");
        
        log("--- VECTOR TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
