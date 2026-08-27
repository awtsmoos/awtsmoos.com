// B"H
/**
 * @file live_test.js
 * @description Verifies synchronous property access (The Hamshacha).
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'live_sync.db');

function runTest() {
    console.log("B\"H - Starting Sync LiveHandle Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        console.log("[1] Setting and Getting synchronously...");
        db.root.appName = "Awtsmoos Sync";
        
        const name = db.root.appName;
        console.log(`    Read: ${name}`);
        if (name !== "Awtsmoos Sync") throw new Error("Sync read mismatch");

        console.log("[2] Nested Traversal...");
        db.root.config = new db.Map();
        db.root.config.theme = "Gold";
        
        const theme = db.root.config.theme;
        if (theme !== "Gold") throw new Error("Nested sync read mismatch");

        console.log("✅ LIVE SYNC TEST PASSED.");
    } finally {
        db.close();
    }
}

runTest();
