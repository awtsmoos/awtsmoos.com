// B"H
/**
 * @module WAL
 * @description Write-Ahead Log Manager.
 * MEMORY SAFE VERSION: Streams recovery to allow infinite log sizes without OOM.
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
            this.handle = await fs.open(this.path, 'a+');
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

        await this.handle.write(packet);
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

        // Close 'append' handle and open 'read' handle for scanning
        await this.handle.close();
        const readHandle = await fs.open(this.path, 'r');

        const PACKET_SIZE = 6 + constants.BLOCK_SIZE;
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
                const data = buffer.subarray(6, 6 + constants.BLOCK_SIZE);

                // Replay
                await pager.writeRaw(blockId, data);
                
                position += PACKET_SIZE;
                recoveredCount++;
            }
        } finally {
            await readHandle.close();
        }

        console.log(`B\"H: Recovery Complete. Restored ${recoveredCount} blocks.`);
        
        // Re-open for business
        this.handle = await fs.open(this.path, 'a+');
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