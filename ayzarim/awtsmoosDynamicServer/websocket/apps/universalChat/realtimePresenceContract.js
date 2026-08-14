// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	sendRequest
} = require("./realtimeTestClient.js");

/**
 * @file Proves only the live presence delta owned by the integration test while unrelated real browser sockets may already inhabit the server.
 * @description The Awtsmoos renews every visible visitor on one universal site; Awtsmoos.com therefore measures the three test vessels relative to the living baseline,
 * hides exactly one of them, and refuses to confuse an already-populated development server with a broken public-presence count in sight.
 */

const CHESS = {
	kind: "game",
	id: "game:chess",
	label: "Chess"
};
const POST = {
	kind: "post",
	id: "post:/heichelos/ikar/post/live-test",
	label: "Post: Live Test"
};
const PAGE = {
	kind: "page",
	id: "page:/about",
	label: "About"
};

/** Enters the three integration sockets and proves their exact visible-person delta against any pre-existing live presence. */
async function verifyLivePresence(chess, post, page) {
	const chessEntry = await sendRequest(
		chess,
		"universalChat.enter",
		{ channel: CHESS }
	);
	assert.equal(chessEntry.payload.member.alias, "Ploni");
	const baselineOnline = chessEntry.payload.presence.totalOnline;
	await sendRequest(post, "universalChat.enter", { channel: POST });
	const pageEntry = await sendRequest(
		page,
		"universalChat.enter",
		{ channel: PAGE }
	);
	assert.equal(pageEntry.payload.presence.totalOnline, baselineOnline + 2);
	assert.ok(chessEntry.payload.presence.channelOnline >= 1);
	await sendRequest(
		page,
		"universalChat.presence.preference",
		{ hidden: true }
	);
	const refreshed = await sendRequest(
		post,
		"universalChat.enter",
		{ channel: POST }
	);
	assert.equal(
		refreshed.payload.presence.totalOnline,
		pageEntry.payload.presence.totalOnline - 1
	);
	return {
		chessEntry,
		baselineOnline
	};
}

module.exports = {
	CHESS,
	POST,
	PAGE,
	verifyLivePresence
};
