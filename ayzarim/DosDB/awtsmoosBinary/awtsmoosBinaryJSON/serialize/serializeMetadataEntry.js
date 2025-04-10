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
		typeLengthByte
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
	
	var valueLengthInfo = writeConditional(valueLength);
	if(!typeLengthByte) {

		
		typeLengthByte =  packTypeAndLengthSize(
			valueType,
			valueLengthInfo.size
		);
	}
	

	return Buffer.concat([

		Buffer.from([packedLengthSizes]),
		Buffer.from([typeLengthByte]),
		keyLengthInfo.buffer,

		valueLengthInfo.buffer,

		keyBuffer,

		bufferOffset.buffer
	])
}

module.exports = entryToBuffer;