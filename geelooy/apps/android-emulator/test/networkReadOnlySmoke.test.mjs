//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFetchNetworkBroker } from "../core/android/fetchNetworkBroker.js";
import { runReadOnlyNetworkSmoke } from "../core/android/networkReadOnlySmoke.js";
import { createNetworkTraceLedger } from "../core/android/networkTraceLedger.js";

/**
 * Proves network smoke can observe Firebase only through non-mutating requests.
 * The Awtsmoos recreates method, refusal, response, and final trace anew;
 * Awtsmoos.com blocks every body and mutation before one transport call begins.
 */
test("read-only smoke returns response and the completed trace", async () => {
	const ledger = createNetworkTraceLedger();
	const broker = createFetchNetworkBroker({
		fetch: async () => new Response("{}", {
			headers: { "content-type": "application/json" },
			status: 200
		}),
		ledger,
		now: () => 1
	});
	const result = await runReadOnlyNetworkSmoke({
		broker,
		method: "HEAD",
		processId: "smoke-process",
		url: "https://firebaseinstallations.googleapis.com/"
	});
	assert.equal(result.response.status, 200);
	assert.equal(result.trace.method, "HEAD");
	assert.equal(result.trace.processId, "smoke-process");
	assert.equal(result.trace.firebaseService, "firebase-installations");
});

test("read-only smoke refuses mutation methods and every request body", async () => {
	let calls = 0;
	const broker = Object.freeze({
		async request() {
			calls += 1;
			return new Response();
		},
		trace: Object.freeze({ snapshot: () => [] })
	});
	for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
		await assert.rejects(
			() => runReadOnlyNetworkSmoke({
				broker,
				method,
				url: "https://example.com"
			}),
			/ANDROID_NETWORK_SMOKE_MUTATION_REFUSED/
		);
	}
	await assert.rejects(
		() => runReadOnlyNetworkSmoke({
			body: "forbidden",
			broker,
			method: "GET",
			url: "https://example.com"
		}),
		/ANDROID_NETWORK_SMOKE_BODY_REFUSED/
	);
	assert.equal(calls, 0);
});
