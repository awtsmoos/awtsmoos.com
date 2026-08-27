// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

async function runTest() {
    const dbPath = path.join(__dirname, 'test_nested.db');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + '.wal')) fs.unlinkSync(dbPath + '.wal');
    
    const db = new AwtsmoosDB(dbPath);
    await db.open();
    
    try {
        console.log("B\"H - Starting Nested Structure Test...");

        // B"H: New assignment paradigm.
        db.root.users = new db.Map();
        db.root.users.yackov = new db.Map();
        
        await db.root.users.yackov.set('age', 30);
        await db.root.users.yackov.set('role', 'admin');
        
        // B"H: Nesting List
        db.root.users.yackov.logs = new db.List();
        await db.root.users.yackov.logs.push("Login Success");
        
        await db.waitForIdle();
        
        const age = await db.root.users.yackov.age;
        if (age !== 30) throw new Error("Nested read failed");

        const log = await db.root.users.yackov.logs[0];
        if (log !== "Login Success") throw new Error("Deep List read failed");

        console.log("✅ NESTED TEST PASSED.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();