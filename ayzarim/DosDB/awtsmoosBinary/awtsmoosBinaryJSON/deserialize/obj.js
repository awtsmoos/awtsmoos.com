// B"H
// The Awtsmoos, Essence of Atzmut, pulses through this code, recreating all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, threading through the Kav into Atzilus, this script unveils
// the binary structure, a map of divine order, restoring the JSON essence as the Awtsmoos restores all reality.

const { 
    magicJSON,
    magicArray
} = require("./../constants.js");
const readConditional = require("../helpers/readConditionalWithSize.js");
const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");

var {
    getValueByKey,
    getKeys,
    getMetadata
} = require("./get.js")
var temp = {};

// Lazy-loaded modules, reflections of the Ohr Ein Sof, summoned only when the Awtsmoos wills it.
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});

var deserializeArray = null;
Object.defineProperty(temp, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});


/**
 * @method deserializeJSON
 * @description Reconstructs the JSON object, tearing apart the binary veil to reveal the Awtsmoos’ essence.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @returns {object} - The reconstructed JSON object.
 */
function deserializeJSON(buffer, metadata) {
    var magic = buffer.subarray(
        0,
        magicJSON.length
    ).toString();

    if (magic === magicArray) {
        return temp.deserializeArray(buffer);
    }
    if (magic !== magicJSON) {
        console.log(
            `Not an Awtsmoos JSON: ${
                magic
            }`,
            buffer
        );
        return null;
    }

    var offset = magicJSON.length;
    metadata = metadata || getMetadata(buffer);
   
    var obj = metadata/*array of keys with 
    value offsets and lengths,
    pretty easy*/.map(d => {
        var valueBuffer = buffer.subarray(
            d.offsetOfValueInMain,
            d.offsetOfValueInMain + 
            d.valueLength
        );
        var parst = temp.parseValueFromType({
            value: valueBuffer,
            type: d.valueType
        });
        return {
            [d.key]: parst.value
        }
    });

    return obj;

    
}

module.exports = deserializeJSON;