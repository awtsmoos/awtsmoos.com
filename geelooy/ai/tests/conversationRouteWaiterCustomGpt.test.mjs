//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRouteWaiter } from "../relay/direct/chatgpt/ConversationRouteWaiter.mjs";

const customUrl = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("route waiter accepts only a conversation inside the named custom GPT", async () => {
	const waiter = new ConversationRouteWaiter();
	assert.equal(
		waiter.extract(`${customUrl}/c/conversation-1`, customUrl),
		"conversation-1"
	);
	assert.equal(
		waiter.extract("https://chatgpt.com/c/conversation-1", customUrl),
		null
	);
});

test("an observed request id does not bypass custom-GPT route verification", async () => {
	const urls = [
		"https://chatgpt.com/c/conversation-1",
		`${customUrl}/c/conversation-1`
	];
	let inspections = 0;
	const waiter = new ConversationRouteWaiter({
		intervalMs: 1,
		sleep: async () => undefined
	});
	const id = await waiter.wait({
		inspector: {
			async inspect() {
				const url = urls[Math.min(inspections, urls.length - 1)];
				inspections += 1;
				return { url };
			}
		}
	}, {
		expectedId: "conversation-1",
		agentStartUrl: customUrl,
		timeoutMs: 1000
	});
	assert.equal(id, "conversation-1");
	assert.equal(inspections, 2);
});
