// B"H
const { packedLength } = require("./packedLength.js");

function packTypeAndLengthSize(type, lengthSize) {
    const modifiedLength = packedLength(lengthSize);
    if (modifiedLength === null) return null;
    return type | (modifiedLength << 6);
}

module.exports = packTypeAndLengthSize;