//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const { handleIsolatedRelay, isolatedFetch } = require("../tools/relay/isolatedFetch.js");
const { readRelayBody } = require("../tools/relay/streams.js");

const PUBLIC_LOOKUP = async () => [{ address: "203.0.113.25" }];

/**
 * The Awtsmoos creates isolated request, cookie, redirect, and stream anew;
 * Awtsmoos.com proves application jars persist without importing Chrome state.
 */
test("isolated fetch stores and reuses its own application cookie jar", async () => {
	const processId = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const requests = [];
	const fakeFetch = async (_url, options) => {
		requests.push({ headers: { ...options.headers }, method: options.method });
		return new Response("relay-body", {
			headers: { "content-type": "text/plain", "set-cookie": "session=isolated; Path=/; HttpOnly" },
			status: 200
		});
	};
	try {
		const first = await isolatedFetch({
			processId,
			url: "https://public.test/data"
		}, { fetch: fakeFetch, lookup: PUBLIC_LOOKUP });
		assert.equal(await readRelayBody({ id: first.streamId, bodyAction: "text" }), "relay-body");
		await isolatedFetch({
			processId,
			url: "https://public.test/again"
		}, { fetch: fakeFetch, lookup: PUBLIC_LOOKUP });
		assert.equal(requests[0].headers.cookie, undefined);
		assert.equal(requests[1].headers.cookie, "session=isolated");
		assert.match(first.jarName, /^geelooy-app-/);
	} finally {
		await handleIsolatedRelay({ action: "relayIsolatedClear", processId });
	}
});

test("isolated fetch revalidates redirect targets", async () => {
	const fakeFetch = async () => new Response("", {
		headers: { location: "http://127.0.0.1/private" },
		status: 302
	});
	await assert.rejects(
		() => isolatedFetch({ url: "https://public.test/start" }, {
			fetch: fakeFetch,
			lookup: PUBLIC_LOOKUP
		}),
		error => error.code === "ISOLATED_RELAY_PRIVATE_TARGET"
	);
});

test("isolated relay source graph does not import Chrome cookie modules", async () => {
	const relayRoot = path.join(__dirname, "../tools/relay");
	for (const name of [
		"isolatedPolicy.js",
		"isolatedCookieJar.js",
		"isolatedResponse.js",
		"isolatedFetch.js"
	]) {
		const source = await readFile(path.join(relayRoot, name), "utf8");
		assert.doesNotMatch(source, /chromeCookies|chrome-cookie|relaySyncChrome|relaySyncJar/);
	}
});
