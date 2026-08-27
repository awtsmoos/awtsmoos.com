
// B"H
/**
 * @file mutator.js
 * @description
 *  =============================================================================
 *  THE CHISEL OF THE FLAT OBJECT
 *  =============================================================================
 *  Every modification to the flat object is like carving At-Bash permutations 
 *  into the cosmic rock. The letters shift, the gematria changes, and reality 
 *  updates in constant O(1) time without bloating the infinite void.
 *  (Fixed the corrupted && here).
 */

const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectMutator {
    constructor(flat) { this.flat = flat; }
    
    set(key, itemPtr) {
        if (this.flat.isShattered) return this.flat.engine.set(key, itemPtr, { isPtr: true });
        
        const buf = this.flat.healer.heal(this.flat);
        const count = buf.readUInt16BE(4);
        const kBuf = Buffer.from(key, 'utf8');
        let cur = 6;
        
        for (let i = 0; i < count; i++) {
            const kLen = buf.readUInt8(cur);
            // B"H: The corrupted html entity has been banished.
            if (kLen === kBuf.length && buf.subarray(cur+1, cur+1+kLen).compare(kBuf) === 0) {
                itemPtr.copy(buf, cur + 1 + kLen);
                this.flat.allocator.db._writeChainSafe(this.flat.ptr, buf);
                return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
            }
            cur += 1 + kLen + 16;
        }
        
        if (cur + 1 + kBuf.length + 16 > constants.BLOCK_SIZE) {
            this.shatter();
            return this.set(key, itemPtr);
        }
        
        buf.writeUInt8(kBuf.length, cur);
        kBuf.copy(buf, cur + 1);
        itemPtr.copy(buf, cur + 1 + kBuf.length);
        buf.writeUInt16BE(count + 1, 4);
        
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buf);
        return { ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
    
    shatter() {
        const Dictionary = require('../../../dictionary/index.js');
        this.flat.engine = new Dictionary(this.flat.allocator);
        this.flat.engine.create();
        for (const [k, v] of this.flat.entries()) this.flat.engine.set(k, v);
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
    }
}

module.exports = ObjectMutator;
