
// B"H
/**
 * @file api/liveHandle/reader/logic/keys/strategyFactory.js
 *
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 34-B: THE TEN SEFIROT OF KEY-ITERATION                       ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  "Ten Sefirot of Nothingness; ten and not nine, ten and not eleven."    ║
 * ║  (Sefer Yetzira 1:4)                                                    ║
 * ║                                                                          ║
 * ║  Each VAL_TYPE (each Sefirah of data) corresponds to a different binary ║
 * ║  vessel structure on disk, and each vessel iterates keys differently.   ║
 * ║  This factory returns the correct generator for any type + ptr.         ║
 * ║                                                                          ║
 * ║  THE COMPLETE DISPATCH TABLE:                                            ║
 * ║  ┌─────────────────┬──────────────────────────────────────────────────┐ ║
 * ║  │ Type            │ Key Source                                        │ ║
 * ║  ├─────────────────┼──────────────────────────────────────────────────┤ ║
 * ║  │ SEQUENCE/ARRAY  │ SequenceEngine.keys() → integer indices 0..N     │ ║
 * ║  │ DICTIONARY/OBJ  │ DictionaryEngine.keys() → hash-dict string keys  │ ║
 * ║  │ MAP / JS_MAP    │ MapEngine.range() + keysCodec → sorted B-Tree    │ ║
 * ║  │ SMART_OBJECT    │ FlatObject.keys() → flat-packed field names      │ ║
 * ║  └─────────────────┴──────────────────────────────────────────────────┘ ║
 * ║                                                                          ║
 * ║  NOTE: ANCHOR (50) is NOT in this table because anchorResolver.js       ║
 * ║  handles it upstream, passing the INNER type here instead.              ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @module StrategyFactory
 */

'use strict';

const constants        = require('../../../../../constants.js');
const SequenceEngine   = require('../../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../../structure/dictionary/index.js');
const FlatObject       = require('../../../../../structure/flat/object/index.js');
const MapEngine        = require('../../../../../structure/map/index.js');
const keysCodec        = require('../../../../../utils/binary/keys.js');

const T = constants.VAL_TYPE;

/**
 * @generator _yieldMapKeys
 *
 * @description
 *   "And Avram called out in the name of the Lord." (Genesis 12:8)
 *
 *   Walks the B-Tree stored at `ptr` in-order via MapEngine.range().
 *   Each raw Buffer key is decoded to a UTF-8 string by keysCodec.decode().
 *
 *   The B-Tree guarantees lexicographic order because MapInsertion uses
 *   Buffer.compare() binary search (structure/map/ops/search.js findKey).
 *   For the test's five users: "alice" < "bob" < "charlie" < "yackov" < "zeus".
 *
 * @param   {Object}    allocator  - The DB allocator.
 * @param   {Object}    ptr        - { offset, length } of the B-Tree root.
 * @yields  {string}               Each key in ascending lexicographic order.
 */
function* _yieldMapKeys(allocator, ptr) {
    const engine = new MapEngine(allocator, ptr);
    for (const item of engine.range()) {
        yield keysCodec.decode(item.key);
    }
}

module.exports = {
    /**
     * @function build
     *
     * @description
     *   Given a RESOLVED inner type integer and a resolved { offset, length }
     *   struct pointer, returns a generator that yields all keys for that
     *   structure. Returns null for unknown or non-iterable types.
     *
     *   IMPORTANT: `ptr` must be a resolved { offset, length } object,
     *   NOT a raw SmartPointer Buffer. ANCHOR unwrapping happens upstream
     *   in keys/index.js before this function is called.
     *
     * @param   {number}   type       - Inner VAL_TYPE of the structure.
     * @param   {Object}   ptr        - Resolved { offset, length } struct ptr.
     * @param   {Object}   allocator  - The DB allocator.
     * @returns {Generator|null}        An iterable of keys, or null.
     */
    build(type, ptr, allocator) {
        const Strategies = {
            // ── Sequential containers: integer indices ─────────────────────
            [T.SEQUENCE]:     () => (new SequenceEngine(allocator, ptr)).keys(),
            [T.ARRAY]:        () => (new SequenceEngine(allocator, ptr)).keys(),

            // ── Hash-based dictionary / plain JS object ────────────────────
            [T.DICTIONARY]:   () => (new DictionaryEngine(allocator, ptr)).keys(),
            [T.OBJECT]:       () => (new DictionaryEngine(allocator, ptr)).keys(),

            // ── B-Tree sorted map — THE CRITICAL ENTRIES ───────────────────
            // MapEngine.range() does an in-order walk of B-Tree leaves.
            // keysCodec.decode() converts raw Buffers to strings.
            [T.MAP]:          () => _yieldMapKeys(allocator, ptr),
            [T.JS_MAP]:       () => _yieldMapKeys(allocator, ptr),

            // ── Compact flat-packed object ─────────────────────────────────
            [T.SMART_OBJECT]: () => (new FlatObject(allocator, ptr)).keys(),
        };

        const factory = Strategies[type];
        if (!factory) {
            console.warn(
                `[StrategyFactory] B"H WARNING: ` +
                `No key-iteration strategy for type=${type}(${_typeName(type)}). ` +
                `Yielding nothing. Valid types: SEQUENCE=15, ARRAY=10, ` +
                `DICTIONARY=14, OBJECT=11, MAP=12, JS_MAP=20, SMART_OBJECT=18.`
            );
            return null;
        }

        return factory();
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
