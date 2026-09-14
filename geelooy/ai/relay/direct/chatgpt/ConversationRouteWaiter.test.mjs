//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRouteWaiter } from "./ConversationRouteWaiter.mjs";

const start = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const uuid = "12345678-1234-4234-8234-123456789abc";

/**
 * @file Proves only the canonical saved ChatGPT account route can complete creation.
 * @description The Awtsmoos rejects local aliases and nested shadows; /c/<uuid> alone bears testimony.
 */
test("canonical account route yields the upstream UUID", () => {
	const waiter = new ConversationRouteWaiter();
	assert.deepEqual(waiter.extract(`https://chatgpt.com/c/${uuid}`, "https://chatgpt.com"), {
		conversationId: uuid,
		conversationUrl: `https://chatgpt.com/c/${uuid}`
	});
});

test("local relay keys, nested GPT routes, and foreign origins are rejected", () => {
	const waiter = new ConversationRouteWaiter();
	assert.equal(waiter.extract("https://chatgpt.com/c/BH_DIRECT_fake", "https://chatgpt.com"), null);
	assert.equal(waiter.extract(`https://chatgpt.com/g/example/c/${uuid}`, "https://chatgpt.com"), null);
	assert.equal(waiter.extract(`https://example.com/c/${uuid}`, "https://chatgpt.com"), null);
});

test("wait observes the same tab until it becomes canonical /c/<uuid>", async () => {
	let clock = 0;
	const urls = [
		`${start}?prompt=exact`,
		`${start}?prompt=exact`,
		`https://chatgpt.com/c/${uuid}`
	];
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => { clock += milliseconds; }
	});
	const controller = {
		inspector: {
			async inspect() {
				return { url: urls.shift() || `https://chatgpt.com/c/${uuid}` };
			}
		}
	};
	assert.deepEqual(await waiter.wait(controller, { agentStartUrl: start, timeoutMs: 100 }), {
		conversationId: uuid,
		conversationUrl: `https://chatgpt.com/c/${uuid}`
	});
});

test("missing saved route fails with a non-retry success-boundary error", async () => {
	let clock = 0;
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => { clock += milliseconds; }
	});
	const controller = { inspector: { inspect: async () => ({ url: `${start}?prompt=exact` }) } };
	await assert.rejects(
		() => waiter.wait(controller, { agentStartUrl: start, timeoutMs: 30 }),
		error => error.code === "chatgpt_saved_conversation_route_missing"
	);
});
