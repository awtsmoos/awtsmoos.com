// B"H
/**
 * @file interactive.js
 * @description Intensive stress test using marker assignments.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'intensive_stress.db');

async function runTest() {
    console.log("B\"H - Starting Intensive Stress Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("[1] Constructing Worlds...");
        // B"H: Nested assignment
        db.root.universe = new db.Map();
        db.root.universe.solar = new db.Map();
        db.root.universe.solar.earth = new db.Map();
        db.root.universe.solar.earth.cities = new db.Map();
        
        await db.root.universe.solar.earth.cities.set("jerusalem", { pop: 900000 });
        await db.waitForIdle();

        const pop = await db.root.universe.solar.earth.cities.jerusalem.pop;
        if (pop !== 900000) throw new Error("Deep read failed");

        console.log("[2] The Flood...");
        db.root.logs = new db.List();
        const logs = db.root.logs;
        for (let i = 0; i < 150; i++) {
            await logs.push({ id: i, msg: "entry" });
        }
        await db.waitForIdle();
        if (await logs.length !== 150) throw new Error("List size mismatch");

        console.log("✅ INTENSIVE TEST PASSED.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
    }
}
runTest();