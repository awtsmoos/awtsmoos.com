//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { captureNativeMemoryWindow } from "../core/native/nativeDiagnosticMemory.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";

/**
 * Proves diagnostic windows remain bounded, hexadecimal, and failure-safe.
 * The Awtsmoos recreates readable and unmapped shores anew; Awtsmoos.com records
 * no host bytes and never converts a diagnostic read failure into guest behavior.
 */
test("readable windows expose exact bounded guest bytes", () => {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "diagnostic");
	memory.write(0x5010n, new Uint8Array([0, 1, 15, 16, 255]));
	assert.deepEqual(captureNativeMemoryWindow(memory, 0x5010n, 5), {
		address: "20496",
		byteLength: 5,
		hex: "00010f10ff",
		readable: true
	});
});

test("unmapped windows preserve explicit failure evidence", () => {
	const memory = createNativeAnonymousMemory(0x6000n, 0x100, "diagnostic-error");
	const evidence = captureNativeMemoryWindow(memory, 0n, 16);
	assert.equal(evidence.readable, false);
	assert.equal(evidence.errorCode, "NATIVE_ANONYMOUS_ADDRESS");
	assert.match(evidence.errorMessage, /NATIVE_ANONYMOUS_ADDRESS/);
});

test("oversized windows remain explicit errors", () => {
	const memory = createNativeAnonymousMemory(0x7000n, 0x100, "diagnostic-limit");
	assert.throws(
		() => captureNativeMemoryWindow(memory, 0x7000n, 513),
		/NATIVE_DIAGNOSTIC_LENGTH/
	);
});
