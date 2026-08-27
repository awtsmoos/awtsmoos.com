
// B"H
/**
 * @file common.js
 * @class WriterCommon
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 16: THE SHARED SCRIBE UTILITIES (NETZACH)                     ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  "Netzach represents the power to overcome obstacles and ensure the     ║
 * ║   persistence of the Divine flow."                                       ║
 * ║                                                                          ║
 * ║  This module provides common functionalities for the writer scribes:    ║
 * ║    - resolveStructPtr()      : resolve anchor or direct ptr to coords   ║
 * ║    - resolveAnchorInnerType(): NEW — reads the inner type byte from a   ║
 * ║                                StableAnchor block on disk               ║
 * ║    - getEngine()             : construct the right engine for a type    ║
 * ║    - checkAutoCompact()      : update anchor after structure mutation   ║
 * ║                                                                          ║
 * ║  ── THE ANCHOR-TYPE TIKKUN ─────────────────────────────────────────── ║
 * ║                                                                          ║
 * ║  BEFORE (broken):                                                         ║
 * ║    getEngine() defaulted to DICTIONARY when handle.type === ANCHOR.     ║
 * ║    This caused MAP-backed handles to write user data into a             ║
 * ║    DictionaryEngine, destroying the B-Tree structure.                   ║
 * ║                                                                          ║
 * ║  AFTER (fixed):                                                          ║
 * ║    resolveAnchorInnerType() reads byte[4] of the anchor block on disk   ║
 * ║    and returns the real inner type (MAP=12, DICTIONARY=14, etc.).       ║
 * ║    MapSetter uses this to choose the correct engine.                    ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const constants      = require('../../../constants.js');
const SmartPointer   = require('../../../utils/smartPointer.js');
const Dictionary     = require('../../../structure/dictionary/index.js');
const Sequence       = require('../../../structure/sequence/index.js');
const MapEngine      = require('../../../structure/map/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');

class WriterCommon {
    /**
     * @constructor
     * @param {Object} writer - The parent Writer orchestrator.
     */
    constructor(writer) {
        this.writer                = writer;
        this.handle                = writer.handle;
        this.db                    = writer.db;
        this._cachedEngine         = null;
        this._cachedStructPtrHash  = null;
    }

    /**
     * @method resolveStructPtr
     *
     * @description
     * "Yesod is the channel between the upper worlds and Malchus below."
     *
     * Resolves the handle's current pointer to a raw { offset, length }
     * struct coordinate. For ANCHOR handles, peels the anchor wrapper to
     * reveal the inner data structure's coordinates.
     *
     * NOTE: Returns { offset, length } WITHOUT a type field intentionally.
     * Callers that need the inner type should use resolveAnchorInnerType().
     *
     * @returns {{ offset: number, length: number } | null}
     */
    resolveStructPtr() {
        if (this.handle.type === constants.VAL_TYPE.ANCHOR) {
            const Anchor = require('../../../structure/anchor/stable.js');
            const anchorManager = new Anchor(this.db);
            const resolved = anchorManager.resolve(this.handle.ptr);
            if (resolved) return { offset: resolved.offset, length: resolved.length };
            return null;
        }

        if (this.handle.ptr) {
            const dec = SmartPointer.decode(this.handle.ptr);
            if (!dec) return null;
            return { offset: dec.offset, length: dec.length };
        }

        if (this.db.root && this.handle === HandleRegistry.getSoul(this.db.root) && this.db.rootPtrRaw) {
            const dec = SmartPointer.decode(this.db.rootPtrRaw);
            if (dec) return { offset: dec.offset, length: dec.length };
        }

        return null;
    }

    /**
     * @method resolveAnchorInnerType
     *
     * @description
     * ╔══════════════════════════════════════════════════════════════════════╗
     * ║  THE ANCHOR ORACLE — reads the inner type from a 32-byte anchor     ║
     * ║                                                                      ║
     * ║  A StableAnchor block layout:                                        ║
     * ║    Bytes [0-3] : MAGIC_ANCH identifier                              ║
     * ║    Byte  [4]   : inner type  (MAP=12, DICTIONARY=14, SEQUENCE=15…)  ║
     * ║    Byte  [5]   : inner ptr length (pLen)                            ║
     * ║    Bytes [6..] : inner SmartPointer bytes                            ║
     * ║                                                                      ║
     * ║  This method reads byte[4] so callers know which engine to build.   ║
     * ║  Returns null if handle is not ANCHOR or anchor is unresolvable.    ║
     * ║                                                                      ║
     * ╚══════════════════════════════════════════════════════════════════════╝
     *
     * @returns {number|null} Inner VAL_TYPE integer, or null on failure.
     */
    resolveAnchorInnerType() {
        if (this.handle.type !== constants.VAL_TYPE.ANCHOR) return null;
        if (!this.handle.ptr) return null;

        try {
            const Pointer = require('../../../utils/pointer/crown.js');
            const dec = Pointer.decode(this.handle.ptr);
            if (!dec) return null;

            const buf = this.db.pager.readExact(dec.offset, 32);
            if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_ANCH) return null;

            const innerType = buf.readUInt8(4);
            return innerType;
        } catch (e) {
            return null;
        }
    }

    /**
     * @method getEngine
     *
     * @description
     * "And G-d formed the man of dust from the ground." (Bereishis 2:7)
     * Each structural type requires a different craftsman engine.
     * This method instantiates the correct one.
     *
     * @param {{ offset: number, length: number } | null} ptr  - Struct coords.
     * @param {number}                                    type - VAL_TYPE to build.
     * @returns {Object|null} The engine instance, or null if type unrecognised.
     */
    getEngine(ptr, type) {
        const hash = ptr ? `${ptr.offset}:${ptr.length}` : 'null';
        if (this._cachedEngine && this._cachedStructPtrHash === hash) return this._cachedEngine;

        let e = null;
        const T = constants.VAL_TYPE;

        // B"H: Route inner type if ANCHOR — read from anchor block, not handle.type.
        // (handle.type may be ANCHOR(50) but the inner structure could be MAP or DICTIONARY)
        const actualType = (this.handle.type === T.ANCHOR)
            ? (this.resolveAnchorInnerType() || type || T.DICTIONARY)
            : type;

        if (actualType === T.SEQUENCE || actualType === constants.TYPE_SEQUENCE) {
            e = new Sequence(this.db.allocator, ptr);
        } else if (actualType === T.MAP || actualType === constants.TYPE_MAP) {
            e = new MapEngine(this.db.allocator, ptr);
        } else if (
            actualType === T.DICTIONARY ||
            actualType === constants.TYPE_DICTIONARY ||
            actualType === T.OBJECT
        ) {
            e = new Dictionary(this.db.allocator, ptr);
        }

        if (!e) return null;
        this._cachedEngine         = e;
        this._cachedStructPtrHash  = hash;
        return e;
    }

    /**
     * @method invalidateEngine
     * @description Clears the cached engine so the next call rebuilds it.
     */
    invalidateEngine() {
        this._cachedEngine = null;
    }

    /**
     * @method checkAutoCompact
     *
     * @description
     * "Forever, O Lord, Your word stands in the heavens." (Tehillim 119:89)
     * After a write, the structure may have relocated. This method updates
     * the handle's internal pointer so subsequent reads find the new address.
     *
     * For ANCHOR-typed handles, the anchor block itself is also updated to
     * point to the new inner structure coordinates.
     *
     * @param {Object} e    - The engine after mutation (holds new ptr).
     * @param {number} type - The VAL_TYPE of the inner structure (MAP, DICT, SEQ).
     */
    checkAutoCompact(e, type) {
        if (!e || !e.ptr) return;
        const p = e.ptr;

        // Determine the correct inner type to record:
        // If handle is ANCHOR, resolve the real inner type from the anchor block.
        const innerType = (this.handle.type === constants.VAL_TYPE.ANCHOR)
            ? (this.resolveAnchorInnerType() || p.type || type)
            : (p.type || type);

        this.handle._updatePointer(SmartPointer.encode(innerType, p.offset, p.length));
        this._cachedStructPtrHash = `${p.offset}:${p.length}`;
    }

    /**
     * @method getSearchIndex
     * @param {string} path
     * @returns {boolean}
     */
    getSearchIndex(path) {
        return this.db.sysCache.search.has(path);
    }

    /**
     * @method getVectorIndex
     * @param {string} path
     * @returns {boolean}
     */
    getVectorIndex(path) {
        return this.db.sysCache.vector.has(path);
    }

    /**
     * @method extractVector
     * @param {*} val
     * @returns {Float32Array|Array|null}
     */
    extractVector(val) {
        if (!val || typeof val !== 'object') return null;
        const v = val.vector || val.embedding || val.vec;
        if (!v) return null;
        return (v instanceof Float32Array || Array.isArray(v)) ? v : null;
    }

    /**
     * @method checkGraphCleanup
     * @param {*} ptr
     */
    checkGraphCleanup(ptr) {
        if (this.db.graph) this.db.graph.deleteNode(ptr);
    }
}

module.exports = WriterCommon;
