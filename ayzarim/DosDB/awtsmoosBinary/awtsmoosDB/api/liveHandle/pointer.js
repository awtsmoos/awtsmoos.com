// B"H
/**
 * @file pointer.js
 * @description
 *  The Sefirah of Netzach - Governing the Absolute Victory of Persistence.
 *  Ensures that as physical coordinates shift, the logical soul remains tethered.
 *  REWRITTEN: Forces strict recursive propagation and SuperBlock synchronization.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[32mB"H [POINTER_LOG] ${msg}\x1b[0m\n`); } catch(e) {}
}

module.exports = {
    updatePointer(state, newPtrBuffer) {
        if (!newPtrBuffer || !Buffer.isBuffer(newPtrBuffer)) return;
        
        const oldPtr = state.ptr;
        if (oldPtr && Buffer.compare(oldPtr, newPtrBuffer) === 0) return;

        // Update local state
        state.ptr = newPtrBuffer;
        const decoded = SmartPointer.decode(newPtrBuffer);
        if (decoded) state.type = decoded.type;

        // Prevent recursion loops
        if (state.isUpdatingPointer) return;
        state.isUpdatingPointer = true;

        try {
            const db = state.db;
            if (db) {
                db.mutationCount = (db.mutationCount || 0) + 1;
                state.lastMutationCount = db.mutationCount;
            }

            // 1. ASCENSION: Tell the parent about the new address
            if (state.context && state.context.parent) {
                const HandleRegistry = require('../../core/handleRegistry.js');
                const parentSoul = HandleRegistry.getSoul(state.context.parent);
                if (parentSoul) {
                    parentSoul.ensureResolved();
                    // Write the new child pointer into the parent's Map/Sequence
                    parentSoul.writer.set(state.context.key, newPtrBuffer, { 
                        isPtr: true, 
                        skipFree: true 
                    });
                }
            } 
            
            // 2. ROOT SEAL: If this is the Root, update Block 0
            const HandleRegistry = require('../../core/handleRegistry.js');
            const isRoot = (!state.context || (db && db.root && HandleRegistry.getSoul(db.root) === state));

            if (isRoot && db && decoded && decoded.mode === constants.MODE_BLOCK) {
                const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
                const blockId = readPointer48(decoded.payload, 0);
                const len = decoded.payload.readUInt32BE(6);
                const off = decoded.payload.readUInt32BE(10);
                const isChain = decoded.payload.readUInt8(14) === 1;

                db.rootPtrRaw = newPtrBuffer;
                db.allocator.v1.updateSuperBlock((sb) => {
                    writePointer48(sb, blockId, 64);
                    sb.writeUInt32BE(len, 70);
                    sb.writeUInt32BE(off, 74);
                    sb.writeUInt8(isChain ? 1 : 0, 78);
                });
            }
        } finally {
            state.isUpdatingPointer = false;
        }
    }
};