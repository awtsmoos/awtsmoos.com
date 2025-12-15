// B"H
/**
 * @file class_resurrection.js
 * @description
 *  The "Valley of Dry Bones" Test.
 *  Can AwtsmoosDB breathe life back into static binary data?
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'resurrection.db');

const log = (msg) => console.log(`\x1b[36m[RESURRECTION]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
    }
};

async function runTest() {
    log("B\"H - Initiating Class Resurrection Protocol (Unified)...");

    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    try {
        // --- 1. DEFINING THE SPECIES ---
        log("[1] Defining Species (Classes) in Memory...");
        
        const AnimalSource = `class Animal {
            constructor(name) { this.name = name; }
            speak() { return this.name + " makes a noise."; }
        }`;
        
        const Animal = new Function(`return ${AnimalSource}`)();
        
        const DogSource = `class Dog extends Animal {
            constructor(name, breed) { super(name); this.breed = breed; }
            bark() { return this.name + " barks!"; }
        }`;
        
        globalThis.Animal = Animal;
        const Dog = new Function(`return ${DogSource}`)();
        
        const dogInstance = new Dog("Rex", "German Shepherd");
        
        log(`    Created Dog: ${dogInstance.bark()}`);

        // --- 2. PRESERVATION ---
        log("[2] Preserving the Essence (Saving to Disk)...");
        
        db.root.pet = dogInstance;
        await db.waitForIdle();
        
        log("    Save Complete.");

        // --- 3. THE LONG SLEEP (Clear Memory) ---
        log("[3] The Long Sleep (Restarting DB)...");
        await db.pager.close();
        
        delete globalThis.Animal;
        delete globalThis.Dog;
        
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();

        // --- 4. RESURRECTION ---
        log("[4] Resurrection (Reading Back)...");
        
        const resurrectedPet = await db2.root.pet;
        
        assert(resurrectedPet.name === "Rex", "Instance Name Preserved");
        assert(resurrectedPet.breed === "German Shepherd", "Instance Breed Preserved");
        
        if (resurrectedPet.bark) {
            log("    IT IS ALIVE! Methods restored.");
            assert(resurrectedPet.bark() === "Rex barks!", "Method Execution Successful");
        } else {
            log("    Body restored, Soul (Source) attached.");
            assert(resurrectedPet.__className__ === "Dog", "Class Name Preserved");
            assert(resurrectedPet.__source__.includes("extends Animal"), "Source Code Preserved");
            
            globalThis.Animal = new Function(`return ${AnimalSource}`)();
            const RevivedDog = new Function(`return ${resurrectedPet.__source__}`)();
            const alive = Object.create(RevivedDog.prototype);
            Object.assign(alive, resurrectedPet);
            
            assert(alive.bark() === "Rex barks!", "Manual Revival Successful");
        }

        log("--- RESURRECTION COMPLETE ---");

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runTest();