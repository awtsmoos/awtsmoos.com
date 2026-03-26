
// B"H
/**
 * @file map_ops/setter.js
 * @class MapSetter
 * @description
 *  =============================================================================
 *  CHAPTER 19: THE SCRIBE OF EMANATION (YESH M'AYIN)
 *  =============================================================================
 *  "By the word of the Lord the heavens were made..." (Psalms 33:6)
 *  
 *  This module executes the act of Creation. It takes a key and a value, 
 *  compresses them into the physical binary format, and inserts them into the 
 *  B-Tree structure. It works in tandem with the MapIndexer to ensure that 
 *  every new emanation is immediately recorded in the cosmic ledgers.
 */

const keyEncoding = require('../../../../utils/keyEncoding.js');
const constants = require('../../../../constants.js');
const MapIndexer = require('./indexer.js');

class MapSetter {
    constructor(mapWriter) {
        this.writer = mapWriter;
        this.common = mapWriter.common;
        this.builder = mapWriter.builder;
        this.handle = mapWriter.handle;
        this.db = mapWriter.db;
    }

    /**
     * @method set
     * @description Materializes the value within the Map's boundaries.
     */
    set(key, value, options) {
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        
        // Manifest the value into physical space (unless it is already a pure pointer)
        const valToSet = isPtr ? value : this.builder.build(value);
        
        const encodedKey = keyEncoding.encode(key);
        const structPtr = this.common.resolveStructPtr();
        
        // Ascertain if this path is watched by the omniscient indices
        const path = this.handle.getPath();
        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);
        
        const T = constants.VAL_TYPE;
        let engine;

        // Awaken the appropriate structural engine
        if (this.handle.type === T.MAP) {
            engine = this.common.getEngine(structPtr, T.MAP);
            if (!engine) throw new Error("B\"H Fatal: Could not create Map Engine");
            if (!structPtr) engine.create();
        } else {
            engine = this.common.getEngine(structPtr, T.DICTIONARY);
            if (!engine) throw new Error("B\"H Fatal: Could not create Dictionary Engine.");
            if (!structPtr) engine.create();
        }

        // Capture the fleeting past before writing the future
        const { oldPtr, oldVal } = MapIndexer.captureOldState(engine, encodedKey, this.common, this.handle, searchIndexed, vectorIndex);

        // Perform the physical inscription
        engine.set(encodedKey, valToSet, { isPtr: true, skipFree });
        this.common.checkAutoCompact(engine, this.handle.type);
        
        // B"H: THE TIKKUN OF ALIGNMENT
        // The parameters to processSet are: (db, path, key, valToSet, originalValue, oldPtr, oldVal, searchIndexed, vectorIndex, common)
        // We pass the raw JavaScript `value` as `originalValue` so the vector extractor can find the embedding.
        MapIndexer.processSet(this.db, path, key, valToSet, value, oldPtr, oldVal, searchIndexed, vectorIndex, this.common);
    }
}

module.exports = MapSetter;
