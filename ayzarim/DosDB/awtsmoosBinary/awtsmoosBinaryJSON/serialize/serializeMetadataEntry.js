//B"H

/*
takes raw metadata obj and makes buffer out of 
it, to be used to add to metadata array (
    array of buffers
)
    */

const packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js");
const writeConditional = require("../helpers/writeConditional.js");

var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")

function entryToBuffer(entry) {
	var {
		key,
		valueType,
		valueLength,
		offsetOfValueInMain,
		valueLengthInfo,
		typeLengthByte,
		freeSpaceEntries,
		freeSpaceHead
	} = entry;

	const keyBuffer = Buffer.from(key, 'utf8');
    const keyLengthInfo = writeConditional(keyBuffer.length); // Raw length

	var bufferOffset = writeConditional(offsetOfValueInMain)


	var packedLengthSizes = (
		packedLength(
			keyLengthInfo.size
		) << 2 | 
	
		//0b00001100 | 
		packedLength(
			bufferOffset.size
		)
		//0b00000011
	);

	if(!valueLengthInfo) {
		valueLengthInfo = writeConditional(valueLength);
	}
	
	if(!typeLengthByte) {

		
		typeLengthByte =  packTypeAndLengthSize(
			valueType,
			valueLengthInfo.size
		);
	}
	//freeSpaceHead

	
	var freeSpaceHeadWritten
	var freeSpaceEntriesWrit
	if(freeSpaceHead && freeSpaceEntries) {
		freeSpaceHeadWritten = writeConditional(freeSpaceHead)
		freeSpaceEntriesWrit = writeConditional(freeSpaceEntries);
		packedLengthSizes = (
			packedLength(
				freeSpaceHeadWritten.size
			) << 6 |
			//0b11000000
			packedLength(
				freeSpaceEntriesWrit.size
			) << 4 | 
			//0b00110000
			packedLengthSizes
			//0b00001111
		);

	}

	var concatted = [

		Buffer.from([packedLengthSizes]),
		Buffer.from([typeLengthByte]),
		keyLengthInfo.buffer,

		valueLengthInfo.buffer,

		keyBuffer,

		bufferOffset.buffer
	]
	if(freeSpaceHeadWritten && freeSpaceEntriesWrit) {
		concatted.push(freeSpaceHeadWritten.buffer);
		concatted.push(freeSpaceEntriesWrit.buffer);
		
	}
	return Buffer.concat(concatted)
}

module.exports = entryToBuffer;