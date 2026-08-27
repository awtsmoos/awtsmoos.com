// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'v2_complex_query.db');

async function runTest() {
    console.log("B\"H - Starting Complex Query Engine Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // B"H: Idiomatic assignment
        db.root.users = new db.List();
        
        const users = [
            { name: "Alice", age: 25, role: "admin", address: { city: "Jerusalem" } },
            { name: "Bob", age: 30, role: "user", address: { city: "Tel Aviv" } },
            { name: "David", age: 40, role: "mod", address: { city: "Jerusalem" } }
        ];

        for(const u of users) await db.root.users.push(u);
        await db.waitForIdle();

        console.log("[1] Simple Filter (Age > 20)...");
        const adults = await db.query(db.root.users, {
            $filter: { age: { $gt: 20 } }
        });
        if (adults.length !== 3) throw new Error("Filter failed");

        console.log("[2] Projection ($map)...");
        const mapped = await db.query(db.root.users, {
            $filter: { name: "Alice" },
            $map: { userName: "name", location: "address.city" }
        });
        
        if (mapped[0].userName !== "Alice" || mapped[0].location !== "Jerusalem") {
            throw new Error("Projection failed");
        }

        console.log("✅ COMPLEX QUERY TEST PASSED.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();