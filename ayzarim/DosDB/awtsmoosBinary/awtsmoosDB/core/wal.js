


// B"H
const fs = require('fs').promises;
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

class WAL {
    constructor(walPath) {
        this.path = walPath;
        this.handle = null;
        this.currentOffset = 0; 
        
        // B"H: Double Buffering for Lightning Speed
        this.BUFFER_SIZE = 256 * 1024; // 256KB Chunk
        this.activeBuffer = Buffer.allocUnsafe(this.BUFFER_SIZE);
        this.activeOffset = 0;
        
        // Chain promises to ensure sequential disk writes
        this.pendingFlush = Promise.resolve();
    }

    async init() {
        if (!this.handle) {
            try {
                await fs.access(this.path);
            } catch {
                await fs.writeFile(this.path, Buffer.alloc(0));
            }
            this.handle = await fs.open(this.path, 'r+');
            const stats = await this.handle.stat();
            this.currentOffset = stats.size;
        }
    }

    log(blockId, data, skipSync = false) {
        // Packet: [BlockID (6)][Data (4096)]
        const PACKET_SIZE = 6 + constants.BLOCK_SIZE;
        
        // 1. Rotate if full
        if (this.activeOffset + PACKET_SIZE > this.BUFFER_SIZE) {
            this._rotateAndFlush();
        }

        // 2. Write to Memory
        writePointer48(this.activeBuffer, blockId, this.activeOffset);
        data.copy(this.activeBuffer, this.activeOffset + 6);
        this.activeOffset += PACKET_SIZE;
        
        // 3. Sync if requested (Force flush to disk)
        if (!skipSync) {
            return this.sync();
        }
    }

    _rotateAndFlush() {
        if (this.activeOffset === 0) return this.pendingFlush;

        const bufferToWrite = this.activeBuffer;
        const bytesToWrite = this.activeOffset;
        
        this.activeBuffer = Buffer.allocUnsafe(this.BUFFER_SIZE);
        this.activeOffset = 0;

        const prevPromise = this.pendingFlush;
        this.pendingFlush = (async () => {
            await prevPromise; 
            if (!this.handle) await this.init();
            
            await this.handle.write(bufferToWrite, 0, bytesToWrite, this.currentOffset);
            this.currentOffset += bytesToWrite;
        })().catch(err => {
            console.error("B\"H WAL Async Flush Error:", err);
        });

        return this.pendingFlush;
    }

    async flush() {
        return this._rotateAndFlush();
    }

    async sync() {
        await this.flush();
        await this.pendingFlush; 
        if (this.handle) {
            await this.handle.sync();
        }
    }

    async clear() {
        await this.pendingFlush;
        if (this.handle) {
            await this.handle.truncate(0);
            await this.handle.sync();
            this.currentOffset = 0;
            this.activeOffset = 0;
        }
    }

    async recover(pager) {
        await this.init();
        const stats = await this.handle.stat(); 
        if (stats.size === 0) return;

        console.log("B\"H: Unclean shutdown detected. Streaming WAL recovery...");
        await this.handle.close();
        
        const readHandle = await fs.open(this.path, 'r');
        const PACKET_SIZE = 6 + constants.BLOCK_SIZE; 
        
        // B"H: Optimization - Read 4MB chunks
        const CHUNK_SIZE = 4 * 1024 * 1024; 
        const buffer = Buffer.alloc(CHUNK_SIZE);
        
        // B"H: Recovery Cache Constraints
        // We limit the in-memory recovery batch to 4MB to stay well under the 10MB total requirement.
        const RECOVERY_BATCH_LIMIT = 4 * 1024 * 1024;
        let batchSize = 0;
        let recoveryBatch = new Map(); // BlockID -> Buffer

        let recoveredCount = 0;
        let position = 0;
        let leftOver = Buffer.alloc(0);

        try {
            while (true) {
                const { bytesRead } = await readHandle.read(buffer, 0, CHUNK_SIZE, position);
                if (bytesRead === 0) break;

                const chunk = Buffer.concat([leftOver, buffer.subarray(0, bytesRead)]);
                let offset = 0;
                
                while (offset + PACKET_SIZE <= chunk.length) {
                    const blockId = readPointer48(chunk, offset);
                    // Copy data safely
                    const data = Buffer.allocUnsafe(constants.BLOCK_SIZE);
                    chunk.copy(data, 0, offset + 6, offset + 6 + constants.BLOCK_SIZE);

                    // Add to Batch
                    if (!recoveryBatch.has(blockId)) {
                        batchSize += constants.BLOCK_SIZE;
                    }
                    recoveryBatch.set(blockId, data);
                    recoveredCount++;
                    
                    // Flush if batch full
                    if (batchSize >= RECOVERY_BATCH_LIMIT) {
                        await this._flushRecoveryBatch(pager, recoveryBatch);
                        recoveryBatch.clear();
                        batchSize = 0;
                    }

                    offset += PACKET_SIZE;
                }
                
                // Save leftover bytes
                leftOver = chunk.subarray(offset);
                position += bytesRead;
            }
            
            // Final Flush
            if (recoveryBatch.size > 0) {
                await this._flushRecoveryBatch(pager, recoveryBatch);
            }

        } finally {
            await readHandle.close();
        }

        console.log(`B\"H: Recovery Complete. Restored ${recoveredCount} blocks (Optimized).`);
        this.handle = await fs.open(this.path, 'r+');
        this.currentOffset = 0; 
        await this.clear();
    }
    
    // B"H: New Helper for Coalesced Writes
    async _flushRecoveryBatch(pager, batchMap) {
        if (batchMap.size === 0) return;
        
        // 1. Sort by Block ID to enable sequential writes
        const sortedIds = Array.from(batchMap.keys()).sort((a, b) => a - b);
        
        let startBlock = sortedIds[0];
        let currentRun = [batchMap.get(startBlock)];
        
        for (let i = 1; i < sortedIds.length; i++) {
            const id = sortedIds[i];
            const prev = sortedIds[i-1];
            
            if (id === prev + 1) {
                // Contiguous: Add to run
                currentRun.push(batchMap.get(id));
            } else {
                // Gap: Write current run and start new
                await this._writeRun(pager, startBlock, currentRun);
                startBlock = id;
                currentRun = [batchMap.get(id)];
            }
        }
        
        // Write final run
        if (currentRun.length > 0) {
            await this._writeRun(pager, startBlock, currentRun);
        }
    }
    
    async _writeRun(pager, startBlock, buffers) {
        // Concat buffers into one large buffer
        const totalLen = buffers.length * constants.BLOCK_SIZE;
        const megaBuffer = Buffer.allocUnsafe(totalLen);
        for(let i=0; i<buffers.length; i++) {
            buffers[i].copy(megaBuffer, i * constants.BLOCK_SIZE);
        }
        
        // Single System Call
        await pager.writeBufferedRange(startBlock, megaBuffer);
    }

    async close() {
        await this.sync();
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
    }
}

module.exports = WAL;