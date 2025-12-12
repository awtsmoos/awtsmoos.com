
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

const DATA_OFFSET = 23;
const MAX_RECURSION_DEPTH = 50;

class SequenceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    _getPtrSize(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return 0;
        
        if (decoded.mode === constants.MODE_HEAP) return decoded.payload.readUInt32BE(10);
        if (decoded.mode === constants.MODE_BLOCK) return decoded.payload.readUInt32BE(6);
        if (decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_STRING) return decoded.payload[0];
             if (decoded.type === constants.TYPE_BOOLEAN) return 1;
             if (decoded.type === constants.TYPE_NUMBER) return 8;
             if (decoded.type === constants.TYPE_NULL || decoded.type === constants.TYPE_UNDEFINED) return 0;
             return decoded.payload.length;
        }
        return 0; 
    }

    async splice(start, deleteCount, newItems) {
        const root = await this.nodeIO.load(this.seq.ptr);
        
        // Edge Case: Empty Root
        if (root.totalCount === 0 && newItems.length > 0) {
             const res = await this._spliceRecursive(root, 0, 0, newItems, 0);
             if (res.splitNodes && res.splitNodes.length > 0) await this._handleRootSplit(root, res.splitNodes);
             return;
        }
        
        const result = await this._spliceRecursive(root, start, deleteCount, newItems, 0);
        
        if (result.splitNodes && result.splitNodes.length > 0) {
            await this._handleRootSplit(root, result.splitNodes);
        } else {
            // Shrink Height check (Optimization)
            if (!root.isLeaf && root.itemCount === 1) {
                 const childPtrBuf = root.buffer.subarray(DATA_OFFSET, DATA_OFFSET + 16);
                 const decoded = SmartPointer.decode(childPtrBuf);
                 const cBlockId = readPointer48(decoded.payload, 0);
                 const cLen = decoded.payload.readUInt32BE(6);
                 const cOff = decoded.payload.readUInt32BE(10);
                 const cChain = decoded.payload.readUInt8(14) === 1;

                 // Only shrink if we can free the root safely
                 try {
                     await this.seq.allocator.v1.free(root.ptr);
                     this.seq.ptr = { blockId: cBlockId, length: cLen, offset: cOff, isChain: cChain };
                 } catch(e) {
                     // If free fails (e.g. corruption), keep height to be safe
                 }
            }
        }
    }
    
    async replace(index, newItem, options = {}) {
        const root = await this.nodeIO.load(this.seq.ptr);
        await this._replaceRecursive(root, index, newItem, 0, options);
    }

    async _replaceRecursive(node, index, newItem, depth, options) {
        if (depth > MAX_RECURSION_DEPTH) throw new Error("B\"H: Sequence Max Depth Exceeded");
        
        if (node.isLeaf) {
            if (index >= node.itemCount) throw new Error("Index out of bounds in leaf");
            const offset = DATA_OFFSET + (index * 16);
            const oldPtr = node.buffer.subarray(offset, offset + 16);
            
            const oldSize = this._getPtrSize(oldPtr);
            const newSize = this._getPtrSize(newItem);
            
            if (!options.skipFree) {
                try { await this.seq.allocator.free(oldPtr); } catch(e){}
            }
            
            newItem.copy(node.buffer, offset);
            node.totalBytes += (newSize - oldSize);
            
            await this.nodeIO.save(node);
            return (newSize - oldSize);
        } else {
            let currentOffset = 0;
            let found = false;
            let deltaBytes = 0;
            
            for(let i=0; i<node.itemCount; i++) {
                const childCount = node.buffer.readUInt32BE(DATA_OFFSET + (i*20) + 16);
                if (index < currentOffset + childCount) {
                    const childPtrBuf = node.buffer.subarray(DATA_OFFSET + (i*20), DATA_OFFSET + (i*20) + 16);
                    const decoded = SmartPointer.decode(childPtrBuf);
                    const childPtr = {
                        blockId: readPointer48(decoded.payload, 0),
                        length: decoded.payload.readUInt32BE(6),
                        offset: decoded.payload.readUInt32BE(10),
                        isChain: decoded.payload.readUInt8(14) === 1
                    };
                    
                    const child = await this.nodeIO.load(childPtr);
                    deltaBytes = await this._replaceRecursive(child, index - currentOffset, newItem, depth + 1, options);
                    found = true;
                    break;
                }
                currentOffset += childCount;
            }
            
            if (found) {
                node.totalBytes += deltaBytes;
                await this.nodeIO.save(node);
                return deltaBytes;
            } else {
                throw new Error("Index out of bounds in internal node");
            }
        }
    }
    
    async _handleRootSplit(root, splitNodes) {
        const newRoot = await this.nodeIO.create(false);
        const entries = [];
        
        const leftPtr = SmartPointer.block(constants.TYPE_SEQUENCE, root.ptr.blockId, root.ptr.length, root.ptr.isChain, root.ptr.offset);
        const leftEntry = Buffer.alloc(20); 
        leftPtr.copy(leftEntry, 0); 
        leftEntry.writeUInt32BE(root.totalCount, 16);
        entries.push(leftEntry);

        for(const sn of splitNodes) {
            const snPtr = SmartPointer.block(constants.TYPE_SEQUENCE, sn.ptr.blockId, sn.ptr.length, sn.ptr.isChain, sn.ptr.offset);
            const snEntry = Buffer.alloc(20);
            snPtr.copy(snEntry, 0);
            snEntry.writeUInt32BE(sn.totalCount, 16);
            entries.push(snEntry);
        }

        newRoot.itemCount = entries.length;
        newRoot.totalCount = 0;
        newRoot.totalBytes = 0;
        
        let off = DATA_OFFSET;
        for(const e of entries) {
             const count = e.readUInt32BE(16);
             newRoot.totalCount += count;
             e.copy(newRoot.buffer, off);
             off += 20;
        }
        
        newRoot.totalBytes = root.totalBytes; 
        for(const sn of splitNodes) newRoot.totalBytes += sn.totalBytes;

        await this.nodeIO.save(newRoot);
        this.seq.ptr = newRoot.ptr;
    }

    async _spliceRecursive(node, start, deleteCount, newItems, depth) {
        if (depth > MAX_RECURSION_DEPTH) throw new Error("B\"H: Sequence Corruption - Max Depth Exceeded");
        if (node.isLeaf) return this._spliceLeaf(node, start, deleteCount, newItems);
        else return this._spliceInternal(node, start, deleteCount, newItems, depth);
    }

    async _spliceLeaf(node, start, deleteCount, newItems) {
        const pointers = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = DATA_OFFSET + (i * 16);
            const ptrCopy = Buffer.alloc(16);
            node.buffer.copy(ptrCopy, 0, off, off + 16);
            pointers.push(ptrCopy);
        }
        const actualDelete = Math.min(deleteCount, pointers.length - start);
        let deltaBytes = 0;
        for(const p of newItems) deltaBytes += this._getPtrSize(p);
        for(let i=0; i<actualDelete; i++) deltaBytes -= this._getPtrSize(pointers[start+i]);

        const removed = pointers.splice(start, actualDelete, ...newItems);
        if (removed.length > 0) await Promise.all(removed.map(p => this.seq.allocator.free(p).catch(e => {})));

        const deltaCount = newItems.length - actualDelete;
        const MAX_LEAF = 250; 

        const chunks = [];
        if (pointers.length === 0) {
            chunks.push([]);
        } else {
            for (let i = 0; i < pointers.length; i += MAX_LEAF) {
                chunks.push(pointers.slice(i, i + MAX_LEAF));
            }
        }

        const firstChunk = chunks[0];
        node.itemCount = firstChunk.length; 
        node.totalCount = firstChunk.length; 
        node.totalBytes = 0;
        for(const p of firstChunk) node.totalBytes += this._getPtrSize(p);
        
        node.buffer.fill(0, DATA_OFFSET);
        let off = DATA_OFFSET;
        for(const p of firstChunk) { p.copy(node.buffer, off); off += 16; }
        await this.nodeIO.save(node);

        const splitNodes = [];
        for(let i=1; i<chunks.length; i++) {
            const chunk = chunks[i];
            const newNode = await this.nodeIO.create(true);
            newNode.itemCount = chunk.length;
            newNode.totalCount = chunk.length;
            newNode.totalBytes = 0;
            for(const p of chunk) newNode.totalBytes += this._getPtrSize(p);
            
            let noff = DATA_OFFSET;
            for(const p of chunk) { p.copy(newNode.buffer, noff); noff += 16; }
            await this.nodeIO.save(newNode);
            splitNodes.push(newNode);
        }

        return { splitNodes, deltaBytes, deltaCount };
    }

    // B"H: Corrected Multi-Node Splice Logic
    async _spliceInternal(node, start, deleteCount, newItems, depth) {
        const existingEntries = this._readInternalEntries(node); 
        
        let currentOffset = 0;
        let deleteRemaining = deleteCount;
        let itemsToInsert = newItems;
        
        const newEntries = [];
        let accumulatedDeltaBytes = 0;
        let accumulatedDeltaCount = 0;
        
        const deleteRangeEnd = start + deleteCount;

        for (const entry of existingEntries) {
            const childCount = entry.readUInt32BE(16);
            const childStart = currentOffset;
            const childEnd = currentOffset + childCount;
            
            // Does the operation overlap this child?
            // Overlap if: 
            // 1. Delete Range overlaps [childStart, childEnd]
            // 2. Insert point (start) falls within [childStart, childEnd] (inclusive for append logic)
            
            const overlapsDelete = (deleteRemaining > 0) && (Math.max(start, childStart) < Math.min(deleteRangeEnd, childEnd));
            // Insertion logic: insert at 'start'. If start == childEnd, effectively handled by next child unless last.
            const overlapsInsert = (itemsToInsert.length > 0) && (start >= childStart && start <= childEnd);
            
            if (overlapsDelete || overlapsInsert) {
                // Calculate local operation relative to child
                const localStart = Math.max(0, start - currentOffset);
                
                // Calculate delete amount for this child
                // Overlap interval: [max(start, childStart), min(deleteRangeEnd, childEnd)]
                const intervalStart = Math.max(start, childStart);
                const intervalEnd = Math.min(deleteRangeEnd, childEnd);
                const localDelete = Math.max(0, intervalEnd - intervalStart);
                
                // Items are inserted into the FIRST child that covers 'start'.
                // If start < childStart, it means we are inserting before this child? 
                // But we iterate in order. 'start' will be >= childStart unless logic fails.
                // Exception: if start matches childStart, and we haven't inserted yet.
                
                let myItems = [];
                if (itemsToInsert.length > 0 && start >= childStart && start <= childEnd) {
                    // Logic: Splice into this child.
                    // If start == childEnd, we append to this child (handled by _spliceLeaf or recursive).
                    // BUT: Only do this once.
                    myItems = itemsToInsert;
                    itemsToInsert = []; // Consumed
                }
                
                // --- Load Child ---
                const childPtrBuf = entry.subarray(0, 16);
                const decoded = SmartPointer.decode(childPtrBuf);
                const childPtr = {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
                
                const childNode = await this.nodeIO.load(childPtr);
                
                const result = await this._spliceRecursive(childNode, localStart, localDelete, myItems, depth + 1);
                
                deleteRemaining -= localDelete; // Decrease global counter
                accumulatedDeltaBytes += result.deltaBytes;
                accumulatedDeltaCount += result.deltaCount;
                
                // --- Rebuild Entries ---
                if (childNode.totalCount > 0) {
                    const newEntry = Buffer.alloc(20);
                    childPtrBuf.copy(newEntry, 0);
                    newEntry.writeUInt32BE(childNode.totalCount, 16);
                    newEntries.push(newEntry);
                } else {
                    // Child emptied. Free it.
                    await this.seq.allocator.v1.free(childNode.ptr);
                }
                
                // Add any splits
                if (result.splitNodes && result.splitNodes.length > 0) {
                    for(const sn of result.splitNodes) {
                        const ptr = SmartPointer.block(constants.TYPE_SEQUENCE, sn.ptr.blockId, sn.ptr.length, sn.ptr.isChain, sn.ptr.offset);
                        const e = Buffer.alloc(20);
                        ptr.copy(e, 0);
                        e.writeUInt32BE(sn.totalCount, 16);
                        newEntries.push(e);
                    }
                }
                
            } else {
                // No interaction, keep entry
                // BUT: If we deleted nodes before this, its index effectively shifts down.
                // We just push it to the new list.
                newEntries.push(entry);
            }
            
            currentOffset += childCount;
        }
        
        // Edge Case: Appending to empty or end
        if (itemsToInsert.length > 0) {
            if (newEntries.length > 0) {
                // Append to last child
                const lastEntry = newEntries[newEntries.length - 1];
                const childPtrBuf = lastEntry.subarray(0, 16);
                const decoded = SmartPointer.decode(childPtrBuf);
                const childPtr = {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
                
                const childNode = await this.nodeIO.load(childPtr);
                const res = await this._spliceRecursive(childNode, childNode.totalCount, 0, itemsToInsert, depth + 1);
                
                accumulatedDeltaBytes += res.deltaBytes;
                accumulatedDeltaCount += res.deltaCount;
                
                lastEntry.writeUInt32BE(childNode.totalCount, 16);
                
                if (res.splitNodes) {
                    for(const sn of res.splitNodes) {
                        const ptr = SmartPointer.block(constants.TYPE_SEQUENCE, sn.ptr.blockId, sn.ptr.length, sn.ptr.isChain, sn.ptr.offset);
                        const e = Buffer.alloc(20);
                        ptr.copy(e, 0);
                        e.writeUInt32BE(sn.totalCount, 16);
                        newEntries.push(e);
                    }
                }
            } else {
                // Create new leaf
                const newLeaf = await this.nodeIO.create(true);
                const res = await this._spliceLeaf(newLeaf, 0, 0, itemsToInsert);
                
                const ptr = SmartPointer.block(constants.TYPE_SEQUENCE, newLeaf.ptr.blockId, newLeaf.ptr.length, newLeaf.ptr.isChain, newLeaf.ptr.offset);
                const e = Buffer.alloc(20);
                ptr.copy(e, 0);
                e.writeUInt32BE(newLeaf.totalCount, 16);
                newEntries.push(e);
                
                accumulatedDeltaBytes += res.deltaBytes;
                accumulatedDeltaCount += res.deltaCount;
                
                if (res.splitNodes) {
                     for(const sn of res.splitNodes) {
                        const ptr2 = SmartPointer.block(constants.TYPE_SEQUENCE, sn.ptr.blockId, sn.ptr.length, sn.ptr.isChain, sn.ptr.offset);
                        const e2 = Buffer.alloc(20);
                        ptr2.copy(e2, 0);
                        e2.writeUInt32BE(sn.totalCount, 16);
                        newEntries.push(e2);
                    }
                }
            }
        }
        
        node.totalBytes += accumulatedDeltaBytes;
        await this._saveInternalEntries(node, newEntries);
        
        const MAX_INTERNAL = 200;
        if (newEntries.length > MAX_INTERNAL) {
             const splitRes = await this._splitInternalNode(node);
             return { splitNodes: splitRes.splitNodes, deltaBytes: accumulatedDeltaBytes, deltaCount: accumulatedDeltaCount };
        }
        
        return { splitNodes: null, deltaBytes: accumulatedDeltaBytes, deltaCount: accumulatedDeltaCount };
    }
    
    _readInternalEntries(node) {
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const entryCopy = Buffer.alloc(20);
            node.buffer.copy(entryCopy, 0, DATA_OFFSET + (i*20), DATA_OFFSET + (i*20) + 20);
            entries.push(entryCopy);
        }
        return entries;
    }

    async _saveInternalEntries(node, entries) {
        node.itemCount = entries.length; 
        node.buffer.fill(0, DATA_OFFSET);
        let off = DATA_OFFSET; 
        let total = 0;
        for(const e of entries) { 
            e.copy(node.buffer, off); 
            off+=20; 
            total += e.readUInt32BE(16); 
        }
        node.totalCount = total;
        await this.nodeIO.save(node);
    }

    async _insertSplitNodes(node, index, splitNodes) {
        // Kept for compatibility, though not used in new _spliceInternal
        const entries = this._readInternalEntries(node);
        const newEntries = [];
        for(const sn of splitNodes) {
            const ptr = SmartPointer.block(constants.TYPE_SEQUENCE, sn.ptr.blockId, sn.ptr.length, sn.ptr.isChain, sn.ptr.offset);
            const entry = Buffer.alloc(20); 
            ptr.copy(entry, 0); 
            entry.writeUInt32BE(sn.totalCount, 16);
            newEntries.push(entry);
        }
        entries.splice(index, 0, ...newEntries);
        await this._saveInternalEntries(node, entries);
    }

    async _splitInternalNode(node) {
        const entries = this._readInternalEntries(node);
        const MAX_INTERNAL = 200;
        
        const chunks = [];
        for(let i=0; i<entries.length; i += MAX_INTERNAL) {
            chunks.push(entries.slice(i, i + MAX_INTERNAL));
        }

        const firstChunk = chunks[0];
        node.itemCount = firstChunk.length;
        node.totalCount = 0; 
        node.buffer.fill(0, DATA_OFFSET);
        
        let off = DATA_OFFSET;
        for(const e of firstChunk) { 
            node.totalCount += e.readUInt32BE(16); 
            e.copy(node.buffer, off); 
            off+=20; 
        }
        node.totalBytes = await this._sumChildrenBytes(firstChunk);
        await this.nodeIO.save(node);

        const newNodes = [];
        for(let i=1; i<chunks.length; i++) {
            const chunk = chunks[i];
            const newNode = await this.nodeIO.create(false);
            newNode.itemCount = chunk.length; 
            newNode.totalCount = 0;
            
            let noff = DATA_OFFSET;
            for(const e of chunk) {
                newNode.totalCount += e.readUInt32BE(16);
                e.copy(newNode.buffer, noff);
                noff += 20;
            }
            newNode.totalBytes = await this._sumChildrenBytes(chunk);
            await this.nodeIO.save(newNode);
            newNodes.push(newNode);
        }

        return { splitNodes: newNodes };
    }

    async _sumChildrenBytes(entries) {
        let sum = 0;
        for(const e of entries) {
            const ptrBuf = e.subarray(0, 16);
            const decoded = SmartPointer.decode(ptrBuf);
            if(decoded && decoded.mode === constants.MODE_BLOCK) {
                const cBlockId = readPointer48(decoded.payload, 0);
                const cLen = decoded.payload.readUInt32BE(6);
                const cOff = decoded.payload.readUInt32BE(10);
                const cChain = decoded.payload.readUInt8(14) === 1;
                const childPtr = { blockId: cBlockId, length: cLen, offset: cOff, isChain: cChain };
                
                const child = await this.nodeIO.load(childPtr);
                sum += child.totalBytes;
            }
        }
        return sum;
    }
}
module.exports = SequenceOps;
