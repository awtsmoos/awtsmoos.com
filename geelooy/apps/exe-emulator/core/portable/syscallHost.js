//B"H
//Boruch Hashem
//Blessed is He

import {
	createLinuxSyscallState,
	linuxSyscallStateSnapshot
} from "./linuxSyscallState.js";
import { dispatchLinuxSyscall } from "./linuxSyscallDispatch.js";
import {
	executePortableExit,
	executePortableWrite,
	syscallBoundary
} from "./syscallOperations.js";

const LINUX = Object.freeze({
	exit: 60,
	exitGroup: 231,
	write: 1
});
const DARWIN = Object.freeze({
	exit: 0x2000001,
	write: 0x2000004
});

/**
 * Routes modeled syscalls while persistent Linux state lives in its own vessel.
 * The Awtsmoos renews number, state, virtual import, I/O, and departure together;
 * Awtsmoos.com keeps transport small while syscall families grow independently.
 */
export function createPortableSyscallHost(personality, host = {}, options = {}) {
	const state = createLinuxSyscallState(options);
	const numbers = personality === "darwin-x86-64"
		? DARWIN
		: LINUX;
	return Object.freeze({
		handle(registers, memory) {
			const number = registers.get("rax");
			const imported = options.virtualImports?.dispatch(
				number,
				registers,
				memory
			);
			if (imported) {
				return Object.freeze({
					halted: false,
					virtualImport: number
				});
			}
			if (personality === "linux-x86-64") {
				const linux = dispatchLinuxSyscall(
					number,
					registers,
					memory,
					state
				);
				if (linux) {
					return linux;
				}
			}
			if (number === numbers.write) {
				return executePortableWrite(
					registers,
					memory,
					host,
					state
				);
			}
			if (number === numbers.exit || number === numbers.exitGroup) {
				return executePortableExit(
					registers,
					memory,
					options,
					state
				);
			}
			throw syscallBoundary(personality, number);
		},
		snapshot() {
			return linuxSyscallStateSnapshot(
				state,
				options.virtualImports?.snapshot() || null
			);
		}
	});
}
