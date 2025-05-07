//B"H
//B"H
// B"H
const writeConditional = require("./helpers/writeConditional.js");
const readConditional = require("./helpers/readConditional.js");
const { packedLength } = require("./packing/packedLength.js");
var {
	getLengthSizes
} = require("../deserialize/get.js");
var bufferHeaderSize = 3 //magic + packed byte;

const FREE_LIST_ENTRY_HEADER_SIZE = 1;
function makeAreaFree(buffer, startOffset, length) {
	var offInfo = writeConditional(startOffset);

}

function traverseFreeList(buffer) {
	var len = getLengthSizes(buffer);
	var sizeOfFreeSpaceOffset = len.offsetByteSize;
	var freeSpaceHead = buffer.readUInt(
		bufferHeaderSize
	)
}