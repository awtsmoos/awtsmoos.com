// B"H
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'range_seek.db');

async function runTest() {
    console.log("B\"H - Starting Range Seek Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] Populating Lexicon...");
        // B"H: New assignment paradigm.
        db.root.lexicon = new db.Map();
        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        for (const char of alphabet) {
            await db.root.lexicon.set(`word_${char}`, char);
        }
        await db.waitForIdle();

        console.log("[2] Executing Range Query...");
        const results = [];
        for await (const entry of db.range(db.root.lexicon, "word_m", "word_o")) {
            results.push(entry.key);
        }

        if (results.length !== 3 || results[0] !== "word_m") {
            throw new Error("Range query failed");
        }

        console.log("✅ RANGE TEST PASSED.");

    } catch (e) {
        console.error("❌ RANGE TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();