
// B"H
const Utils = require('./ops_utils.js');

class SpliceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
    }

    async splice(start, deleteCount, newItems, options = {}) {
        const cacheKey = this.seq.ptr.blockId + ':' + (this.seq.ptr.offset || 0);
        this.nodeIO.allocator.v1.db.structureCache.delete(cacheKey);
        const root = await this.nodeIO.load(this.seq.ptr);
        
        const result = await this._spliceRecursive(root, start, deleteCount, newItems, options);
        
        // Authoritatively update root pointer
        this.seq.ptr = root.ptr;

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
        const oldTotalBytes = node.totalBytes;
        const oldTotalCount = node.totalCount;

        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.POINTER_SIZE);
            const p = Buffer.alloc(16); node.buffer.copy(p, 0, off, off + 16);
            ptrs.push(p);
        }
        
        const actualStart = Math.min(start, ptrs.length);
        const actualDelete = Math.min(deleteCount, ptrs.length - actualStart);
        const removed = ptrs.splice(actualStart, actualDelete, ...newItems);
        
        if (!options.skipFree && !node.isWeak) {
            for(const p of removed) await this.seq.allocator.free(p).catch(()=>{});
        }
        
        if (ptrs.length <= 200) {
            node.itemCount = ptrs.length; node.totalCount = ptrs.length;
            let tb = 0; for(const p of ptrs) tb += Utils.getPtrSize(p);
            node.totalBytes = tb;
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            for(const p of ptrs) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            return { deltaCount: node.totalCount - oldTotalCount, deltaBytes: node.totalBytes - oldTotalBytes, splitNodes: null };
        } else {
            const chunks = [];
            while(ptrs.length > 0) chunks.push(ptrs.splice(0, 200));
            const first = chunks[0];
            node.itemCount = first.length; node.totalCount = first.length;
            let tb = 0; for(const p of first) tb += Utils.getPtrSize(p);
            node.totalBytes = tb;
            node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET;
            for(const p of first) { p.copy(node.buffer, off); off += 16; }
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            let totalAddedBytes = 0;
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i];
                const newNode = await this.nodeIO.create(true, node.isWeak);
                newNode.itemCount = ch.length; newNode.totalCount = ch.length;
                let ntb = 0; for(const p of ch) ntb += Utils.getPtrSize(p);
                newNode.totalBytes = ntb;
                totalAddedBytes += ntb;
                let noff = Utils.DATA_OFFSET;
                for(const p of ch) { p.copy(newNode.buffer, noff); noff += 16; }
                await this.nodeIO.save(newNode);
                splitNodes.push(newNode);
            }
            return { deltaCount: (newItems.length - actualDelete), deltaBytes: (totalAddedBytes + node.totalBytes - oldTotalBytes), splitNodes }; 
        }
    }

    async _spliceInternal(node, start, deleteCount, newItems, options) {
        const initialTotalCount = node.totalCount;
        const initialTotalBytes = node.totalBytes;
        const entries = [];
        for(let i=0; i<node.itemCount; i++) {
            const off = Utils.DATA_OFFSET + (i * Utils.ENTRY_SIZE);
            const e = Buffer.alloc(20); node.buffer.copy(e, 0, off, off + 20);
            entries.push(e);
        }
        
        let currentOffset = 0; let insertItems = newItems;
        const newEntryList = []; let itemsInserted = false;
        
        for(const entry of entries) {
            const childCount = entry.readUInt32BE(16);
            const childStart = currentOffset; const childEnd = currentOffset + childCount;
            const insertHere = (insertItems.length > 0) && (start >= childStart && start <= childEnd);
            const deleteHere = (start < childEnd) && (start + deleteCount > childStart);
            
            if (insertHere || deleteHere) {
                const childPtr = Utils.decodePtr(entry.subarray(0, 16));
                const childKey = childPtr.blockId + ':' + (childPtr.offset || 0);
                this.nodeIO.allocator.v1.db.structureCache.delete(childKey);
                const childNode = await this.nodeIO.load(childPtr);
                
                const localStart = Math.max(0, start - childStart);
                const localDelete = Math.max(0, Math.min(childEnd, start + deleteCount) - Math.max(childStart, start));
                let localInsert = []; if (insertHere && !itemsInserted) { localInsert = insertItems; insertItems = []; itemsInserted = true; }
                
                const res = await this._spliceRecursive(childNode, localStart, localDelete, localInsert, options);
                if (childNode.totalCount > 0) {
                    // Update entry with child's new identity
                    Utils.encodePtr(childNode.ptr).copy(entry, 0);
                    entry.writeUInt32BE(childNode.totalCount, 16); 
                    newEntryList.push(entry);
                    if (res.splitNodes) {
                        for(const sn of res.splitNodes) {
                            const ne = Buffer.alloc(20); Utils.encodePtr(sn.ptr).copy(ne, 0);
                            ne.writeUInt32BE(sn.totalCount, 16); newEntryList.push(ne);
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
        
        let finalCount = 0; for(const e of newEntryList) finalCount += e.readUInt32BE(16);
        node.totalCount = finalCount;
        
        if (newEntryList.length <= 200) {
            node.itemCount = newEntryList.length; node.buffer.fill(0, Utils.DATA_OFFSET);
            let off = Utils.DATA_OFFSET; for(const e of newEntryList) { e.copy(node.buffer, off); off+=20; }
            node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, newEntryList);
            await this.nodeIO.save(node);
            return { deltaCount: finalCount - initialTotalCount, deltaBytes: node.totalBytes - initialTotalBytes, splitNodes: null };
        } else {
            const chunks = []; while(newEntryList.length > 0) chunks.push(newEntryList.splice(0, 200));
            const first = chunks[0]; node.itemCount = first.length;
            let off = Utils.DATA_OFFSET; let nc = 0;
            for(const e of first) { e.copy(node.buffer, off); off+=20; nc += e.readUInt32BE(16); }
            node.totalCount = nc; node.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, first);
            await this.nodeIO.save(node);
            
            const splitNodes = [];
            for(let i=1; i<chunks.length; i++) {
                const ch = chunks[i]; const nn = await this.nodeIO.create(false, node.isWeak);
                nn.itemCount = ch.length; let noff = Utils.DATA_OFFSET; let nnc = 0;
                for(const e of ch) { e.copy(nn.buffer, noff); noff+=20; nnc += e.readUInt32BE(16); }
                nn.totalCount = nnc; nn.totalBytes = await Utils.sumChildrenBytes(this.nodeIO, ch);
                await this.nodeIO.save(nn); splitNodes.push(nn);
            }
            const totalBytesAll = node.totalBytes + splitNodes.reduce((acc, n) => acc + n.totalBytes, 0);
            return { deltaCount: finalCount - initialTotalCount, deltaBytes: totalBytesAll - initialTotalBytes, splitNodes };
        }
    }
}
module.exports = SpliceOps;
