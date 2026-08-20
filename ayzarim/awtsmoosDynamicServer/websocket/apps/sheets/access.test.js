//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	createSheetsScenario,
	request,
	takeEvent
} = require("./testSupport.js");

/**
 * @file Proves Awtsmoos Sheets ownership, public viewing, editor ACLs, and safe discovery.
 * @description The Awtsmoos shines beyond private and public while software must guard each gate;
 * Awtsmoos.com proves view, edit, and share authority before living sockets inherit that state.
 */
async function runAccessContract() {
	const scenario = createSheetsScenario();
	const {
		app,
		editorContext,
		guest,
		guestContext,
		ownerContext
	} = scenario;
	const created = await app.handleVersioned(
		ownerContext,
		request("sheets.document.create", { title: "Shared Light" })
	);
	const workbookId = created.payload.workbook.id;
	const sheetId = created.payload.workbook.sheets[0].id;
	assert.equal(created.payload.workbook.canEdit, true);
	assert.equal(created.payload.workbook.canShare, true);
	assert.equal(created.payload.workbook.visibility, "private");
	await assert.rejects(
		() => app.handleVersioned(
			guestContext,
			request("sheets.document.open", { id: workbookId })
		),
		(error) => error.code === "SHEETS_VIEW_DENIED"
	);
	await app.handleVersioned(
		ownerContext,
		request("sheets.share.update", {
			id: workbookId,
			visibility: "public"
		})
	);
	const opened = await app.handleVersioned(
		guestContext,
		request("sheets.document.open", { id: workbookId })
	);
	assert.equal(opened.payload.workbook.canEdit, false);
	assert.equal(opened.payload.workbook.canShare, false);
	await assert.rejects(
		() => app.handleVersioned(
			guestContext,
			request("sheets.cell.update", {
				address: "A1",
				id: workbookId,
				sheetId,
				value: "denied"
			})
		),
		(error) => error.code === "SHEETS_EDIT_DENIED"
	);
	const listed = await app.handleVersioned(
		guestContext,
		request("sheets.document.listPublic")
	);
	assert.equal(listed.payload.items.length, 1);
	assert.equal(listed.payload.items[0].id, workbookId);
	assert.equal("linkToken" in listed.payload.items[0], false);
	await app.handleVersioned(
		ownerContext,
		request("sheets.share.invite", {
			editorId: "editor-account",
			id: workbookId
		})
	);
	const editorOpen = await app.handleVersioned(
		editorContext,
		request("sheets.document.open", { id: workbookId })
	);
	assert.equal(editorOpen.payload.workbook.canEdit, true);
	await app.handleVersioned(
		editorContext,
		request("sheets.cell.update", {
			address: "A1",
			id: workbookId,
			sheetId,
			value: "B\"H live"
		})
	);
	const changed = takeEvent(guest, "sheets.document.changed");
	assert.equal(changed.payload.operation.patch.value, "B\"H live");
	await assert.rejects(
		() => app.handleVersioned(
			editorContext,
			request("sheets.share.update", {
				id: workbookId,
				visibility: "private"
			})
		),
		(error) => error.code === "SHEETS_SHARE_DENIED"
	);
}

runAccessContract().then(() => {
	console.log("Awtsmoos Sheets access contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
