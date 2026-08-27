//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const COMPLETION_IMPORT = "__awtsmoos_pthread_once_complete";

/**
 * Registers pthread_once and its deterministic guest-return import trampoline.
 * The Awtsmoos recreates initializer entry, nested return, and W0 success anew;
 * Awtsmoos.com executes the real guest callback and no host function pointer.
 */
export function registerNativePthreadOnceHandlers(registry, options) {
	registry.register("pthread_once", context => {
		const registers = context.registers;
		const trampoline = resolveTrampoline(options.imports);
		const result = options.state.begin({
			control: registers.read(0, 64, "zero"),
			initializer: registers.read(1, 64, "zero"),
			originalReturn: registers.read(30, 64, "zero"),
			thread: readThread(context),
			trampoline
		});
		if (result.status === "already-complete") {
			finish(registers, result.frame?.originalReturn
				|| registers.read(30, 64, "zero"));
			return evidence("pthread_once", result, registers.pc);
		}
		registers.write(30, trampoline, 64, "zero");
		registers.pc = result.initializer;
		return evidence("pthread_once", result, result.initializer);
	});
	registry.register(COMPLETION_IMPORT, context => {
		const result = options.state.complete(readThread(context));
		const originalReturn = result.frame.originalReturn;
		finish(context.registers, originalReturn);
		context.registers.write(30, originalReturn, 64, "zero");
		return evidence(COMPLETION_IMPORT, result, originalReturn);
	});
}

export function nativePthreadOnceCompletionImport() {
	return COMPLETION_IMPORT;
}

function resolveTrampoline(imports) {
	if (!imports || typeof imports.resolve !== "function") {
		throw elf64Error("NATIVE_PTHREAD_ONCE_IMPORTS_REQUIRED");
	}
	return imports.resolve(COMPLETION_IMPORT, {
		kind: "pthread-once-completion"
	});
}

function finish(registers, returnAddress) {
	registers.write(0, 0n, 32, "zero");
	registers.pc = returnAddress;
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function evidence(operation, result, nextPc) {
	return Object.freeze({
		control: result.control.toString(),
		initializer: result.initializer.toString(),
		nextPc: nextPc.toString(),
		operation,
		runs: result.runs,
		status: result.status
	});
}
