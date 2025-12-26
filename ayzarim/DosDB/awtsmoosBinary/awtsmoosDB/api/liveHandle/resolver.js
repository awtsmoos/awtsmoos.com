//B"H

/**
 * @file resolver.js
 * @description
 *  The Sefirah of Binah - The Logic of Resolution.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');

module.exports = {
    /**
     * @description
     *  Ensures the handle's pointer is valid and synchronized synchronously.
     */
    ensureResolved(state, force = false) {
        if (state.isUpdatingPointer) return;
        const db = state.db;
        const gc = db.mutationCount || 0;
        if (!force && state.ptr && state.lastMutationCount === gc) return;

        return db.read(() => {
            const gcLock = db.mutationCount || 0;
            if (!force && state.ptr && state.lastMutationCount === gcLock) return;

            let parentChanged = false;
            let parentH = null;

            if (state.context && state.context.parent) {
                const HandleRegistry = require('../../core/handleRegistry.js');
                parentH = HandleRegistry.getSoul(state.context.parent);
                parentH.ensureResolved(force);
                
                const currentParentHash = parentH.ptr ? parentH.ptr.toString('hex') : 'null';
                if (state.lastParentPtrHash !== currentParentHash) {
                    parentChanged = true;
                    state.lastParentPtrHash = currentParentHash;
                }
            }

            const isRoot = (db.root && (state === (require('../../core/handleRegistry.js').getSoul(db.root))));
            
            if (isRoot) {
                if (db.rootPtrRaw) {
                    if (!state.ptr || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
                        state.ptr = db.rootPtrRaw;
                        const decoded = SmartPointer.decode(state.ptr);
                        if (decoded) state.type = decoded.type;
                        if (state.writer && state.writer.common) state.writer.common.invalidateEngine();
                    }
                }
                state.lastMutationCount = gcLock;
                return;
            }

            if (parentH) {
                let result = parentH.nav.resolveKey(state.context.key);
                if (!result && (force || parentChanged) && (parentH.type === constants.TYPE_DICTIONARY || parentH.type === constants.TYPE_MAP)) {
                    if (parentH.writer && parentH.writer.common) parentH.writer.common.invalidateEngine();
                    result = parentH.nav.resolveKey(state.context.key);
                }

                if (result) {
                    state.ptr = result.ptr;
                    state.type = result.type;
                    if (state.writer && state.writer.common) state.writer.common.invalidateEngine();
                } else {
                    state.ptr = null;
                    state.type = null; 
                }
            }
            state.lastMutationCount = gcLock;
        });
    },

    getPath(state) {
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