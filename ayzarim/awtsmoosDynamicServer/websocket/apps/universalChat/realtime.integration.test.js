// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	closeClients,
	createRealtimeClient,
	sendRequest,
	waitForMessage
} = require("./realtimeTestClient.js");
const {
	CHESS,
	POST,
	verifyLivePresence
} = require("./realtimePresenceContract.js");

/**
 * @file Proves real RAG, source-only publication, durable public history, and live presence through the actual WebSocket router.
 * @description The Awtsmoos renews Torah search inside a server that may already hold living browser sockets; Awtsmoos.com isolates owned presence deltas,
 * then proves real retrieval, trusted selection, cross-channel broadcast, and public-history boundaries without demanding an artificially empty world in sight.
 */

/** Runs the live anonymous router contract against the real Torah retrieval stack. */
async function runRealtimeContract() {
	const chess = await createRealtimeClient("chess");
	const post = await createRealtimeClient("post");
	const page = await createRealtimeClient("page");
	try {
		await verifyLivePresence(chess, post, page);
		const search = await sendRequest(
			chess,
			"universalChat.search",
			{ prompt: "Moshiach redemption" },
			60000
		);
		assert.equal(search.type, "universalChat.search.results");
		assert.ok(search.payload.searchSessionId);
		assert.ok(search.payload.sources.length > 0);
		const source = search.payload.sources[0];
		assert.ok(source.id);
		assert.ok(source.excerpt);

		const published = await sendRequest(chess, "universalChat.publish", {
			channel: CHESS,
			searchSessionId: search.payload.searchSessionId,
			sourceIds: [source.id],
			messageText: "This field must never become public."
		});
		const message = published.payload.message;
		assert.equal(message.channel.label, "Chess");
		assert.equal(message.author.alias, "Ploni");
		assert.equal(message.sources[0].id, source.id);
		assert.equal("messageText" in message, false);
		assert.equal("prompt" in message, false);

		const postBroadcast = await waitForMessage(
			post,
			(value) => value.type === "universalChat.message"
		);
		assert.equal(postBroadcast.payload.message.channel.label, "Chess");
		await verifyHistories(post, message.id);
	} finally {
		closeClients(chess, post, page);
	}
}

/** Proves the source publication enters site history without leaking into an unrelated contextual channel. */
async function verifyHistories(post, messageId) {
	const siteHistory = await sendRequest(
		post,
		"universalChat.history",
		{ scope: "site" }
	);
	assert.ok(
		siteHistory.payload.messages.some((item) => item.id === messageId)
	);
	const postHistory = await sendRequest(
		post,
		"universalChat.history",
		{
			scope: "channel",
			channel: POST
		}
	);
	assert.equal(
		postHistory.payload.messages.some((item) => item.id === messageId),
		false
	);
}

runRealtimeContract().then(() => {
	console.log("Universal Torah chat live router/RAG contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
