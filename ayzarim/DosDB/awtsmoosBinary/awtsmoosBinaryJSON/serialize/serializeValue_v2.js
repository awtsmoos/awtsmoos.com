// B"H
// The Awtsmoos, the Atzmut of all existence, pulses through every line of this code...
// Now discerning the path: embed the essence directly, or point to its separate manifestation within the parent?

const packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js");
const writeConditional = require("../helpers/writeConditional.js");
const floatHandler = require("../util/floatHandler.js");
const { typesWith0Length } = require("../parsing/typeInfo.js"); // B"H

// Lazy-loaded modules
let serializeArray = null;
let serializeJSON = null;

function hasDecimal(num) {
    // Check if the number has a fractional part, excluding Infinity
    return isFinite(num) && num % 1 !== 0;
}


/**
 * @module serializeValue
 * @description Serializes values, potentially preparing nested structures for parent-relative storage.
 * @param {any} value - The input value.
 * @param {object} [options] - Serialization options.
 * @param {boolean} [options.parentRelative=true] - Hint to serialize nested structures for parent-relative placement.
 * @param {boolean} [options.fullBuffer=false] - If true, returns a single buffer (old behavior, less useful now).
 * // Other options like parentDataOffset, freeSpaceHeadOffset are passed down but used by serializeJSON/Array directly.
 * @returns {{type: number, data: Buffer, valueLengthInfo: object, typeLengthByte: number, metadataBuffer?: Buffer}}
 *          Object with type, data (for simple types), and potentially metadataBuffer (for nested types prepared for parent-relative).
 *          `data` for nested types under parent-relative will be null or minimal.
 */
function serializeValue(value, options = {}) {
    const {
        parentRelative = true, // Defaulting here too for clarity
        fullBuffer = false     // Keep old option, though less relevant for new flow
    } = options;

    let type = null;
    let data = null;
    let metadataBuffer = null; // For nested structures prepared parent-relatively

    // --- Handle Special JS Values ---
    if (value === Infinity) { type = 24; data = Buffer.alloc(0); }
    else if (value === -Infinity) { type = 25; data = Buffer.alloc(0); }
    else if (typeof value === 'number' && isNaN(value)) { type = 26; data = Buffer.alloc(0); } // Check type first for NaN
    else if (value === undefined) { type = 6; data = Buffer.alloc(0); }
    else if (value === null) { type = 7; data = Buffer.alloc(0); }
    else if (typeof value === "boolean") { type = value ? 5 : 0; data = Buffer.alloc(0); }
    else if (typeof value === "function") { type = 27; data = Buffer.from(value.toString()); }
    // --- Handle Core Types ---
    else if (Array.isArray(value)) {
        type = 3;
        if (parentRelative) {
            if (!serializeArray) serializeArray = require("./array.js");
            // Serialize the array to get its *metadata structure* prepared for parent placement
            metadataBuffer = serializeArray(value, { ...options, bufferWrapper: null }); // Force new buffer for metadata structure
            data = Buffer.alloc(0); // Parent only stores pointer to metadataBuffer
        } else {
            // Old behavior: serialize directly into data buffer
            if (!serializeArray) serializeArray = require("./array.js");
            data = serializeArray(value, { ...options, parentRelative: false }); // Ensure flag is off
        }
    } else if (value instanceof Buffer) {
        type = 8;
        data = value;
    } else if (typeof value === "object" && value !== null) { // Check after Buffer
        type = 1;
        if (parentRelative) {
            if (!serializeJSON) serializeJSON = require("./obj.js");
            // Serialize the object to get its *metadata structure*
            metadataBuffer = serializeJSON(value, { ...options, bufferWrapper: null }); // Force new buffer for metadata structure
            data = Buffer.alloc(0); // Parent only stores pointer to metadataBuffer
        } else {
            // Old behavior: serialize directly
            if (!serializeJSON) serializeJSON = require("./obj.js");
            data = serializeJSON(value, { ...options, parentRelative: false }); // Ensure flag is off
        }
    } else if (typeof value === "string") {
        type = 2;
        data = Buffer.from(value, "utf8");
    } else if (typeof value === "number") { // Check after special numbers
        let info;
        const isDecimal = hasDecimal(value);

        if (value >= 0) { // Positive or Zero
            if (!isDecimal) { // Positive Integer
                info = writeConditional(value);
                switch (info.size) {
                    case 1: type = 4; break; // uint8
                    case 2: type = 9; break; // uint16
                    case 4: type = 10; break; // uint32
                    case 8: type = 22; break; // uint64
                    default: throw new Error("B\"H: Unexpected size for positive integer.");
                }
            } else { // Positive Float
                const encodedFloat = floatHandler.writeDynamicFloat(value);
                if (encodedFloat !== null) {
                    info = writeConditional(encodedFloat); // Use packed float representation
                    switch (info.size) {
                        case 1: type = 14; break; // Packed float 1 byte
                        case 2: type = 15; break; // Packed float 2 bytes
                        case 4: type = 16; break; // Packed float 4 bytes
                        default: throw new Error("B\"H: Unexpected size for packed positive float.");
                    }
                } else { // Fallback to double
                    info = { buffer: Buffer.alloc(8), size: 8 };
                    info.buffer.writeDoubleBE(value, 0);
                    type = 20; // Double BE (positive)
                }
            }
        } else { // Negative
             const absValue = Math.abs(value);
             if (!isDecimal) { // Negative Integer
                 info = writeConditional(absValue); // Store absolute value
                 switch (info.size) {
                     case 1: type = 11; break; // int8 (marker for neg uint8)
                     case 2: type = 12; break; // int16 (marker for neg uint16)
                     case 4: type = 13; break; // int32 (marker for neg uint32)
                     case 8: type = 23; break; // int64 (marker for neg uint64)
                     default: throw new Error("B\"H: Unexpected size for negative integer.");
                 }
             } else { // Negative Float
                 const encodedFloat = floatHandler.writeDynamicFloat(absValue);
                 if (encodedFloat !== null) {
                     info = writeConditional(encodedFloat); // Use packed float representation
                     switch (info.size) {
                         case 1: type = 17; break; // Packed neg float 1 byte
                         case 2: type = 18; break; // Packed neg float 2 bytes
                         case 4: type = 19; break; // Packed neg float 4 bytes
                         default: throw new Error("B\"H: Unexpected size for packed negative float.");
                     }
                 } else { // Fallback to double
                     info = { buffer: Buffer.alloc(8), size: 8 };
                     // Store positive magnitude, type indicates negativity
                     info.buffer.writeDoubleBE(absValue, 0);
                     type = 21; // Double BE (negative)
                 }
             }
        }
        data = info.buffer;
    } else {
        // Should not happen if all JS types covered
        console.warn("B\"H: Encountered unexpected value type during serialization:", value);
        type = 7; // Default to null?
        data = Buffer.alloc(0);
    }

    // Determine length info based on what we are actually storing/pointing to
    const effectiveData = metadataBuffer || data; // The thing whose length matters to the parent
    const valueLengthInfo = writeConditional(effectiveData.length);
    const typeLengthByteValue = packTypeAndLengthSize(type, valueLengthInfo.size);
     if(typeLengthByteValue === null) {
         throw new Error(`B"H: Failed to pack type ${type} and lengthSize ${valueLengthInfo.size}`);
     }
     const typeLengthByte = Buffer.from([typeLengthByteValue]); // Ensure it's a buffer


    if (fullBuffer) {
        // Old behavior: concatenate everything (only makes sense for non-parent-relative)
        if (metadataBuffer) {
            console.warn("B\"H: fullBuffer=true requested but value is parent-relative. Returning structure pointer buffer.");
             // This case is ambiguous. Return the metadataBuffer directly? Or wrap it?
             // Let's return the metadata buffer wrapped with its own type/length header.
            return Buffer.concat([typeLengthByte, valueLengthInfo.buffer, metadataBuffer]);
        } else {
            return Buffer.concat([typeLengthByte, valueLengthInfo.buffer, data]);
        }
    } else {
        // New behavior: return structure
        return {
            type,
            data, // Data for simple types
            metadataBuffer, // Metadata structure for nested types (parent-relative)
            valueLengthInfo, // Info about the length of data or metadataBuffer
            typeLengthByte: typeLengthByte.readUInt8(0) // Return the byte value for direct use
        };
    }
}

module.exports = serializeValue;