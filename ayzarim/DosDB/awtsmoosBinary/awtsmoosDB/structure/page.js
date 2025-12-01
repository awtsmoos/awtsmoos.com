// B"H
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
        if (!buffer) return; 
        
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

    add(key, type, pointer) {
        if (this.items.length >= constants.MAX_ITEMS_PER_PAGE) return false;
        this.items.push({ key, type, ptr: pointer });
        this.isDirty = true;
        return true;
    }

    async save() {
        if (!this.isDirty) return;

        console.log(`[Page ${this.id}] SAVING... ItemCount=${this.items.length}.`);
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
        block.writeUInt32BE(constants.BLOCK_TYPE.PAGE, 0);
        block.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        if (rawBuffer.length > (constants.BLOCK_SIZE - constants.HEADER_SIZE)) {
            throw new Error(`Page Overflow`);
        }
        rawBuffer.copy(block, constants.HEADER_SIZE);
        
        await this.allocator.pager.writeBlock(this.id, block);
        this.isDirty = false;
        console.log(`[Page ${this.id}] Saved.`);
    }
}
module.exports = Page;