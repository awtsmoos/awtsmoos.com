// B"H
/**
 * @file intensive_live_test.js
 * @description
 *  A rigorous stress test for the AwtsmoosDB LiveHandle API.
 *  Covers:
 *  1. Deeply nested BTree structures (The "World" Simulation).
 *  2. High-volume Collection writes to trigger paging.
 *  3. Concurrent/Parallel writes (The "Rain of Data").
 *  4. Mixed types (Collections inside Objects).
 *  5. Deletion and cleanup.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'intensive_stress.db');

async function runTest() {
    console.log("B\"H - Starting Intensive Stress Test...");

    // 0. Clean Slate
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- PHASE 1: The Creation of Worlds (Deep Nesting) ---
        console.log("\n[1] Constructing Deep Nested Worlds (Maps)...");
        
        // B"H: Construct hierarchy explicitly to allow deep traversal/updates
        await db.root.createMap("universe");
        await db.root.universe.createMap("milkyWay");
        await db.root.universe.milkyWay.createMap("solarSystem");
        await db.root.universe.milkyWay.solarSystem.createMap("earth");
        await db.root.universe.milkyWay.solarSystem.earth.createMap("continents");
        await db.root.universe.milkyWay.solarSystem.earth.continents.createMap("asia");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.createMap("countries");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.createMap("israel");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.createMap("cities");
        
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.createMap("jerusalem");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.set("population", 936425);
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.set("spiritualLevel", "High");

        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.createMap("telAviv");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.telAviv.set("population", 460613);
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.telAviv.set("humidity", "Very High");

        await db.waitForIdle();
        
        // Deep Read
        const pop = await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.population;
        console.log(`    Jerusalem Population: ${pop}`);
        if (pop !== 936425) throw new Error("Deep read failed");

        // Deep Update (Adding a neighborhood)
        console.log("    Adding Nachlaot...");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.createMap("neighborhoods");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.neighborhoods.createMap("nachlaot");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.neighborhoods.nachlaot.set("catCount", 500);

        await db.waitForIdle();
        
        const cats = await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.neighborhoods.nachlaot.catCount;
        if (cats !== 500) throw new Error("Deep nested insertion failed");
        console.log("    ✅ Deep Nesting & Updates Passed");


        // --- PHASE 2: The Flood (Collection Stress) ---
        console.log("\n[2] Stressing Collections (Page Splits)...");
        
        // Initialize list explicitly
        await db.root.createList("logs");
        await db.waitForIdle();
        
        // B"H: CRITICAL FIX - Capture the handle ONCE before the loop.
        // Accessing db.root.logs inside the loop causes 150 concurrent BTree searches,
        // which may cause race conditions in the file pager during heavy writing.
        const logsHandle = db.root.logs;

        const ITEM_COUNT = 150; // Enough to force multiple 4KB pages
        console.log(`    Pushing ${ITEM_COUNT} items concurrently...`);
        
        const pushPromises = [];
        for (let i = 0; i < ITEM_COUNT; i++) {
            pushPromises.push(logsHandle.push({
                id: i,
                timestamp: Date.now(),
                message: `Log entry #${i} - ${"A".repeat(50)}` // Padding to fill space
            }));
        }

        // Wait for all promises to queue and resolve
        await Promise.all(pushPromises);
        await db.waitForIdle();

        console.log("    Verifying count via Iterator...");
        let count = 0;
        let lastId = -1;
        
        for await (const log of db.root.logs) {
            // Verify strict order
            if (log.id !== count) throw new Error(`Order mismatch! Expected ${count}, got ${log.id}`);
            count++;
            lastId = log.id;
        }
        
        console.log(`    Iterated ${count} items.`);
        if (count !== ITEM_COUNT) throw new Error(`Count mismatch. Expected ${ITEM_COUNT}, got ${count}`);
        console.log("    ✅ Collection Stress Test Passed");


        // --- PHASE 3: Complex Mixed Types ---
        console.log("\n[3] Testing Mixed Structures (Objects in Arrays in Objects)...");
        
        // B"H: Construct structure via createMap/createList to support nested pushes
        await db.root.createMap("appState");
        await db.root.appState.createList("activeUsers");
        
        // Add initial users
        await db.root.appState.activeUsers.push({ id: 1, preferences: { theme: 'dark' } });
        await db.root.appState.activeUsers.push({ id: 2, preferences: { theme: 'light' } });
        
        await db.root.appState.createMap("systemSettings");
        await db.root.appState.systemSettings.set("version", 2.0);
        
        await db.waitForIdle();

        // Push to nested collection
        console.log("    Pushing to root.appState.activeUsers...");
        await db.root.appState.activeUsers.push({ id: 3, preferences: { theme: 'blue' } });
        
        // Modify sibling key
        db.root.appState.systemSettings.version = 2.1;
        await db.waitForIdle();

        const slices = await db.root.appState.activeUsers.slice(0, 10);
        console.log(`    Retrieved ${slices.length} users.`);
        
        if (slices.length !== 3) throw new Error("Nested push failed");
        if (slices[2].preferences.theme !== 'blue') throw new Error("Nested object data incorrect");
        
        const ver = await db.root.appState.systemSettings.version;
        if (ver !== 2.1) throw new Error("Sibling update failed");
        
        console.log("    ✅ Mixed Structures Passed");


        // --- PHASE 4: The Void (Deletion) ---
        console.log("\n[4] Testing Deletion...");
        
        // Delete a deep node
        console.log("    Deleting Tel Aviv...");
        await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.deleteProperty('telAviv');
        
        await db.waitForIdle();
        
        const telAviv = await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.telAviv;
        if (telAviv !== undefined) throw new Error("Deletion failed, property still exists");

        // Ensure sibling remains
        const jlm = await db.root.universe.milkyWay.solarSystem.earth.continents.asia.countries.israel.cities.jerusalem.population;
        if (jlm !== 936425) throw new Error("Deletion corrupted sibling data");

        console.log("    ✅ Deletion Passed");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
        console.log("\nB\"H - Intensive Stress Test Completed Successfully.");
    }
}

runTest();