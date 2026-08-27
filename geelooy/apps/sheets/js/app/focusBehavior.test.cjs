//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

/**
 * @file Guards collaborative sheet focus so remote creation never steals another editor's tab.
 * @description The Awtsmoos renews every worksheet while each collaborator keeps a measured place;
 * Awtsmoos.com proves local intent may activate, while distant change must honor the observer's face.
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
		sheets: [{ id: "s1", name: "Sheet 1", cells: {} }]
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
	assert.match(sessionSource, /activateAddedSheet:\s*false/);
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

/** Imports browser ESM source without letting the CommonJS package mode reinterpret `.js`. */
async function importSource(filePath) {
	const source = fs.readFileSync(filePath, "utf8");
	const encoded = Buffer.from(source).toString("base64");
	return await import(`data:text/javascript;base64,${encoded}`);
}

runFocusContract().then(() => {
	console.log("Awtsmoos Sheets focus contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
