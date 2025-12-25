
// B"H
const Utils = require('./ops_utils.js');

class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    log(msg) {
        if(this.nodeIO.db.debug) console.log(`[AppendOps] ${msg}`);
    }

    async append(itemPtr) {
        // B"H: Force reload from disk to ensure no stale state
        this.nodeIO.allocator.v1.db.structureCache.delete(this.seq.ptr.blockId);
        const root = await this.nodeIO.load(this.seq.ptr);
        
        // B"H: Sanity Check Root - Self Heal before operation
        if (root.isLeaf && root.itemCount > 200) {
             console.error(`B"H CORRUPTION: Root B${root.ptr.blockId} has ${root.itemCount} items (Max 200). Truncating.`);
             root.itemCount = 200; 
             root.totalCount = 200;
             await this.nodeIO.save(root);
        }

        const res = await this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            await Utils.handleRootSplit(this.nodeIO, this.seq, root, [res.splitNode]);
        }
    }

    async _appendRecursive(node, itemPtr) {
        if (node.isLeaf) {
            if (node.itemCount < 200) {
                const offset = Utils.DATA_OFFSET + (node.itemCount * Utils.POINTER_SIZE);
                
                // Panic check for buffer overflow
                if (offset + 16 > node.buffer.length) {
                     throw new Error(`B"H FATAL: Buffer Overflow in Leaf B${node.ptr.blockId} at index ${node.itemCount}`);
                }

                itemPtr.copy(node.buffer, offset);
                
                const addedBytes = Utils.getPtrSize(itemPtr);
                node.itemCount++;
                node.totalCount = node.itemCount; // Strict sync for leaf
                node.totalBytes += addedBytes;
                
                await this.nodeIO.save(node);
                return { deltaCount: 1, deltaBytes: addedBytes, splitNode: null };
            } else {
                return this._splitLeafAndInsert(node, itemPtr);
            }
        } else {
            // Internal Node
            const lastIdx = node.itemCount - 1;
            
            if (lastIdx < 0) {
                 // Empty internal node
                 const newLeaf = await this.nodeIO.create(true, node.isWeak);
                 const leafRes = await this._appendRecursive(newLeaf, itemPtr);
                 
                 const entry = Buffer.alloc(20);
                 Utils.encodePtr(newLeaf.ptr).copy(entry, 0);
                 entry.writeUInt32BE(newLeaf.totalCount, 16);
                 
                 entry.copy(node.buffer, Utils.DATA_OFFSET);
                 node.itemCount = 1;
                 node.totalCount = newLeaf.totalCount;
                 node.totalBytes = newLeaf.totalBytes;
                 
                 await this.nodeIO.save(node);
                 return { deltaCount: 1, deltaBytes: leafRes.deltaBytes, splitNode: null };
            }
            
            const entryOffset = Utils.DATA_OFFSET + (lastIdx * Utils.ENTRY_SIZE);
            const childPtrBuf = node.buffer.subarray(entryOffset, entryOffset + 16);
            const childPtr = Utils.decodePtr(childPtrBuf);
            
            // B"H: Force fresh load of child
            this.nodeIO.allocator.v1.db.structureCache.delete(childPtr.blockId);
            const childNode = await this.nodeIO.load(childPtr);
            
            // Recursive Step
            const res = await this._appendRecursive(childNode, itemPtr);
            
            // B"H: CRITICAL UPDATE - Update the count of the child in the parent's buffer immediately.
            // Verify child count matches what we are writing
            if (childNode.totalCount !== childNode.itemCount && childNode.isLeaf) {
                 // console.error(`B"H ANOMALY: Child B${childNode.ptr.blockId} Leaf mismatch. Total:${childNode.totalCount} Item:${childNode.itemCount}`);
                 childNode.totalCount = childNode.itemCount; // Force fix
            }
            
            node.buffer.writeUInt32BE(childNode.totalCount, entryOffset + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    // Room to add right sibling
                    const newEntryOff = Utils.DATA_OFFSET + (node.itemCount * Utils.ENTRY_SIZE);
                    const snPtr = Utils.encodePtr(res.splitNode.ptr);
                    snPtr.copy(node.buffer, newEntryOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newEntryOff + 16);
                    
                    node.itemCount++;
                    
                    // B"H: RECALCULATE TOTAL FROM SCRATCH to prevent drift
                    node.totalCount = await this._recalcTotalCount(node);
                    node.totalBytes += res.deltaBytes;

                    await this.nodeIO.save(node);
                    return { deltaCount: res.deltaCount, deltaBytes: res.deltaBytes, splitNode: null };
                } else {
                    // Parent full, split parent
                    // Ensure current parent is saved with updated child count first
                    node.totalCount = await this._recalcTotalCount(node);
                    node.totalBytes += res.deltaBytes;
                    await this.nodeIO.save(node); 
                    
                    return this._splitInternalAndInsert(node, res.splitNode);
                }
            } else {
                // No split, just propagate stats
                // B"H: Paranoid Recalc
                node.totalCount = await this._recalcTotalCount(node);
                node.totalBytes += res.deltaBytes;
                
                await this.nodeIO.save(node);
                return res;
            }
        }
    }
    
    async _recalcTotalCount(node) {
        if (node.isLeaf) return node.itemCount;
        let sum = 0;
        let off = Utils.DATA_OFFSET;
        for(let i=0; i<node.itemCount; i++) {
            const c = node.buffer.readUInt32BE(off + 16);
            sum += c;
            off += Utils.ENTRY_SIZE;
        }
        return sum;
    }

    async _splitLeafAndInsert(node, itemPtr) {
        // B"H: Left Node (Original)
        if (node.itemCount > 200) node.itemCount = 200;
        node.totalCount = node.itemCount;
        
        // Update header in buffer immediately
        node.buffer.writeUInt16BE(node.itemCount, 5);
        node.buffer.writeUInt32BE(node.totalCount, 7);

        // Zero out potential garbage
        const endOfData = Utils.DATA_OFFSET + (200 * 16);
        node.buffer.fill(0, endOfData);

        await this.nodeIO.save(node);

        // B"H: Right Node (New)
        const newLeaf = await this.nodeIO.create(true, node.isWeak);
        const offset = Utils.DATA_OFFSET;
        itemPtr.copy(newLeaf.buffer, offset);
        
        const addedBytes = Utils.getPtrSize(itemPtr);
        newLeaf.itemCount = 1;
        newLeaf.totalCount = 1;
        newLeaf.totalBytes = addedBytes;
        
        await this.nodeIO.save(newLeaf);
        
        return { deltaCount: 1, deltaBytes: addedBytes, splitNode: newLeaf };
    }

    async _splitInternalAndInsert(node, siblingNode) {
        const newInternal = await this.nodeIO.create(false, node.isWeak);
        
        // Extract all entries including new sibling
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            const e = Buffer.alloc(20);
            node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        
        const sibEntry = Buffer.alloc(20);
        Utils.encodePtr(siblingNode.ptr).copy(sibEntry, 0);
        sibEntry.writeUInt32BE(siblingNode.totalCount, 16);
        entries.push(sibEntry);
        
        const mid = Math.floor(entries.length / 2);
        const leftEntries = entries.slice(0, mid);
        const rightEntries = entries.slice(mid);
        
        // Update Left
        node.itemCount = leftEntries.length;
        let off = Utils.DATA_OFFSET;
        let leftTotal = 0;
        
        for(const e of leftEntries) {
            e.copy(node.buffer, off);
            off += 20;
            leftTotal += e.readUInt32BE(16);
        }
        node.totalCount = leftTotal;
        node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, leftEntries);
        
        // Clean remaining buffer
        node.buffer.fill(0, off);
        
        await this.nodeIO.save(node);
        
        // Update Right
        newInternal.itemCount = rightEntries.length;
        off = Utils.DATA_OFFSET;
        let rightTotal = 0;
        for(const e of rightEntries) {
            e.copy(newInternal.buffer, off);
            off += 20;
            rightTotal += e.readUInt32BE(16);
        }
        newInternal.totalCount = rightTotal;
        newInternal.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, rightEntries);
        await this.nodeIO.save(newInternal);
        
        return { deltaCount: 0, deltaBytes: 0, splitNode: newInternal };
    }
}
module.exports = AppendOps;
