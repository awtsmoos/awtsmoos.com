
// B"H
/**
 * @file spliceInternal.js
 * @description Recursive Logic for Internal Node Splicing using exact-object representations.
 */

const utils = require('./utils.js');

class SpliceInternalOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    process(node, start, deleteCount, newItems) {
        let currentOffset = 0;
        const globalDelEnd = start + deleteCount;
        
        let localInsertItems = [...newItems];
        const newChildEntries = [];

        for(let i=0; i<node.items.length; i++) {
            const childRef = node.items[i];
            const count = childRef.count;
            
            const childStart = currentOffset;
            const childEnd = currentOffset + count;
            
            const overlapStart = Math.max(start, childStart);
            const overlapEnd = Math.min(globalDelEnd, childEnd);
            const amountToDelete = Math.max(0, overlapEnd - overlapStart);
            
            let itemsForChild = [];
            if (localInsertItems.length > 0) {
                 if (start >= childStart && start < childEnd) { 
                     itemsForChild = localInsertItems;
                     localInsertItems = [];
                 }
                 if (start >= childStart && start <= childEnd && amountToDelete > 0) {
                     itemsForChild = localInsertItems;
                     localInsertItems = [];
                 }
            }

            if (amountToDelete > 0 || itemsForChild.length > 0) {
                const childPtr = utils.decodePtr(childRef.ptr);
                if (!childPtr) { currentOffset += count; continue; }

                const childNode = this.nodeIO.load(childPtr);
                if (!childNode) { currentOffset += count; continue; }

                const relativeStart = Math.max(0, start - childStart);
                const res = this.seq.ops.spliceOps._spliceRecursive(childNode, relativeStart, amountToDelete, itemsForChild);
                
                if (childNode.totalCount > 0) {
                    newChildEntries.push({
                        ptr: res.newPtr || childNode.ptr,
                        count: childNode.totalCount 
                    });
                }
                
                if (res.splitNodes) {
                    for(const sn of res.splitNodes) {
                        newChildEntries.push({ ptr: sn.ptr, count: sn.totalCount });
                    }
                }
            } else {
                if (count > 0) {
                    newChildEntries.push(childRef);
                }
            }
            
            currentOffset += count;
        }

        if (localInsertItems.length > 0) {
            const newLeaf = this.nodeIO.create(true, node.isWeak);
            const leafRes = this.seq.ops.spliceOps._spliceLeaf(newLeaf, 0, 0, localInsertItems);
            
            if (newLeaf.totalCount > 0) {
                 newChildEntries.push({ ptr: leafRes.newPtr, count: newLeaf.totalCount });
            }
            if (leafRes.splitNodes) {
                 for(const sn of leafRes.splitNodes) {
                      newChildEntries.push({ ptr: sn.ptr, count: sn.totalCount });
                 }
            }
        }
        
        return this._rebuildNode(node, newChildEntries);
    }

    _rebuildNode(node, entries) {
        const MAX_INTERNAL = 200;
        
        if (entries.length > MAX_INTERNAL) {
            const all = [...entries];
            node.items = all.splice(0, MAX_INTERNAL);
            this.seq.ops.spliceOps._recalcNodeStats(node);

            const siblings = [];
            while (all.length > 0) {
                const chunk = all.splice(0, MAX_INTERNAL);
                const sib = this.nodeIO.create(false, node.isWeak);
                sib.items = chunk;
                this.seq.ops.spliceOps._recalcNodeStats(sib);
                
                this.nodeIO.save(sib);
                siblings.push(sib);
            }

            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: siblings };

        } else {
            node.items = entries;
            this.seq.ops.spliceOps._recalcNodeStats(node);
            
            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: null };
        }
    }
}

module.exports = SpliceInternalOps;
