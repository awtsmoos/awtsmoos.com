// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs').promises;

const DB_PATH = './test_complex.db';

async function runTest() {
    try {
        await fs.unlink(DB_PATH).catch(() => {});
        await fs.unlink(DB_PATH + '.wal').catch(() => {});
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();
    
    console.log("[Test 1] BTree Sorting Verification...");
    // B"H: New marker assignment paradigm.
    db.root.dictionary = new db.Map();
    
    const words = ["zebra", "apple", "mango", "banana", "zen", "apricot"];
    for(let w of words) {
        await db.root.dictionary.set(w, `Meaning of ${w}`);
    }
    
    let last = "";
    for await (const k of db.root.dictionary) {
        if (k.key < last) throw new Error("Unsorted Keys!");
        last = k.key;
        console.log(`Key: ${k.key}`);
    }
    console.log("✅ Dictionary Sorted.");

    console.log("[Test 2] Nested Objects & Arrays...");
    await db.root.set("config", {
        theme: "dark",
        retries: 5,
        history: [1, 2, 3, { event: "login" }]
    });

    const cfg = await db.root.config;
    if (cfg.theme !== "dark" || cfg.history[3].event !== "login") {
        throw new Error("Complex Object mismatch");
    }
    console.log("✅ Nested Object Verified.");
    
    console.log("[Test 3] Collection in Map...");
    db.root.users = new db.Map();
    db.root.users.active = new db.List();
    await db.root.users.active.push({ id: 1, name: "Reuven" });
    await db.root.users.active.push({ id: 2, name: "Shimon" });
    
    const users = await db.root.users.active;
    if (users.length !== 2 || users[1].name !== "Shimon") {
        throw new Error("Nested Collection Mismatch");
    }
    console.log("✅ Nested Collection Verified.");
    console.log("B\"H - Complex Test Passed.");
}

runTest().catch(console.error);