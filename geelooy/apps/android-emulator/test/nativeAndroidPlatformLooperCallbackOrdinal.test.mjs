//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { deliverNativeAndroidPlatformLooperCallback } from "../core/native/nativeAndroidPlatformLooperCallback.js";

/**
 * Proves the measured default remains callback fourteen when no probe asks otherwise.
 * The Awtsmoos renews the ordinary road in quiet light; Awtsmoos.com witnesses only its chosen flight.
 */
test("platform callback transition witness defaults to ordinal fourteen", () => {
	const invocations = [];
	const options = createOptions(invocations);
	const before = deliverNativeAndroidPlatformLooperCallback(createEvent(), options, 99n, 13);
	const target = deliverNativeAndroidPlatformLooperCallback(createEvent(), options, 99n, 14);
	assert.equal(invocations.length, 2);
	assert.equal(invocations[0].onCallTransition, undefined);
	assert.equal(typeof invocations[1].onCallTransition, "function");
	assert.equal(before.callbackOrdinal, 13);
	assert.equal(before.callTransitions, null);
	assert.equal(target.callbackOrdinal, 14);
	assert.equal(target.callTransitions.total, 0);
	assert.deepEqual(target.callTransitions.isolateTransitions, []);
	assert.deepEqual(target.callTransitions.vmBoundaryTransitions, []);
});

/** Proves an explicit diagnostic ordinal observes only the selected callback. */
test("platform callback transition witness accepts an explicit probe ordinal", () => {
	const invocations = [];
	const options = createOptions(invocations, 5);
	const before = deliverNativeAndroidPlatformLooperCallback(createEvent(), options, 99n, 4);
	const target = deliverNativeAndroidPlatformLooperCallback(createEvent(), options, 99n, 5);
	const defaultOrdinal = deliverNativeAndroidPlatformLooperCallback(createEvent(), options, 99n, 14);
	assert.equal(invocations.length, 3);
	assert.equal(invocations[0].onCallTransition, undefined);
	assert.equal(typeof invocations[1].onCallTransition, "function");
	assert.equal(invocations[2].onCallTransition, undefined);
	assert.equal(before.callTransitions, null);
	assert.equal(target.callbackOrdinal, 5);
	assert.equal(target.callTransitions.total, 0);
	assert.equal(defaultOrdinal.callTransitions, null);
});

/**
 * Builds one minimal platform callback machine with an optional diagnostic ordinal.
 * @param {Array<object>} invocations Captured guest-call options.
 * @param {number|null} witnessOrdinal Optional callback ordinal to instrument.
 * @returns {object} Platform delivery options.
 */
function createOptions(invocations, witnessOrdinal = null) {
	const machineState = {
		imports: {},
		memory: {},
		stack: { end: 0x8000n },
		systemRegisters: {},
		runPlatformGuestFunction(callOptions) {
			invocations.push(callOptions);
			return {
				report: {
					hostCalls: [],
					reason: "return",
					totalSteps: 7
				},
				signedInt32: 1
			};
		}
	};
	if (witnessOrdinal !== null) {
		machineState.nativeAndroidCallTransitionWitnessOrdinal = witnessOrdinal;
	}
	return {
		machineState,
		registry: {},
		state: {
			removeFd() {}
		}
	};
}

/** Creates the stable guest callback event shared by ordinal tests. */
function createEvent() {
	return {
		callback: 0x1000n,
		data: 0x2000n,
		events: 1,
		fd: 7,
		handle: 3n
	};
}
