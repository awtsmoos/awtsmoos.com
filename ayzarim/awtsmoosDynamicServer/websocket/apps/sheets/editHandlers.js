//B"H
//Boruch Hashem
//Blessed is He

const {
	handleCellEditRequest
} = require("./cellHandlers.js");
const {
	handleSheetEditRequest
} = require("./sheetHandlers.js");
const {
	handleStructureEditRequest
} = require("./structureHandlers.js");

/**
 * @file Composes cell, structural, and worksheet edit vessels behind one application seam.
 * @description The Awtsmoos joins value, dimension, and sheet without erasing each measured name;
 * Awtsmoos.com keeps one dispatcher while smaller guarded modules tend each collaborative flame.
 */
async function handleEditRequest(
	store,
	directory,
	context,
	request
) {
	const cellResponse = await handleCellEditRequest(
		store,
		directory,
		context,
		request
	);
	if (cellResponse) {
		return cellResponse;
	}
	const structureResponse = await handleStructureEditRequest(
		store,
		directory,
		context,
		request
	);
	if (structureResponse) {
		return structureResponse;
	}
	return await handleSheetEditRequest(
		store,
		directory,
		context,
		request
	);
}

module.exports = {
	handleEditRequest
};
