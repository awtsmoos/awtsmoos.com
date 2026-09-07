// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationActions } from "./MessagingConversationActions.js";
import { MessagingReplyState } from "./MessagingReplyState.js";

/**
 * @file Proves reply coordinates remain optional while every modern private send carries one explicit retry-safe client intention.
 * @description The Awtsmoos knows the source, the new speech, and the single intention beneath both; Awtsmoos.com keeps reply context a finite optional keli,
 * while idempotent delivery remains present on ordinary and contextual sends so transport repetition never needs to become a second message in the river.
 */

function bridge(requests) {
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

function replyElements() {
	return {
		replyBar: { hidden: true },
		replyAuthor: { textContent: "" },
		replyText: { textContent: "" },
		replyCancel: { addEventListener() {} },
		text: { focus() {} }
	};
}

test("private send wire always carries intent and adds reply coordinates only when selected", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(bridge(requests));
	await actions.send(
		"room-1",
		"ordinary",
		null,
		null,
		{ clientIntentId: "chat-reply-contract-ordinary" }
	);
	await actions.send(
		"room-1",
		"contextual",
		{ replyTo: "msg-source", replySequence: 7 },
		null,
		{ clientIntentId: "chat-reply-contract-contextual" }
	);
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-1",
		text: "ordinary",
		clientIntentId: "chat-reply-contract-ordinary"
	});
	assert.deepEqual(requests[1].payload, {
		conversationId: "room-1",
		text: "contextual",
		clientIntentId: "chat-reply-contract-contextual",
		replyTo: "msg-source",
		replySequence: 7
	});
});

test("reply state selects and clears context independently from draft text", () => {
	const elements = replyElements();
	const state = new MessagingReplyState(elements);
	assert.equal(state.select({
		id: "msg-source",
		sequence: 7,
		alias: "Aleph",
		text: "Earlier source"
	}), true);
	assert.deepEqual(state.payload(), {
		replyTo: "msg-source",
		replySequence: 7
	});
	assert.equal(elements.replyBar.hidden, false);
	assert.equal(elements.replyAuthor.textContent, "Aleph");
	assert.equal(elements.replyText.textContent, "Earlier source");
	state.clear();
	assert.equal(state.payload(), null);
	assert.equal(elements.replyBar.hidden, true);
});
