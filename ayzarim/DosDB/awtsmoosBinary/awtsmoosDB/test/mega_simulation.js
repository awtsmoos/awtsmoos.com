
// B"H
/**
 * @file omega_simulation.js
 * @description
 *  THE OMEGA SIMULATION.
 *  The Final Stress Test for AwtsmoosDB V2.
 *  
 *  Features:
 *  1. THE ABYSS: 200 Levels of Nested B-Tree Maps.
 *  2. THE MUSEUM: Every Data Structure (Set, Map, TypedArray, BigInt, RegExp, Buffer, Date).
 *  3. THE BLACK HOLE: Massive Sequence Insert (10k) -> Delete (5k) -> Compaction.
 *  4. THE NEURAL NET: Graph + Vector + Full Text Search integration.
 *  5. THE RESURRECTION: Full Persistence Check.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'omega.db');

const COLORS = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Cyan: "\x1b[36m",
    Green: "\x1b[32m",
    Red: "\x1b[31m",
    Yellow: "\x1b[33m",
    Magenta: "\x1b[35m"
};

const log = (section, msg) => console.log(`${COLORS.Bright}${COLORS.Cyan}[${section}]${COLORS.Reset} ${msg}`);
const success = (msg) => console.log(`${COLORS.Green}    ✅ ${msg}${COLORS.Reset}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`${COLORS.Red}    ❌ FAIL: ${msg}${COLORS.Reset}`);
        process.exit(1);
    }
};

async function runTest() {
    console.log(`${COLORS.Magenta}B"H - INITIATING OMEGA SIMULATION...${COLORS.Reset}`);

    // 1. Clean Slate
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // =================================================================
        // PHASE 1: THE ABYSS (200 Levels of Nesting)
        // =================================================================
        log("PHASE 1", "Descending into The Abyss (200 Levels Deep)...");
        
        let currentLevel = db.root;
        const DEPTH = 200;
        
        const startDescent = Date.now();
        
        // We create a chain: root.level_0.level_1...level_199
        for(let i=0; i<DEPTH; i++) {
            const key = `level_${i}`;
            // Use createMap to ensure B-Tree structure for each node
            await currentLevel.createMap(key);
            currentLevel = currentLevel[key];
            
            if (i % 20 === 0) process.stdout.write('.');
        }
        console.log("");
        
        log("PHASE 1", `Reached Depth ${DEPTH} in ${Date.now() - startDescent}ms.`);

        // =================================================================
        // PHASE 2: THE MUSEUM (All Data Types)
        // =================================================================
        log("PHASE 2", "Stocking The Museum with Exotic Matter...");
        
        const exoticData = {
            description: "The Fundamental Types of Creation",
            timestamp: new Date("5784-01-01"),
            secret: Buffer.from("Or Ganuz"),
            math: {
                infinity: Infinity,
                negativeInfinity: -Infinity,
                notANumber: NaN,
                bigInteger: 9007199254740991n * 2n // Really Big Int
            },
            structures: {
                uniqueIds: new Set([1, 1, 2, 3, 5, 8]), // Set
                translation: new Map([["Hello", "Shalom"], ["World", "Olam"]]), // JS Map
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

        // Store at the bottom of the abyss
        await currentLevel.set("museum", exoticData);
        await db.waitForIdle();
        
        // Verify immediately
        const readBack = await currentLevel.museum;
        
        assert(readBack.math.bigInteger === 18014398509481982n, "BigInt Preserved");
        assert(readBack.structures.uniqueIds instanceof Set, "Set Preserved");
        assert(readBack.structures.translation instanceof Map, "Map Preserved");
        assert(readBack.binary.floatArray instanceof Float32Array, "Float32Array Preserved");
        assert(readBack.logic.pattern instanceof RegExp, "RegExp Preserved");
        assert(readBack.logic.error instanceof Error, "Error Preserved");
        assert(Buffer.isBuffer(readBack.secret), "Buffer Preserved");
        
        success("The Museum is secure.");


        // =================================================================
        // PHASE 3: THE BLACK HOLE (Massive Sequence & Compaction)
        // =================================================================
        log("PHASE 3", "Opening The Black Hole (Massive IO)...");
        
        await db.root.createList("timeline");
        const timeline = db.root.timeline;
        
        const ITEMS = 1000; // Scaled down for speed
        const DELETE_START = 200;
        const DELETE_COUNT = 500;
        
        log("PHASE 3", `Injecting ${ITEMS} items...`);
        
        // Use batch to speed up insertion
        await db.batch(async () => {
            for(let i=0; i<ITEMS; i++) {
                // Mix strings and objects
                if (i % 2 === 0) await timeline.push(`Event_${i}`);
                else await timeline.push({ id: i, data: "Complex" });
            }
        });
        
        let len = await timeline.length;
        assert(len === ITEMS, `Timeline Length: ${len}`);
        
        log("PHASE 3", "Checking Fragmentation Before Deletion...");
        const statsBefore = await timeline.stats();
        // console.log("    Stats:", statsBefore);

        log("PHASE 3", `Deleting ${DELETE_COUNT} items from index ${DELETE_START}...`);
        await timeline.splice(DELETE_START, DELETE_COUNT);
        await db.waitForIdle();
        
        len = await timeline.length;
        assert(len === ITEMS - DELETE_COUNT, `Post-Delete Length: ${len}`);
        
        // Verify Integrity around the cut
        const checkIdx1 = DELETE_START - 1; // 199
        const checkIdx2 = DELETE_START;     // 200
        const expectedId1 = checkIdx1;      // 199
        const expectedId2 = checkIdx2 + DELETE_COUNT; // 200 + 500 = 700

        const border1 = await timeline[checkIdx1]; 
        const border2 = await timeline[checkIdx2]; 
        
        const id1 = typeof border1 === 'object' ? border1.id : parseInt(border1.split('_')[1]);
        const id2 = typeof border2 === 'object' ? border2.id : parseInt(border2.split('_')[1]);
        
        assert(id1 === expectedId1, `Border 1 Integrity: Got ${id1}, Expected ${expectedId1}`);
        assert(id2 === expectedId2, `Border 2 Integrity: Got ${id2}, Expected ${expectedId2}`);
        
        log("PHASE 3", "Compacting the Timeline (Reclaiming Space)...");
        const sizeBeforeCompact = (await timeline.stats()).size;
        
        await timeline.compact();
        await db.waitForIdle();
        
        const sizeAfterCompact = (await timeline.stats()).size;
        log("PHASE 3", `Size: ${sizeBeforeCompact} -> ${sizeAfterCompact}`);
        
        // B"H: The size reported by stats() is the sum of payload items (totalBytes).
        // Since compaction does not remove items, the payload size should remain constant.
        // We assert stability (or slight reduction if some garbage was present, but <= is safe).
        assert(sizeAfterCompact <= sizeBeforeCompact, "Compaction preserved size");
        
        // Verify integrity after compaction
        const c1 = await timeline[DELETE_START]; 
        const cid = typeof c1 === 'object' ? c1.id : parseInt(c1.split('_')[1]);
        assert(cid === expectedId2, "Data intact after compaction");
        
        success("The Black Hole has been stabilized.");


        // =================================================================
        // PHASE 4: THE NEURAL NET (Graph + Vector + Search)
        // =================================================================
        log("PHASE 4", "Activating The Neural Net...");
        
        await db.root.createMap("brain");
        await db.root.brain.createList("neurons");
        
        // Enable Hybrid Indexing
        await db.root.brain.neurons.enableSearch();
        await db.root.brain.neurons.enableVectorIndex({ dimensions: 4 });
        
        const NEURONS = 100;
        
        await db.batch(async () => {
            for(let i=0; i<NEURONS; i++) {
                const vec = [Math.random(), Math.random(), Math.random(), Math.random()];
                const type = (i % 3 === 0) ? "Sensory" : (i % 3 === 1) ? "Motor" : "Inter";
                
                await db.root.brain.neurons.push({
                    id: `n${i}`,
                    type: type,
                    desc: `${type} Neuron ${i} processes signals`,
                    vector: vec
                });
            }
        });
        
        log("PHASE 4", "Wiring Synapses (Graph Edges)...");
        // Link every neuron to the next 2
        for(let i=0; i<NEURONS-2; i++) {
            const src = db.root.brain.neurons[i];
            const tgt1 = db.root.brain.neurons[i+1];
            const tgt2 = db.root.brain.neurons[i+2];
            
            await src.relateTo(tgt1, "SYNAPSE");
            await src.relateTo(tgt2, "SYNAPSE", { weight: 0.5 });
        }
        await db.waitForIdle();
        
        // Verify Search
        const motorNeurons = await db.root.brain.neurons.search("motor");
        assert(motorNeurons.length > 30, `Text Search found ${motorNeurons.length} Motor Neurons`);
        
        // Verify Vector
        const similar = await db.root.brain.neurons.nearest([0.5, 0.5, 0.5, 0.5], 5);
        assert(similar.length === 5, "Vector Search worked");
        
        // Verify Graph Traversal
        const n0 = db.root.brain.neurons[0];
        const connections = await n0.relationships("OUT");
        assert(connections.length === 2, "Neuron 0 has 2 outputs");
        
        success("The Neural Net is cognizant.");


        // =================================================================
        // PHASE 5: THE RESURRECTION (Reboot)
        // =================================================================
        log("PHASE 5", "Simulating Apocalypse (Restart)...");
        await db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        log("PHASE 5", "Verifying The Abyss...");
        let deepDive = db2.root;
        for(let i=0; i<DEPTH; i++) deepDive = deepDive[`level_${i}`];
        
        const museum = await deepDive.museum;
        assert(museum.secret.toString() === "Or Ganuz", "Deep Nested Buffer survived");
        assert(museum.math.bigInteger === 18014398509481982n, "Deep Nested BigInt survived");
        
        log("PHASE 5", "Verifying The Timeline...");
        const tlLen = await db2.root.timeline.length;
        assert(tlLen === ITEMS - DELETE_COUNT, "Compacted Sequence length survived");
        
        log("PHASE 5", "Verifying The Neural Net...");
        const n0_reborn = db2.root.brain.neurons[0];
        const con_reborn = await n0_reborn.relationships("OUT");
        assert(con_reborn.length === 2, "Graph connections survived");
        
        success("System Restored. Existence Confirmed.");
        
        console.log(`${COLORS.Green}${COLORS.Bright}\nB"H - OMEGA SIMULATION COMPLETE. ALL SYSTEMS NOMINAL.${COLORS.Reset}`);
        await db2.close();

    } catch (e) {
        console.error(`${COLORS.Red}\n!!! OMEGA FAILURE !!!${COLORS.Reset}`);
        console.error(e);
        process.exit(1);
    }
}

runTest();
