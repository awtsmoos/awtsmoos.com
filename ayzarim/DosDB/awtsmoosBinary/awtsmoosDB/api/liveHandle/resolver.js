//B"H

/**
 * @file resolver.js
 * @description
 *  The Sefirah of Binah - The Logic of Resolution.
 *  This module handles the complex task of ensuring a handle's pointer 
 *  is current and synchronized with its parent in the fractal tree.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');

module.exports = {
    /**
     * @description
     *  Ensures the handle's pointer is valid and synchronized with the latest
     *  mutations in the database. If a parent node has moved or changed, 
     *  this method re-navigates to find the current pointer.
     */
    ensureResolved: async (state, force = false) => {
        if (state.isUpdatingPointer) return;
        const db = state.db;
        const gc = db.mutationCount || 0;
        if (!force && state.ptr && state.lastMutationCount === gc) return;

        return db.read(async () => {
            const gcLock = db.mutationCount || 0;
            if (!force && state.ptr && state.lastMutationCount === gcLock) return;

            let parentChanged = false;
            let parentH = null;

            if (state.context && state.context.parent) {
                // Access internal state safely to avoid proxy loops
                const HandleRegistry = require('../../core/handleRegistry.js');
                parentH = HandleRegistry.getSoul(state.context.parent);
                
                await parentH.ensureResolved(force);
                
                const currentParentHash = parentH.ptr ? parentH.ptr.toString('hex') : 'null';
                if (state.lastParentPtrHash !== currentParentHash) {
                    parentChanged = true;
                    state.lastParentPtrHash = currentParentHash;
                }
            }

            // Root check
            const isRoot = (db.root && (state === (require('../../core/handleRegistry.js').getSoul(db.root))));
            
            if (isRoot) {
                if (db.rootPtrRaw) {
                    if (!state.ptr || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
                        state.ptr = db.rootPtrRaw;
                        const decoded = SmartPointer.decode(state.ptr);
                        if (decoded) state.type = decoded.type;
                        state.writer.common.invalidateEngine();
                    }
                }
                state.lastMutationCount = gcLock;
                return;
            }

            if (parentH) {
                let result = await parentH.nav.resolveKey(state.context.key);
                
                // Retry if parent moved
                if (!result && (force || parentChanged) && (parentH.type === constants.TYPE_DICTIONARY || parentH.type === constants.TYPE_MAP)) {
                    parentH.writer.common.invalidateEngine();
                    result = await parentH.nav.resolveKey(state.context.key);
                }

                if (result) {
                    state.ptr = result.ptr;
                    state.type = result.type;
                    if (state.writer && state.writer.common) {
                        state.writer.common.invalidateEngine();
                    }
                } else {
                    state.ptr = null;
                    state.type = null; 
                }
            }
            state.lastMutationCount = gcLock;
        });
    },

    /**
     * @description
     *  Constructs the logical path from root to this handle.
     */
    getPath: (state) => {
        const parts = [];
        let curr = state.context;
        const HandleRegistry = require('../../core/handleRegistry.js');
        while (curr) {
            parts.unshift(String(curr.key));
            const pSoul = HandleRegistry.getSoul(curr.parent);
            curr = pSoul ? pSoul.context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }
};