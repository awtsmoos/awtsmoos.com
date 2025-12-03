// B"H
const constants = require('../constants.js');
const { writePointer48 } = require('../utils/binaryHelpers.js');

class Allocator {
    constructor(pager) {
        this.pager = pager;
        this.cursor = 2; 
        this.lastFreeHint = 2; 
        this.mutex = Promise.resolve();
        // Concurrency 1 is mandatory for bitmap safety
        this.semaphore = new (require('./concurrency.js'))(1);
        
        // B"H: Strict Constants Enforcement
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        
        // Paranoid Header Size: Force 64 bytes (2 units) to ensure no overlap with Bitmap/Metadata
        this.HEADER_SIZE = 64; 
    }

    log(msg) { 
        // console.log(`[Allocator] ${msg}`); 
    }

    /**
     * Executes a function within the allocator's lock.
     */
    async executeLocked(fn) {
        const task = async () => {
            await this.semaphore.acquire();
            try {
                return await fn();
            } finally {
                this.semaphore.release();
            }
        };
        this.mutex = this.mutex.then(task, task);
        return this.mutex;
    }

    /**
     * Locked IO Helpers for external consumers (Page, Collection)
     */
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
            // Paranoid Check: Ensure we aren't writing to the Header
            if (ptr.offset < this.HEADER_SIZE) {
                throw new Error(`B"H: Critical - Attempt to write into Header Space! Block ${ptr.blockId}, Offset ${ptr.offset}`);
            }
            
            if (ptr.offset + data.length > this.BLOCK_SIZE) {
                throw new Error(`Write overflow in writeUserSpace. Block ${ptr.blockId}, Offset ${ptr.offset}, Len ${data.length}`);
            }

            // Verify Block Integrity before write
            const existingType = await this.pager.readBlockType(ptr.blockId);
            if (existingType !== constants.BLOCK_TYPE.PAGE && existingType !== constants.BLOCK_TYPE.COLLECTION_HEADER && existingType !== constants.BLOCK_TYPE.COLLECTION_PAGE) {
                 if (existingType === constants.BLOCK_TYPE.FREE || existingType === 0) {
                     // B"H: If the block is free, it means 'allocate' failed to persist the block initialization,
                     // or there is a race condition.
                     throw new Error(`B"H: Critical - Attempt to write to FREE block ${ptr.blockId}`);
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
            this.log(`Page Alloc -> Reserving Block ID for Type ${type}`);
            let searchPtr = Math.max(this.cursor, this.lastFreeHint);
            if (searchPtr < 2) searchPtr = 2;
            
            let looped = false;
            while (true) {
                const existingType = await this.pager.readBlockType(searchPtr);
                if (existingType === null || existingType === constants.BLOCK_TYPE.FREE || existingType === 0) {
                    this.log(`Page Alloc -> Reserved ID ${searchPtr}`);
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
            writePointer48(sb, this.cursor, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
            await this.pager.writeBlock(0, sb);
        });
    }

    // Internal methods must NOT use executeLocked as they are called within it
    async allocateSmall(unitsNeeded, sizeBytes) {
        let searchPtr = 2; 
        let looped = false;

        while (true) {
            const type = await this.pager.readBlockType(searchPtr);
            
            // Case 1: New Block (Free)
            if (type === null || type === 0 || type === constants.BLOCK_TYPE.FREE) {
                this.log(`Small Alloc -> New Block ${searchPtr}`);
                const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                
                // Zero out user space (after header) for NEW blocks
                block.fill(0, this.HEADER_SIZE, this.BLOCK_SIZE);
                
                const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                
                // Alloc starts at unit 2 (units 0,1 are header)
                const startUnit = this.findGap(bitmap, unitsNeeded);
                
                if (startUnit > 0) {
                    this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                    await this.pager.writeBlock(searchPtr, block);
                    return { blockId: searchPtr, offset: startUnit * this.UNIT_SIZE, length: sizeBytes }; 
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
                        
                        if (startByte < this.HEADER_SIZE) {
                             throw new Error(`B"H: Allocator calculated startByte ${startByte} inside Header Region!`);
                        }
                        
                        // B"H: FIX - DO NOT ZERO OUT DATA FOR EXISTING SHARED BLOCKS.
                        // Zeroing here introduces a race condition where we might overwrite
                        // data written by a parallel operation if our `readBlock` was slightly stale
                        // or if the write pipeline is interleaved.
                        // The `writeUserSpace` function will overwrite this region with actual data anyway.
                        
                        await this.pager.writeBlock(searchPtr, block);
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
            const type = await this.pager.readBlockType(ptr);
            const isFree = (type === null || type === 0 || type === constants.BLOCK_TYPE.FREE); 
            if (isFree) {
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
        
        // Header units = 2 (64 bytes / 32)
        const headerUnits = Math.ceil(this.HEADER_SIZE / this.UNIT_SIZE);
        
        const bitmap = buf.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        // Mark first N units as used (Header space)
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
