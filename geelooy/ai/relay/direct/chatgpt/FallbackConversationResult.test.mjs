// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { publicConversationResult } from "./FallbackConversationResult.mjs";

test("public dispatch receipt proves acceptance and hides upstream identity", () => {
	const result = publicConversationResult({
		localKey: "BH_DIRECT_LOCAL",
		result: {
			status: 202,
			dispatched: true,
			accepted: true,
			promptVerified: true,
			responseStatus: 200,
			acceptedAt: "2026-08-03T15:00:00.000Z",
			completionSource: "not-awaited-agent-continues-through-tunnel",
			state: {
				conversationId: "private-conversation",
				userMessageId: "private-message"
			},
			tabClose: {
				closed: true,
				verified: true,
				attempts: 2,
				targetId: "private-target"
			}
		}
	});
	assert.equal(result.answer, "");
	assert.equal(result.done, false);
	assert.equal(result.dispatched, true);
	assert.equal(result.accepted, true);
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
