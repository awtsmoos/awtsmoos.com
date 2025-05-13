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
		freeSpaceLength,
		freeSpaceOffset
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

	
	var freeSpaceOffsetWritten
	var freeSpaceSizeWrit
	if(freeSpaceOffset && freeSpaceEntries) {
		freeSpaceOffsetWritten = writeConditional(freeSpaceOffset)
		freeSpaceSizeWrit = writeConditional(freeSpaceLength);
		packedLengthSizes = (
			packedLength(
				freeSpaceOffsetWritten.size
			) << 6 |
			//0b11000000
			packedLength(
				freeSpaceSizeWrit.size
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
	];
	
	if(freeSpaceOffsetWritten && freeSpaceSizeWrit) {
		concatted.push(freeSpaceOffsetWritten.buffer);
		concatted.push(freeSpaceSizeWrit.buffer);
	}
	return Buffer.concat(concatted)
}

module.exports = entryToBuffer;