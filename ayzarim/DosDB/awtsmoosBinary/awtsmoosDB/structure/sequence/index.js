
// B"H
/**
 * @file index.js (SequenceEngine)
 * @description The Scribe of the count-indexed B-Tree List.
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SequenceOps = require('./ops/index.js');
const SmartPointer = require('../../utils/smartPointer.js');

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);

        if (Buffer.isBuffer(ptr)) {
            const dec = SmartPointer.decode(ptr);
            if (dec) {
                this.ptr = { isStructure: true, type: dec.type, offset: dec.offset, length: dec.length, ptr };
            } else {
                this.ptr = ptr || null;
            }
        } else {
            this.ptr = ptr || null;
        }
        
        this.nodeIO = new SequenceNode(this.v1, this);
        this.ops = new SequenceOps(this);
    }

    create() {
        const root = this.nodeIO.create(true);
        this.ptr = this.nodeIO.save(root);
        return SmartPointer.toBuffer(this.ptr);
    }

    length() {
        if (!this.ptr || this.ptr.offset === undefined) return 0;
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
        
        while (curAddr && curAddr.offset !== undefined) {
            const n = this.nodeIO.load(curAddr);
            if (!n || localIdx >= n.totalCount) return undefined;

            if (n.isLeaf) {
                if (localIdx >= n.items.length) return undefined;
                return n.items[localIdx].ptr;
            }
            
            let found = false;
            for(let i=0; i<n.items.length; i++) {
                const count = n.items[i].count;
                if (localIdx < count) { 
                    const childSeal = n.items[i].ptr;
                    curAddr = SmartPointer.resolve(childSeal, this.allocator);
                    found = true; break; 
                }
                localIdx -= count;
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
