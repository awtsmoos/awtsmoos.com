// B"H
/**
 * @file index.js (SequenceEngine)
 * @description The Scribe of the count-indexed B-Tree List.
 * REWRITTEN: Fixes structural anchor resolution to prevent index amnesia.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SequenceOps = require('./ops.js');
const SmartPointer = require('../../utils/smartPointer.js');

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);

        // B"H: Unpacking the binary seal into its physical coordinate.
        if (Buffer.isBuffer(ptr) && ptr.length === 16) {
            this.ptr = SmartPointer.resolve(ptr, this.allocator);
        } else {
            this.ptr = ptr || null;
        }
        
        this.nodeIO = new SequenceNode(this.v1, this);
        this.ops = new SequenceOps(this);
    }

    create() {
        const root = this.nodeIO.create(true);
        this.ptr = root.ptr; 
        this.nodeIO.save(root);
        return SmartPointer.block(constants.VAL_TYPE.SEQUENCE, this.ptr.blockId, this.ptr.length, !!this.ptr.isChain, this.ptr.offset);
    }

    length() {
        if (!this.ptr || this.ptr.blockId === 0) return 0;
        const n = this.nodeIO.load(this.ptr);
        return n ? n.totalCount : 0;
    }

    push(val) {
        const ptr = Buffer.isBuffer(val) ? val : this.allocator.save(val);
        const res = this.ops.splice(this.length(), 0, [ptr]);
        if (res && res.newPtr) this.ptr = res.newPtr;
    }

    splice(start, del, ...items) {
        const res = this.ops.splice(start, del, items);
        if (res && res.newPtr) this.ptr = res.newPtr;
    }

    getPtr(index) {
        let curAddr = this.ptr;
        let localIdx = index;
        
        while (curAddr && curAddr.blockId !== 0) {
            const n = this.nodeIO.load(curAddr);
            if (!n || localIdx >= n.totalCount) return undefined;

            if (n.isLeaf) {
                if (localIdx >= n.itemCount) return undefined;
                const p = Buffer.allocUnsafe(16);
                n.buffer.copy(p, 0, 23 + (localIdx * 16), 39 + (localIdx * 16));
                return p;
            }
            
            let off = 23; 
            let found = false;
            for(let i=0; i<n.itemCount; i++) {
                const count = n.buffer.readUInt32BE(off + 16);
                if (localIdx < count) { 
                    const childSeal = n.buffer.subarray(off, off + 16);
                    curAddr = SmartPointer.resolve(childSeal, this.allocator);
                    found = true; break; 
                }
                localIdx -= count; off += 20;
            }
            if (!found) return undefined;
        }
        return undefined;
    }

    get(idx, ctx) {
        const p = this.getPtr(idx);
        return p ? SmartPointer.resolve(p, this.allocator, ctx) : undefined;
    }

    * iterateRaw() {
        const len = this.length();
        for(let i=0; i<len; i++) {
            yield { ptr: this.getPtr(i) };
        }
    }
}
module.exports = SequenceEngine;