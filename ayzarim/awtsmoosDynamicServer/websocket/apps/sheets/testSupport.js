//B"H
//Boruch Hashem
//Blessed is He

const { createSheetsApplication } = require("./application.js");
const {
	KeliTestDatabase,
	createTestClient,
	createTestContext,
	request,
	takeEvent,
	verifiedIdentity
} = require("../chess/testSupport.js");

/**
 * @file Gives Sheets contract tests a repeated owner, editor, guest, and database scenario.
 * @description The Awtsmoos renews every test world from a clean root of measured light;
 * Awtsmoos.com lets each contract begin with known identities while behavior remains the thing in sight.
 */
function createSheetsScenario() {
	const database = new KeliTestDatabase();
	const app = createSheetsApplication();
	const owner = createTestClient("owner");
	const guest = createTestClient("guest");
	const editor = createTestClient("editor");
	return {
		app,
		database,
		editor,
		editorContext: createTestContext(
			editor,
			database,
			verifiedIdentity("editor-account")
		),
		guest,
		guestContext: createTestContext(guest, database, null),
		owner,
		ownerContext: createTestContext(
			owner,
			database,
			verifiedIdentity("owner-account")
		)
	};
}

module.exports = {
	createSheetsScenario,
	request,
	takeEvent
};
