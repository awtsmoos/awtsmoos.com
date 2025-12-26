// B"H
/**
 * @file graph_algo_test.js
 * @description
 *  Verifies Graph Algorithms using Centralized API and assignment syntax.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'graph_algo.db');

async function runTest() {
    console.log("B\"H - Starting Graph Algorithm Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH, {debug: false});
    await db.open();

    try {
        console.log("[1] Building Graph Network...");
        
        // B"H: New assignment paradigm.
        db.root.net = new db.Map();
        const net = db.root.net;
        
        await net.set("A", { id: "A" });
        await net.set("B", { id: "B" });
        await net.set("C", { id: "C" });
        await net.set("D", { id: "D" });
        await net.set("E", { id: "E" });
        
        await net.ensureResolved(true);
        const [a, b, c, d, e] = [net.A, net.B, net.C, net.D, net.E];
        
        await db.graph.connect(a, b, "LINK");
        await db.graph.connect(b, c, "LINK");
        await db.graph.connect(c, d, "LINK");
        await db.graph.connect(a, e, "LINK");
        await db.graph.connect(e, d, "LINK");
        
        await db.waitForIdle();

        console.log("\n[2] Testing Shortest Path (A -> D)...");
        const path = await db.graph.shortestPath(a, d);
        
        if (path.length !== 3) throw new Error(`Path length incorrect. Expected 3, got ${path.length}`);

        const midId = await path[1].node.id;
        if (midId !== "E") throw new Error(`Shortest path failed. Expected 'E', got '${midId}'.`);

        console.log("\n[3] Testing Traversal...");
        const visited = [];
        await db.graph.traverse(a, async (node, depth) => {
            const id = await node.id;
            visited.push(id);
        });
        
        if (!visited.includes("D")) throw new Error("Traversal failed to reach Node D");

        console.log("✅ GRAPH ALGO TEST COMPLETE.");

    } catch (e) {
        console.error("❌ CRITICAL FAILURE:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();