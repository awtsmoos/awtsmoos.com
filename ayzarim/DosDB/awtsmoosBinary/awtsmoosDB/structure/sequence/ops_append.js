
// B"H
const Utils = require('./ops_utils.js');

class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    async append(itemPtr) {
        // B"H: Force fresh load of root to avoid stale cache in high concurrency
        this.nodeIO.allocator.v1.db.structureCache.delete(this.seq.ptr.blockId);
        const root = await this.nodeIO.load(this.seq.ptr);
        const currentTotal = root.totalCount;

        // B"H: Reduced threshold to 200 to be safe and consistent with SpliceOps logic.
        if (root.itemCount >= 200 && root.isLeaf) {
             return this.seq.ops.splice(currentTotal, 0, [itemPtr]);
        }
        
        const res = await this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            await Utils.handleRootSplit(this.nodeIO, this.seq, root, [res.splitNode]);
        }
    }

    async _appendRecursive(node, itemPtr) {
        if (node.isLeaf) {
            // B"H: Strict check against 200 to trigger split earlier
            if (node.itemCount < 200) {
                const offset = Utils.DATA_OFFSET + (node.itemCount * Utils.POINTER_SIZE);
                itemPtr.copy(node.buffer, offset);
                
                const addedBytes = Utils.getPtrSize(itemPtr);
                node.itemCount++;
                node.totalCount++;
                node.totalBytes += addedBytes;
                
                await this.nodeIO.save(node);
                return { deltaCount: 1, deltaBytes: addedBytes, splitNode: null };
            } else {
                return this._splitLeafAndInsert(node, itemPtr);
            }
        } else {
            const lastIdx = node.itemCount - 1;
            if (lastIdx < 0) throw new Error(`B"H: Internal Node ${node.ptr.blockId} has 0 items but is not leaf.`);
            
            const entryOffset = Utils.DATA_OFFSET + (lastIdx * Utils.ENTRY_SIZE);
            
            const childPtrBuf = node.buffer.subarray(entryOffset, entryOffset + 16);
            const childPtr = Utils.decodePtr(childPtrBuf);
            
            // B"H: Force cache invalidation for the child to ensure we get fresh state (e.g. from previous splices)
            this.nodeIO.allocator.v1.db.structureCache.delete(childPtr.blockId);
            const childNode = await this.nodeIO.load(childPtr);
            
            const res = await this._appendRecursive(childNode, itemPtr);
            
            // B"H: Update parent's view of child's count immediately
            // We use the childNode.totalCount which reflects the update from recursion
            node.buffer.writeUInt32BE(childNode.totalCount, entryOffset + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    const newEntryOff = Utils.DATA_OFFSET + (node.itemCount * Utils.ENTRY_SIZE);
                    const snPtr = Utils.encodePtr(res.splitNode.ptr);
                    snPtr.copy(node.buffer, newEntryOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newEntryOff + 16);
                    
                    node.itemCount++;
                    // B"H: Recalculate total from buffer to ensure consistency
                    node.totalCount = await this._recalcTotalCount(node);
                    node.totalBytes += res.deltaBytes;
                    
                    await this.nodeIO.save(node);
                    return { deltaCount: res.deltaCount, deltaBytes: res.deltaBytes, splitNode: null };
                } else {
                    // Update current node totals before splitting
                    node.totalCount = await this._recalcTotalCount(node);
                    node.totalBytes += res.deltaBytes;
                    
                    const splitRes = await this._splitInternalAndInsert(node, res.splitNode);
                    return { 
                        deltaCount: res.deltaCount, 
                        deltaBytes: res.deltaBytes, 
                        splitNode: splitRes.splitNode 
                    };
                }
            } else {
                // B"H: Recalculate totalCount strictly from buffer entries
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
        // B"H: Create new leaf for the overflow item
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
        
        const sibEntry = Buffer.alloc(20);
        Utils.encodePtr(siblingNode.ptr).copy(sibEntry, 0);
        sibEntry.writeUInt32BE(siblingNode.totalCount, 16);
        
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            const e = Buffer.alloc(20);
            node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        entries.push(sibEntry);
        
        const mid = Math.floor(entries.length / 2);
        const rightEntries = entries.slice(mid);
        const leftEntries = entries.slice(0, mid);
        
        node.itemCount = leftEntries.length;
        node.buffer.fill(0, Utils.DATA_OFFSET);
        let off = Utils.DATA_OFFSET;
        let leftTotal = 0;
        
        for(const e of leftEntries) {
            e.copy(node.buffer, off);
            off += 20;
            leftTotal += e.readUInt32BE(16);
        }
        node.totalCount = leftTotal;
        node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, leftEntries);
        await this.nodeIO.save(node);
        
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
        
        return { deltaCount: siblingNode.totalCount, deltaBytes: siblingNode.totalBytes, splitNode: newInternal };
    }
}
module.exports = AppendOps;
