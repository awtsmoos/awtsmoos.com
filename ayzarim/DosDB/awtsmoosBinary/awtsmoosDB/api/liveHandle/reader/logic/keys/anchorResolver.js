
// B"H
/**
 * @file api/liveHandle/reader/logic/keys/anchorResolver.js
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 34-A: THE ANGEL OF YESOD — FOUNDATION RESOLVER               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  "Yesod is the channel through which all upper light flows downward     ║
 * ║   into Malchus — the Kingdom — the physical disk."                      ║
 * ║                                                                          ║
 * ║  A StableAnchor is a fixed 32-byte vessel on disk. It does not hold    ║
 * ║  the data itself — it holds a POINTER to the real data structure,       ║
 * ║  and a TYPE byte identifying what lives at that inner pointer.          ║
 * ║                                                                          ║
 * ║  Layout of the 32-byte Anchor block:                                    ║
 * ║    Bytes [0-3]  : "ANCH" magic bytes (identity seal)                   ║
 * ║    Byte  [4]    : inner type (e.g. MAP=12, DICTIONARY=14)               ║
 * ║    Byte  [5]    : length of the inner SmartPointer seal (pLen)          ║
 * ║    Bytes [6..N] : the inner SmartPointer bytes                          ║
 * ║                                                                          ║
 * ║  This module peels away the outer ANCHOR wrapper, revealing the true   ║
 * ║  inner { type, offset, length } so the right key-iteration engine       ║
 * ║  can be constructed.                                                     ║
 * ║                                                                          ║
 * ║  Without this, an ANCHOR-typed handle passed to KeysLogic.generate()   ║
 * ║  would match no strategy and yield zero keys —                          ║
 * ║  causing "Sort failed" even though the disk data is perfectly sorted.   ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @module AnchorResolver
 */

'use strict';

const StableAnchor = require('../../../../../structure/anchor/stable.js');
const constants    = require('../../../../../constants.js');

module.exports = {
    /**
     * @function resolveAnchor
     *
     * @description
     *   "Yesod channels the upper lights into a stable, revealed form below."
     *
     *   Given a handle whose type is ANCHOR (50), reads the fixed 32-byte
     *   anchor block from disk and returns the INNER structure coordinates:
     *   { offset, length, type }.
     *
     *   Returns null if resolution fails (malformed anchor, missing data).
     *   The caller is responsible for graceful handling of null.
     *
     * @param   {Object}  handle  - LiveHandle soul-state. type must be ANCHOR.
     * @param   {Object}  db      - The AwtsmoosDB universe instance.
     * @returns {{ offset: number, length: number, type: number } | null}
     */
    resolveAnchor(handle, db) {
        if (handle.type !== constants.VAL_TYPE.ANCHOR) {
            return null;
        }

        try {
            const anchorManager = new StableAnchor(db);
            const resolved = anchorManager.resolve(handle.ptr);

            if (!resolved) {
                console.warn(
                    `[AnchorResolver] B"H WARNING: ` +
                    `Anchor ptr=${handle.ptr ? handle.ptr.toString('hex') : 'null'} ` +
                    `resolved to null. Inner structure unreachable.`
                );
                return null;
            }

            console.log(
                `[AnchorResolver] B"H RESOLVED: ` +
                `ANCHOR(50) → inner type=${resolved.type}(${_typeName(resolved.type)}) ` +
                `offset=${resolved.offset} length=${resolved.length}`
            );

            return resolved;

        } catch (err) {
            console.error(`[AnchorResolver] B"H ERROR resolving anchor:`, err.message);
            return null;
        }
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
