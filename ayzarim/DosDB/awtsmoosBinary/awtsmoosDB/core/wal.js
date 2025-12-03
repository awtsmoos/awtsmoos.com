// B"H
/**
 * @module WAL
 * @description Write-Ahead Log Manager.
 * MEMORY SAFE VERSION: Streams recovery to allow infinite log sizes without OOM.
 * WINDOWS FIX: Uses 'r+' instead of 'a+' to allow ftruncate.
 */

const fs = require('fs').promises;
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

class WAL {
    constructor(walPath) {
        this.path = walPath;
        this.handle = null;
    }

    async init() {
        if (!this.handle) {
            // Ensure file exists before opening with r+
            try {
                await fs.access(this.path);
            } catch {
                await fs.writeFile(this.path, Buffer.alloc(0));
            }
            this.handle = await fs.open(this.path, 'r+');
        }
    }

    async log(blockId, data) {
        await this.init();
        
        // Packet: [BlockID (6)][Data (4096)]
        const packet = Buffer.alloc(6 + constants.BLOCK_SIZE);
        writePointer48(packet, blockId, 0);
        
        if (data.length !== constants.BLOCK_SIZE) {
            const padded = Buffer.alloc(constants.BLOCK_SIZE);
            data.copy(padded);
            padded.copy(packet, 6);
        } else {
            data.copy(packet, 6);
        }

        // With 'r+', we must append manually to the end of the file.
        // stat() is safer than tracking offset if multiple processes (though Node is single-threaded here).
        // Optimization: For now, just use handle.stat to find end.
        const stats = await this.handle.stat();
        await this.handle.write(packet, 0, packet.length, stats.size);
        
        await this.handle.sync();
    }

    async clear() {
        if (this.handle) {
            await this.handle.truncate(0);
            await this.handle.sync();
        }
    }

    /**
     * Memory-Safe Recovery
     * Reads the WAL packet-by-packet instead of loading the whole file.
     */
    async recover(pager) {
        await this.init();
        const stats = await this.handle.stat();
        if (stats.size === 0) return;

        console.log("B\"H: Unclean shutdown detected. Streaming WAL recovery...");

        // We already have a handle, but let's strictly follow the read protocol
        // Close current handle to ensure clean read state
        await this.handle.close();
        
        const readHandle = await fs.open(this.path, 'r');

        const PACKET_SIZE = 6 + constants.BLOCK_SIZE;
        // B"H: FIX - Do NOT reuse a single buffer for async writes.
        // If writeRaw is slow, the next read might overwrite the buffer content before the write completes.
        // Although we await writeRaw, fs operations can hold references.
        // We will alloc a new buffer for the *read*, but copy data for the *write*.
        const buffer = Buffer.alloc(PACKET_SIZE);
        
        let recoveredCount = 0;
        let position = 0;

        try {
            while (true) {
                const { bytesRead } = await readHandle.read(buffer, 0, PACKET_SIZE, position);
                
                if (bytesRead === 0) break; // EOF
                if (bytesRead < PACKET_SIZE) {
                    console.warn("B\"H: Incomplete WAL packet detected at end of file. Discarding.");
                    break;
                }

                const blockId = readPointer48(buffer, 0);
                
                // B"H: COPY data to a new buffer to ensure no aliasing issues during writeRaw
                const data = Buffer.alloc(constants.BLOCK_SIZE);
                buffer.copy(data, 0, 6, 6 + constants.BLOCK_SIZE);

                // Replay
                await pager.writeRaw(blockId, data);
                
                position += PACKET_SIZE;
                recoveredCount++;
            }
        } finally {
            await readHandle.close();
        }

        console.log(`B\"H: Recovery Complete. Restored ${recoveredCount} blocks.`);
        
        // Re-open for business (r+)
        this.handle = await fs.open(this.path, 'r+');
        // Clear log only after successful replay
        await this.clear();
    }

    async close() {
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
    }
}

module.exports = WAL;
