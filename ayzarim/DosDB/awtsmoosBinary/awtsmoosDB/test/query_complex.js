







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
        await db.root.createList("users");
        
        const users = [
            { name: "Alice", age: 25, role: "admin", address: { city: "Jerusalem" } },
            { name: "Bob", age: 30, role: "user", address: { city: "Tel Aviv" } },
            { name: "Charlie", age: 17, role: "user", address: { city: "Haifa" } },
            { name: "David", age: 40, role: "mod", address: { city: "Jerusalem" } }
        ];

        for(const u of users) await db.root.users.push(u);
        
        // B"H: Do NOT await here. We need the LiveHandle proxies to perform graph operations.
        const aliceNode = db.root.users[0];
        const bobNode = db.root.users[1];
        const charlieNode = db.root.users[2];
        
        await aliceNode.relateTo(bobNode, "FRIEND");
        await bobNode.relateTo(charlieNode, "FRIEND");

        await db.waitForIdle();
        
        // Debug verify graph
        const aliceName = await aliceNode.name;
        const bobName = await bobNode.name;
        console.log(`[Debug] Alice Name: ${aliceName}`);
        console.log(`[Debug] Bob Name: ${bobName}`);
        
        const aliceFriends = await aliceNode.relationships("OUT", "FRIEND");
        console.log(`[Debug] Alice has ${aliceFriends.length} friends.`);
        if(aliceFriends.length > 0) {
             const fName = await aliceFriends[0].node.name;
             console.log(`[Debug] Alice's friend is: ${fName}`);
        }

        // --- TEST 1: Simple Filter ---
        console.log("\n[1] Simple Filter (Age > 20)...");
        const adults = await db.root.users.query({
            $filter: { age: { $gt: 20 } }
        });
        console.log(`    Found: ${adults.length} (Expected 3)`);
        if (adults.length !== 3) throw new Error("Simple filter failed");


        // --- TEST 2: Nested Path & Logic ---
        console.log("\n[2] Nested Path (Jerusalem) AND Logic...");
        const jlmAdmins = await db.root.users.query({
            $filter: {
                "address.city": "Jerusalem",
                $or: [ { role: "admin" }, { role: "mod" } ]
            }
        });
        console.log(`    Found: ${jlmAdmins.length} (Expected 2: Alice & David)`);
        if (jlmAdmins.length !== 2) throw new Error("Nested/Logic filter failed");


        // --- TEST 3: Graph Relationship Query ---
        console.log("\n[3] Graph Query (Friends with Bob)...");
        const friendsOfBob = await db.root.users.query({
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
        const mapped = await db.root.users.query({
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