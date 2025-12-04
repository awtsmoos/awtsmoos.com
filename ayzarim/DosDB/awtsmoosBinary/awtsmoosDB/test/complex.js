// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');

async function runTest() {
    const dbPath = './test_complex.db';
    if (fs.existsSync(dbPath)) try { fs.unlinkSync(dbPath); } catch(e) {}

    // Initialize with Extreme Logging
    const db = new AwtsmoosDB(dbPath, { debug: true });
    
    try {
        console.log("B\"H - Starting Complex Nested Operations Test...");
        await db.ensureOpen();

        // ---------------------------------------------------------
        // 1. BTree Sorting Test
        // ---------------------------------------------------------
        console.log("\n[Test 1] BTree Sorting Verification...");
        await db.root.createMap('dictionary');
        
        console.log("Inserting keys in random order: Zebra, Apple, Mango");
        await db.root.dictionary.set('Zebra', 'Striped Horse');
        await db.root.dictionary.set('Apple', 'Red Fruit');
        await db.root.dictionary.set('Mango', 'Tropical Fruit');

        console.log("Retrieving dictionary...");
        const dict = await db.root.dictionary;
        const keys = Object.keys(dict);
        console.log("Retrieved Keys (Should be sorted):", keys);
        
        if (keys[0] !== 'Apple' || keys[1] !== 'Mango' || keys[2] !== 'Zebra') {
            throw new Error(`Sorting Failed. Expected [Apple, Mango, Zebra], got [${keys.join(', ')}]`);
        }
        console.log("✅ BTree Sorting Correct.");

        // ---------------------------------------------------------
        // 2. Deep Nesting & Keys at Levels
        // ---------------------------------------------------------
        console.log("\n[Test 2] Deep Nesting & Keys at Levels...");
        // Hierarchy: root -> level1 -> level2 -> level3
        await db.root.createMap('level1');
        await db.root.level1.createMap('level2');
        await db.root.level1.level2.createMap('level3');
        
        // Add properties at different levels
        await db.root.level1.set('p1', 'Value at Level 1');
        await db.root.level1.level2.set('p2', 'Value at Level 2');
        await db.root.level1.level2.level3.set('target', 'Bingo! Deep Value Found.');

        console.log("\n--- Getting Level 1 Keys ---");
        const l1 = await db.root.level1;
        console.log("Level 1 Keys:", Object.keys(l1)); // Expected: ['level2', 'p1'] (sorted order)

        console.log("\n--- Getting Level 2 Keys ---");
        const l2 = await db.root.level1.level2;
        console.log("Level 2 Keys:", Object.keys(l2)); // Expected: ['level3', 'p2']

        console.log("\n--- Direct Access Deep Value ---");
        const val = await db.root.level1.level2.level3.target;
        console.log("Value retrieved via chain:", val);
        
        if (val !== 'Bingo! Deep Value Found.') throw new Error("Deep access failed");
        console.log("✅ Deep Nesting Correct.");

        // ---------------------------------------------------------
        // 3. Nested Arrays (Collection)
        // ---------------------------------------------------------
        console.log("\n[Test 3] Nested Arrays (Push, Slice, Length)...");
        // Create list at deep level: root -> level1 -> level2 -> myList
        await db.root.level1.level2.createList('myList');
        
        console.log("Pushing 5 items...");
        for(let i=0; i<5; i++) {
            await db.root.level1.level2.myList.push({ id: i, data: `Item ${i}` });
        }
        
        console.log("Getting List Length (via await/toJSON)...");
        const listFull = await db.root.level1.level2.myList;
        console.log("List Length:", listFull.length);
        if (listFull.length !== 5) throw new Error("List length mismatch");

        console.log("Slicing List (Items 1 to 3)...");
        const sliced = await db.root.level1.level2.myList.slice(1, 3); 
        // Slice(1, 3) should return index 1 and 2 (Total 2 items)
        
        console.log("Sliced Result:", JSON.stringify(sliced, null, 2));
        
        if (sliced.length !== 2) throw new Error("Slice length mismatch. Expected 2.");
        if (sliced[0].id !== 1) throw new Error("Slice content mismatch (Index 1).");
        if (sliced[1].id !== 2) throw new Error("Slice content mismatch (Index 2).");
        
        console.log("✅ Nested Array Operations Correct.");

    } catch (e) {
        console.error("\n❌ Test Failed:", e);
    } finally {
        await db.close();
    }
}

runTest();