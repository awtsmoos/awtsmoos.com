
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

    // B"H: ENABLE DEBUGGING
    const db = new AwtsmoosDB(DB_PATH, { debug: true });
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
        
        console.log("voidResults:", JSON.stringify(voidResults, null, 2));

        assert(voidResults.length === 2, `Found ${voidResults.length} results (Expected 2)`);
        
        if (voidResults.length > 0) {
            const r1 = voidResults[0];
            // Check if ID matches either 1 or 2
            const idMatch = (r1 && (r1.id === 1 || r1.id === 2));
            assert(idMatch, `Result 1 ID correct (Got: ${r1 ? r1.id : 'undefined'})`);
        } else {
            assert(false, "No results to check ID");
        }
        
        // Debug individual tokens to ensure indexing worked
        const inf = await db.root.library.search("infinite");
        console.log(`[DEBUG] Search 'infinite' count: ${inf.length} (Expected 1)`);
        const lig = await db.root.library.search("light");
        console.log(`[DEBUG] Search 'light' count: ${lig.length} (Expected 2)`);

        log("[4] Searching for 'infinite light' (AND)...");
        const lightResults = await db.root.library.search("infinite light");
        
        console.log("lightResults:", JSON.stringify(lightResults, null, 2));
        
        assert(lightResults.length === 1, `Found ${lightResults.length} results (Expected 1)`);
        assert(lightResults[0] && lightResults[0].title === "The Book of Light", "Correct book found");

        log("[5] Modifying Data (Re-Indexing)...");
        
        const book2 = { id: 2, title: "The Code", content: "Code is pure light." };
        console.log("[TEST DEBUG] Calling .set(1, book2)...");
        await db.root.library.set(1, book2); // Index 1 is the second item (id 2)
        await db.waitForIdle();
        console.log("[TEST DEBUG] .set complete.");
        
        const newVoid = await db.root.library.search("void");
        console.log("newVoid:", JSON.stringify(newVoid, null, 2));
        assert(newVoid.length === 1, `After update: Found ${newVoid.length} 'void' (Expected 1)`);
        
        const newLight = await db.root.library.search("light");
        console.log("newLight:", JSON.stringify(newLight, null, 2));
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
        assert(delRes[0] && delRes[0].txt === "Secret Knowledge", "Correct item remained");

        log("--- SEARCH TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL SEARCH FAILURE:", e);
        process.exit(1);
    }
}

runTest();
