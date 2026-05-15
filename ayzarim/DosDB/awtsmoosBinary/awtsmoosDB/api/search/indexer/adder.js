
// B"H
/**
 * @file adder.js
 * @module TokenAdder
 * @description
 *  ========================================================================================
 *  CHAPTER 10: THE BINDING OF THE SPARKS
 *  =======================================================================================
 *  When a word (token) is spoken into the search index, it forms a constellation
 *  (Sequence) of pointers back to all physical vessels that contain it.
 *
 *  The persistent source of truth remains the token Sequence. During large
 *  backfills, an in-process physical-ID cache avoids rescanning the same
 *  constellation for every incoming document, while preserving duplicate
 *  prevention.
 */

const constants = require('../../../constants.js');
const PhysicalIdentity = require('./phys_id.js');
const PhysCache = require('./physCache.js');

class TokenAdder {
    /**
     * @method add
     * @description Binds a raw pointer to a specific token's constellation.
     * @param {Object} db The database context.
     * @param {Object} indexHandle The LiveHandle of the master search index.
     * @param {string} token The specific word-spark.
     * @param {Buffer} ptr The raw physical pointer of the document.
     */
    static add(db, indexHandle, token, ptr) {
        let tokenList = indexHandle[token];

        // If the constellation for this token does not exist, manifest it from nothing.
        if (!tokenList || typeof tokenList.push !== 'function') {
            db.createList(indexHandle, token);
            tokenList = indexHandle[token];
        }

        if (!tokenList) {
            throw new Error(`B"H Fatal: Failed to manifest index constellation for token '${token}'. The void remains empty.`);
        }

        const listInt = tokenList[constants.SYMBOLS.INTERNALS] || tokenList;
        listInt.ensureResolved();

        const targetId = PhysicalIdentity.get(ptr);
        const seen = PhysCache.getTokenSet(db, indexHandle, token, listInt);

        if (!seen.has(targetId)) {
            // Push the raw internal pointer, telling the writer not to wrap it as a Buffer object.
            listInt.writer.push(ptr, { isPtr: true });
            seen.add(targetId);
        }
    }
}

module.exports = TokenAdder;
