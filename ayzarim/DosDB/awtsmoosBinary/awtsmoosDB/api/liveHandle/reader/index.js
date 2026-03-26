
// B"H
/**
 * @file reader/index.js
 * @description
 *  The Sefirah of Binah - The Great Understanding.
 */

const constants = require('../../../constants.js');
const Resolver = require('./resolver.js');
const Iterator = require('./iterator.js');
const Slicer = require('./slicer.js');
const SequenceEngine = require('../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../structure/dictionary/index.js');
const MapEngine = require('../../../structure/map/index.js');

/**
 * @class Reader
 * @description Orchestrates the resurrection of raw bytes into Live JS objects.
 */
class Reader {
    /**
     * @constructor
     * @param {object} handle - The overarching LiveHandle state.
     */
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.resolver = new Resolver(this);
        this.iter = new Iterator(this);
        this.slicer = new Slicer(this);
    }

    /**
     * @method length
     * @description Unveils the total size of a collection vessel.
     */
    length() {
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return 0;
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        
        const LengthStrategies = {
            [T.SEQUENCE]: () => (new SequenceEngine(this.db.allocator, structPtr)).length(),
            [T.ARRAY]: () => (new SequenceEngine(this.db.allocator, structPtr)).length(),
            [T.SET]: () => (new SequenceEngine(this.db.allocator, structPtr)).length(),
            [T.DICTIONARY]: () => {
                const engine = new DictionaryEngine(this.db.allocator, structPtr);
                engine._init(); return engine.seq ? engine.seq.length() : 0;
            },
            [T.OBJECT]: () => {
                const engine = new DictionaryEngine(this.db.allocator, structPtr);
                engine._init(); return engine.seq ? engine.seq.length() : 0;
            },
            [T.MAP]: () => {
                 const engine = new MapEngine(this.db.allocator, structPtr);
                 const root = engine.nodeIO.load(engine.ptr); return root ? (root.totalCount || 0) : 0;
            }
        };

        return LengthStrategies[type] ? LengthStrategies[type]() : 0;
    }

    slice(start, end) { return this.slicer.slice(start, end); }
    resolveSelf() { return this.resolver.resolveSelf(); }
    keys() { return this.iter.keys(); }
    values() { return this.iter.values(); }
    entries() { return this.iter.entries(); }
    iterator() { return this.iter.iterator(); }

    /**
     * @method _wrapIfNeeded
     * @description Envelops deeply nested objects in their own LiveHandle armor.
     */
    _wrapIfNeeded(val, key, ptr) {
        if (val === null || val === undefined) return val;
        
        const SmartPointer = require('../../../utils/smartPointer.js');
        const isStructure = (val && val.isStructure === true);
        
        let type = isStructure ? val.type : (ptr ? SmartPointer.getType(ptr) : 0);
        
        const T = constants.VAL_TYPE;
        const isContainer = (
            type === T.MAP || type === T.SEQUENCE || type === T.DICTIONARY || 
            type === T.SET || type === T.OBJECT || type === T.ARRAY || type === T.JSON
        );

        if (isContainer) {
            const HandleRegistry = require('../../../core/registry/handle.js');
            const finalPtr = (ptr && Buffer.isBuffer(ptr)) ? ptr : SmartPointer.toBuffer(val.ptr || val);
            return HandleRegistry.createHandle(this.db, finalPtr, type, { parent: this.handle.self, key });
        }
        return val;
    }
}

module.exports = Reader;
