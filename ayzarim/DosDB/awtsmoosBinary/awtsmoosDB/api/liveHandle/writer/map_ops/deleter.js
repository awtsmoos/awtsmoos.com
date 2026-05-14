
// B"H
/**
 * @file map_ops/deleter.js
 * @class MapDeleter
 * @description
 *  =============================================================================
 *  CHAPTER 20: THE ANGEL OF WITHDRAWAL (HISTALKUS)
 *  =============================================================================
 *  "He withdraws His spirit and His breath, all flesh will expire together..." (Job 34:14)
 *  
 *  To delete is to withdraw the Divine Speech that sustains the object. When 
 *  the letters of creation depart, the vessel collapses back into Ayin (Nothingness). 
 *  This module performs the surgical excision of a key from the B-Tree and ensures 
 *  that its echoes are silenced in the Semantic and Spatial realms.
 */

const keyEncoding = require('../../../../utils/keyEncoding.js');
const constants = require('../../../../constants.js');
const MapIndexer = require('./indexer.js');

class MapDeleter {
    constructor(mapWriter) {
        this.writer = mapWriter;
        this.common = mapWriter.common;
        this.handle = mapWriter.handle;
        this.db = mapWriter.db;
    }

    /**
     * @method delete
     * @description Exiles the key from the structure and purges the index.
     */
    delete(key) {
        const encodedKey = keyEncoding.encode(key);
        const structPtr = this.common.resolveStructPtr();
        if (!structPtr) return false;
        
        const path = this.handle.getPath();
        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);
        
        const T = constants.VAL_TYPE;
        let engine;

        if (this.handle.type === T.DICTIONARY || this.handle.type === T.OBJECT) {
            engine = this.common.getEngine(structPtr, T.DICTIONARY);
        } else {
            engine = this.common.getEngine(structPtr, T.MAP);
        }

        // Capture the form before it fades entirely
        const { oldPtr, oldVal } = MapIndexer.captureOldState(engine, encodedKey, this.common, this.handle, searchIndexed, vectorIndex);

        let success = false;
        
        // Execute the withdrawal
        if (this.handle.type === T.DICTIONARY || this.handle.type === T.OBJECT) {
            success = engine.delete(encodedKey);
            this.common.checkAutoCompact(engine, T.DICTIONARY);
        } else {
            const res = engine.delete(encodedKey);
            success = typeof res === 'boolean' ? res : !!(res && res.success);
            this.common.checkAutoCompact(engine, T.MAP);
        }
        
        // Cleanse the cosmic ledgers
        if (success) {
            MapIndexer.processDelete(this.db, path, key, oldPtr, oldVal, searchIndexed, vectorIndex);
            if (oldPtr && !searchIndexed && !vectorIndex) this.db.allocator.releasePointer(oldPtr);
        }

        return success;
    }
}

module.exports = MapDeleter;
