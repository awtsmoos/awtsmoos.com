
// B"H
/**
 * @file splice.js
 * @description
 *  =============================================================================
 *  CHAPTER 8: THE ARCHANGEL OF THE SPLICE (NO BYTE-MATH REQUIRED)
 *  =============================================================================
 *  By elevating `SequenceNode` to parse directly into a JavaScript array of 
 *  `node.items`, the Splice Archangel no longer performs dangerous byte 
 *  arithmetic. It simply uses standard array manipulation, leaving the 
 *  serialization complexity purely to the Scribe (`SequenceNode.save`).
 */

const utils = require('./utils.js');
const SpliceInternalOps = require('./spliceInternal.js');
const constants = require('../../../constants.js');

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
            root = this.nodeIO.create(true);
            this.seq.ptr = this.nodeIO.save(root);
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

        // Directly manipulate the items array! No byte arithmetic!
        const itemsToInsert = newItems.map(p => ({ ptr: p, count: 1 }));
        node.items.splice(start, deleteCount, ...itemsToInsert);
        
        const splitNodes = [];
        let currentNode = node;
        
        if (currentNode.items.length > MAX_LEAF) {
             const all = [...currentNode.items];
             currentNode.items = all.splice(0, MAX_LEAF);
             this._recalcNodeStats(currentNode);
             const newPtr = this.nodeIO.save(currentNode);
             
             while(all.length > 0) {
                 const chunk = all.splice(0, MAX_LEAF);
                 const nextNode = this.nodeIO.create(true, currentNode.isWeak);
                 nextNode.items = chunk;
                 this._recalcNodeStats(nextNode);
                 this.nodeIO.save(nextNode);
                 splitNodes.push(nextNode);
             }
             return { newPtr, splitNodes };
             
        } else {
             this._recalcNodeStats(currentNode);
             const newPtr = this.nodeIO.save(currentNode);
             return { newPtr, splitNodes: null };
        }
    }

    _recalcNodeStats(node) {
        node.totalCount = 0;
        node.totalBytes = 0;
        for (const item of node.items) {
            node.totalCount += item.count;
            node.totalBytes += utils.getPtrSize(item.ptr);
        }
    }
}

module.exports = SpliceOps;
