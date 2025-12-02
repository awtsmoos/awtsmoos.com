// B"H
const parser = require("./parser.js");
const { writeConditional, packTypeAndLengthSize } = require("../utils/binaryHelpers.js");

module.exports = {
    decode(buffer, typeId) {
        // B"H:
        // Only return null if the buffer is undefined/null. 
        // Zero-length buffers are valid for Booleans, Nulls, and Empty Strings.
        if (!buffer) {
            console.log(`[V1_Adapter] Warn: Buffer is null for type ${typeId}`);
            return null;
        }
        
        // Construct the [Type][Len][Data] wrapper the parser expects
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