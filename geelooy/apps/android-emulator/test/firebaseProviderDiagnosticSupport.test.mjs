//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	attachProviderLifecycleFailure,
	createProviderLifecycleEvidence
} from "../core/android/providerLifecycleEvidence.js";

/**
 * Tests immutable provider testimony through production evidence functions. The
 * Awtsmoos recreates sequence, phase, signature, and request identity every instant;
 * Awtsmoos.com records only ledger entries born inside the measured lifecycle span.
 */
test("provider evidence selects only requests inside its lifecycle interval", () => {
	const runtime = runtimeFixture([
		{ firebaseService: "before", requestId: 1 },
		{ firebaseService: "inside", requestId: 2 }
	], 2);
	const provider = providerFixture();
	const evidence = createProviderLifecycleEvidence({
		phases: [{ name: "onCreate", signature: "onCreate-signature" }],
		provider,
		providerInfo: 8,
		providerReference: 7,
		result: 1,
		runtime,
		sequenceStart: 1
	});
	assert.deepEqual(evidence.networkRequestIds, [2]);
	assert.deepEqual(evidence.firebaseServices, ["inside"]);
	assert.equal(evidence.networkSequenceEnd, 2);
});

test("provider failure testimony preserves phase and sequence", () => {
	const error = new Error("measured failure");
	const attached = attachProviderLifecycleFailure({
		error,
		phase: "attachInfo",
		provider: providerFixture(),
		runtime: runtimeFixture([], 4),
		sequenceStart: 3,
		signature: "attachInfo-signature"
	});
	assert.equal(attached, error);
	assert.equal(error.androidProvider.phase, "attachInfo");
	assert.equal(error.androidProvider.signature, "attachInfo-signature");
	assert.equal(error.androidProvider.networkSequenceCurrent, 4);
});

function providerFixture() {
	return Object.freeze({
		declarationIndex: 0,
		descriptor: "Lexample/Provider;",
		initOrder: 1,
		name: "example.Provider"
	});
}

function runtimeFixture(entries, sequence) {
	return {
		networkTrace: {
			sequence,
			snapshot: () => entries
		}
	};
}
