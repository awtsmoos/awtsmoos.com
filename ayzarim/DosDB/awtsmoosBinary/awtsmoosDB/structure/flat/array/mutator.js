
// B"H
/**
 * @file mutator.js
 * @description Array Mutator
 */
const SmartPointer = require('../../../utils/smartPointer/index.js');

class Mutator {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    push(itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.push(itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.io.ensureBuffer();
        if (!buf || buf.length < 10) {
            this.flat.shatter();
            return this.push(itemPtr);
        }
        
        const count = buf.readUInt16BE(4);
        const totalLen = buf.readUInt32BE(6);
        
        const newEntrySize = itemPtr.length;

        if (totalLen + newEntrySize > 16384) {
            this.flat.shatter();
            return this.push(itemPtr); 
        }
        
        const newBuf = Buffer.allocUnsafe(totalLen + newEntrySize);
        buf.copy(newBuf, 0, 0, totalLen);
        
        let off = totalLen;
        itemPtr.copy(newBuf, off);
        
        newBuf.writeUInt16BE(count + 1, 4);
        newBuf.writeUInt32BE(totalLen + newEntrySize, 6);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 19 }; // SMART_ARRAY
        this.flat.io.write(newBuf);
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }

    splice(start, delCount, itemPtrs) {
        if (this.flat.isShattered) {
            this.flat.engine.splice(start, delCount, ...itemPtrs);
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }

        const buf = this.flat.io.ensureBuffer();
        if (!buf || buf.length < 10) {
            this.flat.shatter();
            return this.splice(start, delCount, itemPtrs);
        }
        
        const count = buf.readUInt16BE(4);
        const totalLen = buf.readUInt32BE(6);
        
        let s = Math.max(0, Math.min(start, count));
        let d = Math.max(0, Math.min(delCount, count - s));
        
        let cursor = 10;
        for(let i = 0; i < s; i++) cursor += SmartPointer.readSize(buf, cursor);
        const spliceStartOff = cursor;
        
        for(let i = 0; i < d; i++) cursor += SmartPointer.readSize(buf, cursor);
        const spliceEndOff = cursor;
        
        let insertLen = 0;
        for(const p of itemPtrs) insertLen += p.length;
        
        const newTotalLen = totalLen - (spliceEndOff - spliceStartOff) + insertLen;
        
        if (newTotalLen > 16384) {
            this.flat.shatter();
            return this.splice(start, delCount, itemPtrs);
        }
        
        const newBuf = Buffer.allocUnsafe(newTotalLen);
        buf.copy(newBuf, 0, 0, spliceStartOff);
        
        let insertCur = spliceStartOff;
        for(const p of itemPtrs) {
            p.copy(newBuf, insertCur);
            insertCur += p.length;
        }
        
        buf.copy(newBuf, insertCur, spliceEndOff, totalLen);
        
        const newCount = count - d + itemPtrs.length;
        newBuf.writeUInt16BE(newCount, 4);
        newBuf.writeUInt32BE(newTotalLen, 6);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 19 };
        this.flat.io.write(newBuf);

        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}

module.exports = Mutator;
