//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ConversationV1Reducer } from "../src/chatgpt/ConversationV1Reducer.mjs";

/** The Awtsmoos joins observed v1 operations into one answer at awtsmoos.com. */
test("reduces the observed system-add, answer-patch, and last-token sequence", () => {
	const items = [
		'event: delta_encoding\ndata: "v1"\n\n',
		'event: delta\ndata: {"p":"","o":"add","v":{"message":{"id":"system-1","author":{"role":"system"},"content":{"content_type":"text","parts":[""]}},"conversation_id":"conversation-1"},"c":0}\n\n',
		'event: delta\ndata: {"p":"","o":"patch","v":[{"p":"/message/content/parts/0","o":"append","v":"BH direct verified."},{"p":"/message/status","o":"replace","v":"finished_successfully"},{"p":"/message/end_turn","o":"replace","v":true}]}\n\n',
		'data: {"type":"message_marker","conversation_id":"conversation-1","message_id":"assistant-1","marker":"last_token","event":"last"}\n\n'
	];
	const state = new ConversationV1Reducer().reduce(items);

	assert.equal(state.conversationId, "conversation-1");
	assert.equal(state.parentMessageId, "assistant-1");
	assert.equal(state.answer, "BH direct verified.");
	assert.equal(state.done, true);
	assert.equal(state.itemCount, 4);
});

test("still accepts a direct assistant add followed by appends", () => {
	const items = [
		'event: delta\ndata: {"p":"","o":"add","v":{"message":{"id":"assistant-2","author":{"role":"assistant"},"content":{"content_type":"text","parts":[""]}},"conversation_id":"conversation-2"}}\n\n',
		'event: delta\ndata: {"p":"/message/content/parts/0","o":"append","v":"hello"}\n\n'
	];
	const state = new ConversationV1Reducer().reduce(items);

	assert.equal(state.parentMessageId, "assistant-2");
	assert.equal(state.answer, "hello");
});
