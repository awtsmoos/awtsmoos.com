//B"H

// Binary JSON Serializer and Database in Node.js
// Uses Buffers for efficient binary storage with a hashmap
var {
    logBuffer,
} = require("../awtsmoosBinaryHelpers.js");

var append = require("./operations/obj/append.js")
var deleteKeyFromObj = require("./operations/obj/deleteKeyFromJSON.js")
var  deserializeArray
 = require("./deserialize/array.js");

 var deserializeBinary
 = require("./deserialize/obj.js");

var serializeArray = require("./serialize/array.js");
var serializeJSON = require("./serialize/obj.js");

var fileBuffer = require("../fileBuffer.js");


var {
    getKeysFromBinary,
    getValuesFromBinary,
    
    
    getValueByKey,
    parseValueFromKey
} = require("./get.js");

var {
    getValueByKey,
	mapObject,
	getEntryFromMetadata,

	getMetadataByKey,
    getKeys,
    getMetadata,
    getValueByHashingKey,
	getLengthSizes,
	getOffsetSizesAndLengths,

	getHashTableInfo,
	getMetadataTableInMainInfo,
	getRawMetadataTable
} = require("./deserialize/get.js");

//var mapBinary = require("./map.js");

var {
    magicJSON,
    magicArray

} = require("./constants.js");

async function isAwtsmoosObject(buffer) {
    if(typeof(buffer) == "string") {
        buffer = new fileBuffer(buffer);
    }
    var mag = (await buffer.subarray(0,2)).toString()
    if(
        mag != magicJSON &&
        mag != magicArray
    ) {
        return false;
    }
    return true;
}







module.exports = { 
	appendToObj:append,
    deleteKeyFromObj,
	logBuffer, 
	serializeJSON, 
	deserializeBinary,


	serializeArray,
	serializeJSON,

	mapBinary: mapObject,
	fileBuffer,
	getKeysFromBinary,

	getValuesFromBinary,
    

	isAwtsmoosObject,
	deserializeArray,
    getMetadata,


    getValueByKey,
	mapObject,
	getEntryFromMetadata,

	getMetadataByKey,
    getKeys,
    getMetadata,
    getValueByHashingKey,
	getLengthSizes,
	getOffsetSizesAndLengths,

	getHashTableInfo,
	getMetadataTableInMainInfo,
	getRawMetadataTable
};
