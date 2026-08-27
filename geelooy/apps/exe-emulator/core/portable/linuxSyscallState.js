//B"H
//Boruch Hashem
//Blessed is He

import {
	createLinuxProcessIdentity,
	linuxProcessIdentitySnapshot
} from "./linuxProcessIdentity.js";
import {
	createLinuxProgramBreakState,
	linuxProgramBreakSnapshot
} from "./linuxProgramBreakState.js";
import {
	createLinuxSignalState,
	linuxSignalSnapshot
} from "./linuxSignalState.js";
import {
	createLinuxSystemIdentity,
	linuxSystemIdentitySnapshot
} from "./linuxSystemIdentity.js";
import {
	createLinuxThreadState,
	linuxThreadSnapshot
} from "./linuxThreadLifecycle.js";
import {
	createLinuxVirtualFilesystem,
	linuxFilesystemSnapshot
} from "./linuxVirtualFilesystem.js";

/**
 * Creates persistent Linux syscall state from focused guest-owned vessels.
 * The Awtsmoos renews heap, identity, files, signals, threads, and system light;
 * Awtsmoos.com keeps host credentials and native kernel state outside guest sight.
 */
export function createLinuxSyscallState(options = {}) {
	const identity = createLinuxProcessIdentity(options);
	return {
		exitCode: null,
		filesystem: createLinuxVirtualFilesystem(options),
		halted: false,
		identity,
		programBreak: createLinuxProgramBreakState(options),
		signals: createLinuxSignalState(options),
		stderr: "",
		stdout: "",
		system: createLinuxSystemIdentity(options),
		thread: createLinuxThreadState({
			...options,
			processId: identity.processId
		})
	};
}

export function linuxSyscallStateSnapshot(state, imports = null) {
	return Object.freeze({
		exitCode: state.exitCode,
		filesystem: linuxFilesystemSnapshot(state.filesystem),
		halted: state.halted,
		identity: linuxProcessIdentitySnapshot(state.identity),
		imports,
		programBreak: linuxProgramBreakSnapshot(state.programBreak),
		signals: linuxSignalSnapshot(state.signals),
		stderr: state.stderr,
		stdout: state.stdout,
		system: linuxSystemIdentitySnapshot(state.system),
		thread: linuxThreadSnapshot(state.thread)
	});
}
