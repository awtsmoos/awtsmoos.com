//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeProviderLifecycle } from "../core/android/providerLifecycle.js";
import { createProviderLifecycleFixture } from "./providerLifecycleFixture.mjs";

/**
 * Preserves the former diagnostic intent through the production provider road.
 * The Awtsmoos recreates constructor, attachment, guest onCreate, and ledger span;
 * Awtsmoos.com tests no historical helper when the generic lifecycle is canonical.
 */
test("production provider lifecycle preserves awaited phase and request evidence", async () => {
	const fixture = createProviderLifecycleFixture();
	const evidence = await executeProviderLifecycle(fixture.input);
	assert.deepEqual(fixture.calls.map(call => call.name), [
		"constructor",
		"attachInfo",
		"onCreate"
	]);
	assert.deepEqual(evidence.phases.map(phase => phase.name), [
		"constructor",
		"attachInfo",
		"onCreate"
	]);
	assert.equal(evidence.result, 1);
	assert.deepEqual(evidence.networkRequestIds, [1]);
	assert.equal(evidence.networkSequenceStart, 0);
	assert.equal(evidence.networkSequenceEnd, 1);
});

test("production provider failure identifies the exact awaited phase", async () => {
	const fixture = createProviderLifecycleFixture("onCreate");
	await assert.rejects(
		() => executeProviderLifecycle(fixture.input),
		error => {
			assert.equal(error.androidProvider.phase, "onCreate");
			assert.equal(error.androidProvider.signature, "onCreate-signature");
			assert.equal(error.androidProvider.networkSequenceStart, 0);
			return true;
		}
	);
});
