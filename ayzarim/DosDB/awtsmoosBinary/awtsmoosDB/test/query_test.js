
// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'v2_query.db');

async function runTest() {
    console.log("B\"H - Starting Awtsmoos Query (AQ) Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("    Seeding Data...");
        await db.createList(db.root, "users");
        for(let i=0; i<20; i++) {
            await db.root.users.push({
                id: i,
                name: `User ${i}`,
                details: { active: i % 2 === 0, rank: i }
            });
        }
        await db.waitForIdle();

        console.log("\n[1] Testing $slice Query...");
        const sliceRes = await db.query(db.root.users, {
            $slice: [5, 10]
        });
        console.log(`    Result Length: ${sliceRes.length}`);
        if (sliceRes.length !== 5) throw new Error("Slice failed");
        
        console.log("    ✅ AQ Test Passed.");

    } catch (e) {
        console.error("❌ AQ TEST FAILED:", e);
    }
}

runTest();
