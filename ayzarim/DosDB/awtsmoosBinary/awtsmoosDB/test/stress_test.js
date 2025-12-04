// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');

async function runTest() {
    const dbPath = './stress_test.db';
    // Clean up previous run
    if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch(e) {}
    }
    
    // We keep debug off for the bulk operations to avoid flooding the console
    const db = new AwtsmoosDB(dbPath, { debug: false });
    
    try {
        console.log("B\"H - Starting Database Stress Test...");
        await db.ensureOpen();
        
        const COUNT = 500; // Matches default toJSON limit for verification
        
        // ---------------------------------------------------------
        // 1. Massive BTree Insert
        // ---------------------------------------------------------
        console.log(`\n[Stress] Phase 1: Inserting ${COUNT} Users into BTree...`);
        const startBtree = Date.now();
        await db.root.createMap('users');
        
        for (let i = 0; i < COUNT; i++) {
            await db.root.users.set(`user_${i}`, {
                id: i,
                name: `User ${i}`,
                bio: `This is a bio for user ${i}. `.repeat(2), 
                active: i % 2 === 0
            });
            if (i % 50 === 0) process.stdout.write('.');
        }
        const timeBtree = Date.now() - startBtree;
        console.log(`\n[Stress] BTree Insert Complete. Time: ${timeBtree}ms (${(timeBtree/COUNT).toFixed(2)}ms/op)`);

        // ---------------------------------------------------------
        // 2. Massive Collection Append
        // ---------------------------------------------------------
        console.log(`\n[Stress] Phase 2: Pushing ${COUNT} Logs into Collection...`);
        const startColl = Date.now();
        await db.root.createList('logs');
        
        for (let i = 0; i < COUNT; i++) {
            await db.root.logs.push({
                idx: i,
                msg: `Log entry number ${i}`,
                ts: Date.now()
            });
            if (i % 50 === 0) process.stdout.write('.');
        }
        const timeColl = Date.now() - startColl;
        console.log(`\n[Stress] Collection Push Complete. Time: ${timeColl}ms (${(timeColl/COUNT).toFixed(2)}ms/op)`);

        // ---------------------------------------------------------
        // 3. Mixed Concurrent Load
        // ---------------------------------------------------------
        console.log(`\n[Stress] Phase 3: Mixed Concurrent Operations (Reads/Updates)...`);
        const OPS = 50;
        const promises = [];
        
        for(let i=0; i<OPS; i++) {
            const targetId = Math.floor(Math.random() * COUNT);
            const r = Math.random();
            if (r < 0.5) {
                // Read Task
                promises.push(
                    (async () => {
                        const u = await db.root.users[`user_${targetId}`];
                        if (!u || u.id !== targetId) {
                            // If user deleted in future steps or missing
                            // For this phase, they should exist.
                            // console.warn(`Read Miss: user_${targetId}`); 
                        }
                    })()
                );
            } else {
                // Update Task
                promises.push(
                    db.root.users.set(`user_${targetId}`, { 
                        id: targetId, 
                        name: `User ${targetId} UPDATED`,
                        updated: true, 
                        ts: Date.now() 
                    })
                );
            }
        }
        
        const startConc = Date.now();
        await Promise.all(promises);
        const timeConc = Date.now() - startConc;
        console.log(`[Stress] Concurrent Ops Complete. Time: ${timeConc}ms`);

        // ---------------------------------------------------------
        // 4. Verification
        // ---------------------------------------------------------
        console.log(`\n[Stress] Phase 4: Verification...`);
        
        // Verify User Count (via toJSON which fetches up to limit)
        const usersObj = await db.root.users; 
        const userKeys = Object.keys(usersObj);
        console.log(`Users Count: ${userKeys.length} (Expected ${COUNT})`);
        if (userKeys.length !== COUNT) throw new Error("User count mismatch");

        // Verify Logs Count via slice
        const logsSlice = await db.root.logs.slice(0, COUNT + 10);
        console.log(`Logs Count: ${logsSlice.length} (Expected ${COUNT})`);
        if (logsSlice.length !== COUNT) throw new Error("Logs count mismatch");

        // ---------------------------------------------------------
        // 5. Deletion Stress
        // ---------------------------------------------------------
        console.log(`\n[Stress] Phase 5: Deleting 50 Users...`);
        for(let i=0; i<50; i++) {
            // Using delete property syntax via proxy
            delete db.root.users[`user_${i}`];
        }
        // Allow deletion queue to finish
        // The delete via proxy is fired and forgotten unless we await something
        // To ensure they are done, we can await a dummy execution or just wait a bit.
        // Actually, the LiveHandle.deleteProperty returns 'true' but executes async.
        // We need to synchronize.
        await db.execute(() => Promise.resolve()); 

        const usersAfterDelete = await db.root.users;
        const keysAfter = Object.keys(usersAfterDelete);
        console.log(`Users Count after delete: ${keysAfter.length} (Expected ${COUNT - 50})`);
        if (keysAfter.length !== COUNT - 50) throw new Error("Delete count mismatch");
        
        // ---------------------------------------------------------
        // 6. Persistence Check
        // ---------------------------------------------------------
        console.log("\n[Stress] Phase 6: Persistence Check (Restart)...");
        await db.close();
        
        const db2 = new AwtsmoosDB(dbPath, { debug: false });
        await db2.ensureOpen();
        
        const logsAfterRestart = await db2.root.logs.slice(0, 10);
        if (logsAfterRestart.length === 0) throw new Error("Logs lost after restart");
        
        // Check a user that wasn't deleted
        const userCheck = await db2.root.users['user_100'];
        if (!userCheck) throw new Error("User 100 lost after restart");
        
        // Check a user that WAS deleted
        const deletedCheck = await db2.root.users['user_0'];
        if (deletedCheck) throw new Error("User 0 should have been deleted");
        
        console.log("✅ Stress Test Passed Successfully!");
        await db2.close();

    } catch (e) {
        console.error("\n❌ Stress Test Failed:", e);
    }
}

runTest();