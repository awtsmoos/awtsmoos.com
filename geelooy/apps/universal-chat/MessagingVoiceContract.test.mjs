// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationActions } from "./MessagingConversationActions.js";

/**
 * @file Proves Universal Chat sends only the canonical asset id for private voice notes while legacy text/reply payloads remain unchanged.
 * @description The Awtsmoos renews wire, asset, and listener in every instant; Awtsmoos.com lets Yesod transmit one minimal coordinate while Gevurah keeps MIME, path, ownership, and size on the server side in light.
 */

function createBridge(requests) {
	return {
		socket: {
			async request(type, payload) {
				requests.push({
					type,
					payload
				});
				return {
					payload: {}
				};
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

test("voice send exposes only the trusted asset coordinate", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(createBridge(requests));
	await actions.send(
		"room-voice",
		"",
		{
			replyTo: "msg-source",
			replySequence: 9
		},
		{
			assetId: "asset-voice-1",
			mime: "audio/webm",
			publicPath: "/should-never-cross.webm",
			size: 999
		}
	);
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-voice",
		text: "",
		replyTo: "msg-source",
		replySequence: 9,
		attachment: {
			assetId: "asset-voice-1"
		}
	});
});

test("ordinary text send remains wire-compatible", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(createBridge(requests));
	await actions.send("room-text", "Shalom");
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-text",
		text: "Shalom"
	});
});
