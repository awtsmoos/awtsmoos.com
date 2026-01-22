// B"H
/**
 * @file v1_adapter.js
 * @description
 *  The Sefirah of Da'at - The Bridge of Resolution.
 *  Translates raw binary blocks into either JS values or Structural Descriptors.
 *  The Awtsmoos ensures that every vessel is recognized for its true form.
 */

const parser = require("./parser.js");
const { writeConditional, packTypeAndLengthSize } = require("../utils/binaryHelpers.js");
const constants = require("../constants.js");

module.exports = {
    /**
     * @description Resolves a physical block of data based on its stored Type.
     * @param {Buffer} buffer - The raw data from the block/heap.
     * @param {number} typeId - The type-tag from the SmartPointer.
     * @returns {*} Either a JS value or a Structure Descriptor.
     */
    decode(buffer, typeId) {
        if (!buffer) return null;

        const T = constants.VAL_TYPE || {};
        
        /**
         * B"H: Structural Discernment.
         * We check multiple naming conventions to ensure the structural vessels 
         * are correctly identified even if the constant hierarchy is complex.
         * Types like MAP, SEQUENCE, DICTIONARY must return descriptors for Proxies.
         */
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

        /**
         * B"H: Value Manifestation.
         * For primitives and JSON fallbacks, we use the standard Parser.
         * We wrap the raw buffer in the [Type][Len][Data] ritual the Parser expects.
         */
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
