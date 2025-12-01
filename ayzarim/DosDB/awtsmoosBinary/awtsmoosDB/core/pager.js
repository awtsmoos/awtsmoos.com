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
        const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
        
        const stat = await this.handle.stat();
        if (offset >= stat.size) {
            return null;
        }

        const { bytesRead } = await this.handle.read(buffer, 0, constants.BLOCK_SIZE, offset);
        
        if (bytesRead === 0) return null;
        
        return buffer;
    }
    
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

    async readSequential(startBlockId, numberOfBlocks) {
        await this.init();
        const totalSize = numberOfBlocks * constants.BLOCK_SIZE;
        const buffer = Buffer.alloc(totalSize);
        const offset = BigInt(startBlockId) * BigInt(constants.BLOCK_SIZE);

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

        await this.wal.log(blockId, writeBuffer);

        const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
        await this.handle.write(writeBuffer, 0, constants.BLOCK_SIZE, offset);
        
        await this.handle.sync();
    }
    
    async writeRaw(blockId, buffer) {
        const offset = BigInt(blockId) * BigInt(constants.BLOCK_SIZE);
        await this.handle.write(buffer, 0, constants.BLOCK_SIZE, offset);
        await this.handle.sync(); 
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