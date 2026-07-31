//B"H
//Boruch Hashem
//Blessed is He

import { createNativeLinuxPriorityState } from "./nativeLinuxPriorityState.js";

const EINVAL = 22;
const SYS_GETTID_AARCH64 = 178;

/**
 * Registers deterministic Linux process, thread, syscall, and priority roads.
 * The Awtsmoos renews PID, TID, guest urgency, and return shore every instant;
 * Awtsmoos.com invokes no host syscall and changes no host scheduler state.
 */
export function registerNativeLinuxSyscallHandlers(
	registry,
	threadIds,
	errnoState = null,
	priorityState = createNativeLinuxPriorityState()
) {
	registry.register("getpid", context => finishIdentity(
		context,
		"getpid",
		threadIds.processId()
	));
	registry.register("getppid", context => finishIdentity(
		context,
		"getppid",
		threadIds.parentProcessId()
	));
	registry.register("gettid", context => finishThreadIdentity(context, threadIds));
	registry.register("syscall", context => handleNativeLinuxSyscall(context, threadIds));
	registry.register("setpriority", context => {
		return handleNativeSetpriority(context, threadIds, errnoState, priorityState);
	});
}

function handleNativeLinuxSyscall(context, threadIds) {
	const number = signedInt32(context.registers.read(0, 32, "zero"));
	if (number === SYS_GETTID_AARCH64) {
		return finishThreadIdentity(context, threadIds, number);
	}
	const error = new Error(`NATIVE_LINUX_SYSCALL:${number}`);
	error.code = "NATIVE_LINUX_SYSCALL_UNSUPPORTED";
	error.syscallNumber = number;
	throw error;
}

function finishThreadIdentity(context, threadIds, syscallNumber = null) {
	const pointer = readThreadPointer(context);
	const tid = threadIds.resolve(pointer);
	return finishIdentity(context, syscallNumber === null ? "gettid" : "syscall", tid, {
		syscall: syscallNumber === null ? null : "gettid",
		syscallNumber,
		threadPointer: pointer.toString()
	});
}

function finishIdentity(context, operation, result, detail = {}) {
	context.registers.write(0, result, 32, "zero");
	resume(context);
	return Object.freeze({
		...detail,
		operation,
		result
	});
}

function handleNativeSetpriority(context, threadIds, errnoState, priorityState) {
	const registers = context.registers;
	const which = signedInt32(registers.read(0, 32, "zero"));
	const who = Number(registers.read(1, 32, "zero"));
	const requested = signedInt32(registers.read(2, 32, "zero"));
	const pointer = readThreadPointer(context);
	const currentTid = threadIds.resolve(pointer);
	const result = priorityState.set({ currentTid, requested, which, who });
	if (!result.ok) setErrno(context, errnoState, EINVAL);
	const code = result.ok ? 0 : -1;
	registers.write(0, BigInt.asUintN(32, BigInt(code)), 32, "zero");
	resume(context);
	return Object.freeze({
		applied: result.record?.applied,
		currentTid,
		errno: result.ok ? 0 : EINVAL,
		operation: "setpriority",
		requested,
		result: code,
		which,
		who: result.record?.who ?? who
	});
}

function setErrno(context, errnoState, value) {
	if (!errnoState) return;
	errnoState.set(readThreadPointer(context), value);
}

function readThreadPointer(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function resume(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function signedInt32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
