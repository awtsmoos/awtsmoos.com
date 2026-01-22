// B"H
/**
 * @file omega_simulation.js
 * @description
 *  THE OMEGA SIMULATION.
 *  Strictly Synchronous.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'omega.db');

function log(section, msg) {
    console.log(`[${section}] ${msg}`);
}

function assert(cond, msg) {
    if (!cond) {
        console.error(`    ❌ FAIL: ${msg}`);
        process.exit(1);
    }
}

function runTest() {
    console.log(`B"H - INITIATING OMEGA SIMULATION (STRICT SYNC)...`);

    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH, { debug: true});
    db.open();

    // PHASE 1: THE ABYSS
    log("PHASE 1", "Descending into The Abyss (200 Levels Deep)...");
    
    db.batch(() => {
        let currentLevel = db.root;
        const DEPTH = 200;
        for(let i=0; i<DEPTH; i++) {
            const key = `level_${i}`;
            currentLevel[key] = new db.Map();
            currentLevel = currentLevel[key];
        }
    });
    
    // PHASE 2: THE MUSEUM
    log("PHASE 2", "Stocking The Museum...");
    let currentLevel = db.root;
    for(let i=0; i<200; i++) currentLevel = currentLevel[`level_${i}`];

    const exoticData = {
        description: "The Fundamental Types of Creation",
        timestamp: new Date("5784-01-01"),
        secret: Buffer.from("Or Ganuz"),
        math: {
            infinity: Infinity,
            negativeInfinity: -Infinity,
            notANumber: NaN,
            bigInteger: 9007199254740991n * 2n 
        },
        structures: {
            uniqueIds: new Set([1, 1, 2, 3, 5, 8]), 
            translation: new Map([["Hello", "Shalom"], ["World", "Olam"]]), 
        },
        binary: {
            floatArray: new Float32Array([3.14, 2.71, 1.618]),
            uInt8: new Uint8Array([255, 0, 128])
        },
        logic: {
            pattern: /Awtsmoos/gi,
            error: new Error("This is a stored error object")
        }
    };

    currentLevel.set("museum", exoticData);
    db.waitForIdle();
    
    // B"H: Manual Hydration for verification
    const readBack = currentLevel.museum.__resolve__();
    
    // Debug Logging to diagnose hydration failures
    if (!readBack) {
        console.error("    [FATAL] Museum failed to hydrate (returned undefined/null).");
        process.exit(1);
    }
    
    if (!readBack.structures) {
        console.error("    [FATAL] 'structures' property missing from Museum.");
        console.error("    Keys:", Object.keys(readBack));
        process.exit(1);
    }
    
    const uIds = readBack.structures.uniqueIds;
    if (!uIds) {
        console.error("    [FATAL] 'uniqueIds' property missing/undefined in structures.");
        console.error("    structures Keys:", Object.keys(readBack.structures));
        process.exit(1);
    }
    
    if (!(uIds instanceof Set)) {
        console.error("    [FATAL] 'uniqueIds' is not a Set. Type:", typeof uIds);
        process.exit(1);
    }

    assert(readBack.math.bigInteger === 18014398509481982n, "BigInt Preserved");
    assert(readBack.structures.uniqueIds instanceof Set, "Set Preserved");
    assert(readBack.structures.uniqueIds.size >= 5, "Set Size Correct");
    assert(readBack.structures.translation instanceof Map, "Map Preserved");
    assert(readBack.binary.floatArray instanceof Float32Array, "Float32Array Preserved");
    
    log("PHASE 2", "The Museum is secure.");

    // PHASE 3: BLACK HOLE
    log("PHASE 3", "Opening The Black Hole...");
    db.root.timeline = new db.List();
    const timeline = db.root.timeline;
    
    const ITEMS = 1000; 
    db.batch(() => {
        for(let i=0; i<ITEMS; i++) {
            if (i % 2 === 0) timeline.push(`Event_${i}`);
            else timeline.push({ id: i, data: "Complex" });
        }
    });
    
    let len = timeline.length;
    assert(len === ITEMS, `Timeline Length: ${len}`);
    
    timeline.splice(200, 500);
    db.waitForIdle();
    
    len = timeline.length;
    assert(len === ITEMS - 500, `Post-Delete Length: ${len}`);
    
    log("PHASE 3", "Compacted.");

    // PHASE 4: NEURAL NET
    log("PHASE 4", "Activating The Neural Net...");
    db.root.brain = new db.Map();
    db.root.brain.neurons = new db.List();
    
    db.search.enable(db.root.brain.neurons);
    db.vector.enable(db.root.brain.neurons, { dimensions: 4 });
    
    const NEURONS = 100;
    db.batch(() => {
        for(let i=0; i<NEURONS; i++) {
            const vec = [Math.random(), Math.random(), Math.random(), Math.random()];
            db.root.brain.neurons.push({
                id: `n${i}`,
                type: (i % 3 === 0) ? "Sensory" : (i % 3 === 1) ? "Motor" : "Inter",
                desc: `Neuron ${i} processes signals`,
                vector: vec
            });
        }
    });
    
    for(let i=0; i<NEURONS-2; i++) {
        const src = db.root.brain.neurons[i];
        const tgt1 = db.root.brain.neurons[i+1];
        const tgt2 = db.root.brain.neurons[i+2];
        db.graph.connect(src, tgt1, "SYNAPSE");
        db.graph.connect(src, tgt2, "SYNAPSE", { weight: 0.5 });
    }
    db.waitForIdle();
    
    const motorNeurons = db.search.run(db.root.brain.neurons, "motor");
    assert(motorNeurons.length > 30, `Text Search found ${motorNeurons.length} Motor Neurons`);
    
    const n0 = db.root.brain.neurons[0];
    const connections = db.graph.getRelationships(n0, "OUT");
    assert(connections.length === 2, "Neuron 0 has 2 outputs");
    
    log("PHASE 4", "Cognizant.");

    // PHASE 5: REBOOT
    log("PHASE 5", "Reboot...");
    db.close();
    
    const db2 = new AwtsmoosDB(DB_PATH);
    db2.open();
    
    let deepDive = db2.root;
    for(let i=0; i<200; i++) deepDive = deepDive[`level_${i}`];
    
    const museum = deepDive.museum.__resolve__();
    assert(museum.secret.toString() === "Or Ganuz", "Deep Nested Buffer survived");
    
    const tlLen = db2.root.timeline.length;
    assert(tlLen === ITEMS - 500, "Compacted Sequence length survived");
    
    log("PHASE 5", "System Restored.");
    db2.close();
    console.log("B\"H - OMEGA COMPLETE.");
}

runTest();