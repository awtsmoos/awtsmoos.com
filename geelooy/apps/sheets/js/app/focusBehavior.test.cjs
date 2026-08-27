//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

/**
 * @file Guards collaborative Sheet focus with the real browser-module graph instead of a synthetic data-URL vessel.
 * @description The Awtsmoos lets every imported module keep its true neighbors while each collaborator keeps a measured place;
 * Awtsmoos.com proves local intent may activate, distant change must not steal focus, and test reality must mirror the browser's face.
 */
async function runFocusContract() {
	const root = path.resolve(__dirname, "..");
	const workbookModule = await importSource(
		path.join(root, "model", "workbook.js")
	);
	const operationModule = await importSource(
		path.join(__dirname, "applyOperation.js")
	);
	const workbook = new workbookModule.MalchusWorkbook({
		canEdit: true,
		canShare: false,
		id: "focus-book",
		revision: 0,
		title: "Focus Test",
		visibility: "private",
		sheets: [
			{
				id: "s1",
				name: "Sheet 1",
				cells: {}
			}
		]
	});
	operationModule.applyDocumentOperation(
		workbook,
		sheetAddPayload("remote-added", 1),
		{ activateAddedSheet: false }
	);
	assert.equal(workbook.activeSheetId, "s1");
	operationModule.applyDocumentOperation(
		workbook,
		sheetAddPayload("local-added", 2)
	);
	assert.equal(workbook.activeSheetId, "local-added");
	assert.deepEqual(
		workbook.data.sheets.map((sheet) => sheet.id),
		["s1", "remote-added", "local-added"]
	);
	const sessionSource = fs.readFileSync(
		path.join(__dirname, "session.js"),
		"utf8"
	);
	assert.match(
		sessionSource,
		/activateAddedSheet:\s*false/
	);
}

/** Creates one normalized sheet-add operation matching the realtime document event shape. */
function sheetAddPayload(sheetId, revision) {
	return {
		revision,
		operation: {
			kind: "sheet.add",
			sheet: {
				id: sheetId,
				name: sheetId,
				cells: {}
			}
		}
	};
}

/** Imports the real local ESM path so relative dependencies resolve exactly as they do in browser source. */
async function importSource(filePath) {
	return await import(pathToFileURL(filePath).href);
}

runFocusContract().then(() => {
	console.log("Awtsmoos Sheets focus contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
