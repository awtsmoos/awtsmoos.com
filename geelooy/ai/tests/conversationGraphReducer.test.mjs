//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationGraphReducer } from "../relay/direct/chatgpt/ConversationGraphReducer.mjs";

/** The reducer selects only the assistant answer after the exact submitted user node. */
test("conversation graph reducer follows the submitted branch", () => {
	const result = new ConversationGraphReducer().reduce(graph({
		userId: "user-new",
		assistantId: "assistant-new",
		complete: true
	}), {
		conversationId: "conversation-1",
		userMessageId: "user-new",
		previousParentMessageId: "assistant-old"
	});
	assert.equal(result.done, true);
	assert.equal(result.answer, "new answer");
	assert.equal(result.parentMessageId, "assistant-new");
});

/** ChatGPT may rewrite the creation user id; the isolated new graph stays authoritative. */
test("creation turn accepts a server-rewritten user id", () => {
	const result = new ConversationGraphReducer().reduce(graph({
		userId: "server-user",
		assistantId: "server-assistant",
		complete: true
	}), {
		conversationId: "conversation-1",
		userMessageId: "client-user",
		previousParentMessageId: null
	});
	assert.equal(result.done, true);
	assert.equal(result.answer, "new answer");
	assert.equal(result.parentMessageId, "server-assistant");
});

/** Continuations never fall back when the previous assistant is absent. */
test("continuation requires the exact previous assistant", () => {
	const result = new ConversationGraphReducer().reduce(graph({
		userId: "server-user",
		assistantId: "server-assistant",
		complete: true
	}), {
		conversationId: "conversation-1",
		userMessageId: "client-user",
		previousParentMessageId: "missing-assistant"
	});
	assert.equal(result.done, false);
	assert.equal(result.parentMessageId, null);
});

/** An unfinished branch remains pending and never reuses an older assistant answer. */
test("conversation graph reducer waits for a completed assistant", () => {
	const result = new ConversationGraphReducer().reduce(graph({
		userId: "user-new",
		assistantId: "assistant-new",
		complete: false
	}), {
		conversationId: "conversation-1",
		userMessageId: "user-new"
	});
	assert.equal(result.done, false);
	assert.equal(result.answer, "");
});

function graph({ userId, assistantId, complete }) {
	return {
		id: "conversation-1",
		current_node: assistantId,
		mapping: {
			root: node(null, null),
			"assistant-old": node("root", message("assistant-old", "assistant", "old answer", true)),
			[userId]: node("assistant-old", message(userId, "user", "new request")),
			[assistantId]: node(
				userId,
				message(assistantId, "assistant", complete ? "new answer" : "partial", complete)
			)
		}
	};
}

function node(parent, messageValue) {
	return { parent, children: [], message: messageValue };
}

function message(id, role, text, complete = false) {
	return {
		id,
		author: { role },
		status: complete ? "finished_successfully" : "in_progress",
		end_turn: complete,
		content: { content_type: "text", parts: [text] }
	};
}
