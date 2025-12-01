// B"H
// Allocator.js - Restored Logging + Safe Logic

const constants = require('../constants.js');
const { writePointer48 } = require('../utils/binaryHelpers.js');

class Allocator {
    constructor(pager) {
	    this.pager = pager;
	    this.cursor = 2; 
	    this.lastFreeHint = 2; 
	    this.mutex = Promise.resolve();
	    this.semaphore = new (require('./concurrency.js'))(100);
	}

    log(msg) {
        console.log(`[Allocator] ${msg}`);
    }

	allocate(sizeBytes) {
	    const task = async () => {
	        await this.semaphore.acquire();
	        try {
		        const effectiveSize = Math.max(1, sizeBytes); 
		        const unitsNeeded = Math.ceil(effectiveSize / constants.UNIT_SIZE);
		        
                // Restored Log:
                this.log(`Allocate Request: ${sizeBytes} bytes (${unitsNeeded} units)`);

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

    async allocateSmall(unitsNeeded, sizeBytes) {
	    let searchPtr = Math.max(this.cursor, this.lastFreeHint);
	    if (searchPtr < 2) searchPtr = 2;
	    const startCursor = searchPtr;
	    let hasWrapped = false;
	
	    while (true) {
	        const type = await this.pager.readBlockType(searchPtr);
	        
	        if (type === null) {
                // Restored Log:
                this.log(`Small Alloc -> New Block ${searchPtr}`);
	            const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                const startUnit = this.findGap(bitmap, unitsNeeded);
                
                if (startUnit > 0) {
                    this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                    await this.pager.writeBlock(searchPtr, block);
                    this.cursor = searchPtr;
                    this.lastFreeHint = searchPtr;
                    return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes };
                }
	        } else if (type === constants.BLOCK_TYPE.FREE || type === constants.BLOCK_TYPE.PAGE) {
	            const block = await this.pager.readBlock(searchPtr);
	            const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	            const startUnit = this.findGap(bitmap, unitsNeeded);
	
	            if (startUnit > 0) {
	                this.markBitmap(bitmap, startUnit, unitsNeeded, true);
	                if (type === constants.BLOCK_TYPE.FREE) block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
	                await this.pager.writeBlock(searchPtr, block);
	                this.lastFreeHint = searchPtr;
	                return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes };
	            }
	        }
	        searchPtr++;
	        if (searchPtr > (startCursor + 1000000) && !hasWrapped) { searchPtr = 2; hasWrapped = true; }
	    }
	}

    async allocateLarge(unitsNeeded, sizeBytes) {
	    const DATA_PER_BLOCK = constants.BLOCK_SIZE - constants.UNIT_SIZE; 
	    const blocksNeeded = Math.ceil(sizeBytes / DATA_PER_BLOCK);
	    
        this.log(`Large Alloc Needed: ${blocksNeeded} blocks`);

	    let startBlock = await this.findSequentialBlocks(blocksNeeded);
        
        this.log(`Large Alloc Found Start: ${startBlock}`);
	    
	    for (let i = 0; i < blocksNeeded; i++) {
	        const blk = this.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            // Mark all units as used in bitmap to prevent small allocations stealing space
	        blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	        await this.pager.writeBlock(startBlock + i, blk);
	    }
        
        this.lastFreeHint = startBlock + blocksNeeded;
        if (this.lastFreeHint > this.cursor) this.cursor = this.lastFreeHint;

	    return { blockId: startBlock, offset: constants.UNIT_SIZE, length: sizeBytes, isChain: true };
	}

    async findSequentialBlocks(count) {
	    let ptr = Math.max(this.cursor, this.lastFreeHint);
	    if (ptr < 2) ptr = 2;

	    let run = 0;
	    let start = -1;
	    const MAX_SCAN = 1000000; 
	    let attempts = 0;
	
	    while (attempts < MAX_SCAN) {
	        const type = await this.pager.readBlockType(ptr);
	        const isFree = (type === null || type === 0 || type === constants.BLOCK_TYPE.FREE); 
	
	        if (isFree) {
	            if (run === 0) start = ptr;
	            run++;
	            if (run === count) return start;
	        } else {
	            run = 0;
	        }
	        ptr++;
            attempts++;
	    }
        throw new Error("Disk Full or Fragmented");
	}
	
	async free(ptr) {
        if (!ptr || ptr.length === 0) return;
        this.log(`Freeing Block ${ptr.blockId}`);
        // ... (Logic remains standard, ensuring file not empty)
         const task = async () => {
             const block = await this.pager.readBlock(ptr.blockId);
             if (block) {
                 const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                 const startUnit = Math.floor(ptr.offset / constants.UNIT_SIZE);
                 const unitsUsed = Math.ceil(ptr.length / constants.UNIT_SIZE);
                 this.markBitmap(bitmap, startUnit, unitsUsed, false);
                 await this.pager.writeBlock(ptr.blockId, block);
             }
         };
         this.mutex = this.mutex.then(task, task);
         await this.mutex;
	}
	
	async saveState() {
	    const sb = await this.pager.readBlock(0);
	    if (!sb) return; 
	    writePointer48(sb, this.cursor, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
	    await this.pager.writeBlock(0, sb);
	}

    formatBlock(type) {
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        buf[constants.BITMAP_OFFSET] = 0b10000000; // Reserve header
        return buf;
    }

    findGap(bitmap, count) {
        let run = 0;
        let start = -1;
        for (let i = 0; i < 128; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            const isUsed = (bitmap[byteIndex] >> (7 - bitIndex)) & 1;

            if (!isUsed) {
                if (run === 0) start = i;
                run++;
                if (run === count) return start;
            } else run = 0;
        }
        return -1;
    }

    markBitmap(bitmap, start, count, val) {
        for (let i = 0; i < count; i++) {
            const idx = start + i;
            const byteIndex = Math.floor(idx / 8);
            const bitIndex = idx % 8;
            if (val) bitmap[byteIndex] |= (1 << (7 - bitIndex));
            else bitmap[byteIndex] &= ~(1 << (7 - bitIndex));
        }
    }
}

module.exports = Allocator;