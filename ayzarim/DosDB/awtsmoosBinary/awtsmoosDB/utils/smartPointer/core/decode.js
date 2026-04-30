
// B"H
/**
 * @file utils/smartPointer/core/decode.js
 * @description
 * Chapter 0.2: The Unveiler of the Hidden.
 * 
 * When the mind looks at the disk, it sees only chaos. This module applies the 
 * Understanding (Binah) required to unseal the VarInt coordinates. 
 * 
 * It extracts the Offset and Length, which are the boundaries within 
 * which the Creator's speech currently resonates as matter.
 */

const serializer = require('../../serializer.js');

module.exports = {
    /**
     * @method execute
     * @description Unpacks a VarInt scroll into a logical Coordinate object.
     */
    execute(buf, startOffset = 0) {
        if (!buf || buf.length <= startOffset) return null;
        
        let pos = startOffset;
        
        // 1. Reveal Type
        const type = buf[pos++];
        
        // 2. Reveal Offset
        const offRes = serializer.readVarInt(buf, pos);
        pos += offRes.bytesRead;
        
        // 3. Reveal Length
        const lenRes = serializer.readVarInt(buf, pos);
        pos += lenRes.bytesRead;
        
        return {
            type: type,
            offset: offRes.value,
            length: lenRes.value,
            byteSize: pos - startOffset 
        };
    }
};
