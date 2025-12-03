// B"H
/**
 * @file page.js
 * @description
 *  Represents a single Dappim (Page) in the Book of Data.
 *  It holds the Othios (Letters/Items) and points to the next page.
 */
const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const { readPointer48, writePointer48 } = require('../utils/binaryHelpers.js');

class Page {
    /**
     * @param {number} id - The Block ID
     * @param {Object} allocator - The allocator instance
     */
    constructor(id, allocator) {
        this.id = id;
        this.allocator = allocator;
        this.nextPageId = 0; 
        this.items = [];
        this.isDirty = false; 
    }

    /**
     * Loads the Page from the Ether (Disk).
     */
    async load() {
        const buffer = await this.allocator.pager.readBlock(this.id);
        if (!buffer) return; 
        
        // Skip Block Header to get to Page Data
        let offset = constants.HEADER_SIZE; 
        
        this.nextPageId = readPointer48(buffer, offset);
        offset += 6;
        
        const countInfo = serializer.readVarInt(buffer, offset);
        const count = countInfo.value;
        offset += countInfo.bytesRead;

        this.items = [];
        for (let i = 0; i < count; i++) {
            const keyInfo = serializer.readString(buffer, offset);
            const key = keyInfo.value;
            offset += keyInfo.bytesRead;
            
            const type = buffer.readUInt8(offset);
            offset += 1;
            
            const blockId = readPointer48(buffer, offset);
            offset += 6;
            
            const offsetInfo = serializer.readVarInt(buffer, offset);
            offset += offsetInfo.bytesRead;
            
            const lenInfo = serializer.readVarInt(buffer, offset);
            offset += lenInfo.bytesRead;

            this.items.push({
                key, type, ptr: { blockId, offset: offsetInfo.value, length: lenInfo.value }
            });
        }
    }

    /**
     * Sets the pointer to the next page.
     * Essential for the Chain of Transmission (Shalsheles).
     * @param {number} id 
     */
    setNextPage(id) {
        this.nextPageId = id;
        this.isDirty = true; 
    }

    /**
     * Adds an Item to the Page if space permits.
     * @returns {boolean} true if added, false if page is full (Tzimtzum required).
     */
    add(key, type, pointer) {
        // Update existing if present
        const existingIdx = this.items.findIndex(i => i.key === key);
        if (existingIdx !== -1) {
            this.items[existingIdx].type = type;
            this.items[existingIdx].ptr = pointer;
            this.isDirty = true;
            return true;
        }

        if (this.items.length >= constants.MAX_ITEMS_PER_PAGE) return false;
        
        // Calculate size to see if it fits
        // Basic estimation: Key + 20 bytes metadata + overhead
        const estimatedSize = Buffer.byteLength(key) + 20;
        
        // Calculate current usage
        // Note: We shouldn't rely on `currentSize` accumulation variable from previous adds
        // because `load()` doesn't populate it. We re-calculate.
        let currentSize = 0;
        // nextPageId (6) + Count (VarInt ~1-3)
        currentSize += 6 + 5; 
        
        for(let item of this.items) {
             currentSize += (Buffer.byteLength(item.key) + 20); // Approx
        }
        
        // Check overflow
        if ((currentSize + estimatedSize) > (constants.BLOCK_SIZE - constants.HEADER_SIZE - 64)) {
            return false; // Force new page
        }

        this.items.push({ key, type, ptr: pointer });
        this.isDirty = true;
        return true;
    }

    /**
     * Commits the Page to the Disk.
     */
    async save() {
        if (!this.isDirty) return;

        // console.log(`[Page ${this.id}] SAVING... ItemCount=${this.items.length}.`);
        const parts = [];
        
        const nextBuf = Buffer.alloc(6);
        writePointer48(nextBuf, this.nextPageId, 0);
        parts.push(nextBuf);
        
        parts.push(serializer.writeVarInt(this.items.length));

        for (const item of this.items) {
            parts.push(serializer.writeString(item.key));
            parts.push(Buffer.from([item.type]));
            
            const bIdBuf = Buffer.alloc(6);
            writePointer48(bIdBuf, item.ptr.blockId, 0);
            parts.push(bIdBuf);
            
            parts.push(serializer.writeVarInt(item.ptr.offset));
            parts.push(serializer.writeVarInt(item.ptr.length));
        }

        const rawBuffer = Buffer.concat(parts);
        const block = Buffer.alloc(constants.BLOCK_SIZE);
        
        // Use COLLECTION_PAGE type
        block.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_PAGE, 0);
        
        // Mark header as used in bitmap
        block.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        if (rawBuffer.length > (constants.BLOCK_SIZE - constants.HEADER_SIZE)) {
            throw new Error(`Page Overflow in Page ${this.id}`);
        }
        
        rawBuffer.copy(block, constants.HEADER_SIZE);
        
        await this.allocator.pager.writeBlock(this.id, block);
        this.isDirty = false;
        // console.log(`[Page ${this.id}] Saved.`);
    }
}
module.exports = Page;