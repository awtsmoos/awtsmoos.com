// B"H
/**
 * @file ultimate_feature_test.js
 * @description
 *  The Grand Unification Test.
 *  Combines Deep Nesting, Collection Splicing, Direct Array Access, 
 *  Complex Binary Data, and Recursive Modifications into one scenario.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DB_PATH = path.join(__dirname, 'ultimate_feature.db');

async function runTest() {
    console.log("B\"H - Starting Ultimate Feature Test...");

    // 1. Clean Slate
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + ".wal")) fs.unlinkSync(DB_PATH + ".wal");

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // ======================================================
        // Phase 1: Genesis (Deep Structure Creation)
        // ======================================================
        console.log("\n[1] Genesis: Constructing the Multiverse...");
        
        await db.root.createMap("multiverse");
        await db.root.multiverse.createMap("dimension_c137");
        await db.root.multiverse.dimension_c137.createMap("galaxies");
        await db.root.multiverse.dimension_c137.galaxies.createMap("milky_way");
        
        // Primitive Set
        await db.root.multiverse.dimension_c137.galaxies.milky_way.set("description", "Spiral Galaxy");
        await db.root.multiverse.dimension_c137.galaxies.milky_way.set("age_billions", 13.6);
        
        // Verification
        const desc = await db.root.multiverse.dimension_c137.galaxies.milky_way.description;
        if (desc !== "Spiral Galaxy") throw new Error("Deep Primitive Set Failed");
        
        console.log("    ✅ Deep Hierarchy Established.");


        // ======================================================
        // Phase 2: The Timeline (Collection Mechanics)
        // ======================================================
        console.log("\n[2] History: Creating the Timeline (Collection)...");
        
        // Create List deep in the structure
        await db.root.multiverse.dimension_c137.galaxies.milky_way.createList("timeline");
        const timeline = db.root.multiverse.dimension_c137.galaxies.milky_way.timeline;

        // 1. Push Initial Epochs
        console.log("    Pushing initial epochs...");
        const epochs = ["Big Bang", "Formation", "Life", "Technology", "Singularity"];
        for(const e of epochs) await timeline.push(e);

        // 2. Splice INSERT: "Dinosaur Era" between "Formation" (1) and "Life" (2)
        console.log("    Splice INSERT: Adding 'Dinosaur Era'...");
        await timeline.splice(2, 0, "Dinosaur Era");
        // Expected: Big Bang, Formation, Dinosaur Era, Life, Technology, Singularity

        // 3. Direct Access Verification
        const item2 = await timeline[2];
        console.log(`    timeline[2]: ${item2}`);
        if (item2 !== "Dinosaur Era") throw new Error("Splice Insert / Array Access Failed");

        // 4. Splice REPLACE: Rename "Technology" (4) to "The Information Age"
        console.log("    Splice REPLACE: Updating index 4...");
        await timeline.splice(4, 1, "The Information Age");
        
        const item4 = await timeline[4];
        if (item4 !== "The Information Age") throw new Error("Splice Replace Failed");

        // 5. Splice DELETE: Remove "Singularity" (5)
        console.log("    Splice DELETE: Removing index 5...");
        await timeline.splice(5, 1); // remove 1 item at index 5
        
        const len = await timeline.length;
        if (len !== 5) throw new Error(`Length mismatch. Expected 5, got ${len}`);
        
        // 6. Slice Verification
        const allEvents = await timeline.slice(0, 10);
        console.log("    Current Timeline:", JSON.stringify(allEvents));
        // ["Big Bang","Formation","Dinosaur Era","Life","The Information Age"]
        
        if (allEvents[2] !== "Dinosaur Era" || allEvents[4] !== "The Information Age") {
            throw new Error("Timeline Content Mismatch");
        }

        console.log("    ✅ Collection Mechanics (Splice/Slice/Access) Verified.");


        // ======================================================
        // Phase 3: The Artifact (Complex Types & Binary)
        // ======================================================
        console.log("\n[3] Discovery: Storing Complex Artifacts...");
        
        const alienData = Buffer.from([0xDE, 0xAD, 0xBE, 0xEF, 0xCA, 0xFE]);
        const discoveryDate = new Date("2023-01-01T00:00:00Z");

        await db.root.multiverse.dimension_c137.galaxies.milky_way.set("artifact", {
            name: "Monolith",
            origin: "Unknown",
            discovered: discoveryDate,
            signal: alienData,
            properties: {
                width: 1,
                height: 4,
                depth: 9
            }
        });

        // Read Back
        const artifact = await db.root.multiverse.dimension_c137.galaxies.milky_way.artifact;
        
        console.log(`    Artifact: ${artifact.name}`);
        console.log(`    Signal (Hex): ${artifact.signal.toString('hex').toUpperCase()}`);
        console.log(`    Discovered: ${artifact.discovered.toISOString()}`);

        // Binary Check
        if (!Buffer.isBuffer(artifact.signal) || artifact.signal.compare(alienData) !== 0) {
            throw new Error("Binary Data Corruption");
        }
        
        // Date Check
        if (artifact.discovered.getTime() !== discoveryDate.getTime()) {
            throw new Error("Date Object Corruption");
        }
        
        // Nested Object Check
        if (artifact.properties.depth !== 9) throw new Error("Nested Object Corruption");

        console.log("    ✅ Complex Types (Buffer/Date/Object) Verified.");


        // ======================================================
        // Phase 4: Evolution (Mutation Pattern)
        // ======================================================
        console.log("\n[4] Evolution: Modifying Object in Collection...");
        
        // Scenario: We have a list of users, we want to update one.
        await db.root.createList("agents");
        await db.root.agents.push({ id: 007, name: "Bond", active: true });
        
        // 1. Fetch
        let agent = await db.root.agents[0];
        console.log(`    Original Agent: ${agent.name}, Active: ${agent.active}`);
        
        // 2. Modify
        agent.active = false;
        agent.status = "Retired";
        
        // 3. Save (Replace via Splice)
        await db.root.agents.splice(0, 1, agent);
        
        // 4. Verify
        const updatedAgent = await db.root.agents[0];
        console.log(`    Updated Agent: ${updatedAgent.name}, Active: ${updatedAgent.active}, Status: ${updatedAgent.status}`);
        
        if (updatedAgent.active !== false || updatedAgent.status !== "Retired") {
            throw new Error("Object Mutation in Collection Failed");
        }
        
        console.log("    ✅ Mutation Pattern Verified.");


        // ======================================================
        // Phase 5: Expansion (Stress & Page Splitting)
        // ======================================================
        console.log("\n[5] Expansion: Massive Population Growth...");
        
        const starCount = 500;
        await db.root.multiverse.dimension_c137.galaxies.milky_way.createList("stars");
        const stars = db.root.multiverse.dimension_c137.galaxies.milky_way.stars;

        console.log(`    Spawning ${starCount} stars...`);
        const promises = [];
        for(let i=0; i<starCount; i++) {
            promises.push(stars.push({ id: i, type: "G-Type Main Sequence", luminosity: Math.random() }));
        }
        
        await Promise.all(promises);
        await db.waitForIdle();
        
        const starLen = await stars.length;
        console.log(`    Star Count: ${starLen}`);
        if (starLen !== starCount) throw new Error(`Stress Fail. Expected ${starCount}, got ${starLen}`);
        
        // Check random star
        const star300 = await stars[300];
        if (star300.id !== 300) throw new Error("Random Access in large collection failed");

        console.log("    ✅ Stress Expansion Verified.");


        // ======================================================
        // Phase 6: Entropy (Deletion)
        // ======================================================
        console.log("\n[6] Entropy: Deleting The Artifact...");
        
        // Delete property from Map
        await db.root.multiverse.dimension_c137.galaxies.milky_way.deleteProperty("artifact");
        
        const check = await db.root.multiverse.dimension_c137.galaxies.milky_way.artifact;
        if (check !== undefined) throw new Error("Deletion Failed");
        
        console.log("    ✅ Deletion Verified.");

    } catch (e) {
        console.error("\n❌ ULTIMATE TEST FAILED:", e);
        process.exit(1);
    } finally {
        await db.close();
        console.log("\nB\"H - The Universe is Stable. All Systems Nominal.");
    }
}

runTest();
