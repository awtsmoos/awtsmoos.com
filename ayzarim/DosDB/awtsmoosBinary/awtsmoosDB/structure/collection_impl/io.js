// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

const HEADER_SIZE = constants.HEADER_SIZE || 64;

class CollectionIO {
    constructor(collection) {
        this.col = collection;
        this.allocator = collection.allocator;
    }

    async load() {
        if (!this.col.headerId || this.col.headerId <= 0 || isNaN(this.col.headerId)) {
             console.error(`B"H: Collection Load Failed. Invalid Header ID: ${this.col.headerId}`);
             return;
        }

        const buffer = await this.allocator.readBlockLocked(this.col.headerId);
        
        if (!buffer) {
            this.col.log(`Header block ${this.col.headerId} empty. Initializing new.`);
            await this.saveHeader(); 
            return;
        }

        const type = buffer.readUInt32BE(0);
        if (type !== (constants.BLOCK_TYPE.COLLECTION_HEADER || 3) && type !== 0) {
             this.col.log(`WARN: Block ${this.col.headerId} has invalid type ${type}. Expected COLLECTION_HEADER.`);
             return;
        }

        let offset = constants.HEADER_SIZE;
        const signature = buffer.toString('utf8', offset, offset + 4);
        
        if (signature !== this.col.MAGIC_HEAD) {
            this.col.log(`Signature mismatch at offset ${offset}. Got "${signature}", expected "${this.col.MAGIC_HEAD}". Assuming empty.`);
            this.col.headPageId = 0;
            this.col.tailPageId = 0;
            this.col.totalCount = 0;
            this.col.registryPtr = null;
            return;
        }
        offset += 4;

        this.col.headPageId = readPointer48(buffer, offset); offset+=6;
        this.col.tailPageId = readPointer48(buffer, offset); offset+=6;
        this.col.totalCount = buffer.readUInt32BE(offset); offset += 4;
        
        const hasRegistry = buffer.readUInt8(offset); offset++;
        if (hasRegistry === 1) {
            const b = readPointer48(buffer, offset); offset+=6;
            const o = buffer.readUInt32BE(offset); offset+=4;
            const l = buffer.readUInt32BE(offset); offset+=4;
            const c = buffer.readUInt8(offset); offset++;
            this.col.registryPtr = { blockId: b, offset: o, length: l, isChain: c === 1 };
        } else {
            this.col.registryPtr = null;
        }
        
        this.col.log(`Loaded Header. Head: ${this.col.headPageId}, Tail: ${this.col.tailPageId}, Count: ${this.col.totalCount}`);
        await this.col.indexManager.load(this.col.registryPtr);
    }

    async saveHeader() {
        this.col.log(`Saving Header ${this.col.headerId}...`);
        
        let buffer = Buffer.alloc(constants.BLOCK_SIZE);
        buffer.writeUInt32BE(constants.BLOCK_TYPE.COLLECTION_HEADER || 3, 0);
        buffer.fill(0xFF, constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);

        let offset = constants.HEADER_SIZE;
        buffer.write(this.col.MAGIC_HEAD, offset); offset += 4;

        writePointer48(buffer, this.col.headPageId, offset); offset+=6;
        writePointer48(buffer, this.col.tailPageId, offset); offset+=6;
        buffer.writeUInt32BE(this.col.totalCount, offset); offset+=4;
        
        if (this.col.indexManager.registryPtr) {
            this.col.registryPtr = this.col.indexManager.registryPtr;
        }

        if (this.col.registryPtr) {
            const ptr = this.col.registryPtr;
            buffer.writeUInt8(1, offset); offset++; 
            writePointer48(buffer, ptr.blockId, offset); offset+=6;
            buffer.writeUInt32BE(ptr.offset, offset); offset+=4;
            buffer.writeUInt32BE(ptr.length, offset); offset+=4;
            buffer.writeUInt8(ptr.isChain ? 1 : 0, offset); offset++;
        } else {
            buffer.writeUInt8(0, offset);
        }
        
        await this.allocator.writeBlockLocked(this.col.headerId, buffer);
    }
}
module.exports = CollectionIO;