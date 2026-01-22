// B"H
const utils = require('./ops_utils.js');
const SpliceInternalOps = require('./ops_splice_internal.js');
const Logger = require('../../utils/centralLogger.js');

class SpliceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.internalOps = new SpliceInternalOps(sequence);
    }

    splice(start, deleteCount, newItems) {
        const len = this.seq.length();
        let s = start;
        if (s < 0) s = Math.max(0, len + s);
        if (s > len) s = len;
        
        const d = Math.max(0, Math.min(deleteCount, len - s));
        const insertItems = Array.isArray(newItems) ? newItems : [];

        // Logger.log("[SPLICE]", `Request: s=${s} d=${d} len=${len} new=${insertItems.length}`);

        const root = this.nodeIO.load(this.seq.ptr);
        
        if (!root) {
            // Lazy Creation logic
            if (s === 0 && d === 0 && insertItems.length === 0) return { newPtr: this.seq.ptr };
            this.seq.create();
            const newRoot = this.nodeIO.load(this.seq.ptr);
            const res = this._spliceRecursive(newRoot, s, d, insertItems);
            return { newPtr: res.newPtr || this.seq.ptr };
        }

        const res = this._spliceRecursive(root, s, d, insertItems);

        if (res.splitNodes && res.splitNodes.length > 0) {
            utils.handleRootSplit(this.nodeIO, this.seq, root, res.splitNodes);
            return { newPtr: this.seq.ptr };
        }

        return { newPtr: res.newPtr || this.seq.ptr };
    }

    _spliceRecursive(node, start, deleteCount, newItems) {
        if (node.isLeaf) {
            return this._spliceLeaf(node, start, deleteCount, newItems);
        }
        return this.internalOps.process(node, start, deleteCount, newItems);
    }

    _spliceLeaf(node, start, deleteCount, newItems) {
        const ptrs = [];
        
        // Extract existing
        for(let i=0; i<node.itemCount; i++) {
            const off = 23 + (i * 16);
            if (off + 16 > node.buffer.length) break;
            const p = Buffer.allocUnsafe(16);
            node.buffer.copy(p, 0, off, off + 16);
            ptrs.push(p);
        }

        // Apply mutation
        ptrs.splice(start, deleteCount, ...newItems);
        
        const MAX_LEAF = 200;
        const splitNodes = [];
        let currentNode = node;
        
        // Handle Leaf Split
        if (ptrs.length > MAX_LEAF) {
             const all = [...ptrs];
             
             // Current node keeps first chunk
             const keep = all.splice(0, MAX_LEAF);
             this._pourIntoLeaf(currentNode, keep);
             // Must return pointer updated if location changed
             const newPtr = this.nodeIO.save(currentNode);
             
             // Remainder
             while(all.length > 0) {
                 const chunk = all.splice(0, MAX_LEAF);
                 const nextNode = this.nodeIO.create(true, currentNode.isWeak);
                 this._pourIntoLeaf(nextNode, chunk);
                 this.nodeIO.save(nextNode);
                 splitNodes.push(nextNode);
             }
             return { newPtr, splitNodes };
             
        } else {
             this._pourIntoLeaf(currentNode, ptrs);
             const newPtr = this.nodeIO.save(currentNode);
             return { newPtr, splitNodes: null };
        }
    }

    _pourIntoLeaf(leafNode, ptrArray) {
        leafNode.itemCount = ptrArray.length;
        leafNode.totalCount = ptrArray.length;
        leafNode.totalBytes = 0;

        const req = 23 + (ptrArray.length * 16);
        if (!leafNode.buffer || leafNode.buffer.length < req) {
            leafNode.buffer = Buffer.allocUnsafe(req).fill(0);
        }

        for(let i=0; i<ptrArray.length; i++) {
             ptrArray[i].copy(leafNode.buffer, 23 + (i * 16));
             leafNode.totalBytes += utils.getPtrSize(ptrArray[i]);
        }
    }
}

module.exports = SpliceOps;