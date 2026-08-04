// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { TargetNavigationVerifier } from "./TargetNavigationVerifier.mjs";

const AGENT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("about:blank is navigated on the exact socket and final route is verified", async () => {
	let current = "about:blank";
	const calls = [];
	const client = {
		async send(method, parameters = {}) {
			calls.push({ method, parameters });
			if (method === "Page.enable") return {};
			if (method === "Page.navigate") {
				current = parameters.url;
				return { frameId: "one" };
			}
			if (method === "Runtime.evaluate") return { result: { value: current } };
			throw new Error(`unexpected_${method}`);
		}
	};
	const result = await new TargetNavigationVerifier({ sleep: async () => undefined })
		.ensure(client, AGENT_URL, 1000);
	assert.deepEqual(result, { url: AGENT_URL, navigated: true, verified: true });
	assert.equal(calls.filter(call => call.method === "Page.navigate").length, 1);
});

test("an existing custom-GPT continuation route needs no navigation", async () => {
	const current = `${AGENT_URL}/c/conversation-one`;
	let navigations = 0;
	const client = {
		async send(method) {
			if (method === "Page.enable") return {};
			if (method === "Runtime.evaluate") return { result: { value: current } };
			if (method === "Page.navigate") navigations += 1;
			return {};
		}
	};
	const result = await new TargetNavigationVerifier().ensure(client, AGENT_URL, 1000);
	assert.equal(result.url, current);
	assert.equal(result.navigated, false);
	assert.equal(navigations, 0);
});
