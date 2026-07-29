//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyStressRunner } from "../relay/direct/stress/RequestOnlyStressRunner.mjs";

/** Generic stress accepts local HTTP while retaining opaque continuation keys. */
test("request-only stress runs local chains without leaking keys", async () => {
	let calls = 0;
	const keys = new Map();
	const runner = new RequestOnlyStressRunner({
		conversations: 2,
		messages: 2,
		service: {
			async send(options) {
				calls += 1;
				const match = options.prompt.match(/C(\d+) M(\d+)/);
				const conversation = Number(match[1]);
				const message = Number(match[2]);
				const key = keys.get(conversation) ?? `BH_DIRECT_FAKE_${conversation}`;
				keys.set(conversation, key);
				return {
					ok: true,
					answer: `BH REQUEST STRESS C${conversation} M${message}.`,
					conversationKey: key,
					created: message === 1,
					status: 200,
					done: true,
					sameConversation: true,
					navigatedToConversation: false,
					completionSource: "local-llama-http",
					pacing: { intervalMs: calls === 1 ? null : 10000, waitMs: 0 },
					requestLatencyMs: 10,
					model: "local-test",
					usage: null
				};
			}
		}
	});
	const report = await runner.run();
	assert.equal(report.succeeded, 4);
	assert.equal(report.createdConversations, 2);
	assert.deepEqual(report.completionSources, ["local-llama-http"]);
	assert.equal(JSON.stringify(report).includes("BH_DIRECT_"), false);
});
