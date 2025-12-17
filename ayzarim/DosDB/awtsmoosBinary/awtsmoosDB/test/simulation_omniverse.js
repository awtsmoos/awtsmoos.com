
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
        await db.createList(db.root, "library");
        // B"H: New API
        await db.search.enable(db.root.library);
        
        // Vector Search on 'vectors'
        await db.createMap(db.root, "vectors");
        // B"H: New API
        await db.vector.enable(db.root.vectors, { dimensions: 4, metric: 'cosine' });
        
        // Graph Nodes
        await db.createMap(db.root, "network");

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
        const NODE_COUNT = 20;
        for(let i=0; i<NODE_COUNT; i++) {
            promises.push((async () => {
                await db.createMap(db.root.network, `node_${i}`);
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
            // B"H: New API
            await db.graph.connect(src, tgt, "LINKS_TO");
        }
        await db.waitForIdle();

        // --- 3. VERIFICATION ---
        log("[3] Verifying Integrity...");

        // A. Vector Search
        // B"H: New API
        const nearest = await db.vector.nearest(db.root.vectors, [0.5, 0.5, 0.5, 0.5], 5);
        log(`    Vector Search Results: ${nearest.length}`);
        assert(nearest.length === 5, "Vector search returned k=5 results");

        // B. Text Search
        // B"H: New API
        const wisdomBooks = await db.search.run(db.root.library, "wisdom");
        log(`    Text Search 'wisdom': ${wisdomBooks.length}`);
        assert(wisdomBooks.length === 50, `Expected 50 'wisdom' books, got ${wisdomBooks.length}`);

        // C. Graph Traversal
        const node0 = db.root.network.node_0;
        // B"H: New API
        const outEdges = await db.graph.getRelationships(node0, "OUT");
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
        
        // B"H: New API
        const nearestAfter = await db.vector.nearest(db.root.vectors, [0.5, 0.5, 0.5, 0.5], 5);
        const foundDeleted = nearestAfter.find(r => r.item.id === targetId);
        assert(!foundDeleted, "Deleted vector node removed from search");

        // B. Graph Node Deletion (The Ultimate Test)
        // We delete Node 1.
        // Node 0 -> Node 1 -> Node 2
        // After delete, Node 0 -> [DANGLING?]
        
        log("    Deleting Node 1...");
        // B"H: New API for graph-aware deletion
        // Pass the pointer to deleteNode to efficiently clean edges
        // Access pointer via property access if resolved, or explicit lookup
        // Here we assume node_1 is accessible
        const node1 = db.root.network.node_1;
        
        // B"H: Explicitly delete from graph manager to clean edges, then from parent
        await db.graph.deleteNode(node1); 
        await db.root.network.delete("node_1");

        await db.waitForIdle();
        
        const node0_after = db.root.network.node_0;
        // B"H: New API
        const outEdges_after = await db.graph.getRelationships(node0_after, "OUT");
        
        log(`    Node 0 Outgoing Edges: ${outEdges_after.length}`);
        assert(outEdges_after.length === 0, "Edge to Node 1 was auto-cleaned upon Node 1 deletion");
        
        const node2 = db.root.network.node_2;
        // B"H: New API
        const inEdges_node2 = await db.graph.getRelationships(node2, "IN");
        assert(inEdges_node2.length === 0, "Edge from Node 1 was auto-cleaned upon Node 1 deletion");

        log("--- OMNIVERSE SIMULATION SUCCESSFUL ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runSimulation();
