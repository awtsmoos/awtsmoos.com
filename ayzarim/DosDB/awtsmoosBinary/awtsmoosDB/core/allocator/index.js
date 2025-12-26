// B"H
const constants = require('../../constants.js');
const BitmapManager = require('./bitmap.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class Allocator {
    constructor(pager, db, options = {}) {
        this.pager = pager;
        this.db = db;
        this.cursor = 2; 
        this.initialized = false;
        this.superBlockCache = null;
        this.activePage = { id: -1, buffer: null, dirty: false };
        
        this.UNIT_SIZE = constants.UNIT_SIZE;
        this.BLOCK_SIZE = constants.BLOCK_SIZE;
        this.HEADER_SIZE = constants.HEADER_SIZE; 
        this.CURSOR_OFFSET = 128; 
    }

    init() {
        if (this.initialized) return;
        let sb = this.pager.readBlock(0);
        this.superBlockCache = Buffer.allocUnsafe(this.BLOCK_SIZE);
        sb.copy(this.superBlockCache);
        const savedCursor = readPointer48(sb, this.CURSOR_OFFSET); 
        this.cursor = Math.max(savedCursor, 2);
        this.initialized = true;
    }

    allocate(sizeBytes) {
        this.init();
        const unitsNeeded = Math.ceil(sizeBytes / this.UNIT_SIZE);
        
        if (this.activePage.id !== -1) {
            const block = this.activePage.buffer;
            const startUnit = BitmapManager.findGap(block, unitsNeeded);
            if (startUnit !== -1) {
                BitmapManager.mark(block, startUnit, unitsNeeded, true);
                this.activePage.dirty = true;
                return { blockId: this.activePage.id, offset: startUnit * this.UNIT_SIZE, length: sizeBytes };
            }
        }

        const newId = this.cursor++;
        const newBlock = Buffer.allocUnsafe(this.BLOCK_SIZE).fill(0);
        newBlock.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
        BitmapManager.markHeader(newBlock, this.HEADER_SIZE, this.UNIT_SIZE);
        
        const startUnit = Math.ceil(this.HEADER_SIZE / this.UNIT_SIZE);
        BitmapManager.mark(newBlock, startUnit, unitsNeeded, true);
        
        this.activePage = { id: newId, buffer: newBlock, dirty: true };
        this.pager.writeBlock(newId, newBlock);
        this.updateSuperBlock();
        return { blockId: newId, offset: startUnit * this.UNIT_SIZE, length: sizeBytes };
    }

    updateSuperBlock(modifierFn) {
        this.init();
        if (modifierFn) modifierFn(this.superBlockCache);
        writePointer48(this.superBlockCache, this.cursor, this.CURSOR_OFFSET);
        this.pager.writeBlock(0, this.superBlockCache);
    }

    readBlockLocked(id, noCopy = false) {
        this.init();
        if (this.activePage.id === id) return this.activePage.buffer;
        return this.pager.readBlock(id);
    }

    free(ptr) { /* Future fragmentation cleanup */ }
}
module.exports = Allocator;
