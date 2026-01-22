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
        // Resolve internal soul to get direct access
        const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
        soul.ensureResolved();

        if (!soul.ptr) return;

        // Determine structure type
        const type = soul.type;
        const T = constants.VAL_TYPE;

        let iterator;

        // B"H: Optimization - Use internal engines directly to bypass Proxy overhead during bulk reindex
        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            const resolved = SmartPointer.resolve(soul.ptr, this.db.allocator);
            const engine = new Sequence(this.db.allocator, resolved);
            iterator = this._iterateSequence(engine);
        } else if (type === T.MAP || type === T.DICTIONARY || type === T.OBJECT) {
            // Note: Objects/Dictionaries are handled similar to Maps in structure for iteration if large
            // But if small Object (inline), resolve returns JS object. 
            // StructBuilder forces Dict/Map for db-assigned objects.
            const resolved = SmartPointer.resolve(soul.ptr, this.db.allocator);
            
            // Check if resolved is raw JS object or Pointer info
            if (resolved.isStructure) {
                const engine = new MapEngine(this.db.allocator, resolved);
                iterator = this._iterateMap(engine);
            } else {
                // It's a small object fully loaded in RAM (Inline or Heap)
                iterator = this._iterateObject(resolved);
            }
        } else {
            // Primitive or unsupported type for indexing
            return;
        }

        // Processing Loop
        let batch = [];
        const BATCH_SIZE = 100;

        for (const item of iterator) {
            const { key, value, ptr } = item;
            
            // Hydrate potentially lazy value
            let valToCheck = value;
            if (valToCheck === undefined && ptr) {
                valToCheck = SmartPointer.resolve(ptr, this.db.allocator);
            }

            // Deep hydration if it's a structure wrapper
            if (valToCheck && valToCheck.isStructure) {
                // For vectors, we need the actual object to check for .vector property
                // We use the Reader's hydration logic via the handle system implicitly
                // or simplistic hydration here. 
                // Let's assume vector objects are relatively small Dictionaries.
                const ReaderResolver = require('../../api/liveHandle/reader_resolve.js');
                // Mock a reader context
                const resolver = new ReaderResolver({ db: this.db, handle: { ptr: SmartPointer.toBuffer(valToCheck) } });
                valToCheck = resolver.resolveSelf();
            }

            const vecData = this._extractVector(valToCheck);
            if (vecData) {
                // Ensure vector is Float32Array
                const vector = (vecData instanceof Float32Array) ? vecData : new Float32Array(vecData);
                
                // Store Stable Pointer (to the item in the list/map) as payload
                const payload = ptr || Buffer.alloc(16); 
                
                // Insert into HNSW
                // If key is missing (Sequence), use stringified index?
                // HNSW requires unique string keys for the map. 
                // For Sequence, key is index. Ideally index is stable? No, splice changes indices.
                // Vector Search usually returns the ITEM content (Payload).
                // So Key is internal to HNSW's map. 
                // We use the item's internal ID if available, or generate a unique one?
                // HNSW expects (key, vector, payload). Key is for deletion/update.
                // If the user replaces list[5], we need to know 5 changed.
                
                // ISSUE: Lists shift indices. Updating index "5" means old "5" is gone? 
                // Reindexing assumes a clean slate or overwrite.
                // Let's use the iterator key.
                
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
        // Raw iterator yields { ptr }
        // We need index as key
        let idx = 0;
        for (const raw of engine.iterateRaw()) {
            yield { key: idx++, ptr: raw.ptr, value: undefined };
        }
    }

    *_iterateMap(engine) {
        for (const raw of engine.iterateRaw()) {
            // Map iterator raw yields { key (Buffer), ptr }
            const k = raw.key.toString('utf8');
            yield { key: k, ptr: raw.ptr, value: undefined };
        }
    }

    *_iterateObject(obj) {
        // For small inline objects
        for (const k in obj) {
            yield { key: k, value: obj[k], ptr: null };
        }
    }
}

module.exports = VectorReindexer;