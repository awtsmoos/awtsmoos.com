
// B"H
/**
 * @file setter.js
 * @description Inscribes keys into the Exact-Byte FlatObject space with pristine precision.
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
        
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        if (keyBuf.length > 255) {
            this.flat.shatterer.shatter(); 
            return this.set(key, itemPtr);
        }

        let validLength = 6;
        let foundIdx = -1;
        let foundPStart = 0;
        let foundPtrSize = 0;
        
        for(let i = 0; i < count; i++) {
            if (validLength >= buf.length) break;
            const kLen = buf.readUInt8(validLength);
            const pStart = validLength + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);

            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(validLength + 1, pStart);
                if (kBytes.compare(keyBuf) === 0) {
                    foundIdx = i;
                    foundPStart = pStart;
                    foundPtrSize = ptrSize;
                }
            }
            validLength += 1 + kLen + ptrSize;
        }

        if (foundIdx !== -1) {
            const newBuf = Buffer.allocUnsafe(validLength - foundPtrSize + itemPtr.length);
            buf.copy(newBuf, 0, 0, foundPStart);
            itemPtr.copy(newBuf, foundPStart);
            buf.copy(newBuf, foundPStart + itemPtr.length, foundPStart + foundPtrSize, validLength);

            const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
            this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 18 };
            this.flat.writer.write(newBuf);
            return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }

        if (validLength + 1 + keyBuf.length + itemPtr.length > 4096) {
            this.flat.shatterer.shatter(); 
            return this.set(key, itemPtr);
        }
        
        const newBuf = Buffer.allocUnsafe(validLength + 1 + keyBuf.length + itemPtr.length);
        buf.copy(newBuf, 0, 0, validLength);
        
        newBuf.writeUInt8(keyBuf.length, validLength);
        keyBuf.copy(newBuf, validLength + 1);
        itemPtr.copy(newBuf, validLength + 1 + keyBuf.length);
        newBuf.writeUInt16BE(count + 1, 4);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 18 };
        this.flat.writer.write(newBuf);
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ObjectSetter;
