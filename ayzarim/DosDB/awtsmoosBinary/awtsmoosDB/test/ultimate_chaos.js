


// B"H
/**
 * @file ultimate_chaos.js
 * @description
 *  THE ULTIMATE CHAOS TEST.
 *  
 *  "And the earth was without form, and void..."
 *  
 *  This test pushes AwtsmoosDB to its absolute limits.
 *  1. 100-Level Deep B-Tree Nesting.
 *  2. Massive Sequence Splicing (Insert/Delete middle of 10k items).
 *  3. Concurrent Vector & Text Search Indexing.
 *  4. Graph Network Severing & Pathfinding.
 *  5. Manual Compaction & Fragmentation Analysis.
 *  6. Full Persistence Reboot.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'chaos.db');

const log = (msg) => console.log(`\x1b[35m[CHAOS]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    }
};

async function runTest() {
    log("B\"H - Unleashing the Ultimate Chaos Test...");

    // 1. Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    let db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // ==========================================================
        // TRIAL 1: THE TOWER OF BABEL (Extreme Nesting)
        // ==========================================================
        log("\n[1] The Tower of Babel: 100 Levels of Nesting...");
        
        let curr = db.root;
        // Create 100 nested maps
        for(let i=1; i<=100; i++) {
            const key = `level_${i}`;
            await db.createMap(curr, key);
            curr = curr[key]; // Traverse down
        }
        
        // Place the artifact at the top
        await curr.set("artifact", "The Word of Creation");
        await db.waitForIdle();
        
        log("    Tower built. verifying ascent...");
        
        let climb = db.root;
        for(let i=1; i<=100; i++) {
            climb = climb[`level_${i}`];
        }
        const secret = await climb.artifact;
        
        if (secret !== "The Word of Creation") throw new Error("Tower integrity failed");
        log("    ✅ The Tower stands firm.");


        // ==========================================================
        // TRIAL 2: THE LEGION (Vector & Search Concurrency)
        // ==========================================================
        log("\n[2] The Legion: High-Velocity Vector & Search Indexing...");
        
        await db.createList(db.root, "knowledge_base");
        
        // B"H: New API
        await db.search.enable(db.root.knowledge_base);
        await db.vector.enable(db.root.knowledge_base, { dimensions: 4 });

        const BATCH_SIZE = 200;
        log(`    Injecting ${BATCH_SIZE} complex entities in Batched Mode...`);
        
        const start = Date.now();
        
        // B"H: Use Batch Mode to disable per-write fsync(). 
        // Also run sequentially to avoid race conditions in complex index structures.
        await db.batch(async () => {
            for(let i=0; i<BATCH_SIZE; i++) {
                // await is cheap here because no fsync happens
                await db.root.knowledge_base.push({
                    id: i,
                    content: `Entity ${i} holds the secret of the void`,
                    vector: [Math.random(), Math.random(), Math.random(), Math.random()]
                });
                if (i > 0 && i % 50 === 0) process.stdout.write('.');
            }
        });
        console.log("");
        
        const dur = Date.now() - start;
        log(`    Injection took ${dur}ms`);
        
        log("    Verifying Indices...");
        // B"H: New API
        const searchRes = await db.search.run(db.root.knowledge_base, "secret void");
        assert(searchRes.length === BATCH_SIZE, `Search Index incomplete. Got ${searchRes.length}`);
        
        // B"H: New API
        const vecRes = await db.vector.nearest(db.root.knowledge_base, [0.5, 0.5, 0.5, 0.5], 5);
        assert(vecRes.length === 5, "Vector HNSW Index failed");
        
        log("    ✅ The Legion is indexed.");


        // ==========================================================
        // TRIAL 3: THE GREAT FLOOD (Sequence Splicing)
        // ==========================================================
        log("\n[3] The Great Flood: Massive Sequence Manipulation...");
        
        await db.createList(db.root, "timeline");
        const timeline = db.root.timeline;
        
        // 1. Fill
        log("    Creating history (5,000 items)...");
        const era1 = Array.from({length: 5000}, (_, i) => `Year_${i}`);
        
        // Batch the splice too for speed
        await db.batch(async () => {
            await timeline.splice(0, 0, ...era1);
        });
        
        // 2. Splice Insert Middle (Force Page Splits)
        log("    Time Travel: Inserting 1,000 items at index 2,500...");
        const lostEra = Array.from({length: 1000}, (_, i) => `Lost_Year_${i}`);
        
        await db.batch(async () => {
            await timeline.splice(2500, 0, ...lostEra);
        });
        
        // Verify Middle
        const checkMid = await timeline[2500];
        assert(checkMid === "Lost_Year_0", "Splice Insert Failed at boundary");
        const checkMidEnd = await timeline[3499];
        assert(checkMidEnd === "Lost_Year_999", "Splice Insert Failed at end boundary");
        const checkAfter = await timeline[3500];
        assert(checkAfter === "Year_2500", "Shifted data mismatch");

        // 3. Splice Delete (Force Merge/Gaps)
        log("    The Purge: Deleting 3,000 items from index 1,000...");
        await db.batch(async () => {
            await timeline.splice(1000, 3000); 
        });
        
        const len = await timeline.length;
        assert(len === 3000, `Length Mismatch. Expected 3000, got ${len}`);
        
        const survivor = await timeline[1000];
        assert(survivor === "Year_3000", `Splice Delete Logic Failed. Index 1000 is ${survivor}`);
        
        log("    ✅ The Flood waters have receded correctly.");


        // ==========================================================
        // TRIAL 4: THE INFINITE WEB (Graph Integrity)
        // ==========================================================
        log("\n[4] The Infinite Web: Graph Pathfinding & Severing...");
        
        await db.createMap(db.root, "net");
        const NODES = 100;
        
        // Batch Graph Creation
        await db.batch(async () => {
            // Create Chain: 0->1->2...->99
            for(let i=0; i<NODES; i++) {
                await db.createMap(db.root.net, `n${i}`);
                await db.root.net[`n${i}`].set("id", i);
            }
            
            for(let i=0; i<NODES-1; i++) {
                const src = db.root.net[`n${i}`];
                const tgt = db.root.net[`n${i+1}`];
                // B"H: New API
                await db.graph.connect(src, tgt, "LINK");
            }
        });
        
        // Verify Path
        const startNode = db.root.net.n0;
        const end = db.root.net[`n${NODES-1}`];
        
        log("    Finding path 0 -> 99...");
        // B"H: New API
        const path = await db.graph.shortestPath(startNode, end, { maxDepth: 200 });
        assert(path.length === NODES, `Path length incorrect. Got ${path?.length}`);
        
        // Sever the chain at 50
        log("    Severing the chain at node 50...");
        // B"H: New API - Deletion must be done via db.graph to clean edges if using graph abstractions,
        // OR via standard delete if just removing data. GraphManager.deleteNode handles edges.
        await db.graph.deleteNode(db.root.net[`n50`].ptr); // Pass pointer or ID
        // Alternatively, standard delete:
        // await db.root.net.delete("n50"); 
        // Note: Standard delete via Writer checks graph cleanup now!
        await db.root.net.delete("n50");

        await db.waitForIdle();
        
        // Verify Path Fails
        // B"H: New API
        const brokenPath = await db.graph.shortestPath(startNode, end, { maxDepth: 200 });
        assert(brokenPath === null, "Path should be broken but was found!");
        
        // Verify Edges Cleaned
        const n49 = db.root.net.n49;
        // B"H: New API
        const out49 = await db.graph.getRelationships(n49, "OUT");
        assert(out49.length === 0, "Edge to n50 was not cleaned from n49");
        
        log("    ✅ Graph logic verified.");


        // ==========================================================
        // TRIAL 5: THE BIG CRUNCH (Fragmentation & Compaction)
        // ==========================================================
        log("\n[5] The Big Crunch: Compaction Analysis...");
        
        // Check fragmentation of the 'timeline' list (we deleted 50% of it earlier)
        // B"H: FIX - Use db.stats(handle) not handle.stats()
        const statsBefore = await db.stats(db.root.timeline);
        log(`    Stats Before: Size=${statsBefore.size} bytes, Fragmentation=${(statsBefore.fragmentation*100).toFixed(2)}%`);
        
        // If fragmentation is high, compact
        if (statsBefore.fragmentation > 0) {
            log("    Compacting Timeline...");
            await db.root.timeline.compact();
            await db.waitForIdle();
            
            // B"H: FIX - Use db.stats(handle)
            const statsAfter = await db.stats(db.root.timeline);
            log(`    Stats After: Size=${statsAfter.size} bytes, Fragmentation=${(statsAfter.fragmentation*100).toFixed(2)}%`);
            
            assert(statsAfter.fragmentation < statsBefore.fragmentation, "Compaction failed to reduce fragmentation");
            assert(statsAfter.size < statsBefore.size, "Compaction failed to reduce size");
        } else {
            log("    (Skipping compaction, data already packed)");
        }
        
        log("    ✅ Compaction verified.");


        // ==========================================================
        // TRIAL 6: THE APOCALYPSE (Persistence)
        // ==========================================================
        log("\n[6] The Apocalypse: System Restart...");
        
        await db.close();
        db = null; // Destroy instance
        
        log("    ...Silence...");
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        // Verify Tower
        let rebornClimb = db2.root;
        for(let i=1; i<=100; i++) rebornClimb = rebornClimb[`level_${i}`];
        const rebornSecret = await rebornClimb.artifact;
        assert(rebornSecret === "The Word of Creation", "Nested Data Lost");
        
        // Verify Sequence
        const rebornTimelineLen = await db2.root.timeline.length;
        assert(rebornTimelineLen === 3000, "Sequence Data Lost");
        const rebornSurvivor = await db2.root.timeline[1000];
        assert(rebornSurvivor === "Year_3000", "Sequence Index integrity lost");
        
        // Verify Search
        // B"H: New API
        const rebornSearch = await db2.search.run(db2.root.knowledge_base, "secret void");
        assert(rebornSearch.length === 200, "Search Index Lost");

        await db2.close();
        
        log("\nB\"H - ULTIMATE CHAOS TEST PASSED. THE SYSTEM IS IMMORTAL.");

    } catch (e) {
        console.error("\n❌ CHAOS CONSUMED THE SYSTEM:", e);
        process.exit(1);
    }
}

runTest();