//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { StressConversationRunner } from "../src/stress/StressConversationRunner.mjs";

/** The Awtsmoos keeps transport truth and exact wording separate at awtsmoos.com. */
test("runs round-robin continuations and reports exact-answer compliance separately", async () => {
	let requestIndex = 0;
	const pacer = makePacer(() => requestIndex);
	const clientFactory = () => ({
		send: async ({ prompt, state, beforeDirectRequest }) => {
			const pacing = await beforeDirectRequest();
			requestIndex += 1;
			const match = prompt.match(/BH STRESS (C\d+) T(\d+)\./);
			const label = match[1];
			const answer = requestIndex === 2
				? "non-exact but non-empty"
				: `BH STRESS ${label} T${match[2]}.`;
			return makeResult({ answer, state, label, requestIndex, pacing });
		}
	});
	const report = await new StressConversationRunner({
		conversationCount: 2,
		continuationCount: 1,
		clientFactory,
		pacer
	}).run();

	assert.equal(report.totalCompleted, 4);
	assert.equal(report.totalTransportSucceeded, 4);
	assert.equal(report.totalExactAnswers, 3);
	assert.equal(report.minimumObservedIntervalMs, 7000);
	assert.equal(report.aborted, false);
	assert.equal(JSON.stringify(report).includes("conversation-C"), false);
});

/** Pre-request exhaustion must retry the same logical turn rather than skip T1. */
test("retries an exhausted setup failure without advancing the logical turn", async () => {
	let calls = 0;
	const clientFactory = () => ({
		send: async ({ prompt, beforeDirectRequest }) => {
			calls += 1;
			if (calls <= 3) {
				throw new Error("Timed out waiting for an authenticated conversation envelope.");
			}
			const pacing = await beforeDirectRequest();
			assert.match(prompt, /C1 T1/);
			return makeResult({
				answer: "BH STRESS C1 T1.",
				state: null,
				label: "C1",
				requestIndex: calls,
				pacing
			});
		}
	});
	const report = await new StressConversationRunner({
		conversationCount: 1,
		continuationCount: 0,
		clientFactory,
		pacer: makePacer(() => calls)
	}).run();

	assert.equal(report.totalCompleted, 1);
	assert.equal(report.totalTransportSucceeded, 1);
	assert.equal(report.setupFailureCount, 1);
	assert.equal(report.setupFailures[0].phase, "pre-request-setup-retry");
	assert.equal(report.turns[0].turn, 1);
	assert.equal(report.turns[0].logicalSetupRetries, 1);
});

function makePacer(index) {
	return {
		minimumIntervalMs: 7000,
		enter: async () => ({
			waitMs: 0,
			intervalMs: index() === 0 ? null : 7000,
			startedAt: new Date(1000 + index() * 7000).toISOString()
		})
	};
}

function makeResult({ answer, state, label, requestIndex, pacing }) {
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
			streamItems: 3,
			subscriptionAttempts: 1
		},
		timing: { requestLatencyMs: 10, pacing },
		navigatedToDirectConversation: false
	};
}
