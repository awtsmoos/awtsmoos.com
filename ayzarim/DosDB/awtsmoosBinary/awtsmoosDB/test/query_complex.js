
// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'v2_complex_query.db');

async function runTest() {
    console.log("B\"H - Starting Complex Query Engine Test (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    
    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        console.log("[Setup] Creating Data Graph...");
        await db.createList(db.root, "users");
        
        const users = [
            { name: "Alice", age: 25, role: "admin", address: { city: "Jerusalem" } },
            { name: "Bob", age: 30, role: "user", address: { city: "Tel Aviv" } },
            { name: "Charlie", age: 17, role: "user", address: { city: "Haifa" } },
            { name: "David", age: 40, role: "mod", address: { city: "Jerusalem" } }
        ];

        for(const u of users) await db.root.users.push(u);
        
        const aliceNode = db.root.users[0];
        const bobNode = db.root.users[1];
        const charlieNode = db.root.users[2];
        
        await db.graph.connect(aliceNode, bobNode, "FRIEND");
        await db.graph.connect(bobNode, charlieNode, "FRIEND");

        await db.waitForIdle();
        
        // Debug verify graph
        const aliceFriends = await db.graph.getRelationships(aliceNode, "OUT", "FRIEND");
        console.log(`[Debug] Alice has ${aliceFriends.length} friends.`);

        // --- TEST 1: Simple Filter ---
        console.log("\n[1] Simple Filter (Age > 20)...");
        const adults = await db.query(db.root.users, {
            $filter: { age: { $gt: 20 } }
        });
        console.log(`    Found: ${adults.length} (Expected 3)`);
        if (adults.length !== 3) throw new Error("Simple filter failed");


        // --- TEST 2: Nested Path & Logic ---
        console.log("\n[2] Nested Path (Jerusalem) AND Logic...");
        const jlmAdmins = await db.query(db.root.users, {
            $filter: {
                "address.city": "Jerusalem",
                $or: [ { role: "admin" }, { role: "mod" } ]
            }
        });
        console.log(`    Found: ${jlmAdmins.length} (Expected 2: Alice & David)`);
        if (jlmAdmins.length !== 2) throw new Error("Nested/Logic filter failed");


        // --- TEST 3: Graph Relationship Query ---
        console.log("\n[3] Graph Query (Friends with Bob)...");
        const friendsOfBob = await db.query(db.root.users, {
            $filter: {
                $relatedTo: {
                    direction: "OUT",
                    label: "FRIEND",
                    match: { name: "Bob" }
                }
            }
        });
        console.log(`    Found: ${friendsOfBob.length} (Expected 1: Alice)`);
        if (friendsOfBob.length !== 1 || friendsOfBob[0].name !== "Alice") throw new Error("Graph query failed");


        // --- TEST 4: Projection ($map) ---
        console.log("\n[4] Projection (Map results)...");
        const mapped = await db.query(db.root.users, {
            $filter: { name: "Alice" },
            $map: {
                userName: "name",
                isAdult: { $check: { age: { $gte: 18 } } },
                location: "address.city"
            }
        });
        
        const aliceMapped = mapped[0];
        console.log("    Mapped:", JSON.stringify(aliceMapped));
        
        if (aliceMapped.userName !== "Alice" || aliceMapped.isAdult !== true || aliceMapped.location !== "Jerusalem") {
            throw new Error("Projection failed");
        }

        console.log("    ✅ Complex Query Engine Verified.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    }
}

runTest();
