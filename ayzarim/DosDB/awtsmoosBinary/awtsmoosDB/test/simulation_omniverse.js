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
        
        // B"H: New marker assignment paradigm.
        db.root.library = new db.List();
        await db.search.enable(db.root.library);
        
        db.root.vectors = new db.Map();
        await db.vector.enable(db.root.vectors, { dimensions: 4, metric: 'cosine' });
        
        db.root.network = new db.Map();

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
        const NODE_COUNT = 20;
        for(let i=0; i<NODE_COUNT; i++) {
            promises.push((async () => {
                db.root.network[`node_${i}`] = new db.Map();
                await db.root.network[`node_${i}`].set("val", i);
            })());
        }

        log("    Waiting for 200+ concurrent ops...");
        await Promise.all(promises);
        await db.waitForIdle();
        
        // --- 2.5: Graph Wiring ---
        log("[2.5] Wiring the Graph...");
        for(let i=0; i<NODE_COUNT-1; i++) {
            const src = db.root.network[`node_${i}`];
            const tgt = db.root.network[`node_${i+1}`];
            await db.graph.connect(src, tgt, "LINKS_TO");
        }
        await db.waitForIdle();

        // --- 3. VERIFICATION ---
        log("[3] Verifying Integrity...");

        const nearest = await db.vector.nearest(db.root.vectors, [0.5, 0.5, 0.5, 0.5], 5);
        log(`    Vector Search Results: ${nearest.length}`);
        assert(nearest.length === 5, "Vector search returned k=5 results");

        const wisdomBooks = await db.search.run(db.root.library, "wisdom");
        log(`    Text Search 'wisdom': ${wisdomBooks.length}`);
        assert(wisdomBooks.length === 50, `Expected 50 'wisdom' books, got ${wisdomBooks.length}`);

        const node0 = db.root.network.node_0;
        const outEdges = await db.graph.getRelationships(node0, "OUT");
        assert(outEdges.length === 1, "Node 0 has 1 outgoing edge");
        const targetVal = await outEdges[0].node.val;
        assert(targetVal === 1, "Node 0 connects to Node 1");

        // --- 4. THE VOID (Destruction & Consistency) ---
        log("[4] Testing Destruction & Consistency...");

        const targetId = nearest[0].item.id; 
        const targetKey = `v_${targetId.split('_')[1]}`;
        await db.root.vectors.delete(targetKey);
        await db.waitForIdle();
        
        const nearestAfter = await db.vector.nearest(db.root.vectors, [0.5, 0.5, 0.5, 0.5], 5);
        const foundDeleted = nearestAfter.find(r => r.item.id === targetId);
        assert(!foundDeleted, "Deleted vector node removed from search");
        
        log("    Deleting Node 1...");
        const node1 = db.root.network.node_1;
        await db.graph.deleteNode(node1); 
        await db.root.network.delete("node_1");

        await db.waitForIdle();
        
        const node0_after = db.root.network.node_0;
        const outEdges_after = await db.graph.getRelationships(node0_after, "OUT");
        
        log(`    Node 0 Outgoing Edges: ${outEdges_after.length}`);
        assert(outEdges_after.length === 0, "Edge to Node 1 was auto-cleaned upon Node 1 deletion");
        
        const node2 = db.root.network.node_2;
        const inEdges_node2 = await db.graph.getRelationships(node2, "IN");
        assert(inEdges_node2.length === 0, "Edge from Node 1 was auto-cleaned upon Node 1 deletion");

        log("--- OMNIVERSE SIMULATION SUCCESSFUL ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runSimulation();