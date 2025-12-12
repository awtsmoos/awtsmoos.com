
// B"H
/**
 * @module WAL
 * @description Write-Ahead Log Manager.
 * MEMORY SAFE VERSION: Streams recovery to allow infinite log sizes without OOM.
 * WINDOWS FIX: Uses 'r+' and MANUAL OFFSET TRACKING to avoid fs.stat lag overwrites.
 * BATCH SUPPORT: Adds skipSync for high-performance transactions.
 * LIGHTNING OPTIMIZATION: Uses writev for Zero-Copy scatter/gather writes.
 */

const fs = require('fs').promises;
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

class WAL {
    constructor(walPath) {
        this.path = walPath;
        this.handle = null;
        this.currentOffset = 0; // B"H: Manual offset tracking
        this.IOV_MAX = 500; // Conservative limit for writev vectors
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
            const stats = await this.handle.stat();
            this.currentOffset = stats.size;
        }
    }

    async log(blockId, data, skipSync = false) {
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

        // B"H: Use manual offset to ensure we never overwrite tail due to stat lag
        await this.handle.write(packet, 0, packet.length, this.currentOffset);
        this.currentOffset += packet.length;
        
        if (!skipSync) {
            await this.handle.sync();
        }
    }

    /**
     * B"H: Ultra-Fast Batch Logger (Zero-Copy)
     * Uses fs.writev to write multiple blocks without creating a massive buffer.
     */
    async logBatch(dirtyBlocksMap) {
        await this.init();
        if (dirtyBlocksMap.size === 0) return;

        // Sort keys for deterministic write order
        const sortedIds = Array.from(dirtyBlocksMap.keys()).sort((a,b) => a - b);
        const PACKET_SIZE = 6 + constants.BLOCK_SIZE;

        let i = 0;
        while (i < sortedIds.length) {
            // Process in chunks to respect IOV_MAX (OS limits on vector I/O)
            const end = Math.min(i + this.IOV_MAX, sortedIds.length);
            const chunkIds = sortedIds.slice(i, end);
            
            const iov = [];
            for (const blockId of chunkIds) {
                // 1. Header (Small allocation, fast)
                const header = Buffer.allocUnsafe(6);
                writePointer48(header, blockId, 0);
                iov.push(header);
                
                // 2. Data (Reference existing buffer, Zero Copy)
                let data = dirtyBlocksMap.get(blockId);
                if (data.length !== constants.BLOCK_SIZE) {
                    // Should theoretically not happen in Pager logic, but safety first
                    const padded = Buffer.alloc(constants.BLOCK_SIZE);
                    data.copy(padded);
                    data = padded;
                }
                iov.push(data);
            }

            // Scatter-Gather Write
            await this.handle.writev(iov, this.currentOffset);
            
            this.currentOffset += chunkIds.length * PACKET_SIZE;
            i = end;
        }

        await this.handle.sync();
    }

    async sync() {
        if (this.handle) {
            await this.handle.sync();
        }
    }

    async clear() {
        if (this.handle) {
            await this.handle.truncate(0);
            await this.handle.sync();
            this.currentOffset = 0;
        }
    }

    /**
     * Memory-Safe Recovery
     * Reads the WAL packet-by-packet instead of loading the whole file.
     */
    async recover(pager) {
        await this.init();
        const stats = await this.handle.stat(); // Initial check is fine
        if (stats.size === 0) return;

        console.log("B\"H: Unclean shutdown detected. Streaming WAL recovery...");

        // We already have a handle, but let's strictly follow the read protocol
        // Close current handle to ensure clean read state
        await this.handle.close();
        
        const readHandle = await fs.open(this.path, 'r');

        const PACKET_SIZE = 6 + constants.BLOCK_SIZE;
        // B"H: FIX - Do NOT reuse a single buffer for async writes.
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
        this.currentOffset = 0; // We are about to clear it
        
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
