
// B"H
/**
 * @file map_ops/indexer.js
 * @class MapIndexer
 * @description
 *  =============================================================================
 *  CHAPTER 18: THE EYE OF PROVIDENCE (HASHGACHA PRATIS)
 *  =============================================================================
 *  "The eyes of the Lord roam throughout the earth." (Zechariah 4:10)
 *  
 *  Whenever a vessel is altered in the Map, the Awtsmoos must update the 
 *  omnipresent networks: the Search Index (Words) and the Vector Index (Space).
 *  This module is solely responsible for capturing the past state before mutation, 
 *  and broadcasting the changes to the indices after the mutation is sealed.
 */

class MapIndexer {
    /**
     * @method captureOldState
     * @description 
     *  Peeks at the existing reality before it is overwritten or deleted.
     *  Required to accurately erase old tokens and spatial coordinates.
     */
    static captureOldState(engine, encodedKey, common, handle, searchIndexed, vectorIndex) {
        let oldPtr = null;
        let oldVal = null;
        
        oldPtr = engine.getPtr(encodedKey);

        if (oldPtr && (searchIndexed || vectorIndex)) {
            if (oldPtr && handle.reader) {
                try {
                    const SmartPointer = require('../../../../utils/smartPointer.js');
                    oldVal = SmartPointer.resolve(oldPtr, common.db.allocator);

                    if (oldVal && oldVal.isStructure) {
                        const ReaderResolver = require('../../reader/resolver.js');
                        const resolver = new ReaderResolver({
                            db: common.db,
                            handle: { ptr: SmartPointer.toBuffer(oldVal) }
                        });
                        oldVal = resolver.resolveSelf();
                    }
                } catch(e) {}
            }
        }
        
        return { oldPtr, oldVal };
    }

    /**
     * @method processSet
     * @description 
     *  Broadcasts the new manifestation to the Search and Vector angels.
     * @param {Object} db The database world context.
     * @param {string} path The string path of the vessel (e.g. "root.vectors").
     * @param {string|Buffer} key The name of the property being set.
     * @param {Buffer} valToSet The physical 16-byte block pointer.
     * @param {*} originalValue The raw JavaScript object that contains text/vectors.
     * @param {Buffer|null} oldPtr The previous 16-byte block pointer (if any).
     * @param {*} oldVal The previous JavaScript object state.
     * @param {boolean} searchIndexed Whether text search is watching.
     * @param {boolean} vectorIndex Whether spatial vectors are watching.
     * @param {Object} common Shared writing tools.
     */
    static processSet(db, path, key, valToSet, originalValue, oldPtr, oldVal, searchIndexed, vectorIndex, common) {
        // Update the Semantic Index (Words)
        if (searchIndexed) {
            // The Search engine expects the raw JS object to extract text.
            db.search.updateIndex(path, valToSet, oldPtr, oldVal, originalValue);
        }
        
        // Update the Spatial Index (Vectors)
        if (vectorIndex) {
            if (oldPtr) {
                db.vector.delete(path, String(key));
            }
            
            // Extract the spatial coordinates (vector) from the JS object
            const vec = common.extractVector(originalValue);
            
            if (vec) {
                // Insert into HNSW with the String Key, the FloatArray, and the physical pointer
                db.vector.insert(path, String(key), vec, valToSet);
            }
        }
    }

    /**
     * @method processDelete
     * @description 
     *  Erases the echoes of the deleted entity from the global networks.
     */
    static processDelete(db, path, key, oldPtr, oldVal, searchIndexed, vectorIndex) {
        if (searchIndexed && oldPtr) {
            db.search.updateIndex(path, null, oldPtr, oldVal, null);
        }
        if (vectorIndex && oldPtr) {
            db.vector.delete(path, String(key));
        }
    }
}

module.exports = MapIndexer;
