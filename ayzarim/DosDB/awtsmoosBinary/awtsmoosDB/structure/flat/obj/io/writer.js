
// B"H
/**
 * @file writer.js
 * @description Safe physical writes for the FlatObject.
 */
class ObjectWriter {
    constructor(flatObject) { this.flat = flatObject; }
    
    write(buffer) {
        if (!this.flat.ptr || this.flat.ptr.blockId === undefined) return;
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buffer);
    }
}
module.exports = ObjectWriter;
