
// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocatePage(type = constants.BLOCK_TYPE.PAGE) {
        // 1. Try Free Stack (O(1))
        if (this.allocator.freeBlocks.length > 0) {
            const recycledId = this.allocator.freeBlocks.pop();
            const block = this.allocator.formatBlock(type);
            await this.allocator._writeBlockSynced(recycledId, block);
            return { blockId: recycledId, offset: 0, length: this.allocator.BLOCK_SIZE, isChain: false };
        }

        // 2. Append (O(1))
        const newBlockId = this.allocator.cursor;
        const block = this.allocator.formatBlock(type);
        await this.allocator._writeBlockSynced(newBlockId, block);
        this.allocator.cursor++;
        await this.allocator._saveStateInternal();
        
        return { blockId: newBlockId, offset: 0, length: this.allocator.BLOCK_SIZE, isChain: false };
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        // B"H: LIGHTNING STRATEGY
        // 1. Check Active Page (In Memory)
        
        if (this.allocator.activePage.id !== -1) {
            const block = this.allocator.activePage.buffer;
            // Verify it's a PAGE type (should be, unless corrupted or manually manipulated)
            if (block.readUInt32BE(0) === constants.BLOCK_TYPE.PAGE) {
                const startUnit = BitmapManager.findGap(block, unitsNeeded);
                if (startUnit !== -1) {
                    // Success! No disk I/O.
                    BitmapManager.mark(block, startUnit, unitsNeeded, true);
                    block.fill(0, startUnit * this.allocator.UNIT_SIZE, (startUnit * this.allocator.UNIT_SIZE) + sizeBytes);
                    this.allocator.activePage.dirty = true; // Mark for flush later
                    return { blockId: this.allocator.activePage.id, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
                }
            }
            // Active page full. Flush it.
            await this.allocator.flush();
            this.allocator.activePage.id = -1;
        }

        // 2. Need new page.
        // Try Free Stack first to fill holes
        let newPageId = -1;
        
        if (this.allocator.freeBlocks.length > 0) {
            newPageId = this.allocator.freeBlocks.pop();
        } else {
            newPageId = this.allocator.cursor;
            this.allocator.cursor++;
            await this.allocator._saveStateInternal();
        }

        // 3. Setup New Active Page
        const newBlock = this.allocator.formatBlock(constants.BLOCK_TYPE.PAGE);
        const startUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);
        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
        
        // Load into RAM buffer
        this.allocator.activePage = {
            id: newPageId,
            buffer: newBlock,
            dirty: true 
        };
        
        // Note: We don't write to disk yet! 
        // We wait for flush() or page full. This enables bulk insert speed.
        
        return { blockId: newPageId, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
    }

    async allocateLarge(units, size) {
        // Large allocations always flush active page to be safe and sequential
        await this.allocator.flush();

        const availablePerBlock = this.allocator.BLOCK_SIZE - this.allocator.HEADER_SIZE;
        const blocksNeeded = Math.ceil(size / availablePerBlock);
        
        const startBlock = this.allocator.cursor;
        this.allocator.cursor += blocksNeeded;
        await this.allocator._saveStateInternal();

        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.allocator.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.allocator._writeBlockSynced(startBlock + i, blk);
        }

        return { blockId: startBlock, offset: this.allocator.HEADER_SIZE, length: size, isChain: true };
    }
}

module.exports = AllocationModes;
