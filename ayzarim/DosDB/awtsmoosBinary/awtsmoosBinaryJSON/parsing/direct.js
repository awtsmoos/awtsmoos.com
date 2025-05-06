//B"H
var parseValueFromType = require("./fromType.js")
var 
    readConditional
 = require("../helpers/readConditional.js")

var unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");

function directlyParseValue(valueBuffer) {
    if(!(valueBuffer instanceof Buffer)) {
        return null;
    }
    var valueLengthAndTypeByte = valueBuffer.readUInt8(0);

    var unpacked = unpackTypeAndLengthSize(valueLengthAndTypeByte);
    var {
        type,
        lengthSize
    } = unpacked
    var offset = 1//past the type/length size byte
    //console.log("GOT",unpacked, type,lengthSize,offset,valueBuffer, valueLengthAndTypeByte)
    
    var lengthOfDataInfo = readConditional(
        valueBuffer,
        offset,
        lengthSize
    );

    var offset = lengthOfDataInfo.offset;
    var rawData = valueBuffer.subarray(
        offset,
        lengthOfDataInfo.amount + offset
    )

    var valueResult = parseValueFromType({
        value/*raw*/: rawData,
        type
    });
    var value = valueResult.value;
    return value;

}

module.exports = directlyParseValue;