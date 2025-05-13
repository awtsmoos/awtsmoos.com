//B"H
var {
	magicJSON,
	magicArray
} = require("../../constants.js")

var serialist = require("../../serialize/obj.js")
var deser = require("../../deserialize/obj.js");
var getObj = require("../../deserialize/get.js");

var getFreeSpaceOrganized = require("./getFreeSpace.js");
var getTotalDataSize = require("./getTotalSpace.js");


var serializeValue = require("../../serialize/serializeValue.js");

var overwriteMetadataAndHashTable = require("./overwriteTail.js")

var markEntryAsDeleted = require("./deleteKeyFromJSON.js");

var {
	updateSortedFreeSpaceAcrossMetadata
} = require("./makomChafshee_manual.js")
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
	if(typeof(key) == "number") {
		key+=""
	}
	var offset = 0
	var magic = buffer.subarray(
		offset, 
		offset + 2
	).toString();
	offset += 2
/*
	if(magic == magicArray) {
		return appendToArray(filename, {
			value
		})
	}*/
	var obj = {};
	if(magic != magicJSON) {
		var ser = serialist(obj);
		buffer.writeBuffer(0, ser)
	}
	
	var valueBufferInfo = serializeValue(value, false);

	var lengthNeededForValue = valueBufferInfo.data.length;

	var meta = getObj.getMetadata(buffer)
	
	var alreadyExists = meta.find(q => q.key == key);
	var freeSpace = null;
	var res;
	if(alreadyExists) {
		
		res = markEntryAsDeleted(buffer, key, meta)
		if(res.metadata) {
			meta = res.metadata;
		}
		if(res.freeSpace) {
			freeSpace = res.freeSpace;
		}
	}
	if(!freeSpace) {
		freeSpace = getFreeSpaceOrganized(meta);
	}
	
	
	var av = 0;

	var insertInMiddle = false;
	var slot = null;
	if(
	//	0
		lengthNeededForValue
	) {
		slot = findAvailableSlot(freeSpace, lengthNeededForValue, meta)

		
		if(slot?.middle) {
			insertInMiddle = true;
			av = slot.middle
		} else {
			av = slot?.end
		}

		
		
	}

	

	var newEntry = {
		key,
		valueLength: valueBufferInfo.length,
		valueType: valueBufferInfo.type,
		valueLengthInfo: valueBufferInfo.valueLengthInfo,
		offsetOfValueInMain: av,
		typeLengthByte: valueBufferInfo.typeLengthByte
	}

	var serializedEntry = (
		newEntry
	);


	meta.push(serializedEntry);
	if(insertInMiddle) {
		buffer.writeBuffer(
			av,
			valueBufferInfo.data
		)
	}
	
	var newFreeSpace = getFreeSpaceOrganized(meta);
	var total = getTotalDataSize(meta)
	
	meta = updateSortedFreeSpaceAcrossMetadata(meta, {
		buffer
	})
	overwriteMetadataAndHashTable(
		buffer, 
		meta,
		!insertInMiddle ? 
		valueBufferInfo.data
		: null
	);
	return {
		freeSpace: newFreeSpace,
		totalSpace: total,
		metadata: meta
	}
}


function findAvailableSlot(freeSpace, sizeNeeded, metadata) {
	if(!freeSpace || !metadata) {
		 return { end: 3 };

	}
	var gaps = freeSpace;
	
	// Find the smallsest gap that fits

	const bestFit = gaps.find(q=> q.size >= sizeNeeded)
	
	
	if (bestFit) {
		return { middle: bestFit.offset };
	}

	const sorted = [...metadata].sort((a, b) => a.offsetOfValueInMain - b.offsetOfValueInMain);
	if(!sorted.length) {
		return {
			end: 3
		}
	}
	// No suitable gap found, place at the end
	const lastEntry = sorted[sorted.length - 1];
	const endOffset = lastEntry.offsetOfValueInMain + lastEntry.valueLength;
	
	return {
		end: endOffset
	}
}



module.exports = appendToJSON