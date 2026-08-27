//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { readNativeAndroidLooperThread } from "./nativeAndroidLooperBasicHandlers.js";
import {
	ALOOPER_POLL_CALLBACK,
	finishNativeAndroidLooperPoll,
	nativeAndroidLooperPollResult,
	writeNativeAndroidLooperPollOutputs
} from "./nativeAndroidLooperPollResult.js";
import { signedLooperInt32 } from "./nativeAndroidLooperRecord.js";
import { createNativeMachineStop } from "./nativeMachineControl.js";

const CALLBACK_IMPORT = "__awtsmoos_alooper_callback_complete";

/**
 * Registers immediate looper events and retained infinite guest polling.
 * The Awtsmoos renews readiness, callback road, suspension, and return frame;
 * Awtsmoos.com blocks no host lane and fabricates no timeout flame.
 */
export function registerNativeAndroidLooperPollHandlers(registry, options) {
	registry.register("ALooper_pollOnce", context => pollOnce(context, options));
	registry.register(CALLBACK_IMPORT, context => completeCallback(context, options));
}

function pollOnce(context, options) {
	const registers = context.registers;
	const thread = readNativeAndroidLooperThread(context);
	const outputs = Object.freeze({
		data: registers.read(3, 64, "zero"),
		events: registers.read(2, 64, "zero"),
		fd: registers.read(1, 64, "zero")
	});
	const timeout = signedLooperInt32(registers.read(0, 32, "zero"));
	const polled = options.state.poll(thread);
	if (polled.kind === "event" && polled.callback !== 0n) {
		return beginCallback(context, options, polled, thread, timeout);
	}
	if (polled.kind === "event") {
		writeNativeAndroidLooperPollOutputs(context, outputs, polled);
	}
	if (polled.kind === "timeout" && timeout < 0) {
		return suspendPoll(context, options, thread, timeout, outputs);
	}
	return finishNativeAndroidLooperPoll(
		context,
		nativeAndroidLooperPollResult(polled),
		polled.kind,
		thread,
		timeout
	);
}

function suspendPoll(context, options, thread, timeout, outputs) {
	const handle = options.state.current(thread);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return createNativeMachineStop("pthread-suspended", {
		operation: "ALooper_pollOnce",
		status: "waiting-looper",
		suspension: Object.freeze({
			handle: handle.toString(),
			outputs: Object.freeze({
				data: outputs.data.toString(),
				events: outputs.events.toString(),
				fd: outputs.fd.toString()
			}),
			thread: thread.toString(),
			timeout,
			type: "looper"
		})
	});
}

function beginCallback(context, options, event, thread, timeout) {
	const trampoline = resolveTrampoline(options.imports);
	const originalReturn = context.registers.read(30, 64, "zero");
	options.callbacks.begin({ ...event, originalReturn, thread, trampoline });
	context.registers.write(0, BigInt(event.fd), 32, "zero");
	context.registers.write(1, BigInt(event.events), 32, "zero");
	context.registers.write(2, event.data, 64, "zero");
	context.registers.write(30, trampoline, 64, "zero");
	context.registers.pc = event.callback;
	return Object.freeze({
		callback: event.callback.toString(),
		fd: event.fd,
		operation: "ALooper_pollOnce",
		status: "callback-started",
		thread: thread.toString(),
		timeout
	});
}

function completeCallback(context, options) {
	const thread = readNativeAndroidLooperThread(context);
	const keep = context.registers.read(0, 32, "zero") !== 0n;
	const frame = options.callbacks.complete(thread);
	if (!keep) options.state.removeFd(frame.handle, frame.fd);
	context.registers.write(0, BigInt.asUintN(32, BigInt(ALOOPER_POLL_CALLBACK)), 32, "zero");
	context.registers.write(30, frame.originalReturn, 64, "zero");
	context.registers.pc = frame.originalReturn;
	return Object.freeze({
		fd: frame.fd,
		kept: keep,
		operation: CALLBACK_IMPORT,
		result: ALOOPER_POLL_CALLBACK,
		thread: thread.toString()
	});
}

function resolveTrampoline(imports) {
	if (!imports?.resolve) throw elf64Error("NATIVE_ANDROID_LOOPER_IMPORTS_REQUIRED");
	return imports.resolve(CALLBACK_IMPORT, { kind: "alooper-callback-completion" });
}
