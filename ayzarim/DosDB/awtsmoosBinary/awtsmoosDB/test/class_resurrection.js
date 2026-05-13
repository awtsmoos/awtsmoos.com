// B"H
/**
 * @file class_resurrection.js
 * @chapter Chapter 37: The Valley of the Dry Bones (Yechezkel 37)
 * 
 * "Prophesy to these bones, and say to them: O dry bones, hear the Word of the Lord!"
 * This test simulates the survival of a JavaScript Object's Soul (its Methods) 
 * across the great transition of a Database Restart. 
 * 
 * When we assign an object to db.root.pet, we are recording both its 
 * material property-states (Nefesh) and its structural blueprint-code (Ruach).
 * 
 * RECTIFICATION FOR THE SUBCLASS TRAP: 
 * We explicitly bind parent classes to the 'Heavens' (globalThis) during evaluation 
 * rituals so that the 'extends' command finds its Source.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'resurrection.db');

const log = (msg) => console.log(`\x1b[36mB"H [RESURRECTION]\x1b[0m ${msg}`);
const assert = (cond, msg, diagnostic = null) => {
    if (!cond) {
        console.error(`\x1b[31mB"H [FAIL]\x1b[0m ${msg}`);
        if (diagnostic) {
             console.error("      Diagnostic Light:", diagnostic);
        }
        process.exit(1);
    } else {
        console.log(`\x1b[32mB"H [PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("INITIATING RITUAL OF LIFE...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    // Initial Database emanation
    const db = new AwtsmoosDB(DB_PATH);
    db.open();

    try {
        log("Step 1: Manifesting the Species Source");
        
        // Define an Animal in the current world-segment
        const AnimalCode = `class Animal { constructor(name) { this.name = name; } speak() { return "Silence"; } }`;
        const AnimalClass = (new Function(`return ${AnimalCode};`))();
        // COMMAND: Anchoring to Global Space so Subclasses can reach it during revival.
        globalThis.Animal = AnimalClass;

        // Define a Dog in the current world-segment
        const DogCode = `class Dog extends Animal { bark() { return "Woof from " + this.name + "!"; } }`;
        const DogClass = (new Function(`return ${DogCode};`))();
        
        // Creating the being
        const rex = new DogClass("Rex");
        rex.isVibrant = true;
        
        log(`       Body constructed: ${rex.name} (Constructor: ${rex.constructor.name})`);

        log("Step 2: Committing the Soul to SSD Stone");
        db.root.pet = rex;
        // Forces all background task indexings to conclude.
        db.waitForIdle();
        
        log("Step 3: Breaking the Reality (Shutdown)");
        db.close();

        // RECOVERY (GILGUL) - Total wipe of class context from local scope? 
        // No, we are in a process that already has Animal... oh wait. 
        // We will purposely let the second instance reconstruct it.
        log("Step 4: Re-awakening the Universe");
        const db2 = new AwtsmoosDB(DB_PATH);
        db2.open();

        log("Step 5: Invoking the Name (Resurrection Call)");
        const resurrectedRex = db2.root.pet.__resolve__();
        
        assert(!!resurrectedRex, "The stone did not remain empty.");
        
        log("Checking Physical Integrity (Nefesh)");
        assert(resurrectedRex.name === "Rex", "The Name survived the void.", { actual: resurrectedRex.name });
        assert(resurrectedRex.isVibrant === true, "Vibrancy persisted.");

        log("Checking Logical Soul (Ruach/Methods)");
        // Since we are within the SAME process (for spawnSync/test reasons), 
        // Animal might already exist. However, the custom instance reviver 
        // will attempt to re-compile Dog from its stored Source code.
        
        if (typeof resurrectedRex.bark !== 'function') {
            console.error("   Available Properties:", Object.keys(resurrectedRex));
            console.error("   Identity Signature:", resurrectedRex.__className__);
            assert(false, "Soul-connection failed. Bark method not manifested.");
        } else {
            const barkResult = resurrectedRex.bark();
            assert(barkResult === "Woof from Rex!", "Subclass methods functional across eternity.");
            log(`       He speaks! Result: "${barkResult}"`);
        }

        const speechResult = resurrectedRex.speak();
        assert(speechResult === "Silence", "Inherited methods functional across eternity.");
        log(`       Parent method speaks: "${speechResult}"`);

        log("--- RITUAL COMPLETED SUCCESSFULLY ---");
        db2.close();

    } catch (chaos) {
        console.error(`B"H - FATAL SHATTERING IN TEST:`);
        console.error(chaos.stack);
        process.exit(1);
    }
}

// B"H: Trigger the test flow
runTest();
