
// B"H
const fs = require('fs').promises;
const constants = require('../constants.js');
const WAL = require('./wal.js');

class Pager {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.walPath = filePath + ".wal"; 
        this.handle = null;
        this.wal = new WAL(this.walPath);
        
        // B"H: Double-Buffered Write Cache
        // dirtyBlocks: Accepts new writes immediately.
        // flushingBlocks: Snapshotted blocks currently writing to disk.
        this.dirtyBlocks = new Map(); 
        this.flushingBlocks = new Map(); 
        
        // B"H: Strict RAM Limit
        this.CACHE_LIMIT = 2500; // ~10MB
        this.DB_IOV_MAX = 500; 
        
        this.knownFileSize = 0;

        // B"H: Optimization - Buffer Pool (The Pool of Siloam)
        this.bufferPool = [];
        this.MAX_POOL_SIZE = 2000; // ~8MB reserve
        
        // B"H: Batching Counter
        this.batchDepth = 0;
        
        // B"H: Flush Lock
        this._flushLock = false;
        this._flushQueue = [];
    }

    async init() {
        if (!this.handle) {
            let isNewFile = false;
            try {
                this.handle = await fs.open(this.filePath, 'r+');
                const stats = await this.handle.stat();
                this.knownFileSize = stats.size;
                if (stats.size === 0) isNewFile = true;
                
            } catch (e) {
                if (e.code === 'ENOENT') {
                    await fs.writeFile(this.filePath, Buffer.alloc(0));
                    this.handle = await fs.open(this.filePath, 'r+');
                    this.knownFileSize = 0;
                    isNewFile = true;
                } else {
                    throw e;
                }
            }
            
            await this.wal.init();
            
            if (isNewFile) {
                await this.wal.clear();
            } else {
                await this.wal.recover(this);
            }
        }
    }

    _allocBuffer() {
        if (this.bufferPool.length > 0) {
            return this.bufferPool.pop();
        }
        return Buffer.allocUnsafe(constants.BLOCK_SIZE);
    }

    _recycleBuffer(buf) {
        if (buf.length === constants.BLOCK_SIZE && this.bufferPool.length < this.MAX_POOL_SIZE) {
            this.bufferPool.push(buf);
        }
    }

    // B"H: Synchronous Check - The Lightning Flash
    readBlockSync(blockId) {
        // Priority: Newest (dirty) -> Flushing -> None
        if (this.dirtyBlocks.has(blockId)) return this.dirtyBlocks.get(blockId);
        if (this.flushingBlocks.has(blockId)) return this.flushingBlocks.get(blockId);
        return null;
    }
    
    // B"H: Expose direct reference for in-place modification
    getDirtyBuffer(blockId) {
        if (this.dirtyBlocks.has(blockId)) {
            return this.dirtyBlocks.get(blockId);
        }
        
        // If it's currently flushing, we CANNOT modify it in place because `fs.writev` is async reading it.
        // We must Copy-On-Write (COW) it back to dirtyBlocks.
        if (this.flushingBlocks.has(blockId)) {
            const flushingBuf = this.flushingBlocks.get(blockId);
            const newBuf = this._allocBuffer();
            flushingBuf.copy(newBuf);
            this.dirtyBlocks.set(blockId, newBuf);
            return newBuf;
        }
        return null;
    }

    async _readExact(buffer, offset, length, position) {
        let bytesReadTotal = 0;
        while (bytesReadTotal < length) {
            const { bytesRead } = await this.handle.read(
                buffer, 
                offset + bytesReadTotal, 
                length - bytesReadTotal, 
                position + bytesReadTotal
            );
            if (bytesRead === 0) {
                if (bytesReadTotal < length) {
                    buffer.fill(0, offset + bytesReadTotal, offset + length);
                }
                break;
            }
            bytesReadTotal += bytesRead;
        }
        return bytesReadTotal;
    }

    async readBlock(blockId) {
        // 1. Check Write-Back Cache (Sync)
        const cached = this.readBlockSync(blockId);
        if (cached) {
            const copy = this._allocBuffer();
            cached.copy(copy);
            return copy;
        }

        if (!this.handle) await this.init();

        const buffer = this._allocBuffer();
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        if (offset >= this.knownFileSize) {
             buffer.fill(0);
             return buffer;
        }

        await this._readExact(buffer, 0, constants.BLOCK_SIZE, offset);
        return buffer;
    }
    
    async readSequential(startBlockId, numberOfBlocks) {
        if (!this.handle) await this.init();
        
        const totalSize = numberOfBlocks * constants.BLOCK_SIZE;
        // Large buffer, don't pool
        const buffer = Buffer.allocUnsafe(totalSize);
        
        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));
        
        // 1. Read from Disk (Single Syscall)
        await this._readExact(buffer, 0, totalSize, offset);
        
        // 2. Patch with Dirty/Flushing Blocks (Overlay)
        for(let i=0; i<numberOfBlocks; i++) {
            const currentId = startBlockId + i;
            // Check Dirty (Newest)
            let overlay = this.dirtyBlocks.get(currentId);
            if (!overlay) overlay = this.flushingBlocks.get(currentId);
            
            if(overlay) {
                overlay.copy(buffer, i * constants.BLOCK_SIZE);
            }
        }
        return buffer;
    }

    startBatch() { 
        this.batchDepth++; 
    }
    
    async endBatch() { 
        if (this.batchDepth > 0) this.batchDepth--;
        if (this.batchDepth === 0) {
            await this.flushDirty(); 
        }
    }
    
    get isBatching() {
        return this.batchDepth > 0;
    }

    async writeBlock(blockId, buffer) {
        if (!this.handle) await this.init();
        
        // B"H: Update Dirty Cache
        let bufferToStore;
        if (this.dirtyBlocks.has(blockId)) {
             bufferToStore = this.dirtyBlocks.get(blockId);
             if (buffer !== bufferToStore) {
                 buffer.copy(bufferToStore);
             }
             // LRU refresh
             this.dirtyBlocks.delete(blockId);
             this.dirtyBlocks.set(blockId, bufferToStore);
        } else {
             bufferToStore = this._allocBuffer();
             buffer.copy(bufferToStore);
             this.dirtyBlocks.set(blockId, bufferToStore);
        }

        // B"H: WAL Log
        this.wal.log(blockId, bufferToStore, this.isBatching); 

        // Auto-flush if pressure high
        if (this.dirtyBlocks.size >= this.CACHE_LIMIT) {
            await this.flushDirty();
        }
    }
    
    async flushDirty() {
        // Serialize Flushes
        if (this._flushLock) {
            await new Promise(resolve => this._flushQueue.push(resolve));
        }
        this._flushLock = true;

        try {
            if (this.dirtyBlocks.size === 0) return;

            // B"H: Atomic Swap
            // Move current dirty blocks to flushing state.
            // Create new map for incoming writes.
            this.flushingBlocks = this.dirtyBlocks;
            this.dirtyBlocks = new Map();

            const sortedIds = Array.from(this.flushingBlocks.keys()).sort((a,b) => a - b);
            
            let rangeStartId = sortedIds[0];
            let rangeBuffers = [this.flushingBlocks.get(rangeStartId)];

            for(let i=1; i<sortedIds.length; i++) {
                const id = sortedIds[i];
                const prevId = sortedIds[i-1];
                
                // B"H: Safety check
                const buf = this.flushingBlocks.get(id);
                if (!buf) continue;

                if (id === prevId + 1 && rangeBuffers.length < this.DB_IOV_MAX) {
                    rangeBuffers.push(buf);
                } else {
                    await this._writeVector(rangeStartId, rangeBuffers);
                    rangeStartId = id;
                    rangeBuffers = [buf];
                }
            }
            
            if(rangeBuffers.length > 0) {
                await this._writeVector(rangeStartId, rangeBuffers);
            }

            await this.wal.flush();

            // Recycle buffers
            for (const buf of this.flushingBlocks.values()) {
                this._recycleBuffer(buf);
            }
            this.flushingBlocks.clear();

        } finally {
            this._flushLock = false;
            if (this._flushQueue.length > 0) {
                const next = this._flushQueue.shift();
                next();
            }
        }
    }

    async _writeVector(startBlockId, buffers) {
        // B"H: Validation
        if (!buffers || buffers.length === 0) return;
        // Check for undefined buffers which cause writev to throw
        for(let i=0; i<buffers.length; i++) {
            if (!buffers[i]) {
                console.error(`B"H Pager Error: Undefined buffer at index ${i} in vector write. StartBlock: ${startBlockId}`);
                // Heal: fill with zeros to prevent crash
                buffers[i] = Buffer.alloc(constants.BLOCK_SIZE); 
            }
        }

        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.writev(buffers, offset);
        const endOffset = offset + (buffers.length * constants.BLOCK_SIZE);
        if (endOffset > this.knownFileSize) this.knownFileSize = endOffset;
    }
    
    async writeRaw(blockId, buffer) {
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.write(buffer, 0, constants.BLOCK_SIZE, offset);
        const endOffset = offset + constants.BLOCK_SIZE;
        if (endOffset > this.knownFileSize) this.knownFileSize = endOffset;
    }

    async truncate(blockCount) {
        if (!this.handle) await this.init();
        const offset = Number(BigInt(blockCount) * BigInt(constants.BLOCK_SIZE));
        await this.handle.truncate(offset);
        this.knownFileSize = offset;
        await this.handle.sync();
    }

    async sync() {
        await this.flushDirty();
        if (this.handle) {
            await this.handle.sync(); 
        }
        await this.wal.sync();
    }

    async checkpoint() {
        await this.sync();
        await this.wal.clear(); 
    }
 
    async close() {
        await this.sync();
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
        await this.wal.close();
        this.bufferPool = [];
    }
}

module.exports = Pager;
