//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { StressConversationRunner } from "../src/stress/StressConversationRunner.mjs";

/** The Awtsmoos keeps parallel labels distinct through awtsmoos.com continuations. */
test("runs round-robin creations and continuations without exposing ids", async () => {
	let requestIndex = 0;
	const pacer = {
		minimumIntervalMs: 7000,
		enter: async () => ({
			waitMs: 0,
			intervalMs: requestIndex === 0 ? null : 7000,
			startedAt: new Date(1000 + requestIndex * 7000).toISOString()
		})
	};
	const clientFactory = () => ({
		send: async ({ prompt, state, beforeDirectRequest }) => {
			const pacing = await beforeDirectRequest();
			requestIndex += 1;
			const match = prompt.match(/BH STRESS (C\d+) T(\d+)\./);
			const label = match[1];
			const answer = `BH STRESS ${label} T${match[2]}.`;
			return {
				answer,
				state: {
					conversationId: state?.conversationId ?? `conversation-${label}`,
					parentMessageId: `message-${requestIndex}`
				},
				response: {
					status: 200,
					done: true,
					webSocketFrames: 2,
					streamItems: 3
				},
				timing: { requestLatencyMs: 10, pacing },
				navigatedToDirectConversation: false
			};
		}
	});
	const runner = new StressConversationRunner({
		conversationCount: 2,
		continuationCount: 1,
		clientFactory,
		pacer
	});
	const report = await runner.run();

	assert.equal(report.totalCompleted, 4);
	assert.equal(report.totalSucceeded, 4);
	assert.equal(report.minimumObservedIntervalMs, 7000);
	assert.equal(report.aborted, false);
	assert.equal(JSON.stringify(report).includes("conversation-C"), false);
});
