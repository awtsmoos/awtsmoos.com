
// B"H
/**
 * @file deleter.js
 * @description Removes keys from the FlatObject space.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectDeleter {
    constructor(flatObject) { this.flat = flatObject; }

    delete(key) {
        if (this.flat.isShattered) {
            this.flat.engine.delete(key);
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
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
                    const entryLen = 1 + kLen + 16;
                    buf.copy(buf, cursor, cursor + entryLen);
                    buf.writeUInt16BE(count - 1, 4);
                    buf.fill(0, constants.BLOCK_SIZE - entryLen, constants.BLOCK_SIZE);
                    this.flat.writer.write(buf);
                    return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
                }
            }
            cursor += 1 + kLen + 16;
        }
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ObjectDeleter;
