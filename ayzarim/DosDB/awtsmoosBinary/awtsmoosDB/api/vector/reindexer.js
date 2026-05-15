
// B"H
/**
 * @file reindexer.js
 * @description
 *  The Sefirah of Da'at - Hidden Knowledge made Manifest.
 *  Iterates through a source vessel (List or Map), identifies vector-compatible data,
 *  and synchronizes it with the HNSW index.
 *  STRICTLY SYNCHRONOUS.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const PackedArray = require('../packed/liveArray.js');

class VectorReindexer {
    constructor(db) {
        this.db = db;
    }

    /**
     * @description Synchronously scans the handle and populates the index.
     * @param {string} path The dotted path to the handle.
     * @param {object} index The HNSW Index instance.
     * @param {LiveHandle} handle The source handle.
     */
    run(path, index, handle) {
        const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
        soul.ensureResolved();

        if (!soul.ptr) return;

        const T = constants.VAL_TYPE;
        const type = (soul.type === T.ANCHOR)
            ? (soul.nav.resolveAnchorInnerType() || soul.type)
            : soul.type;

        let iterator;

        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            const resolved = soul.nav.resolveStructPtr();
            const engine = new Sequence(this.db.allocator, resolved);
            iterator = this._iterateSequence(engine);
        } else if (type === T.PACKED_ARRAY) {
            const resolved = soul.nav.resolveStructPtr();
            iterator = this._iteratePackedArray(resolved);
        } else if (type === T.MAP || type === T.DICTIONARY || type === T.OBJECT) {
            const resolved = soul.nav.resolveStructPtr();
            
            if (resolved.isStructure) {
                const engine = new MapEngine(this.db.allocator, resolved);
                iterator = this._iterateMap(engine);
            } else {
                iterator = this._iterateObject(resolved);
            }
        } else {
            return;
        }

        let batch = [];
        const BATCH_SIZE = 100;

        for (const item of iterator) {
            const { key, value, ptr } = item;
            
            let valToCheck = value;
            if (valToCheck === undefined && ptr) {
                valToCheck = SmartPointer.resolve(ptr, this.db.allocator);
            }

            if (valToCheck && valToCheck.isStructure) {
                const ReaderResolver = require('../liveHandle/reader/resolver.js');
                // B"H: The Tikkun of the Mock. 
                // We provide an empty ensureResolved to protect against structural checks.
                const resolver = new ReaderResolver({ 
                    db: this.db, 
                    handle: { 
                        ptr: SmartPointer.toBuffer(valToCheck),
                        ensureResolved: () => {} 
                    } 
                });
                valToCheck = resolver.resolveSelf();
            }

            const vecData = this._extractVector(valToCheck);
            if (vecData) {
                const vector = (vecData instanceof Float32Array) ? vecData : new Float32Array(vecData);
                const payload = ptr || Buffer.alloc(16); 
                index.insert(String(key), vector, payload);
            }
        }
    }

    _extractVector(val) {
        if (!val || typeof val !== 'object') return null;
        if (val.vector) return val.vector;
        if (val.embedding) return val.embedding;
        if (val.vec) return val.vec;
        return null;
    }

    *_iterateSequence(engine) {
        const len = engine.length();
        for (let i = 0; i < len; i++) {
            yield { key: i, ptr: engine.getPtr(i), value: undefined };
        }
    }

    *_iterateMap(engine) {
        for (const raw of engine.range()) {
            const k = raw.key.toString('utf8');
            yield { key: k, ptr: raw.ptr, value: undefined };
        }
    }

    *_iteratePackedArray(ptr) {
        const values = PackedArray.readArray(this.db, SmartPointer.toBuffer(ptr)) || [];
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            yield { key: i, ptr: this.db.builder.build(value), value };
        }
    }

    *_iterateObject(obj) {
        for (const k in obj) {
            yield { key: k, value: obj[k], ptr: null };
        }
    }
}

module.exports = VectorReindexer;
