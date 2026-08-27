
// B"H
/**
 * @file setter.js
 * @description Inscribes keys into the FlatObject space with pristine precision.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectSetter {
    constructor(flatObject) { this.flat = flatObject; }

    set(key, itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.set(key, itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        // B"H: The Healer protects us here! Returns an absolute, guaranteed Buffer.
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        if (keyBuf.length > 255) {
            this.flat.shatterer.shatter(); 
            return this.set(key, itemPtr);
        }

        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(cursor + 1, cursor + 1 + kLen);
                if (kBytes.compare(keyBuf) === 0) {
                    itemPtr.copy(buf, cursor + 1 + kLen);
                    this.flat.writer.write(buf);
                    return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
                }
            }
            cursor += 1 + kLen + 16;
        }

        if (cursor + 1 + keyBuf.length + 16 > constants.BLOCK_SIZE) {
            this.flat.shatterer.shatter(); 
            return this.set(key, itemPtr);
        }
        
        buf.writeUInt8(keyBuf.length, cursor);
        keyBuf.copy(buf, cursor + 1);
        itemPtr.copy(buf, cursor + 1 + keyBuf.length);
        buf.writeUInt16BE(count + 1, 4);
        
        this.flat.writer.write(buf);
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ObjectSetter;
