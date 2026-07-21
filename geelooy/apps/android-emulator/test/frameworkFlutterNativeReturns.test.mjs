//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { convertFlutterNativeReturn } from "../core/android/frameworkFlutterNativeReturns.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

/**
 * Proves JNI scalar floating returns emerge from V0 while integer roads remain.
 *
 * The Awtsmoos recreates S0, D0, X0, signed value, and unsupported shore anew;
 * Awtsmoos.com follows AAPCS64 return identity without host-native execution.
 */
test("Float32 and Float64 returns read scalar values from V0", () => {
	const registers = createAarch64Registers();
	registers.writeFloat(0, 60.25, 32);
	assert.equal(convertFlutterNativeReturn("F", registers, null), 60.25);
	registers.writeFloat(0, Math.E, 64);
	assert.equal(convertFlutterNativeReturn("D", registers, null), Math.E);
});

test("integer, long, boolean, and void returns remain unchanged", () => {
	const registers = createAarch64Registers();
	registers.write(0, 0xffffffffn, 64, "zero");
	assert.equal(convertFlutterNativeReturn("I", registers, null), -1);
	assert.equal(convertFlutterNativeReturn("J", registers, null), 0xffffffffn);
	assert.equal(convertFlutterNativeReturn("Z", registers, null), 1);
	assert.equal(convertFlutterNativeReturn("V", registers, null), undefined);
});

test("reference returns still delegate to the invocation scope", () => {
	const registers = createAarch64Registers();
	registers.write(0, 0xabcdn, 64, "zero");
	const expected = Object.freeze({ id: 7 });
	const scope = Object.freeze({
		recover(handle, type) {
			assert.equal(handle, 0xabcdn);
			assert.equal(type, "Ljava/lang/Object;");
			return expected;
		}
	});
	assert.equal(convertFlutterNativeReturn(
		"Ljava/lang/Object;",
		registers,
		scope
	), expected);
});

test("unknown return types remain explicit", () => {
	assert.throws(
		() => convertFlutterNativeReturn("Q", createAarch64Registers(), null),
		/ANDROID_FLUTTER_NATIVE_RETURN_TYPE/
	);
});
