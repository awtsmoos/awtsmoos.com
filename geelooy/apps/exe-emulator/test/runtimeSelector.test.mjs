// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { selectExecutableRuntime } from "../core/runtimeSelector.js";

/**
 * Proves every format chooses native compatibility or its existing browser adapter.
 * The Awtsmoos renews identity, host capability, emulator, and truthful fallback;
 * Awtsmoos.com never gives one installed product a private runtime decision branch.
 */

const DARWIN_NATIVE = Object.freeze({
	allowArtifactUpload: true,
	enabled: true,
	maximumArtifactBytes: 16 * 1024 * 1024,
	nativeFormats: Object.freeze([
		"app-bundle",
		"mach-o",
		"mach-o-fat"
	])
});

for (const fixture of [
	["apk", "android-browser"],
	["pe", "win32-browser"],
	["elf", "portable-browser"],
	["webassembly", "webassembly-browser"],
	["awtexe", "awtexe-browser"],
	["unknown", "binary-inspector"]
]) {
	const [format, expectedRuntime] = fixture;
	test(`selects ${expectedRuntime} for ${format}`, async () => {
		const selection = await selectExecutableRuntime(
			{ format },
			{
				bytes: new Uint8Array(8),
				nativeCapabilities: DARWIN_NATIVE
			}
		);
		assert.equal(selection.runtime.id, expectedRuntime);
	});
}

test("selects native host for compatible Mach-O bytes", async () => {
	const selection = await selectExecutableRuntime(
		{ format: "mach-o" },
		{
			bytes: new Uint8Array(64),
			nativeCapabilities: DARWIN_NATIVE
		}
	);
	assert.equal(selection.runtime.id, "native-host");
	assert.equal(selection.reason, "native-host-compatible");
});

test("selects native host for a generic application bundle", async () => {
	const selection = await selectExecutableRuntime(
		{ format: "mach-o" },
		{
			bundle: Object.freeze({}),
			bundlePath: "/Applications/Any Product.app",
			nativeCapabilities: DARWIN_NATIVE
		}
	);
	assert.equal(selection.runtime.id, "native-host");
});

test("inspect-only preserves browser emulation", async () => {
	const selection = await selectExecutableRuntime(
		{ format: "mach-o" },
		{
			bytes: new Uint8Array(64),
			inspectOnly: true,
			nativeCapabilities: DARWIN_NATIVE
		}
	);
	assert.equal(selection.runtime.id, "portable-browser");
	assert.equal(selection.reason, "native-disabled-by-caller");
});

test("unavailable native host preserves browser fallback", async () => {
	const selection = await selectExecutableRuntime(
		{ format: "mach-o" },
		{
			bytes: new Uint8Array(64),
			nativeCapabilities: Object.freeze({
				enabled: false,
				nativeFormats: Object.freeze([])
			})
		}
	);
	assert.equal(selection.runtime.id, "portable-browser");
	assert.equal(selection.reason, "native-host-unavailable");
});
