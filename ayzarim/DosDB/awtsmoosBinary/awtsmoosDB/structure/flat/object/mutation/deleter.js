
// B"H
/**
 * @file deleter.js
 * @description Removes keys from the FlatObject space.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

class ObjectDeleter {
    constructor(flatObject) { this.flat = flatObject; }

    delete(key) {
        if (this.flat.isShattered) {
            this.flat.engine.delete(key);
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.reader.readSafely();
        if (!buf || buf.length < 6) return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };

        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
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

        if (foundEntryStart !== -1) {
            const newBuf = Buffer.allocUnsafe(validLength - foundEntrySize);
            buf.copy(newBuf, 0, 0, foundEntryStart);
            buf.copy(newBuf, foundEntryStart, foundEntryStart + foundEntrySize, validLength);
            newBuf.writeUInt16BE(count - 1, 4);
            
            const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
            this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 18 };
            this.flat.writer.write(newBuf);
        }
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ObjectDeleter;
