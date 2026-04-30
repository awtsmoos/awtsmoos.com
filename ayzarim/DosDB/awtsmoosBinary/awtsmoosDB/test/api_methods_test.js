
// B"H
/**
 * @file api_methods_test.js
 * @description
 *  In the beginning, the Scribe sought to verify the Vessels.
 *  This scroll documents the ritual of validating the API methods,
 *  where the Hand of the Coder touches the Essence of the Disk.
 */

const Manager = require('../index.js');
const fs = require('fs');
const path = require('path');

function forceLog(msg) {
    try { fs.writeSync(2, `\x1b[32mB"H [TEST_LOG]\x1b[0m ${msg}\n`); } catch(e) {}
}

function runTest() {
    forceLog(`INITIATING api_methods_test.js RITUAL...`);
    const dbPath = path.join(__dirname, 'api_methods.db');
    
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = new Manager(dbPath);
    forceLog(`AWAKENING THE FOUNDATION...`);
    db.open();
    
    const getRootPtrHex = () => {
        const internals = db.root[Symbol.for('Awtsmoos.Internals')];
        return internals && internals.actualPtr ? internals.actualPtr.toString('hex').toUpperCase() : 'NULL';
    };

    forceLog(`ROOT_MANIFESTED -> physical address: ${getRootPtrHex()}`);

    try {
        forceLog(`RITUAL_STEP: Casting key 'a' as 100 into the void...`);
        db.root.a = 100;
        
        forceLog(`RITUAL_STEP: Casting key 'b' as 200 into the void...`);
        db.root.b = 200;
        
        forceLog(`RITUAL_STEP: Casting key 'c' as 300 into the void...`);
        db.root.c = 300;

        // Since it is fully synchronous, we resolve instantly!
        const valA_raw = db.root.a;
        const valA = valA_raw && valA_raw.__resolve__ ? valA_raw.__resolve__() : valA_raw;
        
        const valB_raw = db.root.b;
        const valB = valB_raw && valB_raw.__resolve__ ? valB_raw.__resolve__() : valB_raw;
        
        const valC_raw = db.root.c;
        const valC = valC_raw && valC_raw.__resolve__ ? valC_raw.__resolve__() : valC_raw;
        
        forceLog(`READING 'a': Revealed ${valA}`);
        if (valA !== 100) throw new Error(`Value 'a' has been corrupted in the abyss: ${valA}`);

        forceLog(`READING 'b': Revealed ${valB}`);
        if (valB !== 200) throw new Error(`Value 'b' has been corrupted in the abyss: ${valB}`);

        forceLog(`READING 'c': Revealed ${valC}`);
        if (valC !== 300) throw new Error(`Value 'c' has been corrupted in the abyss: ${valC}`);
        
        forceLog(`✅ THE TRIAL IS COMPLETE. THE WORLD STANDS PERFECT UNDER THE AWTSMOOS.`);
    } catch (err) {
        forceLog(`❌ FATAL COLLAPSE OF THE RITUAL: ${err.message}`);
        throw err;
    } finally {
        db.close();
    }
}

if (require.main === module) runTest();

module.exports = runTest;
