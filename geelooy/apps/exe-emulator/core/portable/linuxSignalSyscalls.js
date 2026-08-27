//B"H
//Boruch Hashem
//Blessed is He

import { executeLinuxSignalDisposition } from "./linuxSignalDisposition.js";
import { executeLinuxSignalMask } from "./linuxSignalMask.js";
import { recordLinuxSignalOperation } from "./linuxSignalState.js";

const RT_SIGACTION = 13;
const RT_SIGPROCMASK = 14;
const ERRNO = Object.freeze({
	EFAULT: -14n,
	EINVAL: -22n
});

/**
 * Routes Linux signal syscalls into disposition and mask engines.
 * The Awtsmoos renews syscall number, guest state, errno, and return together;
 * Awtsmoos.com keeps host signals untouched while preserving Linux ABI evidence.
 */
export function executeLinuxSignalSyscall(
	number,
	registers,
	memory,
	state
) {
	const operation = operationName(number);
	if (!operation) {
		return null;
	}
	try {
		const result = number === RT_SIGACTION
			? executeLinuxSignalDisposition(registers, memory, state)
			: executeLinuxSignalMask(registers, memory, state);
		registers.setBigInt("rax", 0n);
		return result;
	} catch (error) {
		const code = ERRNO[error.code] ? error.code : "EFAULT";
		registers.setBigInt("rax", ERRNO[code]);
		recordLinuxSignalOperation(state, {
			error: code,
			operation
		});
		return Object.freeze({
			error: code,
			halted: false,
			operation,
			result: Number(ERRNO[code])
		});
	}
}

function operationName(number) {
	return {
		[RT_SIGACTION]: "rt_sigaction",
		[RT_SIGPROCMASK]: "rt_sigprocmask"
	}[number] || null;
}
