
// B"H
class ObjectSeeker {
    constructor(flat) { this.flat = flat; }
    get(key) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(key);
        const buf = this.flat.healer.heal(this.flat);
        const count = buf.readUInt16BE(4);
        const kBuf = Buffer.from(key, 'utf8');
        let cur = 6;
        for (let i = 0; i < count; i++) {
            if (cur >= buf.length) break;
            const kLen = buf.readUInt8(cur);
            if (kLen === kBuf.length && buf.subarray(cur + 1, cur + 1 + kLen).compare(kBuf) === 0) {
                return buf.subarray(cur + 1 + kLen, cur + 1 + kLen + 16);
            }
            cur += 1 + kLen + 16;
        }
        return undefined;
    }
}
module.exports = ObjectSeeker;
