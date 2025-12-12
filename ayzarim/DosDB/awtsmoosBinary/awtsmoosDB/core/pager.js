
// B"H
const fs = require('fs').promises;
const constants = require('../constants.js');
const WAL = require('./wal.js');

class Pager {
    constructor(filePath) {
        this.filePath = filePath;
        this.walPath = filePath + ".wal"; 
        this.handle = null;
        this.wal = new WAL(this.walPath);
        // B"H: Debug Blocks disabled
        this.debugBlocks = new Set([/* 13, 18, 23, 28, 33 */]); 
        
        // B"H: Batch Optimization
        this.batchMode = false;
        this.dirtyBlocks = new Map(); // Map<blockId, Buffer>
        
        // B"H: Limit for contiguous writes to avoid OS vector limits
        this.DB_IOV_MAX = 500; 
    }

    log(msg) {
        // console.log(`[TRACE Pager] ${msg}`);
    }

    async init() {
        if (!this.handle) {
            try {
                // B"H: Optimistic Open - Only check access if open fails
                this.handle = await fs.open(this.filePath, 'r+');
            } catch (e) {
                if (e.code === 'ENOENT') {
                    await fs.writeFile(this.filePath, Buffer.alloc(0));
                    this.handle = await fs.open(this.filePath, 'r+');
                } else {
                    throw e;
                }
            }
            await this.wal.init();
            await this.wal.recover(this);
        }
    }

    /**
     * B"H: Robust Read Helper
     * Loops until 'length' bytes are read or EOF is reached.
     */
    async _readExact(buffer, offset, length, position) {
        let bytesReadTotal = 0;
        let retries = 0;
        
        while (bytesReadTotal < length) {
            const { bytesRead } = await this.handle.read(
                buffer, 
                offset + bytesReadTotal, 
                length - bytesReadTotal, 
                position + bytesReadTotal
            );

            if (bytesRead === 0) {
                // EOF or Lag?
                const stats = await this.handle.stat();
                if (position + bytesReadTotal < stats.size) {
                    if (retries++ < 5) {
                        await new Promise(r => setTimeout(r, 10)); 
                        continue;
                    }
                }
                break; // Genuine EOF
            }
            
            bytesReadTotal += bytesRead;
        }
        return bytesReadTotal;
    }

    async readBlock(blockId) {
        // B"H: Check Dirty Cache first (Fast Path)
        if (this.batchMode && this.dirtyBlocks.has(blockId)) {
            const cached = this.dirtyBlocks.get(blockId);
            const copy = Buffer.alloc(constants.BLOCK_SIZE);
            cached.copy(copy);
            return copy;
        }

        // B"H: Avoid re-init check on every read if handle exists
        if (!this.handle) await this.init();

        const buffer = Buffer.alloc(constants.BLOCK_SIZE);
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        if (this.debugBlocks.has(blockId)) {
             console.log(`B"H [Pager] readBlock(${blockId}) @ ${offset}`);
        }
        
        const bytesRead = await this._readExact(buffer, 0, constants.BLOCK_SIZE, offset);
        
        if (bytesRead === 0) return null;
        
        if (this.debugBlocks.has(blockId)) {
             const head = buffer.toString('hex', 0, 8);
             console.log(`B"H [Pager] readBlock(${blockId}) DONE. Header: ${head}`);
        }
        
        return buffer;
    }
    
    async readBlockType(blockId) {
        // Optimization: Read type from dirty cache if available
        if (this.batchMode && this.dirtyBlocks.has(blockId)) {
            return this.dirtyBlocks.get(blockId).readUInt32BE(0);
        }

        if (!this.handle) await this.init();
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        const buffer = Buffer.alloc(4); 
        const { bytesRead } = await this.handle.read(buffer, 0, 4, offset);
        if (bytesRead < 4) return null; 
        return buffer.readUInt32BE(0);
    }

    async readSequential(startBlockId, numberOfBlocks) {
        // B"H: Optimized Mixed Read Support
        if (!this.handle) await this.init();
        
        const totalSize = numberOfBlocks * constants.BLOCK_SIZE;
        const buffer = Buffer.alloc(totalSize);
        
        // 1. Read everything from disk first (Bulk I/O)
        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));
        const bytesRead = await this._readExact(buffer, 0, totalSize, offset);
        
        // 2. Overlay dirty blocks from memory
        if (this.batchMode && this.dirtyBlocks.size > 0) {
            for(let i=0; i<numberOfBlocks; i++) {
                const currentId = startBlockId + i;
                if(this.dirtyBlocks.has(currentId)) {
                    const dirty = this.dirtyBlocks.get(currentId);
                    dirty.copy(buffer, i * constants.BLOCK_SIZE);
                }
            }
        }

        if (this.debugBlocks.has(startBlockId)) {
             const head = buffer.toString('hex', 0, 8);
             console.log(`B"H [Pager] readSequential(${startBlockId}, n=${numberOfBlocks}) DONE. First 8 bytes: ${head}`);
        }
        
        return buffer;
    }

    startBatch() {
        this.batchMode = true;
        this.dirtyBlocks.clear();
    }

    async endBatch() {
        if (!this.batchMode) return;
        
        // 1. Write all dirty blocks to WAL in chunks (Sequential I/O, Low RAM)
        if (this.dirtyBlocks.size > 0) {
            await this.wal.logBatch(this.dirtyBlocks);
            
            // 2. Write to main DB file
            // Use writev to merge contiguous writes
            const sortedIds = Array.from(this.dirtyBlocks.keys()).sort((a,b) => a - b);
            
            if (sortedIds.length > 0) {
                let rangeStartId = sortedIds[0];
                let rangeBuffers = [this.dirtyBlocks.get(rangeStartId)];

                for(let i=1; i<sortedIds.length; i++) {
                    const id = sortedIds[i];
                    const prevId = sortedIds[i-1];
                    
                    // Check contiguity and vector size limit
                    if (id === prevId + 1 && rangeBuffers.length < this.DB_IOV_MAX) {
                        rangeBuffers.push(this.dirtyBlocks.get(id));
                    } else {
                        // Flush previous range
                        const offset = Number(BigInt(rangeStartId) * BigInt(constants.BLOCK_SIZE));
                        await this.handle.writev(rangeBuffers, offset);
                        
                        // Start new range
                        rangeStartId = id;
                        rangeBuffers = [this.dirtyBlocks.get(id)];
                    }
                }
                
                // Flush final range
                if(rangeBuffers.length > 0) {
                    const offset = Number(BigInt(rangeStartId) * BigInt(constants.BLOCK_SIZE));
                    await this.handle.writev(rangeBuffers, offset);
                }
            }
            
            // 3. Clear WAL
            await this.wal.clear();
        }

        this.batchMode = false;
        this.dirtyBlocks.clear();
    }

    async writeBlock(blockId, buffer) {
        if (!this.handle) await this.init();
        
        let writeBuffer = buffer;
        if (buffer.length !== constants.BLOCK_SIZE) {
            writeBuffer = Buffer.alloc(constants.BLOCK_SIZE);
            buffer.copy(writeBuffer);
        }

        if (this.batchMode) {
            // B"H: DEFERRED WRITE (Zero IO)
            // Just update the map. 
            // Clone the buffer to ensure it doesn't change outside
            const cacheCopy = Buffer.alloc(constants.BLOCK_SIZE);
            writeBuffer.copy(cacheCopy);
            this.dirtyBlocks.set(blockId, cacheCopy);
            return;
        }

        // Standard Mode: Write Immediately
        await this.wal.log(blockId, writeBuffer, false);

        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        if (this.debugBlocks.has(blockId)) {
             const head = writeBuffer.toString('hex', 0, 8);
             console.log(`B"H [Pager] writeBlock(${blockId}) Header: ${head}`);
        }
        
        const { bytesWritten } = await this.handle.write(writeBuffer, 0, constants.BLOCK_SIZE, offset);
        
        if (bytesWritten !== constants.BLOCK_SIZE) {
            console.error(`[Pager] Partial Write: Wrote ${bytesWritten} of ${constants.BLOCK_SIZE} bytes.`);
        }
    }
    
    async writeRaw(blockId, buffer) {
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.write(buffer, 0, constants.BLOCK_SIZE, offset);
    }

    async truncate(blockCount) {
        if (!this.handle) await this.init();
        const offset = Number(BigInt(blockCount) * BigInt(constants.BLOCK_SIZE));
        await this.handle.truncate(offset);
    }

    async checkpoint() {
        if (this.handle) {
            await this.handle.sync(); 
        }
        await this.wal.clear(); 
    }
 
    async close() {
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
        await this.wal.close();
    }
}

module.exports = Pager;
