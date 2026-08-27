// B"H
/**
 * @file final_boss.js
 * @description
 *  THE FINAL BOSS.
 *  A chaotic, high-intensity test that tries to break the DB with:
 *  1. Massive Concurrency (Race Conditions)
 *  2. Type Mutation (Map -> List -> Buffer)
 *  3. Boundary Splicing
 *  4. Persistence checks
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DB_PATH = path.join(__dirname, 'final_boss.db');

async function runTest() {
    console.log("B\"H - Challening the Final Boss...");

    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");
    } catch(e) {}

    let db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // ======================================================
        // ROUND 1: THE SWARM (Concurrency)
        // ======================================================
        console.log("\n[Round 1] The Swarm: 100 Parallel Writes...");
        
        // B"H: Marker assignment
        db.root.swarm = new db.Map();
        const promises = [];
        
        for(let i=0; i<100; i++) {
            promises.push(
                db.root.swarm.set(`drone_${i}`, { id: i, active: true })
            );
        }
        
        await Promise.all(promises);
        await db.waitForIdle();
        
        let count = 0;
        for await (const drone of db.root.swarm) {
            count++;
        }
        console.log(`    Swarm Size: ${count} (Expected 100)`);
        if (count !== 100) throw new Error("The Swarm has breached containment");
        console.log("    ✅ Concurrency Shield Holding.");


        // ======================================================
        // ROUND 2: THE SHAPESHIFTER (Type Mutation)
        // ======================================================
        console.log("\n[Round 2] The Shapeshifter: Type Mutation...");
        
        // 1. Start as Map
        db.root.shifter = new db.Map();
        await db.root.shifter.set("form", "Map");
        
        // 2. Mutate to List (Overwrite via marker)
        db.root.shifter = new db.List();
        await db.root.shifter.push("I am now a List");
        
        // 3. Mutate to Buffer (Overwrite)
        const buf = Buffer.from("I am now Binary");
        await db.root.set("shifter", buf);
        
        const finalForm = await db.root.shifter;
        if (!Buffer.isBuffer(finalForm) || finalForm.toString() !== "I am now Binary") {
             throw new Error("Shapeshifter failed to mutate correctly.");
        }
        console.log("    ✅ Mutation Logic Verified.");


        // ======================================================
        // ROUND 3: THE SURGEON (Splice Edge Cases)
        // ======================================================
        console.log("\n[Round 3] The Surgeon: Precise Splicing...");
        
        db.root.patient = new db.List();
        await db.root.patient.push("A");
        await db.root.patient.push("B");
        await db.root.patient.push("C");
        
        await db.root.patient.splice(0, 0, "Start");
        await db.root.patient.splice(4, 0, "End");
        await db.waitForIdle();
        
        const all = await db.root.patient.slice(0, 10);
        console.log("    Patient State:", JSON.stringify(all));
        
        if (all[0] !== "Start") throw new Error("Head Splice Failed");
        if (all[4] !== "End") throw new Error("Tail Splice Failed");
        
        console.log("    ✅ Surgical Precision Verified.");


        // ======================================================
        // ROUND 4: THE RESURRECTION (Persistence)
        // ======================================================
        console.log("\n[Round 4] The Resurrection: Reboot...");
        
        await db.close();
        db = null;
        
        const db2 = new AwtsmoosDB(DB_PATH, { debug: false });
        await db2.open();
        
        const drone50 = await db2.root.swarm.drone_50;
        if (!drone50 || drone50.id !== 50) throw new Error("Swarm Data Lost");
        
        const shiftCheck = await db2.root.shifter;
        if (shiftCheck.toString() !== "I am now Binary") throw new Error("Shapeshifter Reverted");
        
        console.log("    ✅ Data Survived Reboot.");
        await db2.close();

    } catch (e) {
        console.error("\n❌ FINAL BOSS DEFEATED YOU:", e);
        process.exit(1);
    }
    
    console.log("\nB\"H - VICTORY! The Final Boss has been defeated.");
}

runTest();