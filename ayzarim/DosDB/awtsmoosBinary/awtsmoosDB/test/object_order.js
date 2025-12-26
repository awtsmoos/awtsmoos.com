// B"H
/**
 * @file object_order.js
 * @description Verifies B-Tree vs Dictionary ordering.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'order_test.db');

async function runTest() {
    console.log("B\"H - Starting Order Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        const keys = ["zebra", "apple", "mango", "banana"];

        console.log("[1] Map (Sorted A-Z)...");
        // B"H: New assignment paradigm
        db.root.myMap = new db.Map();
        for(const k of keys) await db.root.myMap.set(k, 1);
        await db.waitForIdle();

        const mapKeys = await db.keys(db.root.myMap);
        if (mapKeys[0] !== "apple") throw new Error("Map not sorted");

        console.log("[2] Object (Insertion Order)...");
        // B"H: New assignment paradigm
        db.root.myObj = new db.Object();
        for(const k of keys) await db.root.myObj.set(k, 1);
        await db.waitForIdle();

        const objKeys = await db.keys(db.root.myObj);
        if (objKeys[0] !== "zebra") throw new Error("Object order failed");

        console.log("✅ ORDER TEST PASSED.");

    } catch (e) {
        console.error("❌ ORDER TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();