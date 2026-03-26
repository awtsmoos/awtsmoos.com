
// B"H
/**
 * @file heap.js
 * @description 
 *  The Sefirah of Asiyah - The Physical Heap.
 *  Manages contiguous, append-only blocks for hyper-fast allocation of 
 *  small, primitive data like strings.
 * 
 *  THE TIKKUN OF TRUE DIRTINESS:
 *  A page is only "clean" once it is physically on the disk. The Scribe no longer
 *  prematurely marks a page as clean simply because it has been passed to the 
 *  Pager's Journal. This ensures the final `close()` command correctly flushes 
 *  the last lingering page of ephemeral memory.
 */
const constants = require('../constants.js');

class HeapManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
        this.activePage = null; 
        this.HEADER_SIZE = 8;
        this.db = v1Allocator.db;
    }

    allocate(dataBuffer) {
        if (!this.activePage || (this.activePage.cursor + dataBuffer.length > constants.BLOCK_SIZE)) {
            this.cyclePage();
        }
        const offset = this.activePage.cursor;
        dataBuffer.copy(this.activePage.buffer, offset);
        
        const result = { blockId: this.activePage.blockId, offset, length: dataBuffer.length };

        this.activePage.cursor += dataBuffer.length;
        this.activePage.usedBytes += dataBuffer.length;
        this.activePage.isDirty = true;
        
        return result;
    }

    /**
     * @description
     *  Bridges the gap between Memory and Disk.
     *  Returns the dirty buffer if the requested block matches the active page.
     */
    readBlock(blockId) {
        if (this.activePage && this.activePage.blockId === blockId) {
            return this.activePage.buffer;
        }
        return null;
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
        
        // B"H: Pass the buffer to the Pager. It will now be tracked in the Journal
        // or written directly, but its state relative to the disk is now "dirty".
        this.v1.pager.writeBlock(this.activePage.blockId, this.activePage.buffer);
        
        // B"H: The Tikkun. This buffer has been passed to the Pager, but it has not 
        // necessarily reached the physical disk yet. It remains dirty until a full fsync.
        // We do not set isDirty to false here.
    }
}
module.exports = HeapManager;
