// B"H
/**
 * @file index.js (Allocator)
 * @description 
 *  The Sefirah of Chesed (Kindness). The Provider of Space.
 *  GUARANTEED PERSISTENCE: This implementation ensures that every allocation
 *  and SuperBlock update is immediately synchronized with the Pager.
 */

const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const fs = require('fs');

class Allocator {
    constructor(pager, db, options = {}) {
        this.pager = pager;
        this.db = db;
        this.cursor = 2; 
        this.initialized = false;
        
        // B"H: Persistent Cache for Block 0 to avoid redundant reads
        this.superBlockCache = Buffer.alloc(constants.BLOCK_SIZE);
        
        /**
         * @property activePage
         * @description The current block receiving small allocations.
         */
        this.activePage = { id: -1, buffer: null, dirty: false };
        
        // B"H: Tracking allocations in the current session to prevent overlaps
        this.allocatedOffsets = new Set();
        
        this.UNIT_SIZE = constants.UNIT_SIZE;
        this.BLOCK_SIZE = constants.BLOCK_SIZE;
        this.HEADER_SIZE = constants.HEADER_SIZE; 
        this.CURSOR_OFFSET = 128; 
    }

    /**
     * @description Awakens the Allocator and loads the SuperBlock coordinates.
     */
    init() {
        if (this.initialized) return;
        
        const sb = this.pager.readBlock(0);
        if (sb) {
            sb.copy(this.superBlockCache);
            const savedCursor = readPointer48(this.superBlockCache, this.CURSOR_OFFSET); 
            // Cursor must be at least 2 (0=SuperBlock, 1=Potential overflow/reserved)
            this.cursor = Math.max(savedCursor, 2);
        } else {
            this.superBlockCache.fill(0);
            this.cursor = 2;
        }
        
        this.initialized = true;
    }

    /**
     * @description Claims a physical territory on the disk for a new manifestation.
     * @param {number} sizeBytes Size of the requested vessel.
     * @returns {object} The physical coordinates {blockId, offset, length, isChain}.
     */
    allocate(sizeBytes) {
        this.init();
        const unitsNeeded = Math.ceil(sizeBytes / this.UNIT_SIZE);
        const maxPayloadPerBlock = this.BLOCK_SIZE - this.HEADER_SIZE;

        // --- ALLOCATION MODE: SMALL (Internal Page) ---
        if (sizeBytes <= maxPayloadPerBlock) {
            // 1. Check if the current active page has a gap
            if (this.activePage.id !== -1) {
                this._syncActivePage(); 
                
                const startUnit = BitmapManager.findGap(this.activePage.buffer, unitsNeeded);
                if (startUnit !== -1) {
                    const offset = startUnit * this.UNIT_SIZE;
                    const addrKey = `${this.activePage.id}:${offset}`;

                    if (!this.allocatedOffsets.has(addrKey)) {
                        this.allocatedOffsets.add(addrKey);
                        BitmapManager.mark(this.activePage.buffer, startUnit, unitsNeeded, true);
                        this.activePage.dirty = true;
                        
                        // SYNC: Immediately push the updated bitmap to the Pager
                        this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
                        return { blockId: this.activePage.id, offset, length: sizeBytes, isChain: false };
                    } else {
                        // Collision in memory state; force a new page
                        this.flush(); 
                    }
                }
            }

            // 2. Genesis of a New Page
            this.flush(); 
            const newId = this.cursor++;
            const newBlock = Buffer.alloc(this.BLOCK_SIZE).fill(0);
            
            // Format the block as a PAGE
            newBlock.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
            BitmapManager.markHeader(newBlock, this.HEADER_SIZE, this.UNIT_SIZE);
            
            // Mark the requested units as used
            const startUnit = Math.ceil(this.HEADER_SIZE / this.UNIT_SIZE);
            BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
            
            // Register the new active page
            this.activePage = { id: newId, buffer: newBlock, dirty: true };
            this.allocatedOffsets.clear();
            const offset = startUnit * this.UNIT_SIZE;
            this.allocatedOffsets.add(`${newId}:${offset}`);
            
            // PERSIST: Write to Pager and update SuperBlock cursor
            this.pager.writeBlock(newId, newBlock);
            this.updateSuperBlock();
            
            return { blockId: newId, offset, length: sizeBytes, isChain: false };
        } 

        // --- ALLOCATION MODE: LARGE (Block Chain) ---
        const blocksNeeded = Math.ceil(sizeBytes / maxPayloadPerBlock);
        const startId = this.cursor;
        this.cursor += blocksNeeded;
        
        // Format the chain blocks as OVERFLOW
        for (let i = 0; i < blocksNeeded; i++) {
            const blk = Buffer.alloc(this.BLOCK_SIZE).fill(0);
            blk.writeUInt32BE(constants.BLOCK_TYPE.OVERFLOW, 0);
            this.pager.writeBlock(startId + i, blk);
        }
        
        this.updateSuperBlock();
        return { blockId: startId, offset: this.HEADER_SIZE, length: sizeBytes, isChain: true };
    }

    /**
     * @description Modifies the SuperBlock (Block 0) and commits it to the Pager.
     */
    updateSuperBlock(fn) {
        this.init();
        if (fn) fn(this.superBlockCache);
        
        // Always ensure the latest cursor is etched in the cache
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        
        // Committing to the physical pager
        this.pager.writeBlock(0, this.superBlockCache);
    }

    /**
     * @description A coherent reader that prioritizes uncommitted memory.
     */
    readBlockLocked(id, noCopy = false) {
        this.init();
        const blockId = Number(id);
        
        // 1. Check Pager Cache (Latest IO)
        if (this.pager.cache.has(blockId)) {
            const cached = this.pager.cache.get(blockId);
            // If the allocator's active view is out of sync with the pager's cache, unify them.
            if (this.activePage.id === blockId && this.activePage.buffer !== cached) {
                cached.copy(this.activePage.buffer);
            }
            return cached;
        }
        
        // 2. Check Active Page
        if (this.activePage.id === blockId) {
            return this.activePage.buffer;
        }
        
        // 3. Fallback to raw Pager read
        return this.pager.readBlock(blockId);
    }

    /**
     * @description Pulls the latest physical data into the Allocator's active buffer.
     */
    _syncActivePage() {
        if (this.activePage.id !== -1 && this.pager.cache.has(this.activePage.id)) {
            const cached = this.pager.cache.get(this.activePage.id);
            if (this.activePage.buffer !== cached) {
                cached.copy(this.activePage.buffer);
            }
        }
    }

    /**
     * @description Seals the active page and clears the session memory.
     */
    flush() {
        if (this.activePage.id !== -1 && this.activePage.dirty) {
            this.pager.writeBlock(this.activePage.id, this.activePage.buffer);
            this.activePage.dirty = false;
        }
        this.activePage.id = -1;
        this.activePage.buffer = null;
        this.allocatedOffsets.clear();
    }
}

module.exports = Allocator;