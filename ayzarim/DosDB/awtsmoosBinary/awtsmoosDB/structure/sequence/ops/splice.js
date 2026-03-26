
// B"H
/**
 * @file splice.js
 * @description
 *  The Archangel of the Splice, now imbued with the Wisdom of the Fast-Append.
 *  It recognizes when a "splice" is merely a simple `push` and uses a 
 *  lightning-fast in-place memory copy instead of a full array deconstruction.
 */

const utils = require('./utils.js');
const SpliceInternalOps = require('./spliceInternal.js');
const constants = require('../../../constants.js');
const Logger = require('../../../utils/centralLogger.js');

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

        let root = this.nodeIO.load(this.seq.ptr);
        
        if (!root) {
            if (s === 0 && d === 0 && insertItems.length === 0) return { newPtr: this.seq.ptr };
            this.seq.create();
            root = this.nodeIO.load(this.seq.ptr);
        }

        const res = this._spliceRecursive(root, s, d, insertItems);

        if (res.splitNodes && res.splitNodes.length > 0) {
            utils.handleRootSplit(this.nodeIO, this.seq, root, res.splitNodes);
            return { newPtr: { ...this.seq.ptr, type: constants.TYPE_SEQUENCE } };
        }

        const finalPtr = res.newPtr || this.seq.ptr;
        return { newPtr: { ...finalPtr, type: constants.TYPE_SEQUENCE } };
    }

    _spliceRecursive(node, start, deleteCount, newItems) {
        if (node.isLeaf) {
            return this._spliceLeaf(node, start, deleteCount, newItems);
        }
        return this.internalOps.process(node, start, deleteCount, newItems);
    }

    _spliceLeaf(node, start, deleteCount, newItems) {
        const MAX_LEAF = 200;

        // B"H: THE WISDOM OF THE FAST-APPEND
        // If this is a pure append operation, and there is space, bypass all array logic.
        if (start === node.itemCount && deleteCount === 0) {
            const spaceLeft = MAX_LEAF - node.itemCount;
            if (newItems.length <= spaceLeft) {
                // Append in-place! No JS array reconstruction.
                this._pourIntoLeaf(node, newItems, node.itemCount);
                const newPtr = this.nodeIO.save(node);
                return { newPtr, splitNodes: null };
            }
        }
        
        // Fallback to robust-but-slower method for complex splices and overflows
        const ptrs = [];
        
        for(let i=0; i<node.itemCount; i++) {
            const off = 23 + (i * 16);
            if (off + 16 > node.buffer.length) break;
            const p = Buffer.allocUnsafe(16);
            node.buffer.copy(p, 0, off, off + 16);
            ptrs.push(p);
        }

        ptrs.splice(start, deleteCount, ...newItems);
        
        const splitNodes = [];
        let currentNode = node;
        
        if (ptrs.length > MAX_LEAF) {
             const all = [...ptrs];
             const keep = all.splice(0, MAX_LEAF);
             this._pourIntoLeaf(currentNode, keep);
             const newPtr = this.nodeIO.save(currentNode);
             
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

    /**
     * @method _pourIntoLeaf
     * @description
     *  Breathes an array of pointers into the physical buffer of a leaf node.
     *  Now accepts a startIndex for O(1) appends.
     * 
     * @param {object} leafNode The target vessel.
     * @param {Array<Buffer>} ptrArray The sparks to be inscribed.
     * @param {number} startIndex The unit index to begin writing from.
     */
    _pourIntoLeaf(leafNode, ptrArray, startIndex = 0) {
        const finalItemCount = startIndex + ptrArray.length;
        leafNode.itemCount = finalItemCount;
        leafNode.totalCount = finalItemCount;
        
        if (startIndex === 0) {
            leafNode.totalBytes = 0;
        }

        const req = 23 + (finalItemCount * 16);
        if (!leafNode.buffer || leafNode.buffer.length < req) {
            // This case should be handled by the allocator logic in save(), but as a fallback:
            const oldBuf = leafNode.buffer;
            leafNode.buffer = Buffer.allocUnsafe(req).fill(0);
            if (oldBuf) oldBuf.copy(leafNode.buffer);
        }

        for(let i=0; i<ptrArray.length; i++) {
             ptrArray[i].copy(leafNode.buffer, 23 + ((startIndex + i) * 16));
             leafNode.totalBytes += utils.getPtrSize(ptrArray[i]);
        }
    }
}

module.exports = SpliceOps;
