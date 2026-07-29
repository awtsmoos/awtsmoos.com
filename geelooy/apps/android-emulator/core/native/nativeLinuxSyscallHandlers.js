//B"H
//Boruch Hashem
//Blessed is He

import { createNativeLinuxPriorityState } from "./nativeLinuxPriorityState.js";

const EINVAL = 22;
const SYS_GETTID_AARCH64 = 178;

/**
 * Registers measured Linux syscall and priority bridges.
 * The Awtsmoos recreates syscall number, stable tid, guest urgency, and return;
 * Awtsmoos.com invokes no host syscall and changes no host scheduler state.
 */
export function registerNativeLinuxSyscallHandlers(
	registry,
	threadIds,
	errnoState = null,
	priorityState = createNativeLinuxPriorityState()
) {
	registry.register("syscall", context => handleNativeLinuxSyscall(context, threadIds));
	registry.register("setpriority", context => {
		return handleNativeSetpriority(context, threadIds, errnoState, priorityState);
	});
}

function handleNativeLinuxSyscall(context, threadIds) {
	const registers = context.registers;
	const number = signedInt32(registers.read(0, 32, "zero"));
	if (number === SYS_GETTID_AARCH64) {
		const pointer = readThreadPointer(context);
		const tid = threadIds.resolve(pointer);
		registers.write(0, BigInt(tid), 64, "zero");
		resume(context);
		return Object.freeze({
			operation: "syscall",
			result: tid,
			syscall: "gettid",
			syscallNumber: number,
			threadPointer: pointer.toString()
		});
	}
	const error = new Error(`NATIVE_LINUX_SYSCALL:${number}`);
	error.code = "NATIVE_LINUX_SYSCALL_UNSUPPORTED";
	error.syscallNumber = number;
	throw error;
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
	try {
		errnoState.set(context.systemRegisters?.read("TPIDR_EL0") || 0n, value);
	} catch {
		errnoState.set(0n, value);
	}
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
