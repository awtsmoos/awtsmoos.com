
// B"H
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');
const Logger = require('../../../utils/centralLogger.js');

module.exports = {
    getPtrSize(ptrBuf) {
        return ptrBuf ? ptrBuf.length : 0;
    },

    decodePtr(buf) {
        if (!buf) return null;
        return SmartPointer.decode(buf, 0);
    },
    
    encodePtr(ptr) {
        if (Buffer.isBuffer(ptr)) return ptr;
        if (ptr.isStructure && ptr.data) return ptr.data; 
        return SmartPointer.toBuffer(ptr);
    },

    handleRootSplit(nodeIO, seq, root, splitNodes) {
        Logger.log("[SEQ_UTILS]", `Splitting Root. Sibling count: ${splitNodes.length}`);
        
        const newRoot = nodeIO.create(false, root.isWeak);
        
        newRoot.items.push({ ptr: this.encodePtr(root.ptr), count: root.totalCount });
        
        for(const sn of splitNodes) {
            newRoot.items.push({ ptr: this.encodePtr(sn.ptr), count: sn.totalCount });
        }
        
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        
        for(const item of newRoot.items) {
            newRoot.totalCount += item.count;
            newRoot.totalBytes += this.getPtrSize(item.ptr);
        }
        
        const rawPtr = nodeIO.save(newRoot);
        seq.ptr = { ...rawPtr, type: constants.TYPE_SEQUENCE };
        
        Logger.log("[SEQ_UTILS]", `New Root Stats: Total=${newRoot.totalCount}, Items=${newRoot.items.length}`);
    }
};
