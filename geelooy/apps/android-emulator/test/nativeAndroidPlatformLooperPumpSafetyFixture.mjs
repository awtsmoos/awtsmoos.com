//B"H
//Boruch Hashem
//Blessed be He

import { createNativeAndroidPlatformLooperPump } from "../core/native/nativeAndroidPlatformLooperPump.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import {
	branchPumpLink,
	movePumpImmediate,
	movePumpRegister,
	PUMP_RETURN_INSTRUCTION,
	writePumpWords
} from "./nativeAndroidPlatformLooperPumpCode.mjs";
import { createPlatformPumpMachineState } from "./nativeAndroidPlatformLooperPumpMachine.mjs";
import { createPlatformPumpMemory } from "./nativeAndroidPlatformLooperPumpMemory.mjs";

const CALLBACK = 0x1000n;
const STACK = 0x3ff0n;
const THREAD = 0x6fffe0000000n;
const DESCRIPTOR = 77;

/**
 * Builds a continuously-ready callback fixture for pump safety properties.
 * The callback is genuine AArch64; only descriptor readiness is deterministic.
 */
export function createPlatformPumpSafetyFixture(options = {}) {
	const memory = createPlatformPumpMemory();
	const imports = createNativeImportAddressSpace({ base: 0x5000n });
	const registry = createNativeHostImportRegistry();
	const state = createReadyState(options.callbackAddress ?? CALLBACK);
	let nestedDrain = null;
	let pump = null;
	if (options.reentrant) {
		const reenterAddress = imports.resolve("platform_reenter");
		writePumpWords(memory, CALLBACK, [
			movePumpRegister(19, 30),
			branchPumpLink(CALLBACK + 4n, reenterAddress),
			movePumpRegister(30, 19),
			movePumpImmediate(0, 1),
			PUMP_RETURN_INSTRUCTION
		]);
		registry.register("platform_reenter", context => {
			nestedDrain = pump.drain();
			context.registers.pc = context.registers.read(30, 64, "zero");
			return Object.freeze({ operation: "platform_reenter" });
		});
	} else {
		writePumpWords(memory, CALLBACK, [
			movePumpImmediate(0, 1),
			PUMP_RETURN_INSTRUCTION
		]);
	}
	const machineState = createPlatformPumpMachineState({
		imports,
		memory,
		stack: STACK,
		thread: THREAD
	});
	pump = createNativeAndroidPlatformLooperPump({
		machineState,
		registry,
		state
	});
	return Object.freeze({
		nestedDrain() {
			return nestedDrain;
		},
		pump,
		state
	});
}

/** Creates one level-triggered descriptor state with explicit poll telemetry. */
function createReadyState(callbackAddress) {
	let polls = 0;
	let removals = 0;
	return Object.freeze({
		pollCallback(thread, excludedFds) {
			polls += 1;
			if (excludedFds?.has(DESCRIPTOR)) {
				return Object.freeze({ kind: "timeout" });
			}
			return Object.freeze({
				callback: BigInt(callbackAddress),
				data: 0n,
				events: 1,
				fd: DESCRIPTOR,
				handle: 0x7000n,
				ident: -2,
				kind: "event",
				thread
			});
		},
		removeFd() {
			removals += 1;
			return true;
		},
		snapshot() {
			return Object.freeze({
				polls,
				removals
			});
		}
	});
}
