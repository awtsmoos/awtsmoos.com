// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'v2_query.db');

async function runTest() {
    console.log("B\"H - Starting Awtsmoos Query Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // B"H: Idiomatic assignment
        db.root.users = new db.List();
        for(let i=0; i<20; i++) {
            await db.root.users.push({ id: i, name: `User ${i}` });
        }
        await db.waitForIdle();

        console.log("[1] Testing $slice Query...");
        const sliceRes = await db.query(db.root.users, { $slice: [5, 10] });
        if (sliceRes.length !== 5) throw new Error("Slice failed");
        
        console.log("✅ QUERY TEST PASSED.");

    } catch (e) {
        console.error("❌ QUERY TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();