//B"H


function writeToBuffer(buffer, value, byteSize, offset) {
    for (let i = 0; i < byteSize; i++) {
        buffer.writeUInt8((value >> (8 * (byteSize - 1 - i))) & 0xFF, offset + i);
    }
}


module.exports = writeToBuffer;