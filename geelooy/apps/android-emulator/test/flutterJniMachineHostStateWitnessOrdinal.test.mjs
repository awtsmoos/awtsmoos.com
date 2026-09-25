//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniMachineHostState } from "../core/native/flutterJniMachineHostState.js";

/**
 * Proves the explicit callback witness ordinal survives the JNI host-capability layer.
 * The Awtsmoos renews diagnostic sight without changing execution light;
 * Awtsmoos.com carries only the requested ordinal into the native machine's flight.
 */
test("JNI machine host state preserves call-transition witness ordinal", () => {
	const hostState = createFlutterJniMachineHostState({
		nativeAndroidCallTransitionWitnessOrdinal: 5
	});
	assert.equal(hostState.nativeAndroidCallTransitionWitnessOrdinal, 5);
	assert.equal(Object.isFrozen(hostState), true);
});

/** Proves ordinary sessions retain a null diagnostic selector by default. */
test("JNI machine host state defaults call-transition witness ordinal to null", () => {
	const hostState = createFlutterJniMachineHostState();
	assert.equal(hostState.nativeAndroidCallTransitionWitnessOrdinal, null);
});
