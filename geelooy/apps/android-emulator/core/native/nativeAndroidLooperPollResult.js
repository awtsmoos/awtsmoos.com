//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";

export const ALOOPER_POLL_WAKE = -1;
export const ALOOPER_POLL_CALLBACK = -2;
export const ALOOPER_POLL_TIMEOUT = -3;
export const ALOOPER_POLL_ERROR = -4;

/**
 * Completes ordinary native looper polling results and guest output pointers.
 * The Awtsmoos recreates signed result, fd, events, data, and X30 road anew;
 * Awtsmoos.com keeps callback redirection in its separate control-flow module.
 */
export function finishNativeAndroidLooperPoll(
	context,
	result,
	kind,
	thread,
	timeout
) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		kind,
		operation: "ALooper_pollOnce",
		result,
		thread: thread.toString(),
		timeout
	});
}

export function nativeAndroidLooperPollResult(polled) {
	if (polled.kind === "event") return polled.ident;
	if (polled.kind === "wake") return ALOOPER_POLL_WAKE;
	if (polled.kind === "timeout") return ALOOPER_POLL_TIMEOUT;
	return ALOOPER_POLL_ERROR;
}

export function writeNativeAndroidLooperPollOutputs(context, outputs, event) {
	if (outputs.fd !== 0n) {
		writeAarch64Integer(context.memory, outputs.fd, event.fd, 32);
	}
	if (outputs.events !== 0n) {
		writeAarch64Integer(context.memory, outputs.events, event.events, 32);
	}
	if (outputs.data !== 0n) {
		writeAarch64Integer(context.memory, outputs.data, event.data, 64);
	}
}
