// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');

async function runTest() {
    const dbPath = './test_nested.db';
    // Clean up previous run
    if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch(e) {}
    }
    
    // Enable debug to see the logs requested
    const db = new AwtsmoosDB(dbPath, { debug: true });
    
    try {
        console.log("B\"H - Starting Nested Structure Test...");
        await db.ensureOpen();

        // ---------------------------------------------------------
        // 1. Create Level 1 Map (root -> users)
        // ---------------------------------------------------------
        console.log("\n[Test] Creating 'users' Map on Root...");
        await db.root.createMap('users');
        
        // ---------------------------------------------------------
        // 2. Create Level 2 Map (root -> users -> yackov)
        // ---------------------------------------------------------
        console.log("\n[Test] Creating 'yackov' Map inside 'users'...");
        // Access 'users' via proxy, then create 'yackov' inside it
        await db.root.users.createMap('yackov');

        // ---------------------------------------------------------
        // 3. Set Primitives deep (root -> users -> yackov -> age/role)
        // ---------------------------------------------------------
        console.log("\n[Test] Setting values inside 'root.users.yackov'...");
        await db.root.users.yackov.set('age', 30);
        await db.root.users.yackov.set('role', 'admin');
        await db.root.users.yackov.set('bio', 'Ayzarim Developer');
        
        // ---------------------------------------------------------
        // 4. Create List deep (root -> users -> yackov -> logs)
        // ---------------------------------------------------------
        console.log("\n[Test] Creating 'logs' List inside 'root.users.yackov'...");
        await db.root.users.yackov.createList('logs');
        
        // ---------------------------------------------------------
        // 5. Append to List
        // ---------------------------------------------------------
        console.log("\n[Test] Pushing items to 'root.users.yackov.logs'...");
        await db.root.users.yackov.logs.push({ event: 'login', time: Date.now() });
        await db.root.users.yackov.logs.push("Simple String Entry");
        await db.root.users.yackov.logs.push(12345);
        
        // ---------------------------------------------------------
        // 6. Verification - Reading Keys & Structure
        // ---------------------------------------------------------
        console.log("\n[Test] Reading back structure (toJSON)...");
        
        // Awaiting the handle triggers resolveSelf() -> toJSON()
        const yackovObj = await db.root.users.yackov; 
        console.log("Resolved Object (yackov):", JSON.stringify(yackovObj, null, 2));
        
        if (yackovObj.age !== 30) throw new Error("Age mismatch");
        if (yackovObj.role !== 'admin') throw new Error("Role mismatch");
        if (!Array.isArray(yackovObj.logs)) throw new Error("Logs is not an array");
        if (yackovObj.logs.length !== 3) throw new Error("Logs length mismatch");

        // ---------------------------------------------------------
        // 7. Verify Deep Access via Chain (Direct Property Access)
        // ---------------------------------------------------------
        console.log("\n[Test] Verifying direct deep access (db.root.users.yackov.age)...");
        const age = await db.root.users.yackov.age;
        console.log("Direct Age Access Result:", age);
        if (age !== 30) throw new Error("Direct age access failed");

        const bio = await db.root.users.yackov.bio;
        console.log("Direct Bio Access Result:", bio);
        if (bio !== 'Ayzarim Developer') throw new Error("Direct bio access failed");

        // ---------------------------------------------------------
        // 8. Verify List Slice
        // ---------------------------------------------------------
        console.log("\n[Test] Verifying List slice...");
        const logsSlice = await db.root.users.yackov.logs.slice(0, 10);
        console.log("Logs Slice:", logsSlice);
        if (logsSlice.length !== 3) throw new Error("Slice length mismatch");
        if (logsSlice[1] !== "Simple String Entry") throw new Error("Item mismatch");

        console.log("\n✅ Nested Structure Test Passed Successfully!");

    } catch (e) {
        console.error("\n❌ Test Failed:", e);
    } finally {
        await db.close();
    }
}

runTest();
