// B"H
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'consistency_check.db');

async function runTest() {
    console.log("B\"H - Starting Consistency Check...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] Immediate Read-After-Write...");
        db.root.status = "Written";
        const val = await db.root.status;
        if (val !== "Written") throw new Error("Inconsistent read");

        console.log("[2] Deep Nested Consistency...");
        // B"H: Assignment syntax
        db.root.config = new db.Map();
        db.root.config.level = 9000;
        const level = await db.root.config.level;
        if (level !== 9000) throw new Error("Nested inconsistency");

        console.log("✅ CONSISTENCY VERIFIED.");

    } catch (e) {
        console.error("❌ CONSISTENCY FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();