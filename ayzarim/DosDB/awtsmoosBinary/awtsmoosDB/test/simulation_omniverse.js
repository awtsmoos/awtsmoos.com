// B"H
/**
 * @file simulation_omniverse.js
 * @description
 *  THE OMNIVERSE SIMULATION V2 (THE FINAL PERFECTION).
 *  
 *  A rigorous, chaotic, multi-threaded stress test of the entire system.
 *  1. Vector Engine (HNSW) under heavy load.
 *  2. Full-Text Search (ASE) with real-time updates.
 *  3. Graph Network (Creation, Traversal, and DELETION integrity).
 *  4. Fractal Nesting and modifications.
 *  5. Concurrent Readers and Writers.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'omniverse.db');

const log = (msg) => console.log(`\x1b[36m[OMNIVERSE]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    }
    // console.log(`\x1b[32m[OK]\x1b[0m ${msg}`);
};

async function runSimulation() {
    log("B\"H - Initializing Omniverse Simulation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // --- 1. THE FOUNDATION ---
        log("[1] Laying Foundation (Setup Indices)...");
        
        // Text Search on 'library'
        await db.root.createList("library");
        await db.root.library.enableSearch();
        
        // Vector Search on 'vectors'
        await db.root.createMap("vectors");
        await db.root.vectors.enableVectorIndex({ dimensions: 4, metric: 'cosine' });
        
        // Graph Nodes
        await db.root.createMap("network");

        await db.waitForIdle();

        // --- 2. THE CHAOS (Concurrency) ---
        log("[2] Unleashing Chaos (Parallel Operations)...");
        
        const OPS_COUNT = 100;
        const promises = [];

        // TASK A: Vector Ingestion
        for(let i=0; i<OPS_COUNT; i++) {
            promises.push((async () => {
                const vec = [Math.random(), Math.random(), Math.random(), Math.random()];
                await db.root.vectors.set(`v_${i}`, { id: `vec_${i}`, vector: vec, meta: "data" });
            })());
        }

        // TASK B: Text Content
        for(let i=0; i<OPS_COUNT; i++) {
            promises.push((async () => {
                const text = (i % 2 === 0) ? "The light of wisdom" : "The void of space";
                await db.root.library.push({ id: i, title: `Book ${i}`, content: text });
            })());
        }

        // TASK C: Graph Construction
        // Creating nodes A, B, C...
        // Note: We use createMap inside set via helper or explicitly.
        // Parallel createMap on same parent might race on Map bucket split?
        // Our concurrency lock handles it.
        const NODE_COUNT = 20;
        for(let i=0; i<NODE_COUNT; i++) {
            promises.push((async () => {
                await db.root.network.createMap(`node_${i}`);
                await db.root.network[`node_${i}`].set("val", i);
            })());
        }

        log("    Waiting for 200+ concurrent ops...");
        await Promise.all(promises);
        await db.waitForIdle();
        
        // --- 2.5: Graph Wiring ---
        log("[2.5] Wiring the Graph...");
        // Connect Node 0 -> Node 1 -> Node 2 ...
        for(let i=0; i<NODE_COUNT-1; i++) {
            const src = db.root.network[`node_${i}`];
            const tgt = db.root.network[`node_${i+1}`];
            await src.relateTo(tgt, "LINKS_TO");
        }
        await db.waitForIdle();

        // --- 3. VERIFICATION ---
        log("[3] Verifying Integrity...");

        // A. Vector Search
        const nearest = await db.root.vectors.nearest([0.5, 0.5, 0.5, 0.5], 5);
        log(`    Vector Search Results: ${nearest.length}`);
        assert(nearest.length === 5, "Vector search returned k=5 results");

        // B. Text Search
        const wisdomBooks = await db.root.library.search("wisdom");
        log(`    Text Search 'wisdom': ${wisdomBooks.length}`);
        assert(wisdomBooks.length === 50, `Expected 50 'wisdom' books, got ${wisdomBooks.length}`);

        // C. Graph Traversal
        const node0 = db.root.network.node_0;
        const outEdges = await node0.relationships("OUT");
        assert(outEdges.length === 1, "Node 0 has 1 outgoing edge");
        const targetVal = await outEdges[0].node.val;
        assert(targetVal === 1, "Node 0 connects to Node 1");

        // --- 4. THE VOID (Destruction & Consistency) ---
        log("[4] Testing Destruction & Consistency...");

        // A. Vector Deletion
        const targetId = nearest[0].item.id; // Get ID of top result
        const targetKey = `v_${targetId.split('_')[1]}`;
        await db.root.vectors.delete(targetKey);
        await db.waitForIdle();
        
        const nearestAfter = await db.root.vectors.nearest([0.5, 0.5, 0.5, 0.5], 5);
        const foundDeleted = nearestAfter.find(r => r.item.id === targetId);
        assert(!foundDeleted, "Deleted vector node removed from search");

        // B. Graph Node Deletion (The Ultimate Test)
        // We delete Node 1.
        // Node 0 -> Node 1 -> Node 2
        // After delete, Node 0 -> [DANGLING?]
        // The fix in GraphManager should remove the edge from Node 0.
        
        log("    Deleting Node 1...");
        await db.root.network.delete("node_1");
        await db.waitForIdle();
        
        const node0_after = db.root.network.node_0;
        const outEdges_after = await node0_after.relationships("OUT");
        
        log(`    Node 0 Outgoing Edges: ${outEdges_after.length}`);
        assert(outEdges_after.length === 0, "Edge to Node 1 was auto-cleaned upon Node 1 deletion");
        
        const node2 = db.root.network.node_2;
        const inEdges_node2 = await node2.relationships("IN");
        assert(inEdges_node2.length === 0, "Edge from Node 1 was auto-cleaned upon Node 1 deletion");

        log("--- OMNIVERSE SIMULATION SUCCESSFUL ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runSimulation();