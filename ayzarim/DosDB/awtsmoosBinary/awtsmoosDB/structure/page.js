// B"H
/**
 * @file page.js
 * @description
 *  Represents a single Dappim (Page) in the Book of Data.
 *  It holds the Othios (Letters/Items) and points to the next page.
 *  FIX: Now saves 'isChain' property of pointers to avoid data loss on large values.
 */
const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const { readPointer48, writePointer48 } = require('../utils/binaryHelpers.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;

class Page {
    /**
     * @param {number} id - The Block ID
     * @param {Object} allocator - The allocator instance
     */
    constructor(id, allocator) {
        this.id = id;
        this.allocator = allocator;
        this.nextPageId = 0; 
        this.items = []; // { key, type, ptr: { blockId, offset, length, isChain } }
        this.isDirty = false; 
    }

    log(msg) {
        if (this.allocator && this.allocator.db && this.allocator.db.debug) {
            console.log(`[Page ${this.id}] ${msg}`);
        }
    }

    /**
     * Loads the Page from the Ether (Disk).
     */
    async load() {
        if (!this.id || this.id <= 0 || isNaN(this.id)) return;
        
        const buffer = await this.allocator.readBlockLocked(this.id);
        if (!buffer) {
            this.log("Read failed: Block is null");
            return; 
        }
        
        // B"H: Use Safe HEADER_SIZE
        let offset = HEADER_SIZE; 
        
        if (offset + 6 > buffer.length) {
            this.log(`Buffer too small for header.`);
            return;
        }

        this.nextPageId = readPointer48(buffer, offset);
        offset += 6;
        
        const countInfo = serializer.readVarInt(buffer, offset);
        const count = countInfo.value;
        offset += countInfo.bytesRead;

        if (count > constants.MAX_ITEMS_PER_PAGE || count < 0) {
            this.log(`Invalid item count ${count}. Clearing page.`);
            this.items = [];
            return;
        }

        this.items = [];
        for (let i = 0; i < count; i++) {
            if (offset + 10 >= buffer.length) break;

            const keyInfo = serializer.readString(buffer, offset);
            const key = keyInfo.value;
            offset += keyInfo.bytesRead;
            
            if (offset >= buffer.length) break;
            const type = buffer.readUInt8(offset);
            offset += 1;
            
            if (offset + 7 >= buffer.length) break; 
            
            const blockId = readPointer48(buffer, offset);
            offset += 6;

            const flags = buffer.readUInt8(offset);
            offset += 1;
            const isChain = (flags & 1) === 1;
            
            const offsetInfo = serializer.readVarInt(buffer, offset);
            offset += offsetInfo.bytesRead;
            
            const lenInfo = serializer.readVarInt(buffer, offset);
            offset += lenInfo.bytesRead;

            this.items.push({
                key, type, ptr: { blockId, offset: offsetInfo.value, length: lenInfo.value, isChain }
            });
        }
        this.log(`Loaded ${this.items.length} items. NextPage: ${this.nextPageId}`);
    }

    /**
     * Sets the pointer to the next page.
     */
    setNextPage(id) {
        if (this.nextPageId !== id) {
            this.nextPageId = id;
            this.isDirty = true; 
        }
    }

    /**
     * Adds an Item to the Page if space permits.
     */
    add(key, type, pointer) {
        const existingIdx = this.items.findIndex(i => i.key === key);
        if (existingIdx !== -1) {
            this.items[existingIdx].type = type;
            this.items[existingIdx].ptr = pointer;
            this.isDirty = true;
            return true;
        }

        if (this.items.length >= constants.MAX_ITEMS_PER_PAGE) return false;
        
        const estimatedSize = Buffer.byteLength(key) + 22; 
        
        let currentSize = 0;
        currentSize += 6 + 5; 
        
        for(let item of this.items) {
             currentSize += (Buffer.byteLength(item.key) + 22); 
        }
        
        // B"H: Use HEADER_SIZE for calculation
        if ((currentSize + estimatedSize) > (constants.BLOCK_SIZE - HEADER_SIZE - 64)) {
            this.log("Page full (size limit).");
            return false;
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
        this.log(`Saving ${this.items.length} items to disk. NextPage: ${this.nextPageId}`);

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

            parts.push(Buffer.from([item.ptr.isChain ? 1 : 0]));
            
            parts.push(serializer.writeVarInt(item.ptr.offset));
            parts.push(serializer.writeVarInt(item.ptr.length));
        }

        const rawBuffer = Buffer.concat(parts);
        const block = Buffer.alloc(constants.BLOCK_SIZE);
        
        block.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_PAGE || 4, 0);
        
        // Mark header as used in bitmap
        block.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        if (rawBuffer.length > (constants.BLOCK_SIZE - HEADER_SIZE)) {
            throw new Error(`Page Overflow in Page ${this.id}`);
        }
        
        // B"H: FIX - Copy to HEADER_SIZE (64), NOT 0.
        // Prevents overwriting Block Type and Bitmap!
        rawBuffer.copy(block, HEADER_SIZE);
        
        await this.allocator.writeBlockLocked(this.id, block);
        this.isDirty = false;
    }
}
module.exports = Page;