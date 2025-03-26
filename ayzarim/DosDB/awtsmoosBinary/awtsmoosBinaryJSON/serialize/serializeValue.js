//B"H
var serializeArray = null;

var serializeJSON = null;


var packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js")


var writeConditional = require("../helpers/writeConditional.js");

module.exports = serializeValue;
var temp  = {};
Object.defineProperty(temp, "serializeArray", {
    get() {
        if (!serializeArray) serializeArray = require("./array.js");
        return serializeArray;
    }
});

Object.defineProperty(temp, "serializeJSON", {
    get() {
        if (!serializeJSON) serializeJSON = require("./obj.js");
        return serializeJSON;
    }
});

function serializeValue(value, fullBuffer = true) {
    var type = null;
    if (Array.isArray(value)) {
        type = 3;
        data = temp.serializeArray(value);
    } else if (typeof value === 'object' && value !== null) {
        type = 1;
        data = temp.serializeJSON(value);
    } else if (typeof value === 'string') {
        type = 2;
        data = Buffer.from(value, 'utf8');
    } else if (typeof value === 'number' && !isNaN(value)) {
        type = 4;
        data = writeConditional(value).buffer;
    } else if (typeof value === 'boolean') {
        if(value) {
            type = 0;
        } else {
            type = 5;
        }
        data = Buffer.alloc(0);
    } else if (value === undefined) {
        type = 6;
        data = Buffer.alloc(0);
    } else if (value === null) {
        type = 7;
        data = Buffer.alloc(0);
    } else if (value instanceof Buffer) {
        type = 8;
        data = value;
    }
    if(!fullBuffer)
        return {
            data,
            type
        }
    
    const valueLengthInfo = writeConditional(data.length, false);
    const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);

    var valueBuffer = Buffer.concat([
        typeLengthByte,//type of data and byte length of LENGTH
        valueLengthInfo.buffer, //actual length only
        data
    ]);
    return valueBuffer;
}

