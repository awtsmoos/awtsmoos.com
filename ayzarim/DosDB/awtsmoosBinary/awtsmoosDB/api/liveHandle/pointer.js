
// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const constants = require('../../constants.js');
const HandleRegistry = require('../../core/registry/handle.js');

module.exports = {
    updatePointer(state, newP) {
        if (!newP || !Buffer.isBuffer(newP) || (state.ptr && Buffer.compare(state.ptr, newP) === 0)) return;
        state.ptr = newP; const dec = SmartPointer.decode(newP); if (dec) state.type = dec.type;
        if (state.isUpdatingPointer) return; state.isUpdatingPointer = true;
        try {
            if (state.db) { state.db.mutationCount = (state.db.mutationCount || 0) + 1; state.lastMutationCount = state.db.mutationCount; }
            if (state.context && state.context.parent) {
                const pSoul = HandleRegistry.getSoul(state.context.parent);
                if (pSoul) { pSoul.ensureResolved(); pSoul.writer.set(state.context.key, newP, { isPtr: true, skipFree: true }); }
            } 
            if (state.db && state.db.root && state === HandleRegistry.getSoul(state.db.root) && dec && dec.mode === constants.MODE_BLOCK) {
                const { writePointer48, readPointer48 } = require('../../utils/binary/helpers.js');
                const bid = readPointer48(dec.payload, 0), len = dec.payload.readUInt32BE(6), off = dec.payload.readUInt32BE(10), chain = dec.payload.readUInt8(14) === 1;
                state.db.rootPtrRaw = newP;
                state.db.allocator.v1.updateSuperBlock((sb) => { writePointer48(sb, bid, 64); sb.writeUInt32BE(len, 70); sb.writeUInt32BE(off, 74); sb.writeUInt8(chain ? 1 : 0, 78); });
            }
        } finally { state.isUpdatingPointer = false; }
    }
};
