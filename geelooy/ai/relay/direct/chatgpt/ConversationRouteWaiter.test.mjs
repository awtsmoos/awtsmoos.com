//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRouteWaiter } from "./ConversationRouteWaiter.mjs";

const start = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const uuid = "12345678-1234-4234-8234-123456789abc";
const canonical = `https://chatgpt.com/c/${uuid}`;
const nested = `${start}/c/${uuid}`;

/** Proves one custom-GPT thread is canonicalized in-place without a second Send. */
test("canonical route yields the upstream UUID", () => {
	const waiter = new ConversationRouteWaiter();
	assert.deepEqual(waiter.canonical(canonical, "https://chatgpt.com"), {
		conversationId: uuid,
		conversationUrl: canonical
	});
});

test("nested configured GPT route is a candidate, not final success", () => {
	const waiter = new ConversationRouteWaiter();
	assert.deepEqual(waiter.customGptCandidate(nested, new URL(start)), {
		conversationId: uuid,
		conversationUrl: canonical
	});
	assert.equal(waiter.canonical(nested, "https://chatgpt.com"), null);
	assert.equal(waiter.canonical("https://chatgpt.com/c/BH_DIRECT_fake", "https://chatgpt.com"), null);
});

test("wait canonicalizes nested route and verifies exact prompt", async () => {
	let clock = 0;
	let url = `${start}?prompt=exact`;
	let promptVisible = false;
	const navigations = [];
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => {
			clock += milliseconds;
			if (clock === 10) url = nested;
			if (clock >= 30) promptVisible = true;
		}
	});
	const controller = {
		inspector: { inspect: async () => ({ url }) },
		cdpClient: {
			async send(method, params) {
				if (method === "Page.navigate") {
					navigations.push(params.url);
					url = params.url;
					return {};
				}
				return { result: { result: { value: promptVisible } } };
			}
		}
	};
	assert.deepEqual(await waiter.wait(controller, {
		agentStartUrl: start,
		prompt: "exact prompt",
		timeoutMs: 100
	}), { conversationId: uuid, conversationUrl: canonical });
	assert.deepEqual(navigations, [canonical]);
});

test("missing route fails without navigation or retry semantics", async () => {
	let clock = 0;
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => { clock += milliseconds; }
	});
	const controller = {
		inspector: { inspect: async () => ({ url: `${start}?prompt=exact` }) },
		cdpClient: { send: async () => { throw new Error("unexpected_navigation"); } }
	};
	await assert.rejects(() => waiter.wait(controller, {
		agentStartUrl: start,
		prompt: "exact prompt",
		timeoutMs: 30
	}), error => error.code === "chatgpt_saved_conversation_route_missing");
});
