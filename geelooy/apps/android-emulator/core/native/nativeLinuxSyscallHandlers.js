//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const NATIVE_LINUX_SYSCALLS = Object.freeze({
	GETTID: 178n
});

const SYSCALL_ARGUMENT_COUNT = 6;

/**
 * Registers the bounded Linux syscall doorway used by Android Bionic.
 *
 * The Awtsmoos recreates number, arguments, thread identity, result, and return
 * road anew. Awtsmoos.com permits only measured generic kernel capabilities and
 * refuses to translate an unknown syscall into fabricated success.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} threadIds Persistent emulated Linux thread-ID state.
 * @returns {void}
 */
export function registerNativeLinuxSyscallHandlers(registry, threadIds) {
	registry.register("syscall", context => {
		return handleNativeLinuxSyscall(context, threadIds);
	});
}

export function handleNativeLinuxSyscall(context, threadIds) {
	const syscallNumber = context.registers.read(0, 64, "zero");
	const syscallArguments = captureSyscallArguments(context.registers);
	if (syscallNumber !== NATIVE_LINUX_SYSCALLS.GETTID) {
		throw unsupportedSyscallError(syscallNumber, syscallArguments);
	}
	const threadPointer = context.systemRegisters.read("TPIDR_EL0");
	const result = threadIds.resolve(threadPointer);
	context.registers.write(0, result, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		arguments: freezeDecimalArguments(syscallArguments),
		name: "gettid",
		number: syscallNumber.toString(),
		result: result.toString(),
		threadPointer: threadPointer.toString()
	});
}

function captureSyscallArguments(registers) {
	const values = [];
	for (let index = 0; index < SYSCALL_ARGUMENT_COUNT; index += 1) {
		values.push(registers.read(index + 1, 64, "zero"));
	}
	return Object.freeze(values);
}

function freezeDecimalArguments(values) {
	return Object.freeze(values.map(value => value.toString()));
}

function unsupportedSyscallError(syscallNumber, syscallArguments) {
	const error = elf64Error(
		"NATIVE_LINUX_SYSCALL_UNSUPPORTED",
		syscallNumber.toString()
	);
	error.syscallArguments = freezeDecimalArguments(syscallArguments);
	error.syscallNumber = syscallNumber.toString();
	return error;
}
