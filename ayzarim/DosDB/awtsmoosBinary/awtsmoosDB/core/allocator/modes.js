// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[33mB"H [ALLOC] ${msg}\x1b[0m\n`); } catch(e) {}
}

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        // 1. Check Active Page
        if (this.allocator.activePage.id !== -1) {
            const block = this.allocator.activePage.buffer;
            
            if (block.readUInt32BE(0) === constants.BLOCK_TYPE.PAGE) {
                const startUnit = BitmapManager.findGap(block, unitsNeeded);
                if (startUnit !== -1) {
                    BitmapManager.mark(block, startUnit, unitsNeeded, true);
                    this.allocator.activePage.dirty = true;
                    // log(`Gap Found in Block ${this.allocator.activePage.id}, Unit ${startUnit}`);
                    return { blockId: this.allocator.activePage.id, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
                }
            } else {
                 this.allocator.activePage.id = -1; 
            }
            
            // log(`ActivePage ${this.allocator.activePage.id} Full. Flushing.`);
            await this.allocator.flush();
            this.allocator.activePage.id = -1;
        }

        // 2. Need new page.
        let newPageId = -1;
        if (this.allocator.freeBlocks.length > 0) {
            newPageId = this.allocator.freeBlocks.pop();
        } else {
            newPageId = this.allocator.cursor;
            this.allocator.cursor++;
        }
        
        // log(`Allocating NEW Page: ${newPageId}`);

        // 3. Setup New Active Page in RAM
        const newBlock = Buffer.allocUnsafe(this.allocator.BLOCK_SIZE);
        newBlock.fill(0);
        
        newBlock.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
        BitmapManager.markHeader(newBlock, this.allocator.HEADER_SIZE, this.allocator.UNIT_SIZE);
        
        const startUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);
        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
        
        this.allocator.activePage = {
            id: newPageId,
            buffer: newBlock,
            dirty: true 
        };
        
        this.allocator.updateSuperBlock(); 
        
        return { blockId: newPageId, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
    }

    async allocateLarge(units, size) {
        log(`Large Allocation Request: ${size} bytes`);
        await this.allocator.flush();

        const availablePerBlock = this.allocator.BLOCK_SIZE - this.allocator.HEADER_SIZE;
        const blocksNeeded = Math.ceil(size / availablePerBlock);
        
        const startBlock = this.allocator.cursor;
        this.allocator.cursor += blocksNeeded;

        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.allocator.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.allocator._writeBlockSynced(startBlock + i, blk);
        }
        
        this.allocator.updateSuperBlock();

        return { blockId: startBlock, offset: this.allocator.HEADER_SIZE, length: size, isChain: true };
    }
}

module.exports = AllocationModes;