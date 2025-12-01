// B"H
/**
 * @module Page
 * @description Represents a single "Bucket" in the database.
 * 
 * CORE ARCHITECTURE:
 * 1. Holds up to constants.MAX_ITEMS_PER_PAGE (100) items.
 * 2. Does NOT hold large binary data. Only holds Pointers to the Allocator.
 * 3. Is part of a Linked List (has `nextPageId`).
 * 
 * SERIALIZATION FORMAT:
 * [Next Page ID (VarInt)]
 * [Item Count (VarInt)]
 * [Item 1: KeyLen | Key | Type | Pointer(Block, Offset, Len)]
 * [Item 2...]
 */

const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const { readPointer48, writePointer48 } = require('../utils/binaryHelpers.js');


class Page {
    /**
     * @param {number} id - The Block ID where this page is stored.
     * @param {object} allocator - Reference to the core Allocator.
     */
    constructor(id, allocator) {
        this.id = id;
        this.allocator = allocator;
        
        // The Linked List pointer. 0 means this is the last page.
        this.nextPageId = 0; 
        
        // The items in this bucket.
        // Structure: { key: string, type: number, ptr: { blockId, offset, length }, inlineVal: any }
        this.items = [];
        
        this.isDirty = false; // Tracks if we need to save to disk
    }

    /**
     * Loads and deserializes the Page from the physical disk.
     */
    async load() {
        const buffer = await this.allocator.pager.readBlock(this.id);
        if (!buffer) return; // New/Empty page
        
        let offset = constants.HEADER_SIZE; // Skip Unified Block Header (Bitmap etc)
        
        // 1. Read Next Page ID (Block ID = 48-bit)
        this.nextPageId = readPointer48(buffer, offset);
        offset += 6;

        // 2. Read Count
        const countInfo = serializer.readVarInt(buffer, offset);
        const count = countInfo.value;
        offset += countInfo.bytesRead;

        this.items = [];
        for (let i = 0; i < count; i++) {
            // Read Key
            const keyInfo = serializer.readString(buffer, offset);
            const key = keyInfo.value;
            offset += keyInfo.bytesRead;

            // Read Type
            const type = buffer.readUInt8(offset);
            offset += 1;

            // Read Pointer / Value
            // Unified Pointer: BlockID (48-bit), Offset (VarInt), Length (VarInt)
            
            const blockId = readPointer48(buffer, offset);
            offset += 6;
            
            const offsetInfo = serializer.readVarInt(buffer, offset);
            offset += offsetInfo.bytesRead;
            
            const lenInfo = serializer.readVarInt(buffer, offset);
            offset += lenInfo.bytesRead;

            this.items.push({
                key,
                type,
                ptr: {
                    blockId: blockId,
                    offset: offsetInfo.value,
                    length: lenInfo.value
                }
            });
        }
    }

    /**
     * Adds an item to this page.
     * @param {string} key 
     * @param {number} type - Enum from constants.VAL_TYPE
     * @param {object} pointer - { blockId, offset, length } from Allocator
     * @returns {boolean} True if added, False if page is full (caller must split/link).
     */
    add(key, type, pointer) {
        if (this.items.length >= constants.MAX_ITEMS_PER_PAGE) {
            return false;
        }
        
        this.items.push({ key, type, ptr: pointer });
        this.isDirty = true;
        return true;
    }

    /**
     * Serializes the page and saves it to disk via the Allocator.
     */
    async save() {
        if (!this.isDirty) return;

        // 1. Calculate Size
        // We construct the buffer parts
        const parts = [];
        
        // Next Page ID (48-bit)
        const nextBuf = Buffer.alloc(6);
        writePointer48(nextBuf, this.nextPageId, 0);
        parts.push(nextBuf);
        
        // Count
        parts.push(serializer.writeVarInt(this.items.length));

        // Items
        for (const item of this.items) {
            parts.push(serializer.writeString(item.key));
            parts.push(Buffer.from([item.type]));
            
            // Pointer Block ID (48-bit)
            const bIdBuf = Buffer.alloc(6);
            writePointer48(bIdBuf, item.ptr.blockId, 0);
            parts.push(bIdBuf);
            
            parts.push(serializer.writeVarInt(item.ptr.offset));
            parts.push(serializer.writeVarInt(item.ptr.length));
        }

        const rawBuffer = Buffer.concat(parts);

        // 2. Write to Disk
        const block = await this.allocator.pager.readBlock(this.id);
        const headerSize = constants.HEADER_SIZE;
        
        if (rawBuffer.length > (constants.BLOCK_SIZE - headerSize)) {
            throw new Error("B\"H: Page metadata exceeded 4KB Block limit. Implementation of Multi-Block Pages required.");
        }

        rawBuffer.copy(block, headerSize);
        
        // Write back
        await this.allocator.pager.writeBlock(this.id, block);
        this.isDirty = false;
    }
}

module.exports = Page;