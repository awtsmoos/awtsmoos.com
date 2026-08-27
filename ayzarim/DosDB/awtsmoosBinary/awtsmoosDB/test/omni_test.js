
// B"H
/**
 * @file omni_test.js
 * @chapter Chapter 9: The Contraction of Word
 */
const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'omni.db');

function runTest() {
    log("Starting Scribe Validation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        log("[1] The Doubling Shield");
        const chaosPattern = "\x07 Special \x07\x07 Token \x07 Protocol \x07";
        db.root.test = chaosPattern;
        
        db.waitForIdle();
        const res = db.root.test;
        if (res !== chaosPattern) throw new Error("Transparency shattered.");

        log("[2] Giant Expansion Check");
        const massive = "Spark ".repeat(1000);
        db.root.scroll = massive;
        db.waitForIdle();
        
        if (db.root.scroll !== massive) throw new Error("Giant string corrupted.");

        log("✅ PERFECTION.");
        db.close();
    } catch(e) {
        console.error(e.stack);
        process.exit(1);
    }
}
function log(msg) { console.log(`\x1b[36mB"H [OMNI]\x1b[0m ${msg}`); }
runTest();
