
// B"H
// Updated to use binaryHelpers
const { packTypeAndLengthSize, writeConditional, packedLength } = require("../../../utils/binaryHelpers.js");

function entryToBuffer(entry) {
    let { key, valueType, valueLength, offsetOfValueInMain, valueLengthInfo, typeLengthByte } = entry;

    const keyBuffer = Buffer.from(key, 'utf8');
    const keyLengthInfo = writeConditional(keyBuffer.length);
    const offsetInfo = writeConditional(offsetOfValueInMain);

    const packedLengthSizes = (packedLength(keyLengthInfo.size) << 2) | packedLength(offsetInfo.size);

    if (!valueLengthInfo) valueLengthInfo = writeConditional(valueLength);
    if (!typeLengthByte) typeLengthByte = packTypeAndLengthSize(valueType, valueLengthInfo.size);

    return Buffer.concat([
        Buffer.from([packedLengthSizes]),
        Buffer.from([typeLengthByte]),
        keyLengthInfo.buffer,
        valueLengthInfo.buffer,
        keyBuffer,
        offsetInfo.buffer
    ]);
}
module.exports = entryToBuffer;
