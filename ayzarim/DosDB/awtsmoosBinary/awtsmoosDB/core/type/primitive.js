
// B"H
/**
 * @file primitive.js
 * @description
 *  =============================================================================
 *  CHAPTER 3: THE SCRIBE OF THE FORMLESS LIGHT (ATZILUTH)
 *  =============================================================================
 *  "He forms light and creates darkness, He makes peace and creates all things." (Isaiah 45:7)
 * 
 *  Before a vessel can contain the Infinite, the Infinite must be contracted.
 *  The PrimitiveSaver is the Angel of the First Tzimtzum (Contraction). It takes 
 *  the simplest, most indivisible sparks of reality—Null, Booleans, small Integers, 
 *  and Strings—and condenses them into the 16-byte SmartPointer. 
 *  
 *  THE TIKKUN OF THE HEAP (ADJACENT STRING STORAGE):
 *  Strings up to 1024 bytes are now routed into the Ethereal Heap. The Heap 
 *  packs them directly next to each other using an O(1) cursor. This completely 
 *  bypasses the heavy Bitwise allocation calculations of the V1 Foundation.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const omni = require('../../utils/compression/omni.js');

class PrimitiveSaver {
    constructor(allocator) {
        this.allocator = allocator;
        this.v1 = allocator.v1;
        this.db = allocator.db;
        this.heap = allocator.heap;
    }

    save(val) {
        const T = constants.VAL_TYPE;
        
        // 1. The Absolute Voids
        if (val === null) return SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));
        if (val === undefined) return SmartPointer.encode(T.UNDEFINED, constants.MODE_INLINE, Buffer.alloc(15));
        
        // 2. The Binary Truth
        if (typeof val === 'boolean') {
            const p = Buffer.alloc(15).fill(0); 
            p[0] = val ? 1 : 0;
            return SmartPointer.encode(T.BOOLEAN, constants.MODE_INLINE, p);
        }
        
        // 3. The Micro-Sparks (Integers 0-15)
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 15) {
            const p = Buffer.alloc(15).fill(0); 
            p[0] = val;
            return SmartPointer.encode(T.SMALL_INT, constants.MODE_INLINE, p);
        }
        
        // 4. The Spoken Word (Strings)
        if (typeof val === 'string') {
            const hasMarker = val.includes('\x07');
            const data = omni.pack(val);
            const type = hasMarker ? T.STRING_OMNI : T.STRING;
            
            // Inline contraction for tiny words
            if (data.length <= 14) {
                const p = Buffer.alloc(15).fill(0); 
                p[0] = data.length; 
                data.copy(p, 1);
                return SmartPointer.encode(type, constants.MODE_INLINE, p);
            }
            
            // B"H: The Tikkun. Medium words flow into the continuous Heap space!
            if (data.length <= 1024) {
                const loc = this.heap.allocate(data);
                return SmartPointer.heap(type, loc.blockId, loc.offset, loc.length);
            }
            
            // Manifestation of heavy words into distinct physical blocks
            const ptr = this.v1.allocate(data.length);
            this.db._writeChainSafe(ptr, data);
            
            return SmartPointer.block(type, ptr.blockId, data.length, !!ptr.isChain, ptr.offset);
        }

        // 5. The Heavy Primitives (Numbers, Buffers, Dates) 
        const info = require('../allocator/serialize/serializeValue.js')(val, false);
        const data = info.data;
        
        if (!data || data.length === 0) {
            return SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));
        }
        
        // The Ethereal Heap for medium-sized sparks
        if (data.length <= 1024) {
            const loc = this.heap.allocate(data);
            return SmartPointer.heap(info.type, loc.blockId, loc.offset, loc.length);
        }
        
        // The Physical Block for massive primitives
        const p = this.v1.allocate(data.length);
        this.db._writeChainSafe(p, data);
        
        return SmartPointer.block(info.type, p.blockId, data.length, !!p.isChain, p.offset);
    }
}

module.exports = PrimitiveSaver;
