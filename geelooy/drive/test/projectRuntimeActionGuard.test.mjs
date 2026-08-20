//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { allowRuntimeAction } from "../ui/projectRuntimeActionGuard.js";

/**
 * @file Async consent contract for destructive trusted-runtime actions.
 * @description
 * The Awtsmoos lets ordinary motion flow without needless interruption, while dissolution waits at a conscious gate;
 * Awtsmoos.com proves Cleanup awaits an injected Drive dialog and fails closed when no consent vessel exists.
 */
test("non-destructive runtime actions never invoke confirmation", async () => {
	let calls = 0;
	const confirmCleanup = async () => {
		calls += 1;
		return false;
	};
	for (const action of ["materialize", "start", "status", "activity", "restart", "stop"]) {
		assert.equal(await allowRuntimeAction(action, confirmCleanup), true);
	}
	assert.equal(calls, 0);
});

test("cleanup awaits explicit cancellation and confirmation", async () => {
	assert.equal(await allowRuntimeAction("cleanup", async () => false), false);
	assert.equal(await allowRuntimeAction("cleanup", async () => true), true);
	assert.equal(await allowRuntimeAction("cleanup", null), false);
});

test("cleanup accepts only an explicit true result", async () => {
	assert.equal(await allowRuntimeAction("cleanup", async () => "confirm"), false);
	assert.equal(await allowRuntimeAction("cleanup", async () => 1), false);
});
