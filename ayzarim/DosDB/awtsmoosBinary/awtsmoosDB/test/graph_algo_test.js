
// B"H
/**
 * @file graph_algo_test.js
 * @description
 *  Verifies Graph Algorithms:
 *  1. Shortest Path (BFS)
 *  2. Traversal (Visitor)
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'graph_algo.db');

async function runTest() {
    console.log("B\"H - Starting Graph Algorithm Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] Building Graph Network...");
        
        await db.root.createMap("net");
        const net = db.root.net;
        
        // B"H: Use Objects (Dictionaries) for Nodes to ensure Stable Pointers (IDs)
        // Maps can move when modified, invalidating edges created before the modification.
        // FIX: Initialize with IDs so verification works.
        await net.set("A", { id: "A" });
        await net.set("B", { id: "B" });
        await net.set("C", { id: "C" });
        await net.set("D", { id: "D" });
        await net.set("E", { id: "E" });
        
        const [a, b, c, d, e] = [net.A, net.B, net.C, net.D, net.E];
        
        // Path 1 (Long): A -> B -> C -> D (Length 4)
        await a.relateTo(b, "LINK");
        await b.relateTo(c, "LINK");
        await c.relateTo(d, "LINK");
        
        // Path 2 (Short): A -> E -> D (Length 3)
        await a.relateTo(e, "LINK");
        await e.relateTo(d, "LINK");
        
        await db.waitForIdle();

        // --- TEST 1: Shortest Path ---
        console.log("\n[2] Testing Shortest Path (A -> D)...");
        const path = await a.path(d);
        
        console.log(`    Path Length: ${path.length} nodes (Expected 3: A, E, D)`);
        
        if (path.length !== 3) throw new Error(`Path length incorrect. Expected 3, got ${path.length}`);

        // Verify Path: [ {node:A}, {edge:..., node:E}, {edge:..., node:D} ]
        const middleNode = path[1].node;
        const midId = await middleNode.id;
        
        console.log(`    Middle Node ID: ${midId}`);
        
        if (midId !== "E") {
             throw new Error(`Shortest path failed. Expected middle node 'E', got '${midId}'.`);
        }

        // --- TEST 2: Traversal ---
        console.log("\n[3] Testing Traversal (BFS Visitor)...");
        const visited = [];
        await a.traverse(async (node, depth) => {
            const id = await node.id;
            visited.push(id);
        });
        
        console.log(`    Visited: ${visited.join(', ')}`);
        
        if (!visited.includes("D")) throw new Error("Traversal failed to reach Node D");
        if (visited.length < 5) throw new Error("Traversal missed some nodes");

        console.log("--- GRAPH ALGO TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runTest();