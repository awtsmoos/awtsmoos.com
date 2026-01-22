// B"H
/**
 * @file omni_test.js
 * @description Validates the Unified Essence Stream with Chaos Protocol edge cases.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'omni_validation.db');

async function runTest() {
    console.error("B\"H - Starting Omni-Compression Chaos Validation...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        console.error("\n[1] Testing The Doubling Shield (Literal Transparency)...");
        // A string that contains our actual escape sequence patterns manually.
        // It should be escaped and returned EXACTLY as is.
        const literalChaos = "Chaos \x07\x01\x00 and \x07\x07 repeated \x07\x02\x64\x20";
        db.root.chaos = literalChaos;
        
        // Ensure disk sync to test full serialization cycle
        await db.waitForIdle();

        const resChaos = db.root.chaos;
        console.error(`    Input: ${JSON.stringify(literalChaos)}`);
        console.error(`    Result: ${JSON.stringify(resChaos)}`);
        
        if (resChaos !== literalChaos) {
            throw new Error(`Doubling Shield breached! Data corrupted. Expected: ${JSON.stringify(literalChaos)}, Got: ${JSON.stringify(resChaos)}`);
        }
        console.error("    ✅ Literal transparency verified.");

        console.error("\n[2] Testing Dynamic Tokenization (Hebrew & English)...");
        const pattern = "ברוך השם! Awtsmoos is Infinite. ";
        const massiveText = pattern.repeat(10); // Should trigger tokens
        db.root.massive = massiveText;
        await db.waitForIdle();
        
        const resMassive = db.root.massive;
        if (resMassive !== massiveText) {
             throw new Error(`Tokenized corruption. Got len: ${resMassive ? resMassive.length : 'null'}`);
        }
        console.error(`    Successfully tokenized ${massiveText.length} bytes.`);

        console.error("\n[3] Testing Massive RLE (The Infinite Void)...");
        const voidText = "Deep" + "\n".repeat(10000) + "End";
        db.root.void = voidText;
        await db.waitForIdle();
        
        const resVoid = db.root.void;
        if (resVoid !== voidText) throw new Error("RLE failed at scale");
        console.error(`    Contracted 10,000 newlines into a microscopic vessel.`);

        console.error("\n[4] Testing Mixed Gematria & Hebrew...");
        const mixed = "ID: 1712345678 - Name: ברוך - Session: 998877665544";
        db.root.mixed = mixed;
        await db.waitForIdle();
        
        const resMixed = db.root.mixed;
        if (resMixed !== mixed) throw new Error("Mixed stream corruption");
        console.error("    ✅ Mixed Achdus verified.");

        console.error("\nB\"H - Omni-Compression Test Passed!");

    } catch (e) {
        console.error("❌ OMNI TEST FAILED:", e);
        process.exit(1);
    } finally {
        db.close();
    }
}

runTest();