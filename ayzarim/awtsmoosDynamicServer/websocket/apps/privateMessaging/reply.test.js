// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const {
	createRequest,
	resolveRequest
} = require("./testActions.js");
const {
	request,
	setupThreeAliases
} = require("./testSupport.js");

/**
 * @file Proves private reply coordinates resolve only inside their accepted conversation while legacy text sends remain valid.
 * @description The Awtsmoos joins a later word to its truthful earlier source, while Awtsmoos.com rejects forged coordinates before storage in light;
 * one bounded quote survives history, old clients remain welcome, and private contextual speech cannot manufacture a source out of sight.
 */

async function acceptedConversation(app, contexts) {
	const created = await createRequest(
		app,
		contexts.Aleph,
		"chat",
		"Bet"
	);
	const accepted = await resolveRequest(
		app,
		contexts.Bet,
		created.payload.request.id
	);
	return accepted.payload.conversationId;
}

async function send(app, context, conversationId, text, extra = {}) {
	return app.handleVersioned(
		context,
		request("privateMessaging.message.send", {
			conversationId,
			text,
			...extra
		})
	);
}

async function runReplyContract() {
	const fixture = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	const { app, contexts } = fixture;
	const conversationId = await acceptedConversation(app, contexts);
	const first = await send(
		app,
		contexts.Aleph,
		conversationId,
		"The earlier source"
	);
	const source = first.payload.message;
	const reply = await send(
		app,
		contexts.Bet,
		conversationId,
		"The later answer",
		{
			replyTo: source.id,
			replySequence: source.sequence
		}
	);
	assert.equal(reply.payload.message.reply.id, source.id);
	assert.equal(reply.payload.message.reply.sequence, source.sequence);
	assert.equal(reply.payload.message.reply.text, "The earlier source");
	assert.equal(reply.payload.message.reply.alias, "Aleph");
	assert.equal("authorKey" in reply.payload.message.reply, false);

	const history = await app.handleVersioned(
		contexts.Aleph,
		request("privateMessaging.history", { conversationId })
	);
	assert.equal(history.payload.messages.length, 2);
	assert.equal(history.payload.messages[1].reply.id, source.id);

	await assert.rejects(
		() => send(
			app,
			contexts.Bet,
			conversationId,
			"Forged context",
			{
				replyTo: source.id,
				replySequence: source.sequence + 1
			}
		),
		(error) => error.code === "PRIVATE_MESSAGING_REPLY_TARGET"
	);

	const legacy = await send(
		app,
		contexts.Aleph,
		conversationId,
		"Legacy text only"
	);
	assert.equal(legacy.payload.message.reply, null);
	assert.equal(legacy.payload.message.replyTo, "");
}

runReplyContract().then(() => {
	console.log("Private messaging reply contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
