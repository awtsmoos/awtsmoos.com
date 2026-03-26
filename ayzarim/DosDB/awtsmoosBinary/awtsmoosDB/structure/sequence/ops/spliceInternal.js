
// B"H
/**
 * @file spliceInternal.js
 * @description Recursive Logic for Internal Node Splicing.
 */

const utils = require('./utils.js');
const Logger = require('../../../utils/centralLogger.js');

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
                const childPtr = utils.decodePtr(childPtrRaw);
                if (!childPtr) { currentOffset += count; continue; }

                const childNode = this.nodeIO.load(childPtr);
                if (!childNode) {
                    currentOffset += count;
                    continue; 
                }

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
                    newChildEntries.push({ ptr: childPtrRaw, count });
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
        if (entries.length === 0) {
            node.itemCount = 0;
            node.totalCount = 0;
            const ptr = this.nodeIO.save(node);
            return { newPtr: ptr, splitNodes: null };
        }

        const MAX_INTERNAL = 200;

        if (entries.length > MAX_INTERNAL) {
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

            if (pb.length !== 16) {
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
