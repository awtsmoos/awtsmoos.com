// B"H
/**
 * @file api_methods_test.js
 * @description
 *  In the beginning, the Scribe sought to verify the Vessels.
 *  This scroll documents the ritual of validating the API methods,
 *  where the Hand of the Coder touches the Essence of the Disk.
 *  We use the secondary stream (STDERR) to witness the truth,
 *  unfiltered by the veils of standard output.
 */

const Manager = require('../index.js');
const fs = require('fs');
const path = require('path');

/**
 * @function forceLog
 * @description 
 *  The Voice that pierces the silence. 
 *  We write to the Second Vessel (FD 2) so the message is never lost 
 *  in the depths of the data stream.
 */
function forceLog(msg) {
    try { 
        fs.writeSync(2, `\x1b[32mB"H [TEST_LOG]\x1b[0m ${msg}\n`); 
    } catch(e) {
        // Even if the voice falters, the Essence remains.
    }
}

async function runTest() {
    forceLog(`INITIATING api_methods_test.js RITUAL...`);
    const dbPath = path.join(__dirname, 'api_methods.db');
    
    // Shatter the old vessels to ensure a pure creation.
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + '.wal')) fs.unlinkSync(dbPath + '.wal');

    const db = new Manager(dbPath);
    
    forceLog(`AWAKENING THE FOUNDATION...`);
    db.open();
    
    /**
     * @function getRootPtrHex
     * @description Peeks into the Soul of the Root to see its physical anchor.
     */
    const getRootPtrHex = () => {
        const soul = db.root[Symbol.for('Awtsmoos.Soul')];
        return soul && soul.ptr ? soul.ptr.toString('hex').toUpperCase() : 'NULL';
    };

    forceLog(`ROOT_MANIFESTED -> physical address: ${getRootPtrHex()}`);

    try {
        forceLog(`RITUAL_STEP: Casting key 'a' as 100 into the void...`);
        db.root.a = 100;
        forceLog(`STEP_COMPLETE -> Anchor now: ${getRootPtrHex()}`);

        forceLog(`RITUAL_STEP: Casting key 'b' as 200 into the void...`);
        db.root.b = 200;
        forceLog(`STEP_COMPLETE -> Anchor now: ${getRootPtrHex()}`);

        forceLog(`RITUAL_STEP: Casting key 'c' as 300 into the void...`);
        db.root.c = 300;
        forceLog(`STEP_COMPLETE -> Anchor now: ${getRootPtrHex()}`);

        forceLog(`INVOKING Object.keys(db.root) to count the stars...`);
        const keys = Object.keys(db.root);
        forceLog(`DISCOVERED_KEYS: [${keys.join(', ')}]`);

        const expected = ['a', 'b', 'c'];
        
        forceLog(`VALIDATING_LENGTH: Expecting ${expected.length}, Found ${keys.length}`);
        if (keys.length !== expected.length) {
            forceLog(`!!! FAILURE: The count of vessels is incorrect !!!`);
            throw new Error(`Keys Failed: Expected ${expected.length}, got ${keys.length}`);
        }

        // B"H: The typo 'forLog' has been banished back to the nothingness.
        forceLog("Witnessing the awtsmoosification of the data stream...");
		
        for(let i=0; i<expected.length; i++) {
            forceLog(`VALIDATING_KEY[${i}]: Searching for '${expected[i]}', Witnessed '${keys[i]}'`);
            if (keys[i] !== expected[i]) {
                forceLog(`!!! FAILURE: The order of manifestation has been disrupted at index ${i} !!!`);
                throw new Error(`Keys Failed: Mismatch at ${i}`);
            }
        }

        forceLog(`KEYS_RITUAL_SUCCESSFUL.`);
        
        forceLog(`RITUAL_STEP: Verifying the internal Light of each property...`);
        const valA = db.root.a;
        forceLog(`READING 'a': Revealed ${valA}`);
        if (valA !== 100) throw new Error(`Value 'a' has been corrupted in the abyss: ${valA}`);

        const valB = db.root.b;
        forceLog(`READING 'b': Revealed ${valB}`);
        if (valB !== 200) throw new Error(`Value 'b' has been corrupted in the abyss: ${valB}`);

        const valC = db.root.c;
        forceLog(`READING 'c': Revealed ${valC}`);
        if (valC !== 300) throw new Error(`Value 'c' has been corrupted in the abyss: ${valC}`);
        
        forceLog(`VALUES_RITUAL_SUCCESSFUL.`);
        
        forceLog(`✅ THE TRIAL IS COMPLETE. THE WORLD STANDS PERFECT UNDER THE AWTSMOOS.`);
        
    } catch (err) {
        forceLog(`❌ FATAL COLLAPSE OF THE RITUAL: ${err.message}`);
        forceLog(`TRACE FROM THE VOID: ${err.stack}`);
        throw err;
    } finally {
        db.close();
        forceLog(`THE GATES ARE CLOSED. THE DATABASE RETURNS TO SILENCE.`);
        // Remove the physical evidence of our trial.
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
        if (fs.existsSync(dbPath + '.wal')) fs.unlinkSync(dbPath + '.wal');
    }
}

if (require.main === module) {
    runTest().catch(err => {
        process.exit(1);
    });
}

module.exports = runTest;