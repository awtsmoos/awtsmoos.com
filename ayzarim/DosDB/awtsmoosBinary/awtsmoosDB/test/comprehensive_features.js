
// B"H
/**
 * @file comprehensive_features.js
 * @description
 *  The Validation of the Comprehensive Features.
 *  TOTAL PURGE: All traces of async/await abolished.
 *  Verifies B-Tree Map iteration, List sequence, and Deep nesting.
 */
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'comprehensive_features.db');

function runTest() {
    console.log(`\x1b[36mB"H - Starting Comprehensive Feature Test (PURE SYNC)...\x1b[0m`);

    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        console.log("\n[Test 1] Nested B-Trees & Sorting");
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
            db.root.store.inventory.set(p.id, p);
        }
        db.waitForIdle();

        console.log("  Iterating Inventory (B-Tree B\"H Iterator)...");
        let lastKey = "";
        let count = 0;
        
        for (const item of db.root.store.inventory) {
            const key = item.key;
            const val = item.value;

            if (val === undefined || key === undefined) {
                throw new Error(`Item or key is undefined. Item: ${JSON.stringify(item)}`);
            }

            const name = val.name;
            const price = val.price;
            console.log(`    - ${key}: ${name} ($${price})`);
            
            if (key < lastKey) {
                throw new Error(`Unsorted key sequence identified: ${key} < ${lastKey}`);
            }
            
            lastKey = key;
            count++;
        }
        
        if (count !== products.length) throw new Error("Total Map count mismatch.");
        console.log("  ✅ B-Tree Sorting Verified.");

        console.log("\n[Test 2] Collections: Push & Slicing");
        db.root.store.transactions = new db.List();
        
        console.log("  Pushing 20 transaction records...");
        for (let i = 1; i <= 20; i++) {
            db.root.store.transactions.push({ 
                id: i, ts: Date.now(), note: `Transaction #${i}`,
                data: Buffer.from(`Data for ${i}`) 
            });
        }
        db.waitForIdle();
        
        console.log("  Fetching Slice [5...10]...");
        const slice = db.root.store.transactions.slice(5, 10);
        
        console.log(`  Retrieved ${slice.length} items.`);
        if (slice.length !== 5) throw new Error(`Slice length mismatch.`);
        if (slice[0].id !== 6) throw new Error(`Sequence integrity breached.`);
        
        console.log("  ✅ Collection Slicing Verified.");

        console.log("\n[Test 3] Deep Nesting & Mixed Types");
        db.root.deepData = {
            meta: { created: new Date(), creator: "Admin" },
            content: { sections: [ { title: "Section A", blob: Buffer.from("B\"H - Hidden Light") } ] }
        };
        db.waitForIdle();

        console.log("  Navigating the fractal hierarchy...");
        const deep = db.root.deepData;
        const blob = deep.content.sections[0].blob;
        
        const blobStr = blob.toString();
        console.log(`  Recovered Binary: "${blobStr}"`);
        if (blobStr !== "B\"H - Hidden Light") throw new Error("Binary integrity failed in deep nesting.");
        
        console.log("  ✅ Deep Structure Verified.");
        
    } finally {
        console.log("\nB\"H - Comprehensive Features Validated.");
        db.close();
    }
}

runTest();
