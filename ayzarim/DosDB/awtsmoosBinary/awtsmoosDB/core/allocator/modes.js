
// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');

class AllocationModes {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async allocatePage(type = constants.BLOCK_TYPE.PAGE) {
        // B"H: Optimization - Check Free Stack first (O(1))
        while (this.allocator.freeBlockStack.length > 0) {
            const recycledId = this.allocator.freeBlockStack.pop();
            // Validate it's still free (race condition safety, though executedLocked prevents this)
            if (await this.isBlockTrulyFree(recycledId)) {
                // this.allocator.log(`Allocating Recycled Block: ${recycledId}`);
                const block = this.allocator.formatBlock(type);
                await this.allocator._writeBlockSynced(recycledId, block);
                // Don't need to save state cursor for recycled blocks
                return { blockId: recycledId, offset: 0, length: this.allocator.BLOCK_SIZE, isChain: false };
            }
        }

        let searchPtr = Math.max(this.allocator.cursor, this.allocator.lastFreeHint);
        if (searchPtr < 2) searchPtr = 2;
        
        let looped = false;
        const protectedBlock = this.allocator.getProtectedBlockId();
        let attempts = 0;

        while (true) {
            attempts++;
            if (attempts > 50000) throw new Error(`B"H Allocator Timed Out: Disk Full or Corruption. Searched ${attempts} blocks.`);

            if (searchPtr === protectedBlock) {
                searchPtr++;
                if (searchPtr > this.allocator.MAX_BLOCKS) {
                    if (looped) throw new Error("Disk Full");
                    searchPtr = 2;
                    looped = true;
                }
                continue;
            }

            if (await this.isBlockTrulyFree(searchPtr)) {
                // If we extended the file, update cursor
                if (searchPtr >= this.allocator.cursor) {
                    this.allocator.cursor = searchPtr + 1;
                    this.allocator.lastFreeHint = searchPtr + 1;
                } else {
                    // Update hint to next block
                    this.allocator.lastFreeHint = searchPtr + 1;
                }

                const block = this.allocator.formatBlock(type);
                await this.allocator._writeBlockSynced(searchPtr, block);
                
                // Only sync metadata if cursor moved (file grew)
                if (searchPtr + 1 > this.allocator.cursor) {
                     await this.allocator._saveStateInternal();
                }
                
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
        // Optimization: Try to use existing PAGE blocks first before taking new ones
        // But for simplicity/speed, we scan. 
        // TODO: Keep a separate 'partialPage' cache.
        
        if (searchPtr < 2) searchPtr = 2;
        let looped = false;
        const protectedBlock = this.allocator.getProtectedBlockId();
        let attempts = 0;

        while (true) {
            attempts++;
            if (attempts > 50000) throw new Error(`B"H Allocator Timed Out: Disk Full or Corruption. Searched ${attempts} blocks.`);

            if (searchPtr === protectedBlock) {
                 searchPtr++;
                 if (searchPtr > this.allocator.MAX_BLOCKS) { 
                    if (looped) throw new Error("Disk Full");
                    searchPtr = 2; 
                    looped = true;
                }
                continue;
            }

            // B"H: Short Circuit - If beyond cursor, it's definitely free.
            let block = null;
            let type = 0;
            
            if (searchPtr < this.allocator.cursor) {
                block = await this.allocator._readBlockSynced(searchPtr);
                type = block ? block.readUInt32BE(0) : 0;
            } else {
                // Virtual Free Block
                type = constants.BLOCK_TYPE.FREE;
            }
            
            if (type === 0 || type === constants.BLOCK_TYPE.FREE) {
                if (await this.isBlockTrulyFree(searchPtr)) {
                    const newBlock = this.allocator.formatBlock(constants.BLOCK_TYPE.PAGE);
                    // formatBlock already zeroes and marks header
                    
                    const startUnit = BitmapManager.findGap(newBlock, unitsNeeded);
                    const minUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);
                    
                    if (startUnit >= minUnit) {
                        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
                        await this.allocator._writeBlockSynced(searchPtr, newBlock);
                        
                        if (searchPtr >= this.allocator.cursor) {
                            this.allocator.cursor = searchPtr + 1;
                            this.allocator.lastFreeHint = searchPtr + 1;
                            await this.allocator._saveStateInternal();
                        }
                        
                        return { blockId: searchPtr, offset: startUnit * this.allocator.UNIT_SIZE, length: sizeBytes }; 
                    }
                }
            } 
            else if (type === constants.BLOCK_TYPE.PAGE) {
                if (block) {
                    const startUnit = BitmapManager.findGap(block, unitsNeeded);
                    const minUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);

                    if (startUnit >= minUnit) {
                        BitmapManager.mark(block, startUnit, unitsNeeded, true);
                        const startByte = startUnit * this.allocator.UNIT_SIZE;
                        
                        if (startByte < this.allocator.HEADER_SIZE) throw new Error(`Allocator Error: Offset ${startByte} in Header`);
                        
                        block.fill(0, startByte, startByte + sizeBytes);

                        await this.allocator._writeBlockSynced(searchPtr, block);
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

        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.allocator.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.allocator._writeBlockSynced(startBlock + i, blk);
        }
        
        if (startBlock + blocksNeeded > this.allocator.cursor) {
            this.allocator.cursor = startBlock + blocksNeeded;
            this.allocator.lastFreeHint = this.allocator.cursor;
            await this.allocator._saveStateInternal();
        }

        return { blockId: startBlock, offset: this.allocator.HEADER_SIZE, length: size, isChain: true };
    }

    async findSequentialBlocks(count) {
        let ptr = Math.max(this.allocator.cursor, this.allocator.lastFreeHint);
        if (ptr < 2) ptr = 2;
        let run = 0;
        let start = -1;
        const MAX_SCAN = 2000000; 
        let attempts = 0;
        const protectedBlock = this.allocator.getProtectedBlockId();

        while (attempts < MAX_SCAN) {
            if (ptr === protectedBlock) {
                 run = 0;
                 ptr++;
                 attempts++;
                 if (ptr > this.allocator.MAX_BLOCKS) ptr = 2;
                 continue;
            }

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
        // B"H: Optimization - Implicitly free if new territory
        if (blockId >= this.allocator.cursor) return true;

        const block = await this.allocator._readBlockSynced(blockId);
        if (!block) return true; 

        const type = block.readUInt32BE(0);
        if (type !== 0 && type !== constants.BLOCK_TYPE.FREE) return false;

        // Check Bitmap
        if (!BitmapManager.isEmpty(block)) return false;

        // Double check custom fields? Not needed if Type is FREE/0
        return true;
    }
}

module.exports = AllocationModes;
