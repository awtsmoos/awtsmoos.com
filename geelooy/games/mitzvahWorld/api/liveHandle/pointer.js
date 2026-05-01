
// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/registry/handle.js');
const constants = require('../../constants.js');

module.exports = {
    updatePointer(state, newP) {
        if (!newP || !Buffer.isBuffer(newP)) return;

        // B"H: If the vessel is anchored, the Anchor absorbs the change.
        // The handle's pointer (to the Anchor) remains eternal.
        if (state.type === constants.VAL_TYPE.ANCHOR) {
            const decNew = SmartPointer.decode(newP);
            if (decNew) {
                const Anchor = require('../../structure/anchor/stable.js');
                const anchorManager = new Anchor(state.db);
                anchorManager.update(state.ptr, decNew.type, newP);
            }
            if (state.db) {
                state.db.mutationCount = (state.db.mutationCount || 0) + 1;
                state.lastMutationCount = state.db.mutationCount;
            }
            return;
        }

        if (state.ptr && Buffer.compare(state.ptr, newP) === 0) return;
        
        state.ptr = newP; 
        const dec = SmartPointer.decode(newP); 
        if (dec) state.type = dec.type;
        
        if (state.isUpdatingPointer) return; 
        state.isUpdatingPointer = true;
        
        try {
            if (state.db) { 
                state.db.mutationCount = (state.db.mutationCount || 0) + 1; 
                state.lastMutationCount = state.db.mutationCount; 
            }
            if (state.context && state.context.parent) {
                const pSoul = HandleRegistry.getSoul(state.context.parent);
                if (pSoul) { 
                    pSoul.ensureResolved(); 
                    pSoul.writer.set(state.context.key, newP, { isPtr: true, skipFree: true }); 
                }
            } 
            if (state.db && state.db.root && state === HandleRegistry.getSoul(state.db.root) && dec) {
                state.db.rootPtrRaw = newP;
                
                const sb = Buffer.allocUnsafe(64);
                const existingSb = state.db.pager.readExact(0, 64);
                if (existingSb) {
                    existingSb.copy(sb);
                } else {
                    sb.fill(0);
                }
                
                sb.writeBigUInt64BE(BigInt(dec.offset), 8);
                sb.writeBigUInt64BE(BigInt(dec.length), 16);
                
                state.db.pager.writeExact(0, sb);
            }
        } finally { 
            state.isUpdatingPointer = false; 
        }
    }
};
