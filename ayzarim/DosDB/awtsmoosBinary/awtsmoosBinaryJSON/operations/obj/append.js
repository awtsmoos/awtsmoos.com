//B"H
var {
	magicJSON,
	magicArray
} = require("../../constants.js")
var appendToArray = require("../array/append.js")


var deser = require("../../deserialize/obj.js");
var getObj = require("../../deserialize/get.js");

var serializeValue = require("../../serialize/serializeValue.js");



var makeHashTableFromMetadata = require("../../serialize/makeHashTableFromMetadata.js")
var getSerializedMetadata = require("../../serialize/getSerializedMetadata.js")


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
	offset += 2

	if(magic == magicArray) {
		return appendToArray(filename, {
			value
		})
	}
	var valueBufferInfo = serializeValue(value, false);

	var lengthNeededForValue = valueBufferInfo.data.length;

	
	var meta = getObj.getMetadata(buffer)
	
	var alreadyExists = meta.find(q => q.key == key);
	if(alreadyExists) {
	//	console.log("Exists", alreadyExists, meta)
		meta = markEntryAsDeleted(buffer, key, meta)
		
	}
	//console.log(meta, key);
	//console.log(meta, av,newEntry, serializedEntry);
	var total = getOffsetOfEndOfData(meta);
	var av = total;

	if(
		0
	//	lengthNeededForValue
	) {
		av = findAvailableSlot(meta, lengthNeededForValue)
		av = av?.middle || av?.end
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


	overwriteMetadataAndHashTable(
		buffer, 
		meta,
		valueBufferInfo.data
	);
	return meta;
}

function overwriteMetadataAndHashTable(
	buffer, 
	metadata,
	dataAtEnd = null
) {
	var {
		serializedMetadata: 
			serializedMetadataTable,
		hashTableSize,
		offsetSizeMetadataArray,
		hashBuffers
	} = makeHashTableFromMetadata(metadata);

	var headerSize = 3 //3 magic bys, 1 packed byte
	var totalDataSize = getOffsetOfEndOfData(metadata);


	var {
        footer,
        packedHeaderSizes: packAll
    } = getSerializedMetadata({
        serializedMetadataLength: serializedMetadataTable.length,
        offsetSizeMetadataArray,
        dataLength: totalDataSize,
        totalKeys: metadata.length,
        hashTableSize
    });

	var tail = Buffer.concat([
		
		dataAtEnd || 
		Buffer.alloc(0),
		hashBuffers,
		serializedMetadataTable,
		footer
	]);

	
	var offsetOfHeaderByte = magicJSON.length;
	buffer.writeUInt8(
		offsetOfHeaderByte,
		packAll
	);

	if(dataAtEnd) {
		totalDataSize -= dataAtEnd.length
	}

	var offsetToWriteTail = (
		totalDataSize
	)// - (dataAtEnd?.length || 0);
	


	var totalAdjustedSize = (
	//	headerSize + 
		totalDataSize + 
		tail.length
	)

	buffer.writeBuffer(
		offsetToWriteTail,
		tail
	);

	buffer.truncate(
		totalAdjustedSize
	) /*
		very important,
		was stuck on this
		for a while.
	*/

	
	
	
/*
	var red = buffer.subarray(0, buffer.length)
	
	//var des = deser(red)
	console.log(
		"total size expecetd",
		totalAdjustedSize,
		"actual",
		buffer.length,
		"meta",
		metadata,
		"tail",
		tail,
		offsetToWriteTail,
		headerSize,
		totalDataSize,
		
	//	des,
	"day",
		dataAtEnd,
		hashBuffers,
		serializedMetadataTable,
		"foot ",
		footer
	
	)

	red = Array.from(red).map(q=>q.toString(16))
	console.log(
		"ful",red
	)


	*/
		
}

function markEntryAsDeleted(buffer, key, metadata) {
	var ind = -1;
	var it = metadata.forEach((q,i) => {
		if(q.key == key) {
			ind = i;
		}
		
	})
	
	if(ind > -1) {
		metadata.splice(ind, 1)
	}

	
	overwriteMetadataAndHashTable(
		buffer,
		metadata
	);

	var newMeta = getObj.getMetadata(
		buffer
	)
	return newMeta;
	

	return metadata;
}

function getOffsetOfEndOfData(metadata) {
	var greatestOffset = 0;
	var endOffset = 0;
	metadata.forEach(q => {
		

		if(q.offsetOfValueInMain > greatestOffset) {
			greatestOffset = q.offsetOfValueInMain 

			endOffset = (
				greatestOffset + 
				q.valueLength
			);
		}
	});
	return endOffset;
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
			/*console.log("RA",lastOffset,curLength,currentOffset,
				spaceBetweenEntries,
				sizeNeeded
			)*/
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