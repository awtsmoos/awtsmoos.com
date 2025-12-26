// B"H
/**
 * @file ultimate_chaos.js
 * @description THE ULTIMATE CHAOS TEST using unified syntax.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'chaos.db');

async function runTest() {
    console.log("B\"H - Unleashing the Ultimate Chaos Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    let db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] The Tower of Babel...");
        let curr = db.root;
        for(let i=1; i<=20; i++) {
            const key = `level_${i}`;
            // B"H: Idiomatic assignment
            curr[key] = new db.Map();
            curr = curr[key]; 
        }
        await curr.set("artifact", "The Word");
        await db.waitForIdle();
        
        console.log("[2] The Legion...");
        db.root.knowledge = new db.List();
        await db.search.enable(db.root.knowledge);
        for(let i=0; i<100; i++) {
            await db.root.knowledge.push({ id: i, txt: "Chaos Secret" });
        }
        await db.waitForIdle();

        console.log("[3] The Apocalypse...");
        await db.close();
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        const count = await db2.root.knowledge.length;
        if (count !== 100) throw new Error("Apocalypse data loss");

        console.log("✅ ULTIMATE CHAOS TEST PASSED.");
        await db2.close();

    } catch (e) {
        console.error("❌ CHAOS CONSUMED THE SYSTEM:", e);
        process.exit(1);
    }
}
runTest();