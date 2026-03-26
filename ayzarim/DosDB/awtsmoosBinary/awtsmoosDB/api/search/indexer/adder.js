
// B"H
/**
 * @file adder.js
 * @module TokenAdder
 * @description
 *  =============================================================================
 *  CHAPTER 10: THE BINDING OF THE SPARKS
 *  =============================================================================
 *  When a word (token) is spoken into the search index, it forms a constellation 
 *  (Sequence) of pointers back to all physical vessels that contain it.
 *  
 *  This module performs the sacred union. Crucially, it identifies if the 
 *  pointer already exists in the constellation by stripping its garments and 
 *  comparing its physical ID. If it does not exist, it pushes the RAW pointer 
 *  down into the Sequence Writer, passing the holy directive `{ isPtr: true }`.
 *  
 *  This directive prevents the Allocator's Builder from erroneously taking the 
 *  16-byte raw pointer and wrapping it in an entirely new "Buffer Object" vessel. 
 *  By keeping the pointer pure, intersection algorithms (AND logic) can perfectly 
 *  match the physical IDs.
 */

const Sequence = require('../../../structure/sequence/index.js');
const constants = require('../../../constants.js');
const PhysicalIdentity = require('./phys_id.js');

class TokenAdder {
    /**
     * @method add
     * @description Binds a raw pointer to a specific token's constellation.
     * @param {Object} db The database context.
     * @param {Object} indexHandle The LiveHandle of the master search index.
     * @param {string} token The specific word-spark.
     * @param {Buffer} ptr The raw 16-byte physical pointer of the document.
     */
    static add(db, indexHandle, token, ptr) {
        let tokenList = indexHandle[token];
        
        // If the constellation for this token does not exist, manifest it from nothing.
        if (!tokenList || typeof tokenList.push !== 'function') {
            db.createList(indexHandle, token);
            tokenList = indexHandle[token];
        }

        if (tokenList) {
            // Retrieve the internal soul of the list to bypass proxies
            const listInt = tokenList[constants.SYMBOLS.INTERNALS] || tokenList;
            listInt.ensureResolved();
            
            const targetId = PhysicalIdentity.get(ptr);
            let exists = false;
            
            // B"H: Prevent Duplicates. Scan using the underlying Sequence Engine 
            // to retrieve raw pointers safely and rapidly without triggering JS hydration.
            const structPtr = listInt.nav.resolveStructPtr();
            if (structPtr) {
                const seq = new Sequence(db.allocator, structPtr);
                const len = seq.length();
                for (let i = 0; i < len; i++) {
                    const p = seq.getPtr(i);
                    if (p && PhysicalIdentity.get(p) === targetId) {
                        exists = true;
                        break;
                    }
                }
            }

            if (!exists) {
                // B"H: THE TIKKUN (THE FIX).
                // Push the explicit 16-byte raw internal pointer, telling the writer 
                // NOT to wrap it in a new buffer by passing { isPtr: true }.
                listInt.writer.push(ptr, { isPtr: true });
            }
        } else {
            throw new Error(`B"H Fatal: Failed to manifest index constellation for token '${token}'. The void remains empty.`);
        }
    }
}

module.exports = TokenAdder;
