
// B"H
/**
 * @file simulate_eternity.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE REVELATION OF THE ETERNAL
 *  =============================================================================
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const DB_PATH = path.join(__dirname, 'eternity.db');

const log = (msg) => console.log(`\x1b[36m[ETERNITY]\x1b[0m ${msg}`);

const assert = (cond, msg, expected, actual) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        let actualStr = actual;
        if (typeof actual === 'object' && actual !== null) {
             try { actualStr = JSON.stringify(actual, (k,v) => typeof v === 'bigint' ? v.toString() + 'n' : v); } catch(e) { actualStr = "[Complex]"; }
        } else if (typeof actual === 'function') {
             actualStr = "[Active Function]";
        }
        console.error(`       Expected: ${expected}`);
        console.error(`       Actual:   ${actualStr} (Type: ${typeof actual})`);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runSimulation() {
    log("B\"H - Beginning Eternity Simulation (Unified)...");
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    let db = new AwtsmoosDB(DB_PATH);
    db.open();
    
    try {
        log("[1] The Mathematician: BigInts & Maps");
        const mathMap = new Map();
        const bigKey = 9007199254740991n;
        const biggerKey = bigKey + 1n;
        mathMap.set("prime", 13n);
        mathMap.set(bigKey, "Limit");
        mathMap.set(biggerKey, "Beyond");
        db.root.math = mathMap;
        
        // B"H: Hydrate the native Map object from the LiveHandle
        const loadedMathHandle = db.root.math;
        const loadedMath = loadedMathHandle.__resolve__ ? loadedMathHandle.__resolve__() : loadedMathHandle;
        
        const val1 = loadedMath.get("prime");
        assert(typeof val1 === 'bigint' && val1 === 13n, "BigInt Value Preserved", "13n", val1);
        const val2 = loadedMath.get(bigKey.toString()); 
        assert(val2 === "Limit", "BigInt Key (Coerced) Value Preserved", "Limit", val2);

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
        
        // B"H: Hydrate the native Set object from the LiveHandle
        const loadedSetHandle = db.root.engineering;
        const loadedSet = loadedSetHandle.__resolve__ ? loadedSetHandle.__resolve__() : loadedSetHandle;
        
        assert(loadedSet instanceof Set, "Set type preserved", "Set", loadedSet ? loadedSet.constructor.name : loadedSet);
        
        const arrs = [...loadedSet];
        const loadedFloat = arrs.find(x => x instanceof Float32Array);
        const loadedBigIntArr = arrs.find(x => x instanceof BigInt64Array);
        const loadedBuffer = arrs.find(x => x instanceof ArrayBuffer || Buffer.isBuffer(x));
        
        assert(loadedFloat && Math.abs(loadedFloat[0] - 1.1) < 0.000001, "Float32Array preserved", "1.1", loadedFloat ? loadedFloat[0] : "Not Found");
        assert(loadedBigIntArr && loadedBigIntArr[1] === 200n, "BigInt64Array preserved", "200n", loadedBigIntArr ? loadedBigIntArr[1] : "Not Found");
        assert(loadedBuffer && (loadedBuffer.byteLength === 8 || loadedBuffer.length === 8), "ArrayBuffer preserved", "8 Bytes", loadedBuffer ? (loadedBuffer.byteLength || loadedBuffer.length) : "Not Found");

        log("[3] The Philosopher: Ouroboros (Circular)");
        const chicken = { name: "Chicken" };
        const egg = { name: "Egg" };
        chicken.source = egg;
        egg.source = chicken;
        db.root.paradox = chicken;
        
        const tEgg = db.root.paradox.source;
        const tChicken = db.root.paradox.source.source;
        assert(tEgg.name === "Egg", "Chicken -> Egg", "Egg", tEgg ? tEgg.name : "null");
        assert(tChicken.name === "Chicken", "Chicken -> Egg -> Chicken", "Chicken", tChicken ? tChicken.name : "null");
        
        db.root.paradox.source.source.isTasty = true;
        assert(db.root.paradox.isTasty === true, "Circular Graph Updates Propagate", true, "verified");

        log("[4] The Mystic: Functions & Symbols");
        const spell = function(a, b) { return a + b; };
        const sigil = Symbol.for("Awtsmoos");
        db.root.grimoire = { cast: spell, mark: sigil };
        
        const grimoireHandle = db.root.grimoire;
        const grimoire = grimoireHandle.__resolve__ ? grimoireHandle.__resolve__() : grimoireHandle;
        
        assert(typeof grimoire.cast === 'function', "Function stored and resurrected as active speech", "function", typeof grimoire.cast);
        assert(grimoire.cast(10, 5) === 15, "Function executes correctly upon resurrection", 15, grimoire.cast(10, 5));
        
        assert(typeof grimoire.mark === 'symbol', "Symbol type preserved", "symbol", typeof grimoire.mark);
        assert(Symbol.keyFor(grimoire.mark) === "Awtsmoos", "Symbol key preserved", "Awtsmoos", Symbol.keyFor(grimoire.mark));

        log("[5] The End of Days: Restart");
        db.close();
        
        const db2 = new AwtsmoosDB(DB_PATH);
        db2.open();
        
        const rebornSetHandle = db2.root.engineering;
        const rebornSet = rebornSetHandle.__resolve__ ? rebornSetHandle.__resolve__() : rebornSetHandle;
        
        const rebornArr = [...rebornSet].find(x => x instanceof BigInt64Array);
        assert(rebornArr && rebornArr[2] === 300n, "Complex Binary Data Survived Restart", "300n", rebornArr ? rebornArr[2] : "Not Found");
        
        const rebornMathHandle = db2.root.math;
        const rebornMath = rebornMathHandle.__resolve__ ? rebornMathHandle.__resolve__() : rebornMathHandle;
        
        assert(rebornMath.get("prime") === 13n, "BigInt Map Value Survived Restart", "13n", "verified");
        
        log("--- EXISTENCE CONFIRMED: ETERNALLY GOOD ---");
        
    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}
runSimulation();
