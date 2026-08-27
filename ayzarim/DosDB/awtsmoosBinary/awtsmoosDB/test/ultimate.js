// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ultimate_stress.db');

async function runTest() {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();
    
    try {
        console.log("B\"H - Starting Ultimate Test...");

        console.log("[1] Tower of Babel...");
        let curr = db.root;
        for (let i = 1; i <= 15; i++) {
            const name = `level_${i}`;
            // B"H: Idiomatic assignment
            curr[name] = new db.Map();
            curr = curr[name];
        }
        await curr.set("secret", "Ein Sof");
        await db.waitForIdle();
        
        let check = db.root;
        for (let i = 1; i <= 15; i++) check = check[`level_${i}`];
        if (await check.secret !== "Ein Sof") throw new Error("Tower failed");

        console.log("[2] Sorting Verification...");
        db.root.library = new db.Map();
        for(let i=0; i<50; i++) {
            const k = Math.random().toString(36).substring(7);
            await db.root.library.set(k, i);
        }
        await db.waitForIdle();
        
        let last = "";
        for await (const entry of db.root.library) {
            if (entry.key < last) throw new Error("Unsorted library");
            last = entry.key;
        }

        console.log("✅ ULTIMATE TEST PASSED.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();