// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";

test("owned target closure retries until the live catalog proves absence", async () => {
	let closeRequests = 0;
	let listRequests = 0;
	const closer = new ChromeTargetCloser({
		port: 9226,
		retryDelayMs: 1,
		sleep: async () => undefined,
		fetcher: async url => {
			if (url.includes("/json/close/owned")) {
				closeRequests += 1;
				return { ok: true };
			}
			listRequests += 1;
			return {
				ok: true,
				json: async () => listRequests === 1 ? [{ id: "owned" }] : []
			};
		}
	});
	const result = await closer.close("owned");
	assert.deepEqual(result, { closed: true, verified: true, attempts: 2 });
	assert.equal(closeRequests, 2);
	assert.equal(listRequests, 2);
});

test("unverified closure remains explicit after the minimum retry floor", async () => {
	const closer = new ChromeTargetCloser({
		port: 9226,
		attempts: 2,
		retryDelayMs: 1,
		sleep: async () => undefined,
		fetcher: async url => url.includes("/json/list")
			? { ok: true, json: async () => [{ id: "owned" }] }
			: { ok: true }
	});
	const result = await closer.close("owned");
	assert.equal(result.closed, false);
	assert.equal(result.verified, false);
	assert.equal(result.attempts, 3);
	assert.equal(result.error, "owned_target_close_unverified");
});
