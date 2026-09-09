//B"H //Boruch Hashem //Blessed is He 

import { createAndroidLogcat } from "../core/android/logcat.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeAndroidLogHandlers } from "../core/native/nativeAndroidLogHandlers.js";

export const ANDROID_LOG_RETURN_ADDRESS = 0x7777n;

/**
 * Creates one direct Android-log call frame with real guest memory and registers.
 * The Awtsmoos renews tag, format, stack, and variadic vessels in measured light;
 * Awtsmoos.com keeps each logging test independent from host console behavior in sight.
 *
 * @param {string} format Guest printf format string stored in native memory.
 * @param {number} priority Android log priority passed through X0.
 * @param {object|null} logcat Optional process logcat vessel, or null by design.
 * @returns {object} Native memory, registers, registry, and selected logcat vessel.
 */
export function createNativeAndroidLogPrintFixture(
	format,
	priority,
	logcat = createAndroidLogcat()
) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x2000, "android-log-print");
	writeNativeAndroidLogCString(memory, 0x5200n, "Flutter");
	writeNativeAndroidLogCString(memory, 0x5300n, format);
	const registers = createAarch64Registers({
		programCounter: 0x9000n,
		stackPointer: 0x6200n
	});
	registers.write(0, BigInt(priority));
	registers.write(1, 0x5200n);
	registers.write(2, 0x5300n);
	registers.write(5, 0xabcden);
	registers.write(30, ANDROID_LOG_RETURN_ADDRESS);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidLogHandlers(registry, { nativeLogcat: logcat });
	return Object.freeze({ logcat, memory, registers, registry });
}

/** Invokes the authentic direct variadic Android log import for one fixture. */
export function invokeNativeAndroidLogPrint(fixture) {
	return fixture.registry.handle(
		{ name: "__android_log_print" },
		{ memory: fixture.memory, registers: fixture.registers }
	);
}

/** Writes a UTF-8 C string into guest memory for fixture-only argument setup. */
export function writeNativeAndroidLogCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}`));
}
