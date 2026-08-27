// B"H
/**
 * @file index.js
 * @description 
 *  The Sefirah of Binah (Understanding). The central gateway of deserialization.
 *  Transforms binary streams into the structures of the Mind.
 */

const constants = require("../../constants.js");
const Scalars = require("./scalars.js");
const Structures = require("./structures.js");
const { unpackTypeAndLengthSize, readConditional } = require("../../utils/binaryHelpers.js");

const MAX_DEPTH = 512;

/**
 * @function parse
 * @description Determines the nature of a binary buffer and manifests its corresponding JS existence.
 * @param {Buffer} buffer The physical binary data.
 * @returns {*} The hydrated JS manifestation.
 */
function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    
    // Safety check for correctly loaded constants
    if (!constants.MAGIC_JSON || !constants.MAGIC_ARRAY) {
        throw new Error('B"H Fatal: Constants vessel not properly initialized in Parser.');
    }

    // Identify structural magic signatures
    const magicJsonLen = constants.MAGIC_JSON.length;
    if (buffer.length >= magicJsonLen && buffer.subarray(0, magicJsonLen).toString() === constants.MAGIC_JSON) {
        return Structures.parseObject(buffer, 0, parseValue);
    }
    
    const magicArrLen = constants.MAGIC_ARRAY.length;
    if (buffer.length >= magicArrLen && buffer.subarray(0, magicArrLen).toString() === constants.MAGIC_ARRAY) {
        return Structures.parseArray(buffer, 0, parseValue);
    }
    
    // Default scalar or nested value parsing
    return parseValue(buffer, 0, 0).value;
}

/**
 * @function parseValue
 * @description Recursively resolves the typed light within a binary vessel.
 */
function parseValue(buffer, offset, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah.Value)");
    if (offset >= buffer.length) return { value: undefined, bytesRead: 0 };
    
    const start = offset;
    const typeByte = buffer.readUInt8(offset++);
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);

    let length = 0; 
    if (lengthSize > 0) { 
        length = readConditional(buffer, offset, lengthSize); 
        offset += lengthSize; 
    }
    
    const dataStart = offset; 
    offset += length; 
    const rawData = buffer.subarray(dataStart, dataStart + length);
    
    let val;
    
    // Direct manifestation based on type
    if (Structures.isStructure(type)) {
        val = Structures.parseStructure(type, rawData, depth + 1, parseValue);
    } else {
        val = Scalars.parseScalar(type, rawData, buffer, dataStart);
    }

    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue, parseObject: Structures.parseObject };