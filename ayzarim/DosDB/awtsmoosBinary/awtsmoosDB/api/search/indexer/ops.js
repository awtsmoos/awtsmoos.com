
// B"H
/**
 * @file ops.js
 * @module IndexOperations
 * @description
 *  =============================================================================
 *  CHAPTER 12: THE GRAND ORCHESTRATOR OF THE INDEX
 *  =============================================================================
 *  This module serves as the central command node (Da'at - Knowledge) that unites 
 *  the various angelic forces of the Search Index. It delegates the extraction 
 *  of sparks to the TokenExtractor, the binding of light to the TokenAdder, 
 *  and the severing of ties to the TokenRemover.
 *  
 *  By keeping these distinct acts completely modular, the codebase reflects the 
 *  divine order (Seder Hishtalshelus), where each entity has a singular, focused 
 *  purpose, all working in unison to manifest the Will of the Creator within 
 *  the realm of data retrieval.
 */

const TokenExtractor = require('./extractor.js');
const TokenAdder = require('./adder.js');
const TokenRemover = require('./remover.js');

/**
 * @const IndexOperations
 * @description Exposes the unified functions for search index manipulation.
 */
const IndexOperations = {
    /**
     * @method extractTokens
     * @description Shatters an entity into unique, lowercase, alphanumeric tokens.
     */
    extractTokens(val) {
        return TokenExtractor.extract(val);
    },

    /**
     * @method addToken
     * @description Binds a document's physical pointer to a token constellation.
     */
    addToken(db, indexHandle, token, ptr) {
        return TokenAdder.add(db, indexHandle, token, ptr);
    },

    /**
     * @method removeToken
     * @description Removes a document's physical pointer from a token constellation.
     */
    removeToken(db, indexHandle, token, ptrToRemove) {
        return TokenRemover.remove(db, indexHandle, token, ptrToRemove);
    }
};

module.exports = IndexOperations;
