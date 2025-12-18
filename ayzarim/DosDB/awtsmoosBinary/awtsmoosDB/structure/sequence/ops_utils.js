
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

const DATA_OFFSET = 23;
const ENTRY_SIZE = 20;
const POINTER_SIZE = 16;

module.exports = {
    DATA_OFFSET,
    ENTRY_SIZE,
    POINTER_SIZE,

    getPtrSize(ptrBuf) {
        if (!ptrBuf || ptrBuf.length !== 16) return 0;
        // B"H: Fast Path - Direct Buffer Access
        const header = ptrBuf[0];
        const mode = (header >> 6) & 0x03;
        
        if (mode === constants.MODE_BLOCK) {
             // Length is at index 7-10 (4 bytes) in buffer
             // Payload starts at 1. readUInt32BE(6) relative to payload is 1+6 = 7.
             const len = ptrBuf.readUInt32BE(7); 
             if (len > 1024 * 1024 * 1024) return 0;
             return len;
        }
        
        if (mode === constants.MODE_HEAP) {
            // Length is at index 11-14
            return ptrBuf.readUInt32BE(11);
        }
        
        const type = header & 0x3F;
        if (mode === constants.MODE_INLINE) {
             if (type === constants.TYPE_STRING) return ptrBuf[1];
             if (type === constants.TYPE_BOOLEAN) return 1;
             if (type === constants.TYPE_NUMBER) return 8;
             if (type === constants.TYPE_NULL || type === constants.TYPE_UNDEFINED) return 0;
             // Default inline length logic (15 - unused)
             // But usually for strings it's length byte at [1].
             // Just fall back for complex ones?
             return 0;
        }
        return 0;
    },

    decodePtr(buf) {
        return {
            blockId: readPointer48(buf, 1),
            length: buf.readUInt32BE(7),
            offset: buf.readUInt32BE(11),
            isChain: (buf[15] & 1) === 1
        };
    },
    
    encodePtr(ptr) {
        return SmartPointer.block(constants.TYPE_SEQUENCE, ptr.blockId, ptr.length, ptr.isChain, ptr.offset);
    },

    async handleRootSplit(nodeIO, seq, root, splitNodes) {
        // B"H: New root inherits isWeak from current root to maintain non-destructive property
        const newRoot = await nodeIO.create(false, root.isWeak);
        const entries = [];
        
        const leftEntry = Buffer.alloc(20);
        this.encodePtr(root.ptr).copy(leftEntry, 0);
        leftEntry.writeUInt32BE(root.totalCount, 16);
        entries.push(leftEntry);
        
        for(const sn of splitNodes) {
            const e = Buffer.alloc(20);
            this.encodePtr(sn.ptr).copy(e, 0);
            e.writeUInt32BE(sn.totalCount, 16);
            entries.push(e);
        }
        
        newRoot.itemCount = entries.length;
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        let off = DATA_OFFSET;
        for(const e of entries) {
            const c = e.readUInt32BE(16);
            newRoot.totalCount += c;
            e.copy(newRoot.buffer, off);
            off += 20;
        }
        newRoot.totalBytes = await this.sumChildrenBytes(nodeIO, entries);
        await nodeIO.save(newRoot);
        seq.ptr = newRoot.ptr;
    },

    async sumChildrenBytes(nodeIO, entries) {
        let sum = 0;
        for(const e of entries) {
            const ptr = this.decodePtr(e.subarray(0, 16));
            const node = await nodeIO.load(ptr);
            sum += node.totalBytes;
        }
        return sum;
    }
};