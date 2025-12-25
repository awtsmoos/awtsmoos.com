// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');
const AllocationModes = require('./modes.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const ReadWriteLock = require('../concurrency.js');

class Allocator {
    constructor(pager, db, options = {}) {
        this.pager = pager;
        this.db = db;
        this.cursor = 2; 
        this.initialized = false;
        this.superBlockCache = null;
        this.activePage = { id: -1, buffer: null, dirty: false };
        this.freeBlocks = []; 
        this.blockCache = new Map();
        this.lock = new ReadWriteLock();
        
        const totalCache = options.cacheSize || 5000;
        this.MAX_CACHE_SIZE = Math.floor(totalCache * 0.6); 
        this.UNIT_SIZE = constants.UNIT_SIZE || 32;
        this.BLOCK_SIZE = constants.BLOCK_SIZE || 4096;
        this.HEADER_SIZE = constants.HEADER_SIZE || 64; 
        this.CURSOR_OFFSET = 128; 
        this.ROOT_PTR_OFFSET = 64; 
        this.modes = new AllocationModes(this);
    }

    async init() {
        if (this.initialized) return;
        return this.lock.runWrite(async () => {
            if (this.initialized) return;
            let sb = await this.pager.readBlock(0);
            const magic = "AwtsmoosDB_V1B\"H";
            let isValid = false;
            if (sb) {
                const readMagic = sb.toString('utf8', 0, magic.length);
                if (readMagic === magic) isValid = true;
            }
            if (isValid) {
                this.superBlockCache = Buffer.allocUnsafe(this.BLOCK_SIZE);
                sb.copy(this.superBlockCache);
                const savedCursor = readPointer48(sb, this.CURSOR_OFFSET); 
                const fileDerivedCursor = Math.ceil(this.pager.knownFileSize / this.BLOCK_SIZE);
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
        });
    }

    async executeLocked(fn) {
        if (!this.initialized) await this.init();
        return this.lock.runWrite(fn);
    }

    async flush() {
        return this.lock.runWrite(async () => {
            if (this.activePage.dirty && this.activePage.id !== -1 && this.activePage.buffer) {
                await this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
                this.activePage.dirty = false;
            }
        });
    }

    _cacheBlock(blockId, buffer) {
        if (this.blockCache.has(blockId)) this.blockCache.delete(blockId);
        else if (this.blockCache.size >= this.MAX_CACHE_SIZE) this.blockCache.delete(this.blockCache.keys().next().value);
        const cached = Buffer.allocUnsafe(this.BLOCK_SIZE);
        buffer.copy(cached);
        this.blockCache.set(blockId, cached);
    }
    
    invalidateCache(blockId) {
        if (this.blockCache.has(blockId)) this.blockCache.delete(blockId);
    }

    async _readBlockSynced(blockId, noCopy = false) {
        if (this.activePage.id === blockId && this.activePage.buffer) {
            if (noCopy) return this.activePage.buffer;
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            this.activePage.buffer.copy(copy);
            return copy;
        }
        if (this.blockCache.has(blockId)) {
            const cached = this.blockCache.get(blockId);
            if (noCopy) return cached;
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            cached.copy(copy);
            return copy;
        }
        const dirty = this.pager.readBlockSync(blockId, true);
        if (dirty) {
            this._cacheBlock(blockId, dirty);
            if (noCopy) return dirty;
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            dirty.copy(copy);
            return copy;
        }
        const block = await this.pager.readBlock(blockId, true);
        if (block) {
            this._cacheBlock(blockId, block);
            if (noCopy) return block;
            const copy = Buffer.allocUnsafe(this.BLOCK_SIZE);
            block.copy(copy);
            return copy;
        }
        return null;
    }

    async _writeBlockSynced(blockId, buffer) {
        if (this.activePage.id === blockId) {
            if (buffer !== this.activePage.buffer) buffer.copy(this.activePage.buffer);
            this.activePage.dirty = true;
            return;
        }
        this._cacheBlock(blockId, buffer);
        await this.pager.writeBlock(blockId, buffer);
    }

    async readBlockLocked(blockId, noCopy = false) {
        if (!this.initialized) await this.init();
        return this.lock.runRead(async () => this._readBlockSynced(blockId, noCopy));
    }

    async writeBlockLocked(blockId, buffer) {
        if (!this.initialized) await this.init();
        return this.lock.runWrite(async () => this._writeBlockSynced(blockId, buffer));
    }

    async readSequentialLocked(start, count) {
        if (!this.initialized) await this.init();
        return this.lock.runRead(async () => {
            if (count === 1) return await this._readBlockSynced(start);
            // Must flush if sequential read hits active page
            if (this.activePage.dirty && this.activePage.id >= start && this.activePage.id < start + count) {
                 await this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
                 this.activePage.dirty = false;
            }
            return await this.pager.readSequential(start, count);
        });
    }

    async updateSuperBlock(modifierFn) {
        if (!this.initialized) await this.init();
        return this.lock.runWrite(async () => this._saveStateInternal(modifierFn));
    }

    allocate(sizeBytes) {
        return this.executeLocked(async () => {
            const unitsNeeded = Math.ceil(sizeBytes / this.UNIT_SIZE);
            const maxUnits = Math.floor((this.BLOCK_SIZE - this.HEADER_SIZE) / this.UNIT_SIZE);
            if (unitsNeeded <= maxUnits) return await this.modes.allocateSmall(unitsNeeded, sizeBytes);
            return await this.modes.allocateLarge(unitsNeeded, sizeBytes);
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
                     if (this.db && this.db.structureCache) this.db.structureCache.delete(bid);
                 }
             } else {
                 let block = await this._readBlockSynced(ptr.blockId, false);
                 if (block) {
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
                         if (this.db && this.db.structureCache) this.db.structureCache.delete(ptr.blockId);
                     }
                     await this._writeBlockSynced(ptr.blockId, block);
                 }
             }
         });
    }

    formatBlock(type) {
        const buf = Buffer.allocUnsafe(this.BLOCK_SIZE).fill(0);
        buf.writeUInt32BE(type, 0);
        if (type !== constants.BLOCK_TYPE.FREE) BitmapManager.markHeader(buf, this.HEADER_SIZE, this.UNIT_SIZE);
        return buf;
    }

    async _saveStateInternal(modifierFn) {
        let sb = await this.pager.readBlock(0);
        if (!sb) sb = Buffer.allocUnsafe(this.BLOCK_SIZE).fill(0);
        const magic = "AwtsmoosDB_V1B\"H";
        if (sb.toString('utf8', 0, magic.length) !== magic) sb.write(magic, 0);
        this.superBlockCache = sb;
        if (modifierFn) modifierFn(this.superBlockCache);
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        await this.pager.writeBlock(0, this.superBlockCache);
    }
}
module.exports = Allocator;