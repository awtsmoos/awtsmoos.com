
// B"H
/**
 * @file genesis.js
 * @description THE GENESIS SIMULATION.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'genesis.db');

const log = (msg) => console.log(`\x1b[35m[GENESIS]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    }
};

class LifeForm {
    constructor(name, element) {
        this.name = name;
        this.element = element;
        this.status = { hp: 100 };
    }
}
globalThis.LifeForm = LifeForm;

function runSimulation() {
    log("B\"H - Initiating The Genesis Simulation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    let db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        log("\n[Day 1] Formation of the Vessels...");
        db.root.universe = new db.Map();
        db.root.universe.beings = new db.List();
        
        db.search.enable(db.root.universe.beings);
        db.vector.enable(db.root.universe.beings, { dimensions: 4, metric: 'cosine' });
        db.waitForIdle();

        log("\n[Day 2] Breathing Life...");
        const POPULATION = 20;
        for(let i=0; i<POPULATION; i++) {
            const entity = new LifeForm(`Entity_${i}`, i%2===0 ? "Fire" : "Water");
            db.root.universe.beings.push({
                id: `ent_${i}`,
                data: entity,
                vector: [Math.random(), Math.random(), Math.random(), Math.random()],
                txt: `Entity ${i} is alive.`
            });
        }
        db.waitForIdle();

        log("\n[Day 3] Wiring the Web...");
        const prophet = db.root.universe.beings[0];
        const disciple = db.root.universe.beings[1];
        db.graph.connect(prophet, disciple, "TEACHES");
        db.waitForIdle();

        log("\n[Day 4] The Prophecy...");
        const seekers = db.search.run(db.root.universe.beings, "alive");
        assert(seekers.length === POPULATION, "Search Index failed");

        log("\n[Day 5] Persistence...");
        db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        db2.open();
        
        const rebornCount = db2.root.universe.beings.length;
        assert(rebornCount === POPULATION, "Persistence failed");

        log("\n✅ B\"H - THE GENESIS SIMULATION IS COMPLETE.");
        db2.close();

    } catch (e) {
        console.error("\n❌ SIMULATION COLLAPSE:", e);
        process.exit(1);
    }
}

runSimulation();
