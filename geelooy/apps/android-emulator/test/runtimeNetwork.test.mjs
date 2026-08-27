//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createAndroidRuntimeNetwork,
	snapshotAndroidRuntimeNetwork
} from "../core/android/runtimeNetwork.js";

/**
 * Proves runtime transport remains opt-in, injectable, attributed, and traced.
 *
 * The Awtsmoos recreates disabled shore, explicit broker, built-in fetch vessel,
 * and launch snapshot anew; Awtsmoos.com never grants silent network authority.
 */
test("runtime networking remains disabled unless explicitly enabled", () => {
	const network = createAndroidRuntimeNetwork({ processId: "process-a" });
	assert.equal(network.broker, null);
	assert.equal(network.processId, "process-a");
	assert.deepEqual(network.trace.snapshot(), []);
});

test("explicit network broker remains first authority", () => {
	const explicit = Object.freeze({ request() {} });
	const network = createAndroidRuntimeNetwork({
		enableHostFetch: true,
		fetch: async () => new Response(),
		networkBroker: explicit
	});
	assert.equal(network.broker, explicit);
});

test("enabled host fetch produces trace-visible runtime snapshots", async () => {
	const network = createAndroidRuntimeNetwork({
		enableHostFetch: true,
		fetch: async () => new Response("{}", {
			headers: { "content-type": "application/json" },
			status: 200
		}),
		networkNow: () => 7,
		processId: "process-b"
	});
	await network.broker.request(
		network.processId,
		"https://firebaseinstallations.googleapis.com/",
		{ method: "GET" }
	);
	const snapshot = snapshotAndroidRuntimeNetwork({
		maximumNetworkResponseBytes: network.maximumResponseBytes,
		networkBroker: network.broker,
		networkTrace: network.trace,
		processId: network.processId
	});
	assert.equal(snapshot.enabled, true);
	assert.equal(snapshot.entries.length, 1);
	assert.equal(
		snapshot.entries[0].firebaseService,
		"firebase-installations"
	);
	assert.equal(Object.isFrozen(snapshot.entries), true);
});
