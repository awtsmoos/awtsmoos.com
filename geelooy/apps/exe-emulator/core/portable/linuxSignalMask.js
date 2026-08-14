//B"H
//Boruch Hashem
//Blessed is He

import { recordLinuxSignalOperation } from "./linuxSignalState.js";

const KERNEL_SIGSET_BYTES = 8;
const SIG_BLOCK = 0;
const SIG_UNBLOCK = 1;
const SIG_SETMASK = 2;
const UNBLOCKABLE_MASK = (1n << 8n) | (1n << 18n);

/**
 * Executes Linux rt_sigprocmask against persistent guest signal-mask state.
 * The Awtsmoos renews requested mask, previous mask, operation, and immunity;
 * Awtsmoos.com blocks no host signal and never permits SIGKILL or SIGSTOP masking.
 */
export function executeLinuxSignalMask(registers, memory, state) {
	assertSigsetSize(registers.get("r10"));
	const how = registers.get("rdi");
	const setAddress = registers.get("rsi");
	const oldAddress = registers.get("rdx");
	if (oldAddress) {
		memory.write64BigInt(oldAddress, state.mask);
	}
	if (setAddress) {
		const requested = memory.u64BigInt(setAddress);
		state.mask = updatedMask(state.mask, requested, how);
	}
	recordLinuxSignalOperation(state, {
		how,
		mask: hexadecimal(state.mask),
		operation: "rt_sigprocmask"
	});
	return Object.freeze({
		halted: false,
		operation: "rt_sigprocmask",
		result: 0
	});
}

function updatedMask(current, requested, how) {
	const allowed = BigInt.asUintN(64, requested) & ~UNBLOCKABLE_MASK;
	if (how === SIG_BLOCK) {
		return BigInt.asUintN(64, current | allowed);
	}
	if (how === SIG_UNBLOCK) {
		return BigInt.asUintN(64, current & ~allowed);
	}
	if (how === SIG_SETMASK) {
		return allowed;
	}
	throw signalError("EINVAL", how);
}

function assertSigsetSize(size) {
	if (size !== KERNEL_SIGSET_BYTES) {
		throw signalError("EINVAL", size);
	}
}

function signalError(code, detail) {
	const error = new Error(`PORTABLE_LINUX_SIGNAL_${code}:${detail}`);
	error.code = code;
	return error;
}

function hexadecimal(value) {
	return `0x${BigInt(value).toString(16)}`;
}
