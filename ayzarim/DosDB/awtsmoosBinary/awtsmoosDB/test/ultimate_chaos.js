// B"H
/**
 * @file ultimate_chaos.js
 * @description
 *  THE ULTIMATE CHAOS TEST (FAST VERSION).
 *  
 *  "And the earth was without form, and void..."
 *  
 *  This test pushes AwtsmoosDB to its limits but respects time constraints (<15s).
 *  1. Deep B-Tree Nesting (20 Levels).
 *  2. Sequence Splicing (Insert/Delete middle of 500 items).
 *  3. Concurrent Vector & Text Search (50 items).
 *  4. Graph Network Severing.
 *  5. Manual Compaction.
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
    log("B\"H - Unleashing the Ultimate Chaos Test (Optimized)...");

    // 1. Cleanup
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    let db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // ==========================================================
        // TRIAL 1: THE TOWER OF BABEL (Deep Nesting)
        // ==========================================================
        const TOWER_HEIGHT = 25;
        log(`\n[1] The Tower of Babel: ${TOWER_HEIGHT} Levels...`);
        
        let curr = db.root;
        for(let i=1; i<=TOWER_HEIGHT; i++) {
            const key = `level_${i}`;
            await db.createMap(curr, key);
            curr = curr[key]; 
        }
        
        await curr.set("artifact", "The Word of Creation");
        await db.waitForIdle();
        
        let climb = db.root;
        for(let i=1; i<=TOWER_HEIGHT; i++) {
            climb = climb[`level_${i}`];
        }
        const secret = await climb.artifact;
        
        if (secret !== "The Word of Creation") throw new Error("Tower integrity failed");
        log("    ✅ The Tower stands firm.");


        // ==========================================================
        // TRIAL 2: THE LEGION (Vector & Search)
        // ==========================================================
        log("\n[2] The Legion: Vector & Search Indexing...");
        
        await db.createList(db.root, "knowledge_base");
        await db.search.enable(db.root.knowledge_base);
        await db.vector.enable(db.root.knowledge_base, { dimensions: 4 });

        const BATCH_SIZE = 50; // Speed Optimization
        log(`    Injecting ${BATCH_SIZE} complex entities...`);
        
        const start = Date.now();
        
        await db.batch(async () => {
            for(let i=0; i<BATCH_SIZE; i++) {
                await db.root.knowledge_base.push({
                    id: i,
                    content: `Entity ${i} holds the secret of the void`,
                    vector: [Math.random(), Math.random(), Math.random(), Math.random()]
                });
            }
        });
        
        log(`    Injection took ${Date.now() - start}ms`);
        
        const searchRes = await db.search.run(db.root.knowledge_base, "secret void");
        assert(searchRes.length === BATCH_SIZE, `Search Index incomplete. Got ${searchRes.length}`);
        
        const vecRes = await db.vector.nearest(db.root.knowledge_base, [0.5, 0.5, 0.5, 0.5], 5);
        assert(vecRes.length === 5, "Vector HNSW Index failed");
        
        log("    ✅ The Legion is indexed.");


        // ==========================================================
        // TRIAL 3: THE GREAT FLOOD (Sequence Splicing)
        // ==========================================================
        log("\n[3] The Great Flood: Sequence Manipulation...");
        
        await db.createList(db.root, "timeline");
        const timeline = db.root.timeline;
        const HIST_LEN = 500;
        
        log(`    Creating history (${HIST_LEN} items)...`);
        const era1 = Array.from({length: HIST_LEN}, (_, i) => `Year_${i}`);
        
        await db.batch(async () => {
            await timeline.splice(0, 0, ...era1);
        });
        
        log("    Time Travel: Inserting 100 items at index 250...");
        const lostEra = Array.from({length: 100}, (_, i) => `Lost_Year_${i}`);
        
        await db.batch(async () => {
            await timeline.splice(250, 0, ...lostEra);
        });
        
        const checkMid = await timeline[250];
        assert(checkMid === "Lost_Year_0", "Splice Insert Failed");

        log("    The Purge: Deleting 200 items from index 100...");
        await db.batch(async () => {
            await timeline.splice(100, 200); 
        });
        
        // Original: 500. Insert 100 -> 600. Delete 200 -> 400.
        const len = await timeline.length;
        assert(len === 400, `Length Mismatch. Expected 400, got ${len}`);
        
        log("    ✅ The Flood waters have receded correctly.");


        // ==========================================================
        // TRIAL 4: THE INFINITE WEB (Graph Integrity)
        // ==========================================================
        log("\n[4] The Infinite Web: Graph Pathfinding & Severing...");
        
        await db.createMap(db.root, "net");
        const NODES = 20; // Reduced for speed
        
        await db.batch(async () => {
            for(let i=0; i<NODES; i++) {
                await db.createMap(db.root.net, `n${i}`);
                await db.root.net[`n${i}`].set("id", i);
            }
            for(let i=0; i<NODES-1; i++) {
                const src = db.root.net[`n${i}`];
                const tgt = db.root.net[`n${i+1}`];
                await db.graph.connect(src, tgt, "LINK");
            }
        });
        
        const startNode = db.root.net.n0;
        const end = db.root.net[`n${NODES-1}`];
        
        log(`    Finding path 0 -> ${NODES-1}...`);
        const pathRes = await db.graph.shortestPath(startNode, end, { maxDepth: 50 });
        assert(pathRes && pathRes.length === NODES, `Path length incorrect. Got ${pathRes?.length}`);
        
        log("    Severing the chain at node 10...");
        // B"H: Fixed deletion logic
        const node10 = db.root.net['n10'];
        await db.graph.deleteNode(node10); 
        await db.root.net.delete("n10");

        await db.waitForIdle();
        
        const brokenPath = await db.graph.shortestPath(startNode, end, { maxDepth: 50 });
        assert(brokenPath === null, "Path should be broken but was found!");
        
        const n9 = db.root.net.n9;
        const out9 = await db.graph.getRelationships(n9, "OUT");
        assert(out9.length === 0, "Edge to n10 was not cleaned from n9");
        
        log("    ✅ Graph logic verified.");


        // ==========================================================
        // TRIAL 5: THE BIG CRUNCH (Compaction)
        // ==========================================================
        log("\n[5] The Big Crunch: Compaction...");
        
        const statsBefore = await db.stats(db.root.timeline);
        if (statsBefore.fragmentation > 0) {
            await db.compact(db.root.timeline);
            await db.waitForIdle();
            const statsAfter = await db.stats(db.root.timeline);
            assert(statsAfter.size <= statsBefore.size, "Compaction failed");
        }
        log("    ✅ Compaction verified.");


        // ==========================================================
        // TRIAL 6: THE APOCALYPSE (Persistence)
        // ==========================================================
        log("\n[6] The Apocalypse: System Restart...");
        
        await db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        let rebornClimb = db2.root;
        for(let i=1; i<=TOWER_HEIGHT; i++) rebornClimb = rebornClimb[`level_${i}`];
        const rebornSecret = await rebornClimb.artifact;
        assert(rebornSecret === "The Word of Creation", "Nested Data Lost");
        
        const rebornSearch = await db2.search.run(db2.root.knowledge_base, "secret void");
        assert(rebornSearch.length === BATCH_SIZE, "Search Index Lost");

        await db2.close();
        
        log("\nB\"H - ULTIMATE CHAOS TEST PASSED. THE SYSTEM IS IMMORTAL.");

    } catch (e) {
        console.error("\n❌ CHAOS CONSUMED THE SYSTEM:", e);
        process.exit(1);
    }
}

runTest();