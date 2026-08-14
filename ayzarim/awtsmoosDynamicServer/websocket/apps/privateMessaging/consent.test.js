// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const {
	createRequest,
	resolveRequest,
	setBlock
} = require("./testActions.js");
const {
	request,
	setupThreeAliases
} = require("./testSupport.js");

/**
 * @file Proves private speech cannot exist before consent and that outsiders/blocks remain authoritative afterward.
 * @description The Awtsmoos renews Aleph and Bet inside an accepted room while Gimmel remains outside its private light;
 * Awtsmoos.com tests unauthorized acceptance/history, blocked speech, and mail linkage before trusting private messaging right.
 */

async function runConsentContract() {
	const fixture = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	const { app, clients, contexts } = fixture;
	const created = await createRequest(
		app,
		contexts.Aleph,
		"chat",
		"Bet"
	);
	const requestId = created.payload.request.id;

	await assert.rejects(
		() => resolveRequest(app, contexts.Aleph, requestId),
		(error) => error.code === "PRIVATE_MESSAGING_REQUEST_UNAVAILABLE"
	);
	const accepted = await resolveRequest(
		app,
		contexts.Bet,
		requestId
	);
	const conversationId = accepted.payload.conversationId;
	assert.match(conversationId, /^direct-/);

	await assert.rejects(
		() => app.handleVersioned(
			contexts.Gimmel,
			request("privateMessaging.history", { conversationId })
		),
		(error) => error.code === "PRIVATE_MESSAGING_MEMBERSHIP_REQUIRED"
	);

	const sent = await app.handleVersioned(
		contexts.Aleph,
		request("privateMessaging.message.send", {
			conversationId,
			text: "Private B\"H hello"
		})
	);
	assert.equal(sent.payload.message.text, "Private B\"H hello");
	assert.equal("authorKey" in sent.payload.message, false);
	assert.ok(
		clients.Bet.messages.some(
			(event) => event.type === "privateMessaging.message"
		)
	);

	const history = await app.handleVersioned(
		contexts.Bet,
		request("privateMessaging.history", { conversationId })
	);
	assert.equal(history.payload.messages.length, 1);
	assert.equal(history.payload.messages[0].alias, "Aleph");

	await setBlock(app, contexts.Bet, "Aleph", true);
	await assert.rejects(
		() => app.handleVersioned(
			contexts.Aleph,
			request("privateMessaging.message.send", {
				conversationId,
				text: "This must be blocked"
			})
		),
		(error) => error.code === "PRIVATE_MESSAGING_BLOCKED"
	);
	await setBlock(app, contexts.Bet, "Aleph", false);

	const mail = await createRequest(
		app,
		contexts.Aleph,
		"mail",
		"Bet"
	);
	const mailAccepted = await resolveRequest(
		app,
		contexts.Bet,
		mail.payload.request.id
	);
	assert.equal(mailAccepted.payload.mail.href, "/email/");
	assert.equal(mailAccepted.payload.mail.targetAlias, "Aleph");
}

runConsentContract().then(() => {
	console.log("Private messaging consent contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
