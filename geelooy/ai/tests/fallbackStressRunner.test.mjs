// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { FallbackStressRunner } from "../relay/direct/stress/FallbackStressRunner.mjs";

test("website stress validates independent submit-only dispatches", async () => {
	let countReads = 0;
	let calls = 0;
	const runner = new FallbackStressRunner({
		conversations: 2,
		messages: 2,
		minimumIntervalMs: 18000,
		counter: {
			async read() {
				countReads += 1;
				return { status: 200, total: countReads === 1 ? 5 : 9 };
			}
		},
		service: {
			async send(options) {
				calls += 1;
				assert.equal(options.conversationKey, undefined);
				assert.equal(options.mode, "chatgpt-website");
				options.onProgress({ stage: "website-submit", status: "accepted-response", at: calls });
				return {
					ok: true,
					answer: "",
					status: 202,
					done: false,
					dispatched: true,
					accepted: true,
					promptVerified: true,
					responseStatus: 200,
					composerTouched: true,
					submissionTransport: "chatgpt-website-composer",
					completionSource: "not-awaited-agent-continues-through-tunnel",
					hostReuseSource: "fresh",
					turnQueue: { minimumIntervalMs: 18000 },
					tabClose: { verified: true },
					requestLatencyMs: 10
				};
			}
		}
	});
	const report = await runner.run();
	assert.equal(report.mode, "chatgpt-website-submit-only");
	assert.equal(report.dispatched, 4);
	assert.equal(report.promptVerified, 4);
	assert.equal(report.tabCloseVerified, 4);
	assert.equal(report.conversationCount.delta, 4);
	assert.deepEqual(report.completionSources,
		["not-awaited-agent-continues-through-tunnel"]);
	assert.equal(JSON.stringify(report).includes("BH_DIRECT_"), false);
});
