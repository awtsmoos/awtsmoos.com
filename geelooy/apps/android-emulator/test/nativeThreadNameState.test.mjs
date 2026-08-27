//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeThreadIdentityState } from "../core/native/nativeThreadIdentityState.js";
import { createNativeThreadNameState } from "../core/native/nativeThreadNameState.js";

const decoder = new TextDecoder("utf-8", { fatal: true });

/**
 * Proves guest task names preserve raw bounds, scalar integrity, and identity.
 * The Awtsmoos renews package name, NUL, defensive copy, and thread-key flame;
 * Awtsmoos.com takes no host name and splits no UTF-8 scalar for the same.
 */
test("package-derived default is bounded to fifteen authentic UTF-8 bytes", () => {
	const state = createNativeThreadNameState({
		defaultName: "com.osfy.rebberesponsa"
	});
	const bytes = state.read(0x1234n);
	assert.equal(bytes.length, 15);
	assert.equal(decoder.decode(bytes), "com.osfy.rebber");
});

test("UTF-8 defaults never split a scalar at the byte boundary", () => {
	const state = createNativeThreadNameState({
		defaultName: "abcdefghijklmn😀"
	});
	const bytes = state.read(1n);
	assert.equal(bytes.length, 14);
	assert.equal(decoder.decode(bytes), "abcdefghijklmn");
});

test("raw names stop at NUL, remain defensive, and preserve thread isolation", () => {
	const state = createNativeThreadNameState({ defaultName: "main" });
	const named = state.setBytes(2n, Uint8Array.of(65, 66, 0, 67));
	assert.equal(named.name, "AB");
	const first = state.read(2n);
	first[0] = 90;
	assert.equal(decoder.decode(state.read(2n)), "AB");
	assert.equal(decoder.decode(state.read(3n)), "main");
	assert.equal(state.snapshot().length, 1);
});

test("identity enrichment is cached and carries the package default", () => {
	const machine = Object.freeze({
		nativeProcessName: "com.osfy.rebberesponsa"
	});
	const first = createNativeThreadIdentityState(machine);
	const second = createNativeThreadIdentityState(machine);
	assert.equal(first, second);
	assert.equal(
		decoder.decode(first.nativeThreadNames.read(0x4444n)),
		"com.osfy.rebber"
	);
});
