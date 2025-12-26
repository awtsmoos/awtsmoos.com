
// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        // B"H: LIGHTNING STRATEGY - RAM ONLY
        
        // 1. Check Active Page
        if (this.allocator.activePage.id !== -1) {
            const block = this.allocator.activePage.buffer;
            
            // Verify valid PAGE - must have PAGE magic to prevent corruption of other block types
            if (block.readUInt32BE(0) === constants.BLOCK_TYPE.PAGE) {
                const startUnit = BitmapManager.findGap(block, unitsNeeded);
                if (startUnit !== -1) {
                    BitmapManager.mark(block, startUnit, unitsNeeded, true);
                    block.fill(0, startUnit * this.allocator.UNIT_SIZE, (startUnit * this.allocator.UNIT_SIZE) + sizeBytes);
                    this.allocator.activePage.dirty = true;
                    return { blockId: this.allocator.activePage.id, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
                }
            } else {
                // Active page invalid type (shouldn't happen but defensive)
                this.allocator.activePage.id = -1; 
            }
            
            // Active page full or invalid. Flush.
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

        // 3. Setup New Active Page in RAM
        // B"H: Use Buffer.alloc (Zeroed) to prevent garbage pointers
        const newBlock = Buffer.alloc(this.allocator.BLOCK_SIZE);
        newBlock.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
        BitmapManager.markHeader(newBlock, this.allocator.HEADER_SIZE, this.allocator.UNIT_SIZE);
        
        const startUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);
        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
        
        this.allocator.activePage = {
            id: newPageId,
            buffer: newBlock,
            dirty: true 
        };
        
        return { blockId: newPageId, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
    }

    async allocateLarge(units, size) {
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

        return { blockId: startBlock, offset: this.allocator.HEADER_SIZE, length: size, isChain: true };
    }
}

module.exports = AllocationModes;
