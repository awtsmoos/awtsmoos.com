// B"H
const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('../utils/binaryHelpers.js');

class Allocator {
    constructor(pager) {
        this.pager = pager;
        this.cursor = 2; 
        this.lastFreeHint = 2; 
        this.mutex = Promise.resolve();
        this.semaphore = new (require('./concurrency.js'))(1);
        this.initialized = false;
        
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = 64; 
    }

    log(msg) { 
        // console.log(`[Allocator] ${msg}`); 
    }

    async init() {
        if (this.initialized) return;
        
        // Load State from SuperBlock (Block 0)
        const sb = await this.pager.readBlock(0);
        if (sb) {
            // Read Cursor
            const savedCursor = readPointer48(sb, constants.SB_OFFSETS.NEXT_SEQ_BLOCK || 6); 
            if (savedCursor > 2) {
                this.cursor = savedCursor;
                this.lastFreeHint = savedCursor;
            }
        }
        this.initialized = true;
    }

    async executeLocked(fn) {
        const task = async () => {
            await this.semaphore.acquire();
            try {
                if (!this.initialized) await this.init();
                return await fn();
            } finally {
                this.semaphore.release();
            }
        };
        this.mutex = this.mutex.then(task, task);
        return this.mutex;
    }

    async readBlockLocked(blockId) {
        return this.executeLocked(() => this.pager.readBlock(blockId));
    }

    async writeBlockLocked(blockId, buffer) {
        return this.executeLocked(() => this.pager.writeBlock(blockId, buffer));
    }
    
    async readSequentialLocked(startBlockId, numberOfBlocks) {
        return this.executeLocked(() => this.pager.readSequential(startBlockId, numberOfBlocks));
    }

    allocate(sizeBytes) {
        return this.executeLocked(async () => {
            const effectiveSize = Math.max(1, sizeBytes); 
            const unitsNeeded = Math.ceil(effectiveSize / this.UNIT_SIZE);
            const maxUnits = Math.floor((this.BLOCK_SIZE - this.HEADER_SIZE) / this.UNIT_SIZE);
            
            if (unitsNeeded <= maxUnits) {
                return await this.allocateSmall(unitsNeeded, sizeBytes);
            }
            return await this.allocateLarge(unitsNeeded, sizeBytes);
        });
    }

    writeUserSpace(ptr, data) {
        if (ptr.isChain) {
             throw new Error("B\"H: writeUserSpace only supports single-block shared writes.");
        }

        return this.executeLocked(async () => {
            if (ptr.offset < this.HEADER_SIZE) {
                throw new Error(`B"H: Critical - Attempt to write into Header Space! Block ${ptr.blockId}, Offset ${ptr.offset}`);
            }
            
            if (ptr.offset + data.length > this.BLOCK_SIZE) {
                throw new Error(`Write overflow in writeUserSpace. Block ${ptr.blockId}, Offset ${ptr.offset}, Len ${data.length}`);
            }

            const existingType = await this.pager.readBlockType(ptr.blockId);
            if (existingType !== constants.BLOCK_TYPE.PAGE && existingType !== constants.BLOCK_TYPE.COLLECTION_HEADER && existingType !== constants.BLOCK_TYPE.COLLECTION_PAGE) {
                 if (existingType === constants.BLOCK_TYPE.FREE || existingType === 0) {
                     // B"H: Allow write if we just allocated it (race condition safety), 
                     // but verify verification is done in allocateSmall.
                     // Actually, if we are here, we own the pointer.
                 }
            }

            const block = await this.pager.readBlock(ptr.blockId);
            if (!block) throw new Error(`Block ${ptr.blockId} missing during write`);
            
            data.copy(block, ptr.offset);
            await this.pager.writeBlock(ptr.blockId, block);
        });
    }

    async allocatePage(type = constants.BLOCK_TYPE.PAGE) {
        return this.executeLocked(async () => {
            let searchPtr = Math.max(this.cursor, this.lastFreeHint);
            if (searchPtr < 2) searchPtr = 2;
            
            let looped = false;
            while (true) {
                // B"H: Use isBlockTrulyFree check
                if (await this.isBlockTrulyFree(searchPtr)) {
                    this.cursor = searchPtr + 1;
                    this.lastFreeHint = searchPtr + 1;
                    const block = this.formatBlock(type);
                    await this.pager.writeBlock(searchPtr, block);
                    return { blockId: searchPtr, offset: 0, length: this.BLOCK_SIZE, isChain: false };
                }
                searchPtr++;
                if (searchPtr > 1000000) {
                    if (looped) throw new Error("Disk Full");
                    searchPtr = 2;
                    looped = true;
                }
            }
        });
    }

    async saveState() {
        return this.executeLocked(async () => {
            let sb = await this.pager.readBlock(0);
            if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
            writePointer48(sb, this.cursor, constants.SB_OFFSETS.NEXT_SEQ_BLOCK || 6);
            await this.pager.writeBlock(0, sb);
        });
    }

    // Checks if a block is effectively free. 
    // Reads header AND verifies content to avoid overwriting valid data.
    async isBlockTrulyFree(blockId) {
        const type = await this.pager.readBlockType(blockId);
        if (type !== null && type !== 0 && type !== constants.BLOCK_TYPE.FREE) return false;

        // B"H: Safety Check - Read full block to ensure it's actually empty
        const block = await this.pager.readBlock(blockId);
        if (!block) return true; // File short, block doesn't exist

        // Scan for non-zero bytes to detect orphaned data
        for (let i = 0; i < block.length; i++) {
            if (block[i] !== 0) return false; // Contains data, treat as used
        }
        return true;
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        let searchPtr = Math.max(this.cursor, this.lastFreeHint);
        if (searchPtr < 2) searchPtr = 2;
        let looped = false;

        while (true) {
            const type = await this.pager.readBlockType(searchPtr);
            
            // Case 1: New Block (Free)
            if (type === null || type === 0 || type === constants.BLOCK_TYPE.FREE) {
                // B"H: Verify it's actually free before wiping
                if (await this.isBlockTrulyFree(searchPtr)) {
                    const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                    block.fill(0, this.HEADER_SIZE, this.BLOCK_SIZE);
                    
                    const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                    const startUnit = this.findGap(bitmap, unitsNeeded);
                    
                    if (startUnit > 0) {
                        this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                        await this.pager.writeBlock(searchPtr, block);
                        
                        this.cursor = searchPtr; 
                        this.lastFreeHint = searchPtr;
                        return { blockId: searchPtr, offset: startUnit * this.UNIT_SIZE, length: sizeBytes }; 
                    }
                }
            } 
            // Case 2: Existing Page
            else if (type === constants.BLOCK_TYPE.PAGE) {
                const block = await this.pager.readBlock(searchPtr);
                if (block) {
                    const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                    const startUnit = this.findGap(bitmap, unitsNeeded);
        
                    if (startUnit > 0) {
                        this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                        const startByte = startUnit * this.UNIT_SIZE;
                        if (startByte < this.HEADER_SIZE) throw new Error(`B"H: Allocator calculated startByte ${startByte} inside Header Region!`);
                        
                        await this.pager.writeBlock(searchPtr, block);
                        this.cursor = searchPtr;
                        return { blockId: searchPtr, offset: startByte, length: sizeBytes };
                    }
                }
            }

            searchPtr++;
            if (searchPtr > 1000000) { 
                if (looped) throw new Error("Disk Full");
                searchPtr = 2; 
                looped = true;
            }
        }
    }

    async allocateLarge(units, size) {
        const DATA_PER_BLOCK = this.BLOCK_SIZE - this.UNIT_SIZE; 
        const blocksNeeded = Math.ceil(size / DATA_PER_BLOCK);
        let startBlock = await this.findSequentialBlocks(blocksNeeded);
        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.pager.writeBlock(startBlock + i, blk);
        }
        this.lastFreeHint = startBlock + blocksNeeded;
        if (this.lastFreeHint > this.cursor) this.cursor = this.lastFreeHint;
        return { blockId: startBlock, offset: this.UNIT_SIZE, length: size, isChain: true };
    }

    async findSequentialBlocks(count) {
        let ptr = Math.max(this.cursor, this.lastFreeHint);
        if (ptr < 2) ptr = 2;
        let run = 0;
        let start = -1;
        const MAX_SCAN = 100000; 
        let attempts = 0;
        while (attempts < MAX_SCAN) {
             // B"H: Use isBlockTrulyFree
            if (await this.isBlockTrulyFree(ptr)) {
                if (run === 0) start = ptr;
                run++;
                if (run === count) return start;
            } else { run = 0; }
            ptr++; attempts++;
        }
        throw new Error("Disk Full - Could not find sequential blocks");
    }
    
    async free(ptr) {
         if (!ptr || ptr.length === 0) return;
         if (ptr.isChain) return;

         return this.executeLocked(async () => {
             const block = await this.pager.readBlock(ptr.blockId);
             if (block) {
                 const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                 const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
                 const unitsUsed = Math.ceil(ptr.length / this.UNIT_SIZE);
                 
                 this.markBitmap(bitmap, startUnit, unitsUsed, false);
                 await this.pager.writeBlock(ptr.blockId, block);
             }
         });
    }

    formatBlock(type) {
        const buf = Buffer.alloc(this.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        const headerUnits = Math.ceil(this.HEADER_SIZE / this.UNIT_SIZE);
        const bitmap = buf.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        this.markBitmap(bitmap, 0, headerUnits, true);
        return buf;
    }

    findGap(bitmap, count) {
        let run = 0;
        let start = -1;
        const maxBits = constants.BITMAP_SIZE * 8;
        
        for (let i = 0; i < maxBits; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            const isUsed = (bitmap[byteIndex] >> (7 - bitIndex)) & 1;
            if (!isUsed) {
                if (run === 0) start = i;
                run++;
                if (run === count) return start;
            } else {
                run = 0; 
            }
        }
        return -1;
    }

    markBitmap(bitmap, start, count, val) {
        for (let i = 0; i < count; i++) {
            const idx = start + i;
            const byteIndex = Math.floor(idx / 8);
            const bitIndex = idx % 8;
            if (byteIndex < constants.BITMAP_SIZE) {
                if (val) bitmap[byteIndex] |= (1 << (7 - bitIndex));
                else bitmap[byteIndex] &= ~(1 << (7 - bitIndex));
            }
        }
    }
}
module.exports = Allocator;