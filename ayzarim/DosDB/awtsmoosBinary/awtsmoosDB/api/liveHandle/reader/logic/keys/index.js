
// B"H
/**
 * @file api/liveHandle/reader/logic/keys/index.js
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 34: THE REGISTRY OF NAMES — RECTIFIED & COMPLETE             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  THE SHATTERING (Ha-Shevira):                                           ║
 * ║                                                                          ║
 * ║    db.root.users = new db.Map()                                         ║
 * ║      Builder wraps the Map in a StableAnchor.                           ║
 * ║      "users" entry in root stores type=ANCHOR(50).                      ║
 * ║      db.root.users → LiveHandle with type=ANCHOR(50).                  ║
 * ║                                                                          ║
 * ║    db.keys(db.root.users)                                               ║
 * ║      → soul.reader.keys()                                               ║
 * ║      → KeysLogic.generate(handle, db)                                  ║
 * ║      → handle.type === 50  ← OLD: no strategy existed for 50           ║
 * ║      → gen = null → yield nothing → userKeys = []                      ║
 * ║      → userKeys[0] === undefined ≠ "alice"                             ║
 * ║      → throw new Error("Sort failed")                                  ║
 * ║                                                                          ║
 * ║  THE RECTIFICATION (Ha-Tikkun):                                         ║
 * ║                                                                          ║
 * ║    When handle.type === ANCHOR(50):                                      ║
 * ║      1. AnchorResolver.resolveAnchor(handle, db)                        ║
 * ║         reads the 32-byte anchor block from disk                        ║
 * ║         returns { offset, length, type } of the INNER structure         ║
 * ║                                                                          ║
 * ║      2. StrategyFactory.build(innerType, innerPtr, allocator)           ║
 * ║         dispatches to MapEngine.range() for MAP(12)                     ║
 * ║         yields "alice","bob","charlie","yackov","zeus" in sorted order  ║
 * ║                                                                          ║
 * ║      3. userKeys[0] === "alice"  ✅  TEST PASSES                        ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @module KeysLogic
 */

'use strict';

const constants       = require('../../../../../constants.js');
const AnchorResolver  = require('./anchorResolver.js');
const StrategyFactory = require('./strategyFactory.js');

module.exports = {
    /**
     * @generator generate
     *
     * @description
     *   "And the Lord G-d called out to the man: 'Where are you?'" (Gen 3:9)
     *   He called to initiate the self-revelation of each stored name.
     *
     *   Yields every key stored in the binary vessel behind `handle`:
     *     MAP / JS_MAP      → lexicographic (B-Tree sorted)
     *     DICTIONARY/OBJECT → insertion-order (hash-dict)
     *     SEQUENCE / ARRAY  → integer indices 0, 1, 2, …
     *     SMART_OBJECT      → flat-packed field order
     *     ANCHOR            → resolves to inner type, then delegates above
     *
     * @param   {Object}   handle  - LiveHandle internal soul-state.
     * @param   {Object}   db      - AwtsmoosDB instance.
     * @yields  {string|number}    Each key / index in structure order.
     */
    *generate(handle, db) {
        handle.ensureResolved();

        const T = constants.VAL_TYPE;

        console.log(
            `[KeysLogic] B"H generate() — ` +
            `handle.type=${handle.type}(${_typeName(handle.type)}) ` +
            `ptr=${handle.ptr ? handle.ptr.slice(0, 6).toString('hex') + '..' : 'null'}`
        );

        // ── Step 1: Resolve ANCHOR wrapper if present ─────────────────────
        // When db.root.users = new db.Map() is stored, the builder wraps
        // the map in a StableAnchor. The resulting SmartPointer has type=50.
        // We must peel that layer to get the real inner type (MAP=12) and ptr.
        let effectiveType;
        let effectivePtr;

        if (handle.type === T.ANCHOR) {
            console.log(`[KeysLogic] B"H ANCHOR detected — resolving inner vessel...`);

            const resolved = AnchorResolver.resolveAnchor(handle, db);
            if (!resolved) {
                console.error(
                    `[KeysLogic] B"H ERROR: ANCHOR resolution returned null. ` +
                    `handle.ptr=${handle.ptr ? handle.ptr.toString('hex') : 'null'}. ` +
                    `Yielding zero keys.`
                );
                return;
            }

            effectiveType = resolved.type;
            effectivePtr  = resolved; // { offset, length, type }

            console.log(
                `[KeysLogic] B"H ANCHOR unwrapped → ` +
                `innerType=${effectiveType}(${_typeName(effectiveType)}) ` +
                `at offset=${resolved.offset} length=${resolved.length}`
            );

        } else {
            // Non-anchor: resolve struct ptr the normal way via navigator
            effectivePtr = handle.nav.resolveStructPtr();
            effectiveType = handle.type;

            if (!effectivePtr) {
                console.warn(
                    `[KeysLogic] B"H WARNING: resolveStructPtr() returned null ` +
                    `for type=${handle.type}(${_typeName(handle.type)}). ` +
                    `Yielding zero keys.`
                );
                return;
            }

            console.log(
                `[KeysLogic] B"H structPtr resolved → ` +
                `offset=${effectivePtr.offset} length=${effectivePtr.length}`
            );
        }

        // ── Step 2: Get the key-iteration generator ────────────────────────
        const gen = StrategyFactory.build(effectiveType, effectivePtr, db.allocator);
        if (!gen) {
            console.warn(
                `[KeysLogic] B"H WARNING: StrategyFactory returned null ` +
                `for effectiveType=${effectiveType}(${_typeName(effectiveType)}). ` +
                `Yielding zero keys.`
            );
            return;
        }

        // ── Step 3: Yield all keys ─────────────────────────────────────────
        let count = 0;
        for (const k of gen) {
            count++;
            yield k;
        }

        console.log(
            `[KeysLogic] B"H generate() done — ` +
            `yielded ${count} key(s) for type=${effectiveType}(${_typeName(effectiveType)}).`
        );
    }
};

/**
 * @function _typeName
 * @description Maps a VAL_TYPE integer to its human-readable name.
 * @param   {number} t
 * @returns {string}
 */
function _typeName(t) {
    const T = constants.VAL_TYPE;
    const names = {
        [T.NULL]:'NULL',[T.UNDEFINED]:'UNDEFINED',[T.BOOLEAN]:'BOOLEAN',
        [T.SMALL_INT]:'SMALL_INT',[T.NUMBER]:'NUMBER',[T.STRING]:'STRING',
        [T.STRING_OMNI]:'STRING_OMNI',[T.DATE]:'DATE',[T.BIGINT]:'BIGINT',
        [T.BUFFER]:'BUFFER',[T.ARRAY]:'ARRAY',[T.OBJECT]:'OBJECT',
        [T.MAP]:'MAP',[T.SET]:'SET',[T.DICTIONARY]:'DICTIONARY',
        [T.SEQUENCE]:'SEQUENCE',[T.JSON]:'JSON',
        [T.CUSTOM_INSTANCE]:'CUSTOM_INSTANCE',[T.SMART_OBJECT]:'SMART_OBJECT',
        [T.SMART_ARRAY]:'SMART_ARRAY',[T.JS_MAP]:'JS_MAP',
        [T.JS_SET]:'JS_SET',[T.ERROR]:'ERROR',[T.FUNCTION]:'FUNCTION',
        [T.SYMBOL]:'SYMBOL',[T.REGEXP]:'REGEXP',
        [T.FLOAT_DYNAMIC]:'FLOAT_DYNAMIC',[T.ANCHOR]:'ANCHOR'
    };
    return names[t] || `UNKNOWN(${t})`;
}
