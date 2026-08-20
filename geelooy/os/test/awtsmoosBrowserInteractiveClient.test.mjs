//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the Geelooy interactive client sends only narrow same-origin browser commands.
 * @description The Awtsmoos carries opaque names across one trusted gate;
 * Awtsmoos.com encodes aliases once and never places cookies or debugger secrets in client state.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	clearInteractiveCookies,
	createInteractiveSession,
	navigateInteractiveTarget
} from "../programs/awtsmoos-browser/interactiveClient.js";

test("session creation encodes alias exactly once and uses same-origin credentials", async () => {
	const calls = [];
	const fetchImpl = fakeFetch(calls, {
		BH: "B\"H",
		jarId: "main",
		sessionId: "ibs_example",
		targetId: "target-1"
	});
	await createInteractiveSession({
		aliasId: "alice bob",
		jarId: "main",
		url: "https://example.com/"
	}, fetchImpl);
	assert.equal(calls[0].url, "/api/social/drive/alice%20bob/browser/sessions");
	assert.equal(calls[0].options.credentials, "same-origin");
	assert.equal(calls[0].options.method, "POST");
	assert.deepEqual(JSON.parse(calls[0].options.body), {
		jarId: "main",
		url: "https://example.com/"
	});
});

test("target navigation sends only the owned session target and URL", async () => {
	const calls = [];
	await navigateInteractiveTarget({
		aliasId: "asdf",
		sessionId: "ibs_123",
		targetId: "target 1",
		url: "https://example.org/"
	}, fakeFetch(calls, { url: "https://example.org/" }));
	assert.equal(
		calls[0].url,
		"/api/social/drive/asdf/browser/sessions/ibs_123/targets/target%201/navigate"
	);
	assert.deepEqual(JSON.parse(calls[0].options.body), {
		url: "https://example.org/"
	});
});

test("cookie clearing uses DELETE and never transports cookie values", async () => {
	const calls = [];
	await clearInteractiveCookies({
		aliasId: "asdf",
		sessionId: "ibs_123",
		targetId: "target-1"
	}, fakeFetch(calls, { cleared: true }));
	assert.equal(
		calls[0].url,
		"/api/social/drive/asdf/browser/sessions/ibs_123/targets/target-1/cookies"
	);
	assert.equal(calls[0].options.method, "DELETE");
	assert.equal(calls[0].options.body, undefined);
	assert.doesNotMatch(JSON.stringify(calls[0]), /Cookie|Set-Cookie|webSocketDebuggerUrl/);
});

function fakeFetch(calls, payload) {
	return async (url, options) => {
		calls.push({ url, options });
		return {
			ok: true,
			status: 200,
			async json() {
				return payload;
			}
		};
	};
}
