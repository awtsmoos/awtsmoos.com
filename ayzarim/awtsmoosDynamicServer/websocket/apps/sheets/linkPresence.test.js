//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
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
 * @file Proves opaque-link viewing, anonymous presence, gate closure, and disconnect cleanup.
 * @description The Awtsmoos renews each passing viewer while software guards the capability key;
 * Awtsmoos.com proves live presence may appear, then vanish when permission or connection goes away.
 */
async function runLinkPresenceContract() {
	const database = new KeliTestDatabase();
	const app = createSheetsApplication();
	const owner = createTestClient("owner");
	const guest = createTestClient("guest");
	const ownerContext = createTestContext(
		owner,
		database,
		verifiedIdentity("owner-account")
	);
	const guestContext = createTestContext(guest, database, null);
	const created = await app.handleVersioned(
		ownerContext,
		request("sheets.document.create", { title: "Capability Test" })
	);
	const workbookId = created.payload.workbook.id;
	const sheetId = created.payload.workbook.sheets[0].id;
	const linked = await app.handleVersioned(
		ownerContext,
		request("sheets.share.update", {
			id: workbookId,
			visibility: "link"
		})
	);
	const linkToken = linked.payload.linkToken;
	assert.ok(linkToken.length > 20);
	await assert.rejects(
		() => app.handleVersioned(
			guestContext,
			request("sheets.document.open", {
				id: workbookId,
				key: "wrong-key"
			})
		),
		(error) => error.code === "SHEETS_VIEW_DENIED"
	);
	const opened = await app.handleVersioned(
		guestContext,
		request("sheets.document.open", {
			id: workbookId,
			key: linkToken
		})
	);
	assert.equal(opened.payload.workbook.canEdit, false);
	assert.equal(opened.payload.presence.length, 2);
	const presence = await app.handleVersioned(
		guestContext,
		request("sheets.presence.select", {
			anchor: "A1",
			focus: "B2",
			id: workbookId,
			sheetId
		})
	);
	const guestMember = presence.payload.members.find(
		(member) => member.label.startsWith("Guest")
	);
	assert.equal(guestMember.selection.focus, "B2");
	assert.ok(takeEvent(owner, "sheets.presence.changed"));
	guest.messages.length = 0;
	await app.handleVersioned(
		ownerContext,
		request("sheets.share.update", {
			id: workbookId,
			visibility: "private"
		})
	);
	assert.equal(app.directory.members(workbookId).length, 1);
	guest.messages.length = 0;
	await app.handleVersioned(
		ownerContext,
		request("sheets.cell.update", {
			address: "C3",
			id: workbookId,
			sheetId,
			value: "private again"
		})
	);
	assert.equal(takeEvent(guest, "sheets.document.changed"), null);
	app.disconnect({ client: owner });
	assert.equal(app.directory.members(workbookId).length, 0);
}

runLinkPresenceContract().then(() => {
	console.log("Awtsmoos Sheets link/presence contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
