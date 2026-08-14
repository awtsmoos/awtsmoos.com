// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { publicConversationResult } from "./FallbackConversationResult.mjs";

test("public result preserves redacted close proof and hides upstream identity", () => {
	const result = publicConversationResult({
		localKey: "BH_DIRECT_LOCAL",
		created: true,
		result: {
			answer: "done",
			status: 200,
			done: true,
			state: {
				conversationId: "private-conversation",
				parentMessageId: "private-message"
			},
			tabClose: {
				closed: true,
				verified: true,
				attempts: 2,
				targetId: "private-target"
			}
		}
	});
	assert.deepEqual(result.tabClose, {
		closed: true,
		verified: true,
		attempts: 2,
		error: null
	});
	const serialized = JSON.stringify(result);
	assert.equal(serialized.includes("private-conversation"), false);
	assert.equal(serialized.includes("private-message"), false);
	assert.equal(serialized.includes("private-target"), false);
});
