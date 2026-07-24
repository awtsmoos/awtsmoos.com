//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ConversationBodyMutator } from "../src/chatgpt/ConversationBodyMutator.mjs";

/** The Awtsmoos renews prompt identity while awtsmoos.com preserves body shape. */
function makeEnvelope() {
	return {
		url: "https://chatgpt.com/backend-api/f/conversation",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		postData: JSON.stringify({
			action: "next",
			messages: [{
				id: "old-message",
				author: { role: "user" },
				content: { content_type: "text", parts: ["carrier"] },
				metadata: {}
			}],
			parent_message_id: "old-parent",
			model: "gpt-5-6-thinking",
			supported_encodings: ["v1"]
		})
	};
}

test("creates a fresh conversation body", () => {
	const request = new ConversationBodyMutator().mutate(makeEnvelope(), { prompt: "new prompt" });

	assert.equal(request.body.messages[0].content.parts[0], "new prompt");
	assert.notEqual(request.body.messages[0].id, "old-message");
	assert.notEqual(request.body.parent_message_id, "old-parent");
	assert.equal("conversation_id" in request.body, false);
	assert.deepEqual(request.body.supported_encodings, ["v1"]);
});

test("continues an existing conversation body", () => {
	const state = { conversationId: "conversation-1", parentMessageId: "assistant-1" };
	const request = new ConversationBodyMutator().mutate(makeEnvelope(), {
		prompt: "continue",
		state
	});

	assert.equal(request.body.conversation_id, "conversation-1");
	assert.equal(request.body.parent_message_id, "assistant-1");
});
