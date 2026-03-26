
// B"H
/**
 * @file resolver.js
 * @description
 * In the realm of Netzach (Victory), the Resolver ensures the 
 * persistence of the Pointer. He knows when the parent has shifted its weight, 
 * and he recalculates the child's coordinate in an instant. No delay is allowed. 
 * The spirit of the pointer is unchanging, even as its physical block-location shifts.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');

module.exports = {
    /**
     * @method ensureResolved
     * @description Ensures the soul of the handle is aligned with its physical anchor on disk.
     */
    ensureResolved(state, force = false) {
        if (state.isUpdatingPointer) return;

        const db = state.db;
        const mutationAtEntry = db.mutationCount || 0;

        if (!force && state.ptr && Buffer.isBuffer(state.ptr) && state.lastMutationCount === mutationAtEntry && state.type !== null) return;

        return db.lock.runRead(() => {
            const gcLock = db.mutationCount || 0;
            const getRegistry = () => require('../../core/registry/handle.js');
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

            const isRoot = db.root ? (state === getRegistry().getSoul(db.root)) : (!state.context && !state.ptr);
            
            if (isRoot) {
                if (db.rootPtrRaw) {
                    if (!state.ptr || !Buffer.isBuffer(state.ptr) || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
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
     * @method getPath
     * @description Traces the lineage of the soul back to the Root.
     */
    getPath(state) {
        const parts = [];
        let curr = state.context;
        const getRegistry = () => require('../../core/registry/handle.js');
        while (curr) {
            parts.unshift(String(curr.key));
            const pSoul = getRegistry().getSoul(curr.parent);
            curr = pSoul ? pSoul.context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }
};
