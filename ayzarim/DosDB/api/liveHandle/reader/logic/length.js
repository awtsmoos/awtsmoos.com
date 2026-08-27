
// B"H
/**
 * @file reader/logic/length.js
 * @description
 * Chapter 31: The Measure of the Heavens.
 * 
 * "And He counts the numbers of the stars, calling each by its name." (Psalms 147:4)
 * Just as every soul has a measure known to the Creator, every container in the 
 * database has a length—the exact count of sparks it currently contains.
 * 
 * This module identifies the magnitude of a vessel. It is data-driven, selecting 
 * the measurement strategy based on the effective archetype of the vessel, 
 * even if that vessel is presently veiled behind a Stable Anchor.
 */

const constants = require('../../../../constants.js');
const SequenceEngine = require('../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');

module.exports = {
    /**
     * @method calculate
     * @description
     * Determines the total count of entries within the handle's binary structure.
     * 
     * @param {Object} handle - The soul of the handle.
     * @param {Object} db - The AwtsmoosDB instance.
     * @returns {number} The integer length.
     */
    calculate(handle, db) {
        // 1. Reveal the coordinates of the underlying structure.
        // If handle is an Anchor (50), this peels the seal to return the inner coords.
        const structPtr = handle.nav.resolveStructPtr();
        if (!structPtr) return 0;
        
        const T = constants.VAL_TYPE;
        
        // 2. Identify the true Face (Type) of the data.
        let type = handle.type;
        if (type === T.ANCHOR) {
            type = handle.nav.resolveAnchorInnerType() || T.DICTIONARY;
        }
        
        /** @type {Object} The measurement rituals based on Sefirotic Type IDs */
        const Strategies = {
            [T.SEQUENCE]:   () => (new SequenceEngine(db.allocator, structPtr)).length(),
            [T.ARRAY]:      () => (new SequenceEngine(db.allocator, structPtr)).length(),
            [T.SET]:        () => (new SequenceEngine(db.allocator, structPtr)).length(),
            [T.JS_SET]:     () => (new SequenceEngine(db.allocator, structPtr)).length(),
            [T.SMART_ARRAY]: () => (new FlatArray(db.allocator, structPtr)).length(),
            
            [T.DICTIONARY]: () => {
                const d = new DictionaryEngine(db.allocator, structPtr);
                d._init();
                return d.seq ? d.seq.length() : 0;
            },
            [T.OBJECT]: () => {
                const d = new DictionaryEngine(db.allocator, structPtr);
                d._init();
                return d.seq ? d.seq.length() : 0;
            },
            [T.SMART_OBJECT]: () => (new FlatObject(db.allocator, structPtr)).length(),

            [T.MAP]: () => {
                 const me = new MapEngine(db.allocator, structPtr);
                 // Walk the sorted levels of the B-Tree to find the root count
                 const root = me.nodeIO.load(me.ptr); 
                 return root ? root.keys.length : 0; 
            },
            [T.JS_MAP]: () => {
                 const me = new MapEngine(db.allocator, structPtr);
                 const root = me.nodeIO.load(me.ptr);
                 return root ? root.keys.length : 0;
            }
        };

        const execute = Strategies[type] || (() => 0);
        return execute();
    }
};
