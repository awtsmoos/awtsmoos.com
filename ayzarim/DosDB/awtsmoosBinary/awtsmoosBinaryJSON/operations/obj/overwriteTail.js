//B"H
var {
	magicJSON,
	magicArray
} = require("../../constants.js")
var appendToArray = require("../array/append_old.js")

var fileBuffer = require("../../../fileBuffer.js")

var makeHashTableFromMetadata = require("../../serialize/makeHashTableFromMetadata.js")
var getSerializedMetadata = require("../../serialize/getSerializedMetadata.js")


function overwriteMetadataAndHashTable(
	buffer, 
	metadata,
	dataAtEnd = null
) {
	if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	} 
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

	var offsetToWriteTail = Math.max(
		3,
		totalDataSize
	)// - (dataAtEnd?.length || 0);
	


	var totalAdjustedSize = (
	//	headerSize + 
		totalDataSize + 
		tail.length
	)
	
	//console.log("Tota",totalDataSize,totalAdjustedSize)
	buffer.writeBuffer(
		offsetToWriteTail,
		tail
	);

	buffer.truncate(
		totalAdjustedSize
	)
	var magic = Buffer.from(magicJSON);
	buffer.writeBuffer(0, magic);
	/*console.log(magic,"M",buffer.subarray(0,buffer.length),offsetOfHeaderByte,
	tail,
	offsetToWriteTail,
	packAll
)
	/*
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
	return Math.max(3, endOffset);
}

module.exports = overwriteMetadataAndHashTable