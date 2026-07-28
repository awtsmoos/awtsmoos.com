//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FallbackStressRunner } from "../relay/direct/stress/FallbackStressRunner.mjs";

/** Four conversations keep stable opaque keys and validate global pacing. */
test("fallback stress runs a paced continuation matrix", async () => {
	let countReads = 0;
	let calls = 0;
	const keys = new Map();
	const runner = new FallbackStressRunner({
		conversations: 2,
		messages: 2,
		minimumIntervalMs: 10000,
		counter: {
			async read() {
				countReads += 1;
				return { status: 200, total: countReads === 1 ? 5 : 7 };
			}
		},
		service: {
			async send(options) {
				calls += 1;
				const match = options.prompt.match(/C(\d+) M(\d+)/);
				const conversation = Number(match[1]);
				const message = Number(match[2]);
				const key = keys.get(conversation) ?? `BH_DIRECT_FAKE_${conversation}`;
				keys.set(conversation, key);
				assert.equal(options.conversationKey, message === 1 ? null : key);
				options.onProgress({ stage: "request", status: "accepted", at: calls });
				return {
					ok: true,
					answer: `BH REQUEST STRESS C${conversation} M${message}.`,
					conversationKey: key,
					created: message === 1,
					status: 200,
					done: true,
					sameConversation: true,
					navigatedToConversation: false,
					completionSource: "page-request-get",
					hostReuseSource: calls === 1 ? "fresh" : "reused",
					pacing: { intervalMs: calls === 1 ? null : 10000, waitMs: 0 },
					requestLatencyMs: 10,
					subscriptionAttempts: 1
				};
			}
		}
	});
	const report = await runner.run();
	assert.equal(report.succeeded, 4);
	assert.equal(report.createdTurns, 2);
	assert.equal(report.conversationCount.delta, 2);
	assert.deepEqual(report.completionSources, ["page-request-get"]);
	assert.equal(JSON.stringify(report).includes("BH_DIRECT_"), false);
});
