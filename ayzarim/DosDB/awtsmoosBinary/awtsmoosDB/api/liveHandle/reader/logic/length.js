
// B"H
/**
 * @file reader/logic/length.js
 */

const constants = require('../../../../constants.js');
const SequenceEngine = require('../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');

module.exports = {
    calculate(handle, db) {
        const structPtr = handle.nav.resolveStructPtr();
        if (!structPtr) return 0;
        
        const T = constants.VAL_TYPE;
        const type = (handle.type === T.ANCHOR)
            ? (handle.nav.resolveAnchorInnerType() || handle.type)
            : handle.type;
        
        // Data-driven magnitude strategy
        const Strategies = {
            [T.SEQUENCE]: () => sparseLength(handle, db, (new SequenceEngine(db.allocator, structPtr)).length()),
            [T.ARRAY]: () => sparseLength(handle, db, (new SequenceEngine(db.allocator, structPtr)).length()),
            [T.SET]: () => sparseLength(handle, db, (new SequenceEngine(db.allocator, structPtr)).length()),
            [T.JS_SET]: () => sparseLength(handle, db, (new SequenceEngine(db.allocator, structPtr)).length()),
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
            [T.MAP]: () => {
                 const me = new MapEngine(db.allocator, structPtr);
                 const root = me._load(me.ptr); 
                 return root ? root.keys.length : 0; 
            },
            [T.SMART_OBJECT]: () => (new FlatObject(db.allocator, structPtr)).length(),
            [T.SMART_ARRAY]: () => sparseLength(handle, db, (new FlatArray(db.allocator, structPtr)).length())
        };

        const execute = Strategies[type] || (() => 0);
        return execute();
    }
};

function sparseLength(handle, db, dense) {
    return db.sparseArrays ? db.sparseArrays.length(handle, dense) : dense;
}
