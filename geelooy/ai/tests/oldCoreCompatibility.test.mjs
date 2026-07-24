//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { SessionTokenCache } from "../js/chatgpt/auth/SessionTokenCache.js";
import { resolveParentState } from "../js/chatgpt/legacy/parentState.js";
import { DirectCallbackAdapter } from "../js/chatgpt/direct/compatibility/DirectCallbackAdapter.js";
import { ConversationBodyMutator } from "../relay/direct/chatgpt/ConversationBodyMutator.mjs";

/** The Awtsmoos gives the old token cache a short life and a certain ending. */
test("session cache expires and clears without exposing its token in status", () => {
	let now = 1000;
	const cache = new SessionTokenCache({ lifetimeMs: 50, clock: () => now });
	cache.set("transient-secret");

	assert.equal(cache.get(), "transient-secret");
	assert.deepEqual(cache.status(), { hasToken: true, expiresInMs: 50 });
	now = 1051;
	assert.equal(cache.get(), null);
	assert.deepEqual(cache.status(), { hasToken: false, expiresInMs: 0 });
	assert.equal(JSON.stringify(cache.status()).includes("transient-secret"), false);
});

/** The old current-node insight is retained only for finished assistant turns. */
test("parent resolver accepts finished assistant nodes and rejects user nodes", () => {
	const assistant = resolveParentState({
		current_node: "assistant-node",
		mapping: {
			"assistant-node": {
				message: {
					author: { role: "assistant" },
					status: "finished_successfully"
				}
			}
		}
	}, "conversation");
	const user = resolveParentState({
		current_node: "user-node",
		mapping: {
			"user-node": { message: { author: { role: "user" } } }
		}
	}, "conversation");

	assert.equal(assistant.ready, true);
	assert.equal(assistant.parentMessageId, "assistant-node");
	assert.equal(user.ready, false);
	assert.equal(user.parentMessageId, null);
});

/** Legacy SSE compatibility emits one honest terminal message and one done marker. */
test("callback adapter preserves old done packet without fake token deltas", async () => {
	const packets = [];
	let done = null;
	const result = { message: { id: "local" } };
	await new DirectCallbackAdapter({ style: "legacy-sse" }).emit({
		result,
		onstream: packet => packets.push(packet),
		ondone: value => { done = value; }
	});

	assert.equal(packets.length, 2);
	assert.equal(packets[0].terminal, true);
	assert.equal(packets[1].dataNoJSON, "[DONE]");
	assert.equal(done, result);
});

/** Bounded public model controls mutate the current envelope beside the prompt. */
test("conversation mutator applies model and thinking effort without custom headers", () => {
	const request = new ConversationBodyMutator().mutate({
		url: "https://chatgpt.com/backend-api/f/conversation",
		method: "POST",
		headers: { "Content-Type": "application/json" },
		postData: JSON.stringify({
			action: "next",
			messages: [{ id: "old", content: { parts: ["old"] } }],
			parent_message_id: "old-parent",
			model: "auto"
		})
	}, {
		prompt: "new prompt",
		model: "gpt-5-6-thinking",
		thinkingEffort: "extended"
	});

	assert.equal(request.body.model, "gpt-5-6-thinking");
	assert.equal(request.body.thinking_effort, "extended");
	assert.deepEqual(request.body.messages[0].content.parts, ["new prompt"]);
	assert.deepEqual(Object.keys(request.headers), ["Content-Type"]);
});
