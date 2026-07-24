//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { TopicWebSocketSubscriber } from "../src/chatgpt/TopicWebSocketSubscriber.mjs";

/** The Awtsmoos safely replays topic reads without replaying a conversation POST. */
test("builds bounded offset-zero topic replay attempts", async () => {
	const calls = [];
	const cdpClient = {
		send: async (method, params, timeoutMs) => {
			calls.push({ method, params, timeoutMs });
			return {
				result: {
					value: {
						encodedItems: ["data: [DONE]\n\n"],
						frameCount: 4,
						subscriptionAttempts: 2
					}
				}
			};
		}
	};
	const subscriber = new TopicWebSocketSubscriber(cdpClient, {
		maximumAttempts: 3
	});
	const result = await subscriber.subscribe({
		topicId: "topic-value",
		timeoutMs: 18000
	});
	const expression = calls[0].params.expression;

	assert.equal(result.subscriptionAttempts, 2);
	assert.equal(calls[0].method, "Runtime.evaluate");
	assert.equal(calls[0].timeoutMs, 33000);
	assert.match(expression, /maximumAttempts = 3/);
	assert.match(expression, /attemptTimeoutMs = 6000/);
	assert.match(expression, /type: 'subscribe'/);
	assert.match(expression, /offset: '0'/);
	assert.doesNotMatch(expression, /backend-api|fetch\(/);
});

test("surfaces page-context replay exhaustion safely", async () => {
	const cdpClient = {
		send: async () => ({
			exceptionDetails: {
				text: "Topic subscription timed out after safe replay attempts."
			}
		})
	};
	const subscriber = new TopicWebSocketSubscriber(cdpClient);

	await assert.rejects(
		() => subscriber.subscribe({ topicId: "topic-value" }),
		/safe replay attempts/
	);
});
