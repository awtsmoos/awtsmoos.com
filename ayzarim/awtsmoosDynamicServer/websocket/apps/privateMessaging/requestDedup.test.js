// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const {
	request,
	setupThreeAliases
} = require("./testSupport.js");

/**
 * @file Proves repeated pending contact requests collapse into one canonical consent invitation.
 * @description The Awtsmoos renews one unanswered knock without multiplying inbox noise; Awtsmoos.com reuses the pending request until the recipient chooses its fate in light.
 */

async function runRequestDedupContract() {
	const { app, contexts } = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	const first = await app.handleVersioned(
		contexts.Aleph,
		request("privateMessaging.request.create", {
			kind: "whisper",
			targetAlias: "Bet"
		})
	);
	const second = await app.handleVersioned(
		contexts.Aleph,
		request("privateMessaging.request.create", {
			kind: "whisper",
			targetAlias: "Bet"
		})
	);
	assert.equal(first.payload.duplicate, false);
	assert.equal(second.payload.duplicate, true);
	assert.equal(
		second.payload.request.id,
		first.payload.request.id
	);
	const listed = await app.handleVersioned(
		contexts.Bet,
		request("privateMessaging.requests.list")
	);
	const pending = listed.payload.incoming.filter(
		(item) => item.state === "pending"
	);
	assert.equal(pending.length, 1);
	assert.equal(pending[0].kind, "whisper");
}

runRequestDedupContract().then(() => {
	console.log("Private messaging request dedupe contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
