// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs').promises;

const DB_PATH = './comprehensive_features.db';

async function runTest() {
    console.log("B\"H - Starting Comprehensive Feature Test...");

    // Clean up previous runs
    try {
        await fs.unlink(DB_PATH);
        await fs.unlink(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);

    // ==========================================
    // Test 1: Nested B-Trees & Sorting
    // ==========================================
    console.log("\n[Test 1] Nested B-Trees & Sorting");
    await db.root.createMap("store");
    await db.root.store.createMap("inventory");
    
    // Insert items unsorted to test B-Tree auto-sorting
    console.log("  Inserting items in random order...");
    const products = [
        { id: "p_zebra", name: "Zebra Cake", price: 5 },
        { id: "p_apple", name: "Apple", price: 1 },
        { id: "p_mango", name: "Mango", price: 3 },
        { id: "p_banana", name: "Banana", price: 2 },
        { id: "p_carrot", name: "Carrot", price: 1.5 }
    ];

    for (const p of products) {
        await db.root.store.inventory.set(p.id, p);
    }

    console.log("  Iterating Inventory (Should be sorted by Key ID):");
    let lastKey = "";
    let count = 0;
    
    // Use the iterator implemented in Reader.js
    for await (const item of db.root.store.inventory) {
        console.log(`    - ${item.key}: ${item.value.name} ($${item.value.price})`);
        
        if (item.key < lastKey) {
            throw new Error(`Unsorted keys detected! ${item.key} appeared after ${lastKey}`);
        }
        lastKey = item.key;
        count++;
    }
    
    if (count !== products.length) throw new Error("Missing items in inventory!");
    console.log("  ✅ B-Tree Sorting Verified.");

    // ==========================================
    // Test 2: Collections, Push & Slicing
    // ==========================================
    console.log("\n[Test 2] Collections: Push & Slicing");
    await db.root.store.createList("transactions");
    
    console.log("  Pushing 20 transaction records...");
    for (let i = 1; i <= 20; i++) {
        await db.root.store.transactions.push({ 
            id: i, 
            ts: Date.now(), 
            note: `Transaction #${i}`,
            data: Buffer.from(`Data for ${i}`) // Test binary inside list
        });
    }
    
    // Test Slicing: Get items from index 5 to 10 (Transactions 6, 7, 8, 9, 10)
    console.log("  Fetching Slice [5...10] (Index 5 up to 10)...");
    const slice = await db.root.store.transactions.slice(5, 10);
    
    console.log(`  Retrieved ${slice.length} items:`);
    slice.forEach(item => {
        console.log(`    [ID: ${item.id}] ${item.note}`);
    });

    if (slice.length !== 5) throw new Error(`Slice length incorrect. Expected 5, got ${slice.length}`);
    if (slice[0].id !== 6) throw new Error(`Slice content mismatch. Expected ID 6, got ${slice[0].id}`);
    if (slice[4].id !== 10) throw new Error(`Slice end mismatch. Expected ID 10, got ${slice[4].id}`);
    
    console.log("  ✅ Collection Slicing Verified.");

    // ==========================================
    // Test 3: Mixed Nested Types & Deep Retrieval
    // ==========================================
    console.log("\n[Test 3] Deep Nesting & Mixed Types");
    await db.root.set("deepData", {
        meta: {
            created: new Date(),
            creator: "Admin"
        },
        content: {
            sections: [
                {
                    title: "Section A",
                    blob: Buffer.from("B\"H - Hidden Light")
                }
            ]
        }
    });

    console.log("  Retrieving deep nested object...");
    const deep = await db.root.deepData;
    
    const retrievedBlob = deep.content.sections[0].blob;
    const blobStr = Buffer.isBuffer(retrievedBlob) ? retrievedBlob.toString() : "Not a buffer";
    
    console.log(`  Retrieved Deep Buffer: "${blobStr}"`);
    console.log(`  Created Date: ${deep.meta.created.toISOString()}`);

    if (blobStr !== "B\"H - Hidden Light") throw new Error("Deep nested buffer mismatch");
    console.log("  ✅ Deep Structure Verified.");

    console.log("\nB\"H - All Comprehensive Tests Passed Successfully.");
}

runTest().catch(e => {
    console.error("❌ TEST FAILED:", e);
    process.exit(1);
});