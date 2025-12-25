
// B"H
const Utils = require('./ops_utils.js');

class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    /**
     * @description The Divine Append Operation.
     * Adds a spark (pointer) to the end of the vessel.
     */
    async append(itemPtr) {
        const cacheKey = this.seq.ptr.blockId + ':' + (this.seq.ptr.offset || 0);
        this.nodeIO.allocator.v1.db.structureCache.delete(cacheKey);
        
        const root = await this.nodeIO.load(this.seq.ptr);
        const res = await this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            // Root has split. A new level of the hierarchy manifests.
            await Utils.handleRootSplit(this.nodeIO, this.seq, root, [res.splitNode]);
        }
    }

    /**
     * @description Descends the fractal tree to find the rightmost dwelling.
     */
    async _appendRecursive(node, itemPtr) {
        if (node.isLeaf) {
            if (node.itemCount < 200) {
                // The leaf has room for more light.
                const offset = Utils.DATA_OFFSET + (node.itemCount * Utils.POINTER_SIZE);
                itemPtr.copy(node.buffer, offset);
                const addedBytes = Utils.getPtrSize(itemPtr);
                node.itemCount++;
                node.totalCount = node.itemCount; 
                node.totalBytes += addedBytes;
                await this.nodeIO.save(node);
                return { deltaCount: 1, deltaBytes: addedBytes, splitNode: null };
            } else {
                // The leaf is full. It must divide to grow.
                return await this._splitLeafAndInsert(node, itemPtr);
            }
        } else {
            // Internal node. Navigate to the last child.
            const lastIdx = node.itemCount - 1;
            const entryOffset = Utils.DATA_OFFSET + (lastIdx * Utils.ENTRY_SIZE);
            const childPtrBuf = node.buffer.subarray(entryOffset, entryOffset + 16);
            const childPtr = Utils.decodePtr(childPtrBuf);
            
            // Ensure no stale visions in the cache.
            const childKey = childPtr.blockId + ':' + (childPtr.offset || 0);
            this.nodeIO.allocator.v1.db.structureCache.delete(childKey);
            const childNode = await this.nodeIO.load(childPtr);
            
            const res = await this._appendRecursive(childNode, itemPtr);
            
            // Update child stats in the current node's buffer immediately.
            node.buffer.writeUInt32BE(childNode.totalCount, entryOffset + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    // Room for the new sibling in the current vessel.
                    const newEntryOff = Utils.DATA_OFFSET + (node.itemCount * Utils.ENTRY_SIZE);
                    const snPtr = Utils.encodePtr(res.splitNode.ptr);
                    snPtr.copy(node.buffer, newEntryOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newEntryOff + 16);
                    node.itemCount++;
                    node.totalCount = this._recalcTotalCountSync(node);
                    node.totalBytes += res.deltaBytes;
                    await this.nodeIO.save(node);
                    return { deltaCount: res.deltaCount, deltaBytes: res.deltaBytes, splitNode: null };
                } else {
                    // Internal node overflow. Division is necessary.
                    node.totalCount = this._recalcTotalCountSync(node);
                    node.totalBytes += res.deltaBytes;
                    const resSplit = await this._splitInternalAndInsert(node, res.splitNode);
                    return { ...resSplit, deltaCount: res.deltaCount, deltaBytes: res.deltaBytes };
                }
            } else {
                // Bubbling up the changes without a split.
                node.totalCount = this._recalcTotalCountSync(node);
                node.totalBytes += res.deltaBytes;
                await this.nodeIO.save(node);
                return res;
            }
        }
    }
    
    /**
     * @description Sums the total counts of all children.
     */
    _recalcTotalCountSync(node) {
        if (node.isLeaf) return node.itemCount;
        let sum = 0;
        let off = Utils.DATA_OFFSET;
        for(let i=0; i<node.itemCount; i++) {
            sum += node.buffer.readUInt32BE(off + 16);
            off += Utils.ENTRY_SIZE;
        }
        return sum;
    }

    /**
     * @description Splits a full leaf, birthing a new node for the overflow.
     */
    async _splitLeafAndInsert(node, itemPtr) {
        // Save the original leaf first to ensure its current state is on disk.
        await this.nodeIO.save(node);

        const newLeaf = await this.nodeIO.create(true, node.isWeak);
        itemPtr.copy(newLeaf.buffer, Utils.DATA_OFFSET);
        const addedBytes = Utils.getPtrSize(itemPtr);
        newLeaf.itemCount = 1; 
        newLeaf.totalCount = 1; 
        newLeaf.totalBytes = addedBytes;
        await this.nodeIO.save(newLeaf);
        
        return { deltaCount: 1, deltaBytes: addedBytes, splitNode: newLeaf };
    }

    /**
     * @description Splits a full internal node into two balanced vessels.
     */
    async _splitInternalAndInsert(node, siblingNode) {
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            const e = Buffer.alloc(Utils.ENTRY_SIZE);
            node.buffer.copy(e, 0, off, off + Utils.ENTRY_SIZE);
            entries.push(e);
        }
        
        // Add the new child entry to the pool.
        const newEntry = Buffer.alloc(Utils.ENTRY_SIZE);
        Utils.encodePtr(siblingNode.ptr).copy(newEntry, 0);
        newEntry.writeUInt32BE(siblingNode.totalCount, 16);
        entries.push(newEntry);
        
        const mid = Math.floor(entries.length / 2);
        const leftEntries = entries.slice(0, mid);
        const rightEntries = entries.slice(mid);
        
        // Update the current node as the Left vessel.
        node.itemCount = leftEntries.length;
        node.buffer.fill(0, Utils.DATA_OFFSET);
        let loff = Utils.DATA_OFFSET;
        for(const e of leftEntries) { e.copy(node.buffer, loff); loff += Utils.ENTRY_SIZE; }
        node.totalCount = leftEntries.reduce((acc, e) => acc + e.readUInt32BE(16), 0);
        node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, leftEntries);
        await this.nodeIO.save(node);
        
        // Create a new node as the Right vessel.
        const newInternal = await this.nodeIO.create(false, node.isWeak);
        newInternal.itemCount = rightEntries.length;
        let roff = Utils.DATA_OFFSET;
        for(const e of rightEntries) { e.copy(newInternal.buffer, roff); roff += Utils.ENTRY_SIZE; }
        newInternal.totalCount = rightEntries.reduce((acc, e) => acc + e.readUInt32BE(16), 0);
        newInternal.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, rightEntries);
        await this.nodeIO.save(newInternal);
        
        return { splitNode: newInternal };
    }
}

module.exports = AppendOps;
