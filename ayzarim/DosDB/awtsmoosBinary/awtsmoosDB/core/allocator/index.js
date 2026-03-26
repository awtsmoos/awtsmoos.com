
// B"H
/**
 * @file index.js (Allocator)
 * @description 
 *  The Sefirah of Chesed (Kindness). The Provider of Space.
 * 
 *  THE TIKKUN OF THE PURE CONDUIT:
 *  The Allocator no longer holds its own `activePage` buffer. It has become a 
 *  pure conduit, tracking only the ID of its active page. For the physical bytes, 
 *  it always asks the Pager, which is the single source of truth for both the 
 *  in-memory Journal and the physical Disk. This unifies all I/O and banishes 
 *  the `TypeError` to the void.
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
        
        this.superBlockCache = Buffer.alloc(constants.BLOCK_SIZE);
        
        this.activePageId = -1;
        this.activePageCursor = 0;
        
        this.allocatedOffsets = new Set();
        
        this.UNIT_SIZE = constants.UNIT_SIZE;
        this.BLOCK_SIZE = constants.BLOCK_SIZE;
        this.HEADER_SIZE = constants.HEADER_SIZE; 
        this.CURSOR_OFFSET = 128; 
    }

    init() {
        if (this.initialized) return;
        
        const sb = this.pager.readBlock(0);
        if (sb) {
            sb.copy(this.superBlockCache);
            const savedCursor = readPointer48(this.superBlockCache, this.CURSOR_OFFSET); 
            this.cursor = Math.max(savedCursor, 2);
        } else {
            this.superBlockCache.fill(0);
            this.cursor = 2;
        }
        
        this.initialized = true;
    }

    allocate(sizeBytes) {
        this.init();
        const unitsNeeded = Math.ceil(sizeBytes / this.UNIT_SIZE);
        const maxPayloadPerBlock = this.BLOCK_SIZE - this.HEADER_SIZE;

        if (sizeBytes <= maxPayloadPerBlock) {
            if (this.activePageId !== -1) {
                const block = this.pager.readBlock(this.activePageId); // Always get latest from Pager
                const startUnit = BitmapManager.findGap(block, unitsNeeded, this.activePageCursor);
                
                if (startUnit !== -1) {
                    const offset = startUnit * this.UNIT_SIZE;
                    BitmapManager.mark(block, startUnit, unitsNeeded, true);
                    this.activePageCursor = startUnit + unitsNeeded;
                    this.pager.writeBlock(this.activePageId, block);
                    return { blockId: this.activePageId, offset, length: sizeBytes, isChain: false };
                }
            }

            this.flush(); 
            const newId = this.cursor++;
            const newBlock = Buffer.alloc(this.BLOCK_SIZE).fill(0);
            
            newBlock.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
            BitmapManager.markHeader(newBlock, this.HEADER_SIZE, this.UNIT_SIZE);
            
            const startUnit = Math.ceil(this.HEADER_SIZE / this.UNIT_SIZE);
            BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
            
            this.activePageId = newId;
            this.activePageCursor = startUnit + unitsNeeded;
            
            const offset = startUnit * this.UNIT_SIZE;
            
            this.pager.writeBlock(newId, newBlock);
            this.updateSuperBlock();
            
            return { blockId: newId, offset, length: sizeBytes, isChain: false };
        } 

        // --- ALLOCATION MODE: LARGE (Block Chain) ---
        const blocksNeeded = Math.ceil(sizeBytes / maxPayloadPerBlock);
        const startId = this.cursor;
        this.cursor += blocksNeeded;
        
        for (let i = 0; i < blocksNeeded; i++) {
            const blk = Buffer.alloc(this.BLOCK_SIZE).fill(0);
            blk.writeUInt32BE(constants.BLOCK_TYPE.OVERFLOW, 0);
            this.pager.writeBlock(startId + i, blk);
        }
        
        this.updateSuperBlock();
        return { blockId: startId, offset: this.HEADER_SIZE, length: sizeBytes, isChain: true };
    }

    updateSuperBlock(fn) {
        this.init();
        if (fn) fn(this.superBlockCache);
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        this.pager.writeBlock(0, this.superBlockCache);
    }

    readBlockLocked(id, noCopy = false) {
        this.init();
        // The Pager is the single source of truth for all blocks.
        return this.pager.readBlock(Number(id));
    }

    flush() {
        this.activePageId = -1;
        this.activePageCursor = 0;
        this.allocatedOffsets.clear();
    }
}

module.exports = Allocator;
