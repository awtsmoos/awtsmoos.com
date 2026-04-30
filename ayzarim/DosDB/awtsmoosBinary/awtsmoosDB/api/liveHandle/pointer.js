
// B"H
/**
 * @file api/liveHandle/pointer.js
 */

const SmartPointer = require('../../utils/smartPointer/index.js');
const HandleRegistry = require('../../core/registry/handle.js');
const constants = require('../../constants.js');

module.exports = {
    updatePointer(state, newP) {
        if (!newP || !Buffer.isBuffer(newP)) return;

        // Anchor Stability ritual
        if (state.type === constants.VAL_TYPE.ANCHOR) {
            if (state.isUpdatingPointer) return;
            state.isUpdatingPointer = true;
            try {
                const dec = SmartPointer.decode(newP);
                if (dec) {
                    const Anchor = require('../../structure/anchor/stable.js');
                    const manager = new Anchor(state.db);
                    manager.update(state.ptr, dec.type, newP);
                }
            } finally { state.isUpdatingPointer = false; }
            return;
        }

        // Compare pure essences
        if (state.ptr && Buffer.compare(state.ptr, newP) === 0) return;
        
        state.ptr = newP;
        const d = SmartPointer.decode(newP);
        if (d) state.type = d.type;
        
        if (state.isUpdatingPointer) return;
        state.isUpdatingPointer = true;
        
        try {
            // Reincarnation in the Parent structure
            if (state.context && state.context.parent) {
                const p = HandleRegistry.getSoul(state.context.parent);
                if (p) p.writer.set(state.context.key, newP, { isPtr: true });
            }
        } finally { state.isUpdatingPointer = false; }
    }
};
