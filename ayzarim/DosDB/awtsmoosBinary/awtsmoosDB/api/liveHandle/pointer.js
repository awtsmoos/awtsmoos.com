//B"H

/**
 * @file pointer.js
 * @description
 *  The Sefirah of Netzach - The Persistence of the Pointer.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');

module.exports = {
    /**
     * @description
     *  Updates the internal pointer and bubbles the change up to parents synchronously.
     */
    updatePointer(state, newPtrBuffer) {
        if (!newPtrBuffer) return;
        
        const oldPtr = state.ptr;
        state.ptr = newPtrBuffer;
        
        const decoded = SmartPointer.decode(newPtrBuffer);
        if(decoded) state.type = decoded.type;
        
        state.isUpdatingPointer = true;

        if (state.writer && state.writer.common) {
            state.writer.common.invalidateEngine();
        }

        const db = state.db;
        if (db) {
            db.mutationCount = (db.mutationCount || 0) + 1;
            state.lastMutationCount = db.mutationCount; 
            
            if (db.graph && oldPtr) {
                const oldId = db.graph.utils.getIdFromPtr(oldPtr);
                const newId = db.graph.utils.getIdFromPtr(newPtrBuffer);
                if (oldId && newId && oldId !== newId) {
                    db.graph._relocateNode(oldId, newId);
                }
            }
        }

        try {
            if (state.context && state.context.parent) {
                const HandleRegistry = require('../../core/handleRegistry.js');
                const parentH = HandleRegistry.getSoul(state.context.parent);
                parentH.ensureResolved(true);
                parentH.writer.set(state.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
                if (parentH.ptr) state.lastParentPtrHash = parentH.ptr.toString('hex');
            } else if (db.root && (require('../../core/handleRegistry.js').getSoul(db.root) === state)) {
                if (decoded && decoded.mode === constants.MODE_BLOCK) {
                    const { readPointer48, writePointer48 } = require('../../utils/binaryHelpers.js');
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
            }
        } finally {
            state.isUpdatingPointer = false;
        }
    }
};