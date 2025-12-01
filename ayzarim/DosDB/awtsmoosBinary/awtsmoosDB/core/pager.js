// B"H
// The Pager handles physical I/O.
// It abstracts the file into a sequence of 4KB Blocks.
// Includes BigInt Offsets (281PB support) and WAL Integration.

const fs = require('fs').promises;
const constants = require('../constants.js');
const WAL = require('./wal.js');

class Pager {
    constructor(filePath) {
        this.filePath = filePath;
        this.walPath = filePath + ".wal"; // Convention: dbname.wal
        this.handle = null;
        this.wal = new WAL(this.walPath);
    }

    /**
     * Initializes the file handle and recovers from WAL if needed.
     */
    async init() {
        if (!this.handle) {
            try {
                await fs.access(this.filePath);
            } catch {
                await fs.writeFile(this.filePath, Buffer.alloc(0));
            }
            this.handle = await fs.open(this.filePath, 'r+');
            
            // Initialize WAL and Recover if crash occurred
            await this.wal.init();
            await this.wal.recover(this);
        }
    }

    /**
     * Reads a specific block ID using BigInt offsets.
     */
    async readBlock(blockId) {
        await this.init();
        const buffer = Buffer.alloc(constants.BLOCK_SIZE);
        
        // BigInt Offset for >9PB support
        const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
        
        const stat = await this.handle.stat();
        if (offset >= stat.size) return null;

        const { bytesRead } = await this.handle.read(buffer, 0, constants.BLOCK_SIZE, offset);
        
        if (bytesRead === 0) return null;
        return buffer;
    }
    
    /**
     * Optimized Header Read for Allocator.
     */
    async readBlockType(blockId) {
	    await this.init();
	    const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
	    
	    const stat = await this.handle.stat(); 
	    if (offset >= stat.size) return null;

	    const buffer = Buffer.alloc(4); 
	    const { bytesRead } = await this.handle.read(buffer, 0, 4, offset);
	    
	    if (bytesRead < 4) return null; 
	    return buffer.readUInt32BE(0);
	}

    /**
     * Reads a continuous range of blocks.
     */
    async readSequential(startBlockId, numberOfBlocks) {
        await this.init();
        const totalSize = numberOfBlocks * constants.BLOCK_SIZE;
        const buffer = Buffer.alloc(totalSize);
        const offset = BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE);

        await this.handle.read(buffer, 0, totalSize, offset);
        return buffer;
    }

    /**
     * Safe Write: Logs to WAL -> Syncs WAL -> Writes to DB -> Clears WAL.
     */
    async writeBlock(blockId, buffer) {
        await this.init();
        if (buffer.length > constants.BLOCK_SIZE) {
            throw new Error(`B"H: Buffer size ${buffer.length} exceeds Block Size`);
        }

        const writeBuffer = (buffer.length === constants.BLOCK_SIZE)
            ? buffer
            : Buffer.concat([buffer, Buffer.alloc(constants.BLOCK_SIZE - buffer.length)]);

        // 1. Write-Ahead Log
        await this.wal.log(blockId, writeBuffer);

        // 2. Write to DB
        await this.writeRaw(blockId, writeBuffer);
        
        // 3. Clear WAL
        await this.wal.clear();
    }
    
    /**
     * Internal: Writes directly to DB file. 
     * Used by writeBlock (after logging) and WAL.recover (during replay).
     */
    async writeRaw(blockId, buffer) {
        // Offset Calculation
        const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
        await this.handle.write(buffer, 0, constants.BLOCK_SIZE, offset);
        
        // Sync DB file to ensure data is physical before we clear the WAL
        await this.handle.sync(); 
    }

    /**
     * Clean up handles
     */
    async close() {
        if (this.handle) {
            await this.handle.close();
            this.handle = null;
        }
        await this.wal.close();
    }
}

module.exports = Pager;