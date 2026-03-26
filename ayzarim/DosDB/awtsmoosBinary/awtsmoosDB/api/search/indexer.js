
// B"H
/**
 * @file indexer.js
 * @module SearchIndexer
 * @description
 *  =============================================================================
 *  CHAPTER 12: THE ORCHESTRATOR OF THE SEARCH SCRIBES (DA'AT)
 *  =============================================================================
 *  "The letters of His speech are the soul of the stone." (Shaar HaYichud ViHaemunah)
 * 
 *  This module is the Archangel of Knowledge (Da'at), directing the flow of 
 *  words from the chaotic void into the organized constellations of the Search Index.
 * 
 *  THE TIKKUN OF GILGUL (THE FIX OF REINCARNATION):
 *  When an entity in the database is spliced or replaced, it does not merely 
 *  change its contents; it is reincarnated into an entirely new physical block 
 *  (a new `newPtr`). The old block (`oldPtr`) returns to the abyss.
 *  
 *  Previously, the indexer confused the new body with the old, attempting to 
 *  remove the new pointer from the old words, leading to phantom data and 
 *  corrupted searches. 
 *  Now, the Orchestrator perfectly discerns between the past and the present. 
 *  It severs the `oldPtr` from the discarded words, binds the `newPtr` to the 
 *  new words, and—most crucially—re-anchors the retained words from the old 
 *  vessel to the new one. Thus, the chain of existence remains unbroken.
 */

const constants = require('../../constants.js');
const ops = require('./indexer/ops.js');

/**
 * @class SearchIndexer
 * @description Manages the high-level synchronization between the physical database and the semantic index.
 */
class SearchIndexer {
    /**
     * @constructor
     * @param {Object} db - The Awtsmoos database essence.
     * @param {Object} sysIndex - The LiveHandle pointing to the system's root index map.
     */
    constructor(db, sysIndex) {
        this.db = db;
        this.sysIndex = sysIndex;
    }

    /**
     * @method updateIndex
     * @description 
     *  The sacred balancing of the scales. Analyzes the old and new manifestations 
     *  and instructs the scribes to alter the constellations accordingly.
     * 
     * @param {string} path - The dimensional path of the collection.
     * @param {Buffer|null} newPtr - The physical address of the newly incarnated vessel.
     * @param {Buffer|null} oldPtr - The physical address of the previous, fading vessel.
     * @param {*} oldVal - The abstract thought (data) of the previous state.
     * @param {*} newVal - The abstract thought (data) of the new state.
     */
    updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        let oldTokens = new Set();
        let newTokens = new Set();
        
        if (oldVal) oldTokens = ops.extractTokens(oldVal);
        if (newVal) newTokens = ops.extractTokens(newVal);

        const toAdd = [];
        const toRemove = [];
        const toUpdate = [];

        // B"H: The Sorting of the Sparks
        // We separate the words into those that are new, those that have vanished, 
        // and those that remain eternal across the transformation.
        for (const t of newTokens) {
            if (!oldTokens.has(t)) toAdd.push(t);
            else toUpdate.push(t);
        }
        for (const t of oldTokens) {
            if (!newTokens.has(t)) toRemove.push(t);
        }
        
        const indexHandle = this._getPathIndexHandle(path);
        if (!indexHandle) return;

        // B"H: Severing the Past
        // We explicitly command the scribes to erase the old physical anchor.
        if (toRemove.length > 0 && oldPtr) {
            for (const token of toRemove) {
                 ops.removeToken(this.db, indexHandle, token, oldPtr);
            }
        }
        
        // B"H: Binding the Future
        // We command the scribes to bind the new words to the new physical anchor.
        if (toAdd.length > 0 && newPtr) {
            for (const token of toAdd) {
                 ops.addToken(this.db, indexHandle, token, newPtr);
            }
        }

        // B"H: Re-Anchoring the Eternal
        // If a word exists in both states, but the physical body has changed (Gilgul),
        // we must cut the tie to the old dead block and forge a tie to the living one.
        if (oldPtr && newPtr && Buffer.compare(oldPtr, newPtr) !== 0) {
            for (const token of toUpdate) {
                ops.removeToken(this.db, indexHandle, token, oldPtr);
                ops.addToken(this.db, indexHandle, token, newPtr);
            }
        }
    }

    /**
     * @method flush
     * @description Commits the changes to the void. (Currently handled by the DB background flusher).
     */
    flush() {}

    /**
     * @method _getPathIndexHandle
     * @description Navigates through the fractal hierarchy to locate the specific index map for a path.
     * @param {string} path - The dimensional coordinate.
     * @returns {Object} The LiveHandle of the index map.
     */
    _getPathIndexHandle(path) {
        let h = this.sysIndex[path];
        
        if (!h) {
            this.sysIndex[path] = new this.db.Map();
            h = this.sysIndex[path];
        }
        
        const i = h[constants.SYMBOLS.INTERNALS] || h;
        i.ensureResolved(true);
        return i.self || i;
    }
}

module.exports = SearchIndexer;
