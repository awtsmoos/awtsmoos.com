//B"H

var getObj = require("../deserialize/get.js");
var des = require("../deserialize/obj.js")
var fileBuffer = require("../../../fileBuffer.js")
/**
 * @method appendToJSON
 * @description Appends a key-value pair, extending the Awtsmoos’ weave.
 * @param {string} filename - File to append to
 * @param {string} key - Key to add
 * @param {any} value - Value to add
 */
function appendToJSON(filename, key, value) {
	var buffer = null;
	if(typeof(filename) == "string") {
		buffer = new fileBuffer(filename)
	} else {
		return null;
	}
	var meta = getObj.getMetadata(buffer)
	console.log(meta)

}


module.exports = appendToJSON