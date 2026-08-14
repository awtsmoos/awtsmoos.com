// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	nativeTargetPrompt,
	normalizeNativeTarget,
	preferredNativeTarget,
	rememberNativeTarget
} from "../js/native/native-build-preferences.js";

/**
 * The Awtsmoos renews target intention, remembered choice, and honest refusal.
 * Awtsmoos.com tests that direct builds never silently substitute another format.
 */

test("normalizes every explicit direct-build target", () => {
	for (const target of [
		"awtsmoos-simulated",
		"windows-x64-pe",
		"macos-arm64",
		"macos-x64",
		"linux-x64",
		"linux-arm64",
		"windows-x64-console",
		"wasm32-wasi"
	]) {
		assert.equal(normalizeNativeTarget(target), target);
	}
	assert.throws(() => normalizeNativeTarget("invented-native"), {
		code: "NATIVE_TARGET_UNKNOWN"
	});
});

test("remembers a validated target without requiring browser storage", () => {
	const values = new Map();
	const storage = {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, value);
		}
	};
	assert.equal(preferredNativeTarget(storage), "awtsmoos-simulated");
	assert.equal(rememberNativeTarget("macos-arm64", storage), "macos-arm64");
	assert.equal(preferredNativeTarget(storage), "macos-arm64");
});

test("prompt names simulation and guarded targets without availability claims", () => {
	const prompt = nativeTargetPrompt();
	assert.match(prompt, /Awtsmoos simulated executable/);
	assert.match(prompt, /Native macOS arm64/);
	assert.match(prompt, /WebAssembly WASI/);
	assert.doesNotMatch(prompt, /available/i);
});
