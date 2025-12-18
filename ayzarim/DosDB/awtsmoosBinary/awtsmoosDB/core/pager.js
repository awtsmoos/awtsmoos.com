
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
        
        this.dirtyBlocks = new Map(); 
        this.walMap = new Map(); 
        
        // B"H: Configurable Cache (Default 5000)
        const baseCache = options.cacheSize || 5000;
        this.CACHE_LIMIT = baseCache; 
        
        // WAL Flush Threshold (2x Cache)
        this.WAL_CHECKPOINT_THRESHOLD = baseCache * 2;
        this.walBlockCount = 0;

        this.DB_IOV_MAX = 500;
        this.knownFileSize = 0;

        // B"H: Buffer Pool Size matches Cache
        this.bufferPool = [];
        this.MAX_POOL_SIZE = baseCache; 
        
        this.batchDepth = 0;
        
        this._flushTimer = null;
        this._flushPromise = null;
        this._flushResolve = null;
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
            await this.wal.recover(this);
        }
    }

    _allocBuffer() {
        if (this.bufferPool.length > 0) return this.bufferPool.pop();
        return Buffer.allocUnsafe(constants.BLOCK_SIZE);
    }

    _recycleBuffer(buf) {
        if (buf.length === constants.BLOCK_SIZE && this.bufferPool.length < this.MAX_POOL_SIZE) {
            this.bufferPool.push(buf);
        }
    }

    readBlockSync(blockId, noCopy = false) {
        const dirty = this.dirtyBlocks.get(blockId);
        if (dirty) {
            if (noCopy) return dirty;
            const copy = this._allocBuffer();
            dirty.copy(copy);
            return copy;
        }
        return null;
    }
    
    getDirtyBuffer(blockId) {
        return this.dirtyBlocks.get(blockId);
    }

    async _readExact(buffer, offset, length, position) {
        let bytesReadTotal = 0;
        while (bytesReadTotal < length) {
            const { bytesRead } = await this.handle.read(
                buffer, offset + bytesReadTotal, length - bytesReadTotal, position + bytesReadTotal
            );
            if (bytesRead === 0) {
                if (bytesReadTotal < length) buffer.fill(0, offset + bytesReadTotal, offset + length);
                break;
            }
            bytesReadTotal += bytesRead;
        }
        return bytesReadTotal;
    }

    async readBlock(blockId, noCopy = false) {
        // 1. Check Dirty (Fastest)
        const dirty = this.dirtyBlocks.get(blockId);
        if (dirty) {
            if (noCopy) return dirty;
            const copy = this._allocBuffer();
            dirty.copy(copy);
            return copy;
        }

        if (!this.handle) await this.init();

        const buffer = this._allocBuffer();

        // 2. Check WAL
        const walOffset = this.walMap.get(blockId);
        if (walOffset !== undefined) {
            await this.wal.read(buffer, walOffset);
            return buffer;
        }

        // 3. Read from DB
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
        const buffer = Buffer.allocUnsafe(totalSize);
        
        for(let i=0; i<numberOfBlocks; i++) {
            const id = startBlockId + i;
            const targetStart = i * constants.BLOCK_SIZE;
            
            const dirty = this.dirtyBlocks.get(id);
            if (dirty) {
                dirty.copy(buffer, targetStart);
                continue;
            }
            
            const walOffset = this.walMap.get(id);
            if (walOffset !== undefined) {
                const temp = this._allocBuffer();
                await this.wal.read(temp, walOffset);
                temp.copy(buffer, targetStart);
                this._recycleBuffer(temp);
                continue;
            }
            
            const fileOffset = Number(BigInt(id) * BigInt(constants.BLOCK_SIZE));
            if (fileOffset >= this.knownFileSize) {
                buffer.fill(0, targetStart, targetStart + constants.BLOCK_SIZE);
            } else {
                await this._readExact(buffer, targetStart, constants.BLOCK_SIZE, fileOffset);
            }
        }
        return buffer;
    }

    startBatch() { this.batchDepth++; }
    
    async endBatch() { 
        if (this.batchDepth > 0) this.batchDepth--;
        if (this.batchDepth === 0) {
            this._scheduleFlush();
        }
    }
    
    get isBatching() { return this.batchDepth > 0; }

    async writeBlock(blockId, buffer) {
        if (!this.handle) await this.init();
        
        let bufferToStore = this.dirtyBlocks.get(blockId);
        if (bufferToStore) {
             if (buffer !== bufferToStore) buffer.copy(bufferToStore);
        } else {
             bufferToStore = this._allocBuffer();
             buffer.copy(bufferToStore);
             this.dirtyBlocks.set(blockId, bufferToStore);
        }

        // Auto-flush only if cache limit exceeded
        if (this.dirtyBlocks.size >= this.CACHE_LIMIT) {
            await this.flushDirty();
        }
    }
    
    _scheduleFlush() {
        if (!this._flushPromise) {
            this._flushPromise = new Promise(resolve => {
                this._flushResolve = resolve;
                // B"H: Tick-based aggregation
                this._flushTimer = setImmediate(async () => {
                    await this.flushDirty();
                });
            });
        }
    }
    
    async flushDirty() {
        if (this._flushTimer) {
            clearImmediate(this._flushTimer);
            this._flushTimer = null;
        }

        try {
            if (this.dirtyBlocks.size === 0) return;

            // 1. Move dirty blocks to WAL
            for (const [blockId, buf] of this.dirtyBlocks) {
                const walOffset = this.wal.log(blockId, buf); 
                this.walMap.set(blockId, walOffset);
                this._recycleBuffer(buf);
            }
            
            this.walBlockCount += this.dirtyBlocks.size;
            this.dirtyBlocks.clear();

            // 2. Commit to WAL (Lazy Sync)
            await this.wal.commit();

            // Checkpoint logic
            if (this.walBlockCount >= this.WAL_CHECKPOINT_THRESHOLD) {
                await this.checkpoint();
            }

        } finally {
            if (this._flushResolve) {
                const r = this._flushResolve;
                this._flushPromise = null;
                this._flushResolve = null;
                r();
            }
        }
    }

    async checkpoint() {
        if (this.walMap.size === 0) return;
        
        await this.wal.sync();
        
        const sortedIds = Array.from(this.walMap.keys()).sort((a,b) => a - b);
        let rangeStartId = sortedIds[0];
        let rangeBuffers = [];
        
        for(let i=0; i<sortedIds.length; i++) {
            const id = sortedIds[i];
            const walOffset = this.walMap.get(id);
            const buf = this._allocBuffer();
            await this.wal.read(buf, walOffset);
            
            if (i > 0 && id === sortedIds[i-1] + 1 && rangeBuffers.length < this.DB_IOV_MAX) {
                rangeBuffers.push(buf);
            } else {
                if (rangeBuffers.length > 0) await this._writeVector(rangeStartId, rangeBuffers);
                rangeStartId = id;
                rangeBuffers = [buf];
            }
        }
        
        if (rangeBuffers.length > 0) await this._writeVector(rangeStartId, rangeBuffers);
        
        if (this.handle) await this.handle.sync();
        
        await this.wal.clear();
        this.walMap.clear();
        this.walBlockCount = 0;
    }

    async _writeVector(startBlockId, buffers) {
        if (!buffers || buffers.length === 0) return;
        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.writev(buffers, offset);
        const endOffset = offset + (buffers.length * constants.BLOCK_SIZE);
        if (endOffset > this.knownFileSize) this.knownFileSize = endOffset;
        for(const b of buffers) this._recycleBuffer(b);
    }
    
    async writeBufferedRange(startBlockId, buffer) {
        if (!this.handle) await this.init();
        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.write(buffer, 0, buffer.length, offset);
        const endOffset = offset + buffer.length;
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
        if (this._flushPromise) {
            await this._flushPromise;
        } else if (this.dirtyBlocks.size > 0) {
            await this.flushDirty();
        }
        
        await this.wal.sync();
    }
 
    async close() {
        await this.sync();
        await this.checkpoint(); 
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
        await this.wal.close();
        this.bufferPool = [];
    }
}

module.exports = Pager;
