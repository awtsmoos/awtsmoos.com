//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRoutePoller } from "../relay/direct/chatgpt/ConversationRoutePoller.mjs";

/** Passive route observations repeat slowly until the exact continuation completes. */
test("conversation route poller waits without duplicate writes", async () => {
	let clock = 0;
	let captures = 0;
	const capture = {
		async capture() {
			captures += 1;
			return { status: 200, document: graph(captures >= 2) };
		}
	};
	const result = await new ConversationRoutePoller({
		port: 9223,
		capture,
		intervalMs: 5000,
		sleep: async milliseconds => {
			clock += milliseconds;
		},
		now: () => clock
	}).poll({
		conversationId: "conversation-1",
		userMessageId: "client-user",
		timeoutMs: 30000
	});
	assert.equal(result.done, true);
	assert.equal(result.answer, "answer");
	assert.equal(result.pollCount, 2);
	assert.equal(captures, 2);
	assert.equal(clock, 5000);
});

function graph(complete) {
	return {
		conversation_id: "conversation-1",
		current_node: "assistant",
		mapping: {
			root: { parent: null, message: null },
			user: {
				parent: "root",
				message: { id: "server-user", author: { role: "user" }, content: { parts: ["request"] } }
			},
			assistant: {
				parent: "user",
				message: {
					id: "server-assistant",
					author: { role: "assistant" },
					status: complete ? "finished_successfully" : "in_progress",
					end_turn: complete,
					content: { parts: [complete ? "answer" : "partial"] }
				}
			}
		}
	};
}
