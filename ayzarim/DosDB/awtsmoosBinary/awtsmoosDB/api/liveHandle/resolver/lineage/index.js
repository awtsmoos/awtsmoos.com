
// B"H
/**
 * @file index.js (Lineage)
 * @chapter The Tree of Life (Etz Chaim)
 * @description
 * Re-aligns a child handle's pointer with its parent's current reality.
 */

const HandleRegistry = require('../../../../core/registry/handle.js');

class LineageResolution {
    static resolve(state, force) {
        const parent = state.context?.parent;
        if (!parent) return false;

        const parentSoul = HandleRegistry.getSoul(parent);
        if (!parentSoul) return false;

        parentSoul.ensureResolved(force);
        
        const parentHash = parentSoul.ptr ? parentSoul.ptr.toString('hex') : 'null';
        
        if (!force && state.ptr && state.lastParentPtrHash === parentHash) {
            return false;
        }

        const result = parentSoul.nav.resolveKey(state.context.key);
        if (result) {
            state.ptr = result.ptr;
            state.type = result.type;
        } else {
            state.ptr = null;
            state.type = null;
        }

        state.lastParentPtrHash = parentHash;
        return true;
    }
}

module.exports = LineageResolution;
