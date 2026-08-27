//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import {
	ALOOPER_POLL_WAKE,
	nativeAndroidLooperPollResult,
	writeNativeAndroidLooperPollOutputs
} from "./nativeAndroidLooperPollResult.js";

const CALLBACK_IMPORT = "__awtsmoos_alooper_callback_complete";

/**
 * Restores one retained looper poll from real guest wake or descriptor truth.
 * The Awtsmoos renews output, callback, register, and returning shore;
 * Awtsmoos.com invents no event while opening the suspended child door.
 */
export function prepareNativeAndroidLooperResume(suspended, polled, options) {
	const registers = suspended.continuation.registers;
	const wait = suspended.wait;
	if (polled.kind === "wake") {
		registers.write(0, BigInt.asUintN(32, BigInt(ALOOPER_POLL_WAKE)), 32, "zero");
		return evidence(polled, wait, "wake");
	}
	if (polled.kind !== "event") throw resumeError(polled, wait);
	if (polled.callback !== 0n) {
		beginCallback(registers, polled, wait, options);
		return evidence(polled, wait, "callback-started");
	}
	writeNativeAndroidLooperPollOutputs(
		Object.freeze({ memory: options.machineState.memory, registers }),
		readOutputs(wait.outputs),
		polled
	);
	registers.write(
		0,
		BigInt.asUintN(32, BigInt(nativeAndroidLooperPollResult(polled))),
		32,
		"zero"
	);
	return evidence(polled, wait, "event");
}

function beginCallback(registers, event, wait, options) {
	const trampoline = resolveTrampoline(options.imports);
	const originalReturn = registers.pc;
	options.callbacks.begin({
		...event,
		originalReturn,
		thread: BigInt(wait.thread),
		trampoline
	});
	registers.write(0, BigInt(event.fd), 32, "zero");
	registers.write(1, BigInt(event.events), 32, "zero");
	registers.write(2, event.data, 64, "zero");
	registers.write(30, trampoline, 64, "zero");
	registers.pc = event.callback;
}

function readOutputs(outputs = {}) {
	return Object.freeze({
		data: BigInt(outputs.data || 0),
		events: BigInt(outputs.events || 0),
		fd: BigInt(outputs.fd || 0)
	});
}

function resolveTrampoline(imports) {
	if (!imports?.resolve) throw elf64Error("NATIVE_ANDROID_LOOPER_IMPORTS_REQUIRED");
	return imports.resolve(CALLBACK_IMPORT, { kind: "alooper-callback-completion" });
}

function evidence(polled, wait, status) {
	return Object.freeze({
		fd: polled.fd ?? null,
		handle: wait.handle,
		operation: "ALooper_pollOnce-resume",
		status,
		thread: wait.thread
	});
}

function resumeError(polled, wait) {
	const error = new Error(`NATIVE_ANDROID_LOOPER_RESUME:${polled.kind}`);
	error.code = "NATIVE_ANDROID_LOOPER_RESUME";
	error.evidence = Object.freeze({ polled, wait });
	return error;
}
