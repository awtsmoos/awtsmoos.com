
// B"H
/**
 * @file mutator.js
 * @description
 *  =============================================================================
 *  CHAPTER 3: THE CHISEL AND THE FIRE (MUTATION)
 *  =============================================================================
 *  Modifies the internal bytes of the Flat Object. Uses the At-Bash of pointer 
 *  offsets to squeeze keys and values into the tightest possible configuration.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');

class Mutator {
    constructor(flatObject) {
        this.flat = flatObject;
    }

    set(key, itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.set(key, itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.io.ensureBuffer();
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        if (keyBuf.length > 255) {
            this.flat.shatter(); 
            return this.flat.set(key, itemPtr);
        }

        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(cursor + 1, cursor + 1 + kLen);
                if (kBytes.compare(keyBuf) === 0) {
                    itemPtr.copy(buf, cursor + 1 + kLen);
                    this.flat.io.write(buf);
                    return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
                }
            }
            cursor += 1 + kLen + 16;
        }

        if (cursor + 1 + keyBuf.length + 16 > constants.BLOCK_SIZE) {
            this.flat.shatter(); 
            return this.flat.set(key, itemPtr);
        }
        
        buf.writeUInt8(keyBuf.length, cursor);
        keyBuf.copy(buf, cursor + 1);
        itemPtr.copy(buf, cursor + 1 + keyBuf.length);
        buf.writeUInt16BE(count + 1, 4);
        
        this.flat.io.write(buf);
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }

    delete(key) {
        if (this.flat.isShattered) {
            this.flat.engine.delete(key);
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.io.ensureBuffer();
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
                    this.flat.io.write(buf);
                    return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
                }
            }
            cursor += 1 + kLen + 16;
        }
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}

module.exports = Mutator;
