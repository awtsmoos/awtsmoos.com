
// B"H
/**
 * @file writer.js
 * @description Safe physical writes for the FlatObject.
 */
class ObjectWriter {
    constructor(flatObject) { this.flat = flatObject; }
    
    write(buffer) {
        // B"H: Exact-byte awareness restored
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return;
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buffer);
    }
}
module.exports = ObjectWriter;
