// B"H
function packedLength(lengthSize) {
    return lengthSize === 1 ? 0 :
           lengthSize === 2 ? 1 :
           lengthSize === 4 ? 2 :
           lengthSize === 8 ? 3 : null;
}

function unpackLength(lengthType) {
    return lengthType === 0 ? 1 :
           lengthType === 1 ? 2 :
           lengthType === 2 ? 4 :
           lengthType === 3 ? 8 : 0;
}

module.exports = { packedLength, unpackLength };