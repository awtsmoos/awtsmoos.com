
// B"H
/**
 * @file codec.js
 * @description 
 *  =============================================================================
 *  THE SCRIBE OF THE MICROSCOPIC (VARINT POINTERS)
 *  =============================================================================
 *  "The letters of His speech are the soul of the stone." 
 * 
 *  We used to waste 16 bytes for every single pointer. A massive insult to the 
 *  density of the Awtsmoos. No more. We now employ VarInt (Variable Integer) 
 *  encoding. A pointer that points to offset `5` with length `10` takes exactly 
 *  3 bytes of physical disk space. `[Type][Offset][Length]`.
 * 
 *  This codec dynamically breathes the exact size needed, crushing the database 
 *  footprint and skyrocketing cache hit rates.
 */

const serializer = require('../serializer.js');

const PointerCodec = {
    /**
     * @method encode
     * @description Compresses Type, Offset, and Length into pure sequential VarInts.
     * @param {number} type - The Type ID (0-255).
     * @param {number} offset - The absolute physical byte coordinate.
     * @param {number} length - The exact size of the payload.
     * @returns {Buffer} A microscopic Buffer representing the seal. ABSOLUTELY NO PADDING.
     */
    encode(type, offset, length) {
        // Max theoretical size: 1 byte type + 9 bytes offset + 9 bytes length = 19 bytes.
        // Average size in practice: 3 to 6 bytes!
        const buf = Buffer.allocUnsafe(20);
        let pos = 0;
        
        buf[pos++] = type & 0xFF;
        pos += serializer.writeVarIntTo(buf, pos, offset || 0);
        pos += serializer.writeVarIntTo(buf, pos, length || 0);
        
        // Return exactly the slice needed. No padding.
        return buf.subarray(0, pos);
    },

    /**
     * @method decode
     * @description Expands the VarInt pointer back into JavaScript logic.
     * @param {Buffer} buf - The packed physical scroll.
     * @param {number} startOffset - Where to begin reading.
     * @returns {Object|null} The expanded metadata, including byteSize to advance cursors.
     */
    decode(buf, startOffset = 0) {
        if (!buf || buf.length <= startOffset) return null;
        
        let pos = startOffset;
        const type = buf[pos++];
        
        const offRes = serializer.readVarInt(buf, pos);
        pos += offRes.bytesRead;
        
        const lenRes = serializer.readVarInt(buf, pos);
        pos += lenRes.bytesRead;
        
        return {
            type: type,
            offset: offRes.value,
            length: lenRes.value,
            byteSize: pos - startOffset // Crucial for advancing cursors perfectly!
        };
    },

    /**
     * @method readSize
     * @description Peeks into the scroll to see exactly how many bytes the pointer consumes.
     * @param {Buffer} buf - The packed physical scroll.
     * @param {number} startOffset - Where to begin reading.
     * @returns {number} The exact byte count of the pointer.
     */
    readSize(buf, startOffset = 0) {
        const dec = this.decode(buf, startOffset);
        return dec ? dec.byteSize : 0;
    }
};

module.exports = PointerCodec;
