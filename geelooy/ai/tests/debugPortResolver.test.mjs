//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DebugPortResolver } from "../relay/direct/browser/DebugPortResolver.mjs";

/** A busy preferred port is retried without probing unrelated browser profiles. */
test("preferred debug port retries before succeeding", async () => {
	let calls = 0;
	let sleeps = 0;
	const resolver = new DebugPortResolver({
		preferredPort: 9223,
		preferredAttempts: 4,
		preferredRetryMs: 500,
		fetcher: async url => {
			calls += 1;
			assert.equal(url, "http://127.0.0.1:9223/json/version");
			if (calls < 3) throw new Error("busy");
			return {
				ok: true,
				async json() {
					return { webSocketDebuggerUrl: "ws://127.0.0.1:9223/devtools/browser/1" };
				}
			};
		},
		sleep: async milliseconds => {
			assert.equal(milliseconds, 500);
			sleeps += 1;
		}
	});
	assert.equal(await resolver.resolve(), 9223);
	assert.equal(calls, 3);
	assert.equal(sleeps, 2);
});

/** An explicit dead port fails closed without scanning other candidates. */
test("preferred debug port failure does not migrate profiles", async () => {
	const urls = [];
	const resolver = new DebugPortResolver({
		preferredPort: 9223,
		preferredAttempts: 2,
		preferredRetryMs: 0,
		fetcher: async url => {
			urls.push(url);
			throw new Error("offline");
		},
		sleep: async () => undefined
	});
	await assert.rejects(() => resolver.resolve(), /No Chrome debug browser/);
	assert.deepEqual(urls, [
		"http://127.0.0.1:9223/json/version",
		"http://127.0.0.1:9223/json/version"
	]);
});
