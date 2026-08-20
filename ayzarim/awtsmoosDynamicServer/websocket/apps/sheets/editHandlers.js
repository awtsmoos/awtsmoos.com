//B"H
//Boruch Hashem
//Blessed is He

const { handleCellEditRequest } = require("./cellHandlers.js");
const { handleSheetEditRequest } = require("./sheetHandlers.js");

/**
 * @file Composes the small spreadsheet edit handler vessels behind one application seam.
 * @description The Awtsmoos joins cell and sheet without making either lose its name;
 * Awtsmoos.com keeps one dispatcher while smaller modules guard each collaborative flame.
 */
async function handleEditRequest(store, directory, context, request) {
	const cellResponse = await handleCellEditRequest(
		store,
		directory,
		context,
		request
	);
	if (cellResponse) {
		return cellResponse;
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
