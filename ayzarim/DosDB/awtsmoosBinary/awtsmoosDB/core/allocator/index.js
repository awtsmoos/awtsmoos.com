




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
        
        this.activePage = { id: -1, buffer: null, dirty: false };
        this.freeBlocks = []; 
        
        this.blockCache = new Map();
        // B"H: Tuning - 500 Blocks * 4KB = ~2MB. 
        this.MAX_CACHE_SIZE = 500; 
        
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = constants.HEADER_SIZE || 64; 
        
        this.CURSOR_OFFSET = 128; 
        this.ROOT_PTR_OFFSET = 64; 
        
        this.modes = new AllocationModes(this);
    }

    async init() {
        if (this.initialized) return;
        
        let sb = await this.pager.readBlock(0);
        const magic = "AwtsmoosDB_V1B\"H";
        let isValid = false;

        if (sb) {
            const readMagic = sb.toString('utf8', 0, magic.length);
            if (readMagic === magic) {
                isValid = true;
            }
        }

        if (isValid) {
            this.superBlockCache = Buffer.allocUnsafe(this.BLOCK_SIZE);
            sb.copy(this.superBlockCache);

            const savedCursor = readPointer48(sb, this.CURSOR_OFFSET); 
            const fileDerivedCursor = Math.ceil(this.pager.knownFileSize / this.BLOCK_SIZE);
            
            // B"H: Recovery - Trust file size if larger than saved cursor (lazy cursor update)
            this.cursor = Math.max(savedCursor, fileDerivedCursor);
            if (this.cursor < 2) this.cursor = 2;
            
        } else {
            await this.pager.truncate(0);
            this.superBlockCache = this.formatBlock(constants.BLOCK_TYPE.SUPERBLOCK || 1);
            this.superBlockCache.write(magic, 0);
            this.cursor = 2;
            writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
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

    async flush() {
        // B"H: Optimization - Only flush active page content. Do NOT write SuperBlock here.
        // SuperBlock is written only on close/checkpoint or explicit update.
        if (this.activePage.dirty && this.activePage.id !== -1 && this.activePage.buffer) {
            this._cacheBlock(this.activePage.id, this.activePage.buffer);
            await this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
            this.activePage.dirty = false;
        }
        // Removed: await this._saveStateInternal();
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
        if (this.activePage.id === blockId && this.activePage.buffer) {
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            this.activePage.buffer.copy(copy);
            return copy;
        }

        const cached = this._getCachedBlock(blockId);
        if (cached) return cached;
        
        const dirty = this.pager.readBlockSync(blockId);
        if (dirty) {
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            dirty.copy(copy);
            this._cacheBlock(blockId, copy);
            return copy;
        }

        const block = await this.pager.readBlock(blockId);
        if (block) this._cacheBlock(blockId, block);
        return block;
    }

    async _writeBlockSynced(blockId, buffer) {
        if (this.activePage.id === blockId) {
            if (buffer !== this.activePage.buffer) {
                buffer.copy(this.activePage.buffer);
            }
            this.activePage.dirty = true;
            this._cacheBlock(blockId, this.activePage.buffer);
            return;
        }
        
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
            
            if (this.activePage.dirty && this.activePage.id >= start && this.activePage.id < start + count) {
                await this.flush();
            }

            const buffer = await this.pager.readSequential(start, count);
            return buffer;
        });
    }

    async updateSuperBlock(modifierFn) {
        return this.executeLocked(async () => {
            await this._saveStateInternal(modifierFn);
        });
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
            let block;
            
            if (this.activePage.id === ptr.blockId && this.activePage.buffer) {
                block = this.activePage.buffer;
                this.activePage.dirty = true;
            } else {
                let dirty = this.pager.getDirtyBuffer(ptr.blockId);
                if (dirty) {
                    block = dirty;
                } else {
                    block = await this._readBlockSynced(ptr.blockId);
                }
            }
            
            if (!block) throw new Error("Block not found");

            const existingType = block.readUInt32BE(0);
            if (existingType === 0 || existingType === constants.BLOCK_TYPE.FREE) {
                 block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
                 BitmapManager.markHeader(block, this.HEADER_SIZE, this.UNIT_SIZE);
            }

            const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
            const unitsUsed = Math.ceil(data.length / this.UNIT_SIZE);
            
            if (!BitmapManager.check(block, startUnit, unitsUsed)) {
                BitmapManager.mark(block, startUnit, unitsUsed, true);
            }

            data.copy(block, ptr.offset);
            
            if (this.activePage.id !== ptr.blockId) {
                await this._writeBlockSynced(ptr.blockId, block);
            }
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
                     if (this.activePage.id === bid) {
                         this.activePage.id = -1;
                         this.activePage.buffer = null;
                         this.activePage.dirty = false;
                     }
                     const cleanBuf = this.formatBlock(constants.BLOCK_TYPE.FREE);
                     await this._writeBlockSynced(bid, cleanBuf);
                     this.freeBlocks.push(bid); 
                     
                     if (this.db && this.db.structureCache) {
                         this.db.structureCache.delete(bid);
                     }
                 }
             } else {
                 let block;
                 let dirty = this.pager.getDirtyBuffer(ptr.blockId);
                 if (dirty) block = dirty;
                 else block = await this._readBlockSynced(ptr.blockId);

                 if (block) {
                     if (this.activePage.id === ptr.blockId) {
                         block = this.activePage.buffer; 
                         this.activePage.dirty = true;
                     }
                     
                     const startUnit = Math.floor(ptr.offset / this.UNIT_SIZE);
                     const unitsUsed = Math.ceil(ptr.length / this.UNIT_SIZE);
                     BitmapManager.mark(block, startUnit, unitsUsed, false);
                     
                     if (BitmapManager.isEmpty(block)) {
                         if (this.activePage.id === ptr.blockId) {
                             this.activePage.id = -1;
                             this.activePage.buffer = null;
                             this.activePage.dirty = false;
                         }
                         block.writeUInt32BE(constants.BLOCK_TYPE.FREE, 0);
                         this.freeBlocks.push(ptr.blockId);
                         
                         if (this.db && this.db.structureCache) {
                             this.db.structureCache.delete(ptr.blockId);
                         }
                     }
                     
                     if (this.activePage.id !== ptr.blockId) {
                        await this._writeBlockSynced(ptr.blockId, block);
                     }
                 }
             }
         });
    }

    formatBlock(type) {
        const buf = Buffer.allocUnsafe(this.BLOCK_SIZE);
        buf.fill(0); 
        
        buf.writeUInt32BE(type, 0);
        if (type !== constants.BLOCK_TYPE.FREE) {
            BitmapManager.markHeader(buf, this.HEADER_SIZE, this.UNIT_SIZE);
        }
        return buf;
    }

    async _saveStateInternal(modifierFn) {
        let sb = await this.pager.readBlock(0);
        if (!sb) {
            sb = Buffer.allocUnsafe(this.BLOCK_SIZE);
            sb.fill(0);
        }
        
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