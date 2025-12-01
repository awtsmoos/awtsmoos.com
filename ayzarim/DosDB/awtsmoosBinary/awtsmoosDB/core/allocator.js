// B"H
// The Allocator manages the Unified Storage.
// FINAL PRODUCTION VERSION: Includes State Persistence.

const constants = require('../constants.js');
const { writePointer48 } = require('../utils/binaryHelpers.js');

class Allocator {
    constructor(pager) {
	    this.pager = pager;
	    this.cursor = 1; 
	    
	    // OPTIMIZATION: Keep track of where we last found free space
	    this.lastFreeHint = 1; 
	    
	    // MUTEX: A promise chain to serialize async allocation requests
	    this.mutex = Promise.resolve();
	    this.semaphore = new (require('./concurrency.js'))(100);
	}

    /**
	 * Thread-Safe Allocation Wrapper
	 */
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

    async allocateSmall(unitsNeeded, sizeBytes) {
	    let searchPtr = Math.max(this.cursor, this.lastFreeHint);
	    const startCursor = searchPtr;
	    let hasWrapped = false;
	
	    while (true) {
	        const type = await this.pager.readBlockType(searchPtr);
	        
	        // EOF -> Expand
	        if (type === null) {
	            const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
	            await this.pager.writeBlock(searchPtr, block);
	            
	            this.cursor = searchPtr;
	            this.lastFreeHint = searchPtr;
	            
	            return {
                    blockId: searchPtr,
                    offset: constants.BITMAP_OFFSET + constants.BITMAP_SIZE,
                    length: sizeBytes
                };
	        }
	
	        if (type === constants.BLOCK_TYPE.FREE || type === constants.BLOCK_TYPE.PAGE) {
	            const block = await this.pager.readBlock(searchPtr);
	            const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	            const startUnit = this.findGap(bitmap, unitsNeeded);
	
	            if (startUnit > 0) {
	                this.markBitmap(bitmap, startUnit, unitsNeeded, true);
	                
	                if (type === constants.BLOCK_TYPE.FREE) {
	                    block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
	                }
	
	                await this.pager.writeBlock(searchPtr, block);
	                
	                this.lastFreeHint = searchPtr;
	                
	                return {
	                    blockId: searchPtr,
	                    offset: startUnit * constants.UNIT_SIZE,
	                    length: sizeBytes
	                };
	            }
	        }
	
	        searchPtr++;
	
	        if (searchPtr > (startCursor + 1000000) && !hasWrapped) {
	            searchPtr = 1;
	            hasWrapped = true;
	        }
	    }
	}

    async allocateLarge(unitsNeeded, sizeBytes) {
	    const DATA_PER_BLOCK = constants.BLOCK_SIZE - constants.UNIT_SIZE; 
	    const blocksNeeded = Math.ceil(sizeBytes / DATA_PER_BLOCK);
	    
	    let startBlock = await this.findSequentialBlocks(blocksNeeded);
	    
	    for (let i = 0; i < blocksNeeded; i++) {
	        const blk = this.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
	        blk.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	        await this.pager.writeBlock(startBlock + i, blk);
	    }
        
        this.lastFreeHint = startBlock + blocksNeeded;
        if (this.lastFreeHint > this.cursor) this.cursor = this.lastFreeHint;

	    return {
	        blockId: startBlock,
	        offset: constants.UNIT_SIZE, 
	        length: sizeBytes,
	        isChain: true 
	    };
	}
	
	async free(ptr) {
	    if (!ptr || ptr.length === 0) return;
	
	    if (!ptr.isChain) {
	        const task = async () => {
	             const block = await this.pager.readBlock(ptr.blockId);
	             if (!block) return; 
	             
	             const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	             
	             const startUnit = Math.floor(ptr.offset / constants.UNIT_SIZE);
	             const unitsUsed = Math.ceil(ptr.length / constants.UNIT_SIZE);
	             
	             this.markBitmap(bitmap, startUnit, unitsUsed, false);
	             await this.pager.writeBlock(ptr.blockId, block);
	             
	             if (ptr.blockId < this.lastFreeHint) {
	                 this.lastFreeHint = ptr.blockId;
	             }
	        };
	        this.mutex = this.mutex.then(task, task);
	        await this.mutex;
	    } 
	    else {
	        const task = async () => {
	            const DATA_PER_BLOCK = constants.BLOCK_SIZE - constants.UNIT_SIZE;
	            const blocksNeeded = Math.ceil(ptr.length / DATA_PER_BLOCK);
	            
	            for (let i = 0; i < blocksNeeded; i++) {
	                const blockId = ptr.blockId + i;
	                const block = await this.pager.readBlock(blockId);
	                if (block) {
	                    block.writeUInt32BE(constants.BLOCK_TYPE.FREE, 0);
	                    block.fill(0, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
	                    block[constants.BITMAP_OFFSET] = 0b10000000;
	                    await this.pager.writeBlock(blockId, block);
	                }
	            }
	             if (ptr.blockId < this.lastFreeHint) {
	                 this.lastFreeHint = ptr.blockId;
	             }
	        };
	        this.mutex = this.mutex.then(task, task);
	        await this.mutex;
	    }
	}
	
	/**
	 * Persists the current cursor location to the Superblock.
	 * Ensures next startup is O(1) instead of O(N).
	 */
	async saveState() {
	    // We need to write 'this.cursor' to the Superblock (Block 0)
	    // Offsets are defined in constants.SB_OFFSETS.NEXT_SEQ_BLOCK
	    
	    const sb = await this.pager.readBlock(0);
	    if (!sb) return; // Should not happen in initialized DB
	    
	    // Write the Cursor (High Water Mark)
	    writePointer48(sb, this.cursor, constants.SB_OFFSETS.NEXT_SEQ_BLOCK);
	    
	    // Note: We could also save 'lastFreeHint' if we reserved a spot for it in SB.
	    // For now, restoring Cursor prevents the massive scan. Hint can reset to Cursor.
	    
	    await this.pager.writeBlock(0, sb);
	}

    // --- Helpers ---

    formatBlock(type) {
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        buf[constants.BITMAP_OFFSET] = 0b10000000;
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
            if (val) {
                bitmap[byteIndex] |= (1 << (7 - bitIndex));
            } else {
                bitmap[byteIndex] &= ~(1 << (7 - bitIndex));
            }
        }
    }

    async findSequentialBlocks(count) {
	    let ptr = Math.max(this.cursor, this.lastFreeHint);
	    let run = 0;
	    let start = -1;
	    
	    const stats = await this.pager.handle.stat({ bigint: true });
	    const totalBlocksBig = (stats.size + BigInt(constants.BLOCK_SIZE) - 1n) / BigInt(constants.BLOCK_SIZE);
	    const totalBlocks = Number(totalBlocksBig);

	    const MAX_SCAN = totalBlocks + count + 10000; 
	
	    while (true) {
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
	        
	        if (ptr > MAX_SCAN && ptr > 100000000) { 
	             throw new Error("B\"H: DB Size Limit Exceeded (Sanity Check)");
	        }
	    }
	}
}

module.exports = Allocator;