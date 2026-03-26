
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

        const type = soul.type;
        const T = constants.VAL_TYPE;

        let iterator;

        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            const resolved = SmartPointer.resolve(soul.ptr, this.db.allocator);
            const engine = new Sequence(this.db.allocator, resolved);
            iterator = this._iterateSequence(engine);
        } else if (type === T.MAP || type === T.DICTIONARY || type === T.OBJECT) {
            const resolved = SmartPointer.resolve(soul.ptr, this.db.allocator);
            
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
        let idx = 0;
        for (const raw of engine.iterateRaw()) {
            yield { key: idx++, ptr: raw.ptr, value: undefined };
        }
    }

    *_iterateMap(engine) {
        for (const raw of engine.iterateRaw()) {
            const k = raw.key.toString('utf8');
            yield { key: k, ptr: raw.ptr, value: undefined };
        }
    }

    *_iterateObject(obj) {
        for (const k in obj) {
            yield { key: k, value: obj[k], ptr: null };
        }
    }
}

module.exports = VectorReindexer;
