
// B"H
/**
 * @file mutator.js
 * @description Modifies the internal bytes of the FlatObject.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class Mutator {
    constructor(flat) { this.flat = flat; }

    set(key, itemPtr) {
        if (this.flat.isShattered) return this.flat.engine.set(key, itemPtr, { isPtr: true });
        
        const buf = this.flat.reader.read();
        const count = buf.readUInt16BE(4);
        const kBuf = Buffer.from(key, 'utf8');
        
        if (kBuf.length > 255) { this.flat.shatterer.shatter(); return this.set(key, itemPtr); }

        let cur = 6;
        for (let i = 0; i < count; i++) {
            if (cur >= buf.length) break;
            const kLen = buf.readUInt8(cur);
            if (kLen === kBuf.length && buf.subarray(cur + 1, cur + 1 + kLen).compare(kBuf) === 0) {
                itemPtr.copy(buf, cur + 1 + kLen);
                this.flat.writer.write(buf);
                return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
            }
            cur += 1 + kLen + 16;
        }

        if (cur + 1 + kBuf.length + 16 > constants.BLOCK_SIZE) {
            this.flat.shatterer.shatter();
            return this.set(key, itemPtr);
        }
        
        buf.writeUInt8(kBuf.length, cur);
        kBuf.copy(buf, cur + 1);
        itemPtr.copy(buf, cur + 1 + kBuf.length);
        buf.writeUInt16BE(count + 1, 4);
        
        this.flat.writer.write(buf);
        return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }

    delete(key) {
        if (this.flat.isShattered) return this.flat.engine.delete(key);
        const buf = this.flat.reader.read();
        const count = buf.readUInt16BE(4);
        const kBuf = Buffer.from(key, 'utf8');
        let cur = 6;
        for (let i = 0; i < count; i++) {
            if (cur >= buf.length) break;
            const kLen = buf.readUInt8(cur);
            if (kLen === kBuf.length && buf.subarray(cur + 1, cur + 1 + kLen).compare(kBuf) === 0) {
                const entrySize = 1 + kLen + 16;
                buf.copy(buf, cur, cur + entrySize);
                buf.writeUInt16BE(count - 1, 4);
                buf.fill(0, constants.BLOCK_SIZE - entrySize, constants.BLOCK_SIZE);
                this.flat.writer.write(buf);
                return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
            }
            cur += 1 + kLen + 16;
        }
        return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = Mutator;
