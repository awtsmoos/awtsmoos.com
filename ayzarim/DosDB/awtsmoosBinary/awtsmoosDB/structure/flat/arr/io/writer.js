
// B"H
class ArrayWriter {
    constructor(flatArray) { this.flat = flatArray; }
    write(buffer) {
        if (!this.flat.ptr || this.flat.ptr.blockId === undefined) return;
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buffer);
    }
}
module.exports = ArrayWriter;
