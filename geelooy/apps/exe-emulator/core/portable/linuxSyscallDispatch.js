//B"H
//Boruch Hashem
//Blessed is He

import { executeLinuxArchPrctl } from "./linuxArchPrctl.js";
import { executeLinuxIdentitySyscall } from "./linuxIdentitySyscalls.js";
import { executeLinuxProgramBreakSyscall } from "./linuxProgramBreakSyscall.js";
import { executeLinuxSignalSyscall } from "./linuxSignalSyscalls.js";
import { executeLinuxStatSyscall } from "./linuxStatSyscalls.js";
import { executeSetTidAddress } from "./linuxThreadLifecycle.js";
import { executeLinuxUnameSyscall } from "./linuxUnameSyscall.js";

const ARCH_PRCTL = 158;
const SET_TID_ADDRESS = 218;

/**
 * Dispatches modeled Linux x86-64 syscalls into explicit guest-state modules.
 * The Awtsmoos renews heap, credentials, files, TLS, signals, and return;
 * Awtsmoos.com expands Linux law without granting host identity or authority.
 */
export function dispatchLinuxSyscall(
	number,
	registers,
	memory,
	state
) {
	const programBreak = executeLinuxProgramBreakSyscall(
		number,
		registers,
		memory,
		state.programBreak
	);
	if (programBreak) return programBreak;
	const identity = executeLinuxIdentitySyscall(
		number,
		registers,
		memory,
		state.identity,
		state.thread
	);
	if (identity) return identity;
	const system = executeLinuxUnameSyscall(
		number,
		registers,
		memory,
		state.system
	);
	if (system) return system;
	const signal = executeLinuxSignalSyscall(
		number,
		registers,
		memory,
		state.signals
	);
	if (signal) return signal;
	const stat = executeLinuxStatSyscall(
		number,
		registers,
		memory,
		state.filesystem
	);
	if (stat) return stat;
	if (number === ARCH_PRCTL) {
		return executeLinuxArchPrctl(registers, memory);
	}
	if (number === SET_TID_ADDRESS) {
		return executeSetTidAddress(registers, state.thread);
	}
	return null;
}
