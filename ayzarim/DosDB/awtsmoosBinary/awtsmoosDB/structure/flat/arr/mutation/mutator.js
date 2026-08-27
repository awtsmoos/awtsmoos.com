
// B"H
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ArrayMutator {
    constructor(flatArray) { this.flat = flatArray; }

    push(itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.push(itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt32BE(4);
        const offset = 8 + (count * 16);
        
        if (offset + 16 > constants.BLOCK_SIZE) {
            this.flat.shatterer.shatter();
            return this.push(itemPtr); 
        }
        
        itemPtr.copy(buf, offset);
        buf.writeUInt32BE(count + 1, 4);
        this.flat.writer.write(buf);
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }

    splice(start, delCount, itemPtrs) {
        if (this.flat.isShattered) {
            this.flat.engine.splice(start, delCount, ...itemPtrs);
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }

        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt32BE(4);
        
        let s = start; 
        if (s < 0) s = Math.max(0, count + s); 
        if (s > count) s = count;
        
        const d = Math.max(0, Math.min(delCount, count - s));
        const newCount = count - d + itemPtrs.length;
        const newSize = 8 + (newCount * 16);
        
        if (newSize > constants.BLOCK_SIZE) {
            this.flat.shatterer.shatter();
            return this.splice(start, delCount, itemPtrs);
        }
        
        const shiftStart = 8 + ((s + d) * 16);
        const shiftDest = 8 + ((s + itemPtrs.length) * 16);
        const shiftLen = (count - (s + d)) * 16;
        
        if (shiftLen > 0) {
            buf.copy(buf, shiftDest, shiftStart, shiftStart + shiftLen);
        }
        
        let insertOff = 8 + (s * 16);
        for(const p of itemPtrs) {
            p.copy(buf, insertOff);
            insertOff += 16;
        }
        
        buf.writeUInt32BE(newCount, 4);
        
        if (newCount < count) {
            const endOffset = 8 + (newCount * 16);
            buf.fill(0, endOffset, constants.BLOCK_SIZE);
        }

        this.flat.writer.write(buf);
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}
module.exports = ArrayMutator;
