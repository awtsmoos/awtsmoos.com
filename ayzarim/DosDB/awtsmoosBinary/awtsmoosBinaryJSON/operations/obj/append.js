//B"H
var {
	magicJSON,
	magicArray
} = require("../../constants.js")
var appendToArray = require("../array/append.js")

var serialist = require("../../serialize/obj.js")
var deser = require("../../deserialize/obj.js");
var getObj = require("../../deserialize/get.js");

var serializeValue = require("../../serialize/serializeValue.js");

var overwriteMetadataAndHashTable = require("./overwriteTail.js")

var markEntryAsDeleted = require("./deleteKeyFromJSON.js")
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

	if(magic == magicArray) {
		return appendToArray(filename, {
			value
		})
	}
	var obj = {};
	if(magic != magicJSON) {
		var ser = serialist(obj);
		buffer.writeBuffer(0, ser)
	}
	
	var valueBufferInfo = serializeValue(value, false);

	var lengthNeededForValue = valueBufferInfo.data.length;

	var meta = getObj.getMetadata(buffer)
	
	var alreadyExists = meta.find(q => q.key == key);
	if(alreadyExists) {
		
		meta = markEntryAsDeleted(buffer, key, meta)
		
	}
	
	
	var av = 0;

	var insertInMiddle = false;
	var slot = null;
	if(
	//	0
		lengthNeededForValue
	) {
		slot = findAvailableSlot(meta, lengthNeededForValue)

		
		if(slot.middle) {
			insertInMiddle = true;

		}
		av = slot?.middle || slot?.end
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
	
	overwriteMetadataAndHashTable(
		buffer, 
		meta,
		!insertInMiddle ? 
		valueBufferInfo.data
		: null
	);
	return meta;
}



function getTotalDataSize(metadata) {
	var leastOffset = null;
	var greatestOffset = 0;
	var totalSize = 0;
	metadata.forEach(q => {
		if(
			q.offsetOfValueInMain < leastOffset ||
			leastOffset === null
		) {
			leastOffset = q.offsetOfValueInMain
		}

		if(q.offsetOfValueInMain > greatestOffset) {
			greatestOffset = q.offsetOfValueInMain 

			totalSize = (
				greatestOffset + 
				q.valueLength
			) - leastOffset;
		}
	});
	return totalSize;
}

function findAvailableSlot(entries, sizeNeeded) {
	if (!entries || entries.length === 0) return { end: 3 };

	// Step 1: Sort entries by offset
	const sorted = [...entries].sort((a, b) => a.offsetOfValueInMain - b.offsetOfValueInMain);

	const gaps = [];

	for (let i = 0; i < sorted.length - 1; i++) {
		const curr = sorted[i];
		const next = sorted[i + 1];

		const endOfCurr = curr.offsetOfValueInMain + curr.valueLength;
		const startOfNext = next.offsetOfValueInMain;

		const gapSize = startOfNext - endOfCurr;

		if (gapSize >= sizeNeeded) {
			gaps.push({ offset: endOfCurr, size: gapSize });
		}
	}

	// Find the smallest gap that fits
	if (gaps.length > 0) {
		const bestFit = gaps.sort((a, b) => a.size - b.size)[0];
		return { middle: bestFit.offset };
	}

	// No suitable gap found, place at the end
	const lastEntry = sorted[sorted.length - 1];
	const endOffset = lastEntry.offsetOfValueInMain + lastEntry.valueLength;
	return { end: endOffset };
}



module.exports = appendToJSON