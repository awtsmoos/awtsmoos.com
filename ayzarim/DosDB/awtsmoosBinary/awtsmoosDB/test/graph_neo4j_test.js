// B"H
/**
 * @file graph_neo4j_test.js
 * @description
 *  Verifies the "Graph Database" capabilities using unified syntax.
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
    log("B\"H - Starting Graph functionality verification...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        log("[1] Creating Nodes...");
        // B"H: New assignment paradigm.
        db.root.people = new db.Map();
        
        db.root.people.alice = new db.Map();
        await db.root.people.alice.set("age", 25);
        
        db.root.people.bob = new db.Map();
        await db.root.people.bob.set("age", 30);
        
        db.root.people.charlie = new db.Map();
        await db.root.people.charlie.set("age", 35);

        const alice = db.root.people.alice;
        const bob = db.root.people.bob;
        const charlie = db.root.people.charlie;

        log("[2] Connecting Nodes...");
        await db.graph.connect(alice, bob, "KNOWS", { since: 2020 });
        await db.graph.connect(bob, charlie, "KNOWS", { since: 2021 });
        await db.graph.connect(charlie, alice, "LOVES", { intensity: 100 });

        await db.waitForIdle();

        log("[3] Querying Outgoing Relationships...");
        const aliceOut = await db.graph.getRelationships(alice, "OUT", "KNOWS");
        assert(aliceOut.length === 1, "Alice has 1 outgoing KNOWS");
        
        const bobAge = await aliceOut[0].node.age;
        assert(bobAge === 30, "Target node hydrated correctly");

        log("[4] Querying Incoming Relationships...");
        const bobIn = await db.graph.getRelationships(bob, "IN", "KNOWS");
        assert(bobIn.length === 1, "Bob has 1 incoming KNOWS");
        
        const aliceAge = await bobIn[0].node.age;
        assert(aliceAge === 25, "Source node hydrated correctly");

        log("✅ GRAPH TEST COMPLETE.");

    } catch (e) {
        console.error("❌ CRITICAL GRAPH FAILURE:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();