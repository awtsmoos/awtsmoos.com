
// B"H
/**
 * @file healer.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MIRACLE OF EXACT-BYTE SELF-HEALING (TZIKKUN HA'SHVIRA)
 *  =============================================================================
 *  "He heals the brokenhearted and binds up their wounds." (Psalms 147:3)
 *  
 *  If the database pointer leads to an empty void (null), this Angel recreates 
 *  the foundation instantly. But unlike the previous era, it does not clumsily 
 *  allocate a massive 4096-byte chunk. It allocates exactly 6 bytes: 
 *  Magic "FLTO" (4 bytes) + Item Count (2 bytes). 
 * 
 *  This completely banishes the dreaded `Cannot read properties of null` error 
 *  by guaranteeing a Buffer is ALWAYS returned.
 */

class ObjectHealer {
    /**
     * @method heal
     * @description Revives a destroyed or uninitialized FlatObject precisely.
     * @param {Object} flatObject - The FlatObject structure instance.
     * @returns {Buffer} The living binary buffer.
     */
    static heal(flatObject) {
        // B"H: The Tikkun of the Offset.
        // In Exact-Byte allocation, pointers have 'offset' not 'blockId'.
        if (!flatObject.ptr || flatObject.ptr.offset === undefined) {
            this.createRoot(flatObject);
        }
        
        let buf = flatObject.allocator.db._readChainSafe(flatObject.ptr);
        
        // If the void remains stubborn, we conjure pure physical light directly
        if (!buf || buf.length < 6) {
            this.createRoot(flatObject);
            buf = flatObject.allocator.db._readChainSafe(flatObject.ptr);
            
            if (!buf) {
                // Absolute guaranteed fallback to prevent crash
                buf = Buffer.alloc(6).fill(0);
                buf.write("FLTO", 0);
                buf.writeUInt16BE(0, 4);
            }
        }
        return buf;
    }

    /**
     * @method createRoot
     * @description Allocates the absolute minimum viable vessel (6 bytes).
     * @param {Object} flatObject - The FlatObject structure instance.
     */
    static createRoot(flatObject) {
        const buf = Buffer.alloc(6).fill(0);
        buf.write("FLTO", 0);
        buf.writeUInt16BE(0, 4); 
        
        const loc = (flatObject.v1 || flatObject.allocator).allocate(6);
        flatObject.ptr = { offset: loc.offset, length: 6, type: 18 }; // 18 = TYPE_SMART_OBJECT
        
        flatObject.allocator.db._writeChainSafe(flatObject.ptr, buf);
    }
}

module.exports = ObjectHealer;
