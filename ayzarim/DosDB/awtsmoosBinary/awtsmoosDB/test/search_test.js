// B"H
/**
 * @file search_test.js
 * @description
 *  Verifies the Full-Text Indexing capability.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'search_test.db');

const log = (msg) => console.log(`\x1b[36m[SEARCH TEST]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Starting Awtsmoos Search Engine (ASE) Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        log("[1] Enabling Indexing on 'root.library'...");
        await db.root.createList("library");
        await db.root.library.enableSearch();
        
        await db.waitForIdle();
        
        log("[2] Populating Library with Text...");
        
        const texts = [
            { id: 1, title: "The Book of Light", content: "Infinite light fills the void." },
            { id: 2, title: "The Code", content: "Code determines reality in the void." },
            { id: 3, title: "Zohar", content: "The book of radiance and light." }
        ];

        for (const book of texts) {
            await db.root.library.push(book);
        }
        await db.waitForIdle();

        log("[3] Searching for 'void'...");
        const voidResults = await db.root.library.search("void");
        
        assert(voidResults.length === 2, `Found ${voidResults.length} results (Expected 2)`);
        assert(voidResults[0].id === 1 || voidResults[0].id === 2, "Result 1 ID correct");
        
        log("[4] Searching for 'infinite light' (AND)...");
        const lightResults = await db.root.library.search("infinite light");
        
        assert(lightResults.length === 1, `Found ${lightResults.length} results (Expected 1)`);
        assert(lightResults[0].title === "The Book of Light", "Correct book found");

        log("[5] Modifying Data (Re-Indexing)...");
        
        const book2 = { id: 2, title: "The Code", content: "Code is pure light." };
        await db.root.library.set(1, book2);
        await db.waitForIdle();
        
        const newVoid = await db.root.library.search("void");
        assert(newVoid.length === 1, `After update: Found ${newVoid.length} 'void' (Expected 1)`);
        
        const newLight = await db.root.library.search("light");
        assert(newLight.length === 3, `After update: Found ${newLight.length} 'light' (Expected 3)`);


        log("[6] Testing Backfill (Refresh Index)...");
        
        await db.root.createList("archive");
        await db.root.archive.push({ txt: "Ancient Secret" });
        await db.root.archive.push({ txt: "Secret Knowledge" });
        await db.waitForIdle();
        
        await db.root.archive.enableSearch();
        await db.waitForIdle(); 
        
        const secretRes = await db.root.archive.search("secret");
        assert(secretRes.length === 2, `Backfill Success: Found ${secretRes.length} 'secret' items`);


        log("[7] Testing Index Deletion...");
        await db.root.archive.splice(0, 1);
        await db.waitForIdle();
        
        const delRes = await db.root.archive.search("secret");
        assert(delRes.length === 1, `Deletion Success: Found ${delRes.length} 'secret' items`);
        assert(delRes[0].txt === "Secret Knowledge", "Correct item remained");

        log("--- SEARCH TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL SEARCH FAILURE:", e);
        process.exit(1);
    }
}

runTest();