//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OfficialApiStressRunner } from "../relay/direct/stress/OfficialApiStressRunner.mjs";

/** Two test chains model the same opaque continuation and pacing contract. */
test("official API stress keeps chains private and globally paced", async () => {
	let calls = 0;
	const keys = new Map();
	const runner = new OfficialApiStressRunner({
		conversations: 2,
		messages: 2,
		minimumIntervalMs: 10000,
		service: {
			async send(options) {
				calls += 1;
				const match = options.prompt.match(/C(\d+) M(\d+)/);
				const conversation = Number(match[1]);
				const message = Number(match[2]);
				const key = keys.get(conversation) ?? `BH_DIRECT_FAKE_${conversation}`;
				keys.set(conversation, key);
				assert.equal(options.conversationKey, message === 1 ? null : key);
				return {
					ok: true,
					answer: `BH API REQUEST STRESS C${conversation} M${message}.`,
					conversationKey: key,
					created: message === 1,
					status: 200,
					done: true,
					sameConversation: true,
					navigatedToConversation: false,
					completionSource: "official-responses-api",
					pacing: { intervalMs: calls === 1 ? null : 10000, waitMs: 0 },
					requestLatencyMs: 10,
					model: "gpt-test",
					usage: null
				};
			}
		}
	});
	const report = await runner.run();
	assert.equal(report.succeeded, 4);
	assert.equal(report.createdConversations, 2);
	assert.equal(report.browserUsed, false);
	assert.equal(report.domUsed, false);
	assert.equal(JSON.stringify(report).includes("BH_DIRECT_"), false);
});
