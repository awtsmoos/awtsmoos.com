
// B"H
/**
 * @file graph_neo4j_test.js
 * @description
 *  Verifies the "Graph Database" capabilities of AwtsmoosDB.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'graph_test.db');

const log = (msg) => console.log(`\x1b[36m[GRAPH TEST]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Starting Graph functionality verification (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        log("[1] Creating Nodes (Alice, Bob, Charlie)...");
        
        await db.createMap(db.root, "people");
        
        await db.createMap(db.root.people, "alice");
        await db.root.people.alice.set("age", 25);
        
        await db.createMap(db.root.people, "bob");
        await db.root.people.bob.set("age", 30);
        
        await db.createMap(db.root.people, "charlie");
        await db.root.people.charlie.set("age", 35);

        const alice = db.root.people.alice;
        const bob = db.root.people.bob;
        const charlie = db.root.people.charlie;

        log("[2] Connecting Nodes (Relationships)...");
        
        // B"H: New API - db.graph.connect(src, tgt, label, props)
        await db.graph.connect(alice, bob, "KNOWS", { since: 2020 });
        await db.graph.connect(bob, charlie, "KNOWS", { since: 2021 });
        await db.graph.connect(charlie, alice, "LOVES", { intensity: 100 });

        await db.waitForIdle();

        log("[3] Querying Outgoing Relationships...");
        
        // B"H: New API - db.graph.getRelationships(node, dir, label)
        const aliceOut = await db.graph.getRelationships(alice, "OUT", "KNOWS");
        assert(aliceOut.length === 1, "Alice has 1 outgoing KNOWS");
        
        const rel1 = aliceOut[0];
        assert(rel1.props.since === 2020, "Edge property 'since' correct");
        
        const bobAge = await rel1.node.age;
        assert(bobAge === 30, "Target node hydrated correctly (Bob is 30)");


        log("[4] Querying Incoming Relationships...");
        
        const bobIn = await db.graph.getRelationships(bob, "IN", "KNOWS");
        assert(bobIn.length === 1, "Bob has 1 incoming KNOWS");
        
        const sourceNode = bobIn[0].node;
        const aliceAge = await sourceNode.age;
        assert(aliceAge === 25, "Source node hydrated correctly (Alice is 25)");


        log("[5] Mixed Directions & Labels...");
        
        const aliceAll = await db.graph.getRelationships(alice, "BOTH");
        assert(aliceAll.length === 2, "Alice has 2 total edges");
        
        const loves = aliceAll.find(r => r.label === "LOVES");
        assert(loves.direction === "in", "LOVES is incoming");
        assert(loves.props.intensity === 100, "Edge prop correct");
        
        const admirerAge = await loves.node.age;
        assert(admirerAge === 35, "Charlie is the admirer");

        log("--- GRAPH TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL GRAPH FAILURE:", e);
        process.exit(1);
    }
}

runTest();
