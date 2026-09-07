// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { createPrivateMessagingApplication } = require("./application.js");
const { EVENTS, TYPES } = require("./protocol.js");
const { request, setupThreeAliases } = require("./testSupport.js");
const { createAcceptedVoiceRoom } = require("./voiceAttachmentTestSupport.js");

/**
 * @file Proves one clientIntentId creates one canonical message and one realtime broadcast even when transport repeats the send.
 * @description The Awtsmoos is one before retry and after retry; Awtsmoos.com lets a broken network ask twice without making two messages appear,
 * returning the same sequence and id while the recipient receives only the first canonical spark through the realtime air.
 */

async function runIntentContract() {
	const { app, clients, contexts } = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	const conversationId = await createAcceptedVoiceRoom(app, contexts);
	const payload = {
		conversationId,
		text: "One intention, one message",
		clientIntentId: "chat-contract-intent-1"
	};
	const before = messageEvents(clients.Bet).length;
	const first = await app.handleVersioned(
		contexts.Aleph,
		request(TYPES.SEND, payload)
	);
	const second = await app.handleVersioned(
		contexts.Aleph,
		request(TYPES.SEND, payload)
	);
	assert.equal(second.payload.message.id, first.payload.message.id);
	assert.equal(second.payload.message.sequence, first.payload.message.sequence);
	assert.equal(second.payload.message.clientIntentId, payload.clientIntentId);
	assert.equal(messageEvents(clients.Bet).length, before + 1);
	const history = await app.handleVersioned(
		contexts.Bet,
		request(TYPES.HISTORY, {
			conversationId,
			limit: 50
		})
	);
	const matches = history.payload.messages.filter((message) => (
		message.clientIntentId === payload.clientIntentId
	));
	assert.equal(matches.length, 1);
	await assert.rejects(
		() => app.handleVersioned(
			contexts.Aleph,
			request(TYPES.SEND, {
				conversationId,
				text: "Invalid intent",
				clientIntentId: "contains spaces"
			})
		),
		(error) => error.code === "PRIVATE_MESSAGING_INVALID_CLIENT_INTENT"
	);
}

function messageEvents(client) {
	return client.messages.filter((event) => event.type === EVENTS.MESSAGE);
}

runIntentContract().then(() => {
	console.log("Private messaging client intent contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
