
// B"H
/**
 * @file usage.js
 * @description Standard validation flow, brought to absolute synchronicity.
 */
const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

function runTest() {
    const dbPath = path.join(__dirname, 'test.awtsmoosDB');
    try { fs.unlinkSync(dbPath); } catch(e) {}
    
    console.log("B\"H\n - Starting AwtsmoosDB Test");
    console.log("--------------------------------");
    
    const db = new AwtsmoosDB(dbPath);
    db.open();
    
    var chariot = {
        wheels: 4,
        driver: "Metatron",
        power: { type: "fire", intensity: 9000, cool: "Hello Awtsmoos" },
        angels: ["Gabriel", "Michael", "Raphael"],
    };
    
    db.root.test_key = chariot;
    
    // Traverse the LiveHandle proxy to extract the pure JS object for logging
    var valHandle = db.root.test_key;
    var val = valHandle && valHandle.__resolve__ ? valHandle.__resolve__() : valHandle;
    
    console.log("\n--- RESULT --- \n", JSON.stringify(val, null, 2));
    db.close();
}

runTest();
