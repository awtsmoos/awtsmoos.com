
// B"H
/**
 * @file persistence_stress.js
 * @description 
 *  Advanced Stress Test for AwtsmoosDB.
 *  Focuses on "Gilgul" (Reincarnation/Persistence) and "Gashmius" (Heavy Material Data).
 *  
 *  1. Writes Large Binary Blobs (Multiblock chains).
 *  2. Closes the DB connection completely.
 *  3. Re-opens (Reloads) from disk.
 *  4. Verifies byte-perfect data integrity.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'awtsmoos_persistence.db');

const COLORS = {
    Reset: "\x1b[0m",
    Green: "\x1b[32m",
    Red: "\x1b[31m",
    Yellow: "\x1b[33m",
    Cyan: "\x1b[36m"
};

function log(msg) {
    console.log(`${COLORS.Cyan}[PersistenceTest]${COLORS.Reset} ${msg}`);
}

function success(msg) {
    console.log(`${COLORS.Green}✅ ${msg}${COLORS.Reset}`);
}

function fail(msg, err) {
    console.error(`${COLORS.Red}❌ TEST FAILED: ${msg}${COLORS.Reset}`);
    if (err) console.error(err);
    process.exit(1);
}

async function runTest() {
    console.log(`B"H - Starting Persistence & Large Blob Test...`);

    // --- CLEANUP ---
    try {
        await fs.unlink(DB_PATH);
        await fs.unlink(DB_PATH + ".wal");
    } catch (e) {} // Ignore if missing

    // --- PHASE 1: Creation & Heavy Writing ---
    log("Phase 1: Creation & Heavy Writing");
    let db = new AwtsmoosDB(DB_PATH);
    await db.open(); // B"H: FIX - Open database before use
    
    // 1. Generate Random Buffer
    // Optimized: 128KB is enough to trigger multi-block chains (4KB blocks) but faster for test.
    const LARGE_SIZE = 128 * 1024; 
    const randomBuffer = crypto.randomBytes(LARGE_SIZE);
    
    // 2. Write Complex Data
    try {
        // Create 'storage' as a Map (BTree container)
        log("Creating 'storage' Map...");
        await db.createMap(db.root, 'storage');
        
        log(`Writing 128KB Binary Blob to 'root.storage.heavystone'...`);
        // Now we can assign to it because 'storage' is a BTree
        db.root.storage.heavystone = randomBuffer;

        log("Writing Metadata...");
        // B"H: We assign a plain object. Depending on internals, this might be stored as JSON or a BTree.
        db.root.meta = {
            created: new Date(),
            author: "Yackov",
            tags: ["Torah", "Code", "Awtsmoos"]
        };

        log("Creating 'logs' Collection...");
        await db.createList(db.root, 'logs');

        log("Writing Collection Data...");
        // Push items
        for(let i=0; i<25; i++) {
            await db.root.logs.push({ id: i, msg: `Log Entry ${i}` });
        }

        // --- BARRIER ---
        // Vital: Submit an empty task to the execute queue and await it.
        // This ensures all previous "fire-and-forget" proxy writes (heavystone, meta) are finished.
        log("Waiting for write queue to drain...");
        await db.waitForIdle(); 

    } catch (e) {
        fail("Phase 1 Write Failed", e);
    }

    // --- PHASE 2: Shutdown (Histalkus) ---
    log("Phase 2: Closing Database (Simulating Server Restart)...");
    await db.close();
    db = null; // Remove reference
    log("Database Closed.");

    // --- PHASE 3: Resurrection (Techiyas HaMeisim) ---
    log("Phase 3: Re-opening Database from Disk...");
    const db2 = new AwtsmoosDB(DB_PATH);
    await db2.open(); // B"H: FIX - Open database before use

    try {
        // 1. Verify Metadata
        // NOTE: If stored as a BTree, `await db2.root.meta` will now resolve to a JS object via toJSON().
        const meta = await db2.root.meta;
        if (!meta) throw new Error("Metadata is undefined/null");
        
        // Handle potential case where toJSON returns a wrapped structure or partial
        const author = meta.author || (meta.get && await meta.get('author'));
        const tags = meta.tags;

        if (author !== "Yackov" || !tags || tags[2] !== "Awtsmoos") {
            console.error("Received Metadata:", JSON.stringify(meta, null, 2));
            throw new Error("Metadata JSON mismatch after restart.");
        }
        success("Metadata JSON persisted correctly.");

        // 2. Verify Collection
        const logs = await db2.root.logs.slice(0, 100);
        if (logs.length !== 25 || logs[24].msg !== "Log Entry 24") {
            throw new Error(`Collection mismatch. Expected 25 items, got ${logs.length}.`);
        }
        success("Collection persisted correctly.");

        // 3. Verify Large Blob (The Heavy Test)
        log("Reading back 128KB Binary Blob...");
        const retrievedBuffer = await db2.root.storage.heavystone;

        if (!Buffer.isBuffer(retrievedBuffer)) {
             throw new Error(`Expected Buffer, got ${typeof retrievedBuffer}`);
        }

        if (retrievedBuffer.length !== LARGE_SIZE) {
            throw new Error(`Size Mismatch! Wrote ${LARGE_SIZE}, Read ${retrievedBuffer.length}`);
        }

        if (Buffer.compare(retrievedBuffer, randomBuffer) !== 0) {
            throw new Error("Content Mismatch! The blob corrupted during storage/retrieval.");
        }
        success("128KB Binary Blob persisted byte-perfectly!");

    } catch (e) {
        fail("Phase 3 Verification Failed", e);
    } finally {
        await db2.close();
    }

    console.log(`\n${COLORS.Green}B"H - Persistence Test Completed Successfully.${COLORS.Reset}`);
}

runTest();
