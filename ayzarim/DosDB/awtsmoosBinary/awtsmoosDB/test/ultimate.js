// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const crypto = require('crypto');

async function runTest() {
    const dbPath = './ultimate_stress.db';
    // Clean up previous run
    if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch(e) {}
    }
    
    // Debug off for speed
    const db = new AwtsmoosDB(dbPath, { debug: false });
    
    try {
        console.log("B\"H - Starting ULTIMATE EXTREME Stress Test...");
        await db.ensureOpen();
        
        const DEPTH = 15; // Deep nesting level
        const BREADTH = 100; // Items per map/list
        
        // ---------------------------------------------------------
        // 1. The Tower of Babel (Deep Nesting)
        // ---------------------------------------------------------
        console.log(`\n[Extreme] Phase 1: Building a Tower ${DEPTH} levels deep...`);
        let current = db.root;
        let pathStr = "root";
        
        for (let i = 1; i <= DEPTH; i++) {
            const key = `level_${i}`;
            // Dynamically create maps down the chain
            await current.createMap(key);
            // Move pointer down
            current = current[key];
            pathStr += `.${key}`;
        }
        
        console.log(`[Extreme] Reached ${pathStr}`);
        console.log(`[Extreme] Setting value at the penthouse...`);
        await current.set("penthouse_secret", "The view is nice here.");
        
        // Verify immediately via direct chain
        const val = await current.penthouse_secret;
        if (val !== "The view is nice here.") throw new Error("Penthouse check failed");
        console.log("✅ Tower built and verified.");

        // ---------------------------------------------------------
        // 2. The Library (Sorting & Random Insert)
        // ---------------------------------------------------------
        console.log(`\n[Extreme] Phase 2: The Library (Sorting ${BREADTH} keys)...`);
        // Navigate to level 5 for the library
        const libHandle = db.root.level_1.level_2.level_3.level_4.level_5;
        await libHandle.createMap('library');
        
        // Generate random keys
        const books = [];
        for(let i=0; i<BREADTH; i++) {
            books.push(crypto.randomBytes(4).toString('hex'));
        }
        // Insert unsorted
        for(let book of books) {
            await libHandle.library.set(book, `Content of ${book}`);
        }
        
        // Verify Sorted
        const libObj = await libHandle.library;
        const keys = Object.keys(libObj);
        
        const sortedBooks = [...books].sort();
        let sortErr = false;
        for(let i=0; i<keys.length; i++) {
            if (keys[i] !== sortedBooks[i]) {
                sortErr = true;
                console.error(`Mismatch at ${i}: Got ${keys[i]}, Expected ${sortedBooks[i]}`);
                break;
            }
        }
        if (sortErr) throw new Error("Library is not sorted!");
        console.log("✅ Library is perfectly sorted.");

        // ---------------------------------------------------------
        // 3. The Archive (Collections & Blobs)
        // ---------------------------------------------------------
        console.log(`\n[Extreme] Phase 3: The Archive (Deep List & Heavy Blobs)...`);
        const archiveHandle = db.root.level_1.level_2.level_3.level_4.level_5.level_6.level_7;
        await archiveHandle.createList('archive');
        
        const items = [];
        // Push items
        for(let i=0; i<50; i++) {
            let item;
            if (i % 5 === 0) {
                // Large Blob (Chain test) - 8KB
                item = crypto.randomBytes(8192).toString('base64'); 
            } else if (i % 3 === 0) {
                // Nested Object
                item = { id: i, tags: ['a', 'b', 'c'], meta: { nested: true } };
            } else {
                // Primitive
                item = i * 1000;
            }
            items.push(item);
            await archiveHandle.archive.push(item);
            if (i % 10 === 0) process.stdout.write('.');
        }
        process.stdout.write('\n');
        
        // Verify Slice
        const slice = await archiveHandle.archive.slice(0, 50);
        if (slice.length !== 50) throw new Error(`Archive length mismatch. Got ${slice.length}`);
        
        // Deep Check of a large blob
        if (slice[0] !== items[0]) throw new Error("Archive Item 0 mismatch (Large Blob)");
        // Deep Check of an object
        if (JSON.stringify(slice[3]) !== JSON.stringify(items[3])) throw new Error("Archive Item 3 mismatch (Object)");
        
        console.log("✅ Archive verified (Blobs & Objects intact).");

        // ---------------------------------------------------------
        // 4. Chaos (Concurrency)
        // ---------------------------------------------------------
        console.log(`\n[Extreme] Phase 4: Chaos (Concurrent Reads/Writes)...`);
        const ops = [];
        
        // Reader drones
        for(let i=0; i<20; i++) {
            ops.push((async () => {
                const lib = await db.root.level_1.level_2.level_3.level_4.level_5.library;
            })());
        }
        
        // Writer drones (Updating penthouse)
        for(let i=0; i<20; i++) {
            ops.push((async () => {
                await current.set("visitor_" + i, Date.now());
            })());
        }

        // Appender drones (Archive)
        for(let i=0; i<10; i++) {
            ops.push((async () => {
                await archiveHandle.archive.push(`Concurrent_Entry_${i}`);
            })());
        }
        
        await Promise.all(ops);
        console.log("✅ Chaos survived.");

        // ---------------------------------------------------------
        // 5. The Great Flood (Persistence)
        // ---------------------------------------------------------
        console.log(`\n[Extreme] Phase 5: The Great Flood (Restart)...`);
        await db.close();
        
        const db2 = new AwtsmoosDB(dbPath, { debug: false });
        await db2.ensureOpen();
        
        // Verify Penthouse via Reconstructed Chain
        let deepPtr = db2.root;
        for (let i = 1; i <= DEPTH; i++) deepPtr = deepPtr[`level_${i}`];
        
        const secret = await deepPtr.penthouse_secret;
        if (secret !== "The view is nice here.") throw new Error("Penthouse collapsed after flood.");
        
        // Verify Archive Count (50 original + 10 concurrent)
        const archivePtr = db2.root.level_1.level_2.level_3.level_4.level_5.level_6.level_7.archive;
        const survivors = await archivePtr.slice(0, 1000);
        console.log(`Archive Survivors: ${survivors.length}`);
        
        if (survivors.length !== 60) throw new Error(`Archive lost items. Expected 60, got ${survivors.length}`);
        
        // Verify Large Blob persistence after restart
        if (survivors[0] !== items[0]) throw new Error("Large blob corrupted after restart.");

        console.log("\n✅ ULTIMATE STRESS TEST PASSED. THE DB IS SOLID.");
        await db2.close();

    } catch (e) {
        console.error("\n❌ ULTIMATE FAILURE:", e);
    }
}

runTest();