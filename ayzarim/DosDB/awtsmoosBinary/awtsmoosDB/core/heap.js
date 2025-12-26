// B"H
/**
 * @file heap.js
 * @description The Sefirah of Asiyah - The Physical Heap of Manifestation.
 */
const constants = require('../constants.js');

class HeapManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
        this.activePage = null; 
        this.HEADER_SIZE = 8;
        this.db = v1Allocator.db;
    }

    /**
     * @description Allocates space in the heap for the provided data synchronously.
     */
    allocate(dataBuffer) {
        if (!this.activePage || (this.activePage.cursor + dataBuffer.length > constants.BLOCK_SIZE)) {
            this.cyclePage();
        }
        const offset = this.activePage.cursor;
        dataBuffer.copy(this.activePage.buffer, offset);
        this.activePage.cursor += dataBuffer.length;
        this.activePage.usedBytes += dataBuffer.length;
        this.activePage.isDirty = true;
        
        // Instant write to active block cache
        this.flush();
        
        return { blockId: this.activePage.blockId, offset, length: dataBuffer.length };
    }

    cyclePage() {
        if (this.activePage && this.activePage.isDirty) this.flush();
        const ptr = this.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        buf.writeUInt16BE(constants.HEAP_PAGE_MAGIC, 0);
        buf.writeUInt16BE(this.HEADER_SIZE, 2);
        buf.writeUInt32BE(0, 4);
        
        this.activePage = { 
            blockId: ptr.blockId, 
            buffer: buf, 
            cursor: this.HEADER_SIZE, 
            usedBytes: 0, 
            isDirty: true 
        };
    }

    flush() {
        if (!this.activePage || !this.activePage.isDirty) return;
        this.activePage.buffer.writeUInt16BE(this.activePage.cursor, 2);
        this.activePage.buffer.writeUInt32BE(this.activePage.usedBytes, 4);
        this.v1.pager.writeBlock(this.activePage.blockId, this.activePage.buffer);
        this.activePage.isDirty = false;
    }
}
module.exports = HeapManager;
