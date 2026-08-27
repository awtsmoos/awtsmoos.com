
// B"H
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'search_test_clean.db');

const log = (msg) => console.log(`\x1b[36m[SEARCH TEST]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1); 
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function cleanup() {
    const extensions = ['', '.wal'];
    for (const ext of extensions) {
        const p = DB_PATH + ext;
        try { fs.unlinkSync(p); } catch(e) {}
    }
}

async function runTest() {
    log(`B"H - Starting Awtsmoos Search Engine (ASE) Test (Unified) on ${path.basename(DB_PATH)}...`);

    await cleanup();

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        log("[1] Enabling Indexing on 'root.library'...");
        await db.createList(db.root, "library");
        await db.search.enable(db.root.library);
        
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
        const voidResults = await db.search.run(db.root.library, "void");
        
        console.log("voidResults:", JSON.stringify(voidResults, null, 2));
        assert(voidResults.length === 2, `Found ${voidResults.length} results (Expected 2)`);
        
        log("[4] Searching for 'infinite light' (AND)...");
        const lightResults = await db.search.run(db.root.library, "infinite light");
        assert(lightResults.length === 1, `Found ${lightResults.length} results (Expected 1)`);

        log("[5] Modifying Data (Re-Indexing)...");
        
        const book2 = { id: 2, title: "The Code", content: "Code is pure light." };
        // B"H: Update via splice to ensure explicit Sequence operation
        await db.root.library.splice(1, 1, book2); 
        await db.waitForIdle();
        
        const newVoid = await db.search.run(db.root.library, "void");
        assert(newVoid.length === 1, `After update: Found ${newVoid.length} 'void' (Expected 1)`);
        
        const newLight = await db.search.run(db.root.library, "light");
        assert(newLight.length === 3, `After update: Found ${newLight.length} 'light' (Expected 3)`);

        log("[6] Testing Backfill (Refresh Index)...");
        await db.createList(db.root, "archive");
        await db.root.archive.push({ txt: "Ancient Secret" });
        await db.root.archive.push({ txt: "Secret Knowledge" });
        await db.waitForIdle();
        
        await db.search.enable(db.root.archive);
        await db.waitForIdle(); 
        
        const secretRes = await db.search.run(db.root.archive, "secret");
        assert(secretRes.length === 2, `Backfill Success: Found ${secretRes.length} 'secret' items`);

        log("[7] Testing Index Deletion...");
        await db.root.archive.splice(0, 1);
        await db.waitForIdle();
        
        const delRes = await db.search.run(db.root.archive, "secret");
        assert(delRes.length === 1, `Deletion Success: Found ${delRes.length} 'secret' items`);

        log("--- SEARCH TEST COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL SEARCH FAILURE:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runTest();
