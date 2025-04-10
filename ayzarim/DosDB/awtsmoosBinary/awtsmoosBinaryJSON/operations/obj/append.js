//B"H
var {
	magicJSON,
	magicArray
} = require("../../constants.js")
var appendToArray = require("../array/append.js")


var getObj = require("../../deserialize/get.js");
var des = require("../../deserialize/obj.js")
var serializeValue = require("../../serialize/serializeValue.js");

var serializeMetadataEntry = require("../../serialize/serializeMetadataEntry.js");

var fileBuffer = require("../../../fileBuffer.js")
/**
 * @method appendToJSON
 * @description Appends a key-value pair, extending the Awtsmoos’ weave.
 * @param {string} filename - File to append to
 * @param {string} key - Key to add
 * @param {any} value - Value to add
 */
function appendToJSON(filename, {
	key, 
	value
}={}) {
	var buffer = null;
	if(typeof(filename) == "string") {
		buffer = new fileBuffer(filename)
	} else {
		return null;
	}
	var offset = 0
	var magic = buffer.subarray(
		offset, 
		offset + 2
	).toString();

	if(magic == magicArray) {
		return appendToArray(filename, {
			value
		})
	}
	var valueBufferInfo = serializeValue(value, false);

	var lengthNeededForValue = valueBufferInfo.data.length;

	var raw = getObj.getRawMetadataTable(buffer)
	var meta = getObj.getMetadata(buffer)

	var av = 0;

	if(lengthNeededForValue) {
		av = findAvailableSlot(meta, lengthNeededForValue)
		av = av?.middle || av?.end
	}

	var newEntry = {
		key,
		valueLengthInfo: valueBufferInfo.valueLengthInfo,
		offsetOfValueInMain: av,
		typeLengthByte: valueBufferInfo.typeLengthByte
	}

	var serializedEntry = serializeMetadataEntry(
		newEntry
	)
	console.log(meta,raw, av,newEntry, serializedEntry)

}

function findAvailableSlot(entries, sizeNeeded) {
	var currentOffset = null;
	var curLength;

	var lastOffset = null;
	var foundOffset = null;

	var spaceBetweenEntries = 0;
	for(var q of entries) {
		
		currentOffset = q.offsetOfValueInMain;
		curLength = q.valueLength;
		if(lastOffset === null) {
			lastOffset = currentOffset + curLength;
		} else {
			lastOffset += curLength;
		}

		spaceBetweenEntries = (currentOffset + curLength) - 
			lastOffset;
		

 
		if(
			spaceBetweenEntries >= sizeNeeded
		) {
			console.log("RA",lastOffset,curLength,currentOffset,
				spaceBetweenEntries,
				sizeNeeded
			)
			foundOffset = currentOffset
			break;
		}
	}

	if(currentOffset === null) {
		return 0;
	}

	if(foundOffset !== null) {
		return {
			middle: foundOffset
		};
	}

	foundOffset = lastOffset;
	return {
		end: foundOffset
	}


}

module.exports = appendToJSON