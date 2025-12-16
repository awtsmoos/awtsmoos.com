
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
        this.semaphore = new (require('../concurrency.js'))();
        this.initialized = false;
        
        this.superBlockCache = null;
        this.blockCache = new Map();
        
        // B"H: Active Page Buffer
        // Keeps the current block in memory to aggregate small writes.
        this.activePage = { id: -1, buffer: null, dirty: false };
        
        // B"H: Runtime Free Stack
        // Tracks blocks freed during this session for immediate reuse.
        this.freeBlocks = []; 
        
        this.MAX_CACHE_SIZE = 5000; 
        
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = constants.HEADER_SIZE || 64; 
        
        this.CURSOR_OFFSET = 128; 
        this.ROOT_PTR_OFFSET = 64; 
        
        this.MAX_BLOCKS = Number.MAX_SAFE_INTEGER; 
        this.modes = new AllocationModes(this);
    }

    log(msg) { 
        if(this.db && this.db.debug) console.log(`[Allocator] ${msg}`); 
    }

    async init() {
        if (this.initialized) return;
        
        const sb = await this.pager.readBlock(0);
        if (sb) {
            this.superBlockCache = Buffer.allocUnsafe(this.BLOCK_SIZE);
            sb.copy(this.superBlockCache);

            const savedCursor = readPointer48(sb, this.CURSOR_OFFSET); 
            // B"H: Safety check for cursor validity
            if (savedCursor >= 2 && savedCursor < this.MAX_BLOCKS) {
                this.cursor = savedCursor;
            } else {
                if (this.db.debug) console.warn(`B"H Allocator: Resetting invalid cursor (${savedCursor}) to 2.`);
                this.cursor = 2;
            }
        } else {
            this.superBlockCache = this.formatBlock(constants.BLOCK_TYPE.SUPERBLOCK || 1);
            const magic = "AwtsmoosDB_V1B\"H";
            this.superBlockCache.write(magic, 0);
            this.cursor = 2;
            await this.pager.writeBlock(0, this.superBlockCache);
        }
        this.initialized = true;
    }

    async executeLocked(fn) {
        return this.semaphore.runWrite(async () => {
            if (!this.initialized) await this.init();
            return await fn();
        });
    }

    // B"H: Flush Active Page to Disk
    async flush() {
        if (this.activePage.dirty && this.activePage.id !== -1 && this.activePage.buffer) {
            // B"H: CRITICAL FIX - Update Cache before writing to Disk
            // This prevents readSequential from overlaying stale cache data onto fresh disk data.
            this._cacheBlock(this.activePage.id, this.activePage.buffer);
            
            // Write to pager (which might be batched)
            await this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
            this.activePage.dirty = false;
        }
    }

    _cacheBlock(blockId, buffer) {
        if (this.blockCache.has(blockId)) {
            this.blockCache.delete(blockId);
        } else if (this.blockCache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.blockCache.keys().next().value;
            this.blockCache.delete(firstKey);
        }
        const cached = Buffer.allocUnsafe(this.BLOCK_SIZE);
        buffer.copy(cached);
        this.blockCache.set(blockId, cached);
    }

    _getCachedBlock(blockId) {
        if (this.blockCache.has(blockId)) {
            const cached = this.blockCache.get(blockId);
            this.blockCache.delete(blockId);
            this.blockCache.set(blockId, cached);
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            cached.copy(copy);
            return copy;
        }
        return null;
    }

    async _readBlockSynced(blockId) {
        // B"H: Check Active Page first (Fastest)
        if (this.activePage.id === blockId && this.activePage.buffer) {
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            this.activePage.buffer.copy(copy);
            return copy;
        }

        const cached = this._getCachedBlock(blockId);
        if (cached) return cached;
        const block = await this.pager.readBlock(blockId);
        if (block) this._cacheBlock(blockId, block);
        return block;
    }

    async _writeBlockSynced(blockId, buffer) {
        // B"H: Write to Active Page Buffer if matches
        if (this.activePage.id === blockId) {
            buffer.copy(this.activePage.buffer);
            this.activePage.dirty = true;
            // B"H: Also update cache to keep them in sync, 
            // though readSequentialLocked prefers activePage anyway.
            this._cacheBlock(blockId, buffer);
            return;
        }
        
        // Cache update
        this._cacheBlock(blockId, buffer);
        await this.pager.writeBlock(blockId, buffer);
    }

    async readBlockLocked(blockId) {
        return this.executeLocked(() => this._readBlockSynced(blockId));
    }

    async writeBlockLocked(blockId, buffer) {
        return this.executeLocked(() => this._writeBlockSynced(blockId, buffer));
    }

    async readSequentialLocked(start, count) {
        return this.executeLocked(async () => {
            if (count === 1) return await this._readBlockSynced(start);
            
            // B"H: Check overlapping active page.
            if (this.activePage.dirty && this.activePage.id >= start && this.activePage.id < start + count) {
                await this.flush();
            }

            const buffer = await this.pager.readSequential(start, count);
            
            // B"H: Correctly apply block cache overlay AND activePage overlay
            for(let i=0; i<count; i++) {
                const bid = start + i;
                
                // Cache Overlay
                if (this.blockCache.has(bid)) {
                    const cached = this.blockCache.get(bid);
                    cached.copy(buffer, i * this.BLOCK_SIZE);
                }
                
                // Active Page Overlay (Highest Priority)
                if (this.activePage.id === bid && this.activePage.buffer) {
                     this.activePage.buffer.copy(buffer, i * this.BLOCK_SIZE);
                }
            }
            return buffer;
        });
    }

    async updateSuperBlock(modifierFn) {
        return this.executeLocked(async () => {
            await this._saveStateInternal(modifierFn);
        });
    }

    getProtectedBlockId() {
        if (!this.superBlockCache) return -1;
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

            let block = await this._readBlockSynced(ptr.blockId);
            
            const existingType = block ? block.readUInt32BE(0) : 0;
            
            if (!block || existingType === 0 || existingType === constants.BLOCK_TYPE.FREE) {
                 if (!block) block = this.formatBlock(constants.BLOCK_TYPE.PAGE);
                 else {
                     block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
                     BitmapManager.markHeader(block, this.HEADER_SIZE, this.UNIT_SIZE);
                 }
            }

            const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
            const unitsUsed = Math.ceil(data.length / this.UNIT_SIZE);
            
            if (!BitmapManager.check(block, startUnit, unitsUsed)) {
                BitmapManager.mark(block, startUnit, unitsUsed, true);
            }

            data.copy(block, ptr.offset);
            await this._writeBlockSynced(ptr.blockId, block);
        });
    }

    async free(ptr) {
         if (!ptr || ptr.length === 0) return;

         return this.executeLocked(async () => {
             if (ptr.isChain) {
                 const availablePerBlock = this.BLOCK_SIZE - this.HEADER_SIZE;
                 const blocksUsed = Math.ceil(ptr.length / availablePerBlock);
                 for (let i = 0; i < blocksUsed; i++) {
                     const bid = ptr.blockId + i;
                     // B"H: If freeing active page, flush/clear it first
                     if (this.activePage.id === bid) {
                         this.activePage.id = -1;
                         this.activePage.buffer = null;
                         this.activePage.dirty = false;
                     }
                     const cleanBuf = this.formatBlock(constants.BLOCK_TYPE.FREE);
                     await this._writeBlockSynced(bid, cleanBuf);
                     // Add to free stack for O(1) reuse
                     this.freeBlocks.push(bid); 
                 }
             } else {
                 const block = await this._readBlockSynced(ptr.blockId);
                 if (block) {
                     const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
                     const unitsUsed = Math.ceil(ptr.length / this.UNIT_SIZE);
                     
                     BitmapManager.mark(block, startUnit, unitsUsed, false);
                     
                     if (BitmapManager.isEmpty(block)) {
                         // B"H: If active page becomes empty, clear it from active status to allow full reuse logic
                         if (this.activePage.id === ptr.blockId) {
                             this.activePage.id = -1;
                             this.activePage.buffer = null;
                             this.activePage.dirty = false;
                         }
                         block.writeUInt32BE(constants.BLOCK_TYPE.FREE, 0);
                         this.freeBlocks.push(ptr.blockId);
                     }
                     await this._writeBlockSynced(ptr.blockId, block);
                 }
             }
         });
    }

    async getStats() {
        return this.executeLocked(async () => {
            return {
                fileSize: this.cursor * this.BLOCK_SIZE,
                totalBlocks: this.cursor,
                activePage: this.activePage.id
            };
        });
    }

    formatBlock(type) {
        const buf = Buffer.alloc(this.BLOCK_SIZE);
        buf.writeUInt32BE(type, 0);
        if (type !== constants.BLOCK_TYPE.FREE) {
            BitmapManager.markHeader(buf, this.HEADER_SIZE, this.UNIT_SIZE);
        }
        return buf;
    }

    async saveState() {
        return this.executeLocked(async () => { await this._saveStateInternal(); });
    }

    async _saveStateInternal(modifierFn) {
        await this.flush(); // Ensure active page is on disk before checkpoint
        
        let sb = await this.pager.readBlock(0);
        if (!sb) sb = Buffer.alloc(this.BLOCK_SIZE);
        
        const magic = "AwtsmoosDB_V1B\"H";
        if (sb.toString('utf8', 0, magic.length) !== magic) {
            sb.write(magic, 0);
        }

        this.superBlockCache = sb;
        if (modifierFn) modifierFn(this.superBlockCache);

        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        
        await this.pager.writeBlock(0, this.superBlockCache);
    }
}
module.exports = Allocator;
