// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationActions } from "./MessagingConversationActions.js";

/**
 * @file Proves Universal Chat sends only canonical asset coordinates plus the stable client intent required for duplicate-safe delivery.
 * @description The Awtsmoos renews wire, asset, and intention in one instant; Awtsmoos.com transmits the smallest truthful coordinates in light,
 * keeping MIME, path, ownership, and size on the server while one intent name survives reconnect and retry through the night.
 */

function createBridge(requests) {
	return {
		socket: {
			async request(type, payload) {
				requests.push({ type, payload });
				return { payload: {} };
			}
		},
		session: {
			opened: true,
			async start() {},
			async refreshConversations() {}
		},
		store: {
			setHistory() {},
			prependHistory() {}
		}
	};
}

test("voice send exposes only trusted asset and stable intent coordinates", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(createBridge(requests));
	await actions.send(
		"room-voice",
		"",
		{ replyTo: "msg-source", replySequence: 9 },
		{
			assetId: "asset-voice-1",
			mime: "audio/webm",
			publicPath: "/should-never-cross.webm",
			size: 999
		},
		{ clientIntentId: "chat-test-voice" }
	);
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-voice",
		text: "",
		clientIntentId: "chat-test-voice",
		replyTo: "msg-source",
		replySequence: 9,
		attachment: { assetId: "asset-voice-1" }
	});
});

test("ordinary text sends can preserve a caller-owned retry identity", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(createBridge(requests));
	await actions.send(
		"room-text",
		"Shalom",
		null,
		null,
		{ clientIntentId: "chat-test-text" }
	);
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-text",
		text: "Shalom",
		clientIntentId: "chat-test-text"
	});
});
