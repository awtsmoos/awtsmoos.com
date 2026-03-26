
// B"H
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');
const Logger = require('../../../utils/centralLogger.js');

const DATA_OFFSET = 23;
const ENTRY_SIZE = 20;
const POINTER_SIZE = 16;

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
            return ptrBuf.readUInt32BE(10); 
        }
        
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
        return {
            blockId: readPointer48(buf, 1),
            length: buf.readUInt32BE(7),
            offset: buf.readUInt32BE(11),
            isChain: (buf[15] & 1) === 1,
            type: buf[0] & 0x3F // B"H: Preserve the essence of the type
        };
    },
    
    encodePtr(ptr) {
        // B"H: The Seal of Identity
        if (Buffer.isBuffer(ptr)) return ptr;
        if (ptr.isStructure && ptr.data) return ptr.data; 
        return SmartPointer.block(constants.TYPE_SEQUENCE, ptr.blockId, ptr.length, ptr.isChain, ptr.offset);
    },

    handleRootSplit(nodeIO, seq, root, splitNodes) {
        Logger.log("[SEQ_UTILS]", `Splitting Root. Sibling count: ${splitNodes.length}`);
        
        const newRoot = nodeIO.create(false, root.isWeak);
        const entries = [];
        
        const leftEntry = Buffer.alloc(20);
        // B"H: THE TIKKUN - We must seal the left pointer with its true identity!
        const leftPtr = this.encodePtr(root.ptr);
        leftPtr.copy(leftEntry, 0);
        leftEntry.writeUInt32BE(root.totalCount, 16);
        entries.push(leftEntry);
        
        for(const sn of splitNodes) {
            const e = Buffer.alloc(20);
            // B"H: And the siblings must also be sealed!
            const snPtr = this.encodePtr(sn.ptr);
            snPtr.copy(e, 0);
            e.writeUInt32BE(sn.totalCount, 16);
            entries.push(e);
        }
        
        newRoot.itemCount = entries.length;
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        
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
        
        newRoot.totalBytes = this.sumChildrenBytes(nodeIO, entries);
        
        const rawPtr = nodeIO.save(newRoot);
        // B"H: Ensure the master Sequence pointer retains its identity.
        seq.ptr = { ...rawPtr, type: constants.TYPE_SEQUENCE };
        
        Logger.log("[SEQ_UTILS]", `New Root Stats: Total=${newRoot.totalCount}, Items=${newRoot.itemCount}`);
    },

    sumChildrenBytes(nodeIO, entries) {
        let sum = 0;
        for(const e of entries) {
            const ptrBuf = e.subarray(0, 16);
            const ptr = this.decodePtr(ptrBuf);
            const node = nodeIO.load(ptr);
            if(node) sum += (node.totalBytes || 0);
        }
        return sum;
    }
};
