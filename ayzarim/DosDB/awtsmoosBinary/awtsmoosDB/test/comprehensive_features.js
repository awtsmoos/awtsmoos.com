// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs').promises;

const DB_PATH = './comprehensive_features.db';

async function runTest() {
    console.log("B\"H - Starting Comprehensive Feature Test...");

    try {
        await fs.unlink(DB_PATH);
        await fs.unlink(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    // ==========================================
    // Test 1: Nested B-Trees & Sorting
    // ==========================================
    console.log("\n[Test 1] Nested B-Trees & Sorting");
    // B"H: New marker assignment paradigm.
    db.root.store = new db.Map();
    db.root.store.inventory = new db.Map();
    
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
    
    for await (const item of db.root.store.inventory) {
        const name = await item.value.name;
        const price = await item.value.price;
        console.log(`    - ${item.key}: ${name} ($${price})`);
        if (item.key < lastKey) throw new Error("Unsorted keys!");
        lastKey = item.key;
        count++;
    }
    
    if (count !== products.length) throw new Error("Missing items in inventory!");
    console.log("  ✅ B-Tree Sorting Verified.");

    // ==========================================
    // Test 2: Collections, Push & Slicing
    // ==========================================
    console.log("\n[Test 2] Collections: Push & Slicing");
    db.root.store.transactions = new db.List();
    
    console.log("  Pushing 20 transaction records...");
    for (let i = 1; i <= 20; i++) {
        await db.root.store.transactions.push({ 
            id: i, ts: Date.now(), note: `Transaction #${i}`,
            data: Buffer.from(`Data for ${i}`) 
        });
    }
    
    console.log("  Fetching Slice [5...10]...");
    const slice = await db.root.store.transactions.slice(5, 10);
    
    console.log(`  Retrieved ${slice.length} items.`);
    if (slice.length !== 5) throw new Error(`Slice length incorrect.`);
    
    const id0 = await slice[0].id;
    if (id0 !== 6) throw new Error(`Slice content mismatch.`);
    
    console.log("  ✅ Collection Slicing Verified.");

    // ==========================================
    // Test 3: Mixed Nested Types & Deep Retrieval
    // ==========================================
    console.log("\n[Test 3] Deep Nesting & Mixed Types");
    await db.root.set("deepData", {
        meta: { created: new Date(), creator: "Admin" },
        content: { sections: [ { title: "Section A", blob: Buffer.from("B\"H - Hidden Light") } ] }
    });

    console.log("  Retrieving deep nested object...");
    const deep = await db.root.deepData;
    const blobStr = Buffer.isBuffer(deep.content.sections[0].blob) ? deep.content.sections[0].blob.toString() : "Not a buffer";
    
    console.log(`  Retrieved Deep Buffer: "${blobStr}"`);
    if (blobStr !== "B\"H - Hidden Light") throw new Error("Deep nested buffer mismatch");
    console.log("  ✅ Deep Structure Verified.");

    console.log("\nB\"H - All Comprehensive Tests Passed Successfully.");
}

runTest().catch(e => {
    console.error("❌ TEST FAILED:", e);
    process.exit(1);
});