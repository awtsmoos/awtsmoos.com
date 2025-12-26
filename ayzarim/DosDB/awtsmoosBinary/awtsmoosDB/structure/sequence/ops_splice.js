// B"H
const SmartPointer = require('../../utils/smartPointer.js');

class SpliceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    splice(start, deleteCount, newItems) {
        const root = this.nodeIO.load(this.seq.ptr);
        this._spliceRecursive(root, start, deleteCount, newItems);
    }

    _spliceRecursive(node, start, deleteCount, newItems) {
        if (node.isLeaf) {
            const ptrs = [];
            for(let i=0; i<node.itemCount; i++) {
                const p = Buffer.alloc(16);
                node.buffer.copy(p, 0, 23 + (i * 16), 39 + (i * 16));
                ptrs.push(p);
            }
            ptrs.splice(start, deleteCount, ...newItems);
            // Re-fill node buffer (simplified: assume fits in one page for sync proof)
            node.itemCount = Math.min(ptrs.length, 200);
            node.totalCount = node.itemCount;
            node.buffer.fill(0, 23);
            for(let i=0; i<node.itemCount; i++) {
                ptrs[i].copy(node.buffer, 23 + (i * 16));
            }
            this.nodeIO.save(node);
        } else {
            // Internal splice logic omitted: delegating to child nodes
            let currentOffset = 0;
            for(let i=0; i<node.itemCount; i++) {
                const entryOff = 23 + (i * 20);
                const count = node.buffer.readUInt32BE(entryOff + 16);
                if (start < currentOffset + count) {
                     const childPtr = this._decodePtrBuf(node.buffer.subarray(entryOff, entryOff + 16));
                     const child = this.nodeIO.load(childPtr);
                     this._spliceRecursive(child, Math.max(0, start - currentOffset), deleteCount, newItems);
                     node.buffer.writeUInt32BE(child.totalCount, entryOff + 16);
                     // Recalc total omitted
                     break;
                }
                currentOffset += count;
            }
            this.nodeIO.save(node);
        }
    }

    _decodePtrBuf(buf) {
        return { 
            blockId: SmartPointer.getBlockId(buf), 
            length: SmartPointer.getLength(buf), 
            offset: SmartPointer.getOffset(buf), 
            isChain: SmartPointer.isChain(buf) 
        };
    }
}
module.exports = SpliceOps;
