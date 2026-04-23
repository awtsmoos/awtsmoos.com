
// B"H
class ArraySeeker {
    constructor(flatArray) { this.flat = flatArray; }

    length() {
        if (this.flat.isShattered) return this.flat.engine.length();
        const buf = this.flat.reader.readSafely();
        return buf.readUInt32BE(4);
    }

    get(index) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(index);
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt32BE(4);
        if (index < 0 || index >= count) return undefined;
        return buf.subarray(8 + (index * 16), 8 + (index * 16) + 16);
    }
}
module.exports = ArraySeeker;
