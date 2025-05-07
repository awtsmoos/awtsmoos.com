//B"H
//B"H
// B"H
const writeConditional = require("./helpers/writeConditional.js");
const readConditional = require("./helpers/readConditional.js");
const { packedLength } = require("./packing/packedLength.js");

const FREE_LIST_ENTRY_HEADER_SIZE = 1;
function makeAreaFree(buffer, startOffset, length) {
	var offInfo = writeConditional(startOffset);
	
}