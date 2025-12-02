// B"H
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

    async allocatePage() {
        const task = async () => {
            await this.semaphore.acquire();
            try {
                this.log(`Page Alloc -> Reserving Block ID`);
                let searchPtr = Math.max(this.cursor, this.lastFreeHint);
                if (searchPtr < 2) searchPtr = 2;
                while (true) {
                    const type = await this.pager.readBlockType(searchPtr);
                    if (type === null || type === constants.BLOCK_TYPE.FREE || type === 0) {
                        this.log(`Page Alloc -> Reserved ID ${searchPtr}`);
                        this.cursor = searchPtr + 1;
                        this.lastFreeHint = searchPtr + 1;
                        return { blockId: searchPtr, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
                    }
                    searchPtr++;
                    if (searchPtr > 1000000) throw new Error("Disk Full");
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
        while (true) {
            const type = await this.pager.readBlockType(searchPtr);
            
            if (type === null) {
                this.log(`Small Alloc -> New Block ${searchPtr}`);
                const block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                
                // Clear Data Area (32-4096), Preserve Header (0-32)
                block.fill(0, constants.HEADER_SIZE, constants.BLOCK_SIZE);
                
                const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
                const startUnit = this.findGap(bitmap, unitsNeeded);
                
                if (startUnit > 0) {
                    this.markBitmap(bitmap, startUnit, unitsNeeded, true);
                    await this.pager.writeBlock(searchPtr, block);
                    
                    // SELF VERIFY
                    // const check = await this.pager.readBlock(searchPtr);
                    // if (!check) console.error(`[Allocator] CRITICAL: Wrote block ${searchPtr} but read back null`);

                    this.cursor = searchPtr;
                    this.lastFreeHint = searchPtr;
                    // B"H: The Header is the Keter (Crown); do not overwrite it with the body.
			// Assuming units map to absolute block offsets, this relies on bitmap masking.
			// But for safety, ensure we never write to 0.
			return { blockId: searchPtr, offset: startUnit * constants.UNIT_SIZE, length: sizeBytes }; 
			// (If UNIT_SIZE is 32, this is effectively safe due to formatBlock masking, 
			// but adding a comment warning about UNIT_SIZE dependence is crucial).
                
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
            if (searchPtr > 1000000) searchPtr = 2; 
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
        const MAX_SCAN = 1000000; 
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
        throw new Error("Disk Full");
    }
    
    async free(ptr) {
         if (!ptr || ptr.length === 0) return;
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