
// B"H
/**
 * @file utils/smartPointer/core/encode.js
 * @description
 * Chapter 0.1: The Chisel of the Seal.
 * 
 * This module performs the 'Tzimtzum' (Contraction). It takes massive numbers 
 * (offsets and lengths) and packs them into the smallest possible binary 
 * footprint using LEB128 VarInts.
 * 
 * Each coordinate is a 'Place' (Makom) in the SSD allocated by Chesed.
 */

const serializer = require('../../serializer.js');

module.exports = {
    /**
     * @method execute
     * @description Encodes a pointer as [Type:1][Offset:VarInt][Length:VarInt]
     */
    execute(type, offset, length) {
        // Max theoretical: 1 + 9 + 9 = 19 bytes.
        const buf = Buffer.allocUnsafe(20);
        let pos = 0;
        
        // 1. Inscribe the archetype (Type ID)
        buf[pos++] = type & 0xFF;
        
        // 2. Inscribe the absolute physical offset
        pos += serializer.writeVarIntTo(buf, pos, offset || 0);
        
        // 3. Inscribe the exact measure of the Light (Length)
        pos += serializer.writeVarIntTo(buf, pos, length || 0);
        
        // Return exactly what was spoken.
        return buf.subarray(0, pos);
    }
};
