
// B"H
/**
 * @file adapter.js
 * @description
 *  The Sefirah of Da'at - The Bridge of Resolution.
 *  Translates raw binary blocks into either JS values or Structural Descriptors.
 */

const parser = require("../parser.js");
const { writeConditional, packTypeAndLengthSize } = require("../../utils/binaryHelpers.js");
const constants = require("../../constants.js");

module.exports = {
    decode(buffer, typeId) {
        if (!buffer) return null;

        const T = constants.VAL_TYPE || {};
        
        const isMap = typeId === T.MAP || typeId === constants.TYPE_MAP;
        const isSeq = typeId === T.SEQUENCE || typeId === constants.TYPE_SEQUENCE;
        const isDict = typeId === T.DICTIONARY || typeId === constants.TYPE_DICTIONARY;
        const isSet = typeId === T.SET || typeId === constants.TYPE_SET;

        if (isMap || isSeq || isDict || isSet) {
            return {
                isStructure: true,
                type: typeId,
                data: buffer,
                length: buffer.length
            };
        }

        const lenInfo = writeConditional(buffer.length);
        const typeByte = packTypeAndLengthSize(typeId, lenInfo.size);
        
        const wrapper = Buffer.concat([
            Buffer.from([typeByte]),
            lenInfo.buffer,
            buffer
        ]);
        
        try {
            const result = parser.parseValue(wrapper, 0);
            return result.value;
        } catch (e) {
            console.error(`B"H [V1_ADAPTER] FATAL: Parsing ritual failed for type ${typeId}. Error: ${e.message}`);
            return undefined;
        }
    }
};
