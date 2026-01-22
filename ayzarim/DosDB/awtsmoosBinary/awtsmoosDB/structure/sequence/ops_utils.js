// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const Logger = require('../../utils/centralLogger.js');

const DATA_OFFSET = 23;
const ENTRY_SIZE = 20;
const POINTER_SIZE = 16;

/**
 * @module SequenceOpsUtils
 */
module.exports = {
    DATA_OFFSET,
    ENTRY_SIZE,
    POINTER_SIZE,

    getPtrSize(ptrBuf) {
        if (!ptrBuf || ptrBuf.length !== 16) return 0;
        const header = ptrBuf[0];
        const mode = (header >> 6) & 0x03;
        
        if (mode === constants.MODE_BLOCK) {
             const len = ptrBuf.readUInt32BE(7); 
             if (len > 1024 * 1024 * 1024) return 0;
             return len;
        }
        
        if (mode === constants.MODE_HEAP) {
            return ptrBuf.readUInt32BE(10); // Length at offset 10 for HEAP? Check Hydrator logic
            // In constants/smartPointer logic: Heap ptr has offset at 6, length at 10. Yes.
        }
        
        // Inline sizing
        const type = header & 0x3F;
        if (mode === constants.MODE_INLINE) {
             if (type === constants.TYPE_STRING) return ptrBuf[1];
             if (type === constants.TYPE_BOOLEAN) return 1;
             if (type === constants.TYPE_NUMBER) return 8;
             if (type === constants.TYPE_NULL || type === constants.TYPE_UNDEFINED) return 0;
             return 0;
        }
        return 0;
    },

    decodePtr(buf) {
        if (!buf || buf.length < 16) return null;
        // Basic block decoding helper
        return {
            blockId: readPointer48(buf, 1),
            length: buf.readUInt32BE(7),
            offset: buf.readUInt32BE(11),
            isChain: (buf[15] & 1) === 1
        };
    },
    
    encodePtr(ptr) {
        // Assume ptr is object {blockId...}. Convert to buffer.
        if (ptr.isStructure && ptr.data) return ptr.data; // Already buffer
        return SmartPointer.block(constants.TYPE_SEQUENCE, ptr.blockId, ptr.length, ptr.isChain, ptr.offset);
    },

    handleRootSplit(nodeIO, seq, root, splitNodes) {
        Logger.log("[SEQ_UTILS]", `Splitting Root. Sibling count: ${splitNodes.length}`);
        
        const newRoot = nodeIO.create(false, root.isWeak);
        const entries = [];
        
        // Add original root (now a child)
        const leftEntry = Buffer.alloc(20);
        
        // Careful: Root.ptr needs to be encoded. If it was modified in place, its .ptr is current.
        const leftPtr = Buffer.isBuffer(root.ptr) ? root.ptr : SmartPointer.toBuffer(root.ptr);
        leftPtr.copy(leftEntry, 0);
        leftEntry.writeUInt32BE(root.totalCount, 16);
        entries.push(leftEntry);
        
        for(const sn of splitNodes) {
            const e = Buffer.alloc(20);
            const snPtr = Buffer.isBuffer(sn.ptr) ? sn.ptr : SmartPointer.toBuffer(sn.ptr);
            snPtr.copy(e, 0);
            e.writeUInt32BE(sn.totalCount, 16);
            entries.push(e);
        }
        
        newRoot.itemCount = entries.length;
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        
        // Reallocate buffer if newRoot needs space for pointers
        const requiredSize = 23 + (entries.length * 20);
        if (newRoot.buffer.length < requiredSize) {
             newRoot.buffer = Buffer.allocUnsafe(requiredSize).fill(0);
        }

        let off = DATA_OFFSET;
        for(const e of entries) {
            const c = e.readUInt32BE(16);
            newRoot.totalCount += c;
            e.copy(newRoot.buffer, off);
            off += 20;
        }
        
        // Approx bytes calculation
        newRoot.totalBytes = this.sumChildrenBytes(nodeIO, entries);
        
        nodeIO.save(newRoot);
        seq.ptr = newRoot.ptr;
        Logger.log("[SEQ_UTILS]", `New Root Stats: Total=${newRoot.totalCount}, Items=${newRoot.itemCount}`);
    },

    sumChildrenBytes(nodeIO, entries) {
        let sum = 0;
        for(const e of entries) {
            const ptrBuf = e.subarray(0, 16);
            const ptr = this.decodePtr(ptrBuf);
            // Ideally avoid loading just for bytes stats to be fast?
            // For correctness, we load from cache.
            const node = nodeIO.load(ptr);
            if(node) sum += (node.totalBytes || 0);
        }
        return sum;
    }
};