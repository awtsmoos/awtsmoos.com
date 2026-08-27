//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationGraphPoller } from "../relay/direct/chatgpt/ConversationGraphPoller.mjs";

/** One POST is followed by sparse GET reads until the exact branch completes. */
test("conversation graph poller tolerates creation delay and returns completion", async () => {
	let clock = 0;
	const requests = [];
	const responses = [
		{ status: 404, text: "" },
		{ status: 200, text: JSON.stringify(graph(false)) },
		{ status: 200, text: JSON.stringify(graph(true)) }
	];
	const poller = new ConversationGraphPoller(null, {
		intervalMs: 2000,
		requestClient: {
			async send(request) {
				requests.push(request);
				return responses.shift();
			}
		},
		sleep: async milliseconds => {
			clock += milliseconds;
		},
		now: () => clock
	});
	const result = await poller.poll({
		conversationId: "conversation-3",
		userMessageId: "user-new",
		timeoutMs: 30000
	});
	assert.equal(result.done, true);
	assert.equal(result.answer, "completed answer");
	assert.equal(result.parentMessageId, "assistant-new");
	assert.equal(result.pollCount, 3);
	assert.equal(requests.length, 3);
	assert.ok(requests.every(request => request.method === "GET"));
	assert.ok(requests.every(request => request.postData === null));
	assert.ok(requests.every(request => request.url === "https://chatgpt.com/backend-api/conversation/conversation-3"));
	assert.equal(clock, 4000);
});

function graph(complete) {
	return {
		id: "conversation-3",
		current_node: "assistant-new",
		mapping: {
			root: { parent: null, message: null },
			"user-new": {
				parent: "root",
				message: {
					id: "user-new",
					author: { role: "user" },
					content: { content_type: "text", parts: ["request"] }
				}
			},
			"assistant-new": {
				parent: "user-new",
				message: {
					id: "assistant-new",
					author: { role: "assistant" },
					status: complete ? "finished_successfully" : "in_progress",
					end_turn: complete,
					content: { content_type: "text", parts: [complete ? "completed answer" : "partial"] }
				}
			}
		}
	};
}
