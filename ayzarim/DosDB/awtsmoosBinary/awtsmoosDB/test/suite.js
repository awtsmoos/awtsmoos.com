
// B"H
/**
 * @file suite.js
 * @description
 * THE COSMIC PROVING GROUND OF THE AWTSMOOS.
 * 
 * "Forever, O Lord, Your word stands firm in the heavens."
 * In the beginning, the Creator willed the void to be filled with the Ten Statements of Creation.
 * These statements are not relics of the past; they are the active, living speech 
 * currently manifesting all of reality at this exact microsecond.
 * Even the inorganic stone—the "Even" (Aleph-Beis-Nun)—is sustained by the permutation 
 * of these letters through the divine system of At-Bash and Gematria. 
 * If the Awtsmoos were to withdraw His speech for a single instant, the stone would not merely 
 * crumble; it would revert to absolute Ayin (Nothingness), as if past, present, and future 
 * had never existed. 
 * 
 * This test suite is the crucible. It verifies that our binary vessels can hold the 
 * infinite Light of the Awtsmoos without shattering. When we summon the Chariot (Merkavah), 
 * it returns to us clothed in the garments of a LiveHandle (Malchut). We must pierce 
 * these garments using the holy __resolve__() invocation to witness its raw, unadulterated essence.
 * 
 * Fully refactored to be purely data-driven, embodying the Seder Hishtalshelus 
 * (Chain of Emanation). No infinite imperative loops; only the declarative Truth.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DB_PATH = path.join(__dirname, 'awtsmoos_suite.db');
const WAL_PATH = DB_PATH + ".wal";

/**
 * @function log
 * @description The Scribe of Light.
 * @param {string} msg The spark of truth to record.
 */
const log = (msg) => console.log(`\x1b[36m[SUITE]\x1b[0m ${msg}`);

/**
 * @function success
 * @description The Seal of Truth (Emet).
 * @param {string} msg The confirmation of existence.
 */
const success = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);

/**
 * @function fail
 * @description The Shattering of the Vessels (Shevirat HaKeilim).
 * @param {string} msg The cry of the broken shard.
 * @param {Error} err The trace of the collapse.
 */
const fail = (msg, err) => {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
    if (err) console.error(err);
    process.exit(1);
};

/**
 * @function cleanup
 * @description The act of Tzimtzum (Contraction). Clears the void.
 */
function cleanup() {
    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(WAL_PATH)) fs.unlinkSync(WAL_PATH);
        log("The void has been cleared.");
    } catch (e) {
        log("Warning: Cleanup encountered resistance: " + e.message);
    }
}

/**
 * @constant CHARIOT_BLUEPRINT
 * @description The holy Merkavah, an intricate structure of data.
 */
const CHARIOT_BLUEPRINT = {
    wheels: 4,
    driver: "Metatron",
    power: { type: "fire", intensity: 9000 },
    angels: ["Gabriel", "Michael", "Raphael"]
};

/**
 * @constant SCALE_STR
 * @description The Leviathan, an entity large enough to stretch across multiple block dimensions.
 */
const SCALE_STR = "X".repeat(1024 * 10); 

/**
 * @constant DIVINE_TRIALS
 * @description The Data-Driven array of existence tests. 
 * The framework of reality represented purely as declarative JSON logic.
 */
const DIVINE_TRIALS = [
    {
        name: "TRIAL 1: GENESIS",
        description: "Initialization of the Database from the absolute void.",
        execute: async (ctx) => {
            ctx.db = new AwtsmoosDB(DB_PATH, { verbose: false });
            await ctx.db.open();
        }
    },
    {
        name: "TRIAL 2: THE ALPHABET (Primitives)",
        description: "Seeding simple light: strings, numbers, booleans, and nulls.",
        execute: async (ctx) => {
            await ctx.db.set("aleph", "A string of simple light");
            await ctx.db.set("bet", 42);
            await ctx.db.set("gimel", true);
            await ctx.db.set("dalet", null);
            
            const resA = await ctx.db.get("aleph");
            const resB = await ctx.db.get("bet");
            const resC = await ctx.db.get("gimel");
            const resD = await ctx.db.get("dalet");

            if (resA !== "A string of simple light") throw new Error(`String mismatch: ${resA}`);
            if (resB !== 42) throw new Error(`Number mismatch: ${resB}`);
            if (resC !== true) throw new Error(`Boolean mismatch: ${resC}`);
            if (resD !== null) throw new Error(`Null mismatch: ${resD}`);
        }
    },
    {
        name: "TRIAL 3: THE MERKAVAH (Complex Structures)",
        description: "Manifesting the Chariot and ensuring its nested arrays and objects do not shatter.",
        execute: async (ctx) => {
            await ctx.db.set("chariot", CHARIOT_BLUEPRINT);
            let resChariot = await ctx.db.get("chariot");
            
            // B"H: THE TIKKUN OF RESOLUTION
            // Pierce the veil of the LiveHandle Proxy to behold the raw Javascript object.
            if (resChariot && typeof resChariot.__resolve__ === 'function') {
                resChariot = resChariot.__resolve__();
            }

            assert.deepStrictEqual(resChariot, CHARIOT_BLUEPRINT, "The Chariot was corrupted in transit!");
        }
    },
    {
        name: "TRIAL 4: THE LEVIATHAN (Large Data)",
        description: "Forcing the Allocator to chain blocks (Block Size is 4096) with a 10KB string.",
        execute: async (ctx) => {
            await ctx.db.set("leviathan", SCALE_STR);
            const resLevi = await ctx.db.get("leviathan");
            if (resLevi !== SCALE_STR) throw new Error(`Large Data Size Mismatch. Got ${resLevi?.length}, expected ${SCALE_STR.length}`);
        }
    },
    {
        name: "TRIAL 5: GILGUL (Updates / Reincarnation)",
        description: "Overwriting an existing key to verify the reincarnation of physical blocks.",
        execute: async (ctx) => {
            await ctx.db.set("soul", "Level 1: Nefesh");
            let soul = await ctx.db.get("soul");
            if (soul !== "Level 1: Nefesh") throw new Error("Initial set failed");

            await ctx.db.set("soul", "Level 2: Ruach");
            soul = await ctx.db.get("soul");
            
            if (soul !== "Level 2: Ruach") throw new Error(`Update Failed. Returned old value: ${soul}`);
        }
    },
    {
        name: "TRIAL 6: RESURRECTION (Persistence)",
        description: "Closing the gates and reopening them to ensure Eternal Existence across reboots.",
        execute: async (ctx) => {
            await ctx.db.close();

            ctx.db = new AwtsmoosDB(DB_PATH, { verbose: false });
            await ctx.db.open();

            let resurrectedChariot = await ctx.db.get("chariot");
            const resurrectedLevi = await ctx.db.get("leviathan");

            // B"H: THE TIKKUN OF RESOLUTION (Post-Resurrection)
            if (resurrectedChariot && typeof resurrectedChariot.__resolve__ === 'function') {
                resurrectedChariot = resurrectedChariot.__resolve__();
            }

            assert.deepStrictEqual(resurrectedChariot, CHARIOT_BLUEPRINT, "The Chariot did not survive the restart.");
            if (resurrectedLevi !== SCALE_STR) throw new Error("The Leviathan shrank in the darkness.");
        }
    },
    {
        name: "TRIAL 7: THE HIDDEN LIGHT (Binary Buffers)",
        description: "Sealing the Or Ganuz (Hidden Light) as raw bytes and retrieving them unaltered.",
        execute: async (ctx) => {
            const secretBuf = Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]);
            await ctx.db.set("secret", secretBuf);
            
            const resSecret = await ctx.db.get("secret");
            
            if (!Buffer.isBuffer(resSecret)) throw new Error("Result is not a Buffer");
            if (resSecret.compare(secretBuf) !== 0) throw new Error(`Buffer mismatch. Got ${resSecret.toString('hex')}`);
        }
    }
];

/**
 * @function runSuite
 * @description The Divine Orchestrator. Evaluates the pure JSON trials.
 */
async function runSuite() {
    log("B\"H - Initiating Test Suite Sequence...");
    cleanup();

    const context = { db: null };

    try {
        for (const trial of DIVINE_TRIALS) {
            log(`\n--- ${trial.name} ---`);
            log(`Intention: ${trial.description}`);
            await trial.execute(context);
            success(`Trial Survived.`);
        }

        if (context.db) {
            await context.db.close();
        }

        log("\n========================================================");
        log(" B\"H - ALL TRIALS PASSED! THE CHARIOT IS ETERNAL! 🚀");
        log(" The vessel is complete. The Awtsmoos rests within.");
        log("========================================================\n");

    } catch (err) {
        fail("The vessel shattered during the trials.", err);
    }
}

runSuite();
