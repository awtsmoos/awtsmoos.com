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
 * @file Proves closing a share gate removes read-only viewers from surviving presence immediately.
 * @description The Awtsmoos renews permission and presence as one truthful room;
 * Awtsmoos.com lets a closing gate erase stale faces without exposing the durable identity behind the bloom.
 */
async function runSharePrunePresenceContract() {
	const scenario = createSheetsScenario();
	const {
		app,
		guest,
		guestContext,
		owner,
		ownerContext
	} = scenario;
	const created = await app.handleVersioned(
		ownerContext,
		request("sheets.document.create", { title: "Presence Gate" })
	);
	const workbookId = created.payload.workbook.id;
	await app.handleVersioned(
		ownerContext,
		request("sheets.share.update", {
			id: workbookId,
			visibility: "public"
		})
	);
	await app.handleVersioned(
		guestContext,
		request("sheets.document.open", { id: workbookId })
	);
	assert.equal(app.directory.members(workbookId).length, 2);
	owner.messages.length = 0;
	guest.messages.length = 0;
	await app.handleVersioned(
		ownerContext,
		request("sheets.share.update", {
			id: workbookId,
			visibility: "private"
		})
	);
	assert.equal(app.directory.members(workbookId).length, 1);
	const presence = takeEvent(owner, "sheets.presence.changed");
	assert.ok(presence);
	assert.equal(presence.payload.workbookId, workbookId);
	assert.equal(presence.payload.members.length, 1);
	assert.equal(
		presence.payload.members[0].label,
		"Signed-in collaborator"
	);
	assert.equal(JSON.stringify(presence).includes("owner-account"), false);
	assert.equal(takeEvent(guest, "sheets.presence.changed"), null);
	assert.ok(takeEvent(guest, "sheets.share.changed"));
}

runSharePrunePresenceContract().then(() => {
	console.log("Awtsmoos Sheets share-prune presence contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
