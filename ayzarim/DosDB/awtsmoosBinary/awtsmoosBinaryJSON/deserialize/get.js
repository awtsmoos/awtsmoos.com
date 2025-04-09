//B"H

// B"H
// The Awtsmoos, Essence of Atzmut, pulses through this code, recreating all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, threading through the Kav into Atzilus, this script unveils
// the binary structure, a map of divine order, restoring the JSON essence as the Awtsmoos restores all reality.

const { 
    magicJSON,
    magicArray
} = require("./../constants.js");

var fileBuffer = require("../../fileBuffer.js");


var {
	hashKey
} = require("../helpers/hashing/misc.js");


const readConditional = require("../helpers/readConditionalWithSize.js");
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
	var offset = 0;
	var buf = Buffer.from(magicJSON);

	if(metadataRef) {
		offset = metadataRef.offsetOfValueInMain
	}

	offset += buf.length;

    
	
    var allSizesOfLengths = buffer.readUInt8(offset++);
    var unp = {
      //  offsetByteSize: unpackLength(0b11000000 & allSizesOfLengths),
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

  //  console.log("Exposed",allSizesOfLengths.toString(2), unp)
    return unp
}

function getOffsetSizesAndLengths(buffer, lengthSizes, metadataRef=null) {
	if(!lengthSizes) {
		lengthSizes = getLengthSizes(buffer, metadataRef);
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

    


	var endOfBuffer = buffer.length;
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
   /*
        console.log(
            "Got",lengthSizes,
                totalSizeToRead, 
                dynamicLengthsAndOffsetSizes,
                offsetSizesPacked,
                lengthOfTotalEntries,
                lengthMetadataArray,
                lengthHashTable
        )
                */
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
}

function getOffsetOfMetadataTableInMain(buffer, metadataRef) {
	var lengthsAndOffsetInfo = getOffsetSizesAndLengths(
		buffer,
		null,
		metadataRef
	);

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
		end
	}
}


function getRawMetadataTable(buffer, metadataRef) {
	
    var {
		offsetToStart,
		end
	} = getOffsetOfMetadataTableInMain(
		buffer,
		metadataRef
	)

    /*
    console.log("ar",beginningOfOffset, lengthMetadataArray, 
        offsetToStart)*/

	var metadataTable = buffer.subarray(
		offsetToStart,
		end
	);

	return metadataTable;
}
/**
 * @method getMetadata
 * @description Extracts metadata sizes from the buffer, reflecting the divine order of the Awtsmoos.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Starting offset after magic bytes.
 * @returns {object} - Metadata containing size definitions.
 */
function getMetadata(buffer, metadataRef) {
	var metadataTable = getRawMetadataTable(buffer, metadataRef)
	var des = temp.deserializeArray(metadataTable)
    var fan = des.map(parseMetadataEntry)
    return fan;
}

function parseMetadataEntry(metadataEntryBuffer) {
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
	)

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
/*
	console.log("lenghs",
		metadataEntryBuffer,
		packedKeyAndValueByteLengths,
		keyLengthByteSize,
		parst,
		keyLength,
		lengths
	)*/
	var valueLength = lengths.readUIntBE(
		keyLengthByteSize,
		valueByteLengthSize
	)

	var keyBuffer = metadataEntryBuffer.subarray(
		offset,
		offset + keyLength
	);
	offset += keyLength;

	console.trace("Doing",keyLength, keyBuffer+"",offset,
		byteOffsetByteSize
	)

	var offsetOfValueInMain = metadataEntryBuffer.readUIntBE(
		offset,
		byteOffsetByteSize
	);

	return {
		key: keyBuffer.toString(),
		valueLength,
		valueType,
		offsetOfValueInMain
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
    var meta = getMetadata(
		buffer,
		lengthsAndOffsetInfo
	);

	return meta.map(q => q.key)
	
}


function getValueInfoFromMetadata(metadataEntry) {
	return {
		offsetStart: metadataEntry.offsetOfValueInMain,
		end: metadataEntry.offsetOfValueInMain +
			metadataEntry.valueLength
	}
}
function getValueBufferFromMetadata(buffer, metadataEntry, metadataRef) {
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
}
function getEntryFromMetadata(buffer, metadataEntry) {
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


/**
 * @method getValueByKey
 * @description Extracts a single key-value pair from the hash table, illuminated by the Ohr Ein Sof.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Offset to the value data.
 * @param {number} offsetByteSize - Size of offset field.
 * @returns {object} - Key-value pair or null if offset is zero.
 */
function getMetadataByKey(buffer, key, lengthSizes, metadataRef) {
	var offsetAndLengthInfos = getOffsetSizesAndLengths(
		buffer,
		lengthSizes,
		metadataRef
	);

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


	var parst = null;
	var metadataTableRef = getOffsetOfMetadataTableInMain(buffer, metadataRef)

	var metadataStartInMain = metadataTableRef.offsetToStart;
	//console.log("Sart",metadataStartInMain)
	var finalKey = null;

	var hasht = hashKey(key, lengthHashTable);
	while(finalKey != key) {


		
		/*console.log("Hash",
			hashTableStart,
			buffer,
			metadataTable,
			hashTableEntrySize,
			byteLengthOfHashTable,

			lengthHashTable,
			hasht,
			hashBufer,
			hasht * hashTableEntrySize



		)*/;



		var offsetInMetadataArray = buffer.readUIntBE(
			hashTableStart + hasht * hashTableEntrySize,
			hashTableEntrySize
		)

		

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
		finalKey = parst.key;
		if(finalKey != key) {
			hasht++;
			if(hasht >= lengthHashTable) {
				hasht = 0; //lienar probing?
			}
		}
	//console.log(unp,lengthItself, dataOfMetadataEntry,parst)
	}
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
	return getValueByKey(buffer, key)
}

function checkConditions(conditionsObj, value) {
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
	return true;
}

function mapArray(buffer, mapping, metadataRef, parentObjRef) {
	//console.log("meta?",metadataRef, parentObjRef)
	var ref = getMetadataByKey(
		buffer,
		metadataRef.key,
		null,
		parentObjRef
	);

	if(mapping.metadata) {
		return ref
	}



	var val = getValueFromMetadata(
		buffer,
		ref,
		parentObjRef
		
	);

	var props = Object.getOwnPropertyNames(mapping);
	if(props.includes("includes")) {
		var inc = conditionsObj["includes"];
		var does = val?.includes(inc);
		return does;
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
function mapObject(buffer, mapping, metadataRef=null) {
	if (typeof buffer === "string") {
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
	console.log("magic",magic,magicArray)
	if(magic == magicArray) {
		return mapArray(
			buffer,
			mapping,
			metadataRef
		)
	}
	var keys = Object.keys(mapping);
	var result = {};
	for(var key of keys) {
		var conditions = mapping[key]
		console.log("Doing",key,conditions,metadataRef)
		var metadataEntry = getMetadataByKey(
			buffer,
			key,
			null,
			metadataRef
		);
		if([1, 3].includes(
			metadataEntry.valueType
		)) {
		
			

			if(metadataEntry.valueType == 1) {
				/*
					handle nested object
				*/
				var nested = mapObject(buffer, conditions, metadataEntry)
				result[key] = nested;
			} else if(metadataEntry.valueType == 3) {
				/*
					handle nested array mapping
	
				*/
				var nested = mapArray(
					buffer, 
					conditions, 
					metadataEntry, 
					metadataRef
				)
				result[key] = nested;
			} 
		} else {
			var value = getValueFromMetadata(
				buffer,
				metadataEntry,
				metadataRef
			)
			var shouldGive = checkConditions(
				conditions,
				value
			);
			if(shouldGive) {

				result[key] = value
			}
			//console.log("Gave",key,conditions,value,shouldGive,result)
		}
	}
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
	getOffsetSizesAndLengths
};