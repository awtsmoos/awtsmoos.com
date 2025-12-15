// B"H
const Utils = require('./ops_utils.js');

class AppendOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    async append(itemPtr) {
        const root = await this.nodeIO.load(this.seq.ptr);
        const currentTotal = root.totalCount;

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
            if (node.itemCount < 250) {
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
            const entryOffset = Utils.DATA_OFFSET + (lastIdx * Utils.ENTRY_SIZE);
            
            const childPtrBuf = node.buffer.subarray(entryOffset, entryOffset + 16);
            const childPtr = Utils.decodePtr(childPtrBuf);
            
            const childNode = await this.nodeIO.load(childPtr);
            
            const res = await this._appendRecursive(childNode, itemPtr);
            
            node.buffer.writeUInt32BE(childNode.totalCount, entryOffset + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    const newEntryOff = Utils.DATA_OFFSET + (node.itemCount * Utils.ENTRY_SIZE);
                    const snPtr = Utils.encodePtr(res.splitNode.ptr);
                    snPtr.copy(node.buffer, newEntryOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newEntryOff + 16);
                    
                    node.itemCount++;
                    node.totalCount = await this._recalcTotalCount(node);
                    node.totalBytes += res.deltaBytes;
                    
                    await this.nodeIO.save(node);
                    return { deltaCount: res.deltaCount, deltaBytes: res.deltaBytes, splitNode: null };
                } else {
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
                node.totalCount += res.deltaCount;
                node.totalBytes += res.deltaBytes;
                await this.nodeIO.save(node);
                return res;
            }
        }
    }
    
    async _recalcTotalCount(node) {
        if (node.isLeaf) return node.itemCount;
        let sum = 0;
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            sum += node.buffer.readUInt32BE(off + 16);
        }
        return sum;
    }

    async _splitLeafAndInsert(node, itemPtr) {
        const newLeaf = await this.nodeIO.create(true);
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
        const newInternal = await this.nodeIO.create(false);
        
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