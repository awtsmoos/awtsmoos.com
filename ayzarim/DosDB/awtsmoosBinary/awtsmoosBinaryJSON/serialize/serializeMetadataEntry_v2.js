// B"H
// Serializes a metadata entry object into a buffer for the metadata array.
// Now includes type/valueLength size info for potential rewrites.

const packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js");
const writeConditional = require("../helpers/writeConditional.js");
const { packedLength } = require("../packing/packedLength.js");

/**
 * Converts a metadata entry object into a Buffer.
 * Includes key, offset, lengths, and type info.
 * @param {object} entry - The metadata entry object. Expected properties:
 *   key (string), valueType (number), valueLength (number), offsetOfValueInMain (number),
 *   valueLengthInfo (object from writeConditional), typeLengthByte (number 0-255)
 * @returns {Buffer} The serialized buffer for this entry.
 * @throws If required fields are missing or packing fails.
 */
function entryToBuffer(entry) {
	const {
		key,
		valueType,
		valueLength, // Keep for consistency, but valueLengthInfo is primary now
		offsetOfValueInMain,
		valueLengthInfo, // Required: { size: number, buffer: Buffer }
		typeLengthByte   // Required: number (0-255) representing packed type/valueLengthInfo.size
	} = entry;

    if (typeof key !== 'string' || valueLengthInfo === undefined || typeof typeLengthByte !== 'number') {
         throw new Error(`B"H: Invalid metadata entry for key "${key}". Missing required fields (valueLengthInfo, typeLengthByte).`);
    }
    if (valueLengthInfo.size === undefined || !(valueLengthInfo.buffer instanceof Buffer)) {
         throw new Error(`B"H: Invalid valueLengthInfo structure for key "${key}".`);
    }


	const keyBuffer = Buffer.from(key, 'utf8');
    const keyLengthInfo = writeConditional(keyBuffer.length);
	const offsetInfo = writeConditional(offsetOfValueInMain); // Represents the offset *of the data*

    // --- Packing Byte 1: Key Length Size | Offset Size ---
	const packedLengthSizes = (
		(packedLength(keyLengthInfo.size) << 2) | // Bits 3-2: Size of Key Length Field
		// 0b00001100
		packedLength(offsetInfo.size)            // Bits 1-0: Size of Offset Field (offsetOfValueInMain)
		// 0b00000011
	);
     if (packedLengthSizes === null) { // packedLength returns null on error
          throw new Error(`B"H: Failed to pack key/offset sizes for key "${key}".`);
     }

    // --- Packing Byte 2: Reconstruct typeLengthByte ---
    // This byte combines valueType and the size of the valueLength field.
    // It should already be correctly provided in the input `entry`.
    // We could recalculate it for validation:
    // const recalcTypeLengthByteVal = packTypeAndLengthSize(valueType, valueLengthInfo.size);
    // if(recalcTypeLengthByteVal === null || recalcTypeLengthByteVal !== typeLengthByte) {
    //      throw new Error(`B"H: typeLengthByte mismatch or recalc error for key "${key}". Provided: ${typeLengthByte}, Recalculated: ${recalcTypeLengthByteVal}`);
    // }
    const typeAndValueLengthSizeByte = Buffer.from([typeLengthByte]);


	// --- Assemble Buffer ---
	return Buffer.concat([
		Buffer.from([packedLengthSizes]), // Byte 1: Packed sizes for KeyLength and OffsetOfValueInMain
		typeAndValueLengthSizeByte,       // Byte 2: Packed ValueType and ValueLength size
		keyLengthInfo.buffer,             // Dynamic: Key Length value
		valueLengthInfo.buffer,           // Dynamic: Value Length value
		offsetInfo.buffer,                // Dynamic: OffsetOfValueInMain value
		keyBuffer                         // Dynamic: Key itself
	]);
}

module.exports = entryToBuffer;