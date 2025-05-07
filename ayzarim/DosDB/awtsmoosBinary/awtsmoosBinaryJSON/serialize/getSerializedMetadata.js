//B"H

var writeConditional = require("../helpers/writeConditional.js");


var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")

function getSerializedMetadata({
	serializedMetadataLength,
	offsetSizeMetadataArray,
	dataLength,
	totalKeys,
	hashTableSize,
	freeSlotOffsetByteSize=1
} = {}) {

    var sizeOfMetadataArrayInfo = writeConditional(serializedMetadataLength);


    /**
     * make packed byte
     * with all size bytes (2 bits each 0 1 2 3 = 
     * 1 2 4 8) packed
     */
    var sizeOfMetadataArrayOffsetSizePacked = packedLength(
        offsetSizeMetadataArray
    );

    var sizeOfEmbeddedMetadataArrayLength = packedLength(
        sizeOfMetadataArrayInfo.size
    )


    // Offset size: Determined by data length
    const offsetSize = dataLength < 256 ? 1 
        : dataLength < 65536 ? 2 
        : dataLength < 4294967296 ? 4 
        : 8;

    var packedOffsetSize = packedLength(
        offsetSize
    );

    var totalEntriesLength = writeConditional(
        totalKeys
    );
    var byteSizeOfTotalEntriesLength = packedLength(
        totalEntriesLength.size
    );



    var lengthInfoOfHashTable = writeConditional(hashTableSize);
    
    var sizeOfHashTableLength = packedLength(
        lengthInfoOfHashTable.size
    );


    var packAll = (

            /*first 2 bits 
			size of first node
			in free space list.

			If set to 0 (meaning 1 byte),
			 no free space,
			so headers are just this
			one byte, plus 1 byte right 
			after. then rest is
			footers;

			If it is set to a greater
			value (1 = 2, 2 = 4, 3 = 8)
			we read that many bytes
			right after this header.

			Those bytes tell us the 
			offset of the next available
			free space slot. If it equals 0,
			then we have no free space
			(since offset must be 
			greater than header at least).

			If it's non zero value (and 
			greater than headers),
			we read the header(s) starting at
			that offset to tell us
			the length, then consider 
			that entire area as free.

			Incidentally, this is 
			also the offset size for 
			all entries in the entire object.
			*/
			(freeSlotOffsetByteSize << 6) |
			//0b11000000
            (byteSizeOfTotalEntriesLength << 4) |
            //0b00110000
            (sizeOfEmbeddedMetadataArrayLength << 2) |
            //0b00001100
            (sizeOfHashTableLength)
            //0b00000011
        )
    
    
    
    
    
    

  


       
    var offsetSizesPacked = 
        (packedOffsetSize << 2) | 
        //0b00001100
        (sizeOfMetadataArrayOffsetSizePacked);
        //0b00000011, 

    var footer = (Buffer.concat([

        Buffer.from([offsetSizesPacked]),

        totalEntriesLength.buffer,
        sizeOfMetadataArrayInfo.buffer,
        lengthInfoOfHashTable.buffer
        
    ]));

	return {
		footer,
		packedHeaderSizes: packAll
	}
}
module.exports = getSerializedMetadata