// B"H
const parser = require("./parser.js");
const { writeConditional, packTypeAndLengthSize } = require("../utils/binaryHelpers.js");

module.exports = {
    decode(buffer, typeId) {
        if (!buffer || buffer.length === 0) {
            console.log(`[V1_Adapter] Warn: Buffer is empty for type ${typeId}`);
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