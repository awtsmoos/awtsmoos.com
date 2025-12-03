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
    
    // 1. Generate Random Buffer (~512KB)
    // This forces the allocator to use 'allocateLarge' and create a Block Chain.
    const LARGE_SIZE = 512 * 1024; 
    const randomBuffer = crypto.randomBytes(LARGE_SIZE);
    
    // 2. Write Complex Data
    try {
        // Create 'storage' as a Map (BTree container)
        log("Creating 'storage' Map...");
        await db.root.createMap('storage');
        
        log(`Writing 512KB Binary Blob to 'root.storage.heavystone'...`);
        // Now we can assign to it because 'storage' is a BTree
        db.root.storage.heavystone = randomBuffer;

        log("Writing Metadata...");
        db.root.meta = {
            created: new Date(),
            author: "Yackov",
            tags: ["Torah", "Code", "Awtsmoos"]
        };

        log("Creating 'logs' Collection...");
        await db.root.createList('logs');

        log("Writing Collection Data...");
        // Push some items
        for(let i=0; i<50; i++) {
            await db.root.logs.push({ id: i, msg: `Log Entry ${i}` });
        }

        // Wait a bit to ensure async writes in queue complete (safety margin)
        await new Promise(r => setTimeout(r, 500));

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

    try {
        // 1. Verify Metadata
        const meta = await db2.root.meta;
        if (meta.author !== "Yackov" || meta.tags[2] !== "Awtsmoos") {
            throw new Error("Metadata JSON mismatch after restart.");
        }
        success("Metadata JSON persisted correctly.");

        // 2. Verify Collection
        const logs = await db2.root.logs.slice(0, 100);
        if (logs.length !== 50 || logs[49].msg !== "Log Entry 49") {
            throw new Error(`Collection mismatch. Expected 50 items, got ${logs.length}.`);
        }
        success("Collection persisted correctly.");

        // 3. Verify Large Blob (The Heavy Test)
        log("Reading back 512KB Binary Blob...");
        const retrievedBuffer = await db2.root.storage.heavystone;

        if (!Buffer.isBuffer(retrievedBuffer)) {
            // Note: Value might be retrieved as Uint8Array depending on node version/buffer implementation, but AwtsmoosDB should return Buffer.
            // If it returns Uint8Array, convert.
            if (retrievedBuffer instanceof Uint8Array) {
                // Good
            } else {
                throw new Error(`Expected Buffer/Uint8Array, got ${typeof retrievedBuffer}`);
            }
        }

        if (retrievedBuffer.length !== LARGE_SIZE) {
            throw new Error(`Size Mismatch! Wrote ${LARGE_SIZE}, Read ${retrievedBuffer.length}`);
        }

        if (Buffer.compare(retrievedBuffer, randomBuffer) !== 0) {
            throw new Error("Content Mismatch! The blob corrupted during storage/retrieval.");
        }
        success("512KB Binary Blob persisted byte-perfectly!");

    } catch (e) {
        fail("Phase 3 Verification Failed", e);
    } finally {
        await db2.close();
    }

    console.log(`\n${COLORS.Green}B"H - Persistence Test Completed Successfully.${COLORS.Reset}`);
}

runTest();