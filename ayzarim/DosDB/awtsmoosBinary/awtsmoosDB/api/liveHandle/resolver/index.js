
// B"H
/**
 * @file index.js (Resolver)
 * @chapter The Restoration of Form (Tikkun)
 * @description
 * Tikkun is the process of fixing the shattered vessels. 
 * The Resolver ensures that the LiveHandle is always synchronized with
 * the physical reality on disk. 
 * 
 * "Renew our days as of old." (Lamentations 5:21)
 * Whenever a modification occurs anywhere in the database, the Resolver 
 * clears the cached perceptions of the Handle, forcing it to look anew at the 
 * underlying disk block, thus acknowledging potential relocations.
 */

const AnchorResolution = require('./anchor/index.js');
const LineageResolution = require('./lineage/index.js');
const RootResolution = require('./root/index.js');
const PathResolver = require('./path/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');

module.exports = {
    /**
     * @method ensureResolved
     * @description
     * Pierces the veil of caching to see current physical reality.
     * Re-resolution is mandatory whenever the global `mutationCount` changes.
     * 
     * @param {Object} state - Internal handle soul.
     * @param {boolean} force - Force re-lookup regardless of mutation status.
     */
    ensureResolved(state, force = false) {
        if (state.isUpdatingPointer) return;

        const db = state.db;
        const currentMutation = db.mutationCount || 0;

        // If the world hasn't changed since our last look, we rest.
        if (!force && state.ptr && state.lastMutationCount === currentMutation && state.type !== null) {
            return;
        }

        db.lock.runRead(() => {
            const isRoot = db.root ? (state === HandleRegistry.getSoul(db.root)) : (!state.context && !state.ptr);
            
            // 1. Lineage & Pointer Verification
            if (isRoot) {
                RootResolution.resolve(state, db);
            } else {
                LineageResolution.resolve(state, force);
            }

            // 2. Anchor Deep-Look (Reveals data inside Type 50 wrappers)
            // Even if the pointer is identical, the anchor block's CONTENT 
            // could have relocated.
            AnchorResolution.resolve(state);
            
            // Seal the memory with the current time of creation.
            state.lastMutationCount = currentMutation;
        });
    },

    /**
     * @method getPath
     * @description Recovers the handle's genealogy.
     */
    getPath: (state) => PathResolver.getPath(state)
};
