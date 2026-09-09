//B"H
//Boruch Hashem
//Blessed be He

import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativeAndroidPlatformLooperPump } from "../core/native/nativeAndroidPlatformLooperPump.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { CLOCK_MONOTONIC } from "../core/native/nativeLinuxClock.js";
import { createNativeTimerFdSpec } from "../core/native/nativeTimerFdSpec.js";
import { createNativeTimerFdState } from "../core/native/nativeTimerFdState.js";
import { registerNativeTimerFdHandlers } from "../core/native/registerNativeTimerFdHandlers.js";
import {
	branchPumpLink,
	movePumpImmediate,
	movePumpRegister,
	PUMP_RETURN_INSTRUCTION,
	writePumpWords
} from "./nativeAndroidPlatformLooperPumpCode.mjs";
import { createPlatformPumpMachineState } from "./nativeAndroidPlatformLooperPumpMachine.mjs";
import { createPlatformPumpMemory } from "./nativeAndroidPlatformLooperPumpMemory.mjs";

export const PLATFORM_CALLBACK = 0x1000n;
export const PLATFORM_BUFFER = 0x1800n;
export const PLATFORM_STACK = 0x3ff0n;
export const PLATFORM_THREAD = 0x6fffe0000000n;

/**
 * Builds authentic callback code, timerfd state, ALooper state, and native imports.
 * Guest time stays deterministic while production callback/read paths remain intact.
 */
export function createPlatformTimerPumpFixture(options = {}) {
	let now = 1000n;
	const callbackReturn = Number(options.callbackReturn ?? 1);
	const clock = Object.freeze({
		now() {
			return now;
		},
		supports(clockId) {
			return clockId === CLOCK_MONOTONIC;
		}
	});
	const memory = createPlatformPumpMemory();
	const imports = createNativeImportAddressSpace({ base: 0x5000n });
	const hostImports = createNativeHostImportRegistry();
	const timers = createNativeTimerFdState({ clock });
	const descriptor = timers.create(CLOCK_MONOTONIC, 0).descriptor;
	registerNativeTimerFdHandlers(hostImports, {
		clock,
		state: timers
	});
	const readAddress = imports.resolve("read");
	writePumpWords(memory, PLATFORM_CALLBACK, [
		movePumpRegister(19, 30),
		movePumpRegister(1, 2),
		movePumpImmediate(2, 8),
		branchPumpLink(PLATFORM_CALLBACK + 12n, readAddress),
		movePumpRegister(30, 19),
		movePumpImmediate(0, callbackReturn),
		PUMP_RETURN_INSTRUCTION
	]);
	const loopers = createNativeAndroidLooperState({
		descriptorEvents: fd => timers.events(fd)
	});
	const handle = loopers.prepare(PLATFORM_THREAD);
	loopers.addFd(handle, {
		callback: PLATFORM_CALLBACK,
		data: PLATFORM_BUFFER,
		events: 1,
		fd: descriptor,
		ident: -2
	});
	const machineState = createPlatformPumpMachineState({
		imports,
		memory,
		stack: PLATFORM_STACK,
		thread: PLATFORM_THREAD
	});
	const pump = createNativeAndroidPlatformLooperPump({
		machineState,
		registry: hostImports,
		state: loopers
	});
	return Object.freeze({
		arm(interval, value) {
			timers.settime(
				descriptor,
				0,
				createNativeTimerFdSpec(interval, value)
			);
		},
		descriptor,
		handle,
		loopers,
		memory,
		pump,
		readExpirationCount() {
			return readAarch64Integer(memory, PLATFORM_BUFFER, 64);
		},
		setNow(value) {
			now = BigInt(value);
		},
		timers
	});
}
