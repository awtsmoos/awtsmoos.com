// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Tiferet - The Sequence Engine.
 *  Maintains list order with lightning-fast synchronous block operations.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SequenceOps = require('./ops.js');
const SmartPointer = require('../../utils/smartPointer.js');

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.db = allocator.v1.db;
        
        // B"H: Pointer Normalization.
        if (Buffer.isBuffer(ptr) && ptr.length === 16) {
            this.ptr = SmartPointer.resolve(ptr, allocator);
        } else {
            this.ptr = ptr || null;
        }
        
        this.nodeIO = new SequenceNode(allocator, this);
        this.ops = new SequenceOps(this);
    }

    create(options = {}) {
        const root = this.nodeIO.create(true, options.isWeak);
        this.ptr = root.ptr;
        this.nodeIO.save(root);
        return SmartPointer.block(constants.VAL_TYPE.SEQUENCE, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    length() {
        if (!this.ptr) return 0;
        return this.nodeIO.load(this.ptr).totalCount;
    }

    push(value) {
        const ptr = (Buffer.isBuffer(value) && value.length === 16) ? value : this.allocator.save(value);
        this.ops.append(ptr);
    }

    splice(start, deleteCount, ...items) {
        const newPtrs = [];
        for(const item of items) newPtrs.push((Buffer.isBuffer(item) && item.length === 16) ? item : this.allocator.save(item));
        this.ops.splice(start, deleteCount, newPtrs);
    }

    get(index) {
        const ptr = this.getPtr(index);
        return ptr ? SmartPointer.resolve(ptr, this.allocator) : undefined;
    }

    getPtr(index) {
        let currPtr = this.ptr;
        let localIdx = index;
        while (currPtr) {
            const node = this.nodeIO.load(currPtr);
            if (localIdx >= node.totalCount) return undefined;
            if (node.isLeaf) {
                const ptr = Buffer.allocUnsafe(16);
                node.buffer.copy(ptr, 0, 23 + (localIdx * 16), 39 + (localIdx * 16));
                return ptr;
            }
            let off = 23;
            for(let i=0; i<node.itemCount; i++) {
                const childCount = node.buffer.readUInt32BE(off + 16);
                if (localIdx < childCount) { currPtr = this._decodePtrBuf(node.buffer.subarray(off, off + 16)); break; }
                localIdx -= childCount; off += 20;
            }
        }
        return undefined;
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
module.exports = SequenceEngine;