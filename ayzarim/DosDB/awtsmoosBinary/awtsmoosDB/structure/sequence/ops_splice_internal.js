// B"H
/**
 * @file ops_splice_internal.js
 * @description 
 *  Recursive Logic for Internal Node Splicing.
 */

const utils = require('./ops_utils.js');
const Logger = require('../../utils/centralLogger.js');

class SpliceInternalOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    process(node, start, deleteCount, newItems) {
        let currentOffset = 0;
        // B"H: globalDelEnd defines the ABSOLUTE stop index relative to THIS node's start.
        const globalDelEnd = start + deleteCount;
        
        let localInsertItems = [...newItems];
        const newChildEntries = [];

        // Logger.log("[SPLICE_INT]", `Processing Node. Children: ${node.itemCount}, DelRange: [${start}-${globalDelEnd}]`);

        for(let i=0; i<node.itemCount; i++) {
            const entryOff = 23 + (i * 20);
            
            if (entryOff + 20 > node.buffer.length) {
                Logger.log("[SPLICE_INT]", "Corruption: Boundary overrun.");
                break;
            }

            const childPtrRaw = Buffer.allocUnsafe(16);
            node.buffer.copy(childPtrRaw, 0, entryOff, entryOff + 16);
            const count = node.buffer.readUInt32BE(entryOff + 16);
            
            const childStart = currentOffset;
            const childEnd = currentOffset + count;
            
            // Intersection: Does deletion hit this child?
            const overlapStart = Math.max(start, childStart);
            const overlapEnd = Math.min(globalDelEnd, childEnd);
            const amountToDelete = Math.max(0, overlapEnd - overlapStart);
            
            // Intersection: Do insertions go here?
            let itemsForChild = [];
            // "Catch" the insertion items if this is the start site.
            // Edge Case: If we are at the very end of list, the logic below (start <= childEnd) catches it on last child? 
            // Tail append is handled after loop.
            if (localInsertItems.length > 0) {
                 if (start >= childStart && start < childEnd) { // Normal insertion
                     itemsForChild = localInsertItems;
                     localInsertItems = [];
                 } else if (start === childEnd && i === node.itemCount - 1 && amountToDelete === 0) { 
                     // Insert at end of LAST child explicitly if no delete spanning?
                     // Let tail logic handle true appends, but "end of current block" logic is nuanced.
                     // We let "Tail Append" after loop handle pure appends if possible, unless overlap forces processing.
                 }
                 // If deletion causes merge, items go to the delete site.
                 if (start >= childStart && start <= childEnd && amountToDelete > 0) {
                     itemsForChild = localInsertItems;
                     localInsertItems = [];
                 }
            }

            if (amountToDelete > 0 || itemsForChild.length > 0) {
                // Logger.log("[SPLICE_INT]", `Recursing Child ${i} (${count}). Deleting ${amountToDelete}. Ins ${itemsForChild.length}`);
                const childPtr = utils.decodePtr(childPtrRaw);
                if (!childPtr) { currentOffset += count; continue; }

                const childNode = this.nodeIO.load(childPtr);
                if (!childNode) {
                    Logger.log("[SPLICE_INT]", "Ghost child detected.");
                    currentOffset += count;
                    continue; 
                }

                // Relative 0-based index for the child
                const relativeStart = Math.max(0, start - childStart);

                const res = this.seq.ops.spliceOps._spliceRecursive(childNode, relativeStart, amountToDelete, itemsForChild);
                
                // IMPORTANT: The recursion modifies childNode IN-PLACE (memory object updated).
                // Use updated totalCount. 
                // However, res.newPtr might point to a DIFFERENT block location if save() reallocated.
                
                if (childNode.totalCount > 0) {
                    // Logger.log("[SPLICE_INT]", `  > Child maintained. New Count: ${childNode.totalCount}`);
                    newChildEntries.push({
                        ptr: res.newPtr || childNode.ptr,
                        count: childNode.totalCount 
                    });
                } else {
                    // Logger.log("[SPLICE_INT]", `  > Child became empty.`);
                }
                
                if (res.splitNodes) {
                    for(const sn of res.splitNodes) {
                        // Logger.log("[SPLICE_INT]", `  > Sibling birthed. Count: ${sn.totalCount}`);
                        newChildEntries.push({ ptr: sn.ptr, count: sn.totalCount });
                    }
                }
            } else {
                // Preservation Logic
                // If overlap failed, preserve strict copy.
                if (count > 0) {
                    // Logger.log("[SPLICE_INT]", `  > Preserving child ${i} (Count: ${count})`);
                    newChildEntries.push({ ptr: childPtrRaw, count });
                }
            }
            
            currentOffset += count;
        }

        // Tail logic
        if (localInsertItems.length > 0) {
            // If the start is exactly at the end, append via a new node to be safe, 
            // then _rebuildNode will optimize.
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
        if (entries.length === 0) {
            node.itemCount = 0;
            node.totalCount = 0;
            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: null };
        }

        const MAX_INTERNAL = 200;

        if (entries.length > MAX_INTERNAL) {
            // Split Logic
            const all = [...entries];
            const keep = all.splice(0, MAX_INTERNAL);

            const built = this._buildBuf(keep);
            node.buffer = built.buf;
            node.itemCount = built.count;
            node.totalCount = built.total;

            const siblings = [];
            while (all.length > 0) {
                const chunk = all.splice(0, MAX_INTERNAL);
                const info = this._buildBuf(chunk);
                const sib = this.nodeIO.create(false, node.isWeak);
                sib.buffer = info.buf;
                sib.itemCount = info.count;
                sib.totalCount = info.total;
                
                this.nodeIO.save(sib);
                siblings.push(sib);
            }

            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: siblings };

        } else {
            const built = this._buildBuf(entries);
            node.buffer = built.buf;
            node.itemCount = built.count;
            node.totalCount = built.total;
            
            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: null };
        }
    }

    _buildBuf(entries) {
        const count = entries.length;
        const size = 23 + (count * 20);
        const buf = Buffer.allocUnsafe(size).fill(0);
        
        let total = 0;
        let off = 23;
        
        for (const e of entries) {
            let pb;
            if (Buffer.isBuffer(e.ptr)) pb = e.ptr;
            else if (e.ptr && typeof e.ptr === 'object') pb = utils.encodePtr(e.ptr);
            else pb = Buffer.alloc(16);

            // Sanity clamp
            if (pb.length !== 16) {
                // Try force encoding if something weird happened
                try { pb = utils.encodePtr(e.ptr); } catch(ex) { pb = Buffer.alloc(16); }
            }

            pb.copy(buf, off);
            buf.writeUInt32BE(e.count, off + 16);
            total += e.count;
            off += 20;
        }
        
        return { buf, count, total };
    }
}

module.exports = SpliceInternalOps;