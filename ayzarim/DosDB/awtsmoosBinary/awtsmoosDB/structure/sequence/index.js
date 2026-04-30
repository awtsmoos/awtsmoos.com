
// B"H
/**
 * @file sequence/index.js
 * @chapter The House of Sequences (List)
 */

const constants = require('../../constants.js');
const SequenceNode = require('./node.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

class SequenceEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.db = allocator.db;
        
        if (Buffer.isBuffer(ptr)) {
            this.ptr = SmartPointer.decode(ptr);
        } else {
            this.ptr = ptr;
        }
        
        this.nodeIO = new SequenceNode(this.allocator, this);
    }

    create() {
        const root = this.nodeIO.create(true);
        const pLoc = this.nodeIO.save(root);
        this.ptr = { ...pLoc, type: constants.VAL_TYPE.SEQUENCE };
        return SmartPointer.toBuffer(this.ptr);
    }

    length() {
        if (!this.ptr) return 0;
        const n = this.nodeIO.load(this.ptr);
        return n ? n.totalCount : 0;
    }

    seal() {
        return SmartPointer.toBuffer(this.ptr);
    }

    push(val, options = {}) {
        if (!this.ptr) this.create();
        const p = (options.isPtr || Buffer.isBuffer(val)) ? val : this.allocator.save(val);
        
        let root = this.nodeIO.load(this.ptr);
        root.items.push({ ptr: p, count: 1 });
        root.totalCount++;
        
        const pLoc = this.nodeIO.save(root);
        this.ptr = { ...pLoc, type: constants.VAL_TYPE.SEQUENCE };
        return SmartPointer.toBuffer(this.ptr);
    }

    splice(start, del, ...items) {
        if (!this.ptr) this.create();
        let root = this.nodeIO.load(this.ptr);
        
        const entryItems = items.map(i => ({ ptr: i, count: 1 }));
        root.items.splice(start, del, ...entryItems);
        
        let tc = 0;
        for (const item of root.items) tc += item.count;
        root.totalCount = tc;

        const pLoc = this.nodeIO.save(root);
        this.ptr = { ...pLoc, type: constants.VAL_TYPE.SEQUENCE };
        return SmartPointer.toBuffer(this.ptr);
    }

    getPtr(idx) {
        if (!this.ptr) return null;
        let root = this.nodeIO.load(this.ptr);
        if (!root || idx >= root.totalCount || idx < 0) return null;

        if (root.isLeaf) {
            return root.items[idx].ptr;
        }
        
        let currentIdx = idx;
        for (const item of root.items) {
            if (currentIdx < item.count) {
                const childPtr = SmartPointer.decode(item.ptr);
                const subEngine = new SequenceEngine(this.allocator, childPtr);
                return subEngine.getPtr(currentIdx);
            }
            currentIdx -= item.count;
        }
        return null;
    }

    get(idx, ctx) {
        const p = this.getPtr(idx);
        if (!p) return undefined;
        return SmartPointer.resolve(p, this.allocator, ctx);
    }

    *keys() {
        const len = this.length();
        for (let i = 0; i < len; i++) yield i;
    }

    *entries(ctx) {
        const len = this.length();
        for (let i = 0; i < len; i++) {
            yield [i, this.get(i, ctx)];
        }
    }
}

module.exports = SequenceEngine;
