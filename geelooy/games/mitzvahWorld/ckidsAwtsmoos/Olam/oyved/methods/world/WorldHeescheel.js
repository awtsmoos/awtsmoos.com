
/**
 * B"H
 * @module WorldHeescheel
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE INNER SANCTUARY OF CREATION — WorldHeescheel.js                          ║
 * ║                                                                                  ║
 * ║  "In the beginning G-d created the heavens and the earth." (Bereishis 1:1)    ║
 * ║                                                                                  ║
 * ║  This is the static executor of world creation inside the Web Worker.          ║
 * ║  It receives the Olam class, instantiates it, feeds it the soul-manifest,      ║
 * ║  and fires the canonical lifecycle events back to the Main Thread.             ║
 * ║                                                                                  ║
 * ║  NOW WITH INTENSE TIMESTAMP LOGGING:                                            ║
 * ║  Every single step from Worker boot → game started fires a console timestamp.  ║
 * ║  You will ALWAYS know where the system is, exactly how long each step takes,  ║
 * ║  and which entity is causing any slowdown.                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file WorldHeescheel.js
 * @memberof Olam/oyved/methods/world
 */

import HTMLMessenger from "./HTMLMessenger.js";
import TimeTracker from "../../../../utils/TimeTracker.js";

/**
 * @class WorldHeescheel
 * @description
 * Static executor for world creation inside the Worker thread.
 * Receives the OlamClass constructor and the pawsawch options payload,
 * runs the full creation pipeline, and signals readiness via postMessage.
 */
export default class WorldHeescheel {

    /**
     * @static
     * @async
     * @method execute
     * @description
     * The "Let there be!" — the full 7-verse creation sequence.
     *
     * @param {Object}   me         - Worker context: { olam, promiseMap, ... }
     * @param {Function} OlamClass  - The Olam constructor class.
     * @param {Object}   options    - Payload from main thread: { userInfo, systemInfo }
     *                               userInfo = { ...worldDayuh } = { shaym, nivrayim, ... }
     * @returns {Promise<Object>} tawchlees result object
     */
    static async execute(me, OlamClass, options) {
        TimeTracker.start("WORKER_GENESIS");
        const execStart = performance.now();
        console.log(`B"H - 🌌 [WorldHeescheel] execute() START. Options keys: ${Object.keys(options || {}).join(', ')}`);

        if (!OlamClass) {
            console.error('B"H - 🚨 [WorldHeescheel] FATAL: OlamClass is null. Cannot create from nothing!');
            return { tawchlees: { message: "Class Nullified", code: "ERROR" } };
        }

        // ── VERSE 1: Birth of the Olam ──────────────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 1: Birthing Olam instance...`);
        me.olam = new OlamClass();
        if (options.set) Object.assign(me.olam, options.set);
        if (options.systemInfo?.set) Object.assign(me.olam, options.systemInfo.set);
        TimeTracker.log("WORKER_GENESIS", "Olam Class Instantiated.");
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 1: ✅ Olam instance ready.`);

        // ── VERSE 2: Initialization ────────────────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 2: Running olam.init()...`);
        await me.olam.init();
        TimeTracker.log("WORKER_GENESIS", "Olam Core Faculties Grafted.");
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 2: ✅ olam.init() complete.`);

        // ── VERSE 3: Handshake Protocols ─────────────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 3: Binding postMessage event hooks...`);

        me.olam.on("hide loading screen", () => {
            console.log(`B"H - [+${_ms(execStart)}ms] 📨 Worker→Main: hideLoadingScreen`);
            postMessage({ type: "hideLoadingScreen" });
        });

        me.olam.on("increased percentage", (info = {}) => {
            console.log(`B"H - [+${_ms(execStart)}ms] 📨 Worker→Main: increasedOlamLoading ${info.action || ''} (${(info.amount||0).toFixed(1)}%)`);
            postMessage({ type: "increasedOlamLoading", payload: info });
        });

        me.olam.on("ready to start game", () => {
            TimeTracker.log("WORKER_GENESIS", "Sending Game Ignition Signal.");
            console.log(`B"H - [+${_ms(execStart)}ms] 🎉 Worker→Main: game started + loadedWorld`);
            postMessage({ type: "game started", payload: true });
            postMessage({ type: "loadedWorld", payload: true });
        });

        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 3: ✅ Handshakes bound.`);

        // ── VERSE 4: HTML Messenger ────────────────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 4: Binding HTMLMessenger...`);
        HTMLMessenger.bind(me);
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 4: ✅ HTMLMessenger bound.`);

        // ── VERSE 5: Reading the Soul Manifest ────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 5: Extracting soul manifest from options...`);
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 5: options keys = ${Object.keys(options).join(', ')}`);
        if (options.userInfo) {
            console.log(`B"H - [+${_ms(execStart)}ms] VERSE 5: userInfo keys = ${Object.keys(options.userInfo).join(', ')}`);
        }

        me.olam.ayshPeula("increase loading percentage", {
            amount: 10,
            action: "Processing Divine Blueprints..."
        });

        /**
         * @type {Object} worldData
         * Priority: explicit worldDayuh → userInfo spread → raw options fallback.
         */
        const worldData = options.worldDayuh || options.userInfo || options;
        const nivrayim  = worldData.nivrayim || {};
        const typeCount = Object.keys(nivrayim).length;

        console.log(
            `B"H - [+${_ms(execStart)}ms] VERSE 5: ✅ Soul manifest extracted.` +
            ` Found ${typeCount} type(s): ${Object.keys(nivrayim).join(', ')}`
        );

        if (typeCount === 0) {
            console.warn(
                `B"H - [+${_ms(execStart)}ms] ⚠️ VERSE 5: nivrayim is EMPTY! ` +
                `userInfo keys: ${options.userInfo ? Object.keys(options.userInfo).join(', ') : 'N/A'}`
            );
        }

        TimeTracker.log("WORKER_GENESIS", "Beginning loadNivrayim sequence.");

        // ── VERSE 6: The Six Days of Creation ─────────────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 6: Calling loadNivrayim with ${typeCount} types...`);
        const loadStart = performance.now();

        const result = await me.olam.loadNivrayim(nivrayim);

        const loadMs = (performance.now() - loadStart).toFixed(1);
        TimeTracker.log("WORKER_GENESIS", `loadNivrayim complete. Manifested ${result?.length || 0} souls in ${loadMs}ms.`);
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 6: ✅ loadNivrayim DONE. ${result?.length || 0} souls. Took ${loadMs}ms.`);

        if (!result || result.length === 0) {
            console.warn(
                `B"H - [+${_ms(execStart)}ms] ⚠️ VERSE 6: Manifestation returned 0 souls. ` +
                `Check that AWTSMOOS exports match nivrayim type keys: ${Object.keys(nivrayim).join(', ')}`
            );
        }

        // ── VERSE 7: The Signal — Let there be light! ─────────────────────
        console.log(`B"H - [+${_ms(execStart)}ms] VERSE 7: Firing 'ready to start game'...`);
        me.olam.ayshPeula("ready to start game");

        const totalMs = (performance.now() - execStart).toFixed(1);
        TimeTracker.finish("WORKER_GENESIS", `World fully manifested in ${totalMs}ms total.`);
        console.log(`B"H - 🎊 [WorldHeescheel] COMPLETE: World '${worldData.shaym || 'Unknown'}' created in ${totalMs}ms.`);

        return {
            tawchlees: {
                message: "World Manifested",
                code: "OK",
                world: worldData.shaym,
                entityCount: result?.length || 0,
                totalMs
            }
        };
    }
}

/**
 * @private
 * @function _ms
 * @description Returns elapsed milliseconds from a start time, formatted nicely.
 * @param {number} start - performance.now() timestamp
 * @returns {string}
 */
function _ms(start) {
    return (performance.now() - start).toFixed(0);
}
