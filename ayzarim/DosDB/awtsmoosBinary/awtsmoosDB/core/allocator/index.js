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
        // B"H: Block Cache to ensure Bitmap Consistency
        this.blockCache = new Map();
        this.MAX_CACHE_SIZE = 1000; 
        
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = constants.HEADER_SIZE || 64; 
        
        // B"H: FIX - Hardcode Offsets to prevent collision
        // Root Pointer is at 64. Cursor MUST be elsewhere (128).
        this.CURSOR_OFFSET = 128; 
        this.ROOT_PTR_OFFSET = 64; 
        
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

    // --- Cache Management & Internal Synced IO (No Lock) ---

    _cacheBlock(blockId, buffer) {
        if (this.blockCache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.blockCache.keys().next().value;
            this.blockCache.delete(firstKey);
        }
        const cached = Buffer.alloc(this.BLOCK_SIZE);
        buffer.copy(cached);
        this.blockCache.set(blockId, cached);
    }

    _getCachedBlock(blockId) {
        if (this.blockCache.has(blockId)) {
            const cached = this.blockCache.get(blockId);
            const copy = Buffer.alloc(this.BLOCK_SIZE);
            cached.copy(copy);
            return copy;
        }
        return null;
    }

    // INTERNAL: Read that checks cache first, then disk. Updates cache.
    async _readBlockSynced(blockId) {
        const cached = this._getCachedBlock(blockId);
        if (cached) return cached;

        const block = await this.pager.readBlock(blockId);
        if (block) this._cacheBlock(blockId, block);
        return block;
    }

    // INTERNAL: Write that updates cache first, then disk.
    async _writeBlockSynced(blockId, buffer) {
        this._cacheBlock(blockId, buffer);
        await this.pager.writeBlock(blockId, buffer);
    }

    // --- Public Locked Methods ---

    async readBlockLocked(blockId) {
        return this.executeLocked(() => this._readBlockSynced(blockId));
    }

    async writeBlockLocked(blockId, buffer) {
        return this.executeLocked(() => this._writeBlockSynced(blockId, buffer));
    }

    async readSequentialLocked(start, count) {
        return this.executeLocked(async () => {
            if (count === 1) {
                const b = await this._readBlockSynced(start);
                return b;
            }
            
            const buffer = await this.pager.readSequential(start, count);
            
            for(let i=0; i<count; i++) {
                const bid = start + i;
                if (this.blockCache.has(bid)) {
                    const cached = this.blockCache.get(bid);
                    cached.copy(buffer, i * this.BLOCK_SIZE);
                }
            }
            
            return buffer;
        });
    }

    /**
     * B"H: Atomic SuperBlock Update.
     */
    async updateSuperBlock(modifierFn) {
        return this.executeLocked(async () => {
            // Read fresh from pager
            let sb = await this.pager.readBlock(0);
            if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
            
            const magic = "AwtsmoosDB_V1B\"H";
            if (sb.toString('utf8', 0, magic.length) !== magic) {
                sb.write(magic, 0);
            }

            this.superBlockCache = sb;

            if (modifierFn) modifierFn(this.superBlockCache);
            
            writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
            
            this.log(`Updating SuperBlock. Cursor: ${this.cursor}`);
            await this.pager.writeBlock(0, this.superBlockCache);
        });
    }

    // B"H: Sanctuary Safety Mechanism
    getProtectedBlockId() {
        if (!this.superBlockCache) return -1;
        // Read Root Pointer (BlockId) from offset 64
        return readPointer48(this.superBlockCache, this.ROOT_PTR_OFFSET);
    }

    allocate(sizeBytes) {
        return this.executeLocked(async () => {
            const effectiveSize = Math.max(1, sizeBytes); 
            const unitsNeeded = Math.ceil(effectiveSize / this.UNIT_SIZE);
            const maxUnits = Math.floor((this.BLOCK_SIZE - this.HEADER_SIZE) / this.UNIT_SIZE);
            
            if (unitsNeeded <= maxUnits) {
                return await this.modes.allocateSmall(unitsNeeded, sizeBytes);
            }
            return await this.modes.allocateLarge(unitsNeeded, sizeBytes);
        });
    }

    writeUserSpace(ptr, data) {
        if (ptr.isChain) throw new Error("B\"H: writeUserSpace only supports single-block shared writes.");

        return this.executeLocked(async () => {
            if (ptr.offset < this.HEADER_SIZE) throw new Error(`B"H: Critical - Attempt to write into Header Space!`);
            if (ptr.offset + data.length > this.BLOCK_SIZE) throw new Error(`Write overflow in writeUserSpace.`);

            // Use Synced Read
            let block = await this._readBlockSynced(ptr.blockId);
            
            const existingType = block ? block.readUInt32BE(0) : 0;
            
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
            
            // Use Synced Write
            await this._writeBlockSynced(ptr.blockId, block);
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
                     // Clear cache + Write disk
                     await this._writeBlockSynced(ptr.blockId + i, cleanBuf);
                 }
                 return;
             }

             const block = await this._readBlockSynced(ptr.blockId);
             if (block) {
                 const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
                 const unitsUsed = Math.ceil(ptr.length / this.UNIT_SIZE);
                 
                 BitmapManager.mark(block, startUnit, unitsUsed, false);
                 
                 await this._writeBlockSynced(ptr.blockId, block);
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

    async _saveStateInternal() {
        let sb = await this.pager.readBlock(0);
        if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
        
        const magic = "AwtsmoosDB_V1B\"H";
        if (sb.toString('utf8', 0, magic.length) !== magic) {
            sb.write(magic, 0);
        }

        this.superBlockCache = sb;
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        
        this.log(`_saveStateInternal: Persisting Cursor ${this.cursor}`);
        await this.pager.writeBlock(0, this.superBlockCache);
    }
}
module.exports = Allocator;