// B"H
/**
 * @file simulate_eternity.js
 * @description
 *  THE ETERNITY SIMULATION.
 *  Verifies the "Universal Type Support" and "Graph Stability".
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'eternity.db');

const log = (msg) => console.log(`\x1b[36m[ETERNITY]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runSimulation() {
    log("B\"H - Beginning Eternity Simulation (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    let db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- 1. THE MATHEMATICIAN (BigInt & Map) ---
        log("[1] The Mathematician: BigInts & Maps");
        
        const mathMap = new Map();
        const bigKey = 9007199254740991n; // Max Safe Integer
        const biggerKey = bigKey + 1n;
        
        mathMap.set("prime", 13n);
        mathMap.set(bigKey, "Limit");
        mathMap.set(biggerKey, "Beyond");

        db.root.math = mathMap;
        await db.waitForIdle();

        const loadedMath = await db.root.math;
        
        const val1 = loadedMath.get("prime");
        assert(typeof val1 === 'bigint' && val1 === 13n, "BigInt Value Preserved");
        
        const val2 = loadedMath.get(bigKey.toString()); 
        assert(val2 === "Limit", "BigInt Key (Coerced) Value Preserved");


        // --- 2. THE ENGINEER (TypedArrays & ArrayBuffers) ---
        log("[2] The Engineer: TypedArrays & ArrayBuffers");
        
        const sensorData = new Float32Array([1.1, 2.2, 3.3]);
        const idList = new BigInt64Array([100n, 200n, 300n]);
        const rawBytes = new ArrayBuffer(8);
        new Uint8Array(rawBytes).set([1, 2, 3, 4, 5, 6, 7, 8]);
        
        const engineeringSet = new Set();
        engineeringSet.add(sensorData);
        engineeringSet.add(idList);
        engineeringSet.add(rawBytes);
        engineeringSet.add("Calibration");

        db.root.engineering = engineeringSet;
        await db.waitForIdle();

        const loadedSet = await db.root.engineering;
        assert(loadedSet instanceof Set, "Set type preserved");
        
        const arrs = [...loadedSet];
        const loadedFloat = arrs.find(x => x instanceof Float32Array);
        const loadedBigIntArr = arrs.find(x => x instanceof BigInt64Array);
        const loadedBuffer = arrs.find(x => Buffer.isBuffer(x));
        
        assert(loadedFloat && Math.abs(loadedFloat[0] - 1.1) < 0.0001, "Float32Array preserved");
        assert(loadedBigIntArr && loadedBigIntArr[1] === 200n, "BigInt64Array preserved");
        assert(loadedBuffer && loadedBuffer.length === 8 && loadedBuffer[0] === 1, "ArrayBuffer preserved (as Buffer)");


        // --- 3. THE PHILOSOPHER (Circular Reference) ---
        log("[3] The Philosopher: Ouroboros (Circular)");
        
        const chicken = { name: "Chicken" };
        const egg = { name: "Egg" };
        chicken.source = egg;
        egg.source = chicken;
        
        db.root.paradox = chicken;
        await db.waitForIdle();
        
        const tEgg = await db.root.paradox.source;
        const tChicken = await db.root.paradox.source.source;
        
        assert(tEgg.name === "Egg", "Chicken -> Egg");
        assert(tChicken.name === "Chicken", "Chicken -> Egg -> Chicken");
        
        db.root.paradox.source.source.isTasty = true;
        await db.waitForIdle();
        
        const checkTasty = await db.root.paradox.isTasty;
        assert(checkTasty === true, "Circular Graph Updates Propagate");


        // --- 4. THE MYSTIC (Functions & Symbols) ---
        log("[4] The Mystic: Functions & Symbols");
        
        const spell = function(a, b) { return a + b; };
        const sigil = Symbol.for("Awtsmoos");
        
        db.root.grimoire = {
            cast: spell,
            mark: sigil
        };
        await db.waitForIdle();
        
        const grimoire = await db.root.grimoire;
        
        assert(typeof grimoire.cast === 'string', "Function stored as string");
        assert(grimoire.cast.includes("return a + b"), "Function source preserved");
        
        assert(typeof grimoire.mark === 'symbol', "Symbol type preserved");
        assert(Symbol.keyFor(grimoire.mark) === "Awtsmoos", "Symbol key preserved");


        // --- 5. THE END OF DAYS (Persistence) ---
        log("[5] The End of Days: Restart");
        await db.pager.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const rebornSet = await db2.root.engineering;
        const rebornArr = [...rebornSet].find(x => x instanceof BigInt64Array);
        assert(rebornArr[2] === 300n, "Complex Binary Data Survived Restart");
        
        const rebornMath = await db2.root.math;
        assert(rebornMath.get("prime") === 13n, "BigInt Map Value Survived Restart");

        log("--- EXISTENCE CONFIRMED: ETERNALLY GOOD ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runSimulation();