// B"H
/**
 * @file universal_types.js
 * @description
 *  The "Noah's Ark" Test.
 *  Takes pairs of every standard ECMAScript object type and persists them.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'universal_types.db');

const log = (msg) => console.log(`\x1b[36m[UNIVERSAL]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        // Dump trace logic here if needed
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Starting ECMAScript Standard Object Validation (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, {debug:true});
    await db.open();

    try {
        // --- 1. Error Objects & Subclasses ---
        log("[1] Error Objects (AggregateError, RangeError, Cause)");
        const err = new RangeError("Out of bounds!");
        err.cause = "Bad Input";
        
        const aggErr = new AggregateError(
            [new Error("Fail 1"), new TypeError("Fail 2")], 
            "Multiple Failures"
        );

        db.root.errors = { range: err, agg: aggErr };
        await db.waitForIdle();

        const lErr = await db.root.errors.range;
        const lAgg = await db.root.errors.agg;

        if (lErr.name !== "RangeError") {
            console.log("\n--- DEBUG FAILURE DUMP (RangeError) ---");
            console.log("Raw lErr:", lErr);
            console.log("--------------------------\n");
        }

        assert(lErr.name === "RangeError", "RangeError name preserved");
        assert(lErr.message === "Out of bounds!", "RangeError message preserved");
        assert(lErr.cause === "Bad Input", "Error cause preserved");

        if (lAgg.errors.length !== 2) {
             console.log("\n--- DEBUG FAILURE DUMP (AggregateError) ---");
             console.log("lAgg:", lAgg);
             console.log("lAgg.errors:", lAgg.errors);
             console.log("lAgg.errors length:", lAgg.errors ? lAgg.errors.length : 'undefined');
             console.log("--------------------------\n");
        }

        assert(lAgg.name === "AggregateError", "AggregateError name preserved");
        assert(lAgg.errors.length === 2, "AggregateError sub-errors preserved");
        assert(lAgg.errors[1].name === "TypeError", "Sub-error type preserved");


        // --- 2. Advanced Typed Arrays (BigInt64) ---
        log("[2] Typed Arrays (BigInt64Array)");
        const bigArr = new BigInt64Array([9007199254740991n, -1n, 0n]);
        db.root.typed = bigArr;
        await db.waitForIdle();

        const lBigArr = await db.root.typed;
        assert(lBigArr instanceof BigInt64Array, "BigInt64Array type preserved");
        assert(lBigArr[0] === 9007199254740991n, "BigInt value preserved");


        // --- 3. Symbols ---
        log("[3] Symbols");
        const sym1 = Symbol.for("SharedSymbol");
        const sym2 = Symbol("UniqueSymbol");
        
        db.root.symbols = { s1: sym1, s2: sym2 };
        await db.waitForIdle();
        
        const lSym1 = await db.root.symbols.s1;
        const lSym2 = await db.root.symbols.s2;
        
        assert(Symbol.keyFor(lSym1) === "SharedSymbol", "Registered Symbol preserved");
        assert(typeof lSym2 === 'symbol', "Unique Symbol type preserved");


        // --- 4. Unserializables (WeakMap, Promise, Intl) ---
        log("[4] The Unserializables (Safety Check)");
        const wm = new WeakMap();
        const p = Promise.resolve(1);
        const intl = new Intl.DateTimeFormat('en-US');
        
        db.root.safeZone = { wm, p, intl };
        await db.waitForIdle();
        
        const lSafe = await db.root.safeZone;
        assert(typeof lSafe.wm === 'object', "WeakMap saved as object");
        assert(typeof lSafe.p === 'object', "Promise saved as object");
        assert(typeof lSafe.intl === 'object', "Intl saved as object");
        log("    (Passes if no crash occurred)");


        // --- 5. Proxy ---
        log("[5] Proxy Objects");
        const target = { msg: "Hidden" };
        const proxy = new Proxy(target, {
            get: (t, prop) => prop === "msg" ? "Seen" : t[prop]
        });
        
        db.root.proxy = proxy;
        await db.waitForIdle();
        
        const lProxy = await db.root.proxy;
        assert(lProxy.msg === "Seen", "Proxy getter trap respected during save");


        log("--- ALL TYPES VALIDATED SUCCESSFULLY ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runTest();
