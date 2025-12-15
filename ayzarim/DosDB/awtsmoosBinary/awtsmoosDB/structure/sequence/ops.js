
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

const DATA_OFFSET = 23;
const ENTRY_SIZE = 20;
const POINTER_SIZE = 16;
const MAX_RECURSION_DEPTH = 50;

class SequenceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    // Invalidate is kept for interface compatibility but does nothing now
    invalidate() {}

    _getPtrSize(ptrBuf) {
        if (ptrBuf.length !== 16) return 0;
        if ((ptrBuf[0] >> 6) === constants.MODE_BLOCK) {
             return ptrBuf.readUInt32BE(6); 
        }
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_STRING) return decoded.payload[0];
             if (decoded.type === constants.TYPE_BOOLEAN) return 1;
             if (decoded.type === constants.TYPE_NUMBER) return 8;
             return decoded.payload.length;
        }
        return 0;
    }

    async append(itemPtr) {
        const root = await this.nodeIO.load(this.seq.ptr);
        const currentTotal = root.totalCount;

        // B"H: Removed "Fast Path" caching because it requires complex parent updates
        // to maintain consistency. The Recursive Append is O(H) (very fast) anyway.
        
        // Edge Case: Root Split needed?
        if (root.itemCount >= 200 && root.isLeaf) {
             return this.splice(currentTotal, 0, [itemPtr]);
        }
        
        const res = await this._appendRecursive(root, itemPtr);
        
        if (res.splitNode) {
            await this._handleRootSplit(root, [res.splitNode]);
        }
    }

    async _appendRecursive(node, itemPtr) {
        if (node.isLeaf) {
            if (node.itemCount < 250) {
                const offset = DATA_OFFSET + (node.itemCount * POINTER_SIZE);
                itemPtr.copy(node.buffer, offset);
                
                const addedBytes = this._getPtrSize(itemPtr);
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
            const entryOffset = DATA_OFFSET + (lastIdx * ENTRY_SIZE);
            
            const childPtrBuf = node.buffer.subarray(entryOffset, entryOffset + 16);
            const childPtr = this._decodePtr(childPtrBuf);
            
            const childNode = await this.nodeIO.load(childPtr);
            
            const res = await this._appendRecursive(childNode, itemPtr);
            
            node.totalCount += res.deltaCount;
            node.totalBytes += res.deltaBytes;
            
            const oldChildTotal = node.buffer.readUInt32BE(entryOffset + 16);
            node.buffer.writeUInt32BE(oldChildTotal + res.deltaCount, entryOffset + 16);
            
            if (res.splitNode) {
                if (node.itemCount < 200) {
                    const newEntryOff = DATA_OFFSET + (node.itemCount * ENTRY_SIZE);
                    const snPtr = this._encodePtr(res.splitNode.ptr);
                    snPtr.copy(node.buffer, newEntryOff);
                    node.buffer.writeUInt32BE(res.splitNode.totalCount, newEntryOff + 16);
                    
                    node.itemCount++;
                    await this.nodeIO.save(node);
                    return { deltaCount: res.deltaCount, deltaBytes: res.deltaBytes, splitNode: null };
                } else {
                    return this._splitInternalAndInsert(node, res.splitNode);
                }
            } else {
                await this.nodeIO.save(node);
                return res;
            }
        }
    }

    async _splitLeafAndInsert(node, itemPtr) {
        const newLeaf = await this.nodeIO.create(true);
        const offset = DATA_OFFSET;
        itemPtr.copy(newLeaf.buffer, offset);
        
        const addedBytes = this._getPtrSize(itemPtr);
        newLeaf.itemCount = 1;
        newLeaf.totalCount = 1;
        newLeaf.totalBytes = addedBytes;
        
        await this.nodeIO.save(newLeaf);
        
        return { deltaCount: 1, deltaBytes: addedBytes, splitNode: newLeaf };
    }

    async _splitInternalAndInsert(node, siblingNode) {
        const newInternal = await this.nodeIO.create(false);
        
        const sibEntry = Buffer.alloc(20);
        this._encodePtr(siblingNode.ptr).copy(sibEntry, 0);
        sibEntry.writeUInt32BE(siblingNode.totalCount, 16);
        
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = DATA_OFFSET + (i * ENTRY_SIZE);
            const e = Buffer.alloc(20);
            node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        entries.push(sibEntry);
        
        const mid = Math.floor(entries.length / 2);
        const rightEntries = entries.slice(mid);
        const leftEntries = entries.slice(0, mid);
        
        node.itemCount = leftEntries.length;
        node.buffer.fill(0, DATA_OFFSET);
        let off = DATA_OFFSET;
        let leftTotal = 0;
        
        for(const e of leftEntries) {
            e.copy(node.buffer, off);
            off += 20;
            leftTotal += e.readUInt32BE(16);
        }
        node.totalCount = leftTotal;
        node.totalBytes = await this._sumChildrenBytes(leftEntries);
        await this.nodeIO.save(node);
        
        newInternal.itemCount = rightEntries.length;
        off = DATA_OFFSET;
        let rightTotal = 0;
        for(const e of rightEntries) {
            e.copy(newInternal.buffer, off);
            off += 20;
            rightTotal += e.readUInt32BE(16);
        }
        newInternal.totalCount = rightTotal;
        newInternal.totalBytes = await this._sumChildrenBytes(rightEntries);
        await this.nodeIO.save(newInternal);
        
        return { deltaCount: siblingNode.totalCount, deltaBytes: siblingNode.totalBytes, splitNode: newInternal };
    }

    async splice(start, deleteCount, newItems) {
        const root = await this.nodeIO.load(this.seq.ptr);
        
        if (root.totalCount === 0 && newItems.length > 0) {
             const res = await this._spliceRecursive(root, 0, 0, newItems);
             if (res.splitNodes && res.splitNodes.length > 0) await this._handleRootSplit(root, res.splitNodes);
             return;
        }
        
        const result = await this._spliceRecursive(root, start, deleteCount, newItems);
        
        if (result.splitNodes && result.splitNodes.length > 0) {
            await this._handleRootSplit(root, result.splitNodes);
        }
    }

    async _spliceRecursive(node, start, deleteCount, newItems) {
        if (node.isLeaf) return this._spliceLeaf(node, start, deleteCount, newItems);
        else return this._spliceInternal(node, start, deleteCount, newItems);
    }

    async _spliceLeaf(node, start, deleteCount, newItems) {
        const ptrs = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = DATA_OFFSET + (i * POINTER_SIZE);
            const p = Buffer.alloc(16);
            node.buffer.copy(p, 0, off, off + 16);
            ptrs.push(p);
        }
        
        const actualStart = Math.min(start, ptrs.length);
        const actualDelete = Math.min(deleteCount, ptrs.length - actualStart);
        
        let deltaBytes = 0;
        for(const item of newItems) deltaBytes += this._getPtrSize(item);
        for(let i=0; i<actualDelete; i++) deltaBytes -= this._getPtrSize(ptrs[actualStart + i]);
        
        const removed = ptrs.splice(actualStart, actualDelete, ...newItems);
        for(const p of removed) await this.seq.allocator.free(p).catch(()=>{});
        
        const deltaCount = newItems.length - actualDelete;
        
        if (ptrs.length <= 250) {
            node.itemCount = ptrs.length;
            node.totalCount = ptrs.length;
            let tb = 0;
            for(const p of ptrs) tb += this._getPtrSize(p);
            node.totalBytes = tb;
            
            node.buffer.fill(0, DATA_OFFSET);
            let off = DATA_OFFSET;
            for(const p of ptrs) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            
            return { deltaCount, deltaBytes, splitNodes: null };
        } else {
            const chunks = [];
            while(ptrs.length > 0) chunks.push(ptrs.splice(0, 250));
            
            const first = chunks[0];
            node.itemCount = first.length;
            node.totalCount = first.length;
            let tb = 0; for(const p of first) tb += this._getPtrSize(p);
            node.totalBytes = tb;
            
            node.buffer.fill(0, DATA_OFFSET);
            let off = DATA_OFFSET;
            for(const p of first) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i];
                const newNode = await this.nodeIO.create(true);
                newNode.itemCount = ch.length;
                newNode.totalCount = ch.length;
                let ntb = 0; for(const p of ch) ntb += this._getPtrSize(p);
                newNode.totalBytes = ntb;
                
                let noff = DATA_OFFSET;
                for(const p of ch) { p.copy(newNode.buffer, noff); noff += 16; }
                await this.nodeIO.save(newNode);
                splitNodes.push(newNode);
            }
            
            return { deltaCount, deltaBytes, splitNodes };
        }
    }

    async _spliceInternal(node, start, deleteCount, newItems) {
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = DATA_OFFSET + (i * ENTRY_SIZE);
            const e = Buffer.alloc(20);
            node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        
        let currentOffset = 0;
        let deleteRemaining = deleteCount;
        let insertItems = newItems;
        let accDeltaCount = 0;
        let accDeltaBytes = 0;
        
        const newEntryList = [];
        
        for(const entry of entries) {
            const childCount = entry.readUInt32BE(16);
            const childStart = currentOffset;
            const childEnd = currentOffset + childCount;
            
            const insertHere = (insertItems.length > 0) && (start >= childStart && start <= childEnd);
            const deleteHere = (deleteRemaining > 0) && (Math.max(start, childStart) < Math.min(start + deleteCount, childEnd));
            
            if (insertHere || deleteHere) {
                const localStart = Math.max(0, start - childStart);
                const deleteRangeEnd = start + deleteCount;
                const localDeleteEnd = Math.min(childEnd, deleteRangeEnd);
                const localDeleteStart = Math.max(childStart, start);
                const localDelete = Math.max(0, localDeleteEnd - localDeleteStart);
                
                let localInsert = [];
                if (insertHere) {
                    localInsert = insertItems;
                    insertItems = []; 
                }
                
                const childPtrBuf = entry.subarray(0, 16);
                const childPtr = this._decodePtr(childPtrBuf);
                const childNode = await this.nodeIO.load(childPtr);
                
                const res = await this._spliceRecursive(childNode, localStart, localDelete, localInsert);
                
                accDeltaCount += res.deltaCount;
                accDeltaBytes += res.deltaBytes;
                deleteRemaining -= localDelete;
                
                if (childNode.totalCount > 0) {
                    entry.writeUInt32BE(childNode.totalCount, 16);
                    newEntryList.push(entry);
                    
                    if (res.splitNodes) {
                        for(const sn of res.splitNodes) {
                            const ne = Buffer.alloc(20);
                            this._encodePtr(sn.ptr).copy(ne, 0);
                            ne.writeUInt32BE(sn.totalCount, 16);
                            newEntryList.push(ne);
                        }
                    }
                } else {
                    await this.seq.allocator.v1.free(childNode.ptr);
                }
            } else {
                newEntryList.push(entry);
            }
            
            currentOffset += childCount;
        }
        
        if (insertItems.length > 0) {
            if (newEntryList.length > 0) {
                const lastEntry = newEntryList[newEntryList.length - 1];
                const childPtr = this._decodePtr(lastEntry.subarray(0, 16));
                const childNode = await this.nodeIO.load(childPtr);
                
                const res = await this._spliceRecursive(childNode, childNode.totalCount, 0, insertItems);
                
                accDeltaCount += res.deltaCount;
                accDeltaBytes += res.deltaBytes;
                
                lastEntry.writeUInt32BE(childNode.totalCount, 16);
                
                if (res.splitNodes) {
                    for(const sn of res.splitNodes) {
                        const ne = Buffer.alloc(20);
                        this._encodePtr(sn.ptr).copy(ne, 0);
                        ne.writeUInt32BE(sn.totalCount, 16);
                        newEntryList.push(ne);
                    }
                }
            } else {
                const newLeaf = await this.nodeIO.create(true);
                const res = await this._spliceLeaf(newLeaf, 0, 0, insertItems);
                accDeltaCount += res.deltaCount;
                accDeltaBytes += res.deltaBytes;
                
                const ne = Buffer.alloc(20);
                this._encodePtr(newLeaf.ptr).copy(ne, 0);
                ne.writeUInt32BE(newLeaf.totalCount, 16);
                newEntryList.push(ne);
                
                if (res.splitNodes) {
                     for(const sn of res.splitNodes) {
                        const sne = Buffer.alloc(20);
                        this._encodePtr(sn.ptr).copy(sne, 0);
                        sne.writeUInt32BE(sn.totalCount, 16);
                        newEntryList.push(sne);
                    }
                }
            }
        }
        
        node.totalCount += accDeltaCount;
        node.totalBytes += accDeltaBytes;
        
        if (newEntryList.length <= 200) {
            node.itemCount = newEntryList.length;
            node.buffer.fill(0, DATA_OFFSET);
            let off = DATA_OFFSET;
            for(const e of newEntryList) { e.copy(node.buffer, off); off+=20; }
            await this.nodeIO.save(node);
            return { deltaCount: accDeltaCount, deltaBytes: accDeltaBytes, splitNodes: null };
        } else {
            const chunks = [];
            while(newEntryList.length > 0) chunks.push(newEntryList.splice(0, 200));
            
            const first = chunks[0];
            node.itemCount = first.length;
            node.buffer.fill(0, DATA_OFFSET);
            let off = DATA_OFFSET;
            let nc = 0;
            for(const e of first) { e.copy(node.buffer, off); off+=20; nc += e.readUInt32BE(16); }
            node.totalCount = nc;
            node.totalBytes = await this._sumChildrenBytes(first);
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i];
                const nn = await this.nodeIO.create(false);
                nn.itemCount = ch.length;
                let noff = DATA_OFFSET;
                let nnc = 0;
                for(const e of ch) { e.copy(nn.buffer, noff); noff+=20; nnc += e.readUInt32BE(16); }
                nn.totalCount = nnc;
                nn.totalBytes = await this._sumChildrenBytes(ch);
                await this.nodeIO.save(nn);
                splitNodes.push(nn);
            }
            
            return { deltaCount: accDeltaCount, deltaBytes: accDeltaBytes, splitNodes };
        }
    }
    
    async _handleRootSplit(root, splitNodes) {
        const newRoot = await this.nodeIO.create(false);
        const entries = [];
        
        const leftEntry = Buffer.alloc(20);
        this._encodePtr(root.ptr).copy(leftEntry, 0);
        leftEntry.writeUInt32BE(root.totalCount, 16);
        entries.push(leftEntry);
        
        for(const sn of splitNodes) {
            const e = Buffer.alloc(20);
            this._encodePtr(sn.ptr).copy(e, 0);
            e.writeUInt32BE(sn.totalCount, 16);
            entries.push(e);
        }
        
        newRoot.itemCount = entries.length;
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        let off = DATA_OFFSET;
        for(const e of entries) {
            const c = e.readUInt32BE(16);
            newRoot.totalCount += c;
            e.copy(newRoot.buffer, off);
            off += 20;
        }
        newRoot.totalBytes = await this._sumChildrenBytes(entries);
        await this.nodeIO.save(newRoot);
        this.seq.ptr = newRoot.ptr;
    }

    async _sumChildrenBytes(entries) {
        let sum = 0;
        for(const e of entries) {
            const ptr = this._decodePtr(e.subarray(0, 16));
            const node = await this.nodeIO.load(ptr);
            sum += node.totalBytes;
        }
        return sum;
    }

    _decodePtr(buf) {
        return {
            blockId: readPointer48(buf, 1),
            length: buf.readUInt32BE(7),
            offset: buf.readUInt32BE(11),
            isChain: (buf[15] & 1) === 1
        };
    }
    
    _encodePtr(ptr) {
        return SmartPointer.block(constants.TYPE_SEQUENCE, ptr.blockId, ptr.length, ptr.isChain, ptr.offset);
    }
    
    async replace(index, newItem, options) {
        await this.splice(index, 1, [newItem]);
    }
}
module.exports = SequenceOps;
