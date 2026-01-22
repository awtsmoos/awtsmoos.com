/**
 * B"H
 * 
 * In the realm of Netzach (Victory), the Resolver ensures the 
 * persistence of the Pointer. He knows when the parent has shifted its weight, 
 * and he recalculates the child's coordinate in an instant. No delay is allowed. 
 * The spirit of the pointer is unchanging, even as its block-location changes.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');

module.exports = {
    /**
     * @description Ensures the soul of the handle is aligned with its physical anchor.
     */
    ensureResolved(state, force = false) {
        if (state.isUpdatingPointer) return;

        const db = state.db;
        const mutationAtEntry = db.mutationCount || 0;

        // B"H: Direct avoidance of expensive re-resolution if nothing changed.
        if (!force && state.ptr && state.lastMutationCount === mutationAtEntry && state.type !== null) return;

        return db.lock.runRead(() => {
            const gcLock = db.mutationCount || 0;
            const getRegistry = () => require('../../core/handleRegistry.js');
            let parentChanged = false;
            let parentSoul = null;

            if (state.context && state.context.parent) {
                parentSoul = getRegistry().getSoul(state.context.parent);
                if (parentSoul) {
                    parentSoul.ensureResolved(force);
                    const currentParentHash = parentSoul.ptr ? parentSoul.ptr.toString('hex') : 'null';
                    if (state.lastParentPtrHash !== currentParentHash) {
                        parentChanged = true;
                        state.lastParentPtrHash = currentParentHash;
                    }
                }
            }

            const isRoot = (!state.context || (db.root && state === getRegistry().getSoul(db.root)));
            
            if (isRoot) {
                if (db.rootPtrRaw) {
                    if (!state.ptr || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
                        state.ptr = db.rootPtrRaw;
                        const decoded = SmartPointer.decode(state.ptr);
                        if (decoded) state.type = decoded.type;
                    }
                }
                state.lastMutationCount = gcLock;
                return;
            }

            if (parentSoul) {
                if (force || parentChanged || !state.ptr) {
                    let result = parentSoul.nav.resolveKey(state.context.key);
                    
                    if (result) {
                        state.ptr = result.ptr;
                        state.type = result.type;
                    } else {
                        state.ptr = null;
                        state.type = null; 
                    }
                }
            }
            
            state.lastMutationCount = gcLock;
        });
    },

    /**
     * @description Recursively climbs the hierarchy of parentage to manifest the full name.
     */
    getPath(state) {
        const parts = [];
        let curr = state.context;
        const getRegistry = () => require('../../core/handleRegistry.js');
        while (curr) {
            parts.unshift(String(curr.key));
            const pSoul = getRegistry().getSoul(curr.parent);
            curr = pSoul ? pSoul.context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }
};