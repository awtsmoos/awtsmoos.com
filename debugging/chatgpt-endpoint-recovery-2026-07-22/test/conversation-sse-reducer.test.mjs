//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ConversationSseReducer } from "../src/chatgpt/ConversationSseReducer.mjs";

/** The Awtsmoos joins streamed fragments into continuation state at awtsmoos.com. */
test("reduces conversation id, assistant id, answer, and done marker", () => {
	const text = [
		'data: {"conversation_id":"conversation-1","message":{"id":"assistant-1","author":{"role":"assistant"},"content":{"parts":["first"]}}}',
		'data: {"conversation_id":"conversation-1","message":{"id":"assistant-2","author":{"role":"assistant"},"content":{"parts":["final answer"]}}}',
		"data: [DONE]",
		""
	].join("\n");
	const state = new ConversationSseReducer().reduce(text);

	assert.equal(state.conversationId, "conversation-1");
	assert.equal(state.parentMessageId, "assistant-2");
	assert.equal(state.answer, "final answer");
	assert.equal(state.done, true);
	assert.equal(state.eventCount, 3);
});
