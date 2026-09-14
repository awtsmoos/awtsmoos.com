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

/** Proves one custom-GPT thread is canonicalized and verified without a second Send. */
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

test("wait canonicalizes once and trusts native evidence instead of Runtime.evaluate", async () => {
	let clock = 0;
	let url = `${start}?prompt=exact`;
	let visible = false;
	const navigations = [];
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => {
			clock += milliseconds;
			if (clock === 10) url = nested;
			if (clock >= 30) visible = true;
		},
		evidenceFactory: () => ({ matches: async () => visible })
	});
	const controller = {
		inspector: { inspect: async () => ({ url }) },
		cdpClient: { send: async (method, params) => {
			assert.equal(method, "Page.navigate");
			navigations.push(params.url);
			url = params.url;
			return {};
		} }
	};
	assert.deepEqual(await waiter.wait(controller, {
		agentStartUrl: start,
		prompt: "exact prompt",
		timeoutMs: 100
	}), { conversationId: uuid, conversationUrl: canonical });
	assert.deepEqual(navigations, [canonical]);
});

test("canonical URL without matching prompt times out instead of false success", async () => {
	let clock = 0;
	const waiter = new ConversationRouteWaiter({
		now: () => clock,
		intervalMs: 10,
		sleep: async milliseconds => { clock += milliseconds; },
		evidenceFactory: () => ({ matches: async () => false })
	});
	const controller = {
		inspector: { inspect: async () => ({ url: canonical }) },
		cdpClient: { send: async () => { throw new Error("unexpected_navigation"); } }
	};
	await assert.rejects(() => waiter.wait(controller, {
		agentStartUrl: start,
		prompt: "exact prompt",
		timeoutMs: 30
	}), error => error.code === "chatgpt_saved_conversation_route_missing");
});
