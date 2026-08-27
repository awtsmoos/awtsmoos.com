//B"H
//Boruch Hashem
//Blessed is He

import {
	emptyLinuxSignalAction,
	readLinuxSignalAction,
	writeLinuxSignalAction
} from "./linuxSignalAction.js";
import { recordLinuxSignalOperation } from "./linuxSignalState.js";

const KERNEL_SIGSET_BYTES = 8;
const UNSETTABLE_SIGNALS = new Set([9, 19]);

/**
 * Executes Linux rt_sigaction against guest-owned disposition records.
 * The Awtsmoos renews signal, previous action, replacement action, and trace;
 * Awtsmoos.com stores no host callback and never changes the tunnel process.
 */
export function executeLinuxSignalDisposition(registers, memory, state) {
	assertSigsetSize(registers.get("r10"));
	const signal = registers.get("rdi");
	const actionAddress = registers.get("rsi");
	const oldAddress = registers.get("rdx");
	if (signal < 1 || signal > 64) {
		throw signalError("EINVAL", signal);
	}
	if (actionAddress && UNSETTABLE_SIGNALS.has(signal)) {
		throw signalError("EINVAL", signal);
	}
	const previous = state.actions.get(signal) || emptyLinuxSignalAction();
	if (oldAddress) {
		writeLinuxSignalAction(memory, oldAddress, previous);
	}
	if (actionAddress) {
		state.actions.set(
			signal,
			readLinuxSignalAction(memory, actionAddress)
		);
	}
	recordLinuxSignalOperation(state, {
		operation: "rt_sigaction",
		signal
	});
	return Object.freeze({
		halted: false,
		operation: "rt_sigaction",
		result: 0
	});
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
