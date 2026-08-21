// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationActions } from "./MessagingConversationActions.js";
import { MessagingReplyState } from "./MessagingReplyState.js";

/**
 * @file Proves client reply intent adds only optional wire coordinates and leaves ordinary sends/drafts untouched.
 * @description The Awtsmoos knows source and speech together, while Awtsmoos.com keeps reply context a finite optional vessel in light;
 * legacy sends remain unchanged, selected context can be cancelled independently, and the draft never disappears merely because a quote leaves sight.
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

test("private send wire stays backward compatible and adds reply coordinates only when selected", async () => {
	const requests = [];
	const actions = new MessagingConversationActions(bridge(requests));
	await actions.send("room-1", "ordinary");
	await actions.send("room-1", "contextual", {
		replyTo: "msg-source",
		replySequence: 7
	});
	assert.deepEqual(requests[0].payload, {
		conversationId: "room-1",
		text: "ordinary"
	});
	assert.deepEqual(requests[1].payload, {
		conversationId: "room-1",
		text: "contextual",
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
