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
        const protectedBlock = this.allocator.getProtectedBlockId();

        while (true) {
            // B"H: Sanctuary Check - Never allocate the Root Block
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
                this.allocator.log(`Allocating Page Block: ${searchPtr}`);
                this.allocator.cursor = searchPtr + 1;
                this.allocator.lastFreeHint = searchPtr + 1;
                const block = this.allocator.formatBlock(type);
                // Clear ghost data
                block.fill(0, this.allocator.HEADER_SIZE, this.allocator.BLOCK_SIZE);
                
                // B"H: Use synced write to update Cache + Disk
                await this.allocator._writeBlockSynced(searchPtr, block);
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
        const protectedBlock = this.allocator.getProtectedBlockId();

        while (true) {
            // B"H: Sanctuary Check - Never allocate the Root Block
            if (searchPtr === protectedBlock) {
                 searchPtr++;
                 if (searchPtr > this.allocator.MAX_BLOCKS) { 
                    if (looped) throw new Error("Disk Full");
                    searchPtr = 2; 
                    looped = true;
                }
                continue;
            }

            // B"H: Use synced read for type check to ensure we see cached page types
            const block = await this.allocator._readBlockSynced(searchPtr);
            const type = block ? block.readUInt32BE(0) : 0;
            
            if (type === 0 || type === constants.BLOCK_TYPE.FREE) {
                if (await this.isBlockTrulyFree(searchPtr)) {
                    const newBlock = this.allocator.formatBlock(constants.BLOCK_TYPE.PAGE);
                    newBlock.fill(0, this.allocator.HEADER_SIZE, this.allocator.BLOCK_SIZE);
                    
                    const startUnit = BitmapManager.findGap(newBlock, unitsNeeded);
                    // B"H: HEADER PROTECTION - startUnit MUST represent an offset >= HEADER_SIZE
                    // If startUnit is too small (e.g. 0 or 1), it means findGap thinks the header is free.
                    // We must force search past header.
                    const minUnit = Math.ceil(this.allocator.HEADER_SIZE / this.allocator.UNIT_SIZE);
                    
                    if (startUnit >= minUnit) {
                        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
                        await this.allocator._writeBlockSynced(searchPtr, newBlock);
                        
                        this.allocator.cursor = searchPtr; 
                        this.allocator.lastFreeHint = searchPtr;
                        await this.allocator._saveStateInternal();
                        
                        this.allocator.log(`Allocated Small: Block ${searchPtr}, Offset ${startUnit * this.allocator.UNIT_SIZE}`);
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
                        
                        // Redundant Check, but critical
                        if (startByte < this.allocator.HEADER_SIZE) throw new Error(`Allocator Error: Offset ${startByte} in Header`);
                        
                        // Clear space to prevent ghost data
                        block.fill(0, startByte, startByte + sizeBytes);

                        await this.allocator._writeBlockSynced(searchPtr, block);
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
            // Use synced write
            await this.allocator._writeBlockSynced(startBlock + i, blk);
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
        const protectedBlock = this.allocator.getProtectedBlockId();

        while (attempts < MAX_SCAN) {
            // B"H: Sanctuary Check
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
        // B"H: Use synced read to check cache state
        const block = await this.allocator._readBlockSynced(blockId);
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