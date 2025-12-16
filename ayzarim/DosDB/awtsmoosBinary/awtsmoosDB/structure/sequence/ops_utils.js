
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
        
        // B"H: Sanity check - Detect uninitialized memory (e.g. 0x8121...)
        // Mode 0, 1, 2. Header byte should be < 0xC0 (192).
        if (ptrBuf[0] > 0xC0) return 0; 

        if ((ptrBuf[0] >> 6) === constants.MODE_BLOCK) {
             // B"H: FIX - Length is at offset 7 (1 byte header + 6 bytes BlockID)
             // Payload structure: [BlockID (6)][Length (4)][Offset (4)][IsChain (1)]
             // Pointer structure: [Header (1)][Payload (15)]
             // So Length starts at index 1 + 6 = 7.
             const len = ptrBuf.readUInt32BE(7); 
             
             // Sanity check: Single block/chain shouldn't claim to be > 1GB unless specialized.
             // This prevents reading garbage bytes as massive sizes.
             if (len > 1024 * 1024 * 1024) return 0;
             return len;
        }
        
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        
        if (decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_STRING) return decoded.payload[0];
             if (decoded.type === constants.TYPE_BOOLEAN) return 1;
             if (decoded.type === constants.TYPE_NUMBER) return 8;
             if (decoded.type === constants.TYPE_NULL || decoded.type === constants.TYPE_UNDEFINED) return 0;
             return decoded.payload.length;
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
        const newRoot = await nodeIO.create(false);
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
