//B"H

var deserializeBinary = require("../deserialize/obj.js");
var deserializeArray = require("../deserialize/array.js");


var {
    readConditional
} = require("../../awtsmoosBinaryHelpers.js");

async function parseValueFromType({
    value,
    type,
    currentOffset
}) {
    if(type == 1) {

        currentOffset += value.length
        value = await deserializeBinary(value)

    } else if(type == 2) {
        
        currentOffset += value.length
        value = value+""
    } else if (type == 3) {

        currentOffset += value.length
        value = await deserializeArray(value);
        
    } else if (type == 4) {
        try {
            var info = await readConditional(value)
            value = info.amount;
            currentOffset += info.offset
        } catch(e) {
            console.log(
                "ISSUE! reading. want to nkow",
                value,
                e
            )
            throw new Error("Wow..")
        }
    } else if(type == 5) {
        
        value = true;

    } else if(type === 0) {
        value = false;
    } else if(type == 6) {
        value = undefined;
    } else if(type == 7) {
        value = null;
    } else if(type == 8) {
        currentOffset += value.length;


        value = Buffer.from(value)
    }
    return {value,currentOffset};
}

module.exports = parseValueFromType;