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
    }

    log(msg) { console.log(`[Allocator] ${msg}`); }

    allocate(sizeBytes) {
        const task = async () => {
            await this.semaphore.acquire();
            try {
                const effectiveSize = Math.max(1, sizeBytes); 
                const unitsNeeded = Math.ceil(effectiveSize / constants.UNIT_SIZE);
                if (unitsNeeded <= (constants.UNITS_PER_BLOCK - 1)) {
                    return await this.allocateSmall(unitsNeeded, sizeBytes);
                }
                return await this.allocateLarge(unitsNeeded, sizeBytes);
            } finally {
                this.semaphore.release();
            }
        };
        this.mutex = this.mutex.then(task, task); 
        return this.mutex;
    }

    writeUserSpace(ptr, data) {
        if (ptr.isChain) {
             throw new Error("B\"H: writeUserSpace only supports single-block shared writes.");
        }

        const task = async () => {
            await this.semaphore.acquire();
            try {
                const block = await this.pager.readBlock(ptr.blockId);
                if (!block) throw new Error(`Block ${ptr.blockId} missing during write`);
                
                if (ptr.offset + data.length > constants.BLOCK_SIZE) {
                    throw new Error(`Write overflow in writeUserSpace. Block ${ptr.blockId}, Offset ${ptr.offset}, Len ${data.length}`);
                }

                data.copy(block, ptr.offset);
                await this.pager.writeBlock(ptr.blockId, block);
            } finally {
                this.semaphore.release();
            }
        };
        this.mutex = this.mutex.then(task, task);
        return this.mutex;
    }

    async allocatePage(type = constants.BLOCK_TYPE.PAGE) {
        const task = async () => {
            await this.semaphore.acquire();
            try {
                this.log(`Page Alloc -> Reserving Block ID for Type ${type}`);
                let searchPtr = Math.max(this.cursor, this.lastFreeHint);
                if (searchPtr < 2) searchPtr = 2;
                while (true) {
                    const existingType = await this.pager.readBlockType(searchPtr);
                    if (existingType === null || existingType === constants.BLOCK_TYPE.FREE || existingType === 0) {
                        this.log(`Page Alloc -> Reserved ID ${searchPtr}`);
                        this.cursor = searchPtr + 1;
                        this.lastFreeHint = searchPtr + 1;
                        const block = this.formatBlock(type);
                        await this.pager.writeBlock(searchPtr, block);
                        return { blockId: searchPtr, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
                    }
                    searchPtr++;
                    if (searchPtr > 1000000) throw new Error("Disk Full or Allocator Loop");
                }
            } finally {
                this.semaphore.release();
            }
        };
        this.mutex = this.mutex.then(task, task);
        return this.mutex;
    }

    async saveState() {
        const sb = await this.pager.readBlock(0);
        if (!sb) return; 
        writePointer48(sb, this.cursor, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
        await this.pager.writeBlock(0, sb);
    }

    async allocateSmall(unitsNeeded, sizeBytes) {
        let searchPtr = Math.max(this.cursor, this.lastFreeHint);
        if (searchPtr < 2) searchPtr = 2;
        let looped = false;

        while (true) {
            const type = await this.pager.readBlockType(searchPtr);
            
            if (type === null) {
                // End of file found, create new PAGE
                this.log(`Small Alloc -> New Block ${searchPtr}`);
                const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                block.fill(0, constants.HEADER_SIZE, constants.BLOCK_SIZE);
                
                const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                // Ensure Header is marked
                bitmap[0] |= 0x80;

                const startUnit = this.findGap(bitmap, unitsNeeded);
                
                if (startUnit > 0) {
                    this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                    await this.pager.writeBlock(searchPtr, block);
                    
                    this.cursor = searchPtr;
                    this.lastFreeHint = searchPtr;
                    return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes }; 
                }
            } else if (type === constants.BLOCK_TYPE.PAGE) {
                const block = await this.pager.readBlock(searchPtr);
                if (block) {
                    const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                    const startUnit = this.findGap(bitmap, unitsNeeded);
        
                    if (startUnit > 0) {
                        this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                        
                        const startByte = startUnit * constants.UNIT_SIZE;
                        const endByte = startByte + (unitsNeeded * constants.UNIT_SIZE);
                        block.fill(0, startByte, endByte);

                        await this.pager.writeBlock(searchPtr, block);
                        this.lastFreeHint = searchPtr;
                        return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes };
                    }
                }
            } else if (type === constants.BLOCK_TYPE.FREE) {
                // Convert Free to Page
                const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                block.fill(0, constants.HEADER_SIZE, constants.BLOCK_SIZE);
                const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                const startUnit = this.findGap(bitmap, unitsNeeded);
                
                if (startUnit > 0) {
                     this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                     await this.pager.writeBlock(searchPtr, block);
                     this.lastFreeHint = searchPtr;
                     return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes };
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
        const DATA_PER_BLOCK = constants.BLOCK_SIZE - constants.UNIT_SIZE; 
        const blocksNeeded = Math.ceil(size / DATA_PER_BLOCK);
        let startBlock = await this.findSequentialBlocks(blocksNeeded);
        for (let i = 0; i < blocksNeeded; i++) {
            const blk = this.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
            await this.pager.writeBlock(startBlock + i, blk);
        }
        this.lastFreeHint = startBlock + blocksNeeded;
        if (this.lastFreeHint > this.cursor) this.cursor = this.lastFreeHint;
        return { blockId: startBlock, offset: constants.UNIT_SIZE, length: size, isChain: true };
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
         // Do not free chains here (omitted for brevity/safety in this context)
         if (ptr.isChain) return;

         const task = async () => {
             await this.semaphore.acquire();
             try {
                 const block = await this.pager.readBlock(ptr.blockId);
                 if (block) {
                     const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                     const startUnit = Math.floor(ptr.offset / constants.UNIT_SIZE);
                     // Calculate units used based on *allocated* length (which we don't strictly track, but use ptr.length)
                     // Critical: ptr.length is data length. Units used is ceil(length/32).
                     const unitsUsed = Math.ceil(ptr.length / constants.UNIT_SIZE);
                     
                     this.markBitmap(bitmap, startUnit, unitsUsed, false);
                     await this.pager.writeBlock(ptr.blockId, block);
                 }
             } finally {
                 this.semaphore.release();
             }
         };
         this.mutex = this.mutex.then(task, task);
         await this.mutex;
    }

    formatBlock(type) {
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        buf[constants.BITMAP_OFFSET] = 0x80; // Reserve Unit 0 for Header
        return buf;
    }

    findGap(bitmap, count) {
        let run = 0;
        let start = -1;
        // Constants: 16 bytes * 8 = 128 bits
        const maxBits = constants.BITMAP_SIZE * 8;
        
        for (let i = 0; i < maxBits; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            
            // Check bit
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