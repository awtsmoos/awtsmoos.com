
// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');

function log(msg) {
    // require('../../utils/centralLogger.js').log("[ALLOC]", msg);
}

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        if (this.allocator.activePage.id !== -1) {
            const block = this.allocator.activePage.buffer;
            
            if (block.readUInt32BE(0) === constants.BLOCK_TYPE.PAGE) {
                const startUnit = BitmapManager.findGap(block, unitsNeeded);
                if (startUnit !== -1) {
                    BitmapManager.mark(block, startUnit, unitsNeeded, true);
                    this.allocator.activePage.dirty = true;
                    return { blockId: this.allocator.activePage.id, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes };
                }
            } else {
                 this.allocator.activePage.id = -1; 
            }
            
            await this.allocator.flush();
            this.allocator.activePage.id = -1;
        }

        let newPageId = -1;
        if (this.allocator.freeBlocks.length > 0) {
            newPageId = this.allocator.freeBlocks.pop();
        } else {
            newPageId = this.allocator.cursor;
            this.allocator.cursor++;
        }
        
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
