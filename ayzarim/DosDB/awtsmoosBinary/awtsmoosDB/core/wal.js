
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
        const PACKET_SIZE = 6 + constants.BLOCK_SIZE; // 4102 bytes
        
        // B"H: Optimization - Read 4MB chunks
        const CHUNK_SIZE = 4 * 1024 * 1024; 
        const buffer = Buffer.alloc(CHUNK_SIZE);
        
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
                    // B"H: Optimization - Don't alloc new buffer if possible, or verify safety
                    // pager.writeRaw expects a buffer.
                    const data = Buffer.allocUnsafe(constants.BLOCK_SIZE);
                    chunk.copy(data, 0, offset + 6, offset + 6 + constants.BLOCK_SIZE);

                    await pager.writeRaw(blockId, data);
                    offset += PACKET_SIZE;
                    recoveredCount++;
                }
                
                // Save leftover bytes for next chunk
                leftOver = chunk.subarray(offset);
                position += bytesRead;
            }
        } finally {
            await readHandle.close();
        }

        console.log(`B\"H: Recovery Complete. Restored ${recoveredCount} blocks.`);
        this.handle = await fs.open(this.path, 'r+');
        this.currentOffset = 0; 
        await this.clear();
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
