
// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/registry/handle.js');

module.exports = {
    updatePointer(state, newP) {
        if (!newP || !Buffer.isBuffer(newP) || (state.ptr && Buffer.compare(state.ptr, newP) === 0)) return;
        
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
                // B"H: The Root is the Absolute Anchor of Reality. 
                state.db.rootPtrRaw = newP;
                
                const sb = Buffer.allocUnsafe(64);
                
                // B"H: THE TIKKUN. Keep the existing EOF cursor at bytes 0-7 by reading the FRESH block.
                const existingSb = state.db.pager.readExact(0, 64);
                if (existingSb) {
                    existingSb.copy(sb);
                } else {
                    sb.fill(0);
                }
                
                // Write the root offset and length into bytes 8-23
                sb.writeBigUInt64BE(BigInt(dec.offset), 8);
                sb.writeBigUInt64BE(BigInt(dec.length), 16);
                
                state.db.pager.writeExact(0, sb);
            }
        } finally { 
            state.isUpdatingPointer = false; 
        }
    }
};
