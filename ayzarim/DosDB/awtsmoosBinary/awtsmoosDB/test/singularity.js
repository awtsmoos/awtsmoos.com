
// B"H
/**
 * @file singularity_test.js
 * @description
 *  SEDER HISHTALSHELUS (The Order of Evolution).
 *  
 *  A Kabbalistic simulation testing the limits of AwtsmoosDB.
 *  It simulates the flow of light (Data) into vessels (Structures),
 *  the breaking of vessels (Stress/Concurrency), and the repair (Persistence/Recovery).
 * 
 *  UPDATED: Scaled down for faster debugging with Verbose Logging.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'hishtalshelus.db');

// --- The Ten Sefiros of Logging ---
const COLORS = {
    Keter: "\x1b[1m\x1b[37m", // White/Bold
    Chesed: "\x1b[34m", // Blue
    Gevurah: "\x1b[31m", // Red
    Tiferet: "\x1b[35m", // Purple
    Netzach: "\x1b[32m", // Green
    Hod: "\x1b[33m", // Orange/Yellow
    Yesod: "\x1b[36m", // Cyan
    Malchut: "\x1b[30m\x1b[47m", // Black on White
    Reset: "\x1b[0m",
    Debug: "\x1b[90m" // Gray
};

const log = (sefirah, msg) => console.log(`${COLORS[sefirah]}[${sefirah}] ${msg}${COLORS.Reset}`);
const debug = (msg) => console.log(`${COLORS.Debug}[DEBUG] ${msg}${COLORS.Reset}`);

const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[41m[DIN] JUDGMENT FAILED: ${msg}\x1b[0m`);
        process.exit(1);
    }
};

async function runSimulation() {
    log("Keter", "B\"H - Initiating Seder Hishtalshelus (Cosmic Data Evolution)...");

    // 1. TZIMTZUM (Contraction/Cleanup)
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    // B"H: Enabled DEBUG mode for verbose internal logs
    const db = new AwtsmoosDB(DB_PATH, { debug: false});
    await db.open();

    try {
        // =================================================================
        // PHASE 1: CHESED (The Infinite Flow)
        // Injecting Souls with Vectors, Text, and Deep Data.
        // =================================================================
        
        // B"H: Reduced scale for debugging
        const TOTAL_SOULS = 30;
        const BATCH_SIZE = 10; 
        
        log("Chesed", `The Light Flows: Creating ${TOTAL_SOULS} Souls...`);
        
        await db.root.createMap("souls");
        
        const startChesed = Date.now();

        for (let b = 0; b < TOTAL_SOULS; b += BATCH_SIZE) {
            await db.batch(async () => {
                for (let i = 0; i < BATCH_SIZE; i++) {
                    const idx = b + i;
                    const vec = [
                        Math.sin(idx), 
                        Math.cos(idx), 
                        Math.tan(idx/1000), 
                        Math.random()
                    ];
                    
                    const soul = {
                        id: `neshamah_${idx}`,
                        name: `Soul Number ${idx}`,
                        yichud: {
                            level: Math.floor(idx / 100),
                            shoresh: { origin: "Adam Kadmon", sparks: idx }
                        },
                        // "hidden light" appears on ODD indices (1, 3, 5...)
                        bio: idx % 2 === 0 ? "A spark of wisdom from the upper worlds." : "A hidden light in the darkness.",
                        vector: vec
                    };
                    
                    await db.root.souls.set(`neshamah_${idx}`, soul);
                }
            });
            process.stdout.write(COLORS.Chesed + "." + COLORS.Reset);
        }
        
        const durChesed = Date.now() - startChesed;
        console.log("");
        log("Chesed", `Creation complete in ${durChesed}ms.`);
        
        log("Chesed", "Forming the Vessels (Building Indexes)...");
        const startIndex = Date.now();
        
        // Enable indexes AFTER population
        debug("Enabling Vector Index...");
        await db.root.souls.enableVectorIndex({ dimensions: 4, metric: 'cosine' });
        
        debug("Enabling Text Search Index...");
        await db.root.souls.enableSearch();
        
        await db.waitForIdle();
        
        log("Chesed", `Indexing complete in ${Date.now() - startIndex}ms.`);
        
        const count = await db.root.souls.length;
        debug(`Total Souls Counted in DB: ${count}`);
        assert(count === TOTAL_SOULS, `Soul Count Mismatch: ${count}`);

        // PRE-CHECK: Verify Vector Search works BEFORE deletion
        const TEST_TARGET_ID = `neshamah_15`;
        log("Chesed", `[Pre-Check] Testing Vector Search for ${TEST_TARGET_ID}...`);
        const preCheckSoul = await db.root.souls[TEST_TARGET_ID];
        const preCheckRes = await db.root.souls.nearest(preCheckSoul.vector, 5);
        log("Chesed", `[Pre-Check] Found ${preCheckRes.length} results.`);
        assert(preCheckRes.length === 5, "Pre-check Vector k-NN failed.");


        // =================================================================
        // PHASE 2: GEVURAH (The Restriction)
        // Deletion. Cutting the first portion of souls.
        // =================================================================
        const REMOVED_COUNT = 10;
        
        log("Gevurah", `The Judgment: Tzimtzum (Pruning ${REMOVED_COUNT} Souls [0-${REMOVED_COUNT-1}])...`);
        
        await db.batch(async () => {
            for(let i=0; i<REMOVED_COUNT; i++) {
                await db.root.souls.delete(`neshamah_${i}`);
            }
        });
        
        await db.waitForIdle();
        
        const remaining = await db.root.souls.length;
        log("Gevurah", `Remaining Souls: ${remaining}`);
        assert(remaining === TOTAL_SOULS - REMOVED_COUNT, `Gevurah failed to restrict correctly. Expected ${TOTAL_SOULS - REMOVED_COUNT}, got ${remaining}`);
        
        // Check Index Integrity
        debug("Verifying deletions...");
        const soul0 = await db.root.souls.neshamah_0;
        assert(soul0 === undefined, "Soul 0 should be deleted.");
        
        const soulFirstAlive = await db.root.souls[`neshamah_${REMOVED_COUNT}`];
        assert(soulFirstAlive !== undefined, `Soul ${REMOVED_COUNT} should exist.`);


        // =================================================================
        // PHASE 3: TIFERET (Harmony & Search)
        // Testing Full-Text and Vector Search on the remaining set.
        // =================================================================
        log("Tiferet", "The Harmony: Seeking the Hidden Light...");
        
        // 1. Text Search
        // We deleted 0..9. Remaining: 10..29 (20 souls).
        // "hidden light" is on odd indices.
        // Odd indices in range [10..29]: 11, 13, 15... 29.
        // Count = 10.
        
        debug("Executing Text Search: 'hidden light'...");
        const hiddenSparks = await db.root.souls.search("hidden light");
        log("Tiferet", `Found ${hiddenSparks.length} hidden sparks via Text Search.`);
        
        if (hiddenSparks.length !== 10) {
             debug("Search Result IDs: " + hiddenSparks.map(s => s.id).join(', '));
        }
        
        assert(hiddenSparks.length === 10, `Text Search logic flawed. Expected 10, got ${hiddenSparks.length}`);

        // 2. Vector Search (Chochmah)
        // Target: Soul 15 (Safe, as we only deleted up to 9)
        const TARGET_ID = `neshamah_15`;
        
        log("Tiferet", `Retrieving Pivot Soul: ${TARGET_ID}...`);
        const pivotSoul = await db.root.souls[TARGET_ID]; 
        
        if (!pivotSoul) {
            console.error(`Pivot Soul ${TARGET_ID} NOT FOUND in DB!`);
            process.exit(1);
        }
        
        debug(`Pivot Vector: [${pivotSoul.vector.map(n=>n.toFixed(2)).join(', ')}]`);
        
        log("Tiferet", `Seeking neighbors for ${pivotSoul.name}...`);
        
        const nearest = await db.root.souls.nearest(pivotSoul.vector, 5);
        
        log("Tiferet", `Found ${nearest.length} kindred spirits.`);
        nearest.forEach((n, i) => debug(`   ${i+1}. ${n.item.id} (Score: ${n.score.toFixed(4)})`));
        
        assert(nearest.length === 5, `Vector k-NN failed. Found ${nearest.length} results.`);
        assert(nearest[0].item.id === pivotSoul.id, `Self-identity not preserved. Top result is ${nearest[0].item.id}, expected ${pivotSoul.id}`);


        // =================================================================
        // PHASE 4: YESOD (Foundation / Graph)
        // =================================================================
        log("Yesod", "The Connection: Wiring the Web of Life...");
        
        await db.root.createMap("network");
        const NETWORK_SIZE = 10; // Scaled down
        const EDGES_PER_NODE = 2;
        
        await db.batch(async () => {
            for(let i=0; i<NETWORK_SIZE; i++) {
                await db.root.network.createMap(`node_${i}`);
                await db.root.network[`node_${i}`].set("energy", Math.random());
            }
            for(let i=0; i<NETWORK_SIZE; i++) {
                const source = db.root.network[`node_${i}`];
                for(let j=0; j<EDGES_PER_NODE; j++) {
                    const targetIdx = (i + j + 1) % NETWORK_SIZE;
                    const target = db.root.network[`node_${targetIdx}`];
                    await source.relateTo(target, "GILGUL", { strength: Math.random() });
                }
            }
        });
        
        log("Yesod", "Calculating PageRank...");
        const ranks = await db.graph.pageRank({ iterations: 10 });
        const tzadik = ranks[0];
        
        log("Yesod", `The Tzadik is ${tzadik.id} with score ${tzadik.score.toFixed(4)}`);
        assert(ranks.length > 0, "PageRank yielded no results.");


        // =================================================================
        // PHASE 5: HOD (Splendor / Concurrency)
        // =================================================================
        log("Hod", "The Breaking: 50 Concurrent Updates...");
        
        await db.root.createMap("fractal");
        const ATTACKERS = 50;
        const promises = [];
        
        for(let i=0; i<ATTACKERS; i++) {
            promises.push(
                db.root.fractal.set(`shard_${i}`, { chaos_level: i })
            );
        }
        
        await Promise.all(promises);
        await db.waitForIdle();
        
        let shardCount = 0;
        for await (const shard of db.root.fractal) shardCount++;
        log("Hod", `Fractal Shards Counted: ${shardCount}`);
        assert(shardCount === ATTACKERS, `Concurrency Fracture! Expected ${ATTACKERS}, got ${shardCount}`);


        // =================================================================
        // PHASE 6: NETZACH (Eternity / Persistence)
        // =================================================================
        log("Netzach", "Histalkus: Closing the Gates...");
        await db.close();
        
        log("Netzach", "Techiyas HaMeisim: Reopening...");
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const rebornSouls = await db2.root.souls.length;
        assert(rebornSouls === (TOTAL_SOULS - REMOVED_COUNT), "Souls did not survive the transition.");
        
        const fractalCheck = await db2.root.fractal[`shard_${ATTACKERS-1}`];
        assert(fractalCheck.chaos_level === ATTACKERS-1, "Fractal data corrupted.");

        log("Netzach", "The Data is Eternal.");
        await db2.close();

        // =================================================================
        // FINAL: MALCHUT (Kingship)
        // =================================================================
        log("Malchut", "The Vessel is Complete. The Light is Infinite.");
        console.log(`\n\x1b[42m\x1b[30m B"H - SEDER HISHTALSHELUS COMPLETED SUCCESSFULLY. \x1b[0m`);

    } catch (e) {
        console.error("\n\x1b[41m!!! KLIPAH (Evil Shell) DETECTED - FAILURE !!!\x1b[0m");
        console.error(e);
        process.exit(1);
    }
}

runSimulation();
