//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const { createSheetsApplication } = require("./application.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Proves surviving collaborators immediately receive truthful presence after disconnect.
 * @description The Awtsmoos renews the room when one socket departs and no phantom face may remain;
 * Awtsmoos.com sends the smaller living circle without leaking the durable account behind its name.
 */
function runDisconnectPresenceContract() {
	const app = createSheetsApplication();
	const owner = recordingClient("owner");
	const guest = recordingClient("guest");
	app.directory.join(
		owner,
		"book-one",
		verifiedIdentity("owner-account"),
		{ canEdit: true }
	);
	app.directory.join(
		guest,
		"book-one",
		null,
		{ canEdit: false }
	);
	owner.sent.length = 0;
	guest.sent.length = 0;
	app.disconnect({ client: guest });
	assert.equal(app.directory.members("book-one").length, 1);
	assert.equal(owner.sent.length, 1);
	assert.equal(guest.sent.length, 0);
	const envelope = owner.sent[0];
	assert.equal(envelope.application, "sheets");
	assert.equal(envelope.protocol, "awtsmoos.realtime");
	assert.equal(envelope.version, 1);
	assert.equal(envelope.type, EVENTS.presenceChanged);
	assert.equal(envelope.payload.workbookId, "book-one");
	assert.equal(envelope.payload.members.length, 1);
	assert.equal(
		envelope.payload.members[0].label,
		"Signed-in collaborator"
	);
	assert.equal(JSON.stringify(envelope).includes("owner-account"), false);
}

/** Creates a production-shaped client socket that records raw realtime envelopes. */
function recordingClient(name) {
	return {
		name,
		sent: [],
		send(envelope) {
			this.sent.push(envelope);
		}
	};
}

/** Returns one verified identity matching the socket-upgrade trust contract. */
function verifiedIdentity(accountId) {
	return {
		accountId,
		assurance: "verified",
		userId: accountId
	};
}

try {
	runDisconnectPresenceContract();
	console.log("Awtsmoos Sheets disconnect presence contract: PASS");
} catch (error) {
	console.error(error);
	process.exitCode = 1;
}
