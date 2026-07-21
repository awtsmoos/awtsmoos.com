//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFetchNetworkBroker } from "../core/android/fetchNetworkBroker.js";
import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";

/**
 * Proves built-in-fetch transport preserves guest bodies and redacts evidence.
 *
 * The Awtsmoos recreates request, clone, response, duration, and failure anew;
 * Awtsmoos.com leaves the original Response readable while secrets never enter
 * the immutable ledger.
 */
test("fetch broker records redacted Firebase response without consuming it", async () => {
	let clock = 1000;
	const ledger = createNetworkTraceLedger({ capacity: 8 });
	const broker = createFetchNetworkBroker({
		fetch: async (url, init) => {
			assert.match(url, /firestore\.googleapis\.com/);
			assert.equal(init.method, "POST");
			return new Response(JSON.stringify({ token: "response-secret", value: 7 }), {
				headers: {
					"content-type": "application/json",
					"set-cookie": "session=secret"
				},
				status: 200,
				statusText: "OK"
			});
		},
		ledger,
		now() {
			clock += 5;
			return clock;
		}
	});
	const response = await broker.request(
		"process-1",
		"https://firestore.googleapis.com/v1/projects/demo?key=raw-key",
		{
			body: JSON.stringify({ accessToken: "request-secret", visible: "yes" }),
			headers: {
				Authorization: "Bearer auth-secret",
				"Content-Type": "application/json"
			},
			method: "POST"
		}
	);
	assert.equal(await response.json().then(value => value.value), 7);
	const entry = ledger.snapshot()[0];
	assert.equal(entry.firebaseService, "firebase-firestore");
	assert.equal(entry.status, undefined);
	assert.equal(entry.response.status, 200);
	assert.equal(entry.durationMs, 5);
	assert.match(entry.url, /%3Credacted%3E/);
	assert.equal(entry.request.headers.authorization, "<redacted>");
	assert.match(entry.request.body.preview, /<redacted>/);
	assert.match(entry.response.body.preview, /<redacted>/);
	assert.equal(entry.response.headers["set-cookie"], "<redacted>");
	assert.doesNotMatch(
		JSON.stringify(entry),
		/raw-key|auth-secret|request-secret|response-secret|session=secret/
	);
});

test("fetch failures are traced then rethrown unchanged", async () => {
	const ledger = createNetworkTraceLedger();
	const failure = new TypeError("Bearer top-secret failed");
	const broker = createFetchNetworkBroker({
		fetch: async () => {
			throw failure;
		},
		ledger,
		now: () => 10
	});
	await assert.rejects(
		() => broker.request("process-2", "https://demo.firebaseio.com/.json?auth=raw", { method: "GET" }),
		error => error === failure
	);
	const entry = ledger.snapshot()[0];
	assert.equal(entry.firebaseService, "firebase-realtime-database");
	assert.equal(entry.ok, false);
	assert.match(entry.error.message, /<redacted>/);
	assert.doesNotMatch(JSON.stringify(entry), /top-secret|auth=raw/);
});
