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
    }

    log(msg) {
        // console.log(`[Pager] ${msg}`);
    }

    async init() {
        if (!this.handle) {
            try {
                await fs.access(this.filePath);
            } catch {
                await fs.writeFile(this.filePath, Buffer.alloc(0));
            }
            this.handle = await fs.open(this.filePath, 'r+');
            await this.wal.init();
            await this.wal.recover(this);
        }
    }

    async readBlock(blockId) {
        await this.init();
        const buffer = Buffer.alloc(constants.BLOCK_SIZE);
        
        // SAFE CONVERSION: BigInt -> Number
        // blockId * 4096 is well within MAX_SAFE_INTEGER
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        // Remove 'stat' check to rely on fs.read behavior at EOF
        const { bytesRead } = await this.handle.read(buffer, 0, constants.BLOCK_SIZE, offset);
        
        if (bytesRead === 0) return null;
        return buffer;
    }
    
    async readBlockType(blockId) {
        await this.init();
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        const buffer = Buffer.alloc(4); 
        const { bytesRead } = await this.handle.read(buffer, 0, 4, offset);
        
        if (bytesRead < 4) return null; 
        return buffer.readUInt32BE(0);
    }

    async readSequential(startBlockId, numberOfBlocks) {
        await this.init();
        const totalSize = numberOfBlocks * constants.BLOCK_SIZE;
        const buffer = Buffer.alloc(totalSize);
        const offset = Number(BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE));

        await this.handle.read(buffer, 0, totalSize, offset);
        return buffer;
    }

    async writeBlock(blockId, buffer) {
        await this.init();
        
        let writeBuffer = buffer;
        if (buffer.length !== constants.BLOCK_SIZE) {
            writeBuffer = Buffer.alloc(constants.BLOCK_SIZE);
            buffer.copy(writeBuffer);
        }

        // B"H: WAL guarantees durability.
        await this.wal.log(blockId, writeBuffer);

        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        
        const { bytesWritten } = await this.handle.write(writeBuffer, 0, constants.BLOCK_SIZE, offset);
        
        // B"H: PERFORMANCE FIX - Removed await this.handle.sync();
        // The WAL is synced. The main file relies on OS cache until Checkpoint.

        if (bytesWritten !== constants.BLOCK_SIZE) {
            console.error(`[Pager] Partial Write: Wrote ${bytesWritten} of ${constants.BLOCK_SIZE} bytes.`);
        }
    }
    
    async writeRaw(blockId, buffer) {
        const offset = Number(BigInt(blockId) * BigInt(constants.BLOCK_SIZE));
        await this.handle.write(buffer, 0, constants.BLOCK_SIZE, offset);
        // B"H: writeRaw is used by WAL recovery. We don't strictly need to sync every block during recovery either,
        // but it is safer to leave it or rely on a final sync at the end of recovery.
        // For consistency with writeBlock, we remove immediate sync here too.
    }

    /**
     * B"H: Safety Checkpoint
     * Syncs main DB and clears WAL.
     */
    async checkpoint() {
        if (this.handle) {
            await this.handle.sync(); // Ensure all data is physically on disk
        }
        await this.wal.clear(); // Safe to wipe log now
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