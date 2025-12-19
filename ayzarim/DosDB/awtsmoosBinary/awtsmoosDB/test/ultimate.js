
// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs').promises;
const fsSync = require('fs');

const path = require('path');
const DB_PATH = path.join(__dirname, 'ultimate_stress.db');;;;

async function runTest() {
    // Clean up previous test
    try {
        if (fsSync.existsSync(DB_PATH)) fsSync.unlinkSync(DB_PATH);
        if (fsSync.existsSync(DB_PATH + '.wal')) fsSync.unlinkSync(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);
    
    // B"H: CRITICAL FIX - Must open DB before accessing root
    await db.open();
    
    console.log("B\"H - Starting ULTIMATE EXTREME Stress Test...");

    console.log("\n[Extreme] Phase 1: Building a Tower 15 levels deep...");
    let curr = db.root;
    for (let i = 1; i <= 15; i++) {
        const name = `level_${i}`;
        await db.createMap(curr, name);
        curr = curr[name];
    }
    
    console.log("[Extreme] Reached root.level_1...level_15");
    console.log("[Extreme] Setting value at the penthouse...");
    await curr.set("penthouse_secret", "The Light of Ein Sof");
    
    // Verify
    let check = db.root;
    for (let i = 1; i <= 15; i++) {
        check = check[`level_${i}`];
    }
    const secret = await check.penthouse_secret;
    if (secret !== "The Light of Ein Sof") throw new Error("Tower Verification Failed!");
    console.log("✅ Tower built and verified.");

    console.log("\n[Extreme] Phase 2: The Library (Sorting 100 keys)...");
    await db.createMap(db.root, "library");
    const keys = [];
    for(let i=0; i<100; i++) {
        const k = Math.random().toString(36).substring(7);
        keys.push(k);
        await db.root.library.set(k, i);
    }
    
    let count = 0;
    let lastKey = "";
    for await (const entry of db.root.library) {
        if (entry.key < lastKey) {
             console.error(`Mismatch at ${count}: Got ${entry.key}, Expected > ${lastKey}`);
             throw new Error("Library is not sorted!");
        }
        lastKey = entry.key;
        count++;
    }
    if (count !== 100) throw new Error(`Library missing books! Found ${count}/100`);
    console.log("✅ Library Sorted & Complete.");

    console.log("\n[Extreme] Phase 3: The Scroll (Large Text)...");
    const scrollText = "B\"H ".repeat(5000); // ~20KB
    await db.root.set("scroll", scrollText);
    const readBack = await db.root.scroll;
    if (readBack !== scrollText) throw new Error("Scroll Corrupted!");
    console.log("✅ Scroll Preserved.");
    
    console.log("\n[Extreme] Phase 4: Chaos (Delete & Re-insert)...");
    await db.root.delete("library");
    const libCheck = await db.root.library;
    if (libCheck !== undefined) throw new Error("Library failed to burn!");
    console.log("✅ Library Burned.");

    await db.close();
    console.log("\nB\"H - ULTIMATE TEST PASSED. The Vessel holds the Light.");
}

runTest().catch(e => {
    console.error(e);
    process.exit(1);
});
