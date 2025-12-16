
// B"H
const Utils = require('./ops_utils.js');

class SpliceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    async splice(start, deleteCount, newItems, options = {}) {
        const root = await this.nodeIO.load(this.seq.ptr);
        
        if (root.totalCount === 0 && newItems.length > 0) {
             const res = await this._spliceRecursive(root, 0, 0, newItems, options);
             if (res.splitNodes && res.splitNodes.length > 0) await Utils.handleRootSplit(this.nodeIO, this.seq, root, res.splitNodes);
             return;
        }
        
        const result = await this._spliceRecursive(root, start, deleteCount, newItems, options);
        
        if (result.splitNodes && result.splitNodes.length > 0) {
            await Utils.handleRootSplit(this.nodeIO, this.seq, root, result.splitNodes);
        }
    }

    async _spliceRecursive(node, start, deleteCount, newItems, options) {
        if (node.isLeaf) return this._spliceLeaf(node, start, deleteCount, newItems, options);
        else return this._spliceInternal(node, start, deleteCount, newItems, options);
    }

    async _spliceLeaf(node, start, deleteCount, newItems, options) {
        const ptrs = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.POINTER_SIZE);
            const p = Buffer.alloc(16);
            node.buffer.copy(p, 0, off, off + 16);
            ptrs.push(p);
        }
        
        const actualStart = Math.min(start, ptrs.length);
        const actualDelete = Math.min(deleteCount, ptrs.length - actualStart);
        
        const removed = ptrs.splice(actualStart, actualDelete, ...newItems);
        
        if (!options.skipFree) {
            for(const p of removed) await this.seq.allocator.free(p).catch(()=>{});
        }
        
        const deltaCount = newItems.length - actualDelete;
        
        if (ptrs.length <= 250) {
            node.itemCount = ptrs.length;
            node.totalCount = ptrs.length;
            
            // B"H: Recalculate totalBytes from scratch (SAFE)
            let tb = 0;
            for(const p of ptrs) tb += Utils.getPtrSize(p);
            
            // Calculate delta for parent return
            const deltaBytes = tb - node.totalBytes; 
            node.totalBytes = tb;
            
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            for(const p of ptrs) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            
            return { deltaCount, deltaBytes, splitNodes: null };
        } else {
            const chunks = [];
            while(ptrs.length > 0) chunks.push(ptrs.splice(0, 250));
            
            const first = chunks[0];
            node.itemCount = first.length;
            node.totalCount = first.length;
            
            let tb = 0; for(const p of first) tb += Utils.getPtrSize(p);
            node.totalBytes = tb;
            
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            for(const p of first) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i];
                const newNode = await this.nodeIO.create(true);
                newNode.itemCount = ch.length;
                newNode.totalCount = ch.length;
                let ntb = 0; for(const p of ch) ntb += Utils.getPtrSize(p);
                newNode.totalBytes = ntb;
                
                let noff = Utils.DATA_OFFSET;
                for(const p of ch) { p.copy(newNode.buffer, noff); noff += 16; }
                await this.nodeIO.save(newNode);
                splitNodes.push(newNode);
            }
            
            // Delta bytes not strictly needed here as parent recalculates, but returned for consistency
            return { deltaCount, deltaBytes: 0, splitNodes }; 
        }
    }

    async _spliceInternal(node, start, deleteCount, newItems, options) {
        const initialTotalCount = node.totalCount;
        
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            const e = Buffer.alloc(20);
            node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        
        let currentOffset = 0;
        const absoluteDeleteEnd = start + deleteCount;
        let insertItems = newItems;
        
        const newEntryList = [];
        
        for(const entry of entries) {
            const childCount = entry.readUInt32BE(16);
            const childStart = currentOffset;
            const childEnd = currentOffset + childCount;
            
            const insertHere = (insertItems.length > 0) && (start >= childStart && start <= childEnd);
            const deleteHere = (start < childEnd) && (absoluteDeleteEnd > childStart);
            
            if (insertHere || deleteHere) {
                const localStart = Math.max(0, start - childStart);
                const localDeleteEnd = Math.min(childEnd, absoluteDeleteEnd);
                const localDeleteStart = Math.max(childStart, start);
                const localDelete = Math.max(0, localDeleteEnd - localDeleteStart);
                
                let localInsert = [];
                if (insertHere) {
                    localInsert = insertItems;
                    insertItems = []; 
                }
                
                if (localStart === 0 && localDelete >= childCount && localInsert.length === 0) {
                    const childPtrBuf = entry.subarray(0, 16);
                    const childPtr = Utils.decodePtr(childPtrBuf);
                    const childNode = await this.nodeIO.load(childPtr);
                    
                    // Recursive cleanup
                    await this._spliceRecursive(childNode, 0, childNode.totalCount, [], options); 
                    await this.seq.allocator.v1.free(childNode.ptr);
                } 
                else {
                    const childPtrBuf = entry.subarray(0, 16);
                    const childPtr = Utils.decodePtr(childPtrBuf);
                    const childNode = await this.nodeIO.load(childPtr);
                    
                    const res = await this._spliceRecursive(childNode, localStart, localDelete, localInsert, options);
                    
                    // We ignore res.deltaBytes here because we will recalc totalBytes later
                    
                    if (childNode.totalCount > 0) {
                        entry.writeUInt32BE(childNode.totalCount, 16);
                        newEntryList.push(entry);
                        
                        if (res.splitNodes) {
                            for(const sn of res.splitNodes) {
                                const ne = Buffer.alloc(20);
                                Utils.encodePtr(sn.ptr).copy(ne, 0);
                                ne.writeUInt32BE(sn.totalCount, 16);
                                newEntryList.push(ne);
                            }
                        }
                    } else {
                        await this.seq.allocator.v1.free(childNode.ptr);
                    }
                }
            } else {
                newEntryList.push(entry);
            }
            
            currentOffset += childCount;
        }
        
        if (insertItems.length > 0) {
            if (newEntryList.length > 0) {
                const lastEntry = newEntryList[newEntryList.length - 1];
                const childPtr = Utils.decodePtr(lastEntry.subarray(0, 16));
                const childNode = await this.nodeIO.load(childPtr);
                
                const res = await this._spliceRecursive(childNode, childNode.totalCount, 0, insertItems, options);
                
                lastEntry.writeUInt32BE(childNode.totalCount, 16);
                
                if (res.splitNodes) {
                    for(const sn of res.splitNodes) {
                        const ne = Buffer.alloc(20);
                        Utils.encodePtr(sn.ptr).copy(ne, 0);
                        ne.writeUInt32BE(sn.totalCount, 16);
                        newEntryList.push(ne);
                    }
                }
            } else {
                const newLeaf = await this.nodeIO.create(true);
                const res = await this._spliceLeaf(newLeaf, 0, 0, insertItems, options);
                
                const ne = Buffer.alloc(20);
                Utils.encodePtr(newLeaf.ptr).copy(ne, 0);
                ne.writeUInt32BE(newLeaf.totalCount, 16);
                newEntryList.push(ne);
                
                if (res.splitNodes) {
                     for(const sn of res.splitNodes) {
                        const sne = Buffer.alloc(20);
                        Utils.encodePtr(sn.ptr).copy(sne, 0);
                        sne.writeUInt32BE(sn.totalCount, 16);
                        newEntryList.push(sne);
                    }
                }
            }
        }
        
        // B"H: RECALCULATION LOGIC (The Fix)
        let finalCount = 0;
        for(const e of newEntryList) {
            finalCount += e.readUInt32BE(16);
        }
        node.totalCount = finalCount;
        
        let trueDeltaCount = finalCount - initialTotalCount;

        if (newEntryList.length <= 200) {
            node.itemCount = newEntryList.length;
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            for(const e of newEntryList) { e.copy(node.buffer, off); off+=20; }
            
            // Recalculate totalBytes from valid children
            node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, newEntryList);
            
            await this.nodeIO.save(node);
            return { deltaCount: trueDeltaCount, deltaBytes: 0, splitNodes: null };
        } else {
            const chunks = [];
            while(newEntryList.length > 0) chunks.push(newEntryList.splice(0, 200));
            
            const first = chunks[0];
            node.itemCount = first.length;
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            let nc = 0;
            for(const e of first) { e.copy(node.buffer, off); off+=20; nc += e.readUInt32BE(16); }
            node.totalCount = nc;
            node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, first);
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i];
                const nn = await this.nodeIO.create(false);
                nn.itemCount = ch.length;
                let noff = Utils.DATA_OFFSET;
                let nnc = 0;
                for(const e of ch) { e.copy(nn.buffer, noff); noff+=20; nnc += e.readUInt32BE(16); }
                nn.totalCount = nnc;
                nn.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, ch);
                await this.nodeIO.save(nn);
                splitNodes.push(nn);
            }
            
            return { deltaCount: trueDeltaCount, deltaBytes: 0, splitNodes };
        }
    }
}
module.exports = SpliceOps;
