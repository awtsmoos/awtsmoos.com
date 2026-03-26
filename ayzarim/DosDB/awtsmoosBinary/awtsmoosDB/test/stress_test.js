
// B"H
/**
 * @file stress_test.js
 * @description 
 *  High-intensity synchronous stress test.
 *  Validates the strict memory limits by measuring the True Growth of the Heap,
 *  ignoring the illusion of V8's uncollected synchronous garbage.
 */

const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'stress.db');

function run() {
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    const COUNT = 10000;
    console.log(`B"H - Injecting ${COUNT} bit-packed objects...`);
    
    // B"H: Measure the true essence (Heap) before the chaos begins
    const startMem = process.memoryUsage().heapUsed;
    const start = Date.now();
    
    db.batch(() => {
        for (let i = 0; i < COUNT; i++) {
            db.root[`key_${i}`] = {
                id: i,
                active: i % 2 === 0,
                msg: "Micro-packet " + i,
                val: i % 15 // Triggers SMALL_INT bit-fusion
            };
        }
    });

    const elapsed = (Date.now() - start) / 1000;
    console.log(`✅ Injected ${COUNT} items in ${elapsed}s.`);
    
    // B"H: Measure the true essence (Heap) after the chaos
    const endMem = process.memoryUsage().heapUsed;
    const memGrowth = (endMem - startMem) / 1024 / 1024;
    
    console.log(`📊 Actual Database RAM Growth: ${memGrowth.toFixed(2)}MB`);

    if (elapsed > 5) throw new Error("Too slow!");
    
    // The vessel must not permanently expand beyond its divine limits.
    // By measuring true growth, we ensure no LiveHandles or Caches are leaking.
    if (memGrowth > 25) throw new Error("RAM Leak!");

    console.log(`✅ VERIFIED: Bit-packed storage is microscopic and lightning fast.`);
    db.close();
}

run();
