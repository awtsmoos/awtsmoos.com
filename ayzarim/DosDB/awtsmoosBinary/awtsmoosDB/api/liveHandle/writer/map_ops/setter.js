
// B"H
/**
 * @file map_ops/setter.js
 * @class MapSetter
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 19: THE SCRIBE OF EMANATION (YESH M'AYIN)                     ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  "By the word of the Lord the heavens were made." (Tehillim 33:6)       ║
 * ║                                                                          ║
 * ║  This module executes the act of Creation — takes a key and value,      ║
 * ║  contracts them into binary via the Builder, and inserts them into       ║
 * ║  the structural engine (B-Tree MAP or Dictionary).                       ║
 * ║                                                                          ║
 * ║  ── THE ENGINE-SELECTION TIKKUN ────────────────────────────────────── ║
 * ║                                                                          ║
 * ║  BEFORE (broken):                                                         ║
 * ║    if (handle.type === MAP) → MapEngine                                  ║
 * ║    else                    → DictionaryEngine   ← always taken for ANCHOR║
 * ║                                                                          ║
 * ║    When db.root.users = new db.Map(), the users handle has type=ANCHOR. ║
 * ║    The else branch always fired → DictionaryEngine was used to write     ║
 * ║    user records into what is actually a MAP B-Tree block on disk.        ║
 * ║    This corrupted the data and caused db.keys() → [0,1,2,3,4].          ║
 * ║                                                                          ║
 * ║  AFTER (fixed):                                                          ║
 * ║    resolveEffectiveType() reads the anchor's inner type byte from disk:  ║
 * ║      ANCHOR → inner type MAP(12)        → MapEngine      ✓              ║
 * ║      ANCHOR → inner type DICTIONARY(14) → DictionaryEngine              ║
 * ║      MAP    (direct)                    → MapEngine                     ║
 * ║      DICTIONARY (direct)               → DictionaryEngine               ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @module MapSetter
 */

'use strict';

const keyEncoding = require('../../../../utils/keyEncoding.js');
const constants   = require('../../../../constants.js');
const MapIndexer  = require('./indexer.js');

class MapSetter {
    /**
     * @constructor
     * @param {Object} mapWriter - The parent MapWriter orchestrator.
     */
    constructor(mapWriter) {
        this.writer  = mapWriter;
        this.common  = mapWriter.common;
        this.builder = mapWriter.builder;
        this.handle  = mapWriter.handle;
        this.db      = mapWriter.db;
    }

    /**
     * @method _resolveEffectiveType
     *
     * @description
     * "And the spirit of G-d hovered over the face of the waters." (Bereishis 1:2)
     * Before writing, we hover above the vessel and discern its true nature.
     *
     * When handle.type is ANCHOR(50), we cannot know whether the inner structure
     * is a MAP(12) B-Tree or a DICTIONARY(14) hash-map just from the handle alone.
     * We must open the 32-byte anchor block on disk and read byte[4] — the inner
     * type recorded there by the builder at creation time.
     *
     * This prevents the fatal error where MAP-backed handles had their data
     * written into a DictionaryEngine (wrong engine, wrong bytes, corrupted data).
     *
     * @returns {number} The effective VAL_TYPE to use for engine selection.
     *                   Falls back to DICTIONARY if resolution fails.
     */
    _resolveEffectiveType() {
        const T = this.db ? constants.VAL_TYPE : constants.VAL_TYPE;

        // Direct type: MAP or DICTIONARY — no anchor to unwrap
        if (this.handle.type === constants.VAL_TYPE.MAP ||
            this.handle.type === constants.VAL_TYPE.JS_MAP) {
            return constants.VAL_TYPE.MAP;
        }

        if (this.handle.type === constants.VAL_TYPE.DICTIONARY ||
            this.handle.type === constants.VAL_TYPE.OBJECT) {
            return constants.VAL_TYPE.DICTIONARY;
        }

        // ANCHOR: must read the inner type from the anchor block on disk
        if (this.handle.type === constants.VAL_TYPE.ANCHOR) {
            // WriterCommon.resolveAnchorInnerType() does the disk read safely
            const innerType = this.common.resolveAnchorInnerType();
            if (innerType !== null && innerType !== undefined) {
                return innerType;
            }
            // Fallback: default to DICTIONARY (safe, insertion-order semantics)
            return constants.VAL_TYPE.DICTIONARY;
        }

        // Everything else defaults to dictionary-style
        return constants.VAL_TYPE.DICTIONARY;
    }

    /**
     * @method set
     *
     * @description
     * "In the beginning G-d created…" — and so we create each key-value pair.
     *
     * Steps:
     *   1. Build the value into binary (unless already a pointer seal).
     *   2. Resolve which engine type governs this handle (MAP vs DICTIONARY).
     *   3. Get the struct ptr from the anchor or direct handle ptr.
     *   4. Instantiate the correct engine and perform the insertion.
     *   5. Update anchor and handle pointers post-mutation.
     *
     * @param {string|Buffer} key     - The key to inscribe.
     * @param {*}             value   - The value to manifest.
     * @param {Object}        options - { isPtr: bool, skipFree: bool }
     */
    set(key, value, options) {
        const isPtr    = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        const assumeNew = (options && typeof options === 'object' && options.assumeNew) || false;
        const skipIndexes = (options && typeof options === 'object' && options.skipIndexes) || false;
        const skipOldState = assumeNew || (options && typeof options === 'object' && options.skipOldState) || false;

        // 1. Build the value into its binary seal
        if (!this.builder) {
            throw new Error('B"H Fatal: The Master Builder is absent from the Map Scribe.');
        }
        const valToSet = isPtr ? value : this.builder.build(value);

        const encodedKey  = keyEncoding.encode(key);
        const structPtr   = this.common.resolveStructPtr();

        // 2. Diagnostics for the search/vector indices
        const path          = this.handle.getPath();
        const searchIndexed = !skipIndexes && this.common.getSearchIndex(path);
        const vectorIndex   = !skipIndexes && this.common.getVectorIndex(path);

        const T = constants.VAL_TYPE;

        // 3. Resolve the REAL engine type — this is the Tikkun.
        //    For ANCHOR handles (like db.root.users after new db.Map()),
        //    we read the anchor's inner type byte from disk.
        const effectiveType = this._resolveEffectiveType();

        // 4. Awaken the correct engine
        let engine;
        if (effectiveType === T.MAP || effectiveType === T.JS_MAP) {
            engine = this.common.getEngine(structPtr, T.MAP);
            if (!engine) throw new Error('B"H Fatal: Could not create Map Engine.');
            if (!structPtr) engine.create();
        } else {
            engine = this.common.getEngine(structPtr, T.DICTIONARY);
            if (!engine) throw new Error('B"H Fatal: Could not create Dictionary Engine.');
            if (!structPtr) engine.create();
        }

        // 5. Capture old state for overwrite/index cleanup only when needed.
        let oldPtr = null;
        let oldVal = null;
        if (!skipOldState) {
            const prior = MapIndexer.captureOldState(
                engine, encodedKey, this.common, this.handle, searchIndexed, vectorIndex
            );
            oldPtr = prior.oldPtr;
            oldVal = prior.oldVal;
        }

        // 6. Perform the physical inscription
        engine.set(encodedKey, valToSet, { isPtr: true, skipFree, assumeNew });

        if (oldPtr && !assumeNew && !skipFree && !searchIndexed && !vectorIndex) {
            this.db.allocator.releasePointer(oldPtr);
        }

        // 7. Update anchor + handle pointer to reflect possible relocation
        this.common.checkAutoCompact(engine, effectiveType);

        // 8. Broadcast to global indices unless caller explicitly skipped them.
        if (!skipIndexes) {
            MapIndexer.processSet(
                this.db, path, key, valToSet, value,
                oldPtr, oldVal, searchIndexed, vectorIndex, this.common
            );
        }
    }
}

module.exports = MapSetter;
