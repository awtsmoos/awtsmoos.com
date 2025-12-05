// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');
const AllocationModes = require('./modes.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class Allocator {
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        this.cursor = 2; 
        this.lastFreeHint = 2; 
        this.mutex = Promise.resolve();
        this.semaphore = new (require('../concurrency.js'))(1);
        this.initialized = false;
        
        this.superBlockCache = null;
        
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = constants.HEADER_SIZE || 64; 
        this.CURSOR_OFFSET = constants.SB_OFFSETS?.NEXT_SEQ_BLOCK || 128; 
        this.MAX_BLOCKS = Number.MAX_SAFE_INTEGER; 

        // Sub-modules
        this.modes = new AllocationModes(this);
    }

    log(msg) { 
        if(this.db && this.db.debug) console.log(`[Allocator] ${msg}`); 
    }

    async init() {
        if (this.initialized) return;
        
        const sb = await this.pager.readBlock(0);
        if (sb) {
            this.superBlockCache = Buffer.alloc(this.BLOCK_SIZE);
            sb.copy(this.superBlockCache);

            const savedCursor = readPointer48(sb, this.CURSOR_OFFSET); 
            this.log(`Init: Read Saved Cursor: ${savedCursor}`);

            if (savedCursor > 2 && savedCursor < this.MAX_BLOCKS) {
                this.cursor = savedCursor;
                this.lastFreeHint = savedCursor;
            } else {
                this.cursor = 2;
                this.lastFreeHint = 2;
            }
        } else {
            this.superBlockCache = this.formatBlock(constants.BLOCK_TYPE.SUPERBLOCK || 1);
            const magic = "AwtsmoosDB_V1B\"H";
            this.superBlockCache.write(magic, 0);
            this.cursor = 2;
            this.lastFreeHint = 2;
            await this.pager.writeBlock(0, this.superBlockCache);
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

    async readSequentialLocked(start, count) {
        return this.executeLocked(() => this.pager.readSequential(start, count));
    }

    /**
     * B"H: Atomic SuperBlock Update.
     * Ensures strict ordering of Root Pointer updates vs Free operations.
     */
    async updateSuperBlock(modifierFn) {
        return this.executeLocked(async () => {
            // B"H: Always read fresh from Pager/WAL to avoid stale cache overwrites
            let sb = await this.pager.readBlock(0);
            if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
            
            // Validate Magic
            const magic = "AwtsmoosDB_V1B\"H";
            if (sb.toString('utf8', 0, magic.length) !== magic) {
                sb.write(magic, 0);
            }

            this.superBlockCache = sb;

            if (modifierFn) modifierFn(this.superBlockCache);
            
            // Always update cursor
            writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
            
            // Critical: Write and Sync
            this.log(`Updating SuperBlock. Cursor: ${this.cursor}`);
            await this.pager.writeBlock(0, this.superBlockCache);
        });
    }

    allocate(sizeBytes) {
        return this.executeLocked(async () => {
            const effectiveSize = Math.max(1, sizeBytes); 
            const unitsNeeded = Math.ceil(effectiveSize / this.UNIT_SIZE);
            const maxUnits = Math.floor((this.BLOCK_SIZE - this.HEADER_SIZE) / this.UNIT_SIZE);
            
            let result;
            if (unitsNeeded <= maxUnits) {
                result = await this.modes.allocateSmall(unitsNeeded, sizeBytes);
            } else {
                result = await this.modes.allocateLarge(unitsNeeded, sizeBytes);
            }
            return result;
        });
    }

    writeUserSpace(ptr, data) {
        if (ptr.isChain) throw new Error("B\"H: writeUserSpace only supports single-block shared writes.");

        return this.executeLocked(async () => {
            if (ptr.offset < this.HEADER_SIZE) throw new Error(`B"H: Critical - Attempt to write into Header Space!`);
            if (ptr.offset + data.length > this.BLOCK_SIZE) throw new Error(`Write overflow in writeUserSpace.`);

            let block = await this.pager.readBlock(ptr.blockId);
            const existingType = await this.pager.readBlockType(ptr.blockId);
            
            // Initialization
            if (!block || existingType === 0 || existingType === constants.BLOCK_TYPE.FREE) {
                 this.log(`WARN: Writing to uninitialized block ${ptr.blockId}. Initializing.`);
                 if (!block) block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                 else {
                     block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
                     BitmapManager.markHeader(block, this.HEADER_SIZE, this.UNIT_SIZE);
                 }
            }

            // Self-Healing Bitmap
            const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
            const unitsUsed = Math.ceil(data.length / this.UNIT_SIZE);
            
            if (!BitmapManager.check(block, startUnit, unitsUsed)) {
                this.log(`WARN: Bitmap Desync detected at Block ${ptr.blockId}. Self-Healing bits ${startUnit}-${startUnit+unitsUsed}.`);
                BitmapManager.mark(block, startUnit, unitsUsed, true);
            }

            data.copy(block, ptr.offset);
            await this.pager.writeBlock(ptr.blockId, block);
        });
    }

    async free(ptr) {
         if (!ptr || ptr.length === 0) return;

         return this.executeLocked(async () => {
             this.log(`Freeing ${ptr.blockId}:${ptr.offset} (Len ${ptr.length})`);
             if (ptr.isChain) {
                 const availablePerBlock = this.BLOCK_SIZE - this.HEADER_SIZE;
                 const blocksUsed = Math.ceil(ptr.length / availablePerBlock);
                 for (let i = 0; i < blocksUsed; i++) {
                     const cleanBuf = Buffer.alloc(this.BLOCK_SIZE);
                     await this.pager.writeBlock(ptr.blockId + i, cleanBuf);
                 }
                 return;
             }

             const block = await this.pager.readBlock(ptr.blockId);
             if (block) {
                 const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
                 const unitsUsed = Math.ceil(ptr.length / this.UNIT_SIZE);
                 
                 BitmapManager.mark(block, startUnit, unitsUsed, false);
                 await this.pager.writeBlock(ptr.blockId, block);
             }
         });
    }

    // Redirects to modes
    async allocatePage(type) { return this.modes.allocatePage(type); }
    async findSequentialBlocks(count) { return this.modes.findSequentialBlocks(count); }
    async isBlockTrulyFree(blockId) { return this.modes.isBlockTrulyFree(blockId); }

    formatBlock(type) {
        const buf = Buffer.alloc(this.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        BitmapManager.markHeader(buf, this.HEADER_SIZE, this.UNIT_SIZE);
        return buf;
    }

    async saveState() {
        return this.executeLocked(async () => { await this._saveStateInternal(); });
    }

    /**
     * B"H: Internal Save State.
     * MUST be called while holding the lock (e.g., from AllocationModes).
     */
    async _saveStateInternal() {
        // Always read fresh from Pager/WAL to avoid stale cache overwrites
        let sb = await this.pager.readBlock(0);
        if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
        
        // Validate Magic
        const magic = "AwtsmoosDB_V1B\"H";
        if (sb.toString('utf8', 0, magic.length) !== magic) {
            sb.write(magic, 0);
        }

        this.superBlockCache = sb;

        // Persist Cursor
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        
        // Critical: Write and Sync
        this.log(`_saveStateInternal: Persisting Cursor ${this.cursor}`);
        await this.pager.writeBlock(0, this.superBlockCache);
    }
}
module.exports = Allocator;