
// B"H
/**
 * @file type_confirmation.js
 * @description
 *  Scientifically proves that:
 *  1. {}           -> PACKED_OBJECT seed or TYPE_DICTIONARY after promotion
 *  2. []           -> PACKED_ARRAY seed or TYPE_SEQUENCE after promotion
 *  3. new Map()    -> TYPE_MAP
 *  4. new Set()    -> TYPE_SET
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const constants = require('../constants.js');

const DB_PATH = path.join(__dirname, 'type_proof.db');

async function runTest() {
    console.log("B\"H - Starting Type Mapping Confirmation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] Assigning Native JS Types...");
        
        // 1. Assign Object literal
        db.root.myDict = { a: 1 };
        
        // 2. Assign Array literal
        db.root.myList = [1, 2, 3];
        
        // 3. Assign Map constructor
        const m = new Map();
        m.set("x", 1);
        db.root.myMap = m;
        
        // 4. Assign Set constructor
        const s = new Set();
        s.add(100);
        db.root.mySet = s;

        await db.waitForIdle();
        console.log("    Assignments persisted.");

        // --- VERIFICATION ---
        console.log("\n[2] Inspecting Internal Binary Types...");

        // Helper to get internal type
        async function getType(handle) {
            // Trigger resolution (ensure pointer is loaded)
            await handle; 
            // Access internal target via Symbol
            const internal = handle[constants.SYMBOLS.INTERNALS];
            return internal.type;
        }

        const typeDict = await getType(db.root.myDict);
        const dictTypes = new Set([constants.TYPE_DICTIONARY, constants.VAL_TYPE.PACKED_OBJECT]);
        console.log(`    myDict ({})      -> Type ID: ${typeDict} (Expected ${constants.TYPE_DICTIONARY} or ${constants.VAL_TYPE.PACKED_OBJECT})`);
        if (!dictTypes.has(typeDict)) throw new Error("Object did not become Dictionary or PackedObject!");

        const typeList = await getType(db.root.myList);
        const listTypes = new Set([constants.TYPE_SEQUENCE, constants.VAL_TYPE.PACKED_ARRAY]); console.log(`    myList ([])      -> Type ID: ${typeList} (Expected ${constants.TYPE_SEQUENCE} or ${constants.VAL_TYPE.PACKED_ARRAY})`);
        if (!listTypes.has(typeList)) throw new Error("Array did not become Sequence or PackedArray!");

        const typeMap = await getType(db.root.myMap);
        console.log(`    myMap (new Map)  -> Type ID: ${typeMap} (Expected ${constants.TYPE_MAP})`);
        if (typeMap !== constants.TYPE_MAP) throw new Error("Map did not become B-Tree Map!");

        const typeSet = await getType(db.root.mySet);
        console.log(`    mySet (new Set)  -> Type ID: ${typeSet} (Expected ${constants.TYPE_SET})`);
        if (typeSet !== constants.TYPE_SET) throw new Error("Set did not become Set!");

        console.log("\n    Ã¢Å“â€¦ All Type Mappings Verified.");

    } catch (e) {
        console.error("Ã¢ÂÅ’ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
