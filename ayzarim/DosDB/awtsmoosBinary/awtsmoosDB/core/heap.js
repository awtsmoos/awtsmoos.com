
// B"H
const constants = require('../constants.js');

class HeapManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
        this.activePage = null; 
        this.HEADER_SIZE = 8;
    }

    async allocate(dataBuffer) {
        // B"H: CRITICAL - Wrap in allocator lock to prevent race conditions 
        // when StructBuilder runs parallel operations.
        return this.v1.executeLocked(async () => {
            if (!this.activePage || (this.activePage.cursor + dataBuffer.length > constants.BLOCK_SIZE)) {
                await this.cyclePage();
            }
            const offset = this.activePage.cursor;
            dataBuffer.copy(this.activePage.buffer, offset);
            this.activePage.cursor += dataBuffer.length;
            this.activePage.usedBytes += dataBuffer.length;
            this.activePage.isDirty = true;
            await this.flush();
            return { blockId: this.activePage.blockId, offset, length: dataBuffer.length };
        });
    }

    async cyclePage() {
        if (this.activePage && this.activePage.isDirty) await this.flush();
        const ptr = await this.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        buf.writeUInt16BE(constants.HEAP_PAGE_MAGIC, 0);
        buf.writeUInt16BE(this.HEADER_SIZE, 2);
        buf.writeUInt32BE(0, 4);
        this.activePage = { blockId: ptr.blockId, buffer: buf, cursor: this.HEADER_SIZE, usedBytes: 0, isDirty: true };
    }

    async flush() {
        if (!this.activePage || !this.activePage.isDirty) return;
        this.activePage.buffer.writeUInt16BE(this.activePage.cursor, 2);
        this.activePage.buffer.writeUInt32BE(this.activePage.usedBytes, 4);
        await this.v1.writeBlockLocked(this.activePage.blockId, this.activePage.buffer);
        this.activePage.isDirty = false;
    }

    async free(blockId, length) {
        return this.v1.executeLocked(async () => {
            if (this.activePage && this.activePage.blockId === blockId) {
                this.activePage.usedBytes -= length;
                if (this.activePage.usedBytes <= 0) {
                    this.activePage.cursor = this.HEADER_SIZE;
                    this.activePage.usedBytes = 0;
                }
                this.activePage.isDirty = true;
                await this.flush();
                return;
            }
            const buf = await this.v1.readBlockLocked(blockId);
            if (!buf) return;
            const magic = buf.readUInt16BE(0);
            if (magic !== constants.HEAP_PAGE_MAGIC) return;
            let usedBytes = buf.readUInt32BE(4);
            usedBytes -= length;
            if (usedBytes <= 0) {
                await this.v1.free({ blockId, length: constants.BLOCK_SIZE, isChain: false });
            } else {
                buf.writeUInt32BE(usedBytes, 4);
                await this.v1.writeBlockLocked(blockId, buf);
            }
        });
    }
}
module.exports = HeapManager;
