// B"H
const parser = require("./parser.js");

module.exports = {
    decode(buffer, typeId) {
        if (!buffer || buffer.length === 0) return null;
        // In the new logic, the buffer returned from paging might be raw data (if resolving pointer)
        // or it might be [Type][Len][Data] if we stored it inline?
        // Actually, our Page Bucket logic stores { type, ptr }.
        // `index.js` resolves the pointer to get the RAW DATA buffer.
        // It then calls this decode function with the Buffer and the TypeID.
        
        // parser.parseValue expects [TypeByte][Len][Data].
        // But we have [Data] and we know the TypeID.
        // We can manually route to the switch case logic in parser.js or reconstruct headers.
        
        // Reconstructing headers is safest to reuse the strict parser logic.
        // Create dummy Type Byte + Length.
        // Actually, creating a dummy buffer involves copying data which is slow.
        
        // Better: Export `parseValue` from parser but allow injecting type/length?
        // Or simply construct the [TypeByte][Len][Data] wrapper since it's just a few bytes metadata + pointer to data.
        
        // WAIT: The raw data buffer IS the data.
        // The parser logic `parseValue` expects to READ type and len.
        // Let's modify `v1_adapter` to do the reconstruction.
        
        const { writeConditional, packTypeAndLengthSize } = require("../utils/binaryHelpers.js");
        
        const lenInfo = writeConditional(buffer.length);
        const typeByte = packTypeAndLengthSize(typeId, lenInfo.size);
        
        const wrapper = Buffer.concat([
            Buffer.from([typeByte]),
            lenInfo.buffer,
            buffer
        ]);
        
        return parser.parseValue(wrapper, 0).value;
    }
};