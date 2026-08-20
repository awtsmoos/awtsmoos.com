//B"H
//Boruch Hashem
//Blessed is He

const {
	handleAnnotationRequest
} = require("./annotationHandlers.js");
const {
	handleValueRequest
} = require("./valueHandlers.js");

/**
 * @file Composes value and annotation mutations behind one cell-editing seam.
 * @description The Awtsmoos joins letter, note, and color without collapsing each measured name;
 * Awtsmoos.com keeps one cell gateway while smaller vessels guard each collaborative flame.
 */
async function handleCellEditRequest(store, directory, context, request) {
	const valueResponse = await handleValueRequest(
		store,
		directory,
		context,
		request
	);
	if (valueResponse) {
		return valueResponse;
	}
	return await handleAnnotationRequest(
		store,
		directory,
		context,
		request
	);
}

module.exports = {
	handleCellEditRequest
};
