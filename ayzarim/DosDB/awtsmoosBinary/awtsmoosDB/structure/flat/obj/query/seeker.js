
// B"H
class ObjectSeeker {
    constructor(flatObject) { this.flat = flatObject; }

    length() {
        if (this.flat.isShattered) return this.flat.engine.seq.length();
        const buf = this.flat.reader.readSafely();
        return buf.readUInt16BE(4);
    }

    get(key) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(key);
        
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(cursor + 1, cursor + 1 + kLen);
                if (kBytes.compare(keyBuf) === 0) {
                    return buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
                }
            }
            cursor += 1 + kLen + 16;
        }
        return undefined;
    }
}
module.exports = ObjectSeeker;
