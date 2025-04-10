//B"H

var {
    magicJSON,
    magicArray

} = require("./constants.js");

var fileBuffer = require("../fileBuffer.js");

var arrayGet = require("./deserialize/getArray.js")
var objGet = require("./deserialize/get.js");

var parseValueFromKey
= require("./parsing/fromKey.js")



function getKeysFromBinary(buffer) {
    
    
    if(typeof(buffer) == "string") {
        
       buffer = new fileBuffer(buffer);
    }
    
    
   
    var magic = (buffer.subarray(0, magicArray.length)).toString();

    
    var keys = [];

    if(magic == magicJSON) {
        keys = objGet.getKeys(buffer);
        
        
    } else if(magic == magicArray) {
        var length = arrayGet.getLength(buffer);
        if(typeof(length) == "number") {
            keys = Array.from({length})
                .map((q,i) => i);
            
        } else {
            console.log("No array keys")
        }

    }
    return keys;
}


function getValueByKey(buffer, searchKey) {
 
    if(typeof(buffer) == "string") {
        buffer = new fileBuffer(buffer);
    }
   
    var magic = (buffer.subarray(0, magicArray.length)).toString();

    
    if(magic == magicJSON) {
        
        return objGet.getValueByKey(buffer, searchKey)

    } else if(magic != magicArray) {
        return {
            error: "nothing"
        }
    }

    return arrayGet.getValueByIndex(buffer, searchKey)
    
   
}


async function getValuesFromBinary(buffer, keys) {

    
    if(typeof(buffer) == "string") {
      //  wrap = new binaryFileWrapper(buffer);
      buffer = new fileBuffer(buffer);
    }
    var obj = {};
    for(var w of keys) {
        await getValueByKey(buffer, w)
    }
    return obj;
}

module.exports = {
    getKeysFromBinary,
    getValuesFromBinary,
    
    
    getValueByKey,
    parseValueFromKey
}