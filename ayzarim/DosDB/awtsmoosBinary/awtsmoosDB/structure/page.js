// B"H
// Page.js - Restored Logic + Verification Logging

const constants = require('../constants.js');
const serializer = require('../utils/serializer.js');
const { readPointer48, writePointer48 } = require('../utils/binaryHelpers.js');

class Page {
    constructor(id, allocator) {
        this.id = id;
        this.allocator = allocator;
        this.nextPageId = 0; 
        this.items = [];
        this.isDirty = false; 
    }

    async load() {
        const buffer = await this.allocator.pager.readBlock(this.id);
        if (!buffer) {
            console.error(`[Page ${this.id}] LOAD ERROR: Block is NULL.`);
            return; 
        }
        
        let offset = constants.HEADER_SIZE; 
        
        // 1. Next Page Pointer (6 bytes)
        this.nextPageId = readPointer48(buffer, offset);
        offset += 6;

        // 2. Count (VarInt)
        const countInfo = serializer.readVarInt(buffer, offset);
        const count = countInfo.value;
        offset += countInfo.bytesRead;

        console.log(`[Page ${this.id}] LOADED. Next=${this.nextPageId}, Count=${count}. (Hex at Ofs 38: ${buffer.subarray(38, 40).toString('hex')})`);

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

    add(key, type, pointer) {
        if (this.items.length >= constants.MAX_ITEMS_PER_PAGE) {
            return false;
        }
        
        this.items.push({ key, type, ptr: pointer });
        this.isDirty = true;
        return true;
    }

    async save() {
        if (!this.isDirty) return;

        console.log(`[Page ${this.id}] SAVING... ItemCount=${this.items.length}. FirstKey="${this.items[0]?.key}"`);

        const parts = [];
        
        // 1. Next Page ID (6 bytes)
        const nextBuf = Buffer.alloc(6);
        writePointer48(nextBuf, this.nextPageId, 0);
        parts.push(nextBuf);
        
        // 2. Count (VarInt)
        // Ensure count is written correctly
        const countBuf = serializer.writeVarInt(this.items.length);
        parts.push(countBuf);

        // 3. Items
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

        // Log what we INTEND to write (Bytes 0-8 which covers NextPtr and Count)
        console.log(`[Page ${this.id}] Generated Buffer Header (Next+Count): ${rawBuffer.subarray(0, 10).toString('hex')}`);

        // Read the actual physical block (to preserve any existing block header data like Bitmap)
        let block = await this.allocator.pager.readBlock(this.id);
        if (!block) {
             console.error(`[Page ${this.id}] Critical: Block not found during Save. Allocating Buffer.`);
             block = Buffer.alloc(constants.BLOCK_SIZE);
        }

        // Force Metadata Update
        block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);

        const headerSize = constants.HEADER_SIZE;
        if (rawBuffer.length > (constants.BLOCK_SIZE - headerSize)) {
            throw new Error(`B"H: Page metadata size ${rawBuffer.length} exceeded Block capacity.`);
        }

        // Write the data into the block buffer
        rawBuffer.copy(block, headerSize);
        
        // Persist
        await this.allocator.pager.writeBlock(this.id, block);
        
        // Force Sync to ensure it hits disk immediately
        if (this.allocator.pager.handle) await this.allocator.pager.handle.sync();

        // --- VERIFY (Read-Back Check) ---
        const verifyBlock = await this.allocator.pager.readBlock(this.id);
        const verifyCountHex = verifyBlock.subarray(headerSize + 6, headerSize + 8).toString('hex'); // Approx location of Count
        console.log(`[Page ${this.id}] SAVE VERIFY: Disk Offset ${headerSize + 6} (Count Area): ${verifyCountHex}`);
        // --------------------------------

        this.isDirty = false;
    }
}

module.exports = Page;