
// B"H
/**
 * @file live_test.js
 * @description Test Suite for the "Divine Interface" (LiveHandle API).
 * Verifies dot-notation access, nested modifications, and collection streaming.
 * Uses waitForIdle() to ensure consistency between asynchronous Proxy writes.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'live_handle_test.db');

async function runTest() {
    console.log("B\"H - Starting LiveHandle Test...");

    // 1. Clean Slate
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- TEST 1: Root Primitives ---
        console.log("\n[1] Testing Root Primitives...");
        
        // Proxy assignments return boolean (true), actual write is async.
        // We rely on db.waitForIdle() to synchronize.
        db.root.appName = "Awtsmoos App";
        db.root.version = 1.0;
        
        await db.waitForIdle();

        const name = await db.root.appName;
        const ver = await db.root.version;
        console.log(`    Read back: ${name}, v${ver}`);

        if (name !== "Awtsmoos App" || ver !== 1.0) throw new Error("Root primitive mismatch");
        console.log("    ✅ Root Primitives Passed");


        // --- TEST 2: Nested Objects (BTree creation) ---
        console.log("\n[2] Testing Nested Objects (Maps)...");
        // B"H: Use createMap to enable deep traversal and modification
        await db.createMap(db.root, "config");
        await db.root.config.set("theme", "dark");
        await db.createMap(db.root.config, "notifications");
        await db.root.config.notifications.set("email", true);
        await db.root.config.notifications.set("sms", false);
        
        await db.waitForIdle();

        const theme = await db.root.config.theme;
        console.log(`    Read config.theme: ${theme}`);
        if (theme !== "dark") throw new Error("Nested object read failed");

        const emailNotif = await db.root.config.notifications.email;
        console.log(`    Read config.notifications.email: ${emailNotif}`);
        if (emailNotif !== true) throw new Error("Deep nested object read failed");
        console.log("    ✅ Nested Objects Passed");


        // --- TEST 3: Deep Updates ---
        console.log("\n[3] Testing Deep Updates (Dot Notation)...");
        // Update existing property deep in tree
        db.root.config.theme = "light";
        
        // Add new property deep in tree
        // B"H: Renamed to pushEnabled to avoid collision with Collection.push() method
        db.root.config.notifications.pushEnabled = true;

        await db.waitForIdle();

        const newTheme = await db.root.config.theme;
        const pushNotif = await db.root.config.notifications.pushEnabled;
        
        console.log(`    Updated theme: ${newTheme}`);
        console.log(`    New prop pushEnabled: ${pushNotif}`);

        if (newTheme !== "light" || pushNotif !== true) throw new Error("Deep update failed");
        console.log("    ✅ Deep Updates Passed");


        // --- TEST 4: Collections ---
        console.log("\n[4] Testing Collections...");
        // B"H: Explicitly create list to allow pushing
        await db.createList(db.root, "users");
        await db.root.users.push({ id: 1, name: "Alice" });
        await db.root.users.push({ id: 2, name: "Bob" });
        
        await db.waitForIdle();

        console.log("    Pushing new item...");
        // Push is a method call, it returns a Promise wrapper around db.execute, so we can await it directly.
        await db.root.users.push({ id: 3, name: "Charlie" });
        
        console.log("    Testing Slice(0, 10)...");
        const allUsers = await db.root.users.slice(0, 10);
        console.log("    Slice Result:", JSON.stringify(allUsers));
        
        if (allUsers.length !== 3) throw new Error(`Expected 3 users, got ${allUsers.length}`);
        if (allUsers[2].name !== "Charlie") throw new Error("Push failed to append correct data");
        console.log("    ✅ Collection Slice/Push Passed");


        // --- TEST 5: Async Iterator ---
        console.log("\n[5] Testing Async Iterator...");
        let count = 0;
        console.log("    Iterating...");
        for await (const user of db.root.users) {
            console.log(`      - User ${user.id}: ${user.name}`);
            count++;
        }
        if (count !== 3) throw new Error("Iterator yielded wrong count");
        console.log("    ✅ Async Iterator Passed");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
        console.log("\nB\"H - All Tests Completed.");
    }
}

runTest();
