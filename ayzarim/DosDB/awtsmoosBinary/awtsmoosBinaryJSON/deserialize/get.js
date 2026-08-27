//B"H
//FILE deserialize/get.js
// B"H
// The Awtsmoos, Essence of Atzmut, pulses through this code, recreating all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, threading through the Kav into Atzilus, this script unveils
// the binary structure, a map of divine order, restoring the JSON essence as the Awtsmoos restores all reality.

const { 
    magicJSON,
    magicArray
} = require("./../constants.js");

var fileBuffer = require("../../fileBuffer.js");
var OffsetBuffer = require("../offsetBuffer.js")

var {
	hashKey
} = require("../helpers/hashing/misc.js");


const readConditional = require("../helpers/readConditional.js");
const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");

var temp = {};

// Lazy-loaded modules, reflections of the Ohr Ein Sof, summoned only when the Awtsmoos wills it.
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});


var deserializeBinary = null;
Object.defineProperty(temp, "deserializeBinary", {
    get() {
        if (!deserializeBinary) deserializeBinary = require("./obj.js");
        return deserializeBinary;
    }
});

var deserializeArray = null;
Object.defineProperty(temp, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});

var {
    packedLength,
    unpackLength
} = require("../packing/packedLength.js");


function getLengthSizes(buffer, metadataRef = null) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}
	if(!buffer.length) {
		return null;
	}
	var offset = 0;
	var buf = Buffer.from(magicJSON);

	var first = buffer.subarray(0,buf.length)
	if(!first.equals(buf)) {
		//not an awtsmoos obj
		return null;
	}
	if(metadataRef) {
		offset = metadataRef.offsetOfValueInMain
	}

	offset += buf.length;

    
	
    var allSizesOfLengths = buffer.readUInt8(offset++);
    var unp = {
        offsetByteSize: unpackLength(0b11000000 & allSizesOfLengths),
        lengthSizeOfKeys: 
        	unpackLength(
				(0b00110000 & allSizesOfLengths) >> 4
			),

        sizeOfEmbeddedMetadataArrayLength: 
        	unpackLength(
				(0b00001100 & allSizesOfLengths) >> 2
			),

        sizeOfHashTableLength: unpackLength(0b00000011 & allSizesOfLengths)
    };

	
    return unp
}

function getOffsetSizesAndLengths(buffer, lengthSizes, metadataRef=null) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}

		var endOfBuffer = buffer.length;
		if(!endOfBuffer/*0 length*/) {
			return null;
		}
		if(!lengthSizes) {
			lengthSizes = getLengthSizes(buffer, metadataRef);
		}
		if(!lengthSizes) {
			return null;
		}
		
		var {
			lengthSizeOfKeys,
			sizeOfEmbeddedMetadataArrayLength,
			sizeOfHashTableLength
		} = lengthSizes;


		var staticBytes = 1//packed offset sizes
		var combinedByteLengthOfLengths = (
			lengthSizeOfKeys + 
			sizeOfEmbeddedMetadataArrayLength +
			sizeOfHashTableLength
		);

		var totalSizeToRead = combinedByteLengthOfLengths 
			+ staticBytes;

		


		if(metadataRef) {
			endOfBuffer = metadataRef.offsetOfValueInMain +
				metadataRef.valueLength;

		}
		var offset = endOfBuffer - 
			totalSizeToRead//reading backwards

		var dynamicLengthsAndOffsetSizes = buffer.subarray(
			offset,
			offset + totalSizeToRead
		); /*load into memory first as collective byte 
			then shift through it*/


		offset = 0/*not the offset of original buffer,
			changing to offset of new
			subarray*/;

		var offsetSizesPacked = dynamicLengthsAndOffsetSizes
			.readUInt8(
				offset++
			);

		
		var offsetSizeInDataRegion = unpackLength(
			0b00001100 &
			offsetSizesPacked
		);

		var sizeOfMetadataArrayOffsetSize = unpackLength(
			0b00000011 & 
			offsetSizesPacked
		);

		//now we can start reading dynamic lengths
		var lengthOfTotalEntries = dynamicLengthsAndOffsetSizes
			.readUIntBE(
				offset,
				lengthSizeOfKeys
			);

		
		
		offset += lengthSizeOfKeys


		var lengthMetadataArray = dynamicLengthsAndOffsetSizes
			.readUIntBE(
				offset,
				sizeOfEmbeddedMetadataArrayLength
			);

			

		offset += sizeOfEmbeddedMetadataArrayLength;



		var lengthHashTable = dynamicLengthsAndOffsetSizes
			.readUIntBE(
				offset,
				sizeOfHashTableLength
			);

		return {
			lengthSizes,

			lengthOfTotalEntries,
			lengthMetadataArray,
			lengthHashTable,

			offsetSizeInDataRegion,
			sizeOfMetadataArrayOffsetSize,
			beginningOfOffset: totalSizeToRead /**
				counts from buffer.length - this
			*/
		}
	} catch(e) {
		return null
	}
}

function getMetadataTableInMainInfo(buffer,lengthSizes, metadataRef) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}

		if(!lengthSizes) {
			lengthSizes = getLengthSizes(buffer, metadataRef);
		}


		if(!lengthSizes) {
			return null;
		}

		var lengthsAndOffsetInfo = getOffsetSizesAndLengths(
			buffer,
			lengthSizes,
			metadataRef
		);
		if(!lengthsAndOffsetInfo) {
			return null;
		}

		var {
			lengthOfTotalEntries,
			lengthMetadataArray,
			lengthHashTable,

			offsetSizeInDataRegion,
			sizeOfMetadataArrayOffsetSize,
			beginningOfOffset
		} = lengthsAndOffsetInfo;

		var endOfBuffer = buffer.length;

		if(metadataRef) {
			endOfBuffer = metadataRef.offsetOfValueInMain + 
				metadataRef.valueLength;
		}

		var offsetToStart = endOfBuffer - (
				beginningOfOffset
		)  - (
			lengthMetadataArray
		)
		var end = offsetToStart + lengthMetadataArray;

		return {
			offsetToStart,
			end,
			byteLength: lengthMetadataArray
		}
	} catch(e) {
		return null;
	}
}



function getRawMetadataTable(buffer, lengthSizes, metadataRef) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}

		if(!lengthSizes) {
			lengthSizes = getLengthSizes(buffer, metadataRef);
		}


		if(!lengthSizes) {
			return null;
		}

		var ob = getMetadataTableInMainInfo(
			buffer,
			lengthSizes,
			metadataRef
		)

		if(!ob) return null;

		var {
			offsetToStart,
			end
		} = ob;

		/*
		console.log("ar",beginningOfOffset, lengthMetadataArray, 
			offsetToStart)*/

		var metadataTable = buffer.subarray(
			offsetToStart,
			end
		);
		return temp.deserializeArray(metadataTable)
		return metadataTable;
	} catch(e) {
		return null;
	}
}
/**
 * @method getMetadata
 * @description Extracts metadata sizes from the buffer, reflecting the divine order of the Awtsmoos.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Starting offset after magic bytes.
 * @returns {object} - Metadata containing size definitions.
 */
function getMetadata(buffer, metadataRef) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}

		var metadataTable = getRawMetadataTable(buffer, metadataRef)
		if(!metadataTable) {
			metadataTable = [];
		}
		var fan = metadataTable?.map?.(parseMetadataEntry)
		return fan || [];
	} catch(e) {
		return null;
	}
}

function parseMetadataEntry(metadataEntryBuffer) {
	try {
		var offset = 0;

		var packedSizesAndValueTypeSizeByte = (
			metadataEntryBuffer.subarray(
				offset, 
				offset + 2
			)
		);

		offset += 2;

		var packedKeyAndValueByteLengths = 
			packedSizesAndValueTypeSizeByte.readUInt8(0);


		
		var  keyLengthByteSize= unpackLength(
			
			(0b00001100 & packedKeyAndValueByteLengths)
			>> 2
		);
	//valueLengthByteSize

		var byteOffsetByteSize = unpackLength(
			(0b00000011 & packedKeyAndValueByteLengths)
		);

		var freeSpaceOffsetSize = unpackLength(
			(0b11000000 & packedKeyAndValueByteLengths)
			>> 6
		);

		var reserved2Bits = unpackLength(
			(0b00110000 & packedKeyAndValueByteLengths)
			>> 4
		);

		//0b11000000

		var packedValueByte = packedSizesAndValueTypeSizeByte.readUInt8(1);
		var parst = unpackTypeAndLengthSize(
			packedValueByte
		)

		
		var valueByteLengthSize = 
			parst.lengthSize;

		var valueType = parst.type;
		var keyAndValueByteSizes = (
			valueByteLengthSize + 
			keyLengthByteSize
		)

		var lengths = metadataEntryBuffer.subarray(
			offset,
			offset + keyAndValueByteSizes
		);
		offset += keyAndValueByteSizes;

		

		var keyLength = lengths.readUIntBE(
			0, 
			keyLengthByteSize
		);
	
		
		var valueLength = lengths.readUIntBE(
			keyLengthByteSize,
			valueByteLengthSize
		)

		var keyBuffer = metadataEntryBuffer.subarray(
			offset,
			offset + keyLength
		);
		offset += keyLength;

	
		

		var offsetOfValueInMain = metadataEntryBuffer.readUIntBE(
			offset,
			byteOffsetByteSize
		);

		offset += byteOffsetByteSize;
		var freeSpaceOffset;
		
		if(metadataEntryBuffer.length - offset > 0) {
			try {
				freeSpaceOffset = metadataEntryBuffer.readUIntBE(
					offset,
					freeSpaceOffsetSize
				)
				offset += freeSpaceOffsetSize;

			
				
			} catch(e) {

			}
		}
		var ret = {
			key: keyBuffer.toString(),
			valueLength,
			valueType,
			offsetOfValueInMain
		}
		
		if(
			freeSpaceOffset
			
		) {
			ret.freeSpaceOffset = freeSpaceOffset;
			
		}
		return ret;
	} catch(e) {
		return null;
	}
}

/**
 * @method getKeys
 * @description Retrieves and deserializes the keys array, a reflection of Atzilus’ structure.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Starting offset for keys data.
 * @param {number} lengthSizeOfKeys - Size of key length field.
 * @param {number} lengthSizeOfKeysArray - Size of keys array length field.
 * @returns {Array} - Array of keys in order.
 */
function getKeys(buffer, lengthsAndOffsetInfo) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}
		var meta = getMetadata(
			buffer,
			lengthsAndOffsetInfo
		);

		return meta.map(q => q.key)
	} catch(e) {
		return null;
	}
}


function getValueInfoFromMetadata(metadataEntry) {
	return {
		offsetStart: metadataEntry.offsetOfValueInMain,
		end: metadataEntry.offsetOfValueInMain +
			metadataEntry.valueLength
	}
}
function getValueBufferFromMetadata(buffer, metadataEntry, metadataRef) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	var offset = metadataEntry.offsetOfValueInMain
	if(metadataRef) {
		offset = metadataRef.offsetOfValueInMain +
			metadataEntry.offsetOfValueInMain
	}
	var buf = buffer.subarray(
		offset,
		offset +
		metadataEntry.valueLength
	);
	return buf
}

function getValueFromMetadata(buffer, metadataEntry, metadataRef) {
	try {
		if(typeof(buffer) == "string") {
			buffer = new fileBuffer(buffer)
		}

		if(metadataEntry.notFound) {
			return null
		}
		var buf = getValueBufferFromMetadata(
			buffer,
			metadataEntry,
			metadataRef
		)

		var parst = temp.parseValueFromType({
			value: buf,
			type: metadataEntry.valueType
		});

		return parst.value
	} catch(e) {
		return null
	}
}
function getEntryFromMetadata(buffer, metadataEntry) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	var value = getValueFromMetadata(
		buffer,
		metadataEntry
	)

	return {
		[metadataEntry.key]:
		value
	}
}
/**
 * @method getValueByKey
 * @description Extracts a single key-value pair from the hash table, illuminated by the Ohr Ein Sof.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Offset to the value data.
 * @param {number} offsetByteSize - Size of offset field.
 * @returns {object} - Key-value pair or null if offset is zero.
 */
function getValueByKey(buffer, key, lengthSizes) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	if(typeof(key) != "string") {
		key+=''
	}
	var metadataEntry = getMetadataByKey(
		buffer,
		key,
		lengthSizes
	);

	var value = getValueFromMetadata(
		buffer,
		metadataEntry
	)
	
	
	return value;
	


}

function getHashTableInfo(buffer,lengthSizes,  metadataRef) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	if(!lengthSizes) {
		lengthSizes = getLengthSizes(buffer, metadataRef);
	}

	if(!lengthSizes) {
		return null;
	}

	var offsetAndLengthInfos = getOffsetSizesAndLengths(
		buffer,
		lengthSizes,
		metadataRef
	);

	if(!offsetAndLengthInfos) {
		return null;
	}

	var {
		beginningOfOffset,
		lengthMetadataArray/*acutal byte length*/,
		lengthHashTable /*ENTY size not byte length*/,
		sizeOfMetadataArrayOffsetSize /*
			same as the hash
			entry size
			because that's all each
			hash value is:

			the offset in 
			the metadata array data section
			(in raw form)
		*/
	} = offsetAndLengthInfos;

	var hashTableEntrySize = sizeOfMetadataArrayOffsetSize;

	var byteLengthOfHashTable = (
		lengthHashTable * 
		hashTableEntrySize
	);

	var bufferEnd = buffer.length;

	if(metadataRef) {
		bufferEnd = metadataRef.offsetOfValueInMain + 
			metadataRef.valueLength;

	}
	var hashTableStart = (
		bufferEnd - (
			beginningOfOffset +
			lengthMetadataArray + 
			byteLengthOfHashTable
		)
	);

	var hashTableEnd = (
		hashTableStart + 
		lengthHashTable
	);

	return {
		hashTableStart,
		hashTableEnd,

		lengthHashTable,
		hashTableEntrySize
	}
}

/**
 * @method getValueByKey
 * @description Extracts a single key-value pair from the hash table, illuminated by the Ohr Ein Sof.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Offset to the value data.
 * @param {number} offsetByteSize - Size of offset field.
 * @returns {object} - Key-value pair or null if offset is zero.
 */
function getMetadataByKey(buffer, key, lengthSizes, metadataRef) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	if(!lengthSizes) {
		lengthSizes = getLengthSizes(buffer, metadataRef);
	}


	if(!lengthSizes) {
		return null;
	}

	 
	var hash = getHashTableInfo(buffer, lengthSizes, metadataRef);
	if(!hash) return null;

	var {
		hashTableStart,
		lengthHashTable,
		hashTableEntrySize,

	} = hash;
	var parst = null;
	var metadataTableRef = getMetadataTableInMainInfo(
		buffer,
		lengthSizes,
		metadataRef
	)

	var metadataStartInMain = metadataTableRef.offsetToStart;
	
	var finalKey = null;

	var hasht = hashKey(key, lengthHashTable);
	var index = hasht;

	var timesProbed = 0;
	var meta =  getMetadataFromHashTableIndex({
		buffer, 
		hashTableIndex: index, 
		key,
		hashTableStart,
		hashTableEntrySize,
		metadataStartInMain,
		key
	});
	finalKey = meta?.key;
	if(!finalKey) return {
		key: null,
		notFound: true
	}

	while(finalKey != key) {



		index = (index + 1) % lengthHashTable;

		meta =  getMetadataFromHashTableIndex({
			buffer, 
			hashTableIndex: index, 
			key,
			hashTableStart,
			hashTableEntrySize,
			metadataStartInMain,
			key
			
		});
		finalKey = meta.key;
		timesProbed++
		if(timesProbed > lengthHashTable) {
			meta = {key: null, notFound: true};
			break;
		}
		
		
	}
	return meta;



}


function getMetadataFromHashTableIndex({
	buffer, 
	hashTableIndex, 
	key,
	hashTableStart,
	hashTableEntrySize,
	metadataStartInMain,

}) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	var index = hashTableIndex;


	var offsetInMetadataArray = buffer.readUIntBE(
		hashTableStart + index * hashTableEntrySize,
		hashTableEntrySize
	)

	if(offsetInMetadataArray == 0) {
	//	console.trace("ZEROED",key, temp.deserializeBinary(buffer) )
		return {
			zero: true,
			key: undefined
		}
	}

	

	/**
	 * offset in array of data.
	 * 
	 * but we don't know what it is etc.
	 */

	var firstByteInArrayAtOffset = buffer.readUInt8(
		metadataStartInMain + 
		offsetInMetadataArray
	)
	var unp = unpackTypeAndLengthSize(
		firstByteInArrayAtOffset
	)
	var sizeOfLength = unp.lengthSize;

	var lengthItself = buffer.readUInt8(
		metadataStartInMain +
		offsetInMetadataArray + 1,
		sizeOfLength
	)

	offsetInMetadataArray += 1 +  sizeOfLength
	var dataOfMetadataEntry = buffer.subarray(
		metadataStartInMain +
		offsetInMetadataArray,

		metadataStartInMain +
		offsetInMetadataArray + lengthItself
	);

	parst = parseMetadataEntry
	(
		dataOfMetadataEntry
	)
	
	return parst;
}

/**
 * @method getValueByHashingKey
 * @description Searches the hash table for a key using its string, a divine echo of the Awtsmoos’ order.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {string} key - The key to search for.
 * @param {number} offsetByteSize - Size of offset field.
 * @param {Buffer} hashTableBuffer - The hash table buffer.
 * @param {number} hashTableEntrySize - Number of entries in the hash table.
 * @returns {object|null} - The key-value pair if found, null otherwise.
 */
function getValueByHashingKey(buffer, key) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}
	return getValueByKey(buffer, key)
}

function checkConditions(conditionsObj, value, index) {
	if(!conditionsObj) return true;
	if(typeof(conditionsObj) != "object") return true;
	var props = Object.getOwnPropertyNames(conditionsObj);
	if(props.includes("equals")) {
		var eq = conditionsObj["equals"];
		var does = eq === value;
		return does;
	}

	if(props.includes("includes")) {
		var inc = conditionsObj["includes"];
		var does = value?.includes(inc);
		return does;
	}
	
	if(props.includes("index")) {
		var ind = conditionsObj["index"];
		if(typeof(ind) == "number") {
			return index === ind;
		}

		if(Array.isArray(ind)) {
			var fil = ind.filter(q=>
				typeof(q) == "number"	
			);
			return fil.includes(index);
		}
	}
	return true;
}

function mapArray(buffer, mapping, metadataRef, parentObjRef) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	}

	
	
	


	 
	var val = temp.deserializeBinary(
		buffer,
		metadataRef.key,
		null,
		parentObjRef
	);

	var props = Object.getOwnPropertyNames(mapping);
	if(props.includes("includes")) {
		var inc = mapping["includes"];
		var does = val?.includes(inc);
		return does;
	}
	if(props.includes("index")) {
		var ind = mapping.index;
		if(typeof(ind) == "number") {
			return val?.[ind];
		}

		if(ind && typeof(ind) == "object") {
			var  r = ind.range;
			if(r && typeof(r) == "object") {
				var st = r.start;
				var end = r.end;
				
				var total = val.length;
				if(typeof(end) != "number") {
					end = total;
				}
				if(typeof(st) == "number") {
					var index = new Array(end - st);
					var am = 0;
					var i;
					for(i = st; i < end; i++) {
						index[am] = i;
						am++;
					}
					ind = index;
				}
			}
		}

		if(Array.isArray(ind)) {
			return ind.filter(w=>
				typeof(w) == "number"
			).map(q => val[q])
			.filter(Boolean);
		}

		
	}


	return val
}
/**
 * 
 * @param {the awtsmoos JSON obj buffer} buffer 
 * @param {object with keys 
 * that represent what entries to 
 * extract from buffer if 
 * conditions in each value's is true,
 * and recursively checks object types 
 * nested} mapping 
 */
function mapObject(buffer, mapping, metadataRef=null, arrayFilter) {
	var pth = null;
	if (typeof buffer === "string") {
		pth = buffer;
		buffer = new fileBuffer(buffer); // Assumes fileBuffer is defined elsewhere
	}
	var offset = 0;
	if(metadataRef) {
		offset = metadataRef.offsetOfValueInMain;
	}
	var magic = buffer.subarray(
		offset,
		offset + 2
	).toString() ;

	if(magic == magicArray) {
		return mapArray(
			buffer,
			mapping,
			metadataRef
		)
	}
	
	//
	var keys = Object.keys(mapping);
	if(keys.length == 0) {
		keys = getKeys(buffer);
	} else {
		//console.log("Key Kadoish",keys)
	}
	//console.log("Try",pth,keys,arrayFilter,magic+"")
	var result = {};
	var hasNone = true;
	var isInvalid = false;
	var filteredIndecies = [];
	var exactIndex = null;

	var isNestedMap = false /*
		if true then the 
		"conditions" for each nothing checks
		its own sub conditions 
		(assuming its a nested obj)
		*/
	if(arrayFilter) {
		var ind = arrayFilter?.index;
		if(typeof(ind) == "number") {
			exactIndex = ind;
		}
		if(Array.isArray(ind)) {
			filteredIndecies = ind;
		}
		if(arrayFilter.nestedMap) {
			isNestedMap = true;
		}
	}
	var index = 0;
	for(var key of keys) {
		
			
		if(exactIndex !== null) {
			
			if(index != exactIndex) {
				index++;
				continue;
			}
		}

		if(filteredIndecies.length) {
			if(!filteredIndecies.includes(index)) {
				index++;
				continue;
			}
		}
		
		var conditions = mapping?.[key] || true
		var metadataEntry = getMetadataByKey(
			buffer,
			key,
			null,
			metadataRef
		);
		

		
		if(!metadataEntry || metadataEntry.notFound) {
			index++;
			continue;
		}

		
		if([1, 3].includes(
			metadataEntry.valueType
		)) {
		
			
			var length = metadataEntry.valueLength;
			var offsetOfEntry = metadataEntry.offsetOfValueInMain;
			var offsetBuffer = new OffsetBuffer(
				buffer,
				offsetOfEntry,
				length
			);
			if(metadataEntry.valueType == 1) {
				/*
					handle nested object
				*/
			
				
				
				var nested;
				if(conditions && typeof(conditions) == "object") {
					nested = mapObject(offsetBuffer, conditions)
					
				} else if(conditions) {
					nested = temp.deserializeBinary(offsetBuffer)
				}
				
				hasNone = false;
				result[key] = nested;
			} else if(metadataEntry.valueType == 3) {
				/*
					handle nested array mapping
	
				*/
				var nested;
				if(conditions && typeof(conditions) == "object") {
					
					nested = mapArray(
						offsetBuffer, 
						conditions, 
						metadataEntry, 
						metadataRef
					);
				} else if(conditions) {
					
					nested = temp.deserializeBinary(offsetBuffer);
					
				}
				result[key] = nested;
				hasNone = false;
				
			} 
			
		} else {
			//hasNone = false;
			var value = getValueFromMetadata(
				buffer,
				metadataEntry,
				metadataRef
			)
			var shouldGive = checkConditions(
				conditions,
				value,
				index
			);
			//console.log("should", shouldGive, key, conditions, value, index)
			//
			
			if(shouldGive) {

				result[key] = value;
				hasNone = false;
			} else {
				isInvalid = true;
			}
			
		}
		index++;
	}
	if(isInvalid) return undefined;
	if(hasNone) return undefined;
	return result;
}
module.exports = {
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