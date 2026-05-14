
// B"H
/**
 * @file remover.js
 * @module TokenRemover
 * @description
 *  =============================================================================
 *  CHAPTER 11: THE SEVERING OF THE TIES (HISTALKUS)
 *  =============================================================================
 *  "The Lord gives, and the Lord takes away..." (Job 1:21)
 *  
 *  When a document is altered or deleted, its connections to the world of tokens 
 *  must be severed. If a word is no longer present within the text, its physical 
 *  pointer must be excised from the token's constellation.
 * 
 *  This module searches the Sequence structure directly, avoiding the overhead 
 *  of JavaScript hydration, locates the naked physical identity of the pointer, 
 *  and surgically splices it out of existence. If a constellation becomes entirely 
 *  empty, the entire token entry is deleted from the index, returning the space 
 *  to the primordial void.
 */

const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');
const constants = require('../../../constants.js');
const PhysicalIdentity = require('./phys_id.js');

class TokenRemover {
    /**
     * @method remove
     * @description Severs a raw pointer from a specific token's constellation.
     * @param {Object} db The database context.
     * @param {Object} indexHandle The LiveHandle of the master search index.
     * @param {string} token The specific word-spark.
     * @param {Buffer} ptrToRemove The raw 16-byte physical pointer to sever.
     */
    static remove(db, indexHandle, token, ptrToRemove) {
        const tokenList = indexHandle[token];
        if (!tokenList) return; // The constellation is already empty.
        
        const targetId = PhysicalIdentity.get(ptrToRemove);
        const listInt = tokenList[constants.SYMBOLS.INTERNALS];
        if (!listInt) return;
        
        listInt.ensureResolved();
        if (!listInt.ptr) return;
        
        // Resolve the physical Sequence engine directly.
        const struct = listInt.nav.resolveStructPtr();
        if (!struct) return;

        const seq = new Sequence(db.allocator, struct);
        const len = seq.length();
        
        let idxToRemove = -1;
        
        // Scan the sequence for the target physical ID
        for (let i = 0; i < len; i++) {
            const p = seq.getPtr(i);
            if (p && PhysicalIdentity.get(p) === targetId) {
                idxToRemove = i;
                break;
            }
        }
        
        if (idxToRemove !== -1) {
            // Surgically remove the pointer using the Sequence splice command
            tokenList.splice(idxToRemove, 1);
            
            // If the constellation is now dark, delete the galaxy.
            if (tokenList.length === 0) { 
                delete indexHandle[token];
            }
        }
    }
}

module.exports = TokenRemover;
