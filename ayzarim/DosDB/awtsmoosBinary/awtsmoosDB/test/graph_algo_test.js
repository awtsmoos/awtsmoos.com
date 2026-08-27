// B"H
/**
 * @file graph_algo_test.js
 * @description Updated to use STRICT SYNCHRONOUS API calls (no await).
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'graph_algo.db');

function runTest() {
    console.log("B\"H - Starting Graph Algorithm Test (SYNC)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    
    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    db.open();

    try {
        console.log("[1] Building Graph Network...");
        
        db.root.net = new db.Map();
        const net = db.root.net;
        
        net.A = { id: "A" };
        net.B = { id: "B" };
        net.C = { id: "C" };
        net.D = { id: "D" };
        net.E = { id: "E" };
        
        // Fetch handles synchronously
        const a = net.A;
        const b = net.B;
        const c = net.C;
        const d = net.D;
        const e = net.E;
        
        // Connect synchronously
        db.graph.connect(a, b, "LINK");
        db.graph.connect(b, c, "LINK");
        db.graph.connect(c, d, "LINK");
        db.graph.connect(a, e, "LINK");
        db.graph.connect(e, d, "LINK"); // Shortcut
        
        // No wait needed. Sync kernel writes to cache immediately.

        console.log("\n[2] Testing Shortest Path (A -> D)...");
        const path = db.graph.shortestPath(a, d);
        
        if (!path) throw new Error("Shortest Path returned null (No path found)");
        
        // Path: A -> E -> D (Length 3 nodes, 2 edges)
        // Start node counts as index 0
        console.log(`    Path found. Length: ${path.length}`);
        
        if (path.length !== 3) throw new Error(`Path length incorrect. Expected 3 (A->E->D), got ${path.length}`);

        const midId = path[1].node.id;
        console.log(`    Mid Node: ${midId}`);
        if (midId !== "E") throw new Error(`Shortest path failed logic. Expected 'E' (shortcut), got '${midId}'.`);

        console.log("\n[3] Testing Traversal...");
        const visited = [];
        db.graph.traverse(a, (node, depth) => {
            visited.push(node.id);
        });
        
        console.log(`    Visited: ${visited.join(", ")}`);
        if (!visited.includes("D")) throw new Error("Traversal failed to reach Node D");

        console.log("✅ GRAPH ALGO TEST COMPLETE.");

    } catch (e) {
        console.error("❌ CRITICAL FAILURE:", e);
        process.exit(1);
    } finally {
        db.close();
    }
}

runTest();