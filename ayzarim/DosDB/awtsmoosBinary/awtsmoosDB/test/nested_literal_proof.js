
// B"H
/**
 * @file nested_literal_proof.js
 * @description
 *  Verifies that assigning a nested object literal recursively creates
 *  the correct database structures (Dictionary, Sequence, etc.) 
 *  and populates them with data.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const constants = require('../constants.js');

const DB_PATH = path.join(__dirname, 'nested_proof.db');

async function runTest() {
    console.log("B\"H - Starting Nested Literal Proof...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] Assigning Nested Literal...");
        
        // Complex nested structure
        const complexData = {
            meta: { author: "Yackov", version: 1 },
            tags: ["a", "b", "c"],
            deep: {
                level1: {
                    level2: [
                        { id: 1, name: "Item 1" }
                    ]
                }
            }
        };

        // Assign to root
        db.root.project = complexData;
        await db.waitForIdle();
        console.log("    Assignment persisted.");

        // --- VERIFICATION OF TYPES ---
        console.log("\n[2] Verifying Internal Types...");

        // Helper to get internal type from LiveHandle
        async function getType(handle) {
            await handle; // Ensure resolution
            const internal = handle[constants.SYMBOLS.INTERNALS];
            return internal.type;
        }

        // 1. root.project should be Dictionary (from Object)
        const typeProject = await getType(db.root.project);
        console.log(`    root.project      -> Type: ${typeProject} (Expected ${constants.TYPE_DICTIONARY})`);
        if (typeProject !== constants.TYPE_DICTIONARY) throw new Error("Root object not Dictionary");

        // 2. root.project.meta should be either a full Dictionary or the compact PACKED_OBJECT seed vessel.
        const typeMeta = await getType(db.root.project.meta);
        console.log(`   root.project.meta -> Type: ${typeMeta} (Expected ${constants.TYPE_DICTIONARY} or ${constants.VAL_TYPE.PACKED_OBJECT})`);
        const validMetaTypes = new Set([constants.TYPE_DICTIONARY, constants.VAL_TYPE.PACKED_OBJECT]);
        if (!validMetaTypes.has(typeMeta))
            throw new Error("Nested object not Dictionary or PackedObject");

        // 3. root.project.tags should be Sequence (from Array)
        const typeTags = await getType(db.root.project.tags);
        console.log(`    root.project.tags -> Type: ${typeTags} (Expected ${constants.TYPE_SEQUENCE} or ${constants.VAL_TYPE.PACKED_ARRAY})`);
        if (!(new Set([constants.TYPE_SEQUENCE, constants.VAL_TYPE.PACKED_ARRAY])).has(typeTags)) throw new Error("Nested array not Sequence or PackedArray");

        // 4. Deep nesting
        const typeLevel2 = await getType(db.root.project.deep.level1.level2);
        console.log(`    ...level1.level2  -> Type: ${typeLevel2} (Expected ${constants.TYPE_SEQUENCE} or ${constants.VAL_TYPE.PACKED_ARRAY})`);
        if (!(new Set([constants.TYPE_SEQUENCE, constants.VAL_TYPE.PACKED_ARRAY])).has(typeLevel2)) throw new Error("Deep nested array not Sequence or PackedArray");

        // --- VERIFICATION OF VALUES ---
        console.log("\n[3] Verifying Values...");
        
        const author = await db.root.project.meta.author;
        console.log(`    Meta Author: ${author}`);
        if (author !== "Yackov") throw new Error("Value mismatch");

        const tag1 = await db.root.project.tags[1];
        console.log(`    Tag[1]: ${tag1}`);
        if (tag1 !== "b") throw new Error("Array value mismatch");

        const deepItemName = await db.root.project.deep.level1.level2[0].name;
        console.log(`    Deep Item Name: ${deepItemName}`);
        if (deepItemName !== "Item 1") throw new Error("Deep value mismatch");

        console.log("\n    Ã¢Å“â€¦ Recursive Structure Construction Verified.");

    } catch (e) {
        console.error("Ã¢ÂÅ’ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
