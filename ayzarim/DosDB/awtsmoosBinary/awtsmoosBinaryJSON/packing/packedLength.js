//B"H
function packedLength(lengthSize/*number from 1 - 8*/) {
    var modifiedLength = (
        lengthSize == 1 ? 0 :
        lengthSize == 2 ? 1 :
        lengthSize == 4 ? 2 :
        lengthSize == 8 ? 3 : null
    );
    if(modifiedLength === null) {
        console.log("Error in size: only 0 2 4 8");
        return null;
    }
    return modifiedLength
}
function unpackLength(lengthType) {
    var realLength = (
        lengthType == 0 ? 1:
        lengthType == 1 ? 2:
        lengthType == 2 ? 4:
        lengthType == 3 ? 8 : 0
    );
    return realLength;
}
module.exports = {packedLength, unpackLength};