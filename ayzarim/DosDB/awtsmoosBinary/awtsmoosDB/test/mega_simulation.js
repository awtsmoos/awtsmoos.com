
// B"H
/**
 * @file mega_simulation.js
 * @description THE OMEGA SIMULATION using assignment syntax, now in pure synchronicity.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'omega.db');

function runTest() {
    console.log("B\"H - INITIATING OMEGA SIMULATION...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        console.log("[Phase 1] The Abyss...");
        let currentLevel = db.root;
        const DEPTH = 50;
        for(let i=0; i<DEPTH; i++) {
            const key = `level_${i}`;
            currentLevel[key] = new db.Map();
            currentLevel = currentLevel[key];
        }
        db.waitForIdle();

        console.log("[Phase 2] The Black Hole...");
        db.root.timeline = new db.List();
        const timeline = db.root.timeline;
        for(let i=0; i<200; i++) timeline.push(`Event_${i}`);
        
        db.waitForIdle();
        if (timeline.length !== 200) throw new Error("List size mismatch");

        console.log("[Phase 3] The Neural Net...");
        db.root.brain = new db.Map();
        db.root.brain.neurons = new db.List();
        db.search.enable(db.root.brain.neurons);
        db.vector.enable(db.root.brain.neurons, { dimensions: 4 });
        
        for(let i=0; i<50; i++) {
            db.root.brain.neurons.push({
                id: `n${i}`,
                desc: `Neuron ${i}`,
                vector: [Math.random(), Math.random(), Math.random(), Math.random()]
            });
        }
        db.waitForIdle();
        
        const searchRes = db.search.run(db.root.brain.neurons, "neuron");
        if (searchRes.length !== 50) throw new Error(`Search index mismatch. Got ${searchRes.length}, expected 50.`);

        console.log("✅ OMEGA SIMULATION COMPLETE.");
        db.close();

    } catch (e) {
        console.error("❌ OMEGA FAILURE:", e);
        process.exit(1);
    }
}

runTest();
