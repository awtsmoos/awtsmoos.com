
// B"H
const SlabBitmap = require('./bitmap_logic.js');
const constants = require('../../../constants.js');

class SlabArena {
    constructor(db, ptr, slotSize) {
        this.db = db;
        this.ptr = ptr;
        this.slotSize = slotSize;
        this.headerSize = 32;
        this.capacity = Math.floor((constants.BLOCK_SIZE - this.headerSize) / slotSize);
        this.bitmap = new SlabBitmap(this.capacity);
        this.buffer = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        this.buffer.write("SLAB", 0);
        this.buffer.writeUInt16BE(slotSize, 4);
        this.isDirty = true;
    }
    claim() {
        const idx = this.bitmap.findAndSet();
        if (idx === -1) return null;
        this.isDirty = true;
        return {
            blockId: this.ptr.blockId,
            offset: this.headerSize + (idx * this.slotSize),
            length: this.slotSize
        };
    }
    flush() {
        if (!this.isDirty) return;
        this.buffer.writeUInt32BE(this.bitmap.used, 6);
        this.db._writeChainSafe(this.ptr, this.buffer);
        this.isDirty = false;
    }
}
module.exports = SlabArena;
