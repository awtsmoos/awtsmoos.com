// B"H
/**
 * @file ultimate_feature_test.js
 * @description
 *  The Grand Unification Test using assignment syntax.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ultimate_feature.db');

async function runTest() {
    console.log("B\"H - Starting Ultimate Feature Test...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        console.log("\n[1] Genesis: Constructing the Multiverse...");
        // B"H: Unified assignment
        db.root.multiverse = new db.Map();
        db.root.multiverse.dimension_c137 = new db.Map();
        db.root.multiverse.dimension_c137.galaxies = new db.Map();
        db.root.multiverse.dimension_c137.galaxies.milky_way = new db.Map();
        
        await db.root.multiverse.dimension_c137.galaxies.milky_way.set("description", "Spiral Galaxy");
        await db.waitForIdle();
        
        const desc = await db.root.multiverse.dimension_c137.galaxies.milky_way.description;
        if (desc !== "Spiral Galaxy") throw new Error("Deep assignment failed");
        
        console.log("    ✅ Deep Hierarchy Established.");

        console.log("\n[2] History: Creating the Timeline...");
        // B"H: Unified assignment
        db.root.multiverse.dimension_c137.galaxies.milky_way.timeline = new db.List();
        const timeline = db.root.multiverse.dimension_c137.galaxies.milky_way.timeline;

        const epochs = ["Creation", "Adam & Eve", "The Patriarchs", "First Temple", "Moshiach"];
        for(const e of epochs) await timeline.push(e);

        await timeline.splice(2, 0, "The Flood");
        if (await timeline[2] !== "The Flood") throw new Error("Splice insert failed");

        console.log("    ✅ Collection Mechanics Verified.");

        console.log("\n[3] Discovery: Storing Artifacts...");
        const alienData = Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]);
        db.root.multiverse.dimension_c137.galaxies.milky_way.artifact = {
            name: "Luchos",
            signal: alienData,
            properties: { width: 1, depth: 9 }
        };
        await db.waitForIdle();

        const artifact = await db.root.multiverse.dimension_c137.galaxies.milky_way.artifact;
        if (artifact.properties.depth !== 9) throw new Error("Object assignment failed");

        console.log("    ✅ Assignment Verified.");

    } catch (e) {
        console.error("\n❌ ULTIMATE TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
        console.log("\nB\"H - Ultimate Test Completed.");
    }
}
runTest();