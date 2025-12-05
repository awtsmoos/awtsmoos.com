// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocatePage(type = constants.BLOCK_TYPE.PAGE) {
        let searchPtr = Math.max(this.allocator.cursor, this.allocator.lastFreeHint);
        if (searchPtr < 2) searchPtr = 2;
        
        let looped = false;
        while (true) {
            if (await this.isBlockTrulyFree(searchPtr)) {
                this.allocator.log(`Allocating Page Block: ${searchPtr}`);
                this.allocator.cursor = searchPtr + 1;
                this.allocator.lastFreeHint = searchPtr + 1;
                const block = this.allocator.formatBlock(type);
                // Clear ghost data
                block.fill(0, this.allocator.HEADER_SIZE, this.allocator.BLOCK_SIZE);
                
                await this.allocator.pager.writeBlock(searchPtr, block);
                await this.allocator._saveStateInternal(); 
                return { blockId: searchPtr, offset: 0, length: this.allocator.BLOCK_SIZE, isChain: false };
            }
            searchPtr++;
            if (searchPtr > this.allocator.MAX_BLOCKS) {
                if (looped) throw new Error("Disk Full");
                searchPtr = 2;
                looped = true;
            }
        }
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        let searchPtr = Math.max(this.allocator.cursor, this.allocator.lastFreeHint);
        if (searchPtr < 2) searchPtr = 2;
        let looped = false;

        while (true) {
            const type = await this.allocator.pager.readBlockType(searchPtr);
            
            if (type === null || type === 0 || type === constants.BLOCK_TYPE.FREE) {
                if (await this.isBlockTrulyFree(searchPtr)) {
                    const block = this.allocator.formatBlock(constants.BLOCK_TYPE.PAGE);
                    block.fill(0, this.allocator.HEADER_SIZE, this.allocator.BLOCK_SIZE);
                    
                    const startUnit = BitmapManager.findGap(block, unitsNeeded);
                    if (startUnit > 0) {
                        BitmapManager.mark(block, startUnit, unitsNeeded, true);
                        await this.allocator.pager.writeBlock(searchPtr, block);
                        
                        this.allocator.cursor = searchPtr; 
                        this.allocator.lastFreeHint = searchPtr;
                        await this.allocator._saveStateInternal();
                        
                        this.allocator.log(`Allocated Small: Block ${searchPtr}, Offset ${startUnit * this.allocator.UNIT_SIZE}`);
                        return { blockId: searchPtr, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes }; 
                    }
                }
            } 
            else if (type === constants.BLOCK_TYPE.PAGE) {
                const block = await this.allocator.pager.readBlock(searchPtr);
                if (block) {
                    const startUnit = BitmapManager.findGap(block, unitsNeeded);
                    if (startUnit > 0) {
                        BitmapManager.mark(block, startUnit, unitsNeeded, true);
                        const startByte = startUnit * this.allocator.UNIT_SIZE;
                        if (startByte < this.allocator.HEADER_SIZE) throw new Error(`Allocator Error: Offset ${startByte} in Header`);
                        
                        // Clear space to prevent ghost data
                        block.fill(0, startByte, startByte + sizeBytes);

                        await this.allocator.pager.writeBlock(searchPtr, block);
                        this.allocator.cursor = searchPtr;
                        await this.allocator._saveStateInternal();
                        
                        this.allocator.log(`Allocated Small (Existing): Block ${searchPtr}, Offset ${startByte}`);
                        return { blockId: searchPtr, offset: startByte, length: sizeBytes };
                    }
                }
            }

            searchPtr++;
            if (searchPtr > this.allocator.MAX_BLOCKS) { 
                if (looped) throw new Error("Disk Full");
                searchPtr = 2; 
                looped = true;
            }
        }
    }

    async allocateLarge(units, size) {
        const availablePerBlock = this.allocator.BLOCK_SIZE - this.allocator.HEADER_SIZE;
        const blocksNeeded = Math.ceil(size / availablePerBlock);
        
        let startBlock = await this.findSequentialBlocks(blocksNeeded);
        this.allocator.log(`Allocating Large Chain: Start ${startBlock}, Count ${blocksNeeded}`);

        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.allocator.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.allocator.pager.writeBlock(startBlock + i, blk);
        }
        this.allocator.lastFreeHint = startBlock + blocksNeeded;
        if (this.allocator.lastFreeHint > this.allocator.cursor) this.allocator.cursor = this.allocator.lastFreeHint;
        await this.allocator._saveStateInternal();

        return { blockId: startBlock, offset: this.allocator.HEADER_SIZE, length: size, isChain: true };
    }

    async findSequentialBlocks(count) {
        let ptr = Math.max(this.allocator.cursor, this.allocator.lastFreeHint);
        if (ptr < 2) ptr = 2;
        let run = 0;
        let start = -1;
        const MAX_SCAN = 2000000; 
        let attempts = 0;
        while (attempts < MAX_SCAN) {
            if (await this.isBlockTrulyFree(ptr)) {
                if (run === 0) start = ptr;
                run++;
                if (run === count) return start;
            } else { run = 0; }
            ptr++; attempts++;
            if (ptr > this.allocator.MAX_BLOCKS) ptr = 2;
        }
        throw new Error("Disk Full - Could not find sequential blocks");
    }

    async isBlockTrulyFree(blockId) {
        const block = await this.allocator.pager.readBlock(blockId);
        if (!block) return true; 

        const type = block.readUInt32BE(0);
        if (type !== 0 && type !== constants.BLOCK_TYPE.FREE) return false;

        // Check Bitmap
        if (!BitmapManager.isEmpty(block)) return false;

        if (block[this.allocator.HEADER_SIZE] !== 0 || block[this.allocator.HEADER_SIZE+1] !== 0) return false;
        return true;
    }
}

module.exports = AllocationModes;
