
// B"H
/**
 * @file setter.js
 * @description Inscribes keys into the Exact-Byte FlatObject space with pristine precision.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

class ObjectSetter {
    constructor(flatObject) { this.flat = flatObject; }

    set(key, itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.set(key, itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.reader.readSafely();
        if (!buf || buf.length < 6) {
            this.flat.shatterer.shatter();
            return this.set(key, itemPtr);
        }
        
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        if (keyBuf.length > 255) { this.flat.shatterer.shatter(); return this.set(key, itemPtr); }

        let validLength = 6;
        let foundEntryStart = -1;
        let foundEntrySize = 0;
        
        for(let i = 0; i < count; i++) {
            if (validLength >= buf.length) break;
            const entryStart = validLength;
            const kLen = buf.readUInt8(validLength);
            const pStart = validLength + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);
            const entrySize = 1 + kLen + ptrSize;

            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(validLength + 1, pStart);
                if (kBytes.compare(keyBuf) === 0) {
                    foundEntryStart = entryStart;
                    foundEntrySize = entrySize;
                }
            }
            validLength += entrySize;
        }

        const newEntrySize = 1 + keyBuf.length + itemPtr.length;

        if (foundEntryStart !== -1) {
            const newBuf = Buffer.allocUnsafe(validLength - foundEntrySize + newEntrySize);
            buf.copy(newBuf, 0, 0, foundEntryStart);
            
            let off = foundEntryStart;
            newBuf.writeUInt8(keyBuf.length, off++);
            keyBuf.copy(newBuf, off); off += keyBuf.length;
            itemPtr.copy(newBuf, off); off += itemPtr.length;
            
            buf.copy(newBuf, off, foundEntryStart + foundEntrySize, validLength);

            const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
            this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 18 };
            this.flat.writer.write(newBuf);
            return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }

        if (validLength + newEntrySize > 4096) {
            this.flat.shatterer.shatter(); 
            return this.set(key, itemPtr);
        }
        
        const newBuf = Buffer.allocUnsafe(validLength + newEntrySize);
        buf.copy(newBuf, 0, 0, validLength);
        
        let off = validLength;
        newBuf.writeUInt8(keyBuf.length, off++);
        keyBuf.copy(newBuf, off); off += keyBuf.length;
        itemPtr.copy(newBuf, off);
        
        newBuf.writeUInt16BE(count + 1, 4);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 18 };
        this.flat.writer.write(newBuf);
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ObjectSetter;
